import os
ROOT = os.path.expanduser("~/workspace/goals/unlimited-hair-cut-booking-marketplace/files/seamo-mobile-app/src")
def w(rel, s):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(s)

# ---------- Auth (OTP, demo-labelled) ----------
w("pages/Auth.tsx", """import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, GoldButton, Card } from '../components/ui'
import { supabase, DEMO_MODE } from '../lib/supabase'
import { useApp } from '../lib/store'

export default function Auth() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()
  const { setPhone: savePhone, role } = useApp()

  const sendOtp = async () => {
    if (!/^\\d{10}$/.test(phone)) { setMsg('कृपया 10 अंकों का सही मोबाइल नंबर डालें।'); return }
    if (DEMO_MODE || !supabase) {
      // DEMO: never fake success — the OTP is NOT verified here.
      setMsg('डेमो मोड: SMS प्रोवाइडर कनेक्ट नहीं है, इसलिए असली OTP नहीं भेजा गया। नीचे डेमो OTP 123456 से केवल UI फ्लो देखें — यह असली लॉगिन नहीं है।')
      setStep('otp'); return
    }
    const { error } = await supabase.auth.signInWithOtp({ phone: '+91' + phone })
    if (error) setMsg('OTP भेजने में त्रुटि: ' + error.message)
    else { setMsg('OTP भेजा गया।'); setStep('otp') }
  }
  const verify = async () => {
    if (DEMO_MODE) {
      if (otp === '123456') { savePhone(phone); setMsg('डेमो लॉगिन (केवल UI परीक्षण)। असली OTP वेरिफिकेशन Supabase SMS प्रोवाइडर से होगा।'); nav('/') }
      else setMsg('गलत डेमो OTP — 123456 डालें (केवल डेमो)।')
      return
    }
    const { error } = await supabase!.auth.verifyOtp({ phone: '+91' + phone, token: otp, type: 'sms' })
    if (error) setMsg('OTP गलत: ' + error.message)
    else { savePhone(phone); nav('/') }
  }
  return <Page title={role === 'owner' ? 'मालिक लॉगिन' : role === 'admin' ? 'एडमिन लॉगिन' : 'लॉगिन / रजिस्टर'} back="/">
    <div className="text-center pt-6">
      <div className="text-5xl">✂️</div>
      <h1 className="font-display text-3xl font-bold mt-2"><span className="gold-text">SEAMO</span> HAIR CUT</h1>
      <p className="text-ivory/60 text-sm mt-1">मोबाइल OTP से लॉगिन करें</p>
    </div>
    <Card className="p-5 space-y-3">
      {step === 'phone' ? <>
        <label className="text-sm text-ivory/70">मोबाइल नंबर</label>
        <input value={phone} onChange={e => setPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
          placeholder="98765 43210" inputMode="numeric"
          className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-3 text-lg outline-none" />
        <GoldButton onClick={sendOtp}>OTP भेजें</GoldButton>
      </> : <>
        <label className="text-sm text-ivory/70">6 अंकों का OTP</label>
        <input value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0, 6))}
          placeholder="••••••" inputMode="numeric"
          className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-3 text-lg tracking-[0.5em] outline-none" />
        <GoldButton onClick={verify}>OTP वेरिफ़ाई करें</GoldButton>
        <button className="w-full text-gold text-sm" onClick={() => setStep('phone')}>नंबर बदलें</button>
      </>}
      {msg && <p className="text-xs leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">{msg}</p>}
      <p className="text-[11px] text-ivory/40">लॉगिन करके आप हमारी शर्तों व प्राइवेसी पॉलिसी से सहमत होते हैं। नोटिफिकेशन की अनुमति बुकिंग अपडेट के लिए माँगी जाएगी।</p>
    </Card>
  </Page>
}
""")

