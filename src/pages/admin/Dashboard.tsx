import { Link } from 'react-router-dom'
import { Page, Card } from '../../components/ui'
const STATS: [string, string][] = [["कुल ग्राहक", "1,284"], ["कुल सैलून", "10"], ["सक्रिय सैलून", "9"], ["लंबित सैलून", "1"], ["निलंबित", "0"], ["कुल स्टाफ़", "20"], ["कुल बुकिंग", "342"], ["आज की बुकिंग", "27"], ["पूरी बुकिंग", "298"], ["रद्द", "17"], ["प्लेटफ़ॉर्म राजस्व (वेरिफ़ाइड ₹10 शुल्क)", "₹2,140"], ["सब्सक्रिप्शन राजस्व", "₹4,491"], ["सक्रिय सदस्यता", "9"], ["समाप्त सदस्यता", "1"]]
export default function AdminDashboard() {
  return <Page title="Super Admin">
    <Card className="p-4 gold-grad text-royal"><b>Super Admin — पूर्ण नियंत्रण</b><p className="text-xs">केवल अधिकृत एडमिन। हर बदलाव Audit Log में दर्ज होता है।</p></Card>
    <div className="grid grid-cols-2 gap-2">
      {STATS.map(([l, v]) => <Card key={l} className="p-3"><p className="text-lg font-bold gold-text">{v}</p><p className="text-[11px] text-ivory/60">{l}</p></Card>)}
    </div>
    <Card className="p-4 text-sm"><b>🏆 टॉप सैलून:</b> Royal Fade Studio (58 बुकिंग) • The Golden Scissor (41)<br /><b>💇 लोकप्रिय सेवा:</b> Classic Haircut • <b>🏙 शहरवार:</b> Agra 10 सैलून, Mathura 0, Vrindavan 0 (विस्तार बाकी)</Card>
    <div className="grid grid-cols-2 gap-2">
      {[['/admin/salons', '✂️ सैलून प्रबंधन'], ['/admin/customers', '👥 ग्राहक'], ['/admin/bookings', '📋 बुकिंग'], ['/admin/finance', '💰 वित्त / रिपोर्ट'], ['/admin/plans', '💳 प्लान व शुल्क'], ['/admin/banners', '📣 बैनर / शहर'], ['/admin/push', '🔔 पुश नोटिफिकेशन'], ['/admin/tickets', '🎫 सपोर्ट टिकट'], ['/admin/settings', '⚙️ प्लेटफ़ॉर्म सेटिंग'], ['/admin/audit', '📜 ऑडिट लॉग']].map(([to, l]) => (
        <Link key={to} to={to}><Card className="p-4 text-center text-sm font-bold">{l}</Card></Link>))}
    </div>
    <p className="text-xs text-ivory/50 text-center">राजस्व में केवल वेरिफ़ाइड ₹10 प्लेटफ़ॉर्म शुल्क + सब्सक्रिप्शन गिने जाते हैं — सैलून के सीधे UPI QR संग्रह को SEAMO राजस्व नहीं गिना जाता।</p>
  </Page>
}
