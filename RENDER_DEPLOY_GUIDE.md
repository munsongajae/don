# Render 백엔드 배포 가이드

Render에서 donback 저장소를 사용하여 FastAPI 백엔드를 배포하는 방법입니다.

## 📋 사전 준비사항

1. GitHub 저장소 준비
   - donback 저장소: https://github.com/munsongajae/donback
   - 모든 백엔드 파일이 커밋되어 있어야 합니다

2. Render 계정 생성
   - https://render.com/ 접속
   - GitHub 계정으로 로그인

## 🚀 배포 단계

### 1단계: Render 대시보드 접속

1. https://dashboard.render.com/ 접속
2. 로그인 후 대시보드 화면으로 이동

### 2단계: 새 Web Service 생성

1. "New +" 버튼 클릭
2. "Web Service" 선택

### 3단계: GitHub 저장소 연결

1. "Connect account" 또는 "Connect repository" 클릭
2. GitHub 계정 연결 (처음인 경우)
3. 저장소 목록에서 **donback** 선택
4. "Connect" 클릭

### 4단계: 서비스 설정

다음 설정을 입력합니다:

#### 기본 설정
- **Name**: `dollar-investment-api` (원하는 이름으로 변경 가능)
- **Region**: `Singapore` (가장 가까운 지역 선택)
- **Branch**: `main` (기본 브랜치)

#### 빌드 및 실행 설정
- **Root Directory**: `backend` (백엔드 폴더가 루트가 되도록)
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

#### 환경 변수 설정

"Environment" 섹션에서 다음 환경 변수를 추가합니다:

| Key | Value | 설명 |
|-----|-------|------|
| `SUPABASE_URL` | `your_supabase_url` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Supabase Anon Key (eyJ... 형식) |
| `ENVIRONMENT` | `production` | 환경 설정 |
| `NETLIFY_DOMAIN` | `your-netlify-domain.netlify.app` | Netlify 도메인 (CORS용, 선택사항) |

**중요**: 환경 변수 값은 실제 값으로 설정해야 합니다.

### 5단계: 배포 시작

1. 모든 설정을 확인한 후
2. "Create Web Service" 버튼 클릭
3. 배포가 자동으로 시작됩니다

## 📝 render.yaml 사용 방법 (선택사항)

donback 저장소의 루트에 `render.yaml` 파일이 있으면, Render가 자동으로 설정을 읽어옵니다.

### render.yaml 위치
- 프로젝트 루트: `render.yaml`
- 또는: `backend/render.yaml`

### render.yaml 내용 확인

```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    rootDir: backend
    buildCommand: pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: ENVIRONMENT
        value: production
```

**render.yaml 사용 시**:
- Render 대시보드에서 "Infrastructure as Code" 옵션 선택
- 저장소 연결 시 자동으로 설정이 적용됩니다
- 환경 변수는 여전히 Render 대시보드에서 설정해야 합니다

## 🔧 배포 후 확인사항

### 1. 배포 상태 확인
- Render 대시보드에서 "Events" 탭 확인
- 배포 로그에서 에러가 있는지 확인

### 2. API 엔드포인트 확인
- 배포 완료 후 제공되는 URL 확인 (예: `https://dollar-investment-api.onrender.com`)
- 브라우저에서 `https://your-app.onrender.com/api/health` 접속
- `{"status":"ok","message":"FastAPI backend is running"}` 응답 확인

### 3. API 문서 확인
- Swagger UI: `https://your-app.onrender.com/docs`
- ReDoc: `https://your-app.onrender.com/redoc`

## 🐛 문제 해결

### 배포 실패 시

1. **로그 확인**
   - Render 대시보드 → "Events" 탭 → "View logs" 클릭
   - 빌드 에러나 런타임 에러 확인

2. **일반적인 문제**
   - **의존성 설치 실패**: `requirements.txt` 확인
   - **모듈을 찾을 수 없음**: `rootDir` 설정 확인
   - **포트 에러**: `startCommand`에서 `$PORT` 사용 확인
   - **환경 변수 누락**: 환경 변수 설정 확인

3. **Python 버전 문제**
   - `runtime.txt` 파일 확인 (backend 폴더에 있음)
   - 내용: `python-3.11.0` 또는 `3.11`

### CORS 에러 발생 시

1. **환경 변수 설정**
   - `NETLIFY_DOMAIN`: Netlify 도메인 설정
   - 또는 `NETLIFY_DOMAINS`: 여러 도메인을 쉼표로 구분

2. **백엔드 코드 확인**
   - `backend/main.py`에서 CORS 설정 확인
   - 허용된 오리진 목록 확인

## 📚 추가 설정

### 자동 배포
- 기본적으로 GitHub에 푸시하면 자동 배포됩니다
- "Auto-Deploy" 옵션을 활성화/비활성화할 수 있습니다

### 환경 변수 관리
- 환경 변수는 Render 대시보드에서 관리합니다
- 민감한 정보는 환경 변수로 설정하세요
- `.env` 파일은 Git에 커밋하지 마세요

### 로그 확인
- Render 대시보드 → "Logs" 탭에서 실시간 로그 확인
- 배포 로그와 런타임 로그를 모두 확인할 수 있습니다

## 🔗 프론트엔드 연결

백엔드 배포 완료 후:

1. **백엔드 URL 확인**
   - Render 대시보드에서 제공된 URL 확인
   - 예: `https://dollar-investment-api.onrender.com`

2. **프론트엔드 환경 변수 설정**
   - Netlify 대시보드 접속
   - Environment variables에 추가:
     - `VITE_API_URL`: `https://dollar-investment-api.onrender.com`

3. **프론트엔드 재배포**
   - Netlify에서 자동 재배포되거나
   - 수동으로 "Trigger deploy" 클릭

## ✅ 체크리스트

배포 전 확인사항:

- [ ] GitHub 저장소 (donback)에 모든 파일이 커밋되어 있음
- [ ] `backend/requirements.txt` 파일이 올바름
- [ ] `backend/main.py` 파일이 올바름
- [ ] `render.yaml` 파일이 올바름 (사용하는 경우)
- [ ] 환경 변수 (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) 설정 완료
- [ ] `rootDir` 설정이 `backend`로 되어 있음
- [ ] `startCommand`에서 `$PORT` 사용 확인
- [ ] Python 버전이 `3.11`로 설정되어 있음

## 📞 참고사항

- Render 무료 플랜은 15분 동안 사용하지 않으면 서비스가 sleep 상태가 됩니다
- 첫 요청 시 깨어나는데 시간이 걸릴 수 있습니다 (약 30초~1분)
- 프로덕션 환경에서는 유료 플랜 사용을 권장합니다

## 🔗 관련 문서

- [Render 공식 문서](https://render.com/docs)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)
- [백엔드 README](./backend/README.md)

