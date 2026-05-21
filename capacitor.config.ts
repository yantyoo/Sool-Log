/// <reference types="@capacitor-firebase/authentication" />
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yantyoo.soollog',
  appName: '술로그',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com', 'apple.com'],
    },
  },
};

export default config;
