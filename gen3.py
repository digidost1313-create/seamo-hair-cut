import os
ROOT = os.path.expanduser("~/workspace/goals/unlimited-hair-cut-booking-marketplace/files/seamo-mobile-app/src")
def w(rel, s):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(s)

# ---------- Owner ----------
w("pages/owner/Register.tsx", """import { useState } from 'react'
import { Page, Card, GoldButton } from '../../components/ui'
export default function OwnerRegister() {
  const [done, setDone] = useState(false)
  const [f, setF] = useState({ owner: '', salon: '', phone: '', city: 'Agra', address: '', pincode: '', open: '09:00', close: '21:00', holiday: 'Monday', exp: '', staff: '', desc: '' })
  const set = (k: string) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }))
  const inp = "w-full rounded-xl bg-royal border border-gold/30 px-4 py-2.5 text-sm outline-none"
  if (done) return <Page title="रजिस्ट्रेशन" back="/owner">
    <Card className="p-6 text-center space-y-2">
      <div className="text-5xl">⏳</div>
      <h2 className="font-bold text-xl">रजिस्ट्रेशन जमा हुआ — <span className="text-gold">Pending Approval</span></h2>
      <p className="text-sm text-ivory/70">आपका सैलून “{f.salon}” Super Admin की मंज़ूरी के बाद ही ग्राहकों को दिखेगा। मंज़ूरी / अस्वीकृति पर आपको नोटिफिकेशन मिलेगा। तब तक आप प्रोफ़ाइल एडिट कर सकते हैं, पर बुकिंग नहीं मिलेगी।</p>
      <GoldButton to="/owner">डैशबोर्ड देखें</GoldButton>
    </Card>
  </Page>
  return <Page title="सैलून रजिस्टर करें" back="/profile">
    <Card className="p-5 space-y-3">
      <p className="text-xs text-amber-200 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">मोबाइल OTP से पहले लॉगिन करें (Auth पेज)। फ़ोटो कैमरा / गैलरी से अपलोड होंगी (Capacitor Camera)। GPS लोकेशन की अनुमति माँगी जाएगी।</p>
      {([['owner', 'मालिक का नाम'], ['salon', 'सैलून का नाम'], ['phone', 'मोबाइल नंबर'], ['address', 'पूरा पता'], ['pincode', 'PIN कोड'], ['exp', 'अनुभव (वर्ष)'], ['staff', 'कर्मचारियों की संख्या']] as const).map(([k, l]) => (
        <div key={k}><label className="text-xs text-ivory/60">{l}</label><input value={(f as any)[k]} onChange={set(k)} className={inp} /></div>))}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-ivory/60">शहर</label><select value={f.city} onChange={set('city')} className={inp}>{['Agra', 'Mathura', 'Vrindavan', 'Firozabad', 'Aligarh'].map(c => <option key={c}>{c}</option>)}</select></div>
        <div><label className="text-xs text-ivory/60">राज्य</label><input value="Uttar Pradesh" disabled className={inp} /></div>
        <div><label className="text-xs text-ivory/60">खुलने का समय</label><input type="time" value={f.open} onChange={set('open')} className={inp} /></div>
        <div><label className="text-xs text-ivory/60">बंद होने का समय</label><input type="time" value={f.close} onChange={set('close')} className={inp} /></div>
      </div>
      <div><label className="text-xs text-ivory/60">साप्ताहिक छुट्टी</label><select value={f.holiday} onChange={set('holiday')} className={inp}>{['None', 'Monday', 'Tuesday', 'Sunday'].map(c => <option key={c}>{c}</option>)}</select></div>
      <div><label className="text-xs text-ivory/60">सैलून विवरण</label><textarea value={f.desc} onChange={set('desc')} rows={3} className={inp} /></div>
      <div className="grid grid-cols-3 gap-2">
        {['लोगो', 'कवर फ़ोटो', 'गैलरी फ़ोटो'].map(l => <button key={l} type="button" onClick={() => alert('Capacitor Camera: कैमरा / गैलरी से फ़ोटो चुनें — असली डिवाइस पर काम करेगा।')} className="rounded-xl border border-dashed border-gold/50 py-4 text-xs text-gold">📷 {l}</button>)}
      </div>
      <GoldButton onClick={() => setDone(true)}>रजिस्ट्रेशन जमा करें</GoldButton>
    </Card>
  </Page>
}
""")

