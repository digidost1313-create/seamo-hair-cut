import { Page, Card } from '../../components/ui'
import { Link } from 'react-router-dom'
export default function OwnerMore() {
  return <Page title="मालिक सेटिंग" back="/owner">
    {[['/owner/register', '✏️ सैलून प्रोफ़ाइल एडिट करें'], ['/owner/payments', '💳 UPI / QR सेटिंग'], ['/owner/voice', '🔔 वॉइस अलर्ट सेटिंग'], ['/owner/subscription', '💰 सदस्यता'], ['/admin', '🛡 (डेमो) एडमिन पैनल देखें']].map(([to, l]) => (
      <Link key={to} to={to}><Card className="p-4 mb-2 text-sm font-bold">{l}</Card></Link>))}
    <Card className="p-4 text-sm text-ivory/70">सहायता: support@seamo.in (डेमो) • टिकट बनाने के लिए एडमिन पैनल → Support देखें।</Card>
  </Page>
}
