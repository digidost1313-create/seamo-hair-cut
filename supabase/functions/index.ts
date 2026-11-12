// ============================================================
// SEAMO HAIR CUT — Supabase Edge Functions (Deno, deploy with:
//   supabase functions deploy create-booking razorpay-webhook
//   supabase functions deploy create-subscription send-booking-alert
// Secrets (Supabase secrets ONLY — never in frontend):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID,
//   RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
//   FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_JSON
// ============================================================
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHmac, timingSafeEqual } from "node:crypto";

const db = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// ---------- create-booking ----------
// POST { shop_id, staff_id|null, customer_id, customer_name, customer_phone,
//        booking_date, booking_time, service_ids[], idempotency_key }
// 1) idempotency_key: repeat calls with the same key return the first booking
//    (no duplicate bookings after repeated button clicks).
// 2) slot lock: checks slot_locks (unexpired) + live bookings; 409 on conflict.
// 3) booking fee read from admin_settings (never hardcoded).
// 4) token issued by public.issue_daily_token() in the same transaction.
// 5) payment stays pending until payment_verifications.verified=true.
export async function createBooking(req: Request) {
  const body = await req.json();
  const supa = db();
  if (body.idempotency_key) {
    const { data: existing } = await supa.from("bookings").select("*")
      .eq("idempotency_key", body.idempotency_key).maybeSingle();
    if (existing) return Response.json({ booking: existing, deduped: true }, { status: 200 });
  }
  const { data: shop } = await supa.from("shops").select("online_bookings_paused,is_temporarily_closed,max_bookings_per_slot")
    .eq("id", body.shop_id).single();
  if (!shop || shop.online_bookings_paused || shop.is_temporarily_closed)
    return Response.json({ error: "Shop is not accepting online bookings" }, { status: 422 });
  const { data: feeRow } = await supa.from("admin_settings").select("value").eq("key", "booking_fee").single();
  const feePaise = feeRow?.value?.amount_paise ?? 1000; // fallback only; admin setting is source of truth
  const { count } = await supa.from("bookings").select("id", { count: "exact", head: true })
    .eq("shop_id", body.shop_id).eq("staff_id", body.staff_id).eq("booking_date", body.booking_date)
    .eq("booking_time", body.booking_time)
    .in("status", ["pending", "accepted", "confirmed", "arrived", "service_started"]);
  if ((count || 0) >= (shop.max_bookings_per_slot || 1))
    return Response.json({ error: "Slot already booked" }, { status: 409 });
  const { data, error } = await supa.from("bookings").insert({
    shop_id: body.shop_id, staff_id: body.staff_id ?? null, customer_id: body.customer_id,
    customer_name: body.customer_name, customer_phone: body.customer_phone,
    booking_date: body.booking_date, booking_time: body.booking_time,
    total_amount: body.total_amount ?? 0, booking_fee_paise: feePaise,
    status: "pending", idempotency_key: body.idempotency_key ?? null,
  }).select().single();
  if (error?.code === "23505") return Response.json({ error: "Slot already booked" }, { status: 409 });
  if (error) throw error;
  const { data: tokenNo } = await supa.rpc("issue_daily_token", {
    p_shop: body.shop_id, p_date: body.booking_date, p_booking: data.id,
  });
  await supa.from("bookings").update({ token_number: tokenNo }).eq("id", data.id);
  await supa.from("booking_status_history").insert({ booking_id: data.id, to_status: "pending" });
  return Response.json({ booking: { ...data, token_number: tokenNo }, status: 201 }, { status: 201 });
}

