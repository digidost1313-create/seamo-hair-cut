import { createContext, useContext, useState, ReactNode } from 'react'
import type { Lang } from './i18n'
export type Role = 'customer' | 'owner' | 'admin' | null
export type Booking = {
  id: string; code: string; salonId: string; salonName: string; staff: string;
  services: string[]; date: string; time: string; token: number; fee: number;
  serviceTotal: number; status: 'pending'|'confirmed'|'accepted'|'rejected'|'completed'|'cancelled'|'in_progress';
  paymentStatus: 'pending'|'verified'|'failed'; customer: string; phone: string;
}
type Ctx = {
  lang: Lang; setLang: (l: Lang) => void
  role: Role; setRole: (r: Role) => void
  phone: string; setPhone: (p: string) => void
  bookings: Booking[]; addBooking: (b: Booking) => void; updateBooking: (id: string, patch: Partial<Booking>) => void
  city: string; setCity: (c: string) => void
  voice: { enabled: boolean; loud: boolean; repeat: boolean; vibrate: boolean }
  setVoice: (v: Partial<Ctx['voice']>) => void
  notifLog: string[]; logNotif: (s: string) => void
}
const C = createContext<Ctx>(null as any)
export const useApp = () => useContext(C)
export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('hi')
  const [role, setRole] = useState<Role>('customer')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Agra')
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 'b-demo-1', code: 'UHC842486', salonId: 'salon-1', salonName: 'Royal Fade Studio', staff: 'Imran Khan',
      services: ['Classic Haircut'], date: '2026-11-14', time: '16:30', token: 4, fee: 10, serviceTotal: 140,
      status: 'accepted', paymentStatus: 'verified', customer: 'Demo Customer', phone: '+91 98765 43210' },
  ])
  const [voice, setVoiceState] = useState({ enabled: true, loud: true, repeat: true, vibrate: true })
  const [notifLog, setNotifLog] = useState<string[]>(['10:42 — Test notification delivered (demo)'])
  const addBooking = (b: Booking) => setBookings(p => [b, ...p])
  const updateBooking = (id: string, patch: Partial<Booking>) => setBookings(p => p.map(b => b.id === id ? { ...b, ...patch } : b))
  const setVoice = (v: Partial<Ctx['voice']>) => setVoiceState(p => ({ ...p, ...v }))
  const logNotif = (s: string) => setNotifLog(p => [`${new Date().toLocaleTimeString('en-IN')} — ${s}`, ...p])
  return <C.Provider value={{ lang, setLang, role, setRole, phone, setPhone, bookings, addBooking, updateBooking, city, setCity, voice, setVoice, notifLog, logNotif }}>{children}</C.Provider>
}
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, dLa = (lat2 - lat1) * Math.PI / 180, dLo = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLo / 2) ** 2
  return +(2 * R * Math.asin(Math.sqrt(a))).toFixed(1)
}
