import { useMemo, useState } from 'react'
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
