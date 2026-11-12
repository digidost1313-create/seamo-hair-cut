-- ============================================================
-- UNLIMITED HAIR CUT — Supabase PostgreSQL Schema v1.0
-- Agra-first, India-scalable. Timezone: Asia/Kolkata
-- Run in Supabase SQL Editor (in order). Enables PostGIS-lite
-- via earthdistance for distance sorting (no PostGIS needed).
-- ============================================================
create extension if not exists "pgcrypto";
create extension if not exists "cube";
create extension if not exists "earthdistance";

create type user_role as enum ('super_admin','shop_owner','staff','customer');
create type booking_status as enum ('pending','accepted','rejected','confirmed','arrived','service_started','completed','cancelled','no_show');
create type subscription_status as enum ('created','authenticated','active','pending','halted','cancelled','paused','expired','completed');
create type payment_status as enum ('created','authorized','captured','failed','refunded','pending');

-- 1. profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text unique,
  avatar_url text,
  language text not null default 'hi' check (language in ('hi','en')),
  city text default 'Agra',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. user_roles (a user can hold multiple roles)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role user_role not null,
  shop_id uuid,
  created_at timestamptz not null default now(),
  unique(user_id, role, shop_id)
);
create index idx_user_roles_user on public.user_roles(user_id);

-- 3. shops
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  owner_name text not null default '',
  phone text not null,
  email text,
  address text not null default '',
  area text default '',
  city text not null default 'Agra',
  state text not null default 'Uttar Pradesh',
  pincode text default '',
  latitude double precision,
  longitude double precision,
  logo_url text, cover_url text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  is_approved boolean not null default false,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected','suspended')),
  is_temporarily_closed boolean not null default false,
  online_bookings_paused boolean not null default false,
  rating numeric(3,2) not null default 0,
  rating_count int not null default 0,
  starting_price int not null default 100,
  max_bookings_per_slot int not null default 1,
  buffer_minutes int not null default 10,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_shops_city_area on public.shops(city, area);
create index idx_shops_geo on public.shops(latitude, longitude);
create index idx_shops_owner on public.shops(owner_id);

-- 4. shop_documents
create table public.shop_documents (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  doc_type text not null, -- aadhaar, pan, gst, shop_license, photo_id
  file_url text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- 5. shop_photos
create table public.shop_photos (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  photo_url text not null, caption text, sort_order int default 0,
  created_at timestamptz not null default now()
);

-- 6. shop_services
create table public.shop_services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null, name_hi text,
  description text, image_url text,
  category text not null default 'haircut',
  price int not null check (price >= 0),
  discounted_price int check (discounted_price >= 0),
  duration_minutes int not null default 30 check (duration_minutes > 0),
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_services_shop on public.shop_services(shop_id, is_active);

-- 7. shop_staff
create table public.shop_staff (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null, photo_url text, phone text,
  experience_years numeric(4,1) default 0,
  specialisation text default '',
  weekly_off int check (weekly_off between 0 and 6), -- 0=Sunday
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_staff_shop on public.shop_staff(shop_id, is_active);

-- 8. staff_services (M:N)
create table public.staff_services (
  staff_id uuid not null references public.shop_staff(id) on delete cascade,
  service_id uuid not null references public.shop_services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- 9. staff_availability
create table public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.shop_staff(id) on delete cascade,
  date date not null, start_time time not null, end_time time not null,
  is_available boolean not null default true,
  blocked_reason text,
  unique(staff_id, date, start_time)
);

-- 10. shop_business_hours (0=Sunday .. 6=Saturday)
create table public.shop_business_hours (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time, close_time time,
  is_holiday boolean not null default false,
  unique(shop_id, day_of_week)
);

-- 11. bookings — slot lock: unique partial index prevents double-booking
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null default ('UHC' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  customer_id uuid references public.profiles(id) on delete set null,
  shop_id uuid not null references public.shops(id) on delete cascade,
  staff_id uuid references public.shop_staff(id) on delete set null, -- null = Any Available
  booking_date date not null,
  booking_time time not null,
  total_amount int not null default 0,
  status booking_status not null default 'pending',
  customer_name text not null, customer_phone text not null,
  notes text, cancel_reason text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_bookings_shop_date on public.bookings(shop_id, booking_date, booking_time);
create index idx_bookings_customer on public.bookings(customer_id, booking_date desc);
-- DOUBLE-BOOKING GUARD: same shop+staff+date+time cannot have 2 live bookings
create unique index uq_no_double_booking
  on public.bookings(shop_id, staff_id, booking_date, booking_time)
  where status in ('pending','accepted','confirmed','arrived','service_started') and staff_id is not null;

-- 12. booking_items
create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_id uuid references public.shop_services(id) on delete set null,
  service_name text not null, price int not null, duration_minutes int not null default 30
);

-- 13. booking_status_history
create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status booking_status, to_status booking_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text, created_at timestamptz not null default now()
);

-- 14. customers (denormalised CRM view table for admin search)
create table public.customers (
  id uuid primary key references public.profiles(id) on delete cascade,
  total_bookings int not null default 0,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now()
);

-- 15. reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text, is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique(booking_id)
);
create index idx_reviews_shop on public.reviews(shop_id, created_at desc);

-- 16. favourites
create table public.favourites (
  customer_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, shop_id)
);

-- 17. subscription_plans
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'UNLIMITED BASIC PLAN',
  price int not null default 49900, -- paise: ₹499
  currency text not null default 'INR',
  interval text not null default 'monthly',
  razorpay_plan_id text,
  trial_days int not null default 0,
  is_active boolean not null default true,
  features jsonb not null default '[]',
  created_at timestamptz not null default now()
);
insert into public.subscription_plans (name, price, features)
values ('UNLIMITED BASIC PLAN', 49900, '["Unlimited services","Unlimited bookings","Sound-box alerts","Shop dashboard","Staff management"]');

