import { useState } from 'react'
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
          <button onClick={() => alert(`रसीद — ${b.code}\n${b.salonName} | ${b.date} ${b.time} | टोकन #${b.token}\nसेवा ₹${b.serviceTotal} + बुकिंग शुल्क ₹${b.fee}`)} className="flex-1 rounded-xl bg-charcoal py-2 text-sm">🧾 रसीद</button>
        </div>
      </Card>))}
    <GoldButton to="/search">नई बुकिंग करें</GoldButton>
  </Page>
}
