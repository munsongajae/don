# Netlify 배포 단계별 가이드

## 📋 배포 전 준비

### 1. 코드 확인
- [x] Netlify Functions 구현 완료
- [x] 패키지 설치 완료
- [x] 빌드 성공
- [x] TypeScript 에러 수정 완료

### 2. Git 저장소 확인
- [ ] 코드가 GitHub에 푸시되어 있는지 확인
- [ ] 최신 코드인지 확인

### 3. 환경 변수 준비
- [ ] Supabase URL 확인
- [ ] Supabase Anon Key 확인
- [ ] 백엔드 URL 확인 (선택사항)

## 🚀 Step 1: Netlify 계정 및 프로젝트 설정

### 1.1 Netlify 계정 생성/로그인

1. https://app.netlify.com 접속
2. GitHub 계정으로 로그인 (권장)
3. 또는 이메일로 계정 생성

### 1.2 새 사이트 생성

1. **"Add new site"** 클릭
2. **"Import an existing project"** 선택
3. **GitHub** 선택 (또는 GitLab, Bitbucket)
4. 저장소 선택 (`donfront` 또는 해당 저장소)
5. 저장소 연결

## 🚀 Step 2: 빌드 설정

### 2.1 자동 설정 확인

Netlify가 `netlify.toml`을 자동으로 인식합니다:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### 2.2 수동 설정 (필요시)

만약 `netlify.toml`이 인식되지 않으면:

1. Netlify 대시보드 → **Site settings** → **Build & deploy**
2. **Build settings** 섹션에서:
   - **Base directory**: `frontend` (또는 루트 디렉토리)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

## 🚀 Step 3: 환경 변수 설정

### 3.1 환경 변수 추가

1. Netlify 대시보드 → **Site settings** → **Environment variables**
2. **Add a variable** 클릭
3. 다음 환경 변수들을 추가:

#### Functions용 (필수)

```
Key: SUPABASE_URL
Value: https://dejdgsibdoguzknvihog.supabase.co
Scope: All scopes
```

```
Key: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlamRnc2liZG9ndXprbnZpaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ4MTEsImV4cCI6MjA3NTIyMDgxMX0.vplvq5tb_Q0fXIX3H3H6uw6_WxbCdgQ1cTRECzdNhnM
Scope: All scopes
```

#### 프론트엔드용 (필수)

```
Key: VITE_SUPABASE_URL
Value: https://dejdgsibdoguzknvihog.supabase.co
Scope: All scopes
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlamRnc2liZG9ndXprbnZpaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ4MTEsImV4cCI6MjA3NTIyMDgxMX0.vplvq5tb_Q0fXIX3H3H6uw6_WxbCdgQ1cTRECzdNhnM
Scope: All scopes
```

#### 백엔드 URL (선택사항)

```
Key: VITE_API_URL
Value: https://your-backend-url.onrender.com
Scope: All scopes
```

### 3.2 환경 변수 확인

- 모든 환경 변수가 추가되었는지 확인
- 스코프가 "All scopes"로 설정되어 있는지 확인

## 🚀 Step 4: 배포 실행

### 4.1 자동 배포 (권장)

1. GitHub에 코드 푸시:
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. Netlify에서 자동 배포:
   - GitHub에 푸시하면 자동으로 배포가 시작됩니다
   - Netlify 대시보드 → **Deploys**에서 배포 상태 확인

### 4.2 수동 배포

1. Netlify 대시보드 → **Deploys**
2. **Trigger deploy** → **Deploy site** 클릭
3. 배포 진행 상황 확인

## 🚀 Step 5: 배포 확인

### 5.1 빌드 로그 확인

1. Netlify 대시보드 → **Deploys**
2. 최신 배포 클릭
3. 빌드 로그 확인:
   - 빌드 성공 여부
   - 에러 메시지 확인
   - Functions 빌드 확인

### 5.2 Functions 확인

1. Netlify 대시보드 → **Functions**
2. Functions 목록 확인:
   - `exchange-rates`
   - `investments`
   - `sell-records`

### 5.3 사이트 테스트

1. 배포된 사이트 URL 접속
2. API 호출 테스트:
   - `https://your-site.netlify.app/api/exchange-rates/current`
   - `https://your-site.netlify.app/api/investments/dollar`
   - `https://your-site.netlify.app/api/sell-records/dollar`

3. 브라우저 콘솔에서 에러 확인

## 🔧 배포 후 확인사항

### 1. 환경 변수 로드 확인

Functions 로그에서 환경 변수 확인:
1. Netlify 대시보드 → **Functions** → **Logs**
2. Functions 실행 로그 확인
3. 환경 변수 로드 확인

### 2. API 동작 확인

배포된 사이트에서 다음 기능 테스트:
- 실시간 환율 조회
- 투자 목록 조회
- 투자 등록
- 매도 기록 조회

### 3. 에러 확인

- 브라우저 콘솔에서 에러 확인
- Netlify Functions 로그에서 에러 확인
- Netlify 대시보드 → **Functions** → **Logs**

## ⚠️ 문제 해결

### 빌드 실패

1. 빌드 로그 확인
2. 환경 변수 확인
3. `package.json` 확인
4. `netlify.toml` 확인

### Functions 동작 안 함

1. Functions 로그 확인
2. 환경 변수 확인 (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Functions 코드 확인

### API 에러

1. 브라우저 콘솔에서 에러 확인
2. Netlify Functions 로그 확인
3. 환경 변수 확인

## 📝 다음 단계

1. **도메인 설정** (선택사항)
   - Netlify 대시보드 → **Domain settings**
   - Custom domain 추가

2. **모니터링 설정**
   - Netlify 대시보드 → **Analytics**
   - Functions 사용량 확인

3. **백엔드 연동** (선택사항)
   - 기간별 데이터를 위해 백엔드 URL 설정
   - 또는 클라이언트에서 직접 처리

## 🔗 유용한 링크

- [Netlify Functions 문서](https://docs.netlify.com/functions/overview/)
- [Netlify 환경 변수 설정](https://docs.netlify.com/environment-variables/overview/)
- [Netlify 배포 가이드](https://docs.netlify.com/site-deploys/overview/)

