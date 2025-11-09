# Render 서비스 삭제 후 재배포 가이드

## 🗑️ 서비스 삭제

Render 대시보드에서 확인 메시지에 다음을 입력:
```
sudo delete web service don
```

서비스가 삭제되면 모든 리소스가 즉시 중지됩니다.

## 🚀 재배포 방법

### 방법 1: Render 웹 UI에서 직접 설정 (가장 확실함) ⭐⭐⭐

#### 1단계: 새 Web Service 생성

1. **Render 대시보드**
   - "New +" 버튼 클릭
   - "Web Service" 선택
   - GitHub 저장소 연결 (don 저장소)

2. **기본 설정**
   ```
   Name: dollar-investment-api
   Environment: Python 3
   Region: Singapore (또는 원하는 지역)
   Branch: main
   Root Directory: backend  ⚠️ 매우 중요!
   ```

3. **빌드 및 시작 명령어**
   
   **Build Command**:
   ```bash
   pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
   ```
   
   **Start Command**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **고급 설정**
   - Settings 탭 → Environment
   - Python Version: `3.11` 선택
   - Auto-Deploy: `Yes`

5. **환경 변수 추가**
   
   Environment Variables 섹션에서 다음 추가:
   ```
   SUPABASE_URL = your_supabase_url
   SUPABASE_ANON_KEY = your_supabase_anon_key
   ENVIRONMENT = production
   ```

6. **서비스 생성**
   - "Create Web Service" 클릭
   - 빌드 시작
   - 로그에서 진행 상황 확인

#### 2단계: 빌드 확인

1. **빌드 로그 확인**
   - Render 대시보드 → 서비스 → "Logs" 탭
   - 빌드 진행 상황 확인
   - 오류가 있으면 로그 확인

2. **배포 성공 확인**
   - 서비스 상태가 "Live"로 표시되는지 확인
   - 서비스 URL 확인 (예: `https://your-app.onrender.com`)

3. **API 테스트**
   - 브라우저에서 `https://your-app.onrender.com/docs` 접속
   - Swagger UI가 표시되면 성공

### 방법 2: Blueprint 사용 (render.yaml)

프로젝트 루트에 `render.yaml` 파일이 있으므로 Blueprint로 배포할 수 있습니다.

1. **Render 대시보드**
   - "New +" 버튼 클릭
   - "Blueprint" 선택
   - GitHub 저장소 연결 (don 저장소)

2. **Blueprint 확인**
   - Render가 자동으로 `render.yaml` 파일 인식
   - 서비스 설정 확인

3. **환경 변수 입력**
   - `SUPABASE_URL`: your_supabase_url
   - `SUPABASE_ANON_KEY`: your_supabase_anon_key

4. **배포**
   - "Apply" 클릭
   - 빌드 시작

## 📋 재배포 체크리스트

서비스 재배포 전 확인사항:

- [ ] Root Directory가 `backend`로 설정되어 있는가?
- [ ] Build Command에 numpy를 먼저 설치하는가?
- [ ] Python Version이 `3.11`로 설정되어 있는가?
- [ ] 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 설정되어 있는가?
- [ ] Start Command가 올바른가?
- [ ] Auto-Deploy가 활성화되어 있는가?

## 🔍 문제 해결

### 빌드가 실패하는 경우

1. **빌드 로그 확인**
   - Render 대시보드 → 서비스 → "Logs" 탭
   - 오류 메시지 확인

2. **일반적인 문제**

   **"metadata-generation-failed"**
   - Build Command에 numpy를 먼저 설치하는지 확인
   - `--no-cache-dir` 옵션이 있는지 확인

   **"ModuleNotFoundError: No module named 'services'"**
   - Root Directory가 `backend`로 설정되어 있는지 확인

   **"Command failed with exit code 1"**
   - Build Command가 올바른지 확인
   - 각 명령어가 `&&`로 올바르게 연결되어 있는지 확인

3. **로컬에서 테스트**
   ```bash
   cd backend
   pip install --upgrade pip setuptools wheel
   pip install numpy==1.24.3
   pip install --no-cache-dir -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### 서비스가 시작되지 않는 경우

1. **로그 확인**
   - Render 대시보드 → 서비스 → "Logs" 탭
   - 시작 로그 확인

2. **일반적인 문제**

   **"Port already in use"**
   - Start Command에 `--port $PORT`가 있는지 확인

   **"ModuleNotFoundError"**
   - requirements.txt에 모든 필요한 패키지가 있는지 확인

   **"ImportError"**
   - Python 경로 문제 확인
   - services 폴더가 올바른 위치에 있는지 확인

## ✅ 배포 성공 확인

배포가 성공하면:

1. **서비스 상태**
   - Render 대시보드에서 서비스 상태가 "Live"로 표시

2. **API 테스트**
   - 브라우저에서 `https://your-app.onrender.com/docs` 접속
   - Swagger UI 확인

3. **환경 변수 확인**
   - Settings → Environment Variables
   - 모든 환경 변수가 설정되어 있는지 확인

4. **로그 확인**
   - Logs 탭에서 오류가 없는지 확인

## 🎯 다음 단계

백엔드 배포가 성공하면:

1. **백엔드 URL 복사**
   - Render 대시보드에서 서비스 URL 복사
   - 예: `https://your-app.onrender.com`

2. **Netlify 배포**
   - Netlify에 프론트엔드 배포
   - 환경 변수 `VITE_API_URL`에 백엔드 URL 설정

3. **CORS 설정**
   - Render 환경 변수에 `NETLIFY_DOMAIN` 추가
   - Netlify 도메인 설정

4. **테스트**
   - 프론트엔드에서 백엔드 API 호출 테스트

## 📚 참고 자료

- [RENDER_SOLUTION.md](./RENDER_SOLUTION.md) - Render 배포 문제 해결 가이드
- [RENDER_DEEP_FIX.md](./RENDER_DEEP_FIX.md) - Render 배포 문제 심층 분석
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Netlify 배포 가이드

