import os
ROOT = os.path.expanduser("~/workspace/goals/unlimited-hair-cut-booking-marketplace/files/seamo-mobile-app/src")
def w(rel, s):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(s)

# ---------- lib: images, demo data ----------
IMG = {
 "salon": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
 "salon2": "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
 "salon3": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
 "salon4": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
 "barber": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80",
 "barber2": "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80",
 "barber3": "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80",
 "haircut": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
 "beard": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
 "spa": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
 "facial": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
 "colour": "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
 "wash": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80",
 "kids": "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&q=80",
 "grooming": "https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=600&q=80",
}
w("lib/images.ts", "export const IMG = " + repr(IMG).replace("'", '"') + " as const;\n")

CATEGORIES = ["Haircut","Beard Styling","Haircut + Beard","Hair Spa","Facial","Hair Colour","Hair Wash","Hair Treatment","Kids Haircut","Grooming"]
CAT_IMG = {"Haircut":"haircut","Beard Styling":"beard","Haircut + Beard":"beard","Hair Spa":"spa","Facial":"facial","Hair Colour":"colour","Hair Wash":"wash","Hair Treatment":"spa","Kids Haircut":"kids","Grooming":"grooming"}

# demo salons: 10 Agra shops
areas = [("Sanjay Place",27.1760,78.0080),("Kamla Nagar",27.2100,78.0010),("Sikandra",27.2200,78.0300),("Shahganj",27.1600,77.9900),("Tajganj",27.1600,78.0400),("Dayalbagh",27.2300,78.0200),("Bodla",27.1900,77.9900),("Fatehabad Road",27.1500,78.0300),("MG Road",27.1800,78.0100),("Khandari",27.2000,78.0200)]
names = ["Royal Fade Studio","The Golden Scissor","Nawab Barber House","Luxury Hair Lounge","Classic Cuts Agra","Style Studio 99","The Beard Club","Shahi Salon & Spa","Urban Trim Barbers","Crown Hair Studio"]
owners = ["Imran Khan","Rohit Sharma","Salman Ali","Vikram Singh","Amit Verma","Arjun Yadav","Mohd. Asif","Deepak Gupta","Karan Kapoor","Rahul Jain"]
staff_pool = [("Imran Khan",8,"Fade & Classic Cuts"),("Rohit Sharma",6,"Beard Styling"),("Salman Ali",10,"Hair Colour"),("Vikram Singh",5,"Kids Haircut"),("Amit Verma",7,"Hair Spa"),("Arjun Yadav",4,"Modern Fades"),("Mohd. Asif",12,"Traditional Shave"),("Deepak Gupta",9,"Facial & Grooming"),("Karan Kapoor",3,"Styling"),("Rahul Jain",6,"Hair Treatment"),("Nitin Verma",5,"Beard & Trim"),("Suresh Kumar",11,"Classic Cuts"),("Anil Yadav",7,"Hair Spa"),("Vikas Singh",4,"Fade"),("Zaid Khan",8,"Colour"),("Pankaj Sharma",6,"Facial"),("Ravi Kumar",5,"Kids"),("Sanjay Verma",9,"Grooming"),("Faiz Ali",7,"Beard"),("Manish Gupta",10,"Styling")]
services = [("Classic Haircut","Haircut",140,30),("Premium Fade Cut","Haircut",250,40),("Beard Trim & Shape","Beard Styling",120,20),("Haircut + Beard Combo","Haircut + Beard",250,50),("Hair Spa","Hair Spa",499,60),("Facial Glow","Facial",599,45),("Hair Colour","Hair Colour",799,90),("Hair Wash","Hair Wash",99,15),("Keratin Treatment","Hair Treatment",1499,120),("Kids Haircut","Kids Haircut",120,25),("Full Grooming Package","Grooming",999,90),("Head Massage","Hair Spa",299,30)]

import json
salons=[]
for i,(area,lat,lon) in enumerate(areas):
    salons.append({"id":f"salon-{i+1}","name":names[i],"owner":owners[i],"area":area,"city":"Agra","lat":lat,"lon":lon,
      "rating":round(4.2+((i*7)%8)/10,1),"reviews":40+i*23,"price":100+i*15,"open":"09:00","close":"21:00",
      "holiday":"Monday" if i%3==0 else "None","upi":f"seamo{i+1}@okhdfcbank","isDemo":True,
      "img":list(IMG.values())[i%4],"staff":[staff_pool[(i*2)%20],staff_pool[(i*2+1)%20]],
      "services":[services[(i+j)%len(services)] for j in range(8)]})
