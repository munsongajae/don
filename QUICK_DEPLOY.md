# 빠른 배포 가이드

## 🚀 5분 안에 배포하기

### 1단계: 백엔드 배포 - 2분

#### 옵션 1: Render (완전 무료, 추천) ⭐

1. [Render](https://render.com/) 접속 → "New +" → "Web Service"
2. GitHub 저장소 연결
3. **설정**:
   - Name: `dollar-investment-api`
   - Environment: `Python 3`
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables** 추가:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. "Create Web Service" 클릭
6. 배포 완료 후 **URL 복사** (예: `https://your-app.onrender.com`)

> 💡 **Render는 완전 무료입니다!** 15분 동안 요청이 없으면 슬립 모드로 전환되지만, 첫 요청 시 자동으로 깨어납니다.

#### 옵션 2: Railway ($5 크레딧/월)

1. [Railway](https://railway.app/) 접속 → "Start a New Project" → "Deploy from GitHub repo"
2. 저장소 선택
3. **설정**:
   - Service name: `dollar-investment-api`
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables** 추가:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. 배포 완료 후 **URL 복사** (예: `https://your-app.railway.app`)

> 💡 **Railway는 $5 크레딧/월을 제공합니다.** 사용량이 적으면 무료로 사용 가능하며, 슬립 모드가 없어 항상 실행됩니다.

### 2단계: 프론트엔드 배포 (Netlify) - 3분

1. [Netlify](https://www.netlify.com/) 접속 → "Add new site" → "Import an existing project"
2. GitHub 저장소 선택
3. **빌드 설정**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. **Environment variables** 추가:
   ```
   VITE_API_URL=https://your-app.onrender.com
   ```
   (1단계에서 복사한 URL 사용 - Render 또는 Railway)
5. "Deploy site" 클릭
6. 배포 완료 후 **도메인 복사** (예: `https://your-app.netlify.app`)

### 3단계: CORS 설정 업데이트 - 1분

1. Render/Railway 대시보드로 돌아가기
2. **Environment Variables**에 추가:
   ```
   NETLIFY_DOMAIN=https://your-app.netlify.app
   ```
   (2단계에서 복사한 Netlify 도메인 사용)
3. 백엔드가 자동으로 재배포됩니다

## ✅ 완료!

이제 앱이 배포되었습니다! Netlify 도메인에서 확인할 수 있습니다.

## 🔍 문제 해결

### API 요청이 실패하는 경우
- Netlify 환경 변수 `VITE_API_URL`이 올바른지 확인
- Render/Railway 백엔드가 실행 중인지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### CORS 에러가 발생하는 경우
- Render/Railway 환경 변수 `NETLIFY_DOMAIN`이 올바른지 확인
- 백엔드가 재배포되었는지 확인

### Render 슬립 모드
- 15분 동안 요청이 없으면 슬립 모드로 전환
- 첫 요청 시 자동으로 깨어남 (약간의 지연 발생)
- **해결 방법**: UptimeRobot 등으로 주기적으로 핑 (무료)

## 📚 더 자세한 정보

- [BACKEND_HOSTING.md](./BACKEND_HOSTING.md) - 백엔드 호스팅 플랫폼 비교
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 상세한 배포 가이드
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Netlify 배포 상세 가이드
