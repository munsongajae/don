import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dollarinvestment.app',
  appName: 'Dollar Investment',
  webDir: '.next',
  server: {
    androidScheme: 'https',
    // 개발 모드: Next.js 개발 서버 사용
    // 안드로이드 에뮬레이터: http://10.0.2.2:3000
    // 실제 기기: http://[PC IP 주소]:3000
    url: 'http://10.0.2.2:3000', // 에뮬레이터용 (실제 기기 사용 시 주석 해제하고 IP 주소 변경)
    cleartext: true,
    // 프로덕션: Netlify 배포 URL 사용
    // url: 'https://your-app.netlify.app',
  },
  android: {
    allowMixedContent: true,
    // 개발 모드에서 localhost 접근 허용
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
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

