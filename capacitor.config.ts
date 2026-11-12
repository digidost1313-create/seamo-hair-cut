import type { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.seamo.haircut',
  appName: 'SEAMO HAIR CUT',
  webDir: 'dist',
  backgroundColor: '#101114',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: { launchShowDuration: 1800, backgroundColor: '#101114', showSpinner: false },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    LocalNotifications: { smallIcon: 'ic_stat_seamo', iconColor: '#C6A15B' },
  },
}
export default config