w("pages/owner/Dashboard.tsx", """import { Link } from 'react-router-dom'
import { Page, Card, GoldButton } from '../../components/ui'
import { useApp } from '../../lib/store'
export default function OwnerDashboard() {
  const { bookings } = useApp()
  const today = bookings.filter(b => b.date === '2026-11-14')
  const stat = (label: string, v: number | string) => (
    <Card className="p-3 text-center"><p className="text-2xl font-bold gold-text">{v}</p><p className="text-[11px] text-ivory/60">{label}</p></Card>)
  return <Page title="मालिक डैशबोर्ड">
    <Card className="p-4 gold-grad text-royal">
      <b>Royal Fade Studio</b><p className="text-xs">✅ Approved • सदस्यता: ₹499/माह — सक्रिय (अगला नवीनीकरण 6 Dec 2026)</p>
      <p className="text-xs">Grace period: भुगतान विफल होने पर 3 दिन, फिर बुकिंग रुक जाएगी।</p>
    </Card>
    <div className="grid grid-cols-3 gap-2">
      {stat('आज की बुकिंग', today.length + 3)}{stat('लंबित', bookings.filter(b => b.status === 'pending').length)}
      {stat('कन्फर्म', bookings.filter(b => b.status === 'accepted').length)}{stat('पूरी हुई', 12)}
      {stat('रद्द', 2)}{stat('कुल ग्राहक', 148)}
    </div>
    <Card className="p-4">
      <b className="text-sm">📊 इस माह की बुकिंग (चार्ट)</b>
      <div className="flex items-end gap-1 h-24 mt-3">{[4, 7, 5, 9, 6, 11, 8].map((h, i) => (
        <div key={i} className="flex-1 gold-grad rounded-t" style={{ height: `${h * 9}%` }} />))}</div>
      <p className="text-[11px] text-ivory/50 mt-1">पिछले 7 दिन • लोकप्रिय सेवा: Classic Haircut • टॉप स्टाफ़: Imran Khan (★4.8)</p>
    </Card>
    <div className="grid grid-cols-2 gap-2">
      <Link to="/owner/bookings"><Card className="p-4 text-center">📋<br /><b className="text-sm">बुकिंग प्रबंधन</b></Card></Link>
      <Link to="/owner/tokens"><Card className="p-4 text-center">🎟<br /><b className="text-sm">टोकन सिस्टम</b></Card></Link>
      <Link to="/owner/staff"><Card className="p-4 text-center">👨‍💼<br /><b className="text-sm">स्टाफ़</b></Card></Link>
      <Link to="/owner/services"><Card className="p-4 text-center">💇<br /><b className="text-sm">सेवाएँ व ऑफ़र</b></Card></Link>
      <Link to="/owner/payments"><Card className="p-4 text-center">💳<br /><b className="text-sm">UPI / QR</b></Card></Link>
      <Link to="/owner/voice"><Card className="p-4 text-center">🔔<br /><b className="text-sm">वॉइस अलर्ट</b></Card></Link>
    </div>
    <GoldButton to="/owner/subscription">सदस्यता — ₹499/माह • Razorpay</GoldButton>
  </Page>
}
""")

w("pages/owner/Bookings.tsx", """import { Page, Card } from '../../components/ui'
import { useApp } from '../../lib/store'
export default function OwnerBookings() {
  const { bookings, updateBooking, logNotif } = useApp()
  const act = (id: string, status: any, label: string) => { updateBooking(id, { status }); logNotif(`बुकिंग ${label} की गई`) }
  return <Page title="बुकिंग प्रबंधन" back="/owner">
    {bookings.map(b => (
      <Card key={b.id} className="p-4 space-y-1.5">
        <div className="flex justify-between"><b>{b.customer}</b><span className="text-gold text-xs font-bold">{b.status}</span></div>
        <p className="text-sm text-ivory/70">{b.services.join(', ')} • {b.staff}</p>
        <p className="text-sm">{b.date} • {b.time} • टोकन <b className="text-gold">#{b.token}</b> • {b.code}</p>
        <p className="text-xs text-ivory/60">📞 {b.phone} • भुगतान: {b.paymentStatus === 'verified' ? '✅ वेरिफ़ाइड' : '⏳ लंबित'} • शुल्क ₹{b.fee}</p>
        <div className="flex gap-2 pt-1 flex-wrap">
          {b.status === 'pending' && <>
            <button onClick={() => act(b.id, 'accepted', 'स्वीकृत')} className="flex-1 rounded-xl gold-grad text-royal font-bold py-2 text-sm">✔ स्वीकार करें</button>
            <button onClick={() => { const r = prompt('अस्वीकृति का कारण:'); if (r) act(b.id, 'rejected', 'अस्वीकृत') }} className="flex-1 rounded-xl bg-red-500/20 border border-red-400/40 py-2 text-sm">✖ अस्वीकार करें</button>
          </>}
          {b.status === 'accepted' && <button onClick={() => act(b.id, 'in_progress', 'शुरू')} className="flex-1 rounded-xl bg-charcoal py-2 text-sm">▶ सेवा शुरू करें</button>}
          {b.status === 'in_progress' && <button onClick={() => act(b.id, 'completed', 'पूरी')} className="flex-1 rounded-xl gold-grad text-royal font-bold py-2 text-sm">✓ पूर्ण करें</button>}
        </div>
      </Card>))}
    <p className="text-xs text-ivory/50 text-center">स्थितियाँ: Payment Pending → New → Confirmed → Accepted → In Progress → Completed / Rejected / Cancelled. हर बदलाव ग्राहक ऐप में तुरंत (Supabase Realtime) दिखता है।</p>
  </Page>
}
""")

