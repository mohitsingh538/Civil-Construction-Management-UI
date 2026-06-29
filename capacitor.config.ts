import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.construction',
  appName: 'Civil Construction',
  webDir: 'web/dist',
  android: {
    path: 'infrastructure/android',
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      // We control hiding manually via SplashScreen.hide() in useAppBootstrap
      // so the splash stays visible until React has painted the first frame.
      launchAutoHide: false,
      // Dark background matching the app's neumorphic theme (#0F1117)
      backgroundColor: '#0F1117',
      // Fade out duration in ms
      fadeOutDuration: 300,
      // Show spinner while loading
      showSpinner: false,
    },
  },
};

export default config;
