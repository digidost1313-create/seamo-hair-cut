import { Page, Card, GoldButton } from '../../components/ui'
export default function OwnerPayments() {
  return <Page title="UPI / QR सेटिंग" back="/owner">
    <Card className="p-5 text-center space-y-2">
      <p className="text-sm font-bold">UPI ID: seamo1@okhdfcbank</p>
      <div className="mx-auto w-44 h-44 rounded-xl bg-white grid place-items-center text-royal text-xs font-bold p-2">QR CODE<br />seamo1@okhdfcbank</div>
      <p className="text-xs text-ivory/60">ग्राहक बुकिंग के समय यही QR देखता है। QR बदलने पर नया QR तुरंत लागू होता है।</p>
      <GoldButton onClick={() => alert('Capacitor Camera: नया QR अपलोड करें (गैलरी/कैमरा)।')}>QR बदलें / अपलोड करें</GoldButton>
    </Card>
    <Card className="p-4 text-sm space-y-1">
      <b>⚠ भुगतान सत्यता नियम</b>
      <p className="text-ivory/70">ग्राहक का 'Paid' टैप या स्क्रीनशॉट भुगतान की पुष्टि नहीं है। पुष्टि केवल UPI/गेटवे वेबहुक या सर्वर वेरिफिकेशन से होती है। ₹10 बुकिंग शुल्क प्लेटफ़ॉर्म का है; सेवा शुल्क सैलून का है — दोनों अलग दिखाए जाते हैं।</p>
    </Card>
  </Page>
}