w("pages/owner/Tokens.tsx", """import { useState } from 'react'
import { Page, Card, GoldButton } from '../../components/ui'
import { useApp } from '../../lib/store'
export default function Tokens() {
  const { bookings, updateBooking } = useApp()
  const [current, setCurrent] = useState(3)
  const [paused, setPaused] = useState(false)
  const today = bookings.filter(b => b.date === '2026-11-14' && b.status !== 'cancelled')
  return <Page title="टोकन सिस्टम" back="/owner">
    <Card className="p-6 text-center">
      <p className="text-sm text-ivory/60">वर्तमान टोकन (आज — Royal Fade Studio)</p>
      <p className="text-6xl font-bold gold-text">#{current}</p>
      <p className="text-sm mt-1">अगला टोकन: #{current + 1} • अनुमानित प्रतीक्षा: ~{(today.length - current) * 15} मिनट</p>
      <p className="text-xs text-ivory/50 mt-1">टोकन हर दिन सैलून के स्थानीय व्यावसायिक दिन के अनुसार रीसेट होते हैं; रद्द बुकिंग का टोकन दोबारा इस्तेमाल नहीं होता।</p>
    </Card>
    <div className="grid grid-cols-2 gap-2">
      <GoldButton onClick={() => setCurrent(c => c + 1)}>अगला टोकन बुलाएँ →</GoldButton>
      <button onClick={() => setPaused(p => !p)} className="rounded-xl bg-charcoal py-3 font-bold text-sm">{paused ? '▶ सेवा फिर शुरू करें' : '⏸ टोकन रोकें'}</button>
    </div>
    {today.map(b => (
      <Card key={b.id} className="p-4 flex justify-between items-center">
        <div><b>टोकन #{b.token} — {b.customer}</b><p className="text-xs text-ivory/60">{b.services.join(', ')} • {b.time} • {b.status}</p></div>
        <div className="flex gap-1">
          <button onClick={() => updateBooking(b.id, { status: 'accepted' })} className="rounded-lg bg-charcoal px-2 py-1 text-xs">आ गया</button>
          <button onClick={() => updateBooking(b.id, { status: 'in_progress' })} className="rounded-lg bg-charcoal px-2 py-1 text-xs">सेवा में</button>
          <button onClick={() => updateBooking(b.id, { status: 'completed' })} className="rounded-lg gold-grad text-royal px-2 py-1 text-xs font-bold">पूर्ण</button>
        </div>
      </Card>))}
  </Page>
}
""")

w("pages/owner/StaffServices.tsx", """import { useState } from 'react'
import { Page, Card, GoldButton } from '../../components/ui'
import { DEMO_SALONS } from '../../lib/demoData'
export default function StaffServices({ kind }: { kind: 'staff' | 'services' }) {
  const salon = DEMO_SALONS[0]
  const [list, setList] = useState<any[]>(kind === 'staff' ? salon.staff.map((s: any) => ({ name: s[0], exp: s[1], skill: s[2], active: true })) : salon.services.map((s: any) => ({ name: s[0], cat: s[1], price: s[2], dur: s[3], active: true })))
  const [name, setName] = useState('')
  const add = () => { if (!name.trim()) return; setList(p => [...p, kind === 'staff' ? { name, exp: 2, skill: 'Haircut', active: true } : { name, cat: 'Haircut', price: 150, dur: 30, active: true }]); setName('') }
  return <Page title={kind === 'staff' ? 'स्टाफ़ प्रबंधन' : 'सेवाएँ व ऑफ़र'} back="/owner">
    <Card className="p-4 flex gap-2">
      <input value={name} onChange={e => setName(e.target.value)} placeholder={kind === 'staff' ? 'स्टाफ़ का नाम' : 'सेवा का नाम'} className="flex-1 rounded-xl bg-royal border border-gold/30 px-3 py-2 text-sm outline-none" />
      <button onClick={add} className="gold-grad text-royal font-bold rounded-xl px-4 text-sm">+ जोड़ें</button>
    </Card>
    {list.map((it, i) => (
      <Card key={i} className="p-4 flex justify-between items-center">
        <div><b className="text-sm">{it.name}</b><p className="text-xs text-ivory/60">{kind === 'staff' ? `${it.exp} वर्ष • ${it.skill} • कार्यदिवस: Mon–Sat • ब्रेक 14:00–15:00` : `${it.cat} • ₹${it.price} • ${it.dur} मिनट`}</p></div>
        <button onClick={() => setList(p => p.map((x, j) => j === i ? { ...x, active: !x.active } : x))} className={`rounded-full px-3 py-1 text-xs font-bold ${it.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{it.active ? 'सक्रिय' : 'बंद'}</button>
      </Card>))}
    {kind === 'services' && <Card className="p-4 space-y-2 text-sm">
      <b>🎁 ऑफ़र बनाएँ</b>
      <p className="text-ivory/70">पहली बुकिंग • वीकेंड • त्योहार • कॉम्बो — % या ₹ छूट, फ़ोटो, शुरू/समाप्ति तारीख़, लागू सेवाएँ।</p>
      <div className="flex gap-2"><input placeholder="ऑफ़र शीर्षक" className="flex-1 rounded-xl bg-royal border border-gold/30 px-3 py-2 text-sm outline-none" /><input placeholder="20%" className="w-20 rounded-xl bg-royal border border-gold/30 px-3 py-2 text-sm outline-none" /></div>
      <GoldButton onClick={() => alert('ऑफ़र सहेजा गया (डेमो) — असली ऐप में तुरंत ग्राहक ऐप में दिखेगा।')}>ऑफ़र प्रकाशित करें</GoldButton>
    </Card>}
    <p className="text-xs text-ivory/50 text-center">सेवाएँ सहेजते ही ग्राहक ऐप में दिखती हैं (Supabase Realtime)। प्लान सीमा के अनुसार स्टाफ़ जोड़ें।</p>
  </Page>
}
""")

