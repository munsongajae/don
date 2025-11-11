# Netlify 배포 계획

## 📋 배포 전 체크리스트

### 1. 코드 준비 ✅
- [x] Netlify Functions 구현 완료
- [x] 패키지 설치 완료
- [x] 빌드 성공
- [x] TypeScript 에러 수정 완료

### 2. 환경 변수 확인
- [ ] Supabase URL 확인
- [ ] Supabase Anon Key 확인
- [ ] 백엔드 URL 확인 (기간별 데이터용, 선택사항)

### 3. Git 저장소 확인
- [ ] GitHub 저장소 연결 확인
- [ ] 최신 코드 커밋 확인

## 🚀 배포 단계

### Step 1: Netlify 계정 및 프로젝트 설정

1. **Netlify 계정 생성/로그인**
   - https://app.netlify.com 접속
   - GitHub 계정으로 로그인 (권장)

2. **새 사이트 생성**
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 저장소 선택 (`donfront` 또는 해당 저장소)
   - 저장소 연결

### Step 2: 빌드 설정

Netlify가 자동으로 `netlify.toml`을 인식합니다:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

**확인 사항:**
- Base directory: `frontend` (또는 루트 디렉토리)
- Build command: `npm run build`
- Publish directory: `dist`

### Step 3: 환경 변수 설정

Netlify 대시보드 → Site settings → Environment variables에서 다음 변수 추가:

#### 필수 환경 변수

```
SUPABASE_URL=https://dejdgsibdoguzknvi hog.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**주의:**
- Functions는 `process.env.SUPABASE_URL`, `process.env.SUPABASE_ANON_KEY`를 사용
- 프론트엔드는 `import.meta.env.VITE_SUPABASE_URL`, `import.meta.env.VITE_SUPABASE_ANON_KEY`를 사용
- 따라서 두 가지 모두 설정해야 합니다:

```
# Functions용
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# 프론트엔드용
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

#### 선택적 환경 변수

```
# 기간별 데이터용 백엔드 URL (선택사항)
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 4: 배포 실행

1. **자동 배포 (권장)**
   - GitHub에 푸시하면 자동으로 배포됩니다
   - Netlify 대시보드에서 배포 상태 확인

2. **수동 배포**
   - Netlify 대시보드 → "Trigger deploy" → "Deploy site"
   - 또는 Git에 커밋 및 푸시

### Step 5: 배포 확인

1. **빌드 로그 확인**
   - Netlify 대시보드 → Deploys → 최신 배포 클릭
   - 빌드 로그에서 에러 확인

2. **Functions 확인**
   - Netlify 대시보드 → Functions
   - Functions 목록 확인:
     - `exchange-rates`
     - `investments`
     - `sell-records`

3. **사이트 테스트**
   - 배포된 사이트 URL 접속
   - API 호출 테스트
   - Functions 동작 확인

## 🔧 배포 후 확인사항

### 1. Functions 동작 확인

배포된 사이트에서 다음 API를 테스트:

- `https://your-site.netlify.app/api/exchange-rates/current`
- `https://your-site.netlify.app/api/investments/dollar`
- `https://your-site.netlify.app/api/sell-records/dollar`

### 2. 환경 변수 확인

Functions 로그에서 환경 변수 로드 확인:
- Netlify 대시보드 → Functions → Logs

### 3. 에러 확인

- 브라우저 콘솔에서 에러 확인
- Netlify Functions 로그에서 에러 확인
- Netlify 대시보드 → Functions → Logs

## ⚠️ 주의사항

### 1. 환경 변수 이름

- **Functions**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (VITE_ 접두사 없음)
- **프론트엔드**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (VITE_ 접두사 필요)

### 2. 기간별 데이터

기간별 데이터는 Functions로 구현하지 않았습니다:
- `VITE_API_URL`이 설정되어 있으면 백엔드 사용
- 없으면 에러 발생 (향후 클라이언트 처리 또는 Supabase 캐시 활용)

### 3. CORS

Netlify Functions는 같은 도메인에서 실행되므로 CORS 문제 없음

### 4. 실행 시간 제한

- 무료 플랜: 10초
- Pro 플랜: 26초
- 복잡한 작업은 클라이언트에서 처리

## 📝 배포 명령어

```bash
# 1. Git에 커밋
git add .
git commit -m "Add Netlify Functions for deployment"

# 2. GitHub에 푸시
git push origin main

# 3. Netlify에서 자동 배포 확인
# 또는 Netlify CLI 사용:
netlify deploy --prod
```

## 🎯 배포 후 다음 단계

1. **사이트 URL 확인**
   - Netlify 대시보드 → Site overview → Site URL

2. **도메인 설정** (선택사항)
   - Netlify 대시보드 → Domain settings
   - Custom domain 추가

3. **모니터링 설정**
   - Netlify 대시보드 → Analytics
   - Functions 사용량 확인

4. **백엔드 연동** (선택사항)
   - 기간별 데이터를 위해 백엔드 URL 설정
   - 또는 클라이언트에서 직접 처리

## 🔗 유용한 링크

- [Netlify Functions 문서](https://docs.netlify.com/functions/overview/)
- [Netlify 환경 변수 설정](https://docs.netlify.com/environment-variables/overview/)
- [Netlify 배포 가이드](https://docs.netlify.com/site-deploys/overview/)