# ---------- Customer Home ----------
w("pages/customer/Home.tsx", """import { Link } from 'react-router-dom'
import { Page, Card, RoleSwitcher } from '../../components/ui'
import { DEMO_SALONS, CATEGORIES } from '../../lib/demoData'
import { IMG } from '../../lib/images'
import { useApp, distanceKm } from '../../lib/store'

export default function Home() {
  const { city, setCity, lang, setLang } = useApp()
  const cities = ['Agra', 'Mathura', 'Vrindavan', 'Firozabad', 'Aligarh']
  return <Page title="होम">
    <div className="flex items-center gap-2">
      <div className="font-display text-2xl font-bold"><span className="gold-text">SEAMO</span> <span className="text-sm">HAIR CUT</span></div>
      <select value={city} onChange={e => setCity(e.target.value)} className="ml-auto bg-charcoal rounded-full px-3 py-1.5 text-xs">
        {cities.map(c => <option key={c}>{c}</option>)}
      </select>
      <button onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')} className="bg-charcoal rounded-full px-3 py-1.5 text-xs font-bold text-gold">{lang === 'hi' ? 'EN' : 'हिंदी'}</button>
    </div>
    <RoleSwitcher />
    <Link to="/search" className="flex items-center gap-2 rounded-xl bg-card border border-gold/25 px-4 py-3 text-ivory/60">🔍 सैलून, सेवा या स्टाइल खोजें…</Link>
    <div>
      <h2 className="font-bold mb-2">श्रेणियाँ</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(c => (
          <Link key={c} to={`/search?cat=${encodeURIComponent(c)}`} className="shrink-0 w-20 text-center">
            <img src={(IMG as any)[({ 'Haircut': 'haircut', 'Beard Styling': 'beard', 'Haircut + Beard': 'beard', 'Hair Spa': 'spa', 'Facial': 'facial', 'Hair Colour': 'colour', 'Hair Wash': 'wash', 'Hair Treatment': 'spa', 'Kids Haircut': 'kids', 'Grooming': 'grooming' } as any)[c]]} alt={c} className="w-20 h-20 rounded-2xl object-cover border border-gold/30" />
            <p className="text-[11px] mt-1 leading-tight">{c}</p>
          </Link>))}
      </div>
    </div>
    <div>
      <div className="flex justify-between items-center mb-2"><h2 className="font-bold">📍 पास के सैलून</h2><Link to="/search" className="text-gold text-xs">सभी देखें ›</Link></div>
      <div className="space-y-3">
        {DEMO_SALONS.slice(0, 4).map(s => (
          <Link key={s.id} to={`/salon/${s.id}`}><Card className="flex">
            <img src={s.img} alt={s.name} className="w-28 h-28 object-cover" />
            <div className="p-3 flex-1">
              <div className="flex justify-between"><h3 className="font-bold">{s.name}</h3><span className="text-gold text-sm">★ {s.rating}</span></div>
              <p className="text-xs text-ivory/60">{s.area}, {s.city} • {distanceKm(27.176, 78.008, s.lat, s.lon)} km</p>
              <p className="text-xs text-ivory/60">{s.open} – {s.close} • छुट्टी: {s.holiday}</p>
              <p className="text-gold text-sm font-bold mt-1">₹{s.price} से शुरू</p>
            </div>
          </Card></Link>))}
      </div>
    </div>
    <div>
      <h2 className="font-bold mb-2">🔥 आज के ऑफ़र</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {['पहली बुकिंग पर 20% छूट', 'Haircut + Beard ₹250', 'Hair Spa ₹499', 'Festival Offer — Facial ₹599'].map((o, i) => (
          <div key={i} className="shrink-0 w-56 rounded-2xl gold-grad p-4 text-royal"><p className="font-bold">{o}</p><p className="text-xs mt-1">SEAMO HAIR CUT • Agra</p></div>))}
      </div>
    </div>
    <div>
      <h2 className="font-bold mb-2">💇 हेयरकट स्टाइल गैलरी</h2>
      <div className="grid grid-cols-3 gap-2">
        {[IMG.haircut, IMG.beard, IMG.colour, IMG.spa, IMG.facial, IMG.kids].map((u, i) => (
          <img key={i} src={u} alt="style" className="w-full h-24 object-cover rounded-xl border border-gold/20" />))}
      </div>
    </div>
    <p className="text-[11px] text-ivory/40 text-center">लोकप्रिय • फ़ीचर्ड • टॉप रेटेड सैलून — खोज पेज पर फ़िल्टर से देखें।</p>
  </Page>
}
""")

