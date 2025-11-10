# Netlify 배포 체크리스트

## ✅ 배포 전 확인사항

### 1. 코드 준비
- [x] Netlify Functions 구현 완료
- [x] 패키지 설치 완료
- [x] 빌드 성공
- [x] TypeScript 에러 수정 완료
- [x] GitHub에 푸시 완료

### 2. Netlify 설정
- [ ] Netlify 계정 생성/로그인
- [ ] GitHub 저장소 연결
- [ ] Base directory 설정 (`frontend`)
- [ ] Build command 확인 (`npm run build`)
- [ ] Publish directory 확인 (`dist`)

### 3. 환경 변수 설정 (중요!)
- [ ] `SUPABASE_URL` (Functions용)
- [ ] `SUPABASE_ANON_KEY` (Functions용)
- [ ] `VITE_SUPABASE_URL` (프론트엔드용)
- [ ] `VITE_SUPABASE_ANON_KEY` (프론트엔드용)
- [ ] `VITE_API_URL` (선택사항, 기간별 데이터용)

### 4. 배포 실행
- [ ] 코드 푸시 또는 수동 배포
- [ ] 빌드 성공 확인
- [ ] Functions 동작 확인
- [ ] 사이트 테스트

## 🚀 배포 단계

### Step 1: Netlify 계정 및 프로젝트 설정

1. https://app.netlify.com 접속
2. GitHub 계정으로 로그인
3. **"Add new site"** → **"Import an existing project"** 클릭
4. GitHub 저장소 `don` 선택
5. 저장소 연결

### Step 2: 빌드 설정

**중요**: Base directory를 `frontend`로 설정해야 합니다!

1. Netlify 대시보드 → **Site settings** → **Build & deploy**
2. **Build settings** 섹션에서:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Step 3: 환경 변수 설정

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

#### 백엔드 URL (선택사항)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 4: 배포 실행

1. **자동 배포** (권장):
   - GitHub에 푸시하면 자동으로 배포됩니다
   - Netlify 대시보드 → **Deploys**에서 배포 상태 확인

2. **수동 배포**:
   - Netlify 대시보드 → **Deploys**
   - **"Trigger deploy"** → **"Deploy site"** 클릭

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

## ⚠️ 주의사항

### 1. Base Directory 설정
- **중요**: Netlify에서 Base directory를 `frontend`로 설정해야 합니다
- `netlify.toml`이 `frontend` 디렉토리에 있으므로 Base directory 설정 필요

### 2. 환경 변수 이름
- **Functions**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (VITE_ 접두사 없음)
- **프론트엔드**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (VITE_ 접두사 필요)
- **두 가지 모두 설정해야 합니다!**

### 3. 기간별 데이터
- 기간별 데이터는 Functions로 구현하지 않았습니다
- `VITE_API_URL`이 설정되어 있으면 백엔드 사용
- 없으면 에러 발생 (향후 클라이언트 처리 또는 Supabase 캐시 활용)

## 🔧 문제 해결

### 빌드 실패
1. 빌드 로그 확인
2. Base directory 설정 확인 (`frontend`)
3. 환경 변수 확인
4. `package.json` 확인

### Functions 동작 안 함
1. Functions 로그 확인
2. 환경 변수 확인 (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Functions 코드 확인
4. Base directory 설정 확인

### API 에러
1. 브라우저 콘솔에서 에러 확인
2. Netlify Functions 로그 확인
3. 환경 변수 확인
4. CORS 설정 확인 (같은 도메인이므로 문제 없어야 함)

## 📝 다음 단계

배포가 완료되면:
1. 사이트 URL 확인
2. 도메인 설정 (선택사항)
3. 모니터링 설정
4. 백엔드 연동 (선택사항)

