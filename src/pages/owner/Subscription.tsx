import { Page, Card, GoldButton } from '../../components/ui'
export default function OwnerSubscription() {
  return <Page title="सदस्यता" back="/owner">
    <Card className="p-5 space-y-2">
      <h2 className="font-display text-xl font-bold gold-text">SEAMO BASIC PLAN</h2>
      <p className="text-2xl font-bold">₹499 <span className="text-sm text-ivory/60">/ माह</span></p>
      <p className="text-sm text-ivory/70">अनलिमिटेड सेवाएँ • अनलिमिटेड बुकिंग • साउंड-बॉक्स अलर्ट • डैशबोर्ड • स्टाफ़ प्रबंधन</p>
      <p className="text-sm">स्थिति: <b className="text-green-400">सक्रिय</b> • अगला नवीनीकरण: 6 Dec 2026 • Grace: 3 दिन</p>
      <GoldButton onClick={() => alert('Razorpay Subscriptions: असली ऐप में सर्वर create-subscription से सब्सक्रिप्शन बनेगा और वेबहुक से सक्रिय होगा। Razorpay keys अभी कनेक्ट नहीं हैं (डेमो)।')}>Razorpay से नवीनीकृत करें</GoldButton>
      <p className="text-xs text-ivory/50">वार्षिक प्लान व फ्री ट्रायल Super Admin द्वारा तय होते हैं। भुगतान की पुष्टि केवल Razorpay वेबहुक (HMAC) से होती है।</p>
    </Card>
  </Page>
}