# ---------- Search ----------
w("pages/customer/Search.tsx", """import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Page, Card } from '../../components/ui'
import { DEMO_SALONS } from '../../lib/demoData'
import { distanceKm } from '../../lib/store'

type Filter = 'nearest' | 'rating' | 'price' | 'today' | 'offers'
export default function Search() {
  const [q, setQ] = useState('')
  const [f, setF] = useState<Filter>('nearest')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [params] = useSearchParams()
  const cat = params.get('cat') || ''
  const list = useMemo(() => {
    let l = DEMO_SALONS.filter(s => (s.name + s.area + s.city).toLowerCase().includes(q.toLowerCase()))
    if (cat) l = l.filter(s => s.services.some((sv: any) => sv[1] === cat))
    const withD = l.map(s => ({ ...s, d: distanceKm(27.176, 78.008, s.lat, s.lon) }))
    if (f === 'nearest') withD.sort((a, b) => a.d - b.d)
    if (f === 'rating') withD.sort((a, b) => b.rating - a.rating)
    if (f === 'price') withD.sort((a, b) => a.price - b.price)
    return withD
  }, [q, f, cat])
  return <Page title="सैलून खोजें" back="/">
    <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 सैलून / क्षेत्र खोजें…" className="w-full rounded-xl bg-card border border-gold/30 px-4 py-3 outline-none" />
    {cat && <p className="text-xs text-gold">श्रेणी: {cat} <Link to="/search" className="underline">हटाएँ</Link></p>}
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {([['nearest', 'नज़दीकी'], ['rating', 'सबसे रेटेड'], ['price', 'कम कीमत'], ['today', 'आज उपलब्ध'], ['offers', 'ऑफ़र']] as [Filter, string][]).map(([k, label]) => (
        <button key={k} onClick={() => setF(k)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${f === k ? 'gold-grad text-royal' : 'bg-charcoal'}`}>{label}</button>))}
      <button onClick={() => setView(view === 'list' ? 'map' : 'list')} className="shrink-0 rounded-full px-3 py-1.5 text-xs bg-charcoal">🗺 {view === 'list' ? 'मैप देखें' : 'लिस्ट देखें'}</button>
    </div>
    {view === 'map'
      ? <Card className="p-4 text-center text-sm text-ivory/70">🗺 मैप व्यू — {list.length} सैलून, Agra केंद्र से दूरी के साथ।<br />Google Maps इंटीग्रेशन के लिए VITE_GOOGLE_MAPS_API_KEY चाहिए (README देखें)।<br /><br />{list.slice(0, 5).map(s => <p key={s.id}>📍 {s.name} — {s.d} km</p>)}</Card>
      : <div className="space-y-3">{list.map(s => (
        <Link key={s.id} to={`/salon/${s.id}`}><Card className="flex">
          <img src={s.img} alt={s.name} className="w-28 h-28 object-cover" />
          <div className="p-3 flex-1">
            <div className="flex justify-between"><h3 className="font-bold">{s.name}</h3><span className="text-gold text-sm">★ {s.rating} ({s.reviews})</span></div>
            <p className="text-xs text-ivory/60">{s.area} • {s.d} km • {s.open}–{s.close}</p>
            <p className="text-xs text-ivory/60">स्टाफ़: {s.staff.map((st: any) => st[0]).join(', ')}</p>
            <p className="text-gold text-sm font-bold mt-1">₹{s.price} से शुरू • ऑफ़र उपलब्ध</p>
          </div>
        </Card></Link>))}
        {list.length === 0 && <p className="text-center text-ivory/50 text-sm py-8">कोई सैलून नहीं मिला।</p>}
      </div>}
  </Page>
}
""")

