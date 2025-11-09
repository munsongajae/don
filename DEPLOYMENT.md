# 배포 가이드

이 문서는 프론트엔드(Netlify)와 백엔드(Railway/Render) 배포 방법을 설명합니다.

## 📋 전체 아키텍처

```
┌─────────────────┐         ┌─────────────────┐
│   Netlify       │         │  Railway/Render │
│  (Frontend)     │────────▶│   (Backend)     │
│  React App      │  API    │   FastAPI       │
└─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │   Supabase      │
                            │   (Database)    │
                            └─────────────────┘
```

## 🚀 빠른 시작

### 1단계: 백엔드 배포 (Railway)

1. [Railway](https://railway.app/) 접속 및 로그인
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. **설정**:
   - Root Directory: `backend`
   - Environment Variables:
     - `SUPABASE_URL`: your_supabase_url
     - `SUPABASE_ANON_KEY`: your_supabase_anon_key
5. 배포 후 URL 복사 (예: `https://your-app.railway.app`)

### 2단계: 프론트엔드 배포 (Netlify)

1. [Netlify](https://www.netlify.com/) 접속 및 로그인
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 선택
4. **빌드 설정**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. **환경 변수**:
   - `VITE_API_URL`: 백엔드 URL (1단계에서 복사한 URL)
6. "Deploy site" 클릭

### 3단계: CORS 설정

백엔드 `main.py`의 CORS 설정에 Netlify 도메인 추가:

```python
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-netlify-app.netlify.app",  # Netlify 도메인
]
```

또는 Railway 환경 변수에 `NETLIFY_DOMAIN` 추가.

## 📝 상세 가이드

자세한 내용은 [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)를 참조하세요.

## 🔧 환경 변수

### Netlify (Frontend)

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `VITE_API_URL` | 백엔드 API URL | ✅ |

### Railway/Render (Backend)

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase Anon Key | ✅ |
| `NETLIFY_DOMAIN` | Netlify 도메인 (CORS용) | ❌ |
| `ENVIRONMENT` | 환경 (production/development) | ❌ |

## 🐛 문제 해결

### 빌드 실패

- 로컬에서 `npm run build` 실행하여 에러 확인
- Netlify 빌드 로그 확인
- Node.js 버전 확인

### API 요청 실패

- 환경 변수 `VITE_API_URL` 확인
- 백엔드 CORS 설정 확인
- 브라우저 콘솔 에러 확인

### CORS 에러

- 백엔드의 `allow_origins`에 Netlify 도메인 추가
- 환경 변수 `NETLIFY_DOMAIN` 설정

## 📚 참고 자료

- [Netlify 문서](https://docs.netlify.com/)
- [Railway 문서](https://docs.railway.app/)
- [Render 문서](https://render.com/docs)

