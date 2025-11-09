// app.config.ts
import { ExpoConfig } from '@expo/config-types';
import 'dotenv/config';

const config: ExpoConfig = { 
  name: 'frontend',
  slug: 'frontend',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'frontend', 
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  ios: {
    bundleIdentifier: 'com.yourco.goodsamaritan',
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.GOOGLE_API_KEY,
    },
    infoPlist:{
       "NSLocationWhenInUseUsageDescription": "We need your location to find nearby quests"
     }
  },

  android: {
    package: 'com.yourco.goodsamaritan',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    config: {
      googleMaps: {
       
        apiKey: process.env.GOOGLE_API_KEY,
      },
    },
  },

  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: { backgroundColor: '#000000' },
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    googleWebApiKey: process.env.GOOGLE_API_KEY,
  },
};

export default config;