w("lib/demoData.ts", "export const CATEGORIES = " + json.dumps(CATEGORIES) + ";\n"
  "export const CAT_IMG: Record<string,string> = " + json.dumps(CAT_IMG) + ";\n"
  "export type DemoSalon = typeof DEMO_SALONS[number];\n"
  "export const DEMO_SALONS = " + json.dumps(salons) + " as const;\n"
  "export const DEMO_SERVICES = " + json.dumps(services) + ";\n"
  "export const BOOKING_FEE_DEFAULT = 10; // INR — configurable in app_settings, never hardcoded in business logic; this is the fallback only\n"
  "export const SUBSCRIPTION_PRICE = 499; // INR/month, configurable via subscription_plans\n")

# ---------- lib: supabase client + i18n + store ----------
w("lib/supabase.ts", """import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const supabaseConfigured = Boolean(url && anon)
export const supabase = supabaseConfigured
  ? createClient(url!, anon!)
  : null as unknown as ReturnType<typeof createClient>
// Demo mode: when no Supabase project is configured the app runs on DEMO_SALONS
// (clearly labelled DEMO in the UI). No OTP is ever faked as successful.
export const DEMO_MODE = !supabaseConfigured
""")

w("lib/i18n.ts", """export type Lang = 'hi' | 'en'
export const T: Record<string, { hi: string; en: string }> = {
  home: { hi: 'होम', en: 'Home' },
  search: { hi: 'सैलून खोजें', en: 'Search salons' },
  bookings: { hi: 'मेरी बुकिंग', en: 'My Bookings' },
  notifications: { hi: 'सूचनाएँ', en: 'Notifications' },
  profile: { hi: 'प्रोफ़ाइल', en: 'Profile' },
  nearby: { hi: 'पास के सैलून', en: 'Nearby Salons' },
  popular: { hi: 'लोकप्रिय सैलून', en: 'Popular Salons' },
  offers: { hi: 'ऑफ़र', en: 'Offers' },
  bookNow: { hi: 'अभी बुक करें', en: 'Book Now' },
  bookingFee: { hi: 'बुकिंग शुल्क', en: 'Booking Fee' },
  token: { hi: 'टोकन', en: 'Token' },
  owner: { hi: 'सैलून मालिक', en: 'Salon Owner' },
  admin: { hi: 'एडमिन', en: 'Admin' },
  demo: { hi: 'डेमो डेटा', en: 'Demo Data' },
}
export const t = (k: keyof typeof T, lang: Lang) => T[k][lang]
""")

w("lib/store.tsx", """import { createContext, useContext, useState, ReactNode } from 'react'
import type { Lang } from './i18n'
export type Role = 'customer' | 'owner' | 'admin' | null
export type Booking = {
  id: string; code: string; salonId: string; salonName: string; staff: string;
  services: string[]; date: string; time: string; token: number; fee: number;
  serviceTotal: number; status: 'pending'|'confirmed'|'accepted'|'rejected'|'completed'|'cancelled'|'in_progress';
  paymentStatus: 'pending'|'verified'|'failed'; customer: string; phone: string;
}
type Ctx = {
  lang: Lang; setLang: (l: Lang) => void
  role: Role; setRole: (r: Role) => void
  phone: string; setPhone: (p: string) => void
  bookings: Booking[]; addBooking: (b: Booking) => void; updateBooking: (id: string, patch: Partial<Booking>) => void
  city: string; setCity: (c: string) => void
  voice: { enabled: boolean; loud: boolean; repeat: boolean; vibrate: boolean }
  setVoice: (v: Partial<Ctx['voice']>) => void
  notifLog: string[]; logNotif: (s: string) => void
}
const C = createContext<Ctx>(null as any)
export const useApp = () => useContext(C)
export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('hi')
  const [role, setRole] = useState<Role>('customer')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Agra')
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 'b-demo-1', code: 'UHC842486', salonId: 'salon-1', salonName: 'Royal Fade Studio', staff: 'Imran Khan',
      services: ['Classic Haircut'], date: '2026-11-14', time: '16:30', token: 4, fee: 10, serviceTotal: 140,
      status: 'accepted', paymentStatus: 'verified', customer: 'Demo Customer', phone: '+91 98765 43210' },
  ])
  const [voice, setVoiceState] = useState({ enabled: true, loud: true, repeat: true, vibrate: true })
  const [notifLog, setNotifLog] = useState<string[]>(['10:42 — Test notification delivered (demo)'])
  const addBooking = (b: Booking) => setBookings(p => [b, ...p])
  const updateBooking = (id: string, patch: Partial<Booking>) => setBookings(p => p.map(b => b.id === id ? { ...b, ...patch } : b))
  const setVoice = (v: Partial<Ctx['voice']>) => setVoiceState(p => ({ ...p, ...v }))
  const logNotif = (s: string) => setNotifLog(p => [`${new Date().toLocaleTimeString('en-IN')} — ${s}`, ...p])
  return <C.Provider value={{ lang, setLang, role, setRole, phone, setPhone, bookings, addBooking, updateBooking, city, setCity, voice, setVoice, notifLog, logNotif }}>{children}</C.Provider>
}
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, dLa = (lat2 - lat1) * Math.PI / 180, dLo = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2
  return +(2 * R * Math.asin(Math.sqrt(a))).toFixed(1)
}
""")

