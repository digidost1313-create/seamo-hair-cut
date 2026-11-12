import { useState } from 'react'
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
