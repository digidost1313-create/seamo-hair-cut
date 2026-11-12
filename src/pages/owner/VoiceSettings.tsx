import { Page, Card, GoldButton } from '../../components/ui'
import { useApp } from '../../lib/store'
export default function VoiceSettings() {
  const { voice, setVoice, logNotif, notifLog } = useApp()
  const row = (label: string, desc: string, key: keyof typeof voice) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <div><b className="text-sm">{label}</b><p className="text-xs text-ivory/60">{desc}</p></div>
      <button onClick={() => setVoice({ [key]: !voice[key] })} className={`w-12 h-7 rounded-full ${voice[key] ? 'gold-grad' : 'bg-charcoal'}`}><span className={`block w-6 h-6 rounded-full bg-white transition-all ${voice[key] ? 'ml-5' : 'ml-1'}`} /></button>
    </div>)
  const test = () => {
    const msg = 'Attention! New booking received. Customer Nitin Verma has booked Haircut for 10 November at 10 AM. Token number 4. Please check your booking.'
    logNotif('Test alert sent — ' + (voice.loud ? 'LOUD sound + repeat until acknowledged' : 'normal sound') + (voice.vibrate ? ' + vibration' : ''))
    if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(msg); u.lang = 'en-IN'; speechSynthesis.speak(u) }
    alert('🔔 टेस्ट अलर्ट भेजा गया।\n\n"' + msg + '"\n\nअसली Android पर यह FCM high-importance चैनल + नेटिव TextToSpeech से बजेगा, ऐप बंद होने पर भी।')
  }
  return <Page title="वॉइस अलर्ट सेटिंग" back="/owner">
    <Card className="p-4">
      <b className="text-sm">🔊 साउंड-बॉक्स अलर्ट (Voice Box)</b>
      {row('वॉइस अनाउंसमेंट', 'नई बुकिंग पर आवाज़ में विवरण सुनाएँ', 'enabled')}
      {row('तेज़ आवाज़ (Loud)', 'High-importance चैनल, अधिकतम वॉल्यूम', 'loud')}
      {row('स्वीकृति तक दोहराएँ', 'जब तक मालिक स्वीकार न करे, अलर्ट दोहराएँ', 'repeat')}
      {row('वाइब्रेशन', 'अलर्ट के साथ वाइब्रेशन', 'vibrate')}
    </Card>
    <GoldButton onClick={test}>🔔 टेस्ट नोटिफिकेशन भेजें</GoldButton>
    <Card className="p-4 text-sm space-y-1">
      <b>तकनीकी नोट</b>
      <p className="text-ivory/70">Android: FCM high-importance NotificationChannel + नेटिव FirebaseMessagingService + TextToSpeech (देखें android/ Java-Kotlin कोड)। ब्राउज़र JS / WebSocket पर निर्भर नहीं — ऐप बंद होने पर भी डिलीवर होता है।</p>
      <p className="text-ivory/70">सीमाएँ (ईमानदारी से): Android बैकग्राउंड ऑडियो व बैटरी ऑप्टिमाइज़ेशन वॉइस को रोक सकते हैं — मालिक को Battery Optimization से ऐप को छूट देने को कहें। iOS पर Apple नोटिफिकेशन व Focus प्रतिबंध लागू होते हैं।</p>
    </Card>
    <div>
      <b className="text-sm">📜 नोटिफिकेशन इतिहास</b>
      {notifLog.map((l, i) => <Card key={i} className="p-3 mt-2 text-xs text-ivory/70">{l}</Card>)}
    </div>
  </Page>
}
