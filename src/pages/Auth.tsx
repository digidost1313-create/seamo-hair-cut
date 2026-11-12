import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, GoldButton, Card } from '../components/ui'
import { supabase, DEMO_MODE } from '../lib/supabase'
import { useApp } from '../lib/store'

// AUTH MODEL (corrected 12 Nov 2026 — user directive):
// - CUSTOMER: PIN-ONLY. No OTP, no email, no email verification.
//   Register: phone → full name → Create PIN → Confirm PIN (must match).
//   Login: phone + PIN only.
//   PIN is stored HASHED (Supabase Auth password = PIN, bcrypt server-side;
//   never plaintext, never in logs). Forgot PIN = owner-assisted verified reset.
// - OWNER / ADMIN: OTP as previously specified (Supabase phone auth).
//   This screen branches on role: customer gets PIN, owner/admin get OTP.
export default function Auth() {
  const { setPhone: savePhone, role } = useApp()
  const isCustomer = role !== 'owner' && role !== 'admin'
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [otp, setOtp] = useState('')
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [otpSent, setOtpSent] = useState(false)
  const [msg, setMsg] = useState('')
  const [forgot, setForgot] = useState(false)
  const nav = useNavigate()

  const validPhone = /^\d{10}$/.test(phone)
  const validPin = /^\d{4}$/.test(pin)

  // ---- CUSTOMER: PIN register / login ----
  const customerSubmit = async () => {
    if (!validPhone) { setMsg('कृपया 10 अंकों का सही मोबाइल नंबर डालें।'); return }
    if (mode === 'register') {
      if (!name.trim()) { setMsg('कृपया अपना पूरा नाम डालें।'); return }
      if (!validPin) { setMsg('PIN ठीक 4 अंकों का होना चाहिए।'); return }
      if (pin !== confirmPin) { setMsg('PIN और Confirm PIN मेल नहीं खा रहे — दोबारा डालें।'); return }
      if (DEMO_MODE || !supabase) {
        // Demo only: record that a PIN account was created (PIN value NEVER stored).
        localStorage.setItem('seamo_demo_pin_account', JSON.stringify({ phone, name: name.trim(), created: new Date().toISOString() }))
        savePhone(phone)
        setMsg('डेमो: खाता बन गया (PIN केवल UI में जाँचा गया — असली ऐप में PIN Supabase Auth में bcrypt-hashed password के रूप में सहेजा जाएगा, कभी plaintext नहीं)।')
        nav('/')
        return
      }
      // Production: Supabase Auth with the PIN as the password (hashed server-side by Supabase/bcrypt).
      // Email is NOT collected for customers — use a non-identifying internal identifier.
      const { error } = await supabase!.auth.signUp({
        email: `customer-${phone}@seamo.internal`,
        password: pin,
        options: { data: { full_name: name.trim(), phone: '+91' + phone, role: 'customer', auth_method: 'pin' } },
      })
      if (error) setMsg('खाता बनाने में त्रुटि: ' + error.message)
      else { savePhone(phone); nav('/') }
      return
    }
    // login: phone + PIN
    if (!validPin) { setMsg('कृपया अपना 4 अंकों का PIN डालें।'); return }
    if (DEMO_MODE || !supabase) {
      const saved = JSON.parse(localStorage.getItem('seamo_demo_pin_account') || 'null')
      if (saved && saved.phone === phone) { savePhone(phone); nav('/') }
      else setMsg('डेमो: इस नंबर पर कोई PIN खाता नहीं मिला — पहले रजिस्टर करें (PIN: ठीक 4 अंक)।')
      return
    }
    const { error } = await supabase!.auth.signInWithPassword({
      email: `customer-${phone}@seamo.internal`, password: pin,
    })
    if (error) setMsg('गलत नंबर या PIN। Forgot PIN से रीसेट करवाएँ।')
    else { savePhone(phone); nav('/') }
  }

  // ---- OWNER / ADMIN: OTP (unchanged) ----
  const sendOtp = async () => {
    if (!validPhone) { setMsg('कृपया 10 अंकों का सही मोबाइल नंबर डालें।'); return }
    if (DEMO_MODE || !supabase) {
      setMsg('डेमो मोड: SMS प्रोवाइडर कनेक्ट नहीं है, इसलिए असली OTP नहीं भेजा गया। डेमो OTP 123456 से केवल UI फ्लो देखें — यह असली लॉगिन नहीं है।')
      setOtpSent(true); return
    }
    const { error } = await supabase.auth.signInWithOtp({ phone: '+91' + phone })
    if (error) setMsg('OTP भेजने में त्रुटि: ' + error.message)
    else { setMsg('OTP भेजा गया।'); setOtpSent(true) }
  }
  const verifyOtp = async () => {
    if (DEMO_MODE) {
      if (otp === '123456') { savePhone(phone); nav(role === 'owner' ? '/owner' : '/admin') }
      else setMsg('गलत डेमो OTP — 123456 डालें (केवल डेमो)।')
      return
    }
    const { error } = await supabase!.auth.verifyOtp({ phone: '+91' + phone, token: otp, type: 'sms' })
    if (error) setMsg('OTP गलत: ' + error.message)
    else { savePhone(phone); nav(role === 'owner' ? '/owner' : '/admin') }
  }

  const pinInput = (val: string, set: (v: string) => void, label: string) => (
    <div><label className="text-sm text-ivory/70">{label}</label>
      <input value={val} onChange={e => set(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="••••" inputMode="numeric" type="password"
        className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-3 text-lg tracking-[0.5em] outline-none" /></div>
  )

  return <Page title={isCustomer ? 'PIN लॉगिन / रजिस्टर' : role === 'owner' ? 'मालिक OTP लॉगिन' : 'एडमिन OTP लॉगिन'} back="/">
    <div className="text-center pt-6">
      <div className="text-5xl">✂️</div>
      <h1 className="font-display text-3xl font-bold mt-2"><span className="gold-text">SEAMO</span> HAIR CUT</h1>
      <p className="text-ivory/60 text-sm mt-1">{isCustomer ? 'ग्राहक लॉगिन — PIN से (OTP / ईमेल नहीं)' : 'OTP से लॉगिन करें'}</p>
    </div>
    <Card className="p-5 space-y-3">
      {isCustomer ? <>
        <div className="flex gap-2">
          <button onClick={() => { setMode('register'); setMsg('') }} className={`flex-1 rounded-full py-2 text-sm font-bold ${mode === 'register' ? 'gold-grad text-royal' : 'bg-charcoal'}`}>नया खाता बनाएँ</button>
          <button onClick={() => { setMode('login'); setMsg('') }} className={`flex-1 rounded-full py-2 text-sm font-bold ${mode === 'login' ? 'gold-grad text-royal' : 'bg-charcoal'}`}>लॉगिन</button>
        </div>
        <div><label className="text-sm text-ivory/70">मोबाइल नंबर</label>
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210" inputMode="numeric"
            className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-3 text-lg outline-none" /></div>
        {mode === 'register' && <div><label className="text-sm text-ivory/70">पूरा नाम</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="जैसे — Nitin Verma"
            className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-3 outline-none" /></div>}
        {pinInput(pin, setPin, mode === 'register' ? 'PIN बनाएँ (ठीक 4 अंक)' : 'PIN डालें')}
        {mode === 'register' && pinInput(confirmPin, setConfirmPin, 'Confirm PIN — दोबारा डालें')}
        <GoldButton onClick={customerSubmit}>{mode === 'register' ? 'खाता बनाएँ' : 'PIN से लॉगिन करें'}</GoldButton>
        {mode === 'login' && <button className="w-full text-gold text-sm" onClick={() => setForgot(!forgot)}>PIN भूल गए?</button>}
        {forgot && <p className="text-xs leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">
          Forgot PIN: ऑटो-रीसेट नहीं है। सैलून मालिक / Super Admin से वेरिफ़ाइड रीसेट करवाएँ — पहचान जाँचने के बाद नया PIN सेट किया जाएगा। (असली ऐप में यह प्रवाह Admin Panel → Customer → Reset PIN से होगा; कोई भी PIN कभी plaintext में नहीं दिखता।)</p>}
        <p className="text-[11px] text-ivory/40">ग्राहक के लिए कोई ईमेल फ़ील्ड और कोई OTP नहीं है। PIN ठीक 4 अंकों का होता है और hashed (bcrypt, Supabase Auth) रूप में सहेजा जाता है — कभी plaintext या लॉग में नहीं।</p>
      </> : <>
        {!otpSent ? <>
          <label className="text-sm text-ivory/70">मोबाइल नंबर</label>
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210" inputMode="numeric"
            className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-3 text-lg outline-none" />
          <GoldButton onClick={sendOtp}>OTP भेजें</GoldButton>
        </> : <>
          <label className="text-sm text-ivory/70">6 अंकों का OTP</label>
          <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••" inputMode="numeric"
            className="w-full rounded-xl bg-royal border border-gold/30 px-4 py-3 text-lg tracking-[0.5em] outline-none" />
          <GoldButton onClick={verifyOtp}>OTP वेरिफ़ाई करें</GoldButton>
          <button className="w-full text-gold text-sm" onClick={() => setOtpSent(false)}>नंबर बदलें</button>
        </>}
      </>}
      {msg && <p className="text-xs leading-relaxed text-amber-200 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">{msg}</p>}
    </Card>
  </Page>
}
