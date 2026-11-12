import { Page, Card } from '../../components/ui'
import { useApp } from '../../lib/store'
export default function Notifications() {
  const { bookings, notifLog } = useApp()
  const items = [
    ...bookings.map(b => ({ title: `बुकिंग ${b.code}`, body: `${b.salonName} • ${b.date} ${b.time} • टोकन #${b.token} • स्थिति: ${b.status}` })),
    { title: 'ऑफ़र', body: 'पहली बुकिंग पर 20% छूट — Agra के सभी सैलून पर।' },
    ...notifLog.map(l => ({ title: 'सिस्टम', body: l })),
  ]
  return <Page title="सूचनाएँ" back="/">
    {items.map((n, i) => <Card key={i} className="p-4"><b className="text-sm">{n.title}</b><p className="text-sm text-ivory/70">{n.body}</p></Card>)}
  </Page>
}
