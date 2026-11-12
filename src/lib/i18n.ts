export type Lang = 'hi' | 'en'
export const T: Record<string, { hi: string; en: string }> = {
  home: { hi: 'होम', en: 'Home' },
  search: { hi: 'सैलून खोजें', en: 'Search salons' },
  bookings: { hi: 'मेरी बुकिंग', en: 'My Bookings' },
  notifications: { hi: 'सूचनाएँ', en: 'Notifications' },
  profile: { hi: 'प्रोफ़ाइल', en: 'Profile' },
  nearby: { hi: 'पास के सैलून', en: 'Nearby Salons' },
  popular: { hi: 'लोकप्रिय सैलून', en: 'Popular Salons' },
  offers: { hi: 'ऑफ़र', en: 'Offers' },
  bookNow: { hi: 'अभी बुक करें', en: 'Book Now' },
  bookingFee: { hi: 'बुकिंग शुल्क', en: 'Booking Fee' },
  token: { hi: 'टोकन', en: 'Token' },
  owner: { hi: 'सैलून मालिक', en: 'Salon Owner' },
  admin: { hi: 'एडमिन', en: 'Admin' },
  demo: { hi: 'डेमो डेटा', en: 'Demo Data' },
}
export const t = (k: keyof typeof T, lang: Lang) => T[k][lang]