w("pages/owner/Payments.tsx", """import { Page, Card, GoldButton } from '../../components/ui'
export default function OwnerPayments() {
  return <Page title="UPI / QR सेटिंग" back="/owner">
    <Card className="p-5 text-center space-y-2">
      <p className="text-sm font-bold">UPI ID: seamo1@okhdfcbank</p>
      <div className="mx-auto w-44 h-44 rounded-xl bg-white grid place-items-center text-royal text-xs font-bold p-2">QR CODE<br />seamo1@okhdfcbank</div>
      <p className="text-xs text-ivory/60">ग्राहक बुकिंग के समय यही QR देखता है। QR बदलने पर नया QR तुरंत लागू होता है।</p>
      <GoldButton onClick={() => alert('Capacitor Camera: नया QR अपलोड करें (गैलरी/कैमरा)।')}>QR बदलें / अपलोड करें</GoldButton>
    </Card>
    <Card className="p-4 text-sm space-y-1">
      <b>⚠ भुगतान सत्यता नियम</b>
      <p className="text-ivory/70">ग्राहक का 'Paid' टैप या स्क्रीनशॉट भुगतान की पुष्टि नहीं है। पुष्टि केवल UPI/गेटवे वेबहुक या सर्वर वेरिफिकेशन से होती है। ₹10 बुकिंग शुल्क प्लेटफ़ॉर्म का है; सेवा शुल्क सैलून का है — दोनों अलग दिखाए जाते हैं।</p>
    </Card>
  </Page>
}
""")

w("pages/owner/VoiceSettings.tsx", """import { Page, Card, GoldButton } from '../../components/ui'
import { useApp } from '../../lib/store'
export default function VoiceSettings() {
  const { voice, setVoice, logNotif, notifLog } = useApp()
  const row = (label: string, desc: string, key: keyof typeof voice) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <div><b className="text-sm">{label}</b><p className="text-xs text-ivory/60">{desc}</p></div>
      <button onClick={() => setVoice({ [key]: !voice[key] })} className={`w-12 h-7 rounded-full ${voice[key] ? 'gold-grad' : 'bg-charcoal'}`}><span className={`block w-6 h-6 rounded-full bg-white transition-all ${voice[key] ? 'ml-5' : 'ml-1'}`} /></button>
    </div>)
  const test = () => {
    const msg = 'Attention! New booking received. Customer Nitin Verma has booked Haircut for 10 November at 10 AM. Token number 4. Please check your booking.'
    logNotif('Test alert sent — ' + (voice.loud ? 'LOUD sound + repeat until acknowledged' : 'normal sound') + (voice.vibrate ? ' + vibration' : ''))
    if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(msg); u.lang = 'en-IN'; speechSynthesis.speak(u) }
    alert('🔔 टेस्ट अलर्ट भेजा गया।\n\n"' + msg + '"\n\nअसली Android पर यह FCM high-importance चैनल + नेटिव TextToSpeech से बजेगा, ऐप बंद होने पर भी।')
  }
  return <Page title="वॉइस अलर्ट सेटिंग" back="/owner">
    <Card className="p-4">
      <b className="text-sm">🔊 साउंड-बॉक्स अलर्ट (Voice Box)</b>
      {row('वॉइस अनाउंसमेंट', 'नई बुकिंग पर आवाज़ में विवरण सुनाएँ', 'enabled')}
      {row('तेज़ आवाज़ (Loud)', 'High-importance चैनल, अधिकतम वॉल्यूम', 'loud')}
      {row('स्वीकृति तक दोहराएँ', 'जब तक मालिक स्वीकार न करे, अलर्ट दोहराएँ', 'repeat')}
      {row('वाइब्रेशन', 'अलर्ट के साथ वाइब्रेशन', 'vibrate')}
    </Card>
    <GoldButton onClick={test}>🔔 टेस्ट नोटिफिकेशन भेजें</GoldButton>
    <Card className="p-4 text-sm space-y-1">
      <b>तकनीकी नोट</b>
      <p className="text-ivory/70">Android: FCM high-importance NotificationChannel + नेटिव FirebaseMessagingService + TextToSpeech (देखें android/ Java-Kotlin कोड)। ब्राउज़र JS / WebSocket पर निर्भर नहीं — ऐप बंद होने पर भी डिलीवर होता है।</p>
      <p className="text-ivory/70">सीमाएँ (ईमानदारी से): Android बैकग्राउंड ऑडियो व बैटरी ऑप्टिमाइज़ेशन वॉइस को रोक सकते हैं — मालिक को Battery Optimization से ऐप को छूट देने को कहें। iOS पर Apple नोटिफिकेशन व Focus प्रतिबंध लागू होते हैं।</p>
    </Card>
    <div>
      <b className="text-sm">📜 नोटिफिकेशन इतिहास</b>
      {notifLog.map((l, i) => <Card key={i} className="p-3 mt-2 text-xs text-ivory/70">{l}</Card>)}
    </div>
  </Page>
}
""")

