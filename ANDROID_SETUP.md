# 안드로이드 스튜디오 실행 가이드

## 사전 준비

1. **안드로이드 스튜디오 설치**
   - [Android Studio 다운로드](https://developer.android.com/studio)
   - JDK 17 이상 설치 확인

2. **환경 변수 설정**
   - `JAVA_HOME` 설정 확인
   - Android SDK 경로 확인

## 안드로이드 프로젝트 설정

### 1. 정적 빌드 (APK 생성용)

API Routes를 사용하지 않는 정적 빌드:

```bash
# 정적 빌드 실행
npm run build:apk

# Capacitor 동기화
npx cap sync

# 안드로이드 스튜디오 열기
npx cap open android
```

**주의**: 정적 빌드(`output: 'export'`)를 사용하면 API Routes가 작동하지 않습니다. 
프로덕션 배포 URL(Netlify 등)을 사용하도록 `lib/config/constants.ts`의 `API_BASE_URL`을 설정해야 합니다.

### 2. 개발 모드 (Next.js 개발 서버 사용)

개발 중에는 Next.js 개발 서버를 사용하여 API Routes를 활용할 수 있습니다:

#### 2-1. Next.js 개발 서버 실행

```bash
# 개발 서버 실행 (네트워크 접근 허용)
npm run dev:network
```

#### 2-2. Capacitor 설정 변경

`capacitor.config.ts` 파일에서 개발 서버 URL 설정:

```typescript
server: {
  androidScheme: 'https',
  // 안드로이드 에뮬레이터: http://10.0.2.2:3000
  // 실제 기기: http://[PC IP 주소]:3000
  url: 'http://10.0.2.2:3000', // 에뮬레이터용
  cleartext: true,
},
```

**실제 기기 사용 시**:
1. PC의 IP 주소 확인 (예: `192.168.0.100`)
2. `capacitor.config.ts`에서 `url: 'http://192.168.0.100:3000'`로 변경
3. Windows 방화벽에서 포트 3000 허용

#### 2-3. 안드로이드 프로젝트 동기화 및 열기

```bash
# 빌드 (정적 파일 생성)
npm run build:apk

# Capacitor 동기화
npx cap sync

# 안드로이드 스튜디오 열기
npx cap open android
```

## 안드로이드 스튜디오에서 실행

1. **안드로이드 스튜디오가 열리면**:
   - 프로젝트가 자동으로 로드됩니다
   - Gradle 동기화가 완료될 때까지 대기

2. **에뮬레이터 또는 실제 기기 연결**:
   - 에뮬레이터: AVD Manager에서 에뮬레이터 생성 및 실행
   - 실제 기기: USB 디버깅 활성화 후 연결

3. **앱 실행**:
   - 상단 툴바에서 "Run" 버튼 클릭 (▶️)
   - 또는 `Shift + F10` (Windows/Linux) / `Ctrl + R` (Mac)

## 문제 해결

### 1. "out" 디렉토리가 없다는 오류

```bash
npm run build:apk
npx cap sync
```

### 2. API 호출 실패

- 개발 모드: Next.js 개발 서버가 실행 중인지 확인
- 프로덕션: `API_BASE_URL` 환경 변수 설정 확인

### 3. CORS 오류

- `lib/utils/cors.ts`에서 CORS 헤더 확인
- 개발 서버의 CORS 설정 확인

### 4. 네트워크 접근 불가

- Windows 방화벽에서 포트 3000 허용
- 실제 기기: PC와 기기가 같은 Wi-Fi 네트워크에 연결되어 있는지 확인

## 빌드 스크립트

- `npm run build:apk`: 정적 빌드 실행
- `npm run build:android`: 정적 빌드 + Capacitor 동기화
- `npm run android:build`: 정적 빌드 + 동기화 + 안드로이드 스튜디오 열기
- `npm run android:dev:setup`: 개발 모드 설정 (정적 빌드 + 동기화 + 안드로이드 스튜디오 열기)

## 프로덕션 배포

프로덕션 APK를 생성하려면:

1. Netlify 등에 앱 배포
2. `capacitor.config.ts`에서 배포 URL 설정:
   ```typescript
   server: {
     url: 'https://your-app.netlify.app',
   },
   ```
3. `lib/config/constants.ts`에서 `API_BASE_URL` 설정
4. 정적 빌드 실행 및 APK 생성

