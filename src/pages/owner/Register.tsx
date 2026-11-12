import { useState } from 'react'
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