# ---------- Salon detail + booking wizard ----------
w("pages/customer/SalonDetail.tsx", """import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Page, Card, GoldButton } from '../../components/ui'
import { DEMO_SALONS } from '../../lib/demoData'
import { IMG } from '../../lib/images'
import { useApp } from '../../lib/store'

export default function SalonDetail() {
  const { id } = useParams()
  const salon: any = DEMO_SALONS.find(s => s.id === id) || DEMO_SALONS[0]
  const [staff, setStaff] = useState<string>('any')
  const [picked, setPicked] = useState<number[]>([0])
  const [date, setDate] = useState('2026-11-14')
  const [time, setTime] = useState('')
  const [step, setStep] = useState(1)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState<any>(null)
  const { addBooking, bookings } = useApp()
  const nav = useNavigate()
  const slots = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '16:00', '16:30', '17:00', '17:30', '18:00']
  const total = useMemo(() => picked.reduce((a, i) => a + (salon.services[i]?.[2] || 0), 0), [picked, salon])
  const fee = 10 // shown from app_settings in production; fallback ₹10
  const staffName = staff === 'any' ? 'Any Available Staff' : salon.staff.find((s: any) => s[0] === staff)?.[0]

  const confirmBooking = () => {
    if (confirming) return // idempotent: double-tap cannot create a duplicate
    setConfirming(true)
    // Slot-lock + double-booking guard lives in the create-booking Edge Function
    // (unique partial index, 409 on conflict). Here, demo mode:
    const clash = bookings.some(b => b.salonId === salon.id && b.date === date && b.time === time && b.status !== 'cancelled')
    if (clash) { alert('यह स्लॉट अभी-अभी बुक हो गया है — दूसरा समय चुनें।'); setConfirming(false); return }
    const token = bookings.filter(b => b.salonId === salon.id && b.date === date && b.status !== 'cancelled').length + 1
    const code = 'UHC' + Math.floor(100000 + Math.random() * 899999)
    const b = { id: 'b-' + Date.now(), code, salonId: salon.id, salonName: salon.name, staff: staffName,
      services: picked.map(i => salon.services[i][0]), date, time, token, fee, serviceTotal: total,
      status: 'pending' as const, paymentStatus: 'pending' as const, customer: 'Demo Customer', phone: '+91 98765 43210' }
    addBooking(b); setDone(b); setConfirming(false)
  }

  if (done) return <Page title="बुकिंग कन्फर्म" back="/">
    <Card className="p-6 text-center space-y-2">
      <div className="text-5xl">✅</div>
      <h2 className="font-display text-2xl font-bold gold-text">बुकिंग बन गई!</h2>
      <p className="text-sm">बुकिंग ID: <b>{done.code}</b></p>
      <p className="text-sm">टोकन नंबर: <b className="text-gold text-xl">#{done.token}</b> (आज का क्रम — {done.salonName})</p>
      <p className="text-sm">{done.salonName} • {done.staff}</p>
      <p className="text-sm">{done.services.join(', ')} • {done.date} {done.time}</p>
      <p className="text-sm">सेवा शुल्क ₹{done.serviceTotal} (सैलून पर) + बुकिंग शुल्क ₹{done.fee} (प्लेटफ़ॉर्म)</p>
      <p className="text-xs text-amber-200 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">
        ⚠ भुगतान अभी वेरिफ़ाई नहीं हुआ — डेमो में यह बुकिंग 'Payment Pending' है। असली ऐप में भुगतान केवल Razorpay/UPI गेटवे वेबहुक से वेरिफ़ाई होगा; स्क्रीनशॉट या 'Paid' टैप से कभी कन्फर्म नहीं होगा।</p>
      <GoldButton onClick={() => nav('/my-bookings')}>मेरी बुकिंग देखें</GoldButton>
    </Card>
  </Page>

  return <Page title={salon.name} back="/">
    <img src={salon.img} alt={salon.name} className="w-full h-52 object-cover rounded-2xl border border-gold/25" />
    <div className="flex justify-between items-start">
      <div><h1 className="font-display text-2xl font-bold">{salon.name}</h1>
      <p className="text-sm text-ivory/60">{salon.area}, {salon.city} • {salon.open}–{salon.close} • छुट्टी: {salon.holiday}</p></div>
      <span className="text-gold font-bold">★ {salon.rating} <span className="text-ivory/50 text-xs">({salon.reviews})</span></span>
    </div>
    <p className="text-xs text-ivory/60">मालिक: {salon.owner} • UPI: {salon.upi}</p>

    {step === 1 && <>
      <h2 className="font-bold">👨‍💼 स्टाफ़ चुनें</h2>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setStaff('any')} className={`rounded-2xl border p-3 text-left ${staff === 'any' ? 'border-gold bg-gold/10' : 'border-white/10 bg-card'}`}>
          <div className="text-3xl">🙋</div><p className="font-bold text-sm">Any Available Staff</p><p className="text-xs text-ivory/60">पहला उपलब्ध स्टाफ़</p></button>
        {salon.staff.map((st: any) => (
          <button key={st[0]} onClick={() => setStaff(st[0])} className={`rounded-2xl border p-3 text-left ${staff === st[0] ? 'border-gold bg-gold/10' : 'border-white/10 bg-card'}`}>
            <img src={IMG.barber} alt={st[0]} className="w-12 h-12 rounded-full object-cover" />
            <p className="font-bold text-sm mt-1">{st[0]}</p>
            <p className="text-xs text-ivory/60">{st[1]} वर्ष अनुभव • {st[2]}</p>
            <p className="text-gold text-xs">★ 4.{5 + (st[1] % 4)}</p></button>))}
      </div>
      <h2 className="font-bold">💇 सेवाएँ चुनें (कई चुन सकते हैं)</h2>
      <div className="space-y-2">
        {salon.services.map((sv: any, i: number) => (
          <button key={i} onClick={() => setPicked(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
            className={`w-full flex gap-3 rounded-2xl border p-3 text-left ${picked.includes(i) ? 'border-gold bg-gold/10' : 'border-white/10 bg-card'}`}>
            <img src={IMG.haircut} alt={sv[0]} className="w-14 h-14 rounded-xl object-cover" />
            <span className="flex-1"><b className="text-sm">{sv[0]}</b><br /><span className="text-xs text-ivory/60">{sv[1]} • {sv[3]} मिनट</span></span>
            <b className="text-gold">₹{sv[2]}</b>
          </button>))}
      </div>
      <GoldButton onClick={() => setStep(2)} disabled={picked.length === 0}>समय चुनें →</GoldButton>
    </>}

    {step === 2 && <>
      <h2 className="font-bold">📅 तारीख़ व समय</h2>
      <input type="date" value={date} min="2026-11-12" max="2026-11-21" onChange={e => setDate(e.target.value)}
        className="w-full rounded-xl bg-card border border-gold/30 px-4 py-3" />
      <div className="grid grid-cols-4 gap-2">
        {slots.map(s => <button key={s} onClick={() => setTime(s)} className={`rounded-xl py-2.5 text-sm font-bold ${time === s ? 'gold-grad text-royal' : 'bg-charcoal'}`}>{s}</button>)}
      </div>
      <GoldButton onClick={() => setStep(3)} disabled={!time}>सारांश देखें →</GoldButton>
      <button className="w-full text-gold text-sm" onClick={() => setStep(1)}>← वापस</button>
    </>}

    {step === 3 && <>
      <h2 className="font-bold">🧾 बुकिंग सारांश</h2>
      <Card className="p-4 space-y-1.5 text-sm">
        <p>सैलून: <b>{salon.name}</b> — {salon.area}, {salon.city}</p>
        <p>स्टाफ़: <b>{staffName}</b></p>
        <p>सेवाएँ: <b>{picked.map(i => salon.services[i][0]).join(', ')}</b></p>
        <p>तारीख़/समय: <b>{date} • {time}</b></p>
        <p>सेवा शुल्क (सैलून को): <b>₹{total}</b></p>
        <p>प्लेटफ़ॉर्म बुकिंग शुल्क: <b className="text-gold">₹{fee}</b> <span className="text-ivory/50 text-xs">(Super Admin द्वारा तय — सेवा शुल्क से अलग)</span></p>
        <p className="border-t border-white/10 pt-2">अभी भुगतान: <b className="text-gold">₹{fee}</b> (बुकिंग शुल्क) — सेवा शुल्क सैलून पर देय</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm font-bold mb-2">सैलून UPI QR — {salon.upi}</p>
        <div className="mx-auto w-40 h-40 rounded-xl bg-white grid place-items-center text-royal text-xs font-bold p-2">QR CODE<br />{salon.upi}<br />(असली QR: सैलून द्वारा अपलोड की गई इमेज यहाँ दिखेगी)</div>
        <p className="text-xs text-ivory/60 mt-2">₹{fee} का भुगतान करें, फिर UPI ट्रांज़ैक्शन रेफ़रेंस डालें। भुगतान की पुष्टि केवल गेटवे वेबहुक / सर्वर वेरिफिकेशन से होगी।</p>
        <input placeholder="UPI ट्रांज़ैक्शन रेफ़रेंस (वैकल्पिक)" className="w-full mt-3 rounded-xl bg-royal border border-gold/30 px-4 py-2.5 text-sm outline-none" />
      </Card>
      <GoldButton onClick={confirmBooking} disabled={confirming}>{confirming ? 'प्रोसेस हो रहा है…' : `बुकिंग कन्फर्म करें • ₹${fee}`}</GoldButton>
      <p className="text-[11px] text-ivory/40 text-center">स्लॉट भुगतान के दौरान अस्थायी रूप से लॉक रहता है; समय समाप्त होने पर स्वतः खुल जाता है। डबल-क्लिक से डुप्लिकेट बुकिंग नहीं बनेगी।</p>
      <button className="w-full text-gold text-sm" onClick={() => setStep(2)}>← वापस</button>
    </>}
    <div>
      <h2 className="font-bold mb-2">⭐ ग्राहक समीक्षाएँ</h2>
      <Card className="p-4 text-sm space-y-2">
        <p>★ ★ ★ ★ ★ “बेहतरीन फेड कट, स्टाफ़ बहुत विनम्र।” — Nitin V.</p>
        <p>★ ★ ★ ★ ☆ “समय पर टोकन मिला, साफ़-सुथरा सैलून।” — Rahul S.</p>
      </Card>
    </div>
  </Page>
}
""")

