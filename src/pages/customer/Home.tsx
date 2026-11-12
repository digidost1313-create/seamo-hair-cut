import { Link } from 'react-router-dom'
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
