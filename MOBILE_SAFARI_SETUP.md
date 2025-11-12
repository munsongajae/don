# iOS Safari에서 실행하기 (빠른 가이드)

## 실제 iPhone/iPad에서 Safari로 접속

### 1. 개발 서버 시작

```bash
npm run dev:network
```

### 2. Windows IP 주소 확인

```bash
ipconfig
```

IPv4 주소를 확인하세요 (예: `192.168.1.100`)

### 3. iPhone/iPad 준비

1. iPhone/iPad가 Windows와 **같은 Wi-Fi 네트워크**에 연결되어 있는지 확인
2. Safari 앱 열기
3. 주소창에 입력:
   ```
   http://192.168.1.100:3000
   ```
   (실제 IP 주소로 변경)

### 4. 방화벽 설정

Windows 방화벽에서 포트 3000을 허용해야 합니다:

1. Windows 설정 → 네트워크 및 인터넷 → Windows 방화벽
2. 고급 설정 → 인바운드 규칙 → 새 규칙
3. 포트 → TCP → 특정 로컬 포트: `3000`
4. 연결 허용 → 다음 → 완료

**또는 PowerShell에서:**
```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## 문제 해결

### ❌ 연결이 안 되는 경우

1. **방화벽 확인**
   - 포트 3000이 허용되어 있는지 확인
   - 공용 네트워크 프로필에서도 허용했는지 확인

2. **네트워크 확인**
   - iPhone/iPad와 Windows가 같은 Wi-Fi에 연결되어 있는지 확인
   - Wi-Fi 네트워크 이름이 동일한지 확인
   - 모바일 데이터가 아닌 Wi-Fi를 사용해야 합니다

3. **IP 주소 재확인**
   ```bash
   ipconfig
   ```
   - IP 주소가 변경되었을 수 있습니다
   - `192.168.x.x` 또는 `10.0.x.x` 형식인지 확인

4. **개발 서버 확인**
   - 터미널에서 서버가 정상적으로 실행 중인지 확인
   - `http://localhost:3000`에서 접속되는지 확인

5. **브라우저 캐시 클리어**
   - Safari에서 캐시 및 쿠키 삭제
   - 또는 시크릿 모드에서 시도

### ✅ 연결 테스트

개발 서버가 실행 중일 때, 터미널에 다음과 같은 로그가 보여야 합니다:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

iPhone/iPad에서 접속하면, 터미널에 접속 로그가 나타납니다.

## 추가 팁

### 홈 화면에 추가하기

1. Safari에서 앱 열기
2. 공유 버튼(상단 중앙) 탭
3. "홈 화면에 추가" 선택
4. 이름 입력 후 "추가"

이렇게 하면 앱처럼 사용할 수 있습니다.

### 개발자 도구 사용하기 (Mac 필요)

Mac에서 iPhone/iPad를 USB로 연결하고 Safari 개발자 도구를 사용할 수 있습니다:
1. Mac의 Safari에서 개발 → [기기 이름] 선택
2. 원격 디버깅 활성화
3. 콘솔 로그 및 네트워크 요청 확인

### HTTPS 사용하기 (선택사항)

일부 기능(카메라, 위치 등)은 HTTPS가 필요할 수 있습니다. Next.js에서 HTTPS를 사용하려면:

1. `mkcert` 설치 (로컬 인증서 생성)
2. `next.config.js`에서 HTTPS 설정
3. 또는 `ngrok` 같은 터널링 서비스 사용

## macOS에서 iOS 시뮬레이터 사용하기

macOS에서 iOS 시뮬레이터를 사용하는 경우:

1. 개발 서버 시작:
   ```bash
   npm run dev:network
   ```

2. iOS 시뮬레이터 실행 (Xcode 필요)

3. Safari 열기:
   - 시뮬레이터에서 Safari 앱 실행
   - 주소창에 입력: `http://localhost:3000`

또는 호스트 IP 주소 사용:
```
http://192.168.1.100:3000
```

## 보안 참고사항

- 개발 서버는 **로컬 네트워크에서만** 사용하세요
- 프로덕션 환경에서는 Netlify 등에 배포된 HTTPS URL을 사용하세요
- 공용 Wi-Fi에서는 보안에 주의하세요