w("pages/owner/Subscription.tsx", """import { Page, Card, GoldButton } from '../../components/ui'
export default function OwnerSubscription() {
  return <Page title="सदस्यता" back="/owner">
    <Card className="p-5 space-y-2">
      <h2 className="font-display text-xl font-bold gold-text">SEAMO BASIC PLAN</h2>
      <p className="text-2xl font-bold">₹499 <span className="text-sm text-ivory/60">/ माह</span></p>
      <p className="text-sm text-ivory/70">अनलिमिटेड सेवाएँ • अनलिमिटेड बुकिंग • साउंड-बॉक्स अलर्ट • डैशबोर्ड • स्टाफ़ प्रबंधन</p>
      <p className="text-sm">स्थिति: <b className="text-green-400">सक्रिय</b> • अगला नवीनीकरण: 6 Dec 2026 • Grace: 3 दिन</p>
      <GoldButton onClick={() => alert('Razorpay Subscriptions: असली ऐप में सर्वर create-subscription से सब्सक्रिप्शन बनेगा और वेबहुक से सक्रिय होगा। Razorpay keys अभी कनेक्ट नहीं हैं (डेमो)।')}>Razorpay से नवीनीकृत करें</GoldButton>
      <p className="text-xs text-ivory/50">वार्षिक प्लान व फ्री ट्रायल Super Admin द्वारा तय होते हैं। भुगतान की पुष्टि केवल Razorpay वेबहुक (HMAC) से होती है।</p>
    </Card>
  </Page>
}
""")

w("pages/owner/More.tsx", """import { Page, Card } from '../../components/ui'
import { Link } from 'react-router-dom'
export default function OwnerMore() {
  return <Page title="मालिक सेटिंग" back="/owner">
    {[['/owner/register', '✏️ सैलून प्रोफ़ाइल एडिट करें'], ['/owner/payments', '💳 UPI / QR सेटिंग'], ['/owner/voice', '🔔 वॉइस अलर्ट सेटिंग'], ['/owner/subscription', '💰 सदस्यता'], ['/admin', '🛡 (डेमो) एडमिन पैनल देखें']].map(([to, l]) => (
      <Link key={to} to={to}><Card className="p-4 mb-2 text-sm font-bold">{l}</Card></Link>))}
    <Card className="p-4 text-sm text-ivory/70">सहायता: support@seamo.in (डेमो) • टिकट बनाने के लिए एडमिन पैनल → Support देखें।</Card>
  </Page>
}
""")

# ---------- Admin ----------
ADMIN_STATS = [
  ("कुल ग्राहक", "1,284"), ("कुल सैलून", "10"), ("सक्रिय सैलून", "9"), ("लंबित सैलून", "1"),
  ("निलंबित", "0"), ("कुल स्टाफ़", "20"), ("कुल बुकिंग", "342"), ("आज की बुकिंग", "27"),
  ("पूरी बुकिंग", "298"), ("रद्द", "17"), ("प्लेटफ़ॉर्म राजस्व (वेरिफ़ाइड ₹10 शुल्क)", "₹2,140"),
  ("सब्सक्रिप्शन राजस्व", "₹4,491"), ("सक्रिय सदस्यता", "9"), ("समाप्त सदस्यता", "1"),
]
w("pages/admin/Dashboard.tsx", """import { Link } from 'react-router-dom'
import { Page, Card } from '../../components/ui'
const STATS: [string, string][] = """ + repr(ADMIN_STATS).replace("'", '"') + """
export default function AdminDashboard() {
  return <Page title="Super Admin">
    <Card className="p-4 gold-grad text-royal"><b>Super Admin — पूर्ण नियंत्रण</b><p className="text-xs">केवल अधिकृत एडमिन। हर बदलाव Audit Log में दर्ज होता है।</p></Card>
    <div className="grid grid-cols-2 gap-2">
      {STATS.map(([l, v]) => <Card key={l} className="p-3"><p className="text-lg font-bold gold-text">{v}</p><p className="text-[11px] text-ivory/60">{l}</p></Card>)}
    </div>
    <Card className="p-4 text-sm"><b>🏆 टॉप सैलून:</b> Royal Fade Studio (58 बुकिंग) • The Golden Scissor (41)<br /><b>💇 लोकप्रिय सेवा:</b> Classic Haircut • <b>🏙 शहरवार:</b> Agra 10 सैलून, Mathura 0, Vrindavan 0 (विस्तार बाकी)</Card>
    <div className="grid grid-cols-2 gap-2">
      {[['/admin/salons', '✂️ सैलून प्रबंधन'], ['/admin/customers', '👥 ग्राहक'], ['/admin/bookings', '📋 बुकिंग'], ['/admin/finance', '💰 वित्त / रिपोर्ट'], ['/admin/plans', '💳 प्लान व शुल्क'], ['/admin/banners', '📣 बैनर / शहर'], ['/admin/push', '🔔 पुश नोटिफिकेशन'], ['/admin/tickets', '🎫 सपोर्ट टिकट'], ['/admin/settings', '⚙️ प्लेटफ़ॉर्म सेटिंग'], ['/admin/audit', '📜 ऑडिट लॉग']].map(([to, l]) => (
        <Link key={to} to={to}><Card className="p-4 text-center text-sm font-bold">{l}</Card></Link>))}
    </div>
    <p className="text-xs text-ivory/50 text-center">राजस्व में केवल वेरिफ़ाइड ₹10 प्लेटफ़ॉर्म शुल्क + सब्सक्रिप्शन गिने जाते हैं — सैलून के सीधे UPI QR संग्रह को SEAMO राजस्व नहीं गिना जाता।</p>
  </Page>
}
""")

