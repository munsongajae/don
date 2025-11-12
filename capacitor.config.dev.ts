import { CapacitorConfig } from '@capacitor/cli';

// 개발 모드용 설정 (Next.js 개발 서버 사용)
const config: CapacitorConfig = {
  appId: 'com.dollarinvestment.app',
  appName: 'Dollar Investment',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // 개발 모드: Next.js 개발 서버 사용
    // 안드로이드 에뮬레이터: http://10.0.2.2:3000
    // 실제 기기: http://[PC IP 주소]:3000
    url: 'http://10.0.2.2:3000', // 안드로이드 에뮬레이터용
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#6366f1",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;

