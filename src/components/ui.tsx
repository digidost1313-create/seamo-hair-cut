import { Link } from 'react-router-dom'
import { DEMO_MODE } from '../lib/supabase'
import { useApp } from '../lib/store'
export function TopBar({ title, back }: { title: string; back?: string }) {
  return <header className="sticky top-0 z-40 bg-royal/95 backdrop-blur border-b border-gold/20 px-4 py-3 flex items-center gap-3">
    {back && <Link to={back} className="text-gold text-xl">‹</Link>}
    <div className="font-display font-bold tracking-wide text-lg"><span className="gold-text">SEAMO</span> <span className="text-ivory text-sm">HAIR CUT</span></div>
    <span className="ml-auto text-xs text-gold/80">{title}</span>
  </header>
}
export function DemoBadge() {
  if (!DEMO_MODE) return null
  return <div className="mx-4 mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
    ⚠ डेमो मोड — Supabase अभी कनेक्ट नहीं है। यहाँ दिख रहा डेटा डेमो है, असली बुकिंग नहीं।</div>
}
export function GoldButton({ children, onClick, to, disabled }: any) {
  const cls = "gold-grad text-royal font-bold rounded-xl px-5 py-3 text-center block w-full disabled:opacity-40"
  if (to) return <Link to={to} className={cls}>{children}</Link>
  return <button onClick={onClick} disabled={disabled} className={cls}>{children}</button>
}
export function Card({ children, className = '' }: any) {
  return <div className={`rounded-2xl bg-card border border-white/5 overflow-hidden ${className}`}>{children}</div>
}
export function BottomNav() {
  const { role } = useApp()
  const items = role === 'owner'
    ? [['/owner', '🏠 डैशबोर्ड'], ['/owner/bookings', '📋 बुकिंग'], ['/owner/tokens', '🎟 टोकन'], ['/owner/voice', '🔔 वॉइस'], ['/owner/more', '⚙️ सेटिंग']]
    : role === 'admin'
    ? [['/admin', '🏠 डैशबोर्ड'], ['/admin/salons', '✂️ सैलून'], ['/admin/bookings', '📋 बुकिंग'], ['/admin/finance', '💰 वित्त'], ['/admin/more', '⚙️ सेटिंग']]
    : [['/', '🏠 होम'], ['/search', '🔍 खोजें'], ['/my-bookings', '📋 बुकिंग'], ['/notifications', '🔔 सूचना'], ['/profile', '👤 प्रोफ़ाइल']]
  return <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#17181D] border-t border-gold/25 pb-[env(safe-area-inset-bottom)]">
    <div className="grid grid-cols-5">{items.map(([to, label]: any) => (
      <Link key={to} to={to} className="py-2.5 text-center text-[11px] text-ivory/80 active:text-gold">{label}</Link>))}
    </div>
  </nav>
}
export function Page({ children, title, back }: any) {
  return <div className="min-h-screen bg-royal pb-24"><TopBar title={title || ''} back={back} /><DemoBadge /><div className="px-4 pt-4 space-y-4">{children}</div><BottomNav /></div>
}
export function RoleSwitcher() {
  const { role, setRole } = useApp()
  return <div className="flex gap-2">
    {(['customer', 'owner', 'admin'] as const).map(r => (
      <button key={r} onClick={() => setRole(r)} className={`flex-1 rounded-full py-2 text-xs font-bold ${role === r ? 'gold-grad text-royal' : 'bg-charcoal text-ivory/70'}`}>
        {r === 'customer' ? '👤 ग्राहक' : r === 'owner' ? '✂️ मालिक' : '🛡 एडमिन'}</button>))}
  </div>
}