w("pages/admin/Manage.tsx", """import { useState } from 'react'
import { Page, Card, GoldButton } from '../../components/ui'
import { DEMO_SALONS } from '../../lib/demoData'
import { useApp } from '../../lib/store'

export function AdminSalons() {
  const [q, setQ] = useState('')
  const [list, setList] = useState(DEMO_SALONS.map((s: any) => ({ ...s, status: s.id === 'salon-10' ? 'pending' : 'approved' })))
  return <Page title="सैलून प्रबंधन" back="/admin">
    <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 सैलून / शहर खोजें…" className="w-full rounded-xl bg-card border border-gold/30 px-4 py-3 outline-none" />
    {list.filter(s => s.name.toLowerCase().includes(q.toLowerCase())).map(s => (
      <Card key={s.id} className="p-4">
        <div className="flex justify-between"><b>{s.name}</b><span className={`text-xs font-bold ${s.status === 'approved' ? 'text-green-400' : 'text-amber-300'}`}>{s.status === 'approved' ? '✅ Approved' : '⏳ Pending'}</span></div>
        <p className="text-xs text-ivory/60">{s.area}, {s.city} • मालिक {s.owner} • UPI {s.upi} • सदस्यता ₹499/माह</p>
        <div className="flex gap-2 mt-2">
          {s.status === 'pending' && <button onClick={() => setList(p => p.map(x => x.id === s.id ? { ...x, status: 'approved' } : x))} className="flex-1 rounded-xl gold-grad text-royal font-bold py-2 text-xs">✔ मंज़ूर करें</button>}
          <button onClick={() => setList(p => p.map(x => x.id === s.id ? { ...x, status: x.status === 'suspended' ? 'approved' : 'suspended' } : x))} className="flex-1 rounded-xl bg-charcoal py-2 text-xs">{s.status === 'suspended' ? 'फिर सक्रिय करें' : 'निलंबित करें'}</button>
          <button onClick={() => alert(`सैलून विवरण — ${s.name}\\nफ़ोटो, स्टाफ़, सेवाएँ, पता व QR एडमिन देख सकता है।`)} className="flex-1 rounded-xl bg-charcoal py-2 text-xs">विवरण</button>
        </div>
      </Card>))}
  </Page>
}
export function AdminCustomers() {
  return <Page title="ग्राहक प्रबंधन" back="/admin">
    {['Nitin Verma — +91 98765 43210 — 12 बुकिंग', 'Rahul Sharma — +91 91234 56780 — 8 बुकिंग', 'Priya Singh — +91 99887 76655 — 5 बुकिंग'].map((c, i) => (
      <Card key={i} className="p-4 flex justify-between items-center"><span className="text-sm">{c}</span>
        <button onClick={() => alert('धोखाधड़ी वाले खाते को ब्लॉक/अनब्लॉक — कारण Audit Log में दर्ज होगा।')} className="rounded-full bg-red-500/20 text-red-300 px-3 py-1 text-xs font-bold">ब्लॉक</button></Card>))}
    <p className="text-xs text-ivory/50 text-center">ग्राहक की बुकिंग हिस्ट्री व शिकायतें यहाँ से देखी जा सकती हैं।</p>
  </Page>
}
export function AdminBookings() {
  const { bookings } = useApp()
  return <Page title="सभी बुकिंग" back="/admin">
    <p className="text-xs text-ivory/60">फ़िल्टर: तारीख़ • सैलून • ग्राहक • स्टाफ़ • शहर • स्थिति • भुगतान स्थिति (डेमो में सूची नीचे है)</p>
    {bookings.map(b => <Card key={b.id} className="p-4 text-sm"><b>{b.code}</b> — {b.salonName} • {b.customer} • {b.date} {b.time} • टोकन #{b.token} • {b.status} • भुगतान {b.paymentStatus}</Card>)}
  </Page>
}
export function AdminFinance() {
  const csv = () => {
    const rows = [['booking_code', 'salon', 'fee_inr', 'payment_status'], ['UHC842486', 'Royal Fade Studio', '10', 'verified']]
    const blob = new Blob([rows.map(r => r.join(',')).join('\\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'seamo-finance.csv'; a.click()
  }
  return <Page title="वित्त / रिपोर्ट" back="/admin">
    <Card className="p-4 space-y-1 text-sm">
      <p>वेरिफ़ाइड प्लेटफ़ॉर्म बुकिंग शुल्क: <b className="text-gold">₹2,140</b> (214 × ₹10)</p>
      <p>सब्सक्रिप्शन राजस्व: <b className="text-gold">₹4,491</b> (9 × ₹499)</p>
      <p>भुगतान विफल: 3 • रिफ़ंड: ₹20 • लंबित वेरिफिकेशन: 2</p>
      <p className="text-xs text-ivory/60">सैलून QR से सीधे मिले पैसे SEAMO राजस्व में नहीं गिने जाते — वे सैलून के हैं।</p>
    </Card>
    <GoldButton onClick={csv}>📥 CSV रिपोर्ट डाउनलोड करें</GoldButton>
    <GoldButton onClick={() => alert('Excel (.xlsx) एक्सपोर्ट — सर्वर रिपोर्ट फ़ंक्शन से (SheetJS), डेमो में CSV ही उपलब्ध।')}>📥 Excel रिपोर्ट</GoldButton>
  </Page>
}
export function AdminPlans() {
  return <Page title="प्लान व बुकिंग शुल्क" back="/admin">
    <Card className="p-4 space-y-3 text-sm">
      <div><label className="text-xs text-ivory/60">प्लेटफ़ॉर्म बुकिंग शुल्क (₹) — app_settings से, हार्डकोड नहीं</label>
        <input defaultValue={10} type="number" className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-2.5 mt-1" /></div>
      <div><label className="text-xs text-ivory/60">मासिक प्लान (₹)</label><input defaultValue={499} type="number" className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-2.5 mt-1" /></div>
      <div><label className="text-xs text-ivory/60">वार्षिक प्लान (₹)</label><input defaultValue={4990} type="number" className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-2.5 mt-1" /></div>
      <div><label className="text-xs text-ivory/60">फ्री ट्रायल (दिन) • Grace period (दिन)</label>
        <div className="flex gap-2 mt-1"><input defaultValue={7} type="number" className="flex-1 rounded-xl bg-royal border border-gold/30 px-4 py-2.5" /><input defaultValue={3} type="number" className="flex-1 rounded-xl bg-royal border border-gold/30 px-4 py-2.5" /></div></div>
      <GoldButton onClick={() => alert('सेटिंग सहेजी गई (डेमो) — असली ऐप में app_settings अपडेट + Audit Log।')}>सहेजें</GoldButton>
      <p className="text-xs text-ivory/50">प्रोमो शुल्क / फ्री बुकिंग अभियान / रिफ़ंड नीति / रद्दीकरण नियम / वैकल्पिक कमीशन भी यहीं से तय होते हैं।</p>
    </Card>
  </Page>
}
export function AdminBanners() {
  return <Page title="बैनर / शहर" back="/admin">
    <Card className="p-4 space-y-2 text-sm">
      <b>📣 प्लेटफ़ॉर्म बैनर व ऑफ़र</b>
      <input placeholder="बैनर शीर्षक" className="w-full rounded-xl bg-royal border border-gold/30 px-3 py-2 outline-none" />
      <input placeholder="छूट % / ₹" className="w-full rounded-xl bg-royal border border-gold/30 px-3 py-2 outline-none" />
      <div className="flex gap-2"><input type="date" className="flex-1 rounded-xl bg-royal border border-gold/30 px-3 py-2" /><input type="date" className="flex-1 rounded-xl bg-royal border border-gold/30 px-3 py-2" /></div>
      <GoldButton onClick={() => alert('बैनर प्रकाशित (डेमो)।')}>प्रकाशित करें</GoldButton>
    </Card>
    <Card className="p-4 text-sm"><b>🏙 शहर प्रबंधन</b><p className="text-ivory/70 mt-1">Agra • Mathura • Vrindavan • अन्य UP शहर — राज्य, ज़िला, PIN कोड व सेवा क्षेत्र जोड़ें/बदलें।</p></Card>
  </Page>
}
export function AdminPush() {
  const { logNotif } = useApp()
  return <Page title="पुश नोटिफिकेशन" back="/admin">
    <Card className="p-4 space-y-2 text-sm">
      <b>लक्षित समूह:</b>
      <div className="flex gap-2 flex-wrap">{['सभी ग्राहक', 'सभी मालिक', 'Agra', 'Mathura', 'चुने हुए सैलून'].map(g => <span key={g} className="rounded-full bg-charcoal px-3 py-1 text-xs">{g}</span>)}</div>
      <textarea placeholder="संदेश लिखें…" rows={3} className="w-full rounded-xl bg-royal border border-gold/30 px-3 py-2 outline-none" />
      <GoldButton onClick={() => { logNotif('एडमिन पुश भेजा गया (डेमो)'); alert('पुश भेजा गया (डेमो) — असली ऐप में FCM fan-out Edge Function से डिलीवरी लॉग के साथ।') }}>भेजें</GoldButton>
    </Card>
  </Page>
}
export function AdminTickets() {
  return <Page title="सपोर्ट टिकट" back="/admin">
    {[['भुगतान विवाद', 'UHC842486 — शुल्क दो बार कटा?', 'open'], ['बुकिंग समस्या', 'स्लॉट नहीं मिला', 'in_progress'], ['सैलून शिकायत', 'देर से सेवा', 'open']].map(([c, s, st]) => (
      <Card key={s} className="p-4"><b className="text-sm">{c}</b><p className="text-sm text-ivory/70">{s}</p><p className="text-xs text-gold">{st} • असाइन / जवाब / बंद करें</p></Card>))}
  </Page>
}
export function AdminSettings() {
  return <Page title="प्लेटफ़ॉर्म सेटिंग" back="/admin">
    <Card className="p-4 space-y-2 text-sm">
      <p>ऐप लोगो / ब्रांड: <b>SEAMO HAIR CUT</b></p>
      <p>बुकिंग शुल्क: ₹10 • सदस्यता: ₹499/माह • रद्दीकरण नीति: बुकिंग से 2 घंटे पहले तक मुफ्त रद्द</p>
      <p>गेटवे: Razorpay • नोटिफिकेशन: FCM • रखरखाव मोड: बंद</p>
      <p>संपर्क: support@seamo.in • गोपनीयता नीति / शर्तें — ऐप में लिंक की जाएँगी।</p>
    </Card>
  </Page>
}
export function AdminAudit() {
  return <Page title="ऑडिट लॉग" back="/admin">
    {['2026-11-12 10:15 — admin@seamo — salon approve — salon-10 — pending → approved',
      '2026-11-12 09:40 — admin@seamo — booking_fee — 10 → 10 (no change)',
      '2026-11-11 18:02 — admin@seamo — subscription plan edit — ₹499'].map((l, i) => (
      <Card key={i} className="p-3 text-xs text-ivory/70">{l}</Card>))}
    <p className="text-xs text-ivory/50 text-center">हर एडमिन कार्रवाई: कौन, क्या, पुराना मान, नया मान, समय, संबंधित रिकॉर्ड ID।</p>
  </Page>
}
""")

