# Netlify 배포 가이드

이 가이드는 React 프론트엔드를 Netlify에 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. **GitHub 저장소**: 코드가 GitHub에 푸시되어 있어야 합니다
2. **Netlify 계정**: [Netlify](https://www.netlify.com/) 계정 생성
3. **백엔드 배포**: FastAPI 백엔드를 별도로 배포해야 합니다 (Railway, Render 등)

## 🚀 배포 단계

### 1. 백엔드 배포 (Railway 또는 Render)

> 💡 **추천**: Render를 사용하면 **완전 무료**로 사용할 수 있습니다! (슬립 모드 있음)
> Railway는 $5 크레딧/월을 제공하며 슬립 모드가 없습니다.

#### 옵션 A: Render 사용 (완전 무료, 추천) ⭐

1. [Render](https://render.com/)에 가입
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. **설정**:
   - **Name**: `dollar-investment-api`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend` (선택사항)
5. **Environment Variables** 추가:
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_ANON_KEY`: Supabase Anon Key
6. "Create Web Service" 클릭
7. 배포 완료 후 생성된 URL 복사 (예: `https://your-app.onrender.com`)

> 💡 **참고**: Render는 완전 무료입니다! 다만 15분 동안 요청이 없으면 슬립 모드로 전환됩니다. 첫 요청 시 자동으로 깨어나며 약간의 지연이 발생할 수 있습니다.

#### 옵션 B: Railway 사용 ($5 크레딧/월)

1. [Railway](https://railway.app/)에 가입
2. "New Project" → "Deploy from GitHub repo" 선택
3. 저장소 선택
4. **설정**:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** 추가:
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_ANON_KEY`: Supabase Anon Key
6. 배포 완료 후 생성된 URL 복사

> 💡 **참고**: Railway는 $5 크레딧/월을 제공하며, 사용량이 적으면 무료로 사용할 수 있습니다. 슬립 모드가 없어 항상 실행됩니다.

### 2. Netlify에 프론트엔드 배포

#### 방법 1: Netlify 웹 UI 사용

1. **Netlify 대시보드 접속**
   - [Netlify Dashboard](https://app.netlify.com/) 접속

2. **새 사이트 추가**
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 저장소 선택

3. **빌드 설정**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **환경 변수 설정**
   - "Site settings" → "Environment variables" 이동
   - 다음 변수 추가:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
     또는 Render를 사용하는 경우:
     ```
     VITE_API_URL=https://your-app.onrender.com
     ```

5. **배포**
   - "Deploy site" 클릭
   - 배포 완료 대기

#### 방법 2: Netlify CLI 사용

1. **Netlify CLI 설치**
   ```bash
   npm install -g netlify-cli
   ```

2. **로그인**
   ```bash
   netlify login
   ```

3. **프로젝트 초기화**
   ```bash
   cd frontend
   netlify init
   ```
   - 사이트 생성 또는 기존 사이트 연결 선택
   - 빌드 명령어: `npm run build`
   - 배포 디렉토리: `dist`

4. **환경 변수 설정**
   ```bash
   netlify env:set VITE_API_URL https://your-backend-url.railway.app
   ```

5. **배포**
   ```bash
   netlify deploy --prod
   ```

### 3. CORS 설정 업데이트

백엔드의 `main.py` 파일에서 CORS 설정을 업데이트해야 합니다:

```python
# Netlify 도메인 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://your-netlify-app.netlify.app",  # Netlify 도메인 추가
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

또는 모든 도메인 허용 (개발용):
```python
allow_origins=["*"]
```

### 4. 백엔드 재배포

CORS 설정을 업데이트한 후 백엔드를 다시 배포합니다.

## 🔧 환경 변수 설정

### Netlify 환경 변수

Netlify 대시보드에서 다음 환경 변수를 설정합니다:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_URL` | 백엔드 API URL | `https://your-app.railway.app` |

### 백엔드 환경 변수 (Railway/Render)

| 변수명 | 설명 |
|--------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase Anon Key |

## 📝 추가 설정

### 커스텀 도메인

1. Netlify 대시보드 → "Domain settings"
2. "Add custom domain" 클릭
3. 도메인 입력 및 DNS 설정

### 자동 배포

GitHub에 푸시하면 자동으로 배포됩니다:
- Netlify는 GitHub 웹훅을 통해 자동 배포
- `main` 브랜치에 푸시하면 프로덕션 배포
- 다른 브랜치에 푸시하면 미리보기 배포

## 🐛 문제 해결

### 1. 빌드 실패

**문제**: 빌드 중 에러 발생
**해결**:
- 로컬에서 `npm run build` 실행하여 에러 확인
- Netlify 빌드 로그 확인
- Node.js 버전 확인 (netlify.toml에서 설정)

### 2. API 요청 실패

**문제**: 프론트엔드에서 백엔드 API 호출 실패
**해결**:
- 환경 변수 `VITE_API_URL`이 올바르게 설정되었는지 확인
- 백엔드 CORS 설정 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 3. 라우팅 문제

**문제**: 직접 URL 접근 시 404 에러
**해결**:
- `netlify.toml`의 리다이렉트 설정 확인
- 모든 경로를 `index.html`로 리다이렉트하도록 설정

## 📚 참고 자료

- [Netlify 공식 문서](https://docs.netlify.com/)
- [Railway 문서](https://docs.railway.app/)
- [Render 문서](https://render.com/docs)
- [Vite 환경 변수](https://vitejs.dev/guide/env-and-mode.html)

## ✅ 체크리스트

- [ ] 백엔드 배포 완료 (Railway 또는 Render)
- [ ] 백엔드 URL 확인
- [ ] Netlify에 프론트엔드 배포
- [ ] 환경 변수 `VITE_API_URL` 설정
- [ ] 백엔드 CORS 설정 업데이트
- [ ] 배포 후 테스트
- [ ] 커스텀 도메인 설정 (선택사항)

