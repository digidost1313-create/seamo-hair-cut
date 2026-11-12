# SEAMO HAIR CUT — BUILD STATUS (12 Nov 2026)

Project: `~/workspace/goals/unlimited-hair-cut-booking-marketplace/files/seamo-mobile-app/`
Stack: Capacitor 7 + React 18 + TypeScript + Vite + Tailwind. App id `com.seamo.haircut`.
Brand: Royal Black `#101114` / Champagne Gold `#C6A15B` / Ivory White `#F4F0E8` /
Charcoal Grey `#34363C`. Hindi default + English toggle, INR, Asia/Kolkata, Agra-first.

## Customer auth — PIN-ONLY (user rule, 12 Nov 2026)

- **Customer: exactly 4-digit PIN, nothing else.** Register: phone number →
  full name → Create 4-digit PIN → Confirm 4-digit PIN (must match) → account
  created. Login afterwards: phone + 4-digit PIN only.
- **No OTP, no email field, no email verification for the customer** — all OTP /
  email-verification UI for the customer was removed (`src/pages/Auth.tsx`).
- PIN storage: the 4-digit PIN is the Supabase Auth password (bcrypt-hashed
  server-side by Supabase; never plaintext, never in logs, never in a custom
  column). Internal identifier `customer-<phone>@seamo.internal` is used so no
  customer email is collected and no verification email is sent.
- Forgot PIN: owner-assisted verified reset only (Admin → Customer → Reset PIN
  after identity check); no fake auto-reset.
- **Owner and Admin auth stays OTP** (Supabase phone auth), as specified —
  no conflict. The same Auth screen branches on role.
- Validation: `/^\d{4}$/` (0000–9999); input capped at 4 digits; mismatched
  Confirm PIN blocks registration with a Hindi message. Owner/admin OTP
  remains 6 digits (separate input, unchanged).

## VERIFIED (with evidence)

| Check | Evidence |
|---|---|
| `npm install` | exit 0, 249 packages (`/tmp/npm-install.log`) |
| `npm run build` (tsc + vite) | exit 0, 101 modules, `dist/index.html` + `dist/assets/index-*.js` 458.75 kB — re-run after the PIN change, passes |
| App scaffold | `npx cap add android` exit 0 — `android/` platform present, app id `com.seamo.haircut`, name SEAMO HAIR CUT |
| Icon + splash | `public/icon.png` (1024), `public/icon-512.png`, `public/splash.png` generated locally (gold-on-black); launcher mipmaps replaced in `android/app/src/main/res/mipmap-*/` |
| Supabase backend | `supabase/01-supabase-schema.sql` (production pack, copied), `02-mobile-extension.sql` (booking_tokens + `issue_daily_token()`, payment_verifications, device_tokens, slot_locks, cities, platform_banners, voice_settings, booking-fee setting, PIN-auth notes), `03-demo-seed.sql` (10 Agra shops / 20 barbers / 80 services, `is_demo=true`), `supabase/functions/index.ts` (create-booking 409 + idempotency, razorpay-webhook HMAC + idempotency, create-subscription, send-booking-alert FCM fan-out) |
| All three panels | 27 source files: Customer (Home/Search/SalonDetail booking wizard/MyBookings/Notifications/Profile), Owner (Register/Dashboard/Bookings/Tokens/Staff+Services/Payments/Voice/Subscription/More), Admin (Dashboard + 10 management screens) — all routed in `src/App.tsx` |
| Native Voice Box code | `android/app/src/main/java/com/seamo/haircut/SeamoMessagingService.java` (FCM + high-importance channel + TextToSpeech), `MainActivity.java` (channel creation), `res/raw/booking_alert.wav` (generated bell tone), `res/drawable/ic_stat_seamo.xml`, manifest permissions (camera, location, POST_NOTIFICATIONS, vibrate, foreground service, boot) + FCM service registration |
| CI build | `.github/workflows/build-apk.yml` (debug APK + release AAB on GitHub Actions) |
| No secrets committed | `.env.example` only; no real keys, no `google-services.json`, no keystore in the repo |

## NOT BUILT — APK (environment blocker, NOT a code bug)