# ---------- My bookings / notifications / profile ----------
w("pages/customer/MyBookings.tsx", """import { useState } from 'react'
import { Page, Card, GoldButton } from '../../components/ui'
import { useApp } from '../../lib/store'

export default function MyBookings() {
  const { bookings, updateBooking } = useApp()
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'pending'>('upcoming')
  const [rated, setRated] = useState<Record<string, number>>({})
  const list = bookings.filter(b =>
    tab === 'upcoming' ? ['pending', 'confirmed', 'accepted'].includes(b.status)
    : tab === 'completed' ? b.status === 'completed'
    : tab === 'cancelled' ? ['cancelled', 'rejected'].includes(b.status)
    : b.status === 'pending')
  return <Page title="मेरी बुकिंग" back="/">
    <div className="flex gap-2">
      {([['upcoming', 'आगामी'], ['completed', 'पूरी हुई'], ['cancelled', 'रद्द'], ['pending', 'लंबित']] as const).map(([k, l]) => (
        <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-full py-2 text-xs font-bold ${tab === k ? 'gold-grad text-royal' : 'bg-charcoal'}`}>{l}</button>))}
    </div>
    {list.length === 0 && <p className="text-center text-ivory/50 text-sm py-10">इस श्रेणी में कोई बुकिंग नहीं।</p>}
    {list.map(b => (
      <Card key={b.id} className="p-4 space-y-1.5">
        <div className="flex justify-between"><b>{b.salonName}</b><span className="text-gold text-xs font-bold">{b.status.toUpperCase()}</span></div>
        <p className="text-sm text-ivory/70">{b.services.join(', ')} • {b.staff}</p>
        <p className="text-sm">{b.date} • {b.time} • टोकन <b className="text-gold">#{b.token}</b></p>
        <p className="text-xs text-ivory/60">बुकिंग ID {b.code} • भुगतान: {b.paymentStatus === 'verified' ? '✅ वेरिफ़ाइड' : '⏳ लंबित'} • शुल्क ₹{b.fee} + सेवा ₹{b.serviceTotal}</p>
        <div className="flex gap-2 pt-1">
          {['pending', 'confirmed', 'accepted'].includes(b.status) && <>
            <button onClick={() => updateBooking(b.id, { status: 'cancelled' })} className="flex-1 rounded-xl bg-red-500/20 border border-red-400/40 py-2 text-sm">रद्द करें</button>
            <button onClick={() => alert('Reschedule: नई तारीख़/समय चुनने के लिए सैलून पेज पर जाएँ (नीति अनुसार)।')} className="flex-1 rounded-xl bg-charcoal py-2 text-sm">पुनः शेड्यूल</button>
          </>}
          {b.status === 'completed' && <div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRated(r => ({ ...r, [b.id]: n }))} className="text-xl">{(rated[b.id] || 0) >= n ? '★' : '☆'}</button>))}</div>}
          <button onClick={() => alert(`रसीद — ${b.code}\\n${b.salonName} | ${b.date} ${b.time} | टोकन #${b.token}\\nसेवा ₹${b.serviceTotal} + बुकिंग शुल्क ₹${b.fee}`)} className="flex-1 rounded-xl bg-charcoal py-2 text-sm">🧾 रसीद</button>
        </div>
      </Card>))}
    <GoldButton to="/search">नई बुकिंग करें</GoldButton>
  </Page>
}
""")

