# Netlify 빠른 배포 가이드

## 🚀 5단계 배포

### Step 1: Netlify 계정 및 프로젝트 설정

1. https://app.netlify.com 접속
2. GitHub 계정으로 로그인
3. **"Add new site"** → **"Import an existing project"** 클릭
4. GitHub 저장소 선택 (`donfront` 또는 해당 저장소)
5. 저장소 연결

### Step 2: 빌드 설정 확인

Netlify가 자동으로 `netlify.toml`을 인식합니다:

- **Base directory**: `frontend` (또는 루트 디렉토리)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Step 3: 환경 변수 설정 (중요!)

Netlify 대시보드 → **Site settings** → **Environment variables**에서 추가:

#### Functions용 (필수)
```
SUPABASE_URL=https://dejdgsibdoguzknvihog.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlamRnc2liZG9ndXprbnZpaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ4MTEsImV4cCI6MjA3NTIyMDgxMX0.vplvq5tb_Q0fXIX3H3H6uw6_WxbCdgQ1cTRECzdNhnM
```

#### 프론트엔드용 (필수)
```
VITE_SUPABASE_URL=https://dejdgsibdoguzknvihog.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlamRnc2liZG9ndXprbnZpaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ4MTEsImV4cCI6MjA3NTIyMDgxMX0.vplvq5tb_Q0fXIX3H3H6uw6_WxbCdgQ1cTRECzdNhnM
```

#### 백엔드 URL (선택사항, 기간별 데이터용)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

**중요**: 
- Functions는 `SUPABASE_URL`, `SUPABASE_ANON_KEY` (VITE_ 없음)
- 프론트엔드는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (VITE_ 필요)
- **두 가지 모두 설정해야 합니다!**

### Step 4: 배포 실행

#### 방법 1: 자동 배포 (권장)
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```
GitHub에 푸시하면 Netlify에서 자동으로 배포됩니다.

#### 방법 2: 수동 배포
1. Netlify 대시보드 → **Deploys**
2. **"Trigger deploy"** → **"Deploy site"** 클릭

### Step 5: 배포 확인

1. **빌드 로그 확인**
   - Netlify 대시보드 → **Deploys** → 최신 배포 클릭
   - 빌드 성공 여부 확인

2. **Functions 확인**
   - Netlify 대시보드 → **Functions**
   - 다음 Functions가 있는지 확인:
     - `exchange-rates`
     - `investments`
     - `sell-records`

3. **사이트 테스트**
   - 배포된 사이트 URL 접속
   - API 테스트:
     - `https://your-site.netlify.app/api/exchange-rates/current`
     - `https://your-site.netlify.app/api/investments/dollar`

## ✅ 체크리스트

- [ ] Netlify 계정 생성/로그인
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정 (Functions용)
- [ ] 환경 변수 설정 (프론트엔드용)
- [ ] 백엔드 URL 설정 (선택사항)
- [ ] 코드 푸시 또는 수동 배포
- [ ] 빌드 성공 확인
- [ ] Functions 동작 확인
- [ ] 사이트 테스트

## ⚠️ 주의사항

1. **환경 변수 이름 구분**
   - Functions: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (VITE_ 없음)
   - 프론트엔드: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (VITE_ 필요)

2. **기간별 데이터**
   - 기간별 데이터는 Functions로 구현하지 않았습니다
   - `VITE_API_URL`이 설정되어 있으면 백엔드 사용
   - 없으면 에러 발생 (향후 클라이언트 처리 또는 Supabase 캐시 활용)

3. **재배포**
   - 환경 변수를 추가/수정한 후에는 재배포 필요
   - Netlify 대시보드 → **Deploys** → **"Trigger deploy"** → **"Deploy site"**

## 🔧 문제 해결

### 빌드 실패
1. 빌드 로그 확인
2. 환경 변수 확인
3. `package.json` 확인

### Functions 동작 안 함
1. Functions 로그 확인
2. 환경 변수 확인 (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Functions 코드 확인

### API 에러
1. 브라우저 콘솔에서 에러 확인
2. Netlify Functions 로그 확인
3. 환경 변수 확인

## 📚 자세한 내용

- `DEPLOYMENT_PLAN.md` - 전체 배포 계획
- `DEPLOYMENT_STEPS.md` - 단계별 상세 가이드
- `NETLIFY_ENV_SETUP.md` - 환경 변수 설정 가이드