# ---------- shared components ----------
w("components/ui.tsx", """import { Link } from 'react-router-dom'
import { DEMO_MODE } from '../lib/supabase'
import { useApp } from '../lib/store'
export function TopBar({ title, back }: { title: string; back?: string }) {
  return <header className="sticky top-0 z-40 bg-royal/95 backdrop-blur border-b border-gold/20 px-4 py-3 flex items-center gap-3">
    {back && <Link to={back} className="text-gold text-xl">‹</Link>}
    <div className="font-display font-bold tracking-wide text-lg"><span className="gold-text">SEAMO</span> <span className="text-ivory text-sm">HAIR CUT</span></div>
    <span className="ml-auto text-xs text-gold/80">{title}</span>
  </header>
}
export function DemoBadge() {
  if (!DEMO_MODE) return null
  return <div className="mx-4 mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
    ⚠ डेमो मोड — Supabase अभी कनेक्ट नहीं है। यहाँ दिख रहा डेटा डेमो है, असली बुकिंग नहीं।</div>
}
export function GoldButton({ children, onClick, to, disabled }: any) {
  const cls = "gold-grad text-royal font-bold rounded-xl px-5 py-3 text-center block w-full disabled:opacity-40"
  if (to) return <Link to={to} className={cls}>{children}</Link>
  return <button onClick={onClick} disabled={disabled} className={cls}>{children}</button>
}
export function Card({ children, className = '' }: any) {
  return <div className={`rounded-2xl bg-card border border-white/5 overflow-hidden ${className}`}>{children}</div>
}
export function BottomNav() {
  const { role } = useApp()
  const items = role === 'owner'
    ? [['/owner', '🏠 डैशबोर्ड'], ['/owner/bookings', '📋 बुकिंग'], ['/owner/tokens', '🎟 टोकन'], ['/owner/voice', '🔔 वॉइस'], ['/owner/more', '⚙️ सेटिंग']]
    : role === 'admin'
    ? [['/admin', '🏠 डैशबोर्ड'], ['/admin/salons', '✂️ सैलून'], ['/admin/bookings', '📋 बुकिंग'], ['/admin/finance', '💰 वित्त'], ['/admin/more', '⚙️ सेटिंग']]
    : [['/', '🏠 होम'], ['/search', '🔍 खोजें'], ['/my-bookings', '📋 बुकिंग'], ['/notifications', '🔔 सूचना'], ['/profile', '👤 प्रोफ़ाइल']]
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#17181D] border-t border-gold/25 pb-[env(safe-area-inset-bottom)]">
    <div className="grid grid-cols-5">{items.map(([to, label]: any) => (
      <Link key={to} to={to} className="py-2.5 text-center text-[11px] text-ivory/80 active:text-gold">{label}</Link>))}
    </div>
  </nav>
}
export function Page({ children, title, back }: any) {
  return <div className="min-h-screen bg-royal pb-24"><TopBar title={title || ''} back={back} /><DemoBadge /><div className="px-4 pt-4 space-y-4">{children}</div><BottomNav /></div>
}
export function RoleSwitcher() {
  const { role, setRole } = useApp()
  return <div className="flex gap-2">
    {(['customer', 'owner', 'admin'] as const).map(r => (
      <button key={r} onClick={() => setRole(r)} className={`flex-1 rounded-full py-2 text-xs font-bold ${role === r ? 'gold-grad text-royal' : 'bg-charcoal text-ivory/70'}`}>
        {r === 'customer' ? '👤 ग्राहक' : r === 'owner' ? '✂️ मालिक' : '🛡 एडमिन'}</button>))}
  </div>
}
""")
print("lib+components done")
