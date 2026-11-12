import { useState } from 'react'
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
          <button onClick={() => alert(`सैलून विवरण — ${s.name}\nफ़ोटो, स्टाफ़, सेवाएँ, पता व QR एडमिन देख सकता है।`)} className="flex-1 rounded-xl bg-charcoal py-2 text-xs">विवरण</button>
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
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
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
