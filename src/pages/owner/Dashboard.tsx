import { Link } from 'react-router-dom'
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
