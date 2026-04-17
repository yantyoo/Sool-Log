/// <reference types="@capacitor-firebase/authentication" />
import { CapacitorConfig } from '@capacitor/cli';
import firebaseConfig from './firebase-applet-config.json';

const config: CapacitorConfig = {
  appId: 'com.yantyoo.soollog',
  appName: '술로그',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      authDomain: firebaseConfig.authDomain,
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
