import { useMemo, useState } from 'react'
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