-- 18. subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  razorpay_subscription_id text unique,
  status subscription_status not null default 'created',
  current_start timestamptz, current_end timestamptz,
  next_renewal_at timestamptz,
  grace_ends_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_subs_shop on public.subscriptions(shop_id, status);

-- 19. payment_transactions
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  razorpay_payment_id text unique, razorpay_order_id text,
  amount int not null, currency text not null default 'INR',
  status payment_status not null default 'created',
  method text, failure_reason text,
  created_at timestamptz not null default now()
);

-- 20. razorpay_webhook_events (idempotency: event id unique)
create table public.razorpay_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  received_at timestamptz not null default now()
);

-- 21. notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  type text not null, title text not null, body text not null default '',
  data jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notif_user on public.notifications(user_id, is_read, created_at desc);

-- 22. sound_devices (physical sound-box ready: token + MQTT/API)
create table public.sound_devices (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  device_name text not null default 'Shop Sound Box',
  device_token text unique not null default encode(gen_random_bytes(24),'hex'),
  fcm_token text, mqtt_client_id text,
  is_online boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

-- 23. notification_preferences (Sound Alert Settings)
create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  sound_enabled boolean not null default true,
  tone text not null default 'bell' check (tone in ('bell','chime','siren','classic')),
  volume int not null default 80 check (volume between 0 and 100),
  repeat_alerts boolean not null default true,
  repeat_interval_seconds int not null default 15,
  max_repeats int not null default 8,
  push_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  whatsapp_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 24. coupons
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, description text,
  discount_type text not null default 'percent' check (discount_type in ('percent','flat')),
  discount_value int not null, max_discount int,
  valid_from timestamptz, valid_to timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 25. offers
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  title text not null, description text, banner_url text,
  is_featured boolean not null default false,
  valid_from timestamptz, valid_to timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 26/27. support
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete set null,
  subject text not null, category text not null default 'general',
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null, created_at timestamptz not null default now()
);

-- 28. admin_settings (commission toggle for future)
create table public.admin_settings (
  key text primary key, value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.admin_settings(key,value) values
 ('booking_commission', '{"enabled":false,"percent":0}'),
 ('booking_fee', '{"enabled":false,"amount":0}'),
 ('grace_period_days','3'),
 ('platform', '{"name":"UNLIMITED HAIR CUT","city":"Agra","currency":"INR","timezone":"Asia/Kolkata"}')
on conflict (key) do nothing;

-- 29. audit_logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null, entity text not null, entity_id uuid,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['profiles','shops','shop_services','bookings','subscriptions','support_tickets']
  loop execute format('create trigger trg_touch_%s before update on public.%s for each row execute function public.touch_updated_at()', t, t); end loop;
end $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.shops enable row level security;
alter table public.shop_services enable row level security;
alter table public.shop_staff enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favourites enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer as $$
  select exists(select 1 from public.user_roles where user_id = auth.uid() and role='super_admin') $$;
create or replace function public.owns_shop(s uuid) returns boolean language sql stable security definer as $$
  select exists(select 1 from public.shops where id=s and owner_id=auth.uid()) $$;

-- Shops: public can read approved+active; owner full; admin full
create policy shops_read on public.shops for select using (is_approved and is_active or owner_id=auth.uid() or public.is_admin());
create policy shops_write on public.shops for all using (owner_id=auth.uid() or public.is_admin()) with check (owner_id=auth.uid() or public.is_admin());
-- Profile: own or admin
create policy profiles_own on public.profiles for all using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());
create policy roles_own on public.user_roles for select using (user_id=auth.uid() or public.is_admin());
-- Services/staff: public read active, owner write
create policy services_read on public.shop_services for select using (true);
create policy services_write on public.shop_services for all using (public.owns_shop(shop_id) or public.is_admin()) with check (public.owns_shop(shop_id) or public.is_admin());
create policy staff_read on public.shop_staff for select using (true);
create policy staff_write on public.shop_staff for all using (public.owns_shop(shop_id) or public.is_admin()) with check (public.owns_shop(shop_id) or public.is_admin());
-- Bookings: customer sees own, owner sees shop's, admin all. Insert: anyone authenticated for self.
create policy bookings_read on public.bookings for select using (customer_id=auth.uid() or public.owns_shop(shop_id) or public.is_admin());
create policy bookings_insert on public.bookings for insert with check (customer_id=auth.uid() or customer_id is null);
create policy bookings_update on public.bookings for update using (customer_id=auth.uid() or public.owns_shop(shop_id) or public.is_admin());
-- Reviews/favourites/notifications/subscriptions: own-scope
create policy reviews_read on public.reviews for select using (true);
create policy reviews_write on public.reviews for insert with check (customer_id=auth.uid());
create policy fav_own on public.favourites for all using (customer_id=auth.uid()) with check (customer_id=auth.uid());
create policy notif_own on public.notifications for all using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy subs_read on public.subscriptions for select using (public.owns_shop(shop_id) or public.is_admin());
create policy tickets_own on public.support_tickets for all using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());

-- Distance helper (km) for nearby sorting
create or replace function public.shops_nearby(lat double precision, lon double precision)
returns table(id uuid, distance_km double precision) language sql stable as $$
  select s.id, earth_distance(ll_to_earth(s.latitude,s.longitude), ll_to_earth(lat,lon))/1000.0
  from public.shops s where s.latitude is not null and s.is_approved and s.is_active
  order by 2 asc $$;

-- Storage buckets (run once): shops, avatars, gallery
insert into storage.buckets (id,name,public) values ('shops','shops',true),('avatars','avatars',true),('gallery','gallery',true)
on conflict (id) do nothing;
