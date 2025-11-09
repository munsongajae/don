# 배포 순서 가이드

백엔드와 프론트엔드 배포 순서에 대한 가이드입니다.

## 🎯 권장 배포 순서: 백엔드 먼저

### 이유

1. **프론트엔드가 백엔드 URL이 필요함**
   - 프론트엔드는 백엔드 API URL을 환경 변수(`VITE_API_URL`)로 필요로 합니다
   - 백엔드가 먼저 배포되어야 정확한 URL을 알 수 있습니다

2. **환경 변수 설정**
   - 백엔드 배포 후 제공되는 URL을 프론트엔드 환경 변수로 설정해야 합니다
   - 예: `VITE_API_URL=https://dollar-investment-api.onrender.com`

3. **연결 테스트**
   - 백엔드가 배포되어야 프론트엔드에서 API 호출을 테스트할 수 있습니다
   - 백엔드가 없으면 프론트엔드는 API를 호출할 수 없습니다

4. **에러 확인**
   - 백엔드를 먼저 배포하고 테스트하면 문제를 빠르게 발견할 수 있습니다
   - 프론트엔드 배포 전에 백엔드가 정상 작동하는지 확인 가능합니다

## 📋 배포 순서 (단계별)

### 1단계: 백엔드 배포 (Render)

1. **Render에서 백엔드 배포**
   - 저장소: donback
   - Root Directory: `backend`
   - 환경 변수 설정:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `ENVIRONMENT=production`

2. **배포 완료 대기**
   - 배포가 완료될 때까지 대기 (보통 5-10분)
   - 배포 로그에서 에러가 없는지 확인

3. **백엔드 URL 확인**
   - Render 대시보드에서 제공된 URL 확인
   - 예: `https://dollar-investment-api.onrender.com`
   - `/api/health` 엔드포인트로 동작 확인:
     ```bash
     curl https://dollar-investment-api.onrender.com/api/health
     ```
   - 응답: `{"status":"ok","message":"FastAPI backend is running"}`

4. **API 문서 확인**
   - Swagger UI: `https://dollar-investment-api.onrender.com/docs`
   - API 엔드포인트가 정상 작동하는지 확인

### 2단계: 프론트엔드 배포 (Netlify)

1. **Netlify에서 프론트엔드 배포**
   - 저장소: donfront
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **환경 변수 설정**
   - Netlify 대시보드 → Site settings → Environment variables
   - 다음 환경 변수 추가:
     ```
     VITE_API_URL=https://dollar-investment-api.onrender.com
     ```
   - **중요**: 백엔드 URL을 정확히 입력해야 합니다

3. **재배포**
   - 환경 변수를 추가한 후 재배포가 필요합니다
   - Netlify에서 "Trigger deploy" → "Clear cache and deploy site" 클릭

4. **연결 테스트**
   - 프론트엔드 사이트에서 API 호출이 정상 작동하는지 확인
   - 브라우저 개발자 도구 → Network 탭에서 API 요청 확인

## 🔄 역순 배포 (프론트엔드 먼저)도 가능

프론트엔드를 먼저 배포해도 됩니다. 다만:

### 장점
- 프론트엔드 UI를 먼저 확인할 수 있습니다
- 프론트엔드 빌드 에러를 먼저 확인할 수 있습니다

### 단점
- 처음에는 API 연결이 안 될 수 있습니다 (백엔드가 없으므로)
- 백엔드 URL을 나중에 환경 변수로 추가해야 합니다
- 재배포가 필요합니다

### 프론트엔드 먼저 배포 시 순서

1. **프론트엔드 배포** (Netlify)
   - 환경 변수 없이 먼저 배포
   - 또는 임시 URL로 설정: `VITE_API_URL=http://localhost:8000`

2. **백엔드 배포** (Render)
   - 백엔드 URL 확인

3. **프론트엔드 환경 변수 업데이트**
   - Netlify에서 환경 변수 업데이트
   - `VITE_API_URL`을 백엔드 URL로 변경