w("pages/customer/Notifications.tsx", """import { Page, Card } from '../../components/ui'
import { useApp } from '../../lib/store'
export default function Notifications() {
  const { bookings, notifLog } = useApp()
  const items = [
    ...bookings.map(b => ({ title: `बुकिंग ${b.code}`, body: `${b.salonName} • ${b.date} ${b.time} • टोकन #${b.token} • स्थिति: ${b.status}` })),
    { title: 'ऑफ़र', body: 'पहली बुकिंग पर 20% छूट — Agra के सभी सैलून पर।' },
    ...notifLog.map(l => ({ title: 'सिस्टम', body: l })),
  ]
  return <Page title="सूचनाएँ" back="/">
    {items.map((n, i) => <Card key={i} className="p-4"><b className="text-sm">{n.title}</b><p className="text-sm text-ivory/70">{n.body}</p></Card>)}
  </Page>
}
""")

w("pages/customer/Profile.tsx", """import { Page, Card, GoldButton, RoleSwitcher } from '../../components/ui'
import { useApp } from '../../lib/store'
import { DEMO_MODE } from '../../lib/supabase'
export default function Profile() {
  const { phone, role, setRole } = useApp()
  return <Page title="प्रोफ़ाइल" back="/">
    <Card className="p-5 text-center">
      <div className="w-20 h-20 mx-auto rounded-full gold-grad grid place-items-center text-3xl text-royal font-bold">👤</div>
      <h2 className="font-bold text-lg mt-2">{phone ? '+91 ' + phone : 'अतिथि उपयोगकर्ता'}</h2>
      <p className="text-xs text-ivory/60">{DEMO_MODE ? 'डेमो मोड — Supabase कनेक्ट नहीं' : 'Supabase कनेक्टेड'}</p>
    </Card>
    <Card className="p-4 space-y-2 text-sm">
      <p>📍 सहेजे गए पते: Sanjay Place, Agra (डेमो)</p>
      <p>🌐 भाषा: हिंदी / English — होम पेज से बदलें</p>
      <p>🔔 नोटिफिकेशन: चालू</p>
    </Card>
    <div>
      <h2 className="font-bold mb-2">पैनल बदलें (एक ही ऐप, तीन रोल)</h2>
      <RoleSwitcher />
      <div className="flex gap-2 mt-3">
        {role === 'owner' && <GoldButton to="/owner">मालिक डैशबोर्ड खोलें</GoldButton>}
        {role === 'admin' && <GoldButton to="/admin">एडमिन डैशबोर्ड खोलें</GoldButton>}
        {role === 'customer' && <GoldButton to="/owner/register">सैलून रजिस्टर करें</GoldButton>}
      </div>
      <p className="text-xs text-ivory/50 mt-2">रोल बदलना केवल UI डेमो है — असली ऐप में रोल Supabase user_roles + RLS से तय होता है; एक रोल दूसरे की प्राइवेट जानकारी नहीं देख सकता।</p>
    </div>
    <GoldButton to="/auth">लॉगिन / OTP</GoldButton>
  </Page>
}
""")
print("customer done")