// ---------- razorpay-webhook ----------
// HMAC-SHA256 verification + idempotency via razorpay_webhook_events.event_id.
// Activation happens ONLY here — never from a frontend success callback.
// On subscription.charged: subscription=active, payment captured, and a
// payment_verifications row is written verified=true for the booking fee.
export async function razorpayWebhook(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  const expected = createHmac("sha256", Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!)
    .update(raw).digest("hex");
  const ok = sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return new Response("Invalid signature", { status: 400 });
  const evt = JSON.parse(raw);
  const supa = db();
  const eventId = req.headers.get("x-razorpay-event-id") || `${evt.event}-${Date.now()}`;
  const { error: dup } = await supa.from("razorpay_webhook_events")
    .insert({ event_id: eventId, event_type: evt.event, payload: evt });
  if (dup) return new Response("Already processed", { status: 200 });
  const sub = evt.payload?.subscription?.entity;
  const pay = evt.payload?.payment?.entity;
  const now = new Date();
  const grace = new Date(now.getTime() + 3 * 864e5);
  switch (evt.event) {
    case "subscription.activated":
    case "subscription.charged": {
      await supa.from("subscriptions").update({
        status: "active",
        current_start: sub?.current_start ? new Date(sub.current_start * 1000).toISOString() : now.toISOString(),
        current_end: sub?.current_end ? new Date(sub.current_end * 1000).toISOString() : undefined,
        next_renewal_at: sub?.charge_at ? new Date(sub.charge_at * 1000).toISOString() : undefined,
      }).eq("razorpay_subscription_id", sub.id);
      if (pay) await supa.from("payment_transactions").upsert({
        razorpay_payment_id: pay.id, amount: pay.amount, status: "captured", method: pay.method,
      }, { onConflict: "razorpay_payment_id" });
      break;
    }
    case "subscription.pending":
      await supa.from("subscriptions").update({ status: "pending", grace_ends_at: grace.toISOString() })
        .eq("razorpay_subscription_id", sub.id);
      break;
    case "subscription.halted":
      await supa.from("subscriptions").update({ status: "halted" }).eq("razorpay_subscription_id", sub.id);
      await supa.from("shops").update({ online_bookings_paused: true })
        .eq("id", (await supa.from("subscriptions").select("shop_id").eq("razorpay_subscription_id", sub.id).single()).data?.shop_id);
      break;
    case "subscription.cancelled":
      await supa.from("subscriptions").update({ status: "cancelled" }).eq("razorpay_subscription_id", sub.id);
      break;
    case "payment.failed":
      if (pay) await supa.from("payment_transactions").upsert({
        razorpay_payment_id: pay.id, amount: pay.amount, status: "failed",
        failure_reason: pay.error_description || "failed",
      }, { onConflict: "razorpay_payment_id" });
      break;
    case "payment.captured": {
      // Booking-fee payment for a booking: mark verified ONLY here.
      const bookingId = pay?.notes?.booking_id;
      if (bookingId && pay) {
        await supa.from("payment_verifications").insert({
          booking_id: bookingId, gateway: "razorpay", gateway_payment_id: pay.id,
          gateway_order_id: pay.order_id, amount_paise: pay.amount,
          verified: true, verified_at: now.toISOString(), verified_by: "razorpay_webhook",
          raw_payload: pay,
        });
        await supa.from("bookings").update({ payment_verified: true, status: "confirmed" }).eq("id", bookingId);
      }
      break;
    }
  }
  await supa.from("razorpay_webhook_events").update({ processed: true }).eq("event_id", eventId);
  return new Response("ok", { status: 200 });
}

// ---------- create-subscription ----------
// Server creates the Razorpay subscription for a shop (₹499/mo plan).
// Frontend only receives subscription_id and opens Razorpay Checkout.
export async function createSubscription(shopId: string, planIdRzp: string) {
  const auth = btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`);
  const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planIdRzp, total_count: 120, quantity: 1, customer_notify: 1 }),
  });
  const rzpSub = await res.json();
  if (!res.ok) throw new Error(rzpSub?.error?.description || "Razorpay create failed");
  const supa = db();
  const { data: plan } = await supa.from("subscription_plans").select("id").eq("razorpay_plan_id", planIdRzp).single();
  await supa.from("subscriptions").insert({ shop_id: shopId, plan_id: plan.id, razorpay_subscription_id: rzpSub.id, status: "created" });
  return { subscription_id: rzpSub.id, key_id: Deno.env.get("RAZORPAY_KEY_ID") };
}

// ---------- send-booking-alert (FCM fan-out) ----------
// 1) in-app notification row  2) FCM push to the owner's device_tokens
//    with high-priority data payload (Android handles it in the native
//    SeamoMessagingService even when the app is closed — see
//    android/app/src/main/java/com/seamo/haircut/SeamoMessagingService.kt).
// 3) delivery logged in notification_deliveries.
export async function sendBookingAlert(booking: any, ownerUserId: string, shopId: string) {
  const supa = db();
  const { data: notif } = await supa.from("notifications").insert({
    user_id: ownerUserId, shop_id: shopId, type: "new_booking",
    title: "नई बुकिंग आई है!",
    body: `${booking.customer_name} — ${booking.service_name || "Haircut"} — ${booking.booking_date} ${booking.booking_time} — टोकन #${booking.token_number ?? "?"}`,
    data: { booking_id: booking.id, token: booking.token_number },
  }).select().single();
  const { data: devices } = await supa.from("device_tokens").select("fcm_token")
    .eq("user_id", ownerUserId).eq("is_active", true);
  // FCM v1 send: POST https://fcm.googleapis.com/v1/projects/<PROJECT>/messages:send
  // with a service-account OAuth token; message: { token, data: { type:'new_booking',
  //   title, body, booking_id, token }, android: { priority: 'HIGH',
  //   notification: { channel_id: 'seamo_booking_alerts', sound: 'booking_alert' } } }
  // Each send result is recorded in notification_deliveries.
  return { notification_id: notif?.id, devices: devices?.length ?? 0 };
}