4. **프론트엔드 재배포**
   - 환경 변수 변경 후 재배포

## ✅ 최종 권장 사항

### 🥇 1순위: 백엔드 먼저 배포 (권장)

**이유:**
- 프론트엔드가 백엔드 URL을 필요로 함
- 한 번에 정확하게 설정 가능
- 재배포가 필요 없음
- 연결 테스트가 쉬움

**순서:**
1. 백엔드 배포 (Render) → URL 확인
2. 프론트엔드 배포 (Netlify) → 환경 변수에 백엔드 URL 설정
3. 완료!

### 🥈 2순위: 동시 배포 (경험 있는 경우)

두 개를 동시에 배포하고, 백엔드 URL이 나오면 프론트엔드 환경 변수를 업데이트하고 재배포

**순서:**
1. 백엔드 배포 시작 (Render)
2. 프론트엔드 배포 시작 (Netlify, 임시 URL 또는 빈 값)
3. 백엔드 URL 확인
4. 프론트엔드 환경 변수 업데이트 및 재배포

## 📝 체크리스트

### 백엔드 배포 전
- [ ] donback 저장소에 모든 파일이 커밋되어 있음
- [ ] `backend/requirements.txt` 파일이 올바름
- [ ] `backend/main.py` 파일이 올바름
- [ ] Supabase 자격 증명이 준비되어 있음

### 백엔드 배포 후
- [ ] 배포가 성공적으로 완료됨
- [ ] `/api/health` 엔드포인트가 정상 작동함
- [ ] `/docs` 엔드포인트에서 API 문서 확인 가능
- [ ] 백엔드 URL을 메모해 둠

### 프론트엔드 배포 전
- [ ] donfront 저장소에 모든 파일이 커밋되어 있음
- [ ] `frontend/package.json` 파일이 올바름
- [ ] 백엔드 URL을 확인함

### 프론트엔드 배포 후
- [ ] 배포가 성공적으로 완료됨
- [ ] 환경 변수 `VITE_API_URL`이 올바르게 설정됨
- [ ] 프론트엔드에서 API 호출이 정상 작동함
- [ ] 브라우저 콘솔에 에러가 없음

## 🚨 문제 해결

### 백엔드가 배포되지 않는 경우
- Render 로그 확인
- 환경 변수 확인
- `requirements.txt` 확인
- Python 버전 확인

### 프론트엔드가 API를 호출하지 못하는 경우
- 환경 변수 `VITE_API_URL` 확인
- 백엔드 URL이 올바른지 확인
- CORS 설정 확인
- 브라우저 개발자 도구 → Network 탭에서 에러 확인

### 환경 변수가 적용되지 않는 경우
- Netlify에서 환경 변수 설정 후 재배포 필요
- "Clear cache and deploy site" 옵션 사용
- 빌드 로그에서 환경 변수 확인

## 💡 팁

1. **로컬에서 먼저 테스트**
   - 배포 전에 로컬에서 백엔드와 프론트엔드를 모두 실행하여 테스트
   - 문제를 미리 발견하고 수정

2. **환경 변수 관리**
   - 환경 변수는 각 배포 플랫폼에서 관리
   - Git에 커밋하지 않도록 주의

3. **배포 로그 확인**
   - 배포 중 로그를 자주 확인하여 문제를 빠르게 발견

4. **점진적 배포**
   - 먼저 백엔드를 배포하고 테스트
   - 그 다음 프론트엔드를 배포하고 테스트
   - 한 번에 모든 것을 배포하지 말고 단계적으로 진행

## 📚 관련 문서

- [RENDER_DEPLOY_GUIDE.md](./RENDER_DEPLOY_GUIDE.md) - Render 백엔드 배포 가이드
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Netlify 프론트엔드 배포 가이드
- [backend/README.md](./backend/README.md) - 백엔드 README
- [frontend/README.md](./frontend/README.md) - 프론트엔드 README

