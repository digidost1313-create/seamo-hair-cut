-- SEAMO HAIR CUT — demo seed (Agra). Clearly demo data: is_demo=true everywhere.
-- Run after 01 + 02. 10 shops, 20 barbers, 80 services (8 per shop).
-- Coordinates around Agra centre (27.176, 78.008). Images: Unsplash.
-- NOTE: ids are deterministic demo UUIDs so the mobile demo UI can match them.
insert into public.shops (id, owner_id, name, slug, owner_name, phone, address, area, city, state, pincode,
  latitude, longitude, logo_url, cover_url, is_verified, is_active, is_approved, approval_status,
  rating, rating_count, starting_price, upi_id, years_experience, staff_count, is_demo)
select
  ('00000000-0000-0000-0000-0000000000' || lpad((g)::text, 2, '0'))::uuid,
  '00000000-0000-0000-0000-000000000099'::uuid,
  s.name, s.slug, s.owner, s.phone, s.address, s.area, 'Agra', 'Uttar Pradesh', '282001',
  s.lat, s.lon,
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
  true, true, true, 'approved', s.rating, 40 + g * 23, s.price, 'seamo' || g || '@okhdfcbank',
  5 + g, 2, true
from (values
  (1,'Royal Fade Studio','royal-fade-studio','Imran Khan','+91 98765 43210','Shop 4, Sanjay Place','Sanjay Place',27.1760,78.0080,4.8,140),
  (2,'The Golden Scissor','the-golden-scissor','Rohit Sharma','+91 98765 43211','12, Kamla Nagar','Kamla Nagar',27.2100,78.0010,4.7,120),
  (3,'Nawab Barber House','nawab-barber-house','Salman Ali','+91 98765 43212','8, Sikandra Road','Sikandra',27.2200,78.0300,4.6,100),
  (4,'Luxury Hair Lounge','luxury-hair-lounge','Vikram Singh','+91 98765 43213','21, Shahganj','Shahganj',27.1600,77.9900,4.5,180),
  (5,'Classic Cuts Agra','classic-cuts-agra','Amit Verma','+91 98765 43214','3, Tajganj','Tajganj',27.1600,78.0400,4.4,110),
  (6,'Style Studio 99','style-studio-99','Arjun Yadav','+91 98765 43215','9, Dayalbagh','Dayalbagh',27.2300,78.0200,4.9,200),
  (7,'The Beard Club','the-beard-club','Mohd. Asif','+91 98765 43216','15, Bodla','Bodla',27.1900,77.9900,4.3,130),
  (8,'Shahi Salon & Spa','shahi-salon-spa','Deepak Gupta','+91 98765 43217','7, Fatehabad Road','Fatehabad Road',27.1500,78.0300,4.8,250),
  (9,'Urban Trim Barbers','urban-trim-barbers','Karan Kapoor','+91 98765 43218','11, MG Road','MG Road',27.1800,78.0100,4.2,100),
  (10,'Crown Hair Studio','crown-hair-studio','Rahul Jain','+91 98765 43219','5, Khandari','Khandari',27.2000,78.0200,4.6,150)
) as s(g, name, slug, owner, phone, address, area, lat, lon, rating, price)
on conflict (id) do nothing;

-- 20 staff (2 per shop) + 80 services (8 per shop) — generated from the shop rows.
-- Staff names / services mirror src/lib/demoData.ts in the app.
insert into public.shop_staff (shop_id, name, phone, experience_years, specialisation, is_demo)
select sh.id, st.name, '+91 98765 43' || lpad((100 + row_number() over ())::text, 3, '0'),
       st.exp, st.skill, true
from public.shops sh
join (values ('Imran Khan',8,'Fade & Classic Cuts'),('Rohit Sharma',6,'Beard Styling'),
             ('Salman Ali',10,'Hair Colour'),('Vikram Singh',5,'Kids Haircut'),
             ('Amit Verma',7,'Hair Spa'),('Arjun Yadav',4,'Modern Fades'),
             ('Mohd. Asif',12,'Traditional Shave'),('Deepak Gupta',9,'Facial & Grooming'),
             ('Karan Kapoor',3,'Styling'),('Rahul Jain',6,'Hair Treatment'),
             ('Nitin Verma',5,'Beard & Trim'),('Suresh Kumar',11,'Classic Cuts'),
             ('Anil Yadav',7,'Hair Spa'),('Vikas Singh',4,'Fade'),
             ('Zaid Khan',8,'Colour'),('Pankaj Sharma',6,'Facial'),
             ('Ravi Kumar',5,'Kids'),('Sanjay Verma',9,'Grooming'),
             ('Faiz Ali',7,'Beard'),('Manish Gupta',10,'Styling')) as st(name, exp, skill)
  on true
where sh.is_demo
  and (row_number() over (partition by sh.id order by st.name) <= 2)
on conflict do nothing;

insert into public.shop_services (shop_id, name, category, price, duration_minutes, is_demo)
select sh.id, sv.name, sv.cat, sv.price, sv.dur, true
from public.shops sh
cross join (values
  ('Classic Haircut','haircut',140,30),('Premium Fade Cut','haircut',250,40),
  ('Beard Trim & Shape','beard',120,20),('Haircut + Beard Combo','combo',250,50),
  ('Hair Spa','spa',499,60),('Facial Glow','facial',599,45),
  ('Hair Colour','colour',799,90),('Hair Wash','wash',99,15)) as sv(name, cat, price, dur)
where sh.is_demo
on conflict do nothing;

-- Business hours: 09:00–21:00, Monday holiday for every 3rd shop (matches demo UI).
insert into public.shop_business_hours (shop_id, day_of_week, open_time, close_time, is_holiday)
select sh.id, d, '09:00', '21:00', (d = 1 and (row_number() over (partition by sh.id)) % 3 = 0)
from public.shops sh cross join generate_series(0, 6) as d
where sh.is_demo on conflict do nothing;

-- One live-test booking, kept as visible proof (matches the 6 Nov web test UHC842486).
-- It is labelled is_demo=true and excluded from live counts.
insert into public.bookings (booking_code, shop_id, booking_date, booking_time, total_amount,
  status, customer_name, customer_phone, is_demo, booking_fee_paise, payment_verified)
select 'UHC842486', id, '2026-11-08', '16:30', 140, 'accepted', 'Imran Khan', '+91 98765 43210',
  true, 1000, true from public.shops where slug = 'royal-fade-studio'
on conflict (booking_code) do nothing;