**No APK exists. Do not claim one.**

Exact failure: `./gradlew assembleDebug` / `gradle assembleDebug` fails at
dependency resolution — Gradle cannot download anything:
`Could not resolve com.android.tools.build:gradle:8.7.2 / com.google.gms:google-services:4.4.2 —
Could not GET 'https://dl.google.com/...' / 'https://repo.maven.apache.org/...'`.

Root cause (verified): **this VM blocks raw TCP from Java processes.**
A raw-socket test from both JDK 17 and JDK 21 returns the sandbox message:
`muse: Other TCP connections is turned off for this assistant. To allow it, ask
the user to open Muse settings -> Permissions -> Direct network protocols and
switch other_tcp from Deny to Ask.`
The same request works from curl and Python (proxy CONNECT returns
`HTTP/1.1 200 Connection Established`). So Gradle — a Java process — cannot
reach Maven Central / Google Maven in this VM, while curl/Python can.

Fixed along the way (each verified): Gradle daemon link failure →
`-Djava.net.preferIPv4Stack=true` (now in `android/gradle.properties`);
sdkmanager proxy failure → SDK packages downloaded directly via curl
(platforms android-34/35, build-tools 34/35, platform-tools, cmdline-tools
installed at `/opt/android-sdk`); JDK 17 + 21 installed at `/opt/jdk17`,
`/opt/jdk21`; Gradle 8.11.1 extracted at `/opt/gradle-8.11.1`
(`gradlew` wrapper download fails the same way, so use the extracted binary).

**Exact command to retry (on a machine where Java TCP is allowed, or in CI):**
```bash
cd seamo-mobile-app
npm install && npm run build
npx cap sync android
export JAVA_HOME=<jdk-21> ANDROID_HOME=<android-sdk>
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
# Release AAB: ./gradlew bundleRelease   (needs signing keystore, see README)
```
Or push to GitHub and let `.github/workflows/build-apk.yml` build it
(no local Java network needed there). Local alternative: enable the
`other_tcp` permission noted above, then re-run the same command.

## NOT YET VERIFIED / NEEDS THE USER (per the device-verification rule)

A builder/server check is **not** proof. Nothing below counts as
"verified / fixed / ho gaya" until the user confirms it on their own phone.

- [ ] Real-device install of the APK (once built in CI or on an allowed machine)
  + tap-through: customer PIN register (4-digit) → salon search → booking →
  token; owner accept; admin approve. **The user's own tap is the only proof.**
- [ ] Supabase project + keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  service-role key as a Supabase secret) + run `supabase/01/02/03` SQL in order.
- [ ] SMS provider for owner/admin OTP (Supabase phone auth). Customers need
  no SMS (PIN-only).
- [ ] Razorpay Key ID / Secret / Webhook Secret + ₹499/month Plan ID + KYC;
  webhook URL → `razorpay-webhook` Edge Function.
- [ ] Firebase project + `google-services.json` in `android/app/` (NOT committed)
  — without it FCM cannot register and the Voice Box falls back to in-app
  notifications only. Then verify a real booking alert on a locked phone.
- [ ] Google Maps API key (optional, map view only).
- [ ] Play signing keystore + passwords (release AAB) — CI secrets.
- [ ] Real payment test: ₹10 fee via Razorpay webhook only; never confirm
  from a screenshot or a 'Paid' tap (enforced in code + Edge Function).
- [ ] Owner battery-optimisation exemption on real phones (Android Doze can
  delay background TTS; iOS Focus rules apply).

## Honest limits (stated in-app where relevant)

- Demo mode (no Supabase configured) shows clearly-labelled demo data and a
  demo 4-digit PIN flow; it never fakes a verified OTP/payment.
- Voice Box: loud notification is the reliable part; background TTS is
  best-effort on some Android OEMs; iOS respects Apple notification/Focus rules.
- Platform revenue = verified ₹10 fees + subscriptions only; salon QR
  collections are never counted as SEAMO revenue.
- Zip: `~/workspace/goals/unlimited-hair-cut-booking-marketplace/files/seamo-mobile-app.zip`
  (source only — no `node_modules`, `dist`, or `android/*/build`).
