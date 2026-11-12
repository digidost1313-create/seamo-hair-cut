import { Page, Card, GoldButton, RoleSwitcher } from '../../components/ui'
import { useApp } from '../../lib/store'
import { DEMO_MODE } from '../../lib/supabase'
export default function Profile() {
  const { phone, role, setRole } = useApp()
  return <Page title="प्रोफ़ाइल" back="/">
    <Card className="p-5 text-center">
      <div className="w-20 h-20 mx-auto rounded-full gold-grad grid place-items-center text-3xl text-royal font-bold">👤</div>
      <h2 className="font-bold text-lg mt-2">{phone ? '+91 ' + phone : 'अतिथि उपयोगकर्ता'}</h2>
      <p className="text-xs text-ivory/60">{DEMO_MODE ? 'डेमो मोड — Supabase कनेक्ट नहीं' : 'Supabase कनेक्टेड'}</p>
    </Card>
    <Card className="p-4 space-y-2 text-sm">
      <p>📍 सहेजे गए पते: Sanjay Place, Agra (डेमो)</p>
      <p>🌐 भाषा: हिंदी / English — होम पेज से बदलें</p>
      <p>🔔 नोटिफिकेशन: चालू</p>
    </Card>
    <div>
      <h2 className="font-bold mb-2">पैनल बदलें (एक ही ऐप, तीन रोल)</h2>
      <RoleSwitcher />
      <div className="flex gap-2 mt-3">
        {role === 'owner' && <GoldButton to="/owner">मालिक डैशबोर्ड खोलें</GoldButton>}
        {role === 'admin' && <GoldButton to="/admin">एडमिन डैशबोर्ड खोलें</GoldButton>}
        {role === 'customer' && <GoldButton to="/owner/register">सैलून रजिस्टर करें</GoldButton>}
      </div>
      <p className="text-xs text-ivory/50 mt-2">रोल बदलना केवल UI डेमो है — असली ऐप में रोल Supabase user_roles + RLS से तय होता है; एक रोल दूसरे की प्राइवेट जानकारी नहीं देख सकता।</p>
    </div>
    <GoldButton to="/auth">लॉगिन / OTP</GoldButton>
  </Page>
}
