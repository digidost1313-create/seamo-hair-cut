-- ============================================================
-- SEAMO HAIR CUT — Mobile extension to the production-pack schema
-- Run AFTER supabase/01-supabase-schema.sql (which already creates
-- profiles, shops, shop_services, shop_staff, bookings, subscriptions,
-- payment_transactions, razorpay_webhook_events, notifications,
-- notification_preferences, offers, support_tickets, admin_settings,
-- audit_logs, RLS helpers is_admin()/owns_shop()).
-- Adds the tables the mobile spec requires that the base schema lacks:
--   booking_tokens (daily per-salon sequence), payment_verifications,
--   device_tokens, slot_locks, cities, platform_banners, booking_fee
--   setting (in admin_settings), voice/sound settings, token audit.
-- Timezone: Asia/Kolkata. All money in paise in DB, rupees in UI.
-- ============================================================

-- 1) Booking fee is a setting, never hardcoded.
insert into public.admin_settings(key, value) values
  ('booking_fee', '{"amount_paise":1000,"currency":"INR","enabled":true}')
on conflict (key) do update set value = excluded.value;
-- NOTE: base schema seeded booking_fee as {"enabled":false,"amount":0};
-- the line above corrects it to the live ₹10 platform fee.

-- 2) Cities (Agra-first, expandable)
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null, state text not null default 'Uttar Pradesh',
  district text, pincode_prefix text, is_active boolean not null default true,
  serviceable boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, state)
);
insert into public.cities(name, district) values
  ('Agra','Agra'), ('Mathura','Mathura'), ('Vrindavan','Mathura'),
  ('Firozabad','Firozabad'), ('Aligarh','Aligarh')
on conflict do nothing;

-- 3) Daily per-salon token sequence (one row per salon per business date)
create table if not exists public.booking_tokens (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  business_date date not null,
  token_number int not null check (token_number > 0),
  status text not null default 'waiting'
    check (status in ('waiting','called','arrived','in_service','completed','cancelled','no_show')),
  created_at timestamptz not null default now(),
  unique(shop_id, business_date, token_number)
);
create index if not exists idx_tokens_shop_date on public.booking_tokens(shop_id, business_date);

-- Atomic token issue: returns the next token for (shop, date) or raises.
-- Call inside the same transaction as the booking insert.
create or replace function public.issue_daily_token(p_shop uuid, p_date date, p_booking uuid)
returns int language plpgsql security definer as $$
declare next_no int;
begin
  select coalesce(max(token_number), 0) + 1 into next_no
    from public.booking_tokens where shop_id = p_shop and business_date = p_date;
  insert into public.booking_tokens(shop_id, booking_id, business_date, token_number)
    values (p_shop, p_booking, p_date, next_no);
  return next_no;
exception when unique_violation then
  -- concurrent insert raced us; retry once
  select coalesce(max(token_number), 0) + 1 into next_no
    from public.booking_tokens where shop_id = p_shop and business_date = p_date;
  insert into public.booking_tokens(shop_id, booking_id, business_date, token_number)
    values (p_shop, p_booking, p_date, next_no);
  return next_no;
end $$;

-- 4) Slot locks (temporary hold during payment, auto-expires)
create table if not exists public.slot_locks (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  staff_id uuid references public.shop_staff(id) on delete cascade,
  booking_date date not null, booking_time time not null,
  customer_id uuid references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(shop_id, staff_id, booking_date, booking_time)
);
create index if not exists idx_locks_expiry on public.slot_locks(expires_at);

-- 5) Payment verifications — the ONLY source of truth for "paid".
-- A payment is confirmed ONLY when a gateway webhook / server check
-- writes verified=true here. Screenshots and 'Paid' taps never do.
create table if not exists public.payment_verifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  gateway text not null default 'razorpay',
  gateway_payment_id text, gateway_order_id text,
  upi_txn_ref text, amount_paise int not null,
  verified boolean not null default false,
  verified_at timestamptz, verified_by text, -- 'razorpay_webhook' | 'server_check'
  raw_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_payver_booking on public.payment_verifications(booking_id);

-- 6) Device tokens (FCM) + delivery log
create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  fcm_token text not null, platform text not null default 'android'
    check (platform in ('android','ios','web')),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(user_id, fcm_token)
);
create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade,
  fcm_message_id text, status text not null default 'sent',
  error text, created_at timestamptz not null default now()
);

-- 7) Voice-box / sound settings per shop (extends notification_preferences)
create table if not exists public.voice_settings (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  enabled boolean not null default true,
  loud boolean not null default true,
  repeat_until_ack boolean not null default true,
  repeat_interval_seconds int not null default 15,
  max_repeats int not null default 8,
  vibration boolean not null default true,
  language text not null default 'en-IN',
  updated_at timestamptz not null default now()
);

-- 8) Platform banners (admin-published, city/salon targeted)
create table if not exists public.platform_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, image_url text,
  discount_text text, city text, shop_id uuid references public.shops(id) on delete set null,
  valid_from timestamptz, valid_to timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 9) Extend bookings with token + fee snapshot (fee read from settings at booking time)
alter table public.bookings
  add column if not exists token_number int,
  add column if not exists booking_fee_paise int not null default 1000,
  add column if not exists payment_verified boolean not null default false,
  add column if not exists upi_txn_ref text;
alter table public.shops
  add column if not exists upi_id text,
  add column if not exists upi_qr_url text,
  add column if not exists years_experience int,
  add column if not exists staff_count int;

-- 10) RLS on new tables
alter table public.booking_tokens enable row level security;
alter table public.payment_verifications enable row level security;
alter table public.device_tokens enable row level security;
alter table public.cities enable row level security;
alter table public.platform_banners enable row level security;
create policy tokens_read on public.booking_tokens for select
  using (public.owns_shop(shop_id) or public.is_admin() or
         exists (select 1 from public.bookings b where b.id = booking_tokens.booking_id and b.customer_id = auth.uid()));
create policy payver_read on public.payment_verifications for select
  using (public.is_admin() or exists (select 1 from public.bookings b where b.id = payment_verifications.booking_id and (b.customer_id = auth.uid() or public.owns_shop(b.shop_id))));
create policy devices_own on public.device_tokens for all
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy cities_read on public.cities for select using (true);
create policy banners_read on public.platform_banners for select using (is_active);

-- 11) Storage buckets for the mobile app (in addition to base shops/avatars/gallery)
-- CUSTOMER AUTH (user rule, 12 Nov 2026): PIN-ONLY, exactly 4 digits.
--   Register: phone → full name → Create 4-digit PIN → Confirm 4-digit PIN (must match).
--   Login: phone + 4-digit PIN only. No OTP, no email, no email verification for customers.
--   Storage: the PIN is the Supabase Auth password (bcrypt-hashed server-side by
--   Supabase); it is NEVER stored plaintext, NEVER logged, NEVER in a custom column.
--   The internal auth email `customer-<phone>@seamo.internal` is an identifier only —
--   no email is collected from the customer and no verification email is sent.
--   Forgot PIN: owner-assisted verified reset only (admin sets a new PIN after
--   identity check via supabase.auth.admin.updateUserById); no fake auto-reset.
--   Owner/Admin auth stays OTP (Supabase phone auth) — see src/pages/Auth.tsx.
--   Marker column (no secret): profiles.auth_method 'pin' | 'otp'.
insert into storage.buckets (id, name, public) values
  ('upi-qr','upi-qr',true), ('salon-logos','salon-logos',true)
on conflict (id) do nothing;