# ---------- App.tsx + main.tsx ----------
w("App.tsx", """import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './lib/store'
import Auth from './pages/Auth'
import Home from './pages/customer/Home'
import Search from './pages/customer/Search'
import SalonDetail from './pages/customer/SalonDetail'
import MyBookings from './pages/customer/MyBookings'
import Notifications from './pages/customer/Notifications'
import Profile from './pages/customer/Profile'
import OwnerRegister from './pages/owner/Register'
import OwnerDashboard from './pages/owner/Dashboard'
import OwnerBookings from './pages/owner/Bookings'
import Tokens from './pages/owner/Tokens'
import StaffServices from './pages/owner/StaffServices'
import OwnerPayments from './pages/owner/Payments'
import VoiceSettings from './pages/owner/VoiceSettings'
import OwnerSubscription from './pages/owner/Subscription'
import OwnerMore from './pages/owner/More'
import AdminDashboard from './pages/admin/Dashboard'
import { AdminSalons, AdminCustomers, AdminBookings, AdminFinance, AdminPlans, AdminBanners, AdminPush, AdminTickets, AdminSettings, AdminAudit } from './pages/admin/Manage'

export default function App() {
  return <AppProvider><BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/search" element={<Search />} />
    <Route path="/salon/:id" element={<SalonDetail />} />
    <Route path="/my-bookings" element={<MyBookings />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/owner/register" element={<OwnerRegister />} />
    <Route path="/owner" element={<OwnerDashboard />} />
    <Route path="/owner/bookings" element={<OwnerBookings />} />
    <Route path="/owner/tokens" element={<Tokens />} />
    <Route path="/owner/staff" element={<StaffServices kind="staff" />} />
    <Route path="/owner/services" element={<StaffServices kind="services" />} />
    <Route path="/owner/payments" element={<OwnerPayments />} />
    <Route path="/owner/voice" element={<VoiceSettings />} />
    <Route path="/owner/subscription" element={<OwnerSubscription />} />
    <Route path="/owner/more" element={<OwnerMore />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/salons" element={<AdminSalons />} />
    <Route path="/admin/customers" element={<AdminCustomers />} />
    <Route path="/admin/bookings" element={<AdminBookings />} />
    <Route path="/admin/finance" element={<AdminFinance />} />
    <Route path="/admin/plans" element={<AdminPlans />} />
    <Route path="/admin/banners" element={<AdminBanners />} />
    <Route path="/admin/push" element={<AdminPush />} />
    <Route path="/admin/tickets" element={<AdminTickets />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
    <Route path="/admin/audit" element={<AdminAudit />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes></BrowserRouter></AppProvider>
}
""")

w("main.tsx", """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
""")
print("owner+admin+app done")
