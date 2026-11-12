import { Page, Card } from '../../components/ui'
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
