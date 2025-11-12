# 안드로이드 스튜디오 빠른 시작 가이드

## ⚡ 빠른 시작 (3단계)

### 1단계: Next.js 개발 서버 실행

**터미널 1**에서 개발 서버 실행:

```bash
npm run dev:network
```

이 명령어는 `http://0.0.0.0:3000`에서 서버를 실행하여 네트워크 접근을 허용합니다.

**중요**: 이 서버는 안드로이드 앱이 실행되는 동안 계속 실행되어야 합니다.

### 2단계: 안드로이드 스튜디오 열기

**터미널 2**에서:

```bash
npx cap open android
```

또는 이미 동기화했다면:

```bash
# 안드로이드 프로젝트 동기화 (필요시)
npx cap sync

# 안드로이드 스튜디오 열기
npx cap open android
```

## 3단계: 안드로이드 스튜디오에서 실행

1. **안드로이드 스튜디오가 열리면**:
   - Gradle 동기화가 자동으로 시작됩니다
   - 완료될 때까지 대기 (몇 분 소요될 수 있음)

2. **에뮬레이터 또는 실제 기기 연결**:
   - **에뮬레이터**: 상단 툴바의 "Device Manager"에서 에뮬레이터 생성 및 실행
   - **실제 기기**: 
     - USB 디버깅 활성화 (설정 > 개발자 옵션)
     - USB로 연결
     - 기기에서 "USB 디버깅 허용" 확인

3. **앱 실행**:
   - 상단 툴바에서 "Run" 버튼 클릭 (▶️)
   - 또는 `Shift + F10` (Windows/Linux)

## 실제 기기 사용 시 설정

실제 안드로이드 기기를 사용하는 경우:

1. **PC의 IP 주소 확인**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
   예: `192.168.0.100`

2. **`capacitor.config.ts` 수정**:
   ```typescript
   server: {
     url: 'http://192.168.0.100:3000', // PC IP 주소로 변경
     cleartext: true,
   },
   ```

3. **Windows 방화벽 설정**:
   - Windows 방화벽 > 고급 설정
   - 인바운드 규칙 > 새 규칙
   - 포트: 3000, TCP, 허용

4. **재동기화**:
   ```bash
   npx cap sync
   ```

## 문제 해결

### "out" 또는 ".next" 디렉토리가 없다는 오류

```bash
npm run build
npx cap sync
```

### API 호출 실패

- Next.js 개발 서버가 실행 중인지 확인 (`npm run dev:network`)
- `capacitor.config.ts`의 `url` 설정 확인
- 실제 기기: PC와 기기가 같은 Wi-Fi 네트워크에 연결되어 있는지 확인

### 네트워크 접근 불가

- Windows 방화벽에서 포트 3000 허용
- 실제 기기: PC의 IP 주소가 올바른지 확인

### Gradle 동기화 실패

- 안드로이드 스튜디오에서 "File > Sync Project with Gradle Files" 실행
- 인터넷 연결 확인 (의존성 다운로드 필요)

## 주요 명령어

- `npm run dev:network`: Next.js 개발 서버 실행 (네트워크 접근 허용)
- `npm run build`: 프로덕션 빌드
- `npx cap sync`: Capacitor 동기화
- `npx cap open android`: 안드로이드 스튜디오 열기
- `npm run android:dev:setup`: 빌드 + 동기화 + 안드로이드 스튜디오 열기

