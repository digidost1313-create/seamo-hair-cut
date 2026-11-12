import { useState } from 'react'
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
