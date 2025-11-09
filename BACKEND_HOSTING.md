# 백엔드 호스팅 플랫폼 비교 가이드

FastAPI 백엔드를 배포할 수 있는 무료 호스팅 플랫폼들을 비교한 가이드입니다.

## 🆓 무료 플랫폼 비교

### 1. Railway ⭐ (추천)

**장점:**
- ✅ 쉬운 설정 (GitHub 연동)
- ✅ 자동 배포
- ✅ 무료 크레딧 $5/월 제공
- ✅ PostgreSQL, Redis 등 추가 서비스 제공
- ✅ 환경 변수 관리 편리
- ✅ 로그 확인 용이
- ✅ 커스텀 도메인 지원

**단점:**
- ⚠️ 무료 크레딧 소진 시 요금 발생
- ⚠️ 사용량이 많으면 유료 플랜 필요

**무료 제공량:**
- $5 크레딧/월
- 사용량에 따라 요금 발생 (거의 무료로 사용 가능)

**추천 이유:**
- 설정이 간단하고 안정적
- FastAPI 배포가 쉬움
- 문서가 잘 정리되어 있음

**배포 방법:**
```bash
1. Railway.app 접속
2. "New Project" → "Deploy from GitHub repo"
3. Root Directory: backend
4. Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

### 2. Render ⭐⭐ (가장 추천 - 완전 무료)

**장점:**
- ✅ **완전 무료** (무료 플랜 제공)
- ✅ GitHub 자동 배포
- ✅ SSL 인증서 자동 제공
- ✅ 환경 변수 관리
- ✅ 로그 확인
- ✅ 커스텀 도메인 지원

**단점:**
- ⚠️ **슬립 모드**: 15분 동안 요청이 없으면 자동으로 슬립 (첫 요청 시 깨어남, 약간의 지연)
- ⚠️ CPU/메모리 제한

**무료 제공량:**
- 무료 플랜: 월 750시간 (거의 무제한)
- 슬립 모드: 요청 없을 때 자동 슬립

**추천 이유:**
- **완전 무료**로 사용 가능
- 슬립 모드가 있어도 첫 요청 후 정상 작동
- 안정적이고 빠름

**배포 방법:**
```bash
1. Render.com 접속
2. "New Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - Build Command: cd backend && pip install -r requirements.txt
   - Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   - Environment: Python 3
```

---

### 3. Fly.io

**장점:**
- ✅ 무료 티어 제공
- ✅ 전 세계 CDN
- ✅ 빠른 배포
- ✅ Docker 지원
- ✅ 스케일링 용이

**단점:**
- ⚠️ 설정이 복잡할 수 있음
- ⚠️ 무료 티어 제한적 (월 3 shared-cpu-1x VMs)

**무료 제공량:**
- 월 3 shared-cpu-1x VMs
- 3GB persistent volume storage
- 160GB outbound data transfer

**배포 방법:**
```bash
1. Fly.io CLI 설치
2. fly launch
3. fly deploy
```

---

### 4. PythonAnywhere

**장점:**
- ✅ Python 전용 호스팅
- ✅ 무료 플랜 제공
- ✅ 웹 기반 IDE 제공
- ✅ 쉬운 설정

**단점:**
- ⚠️ 제한적인 무료 플랜
- ⚠️ 외부 라이브러리 설치 제한
- ⚠️ 성능 제한

**무료 제공량:**
- 제한적인 CPU/메모리
- 외부 라이브러리 설치 제한

---

### 5. Vercel (서버리스)

**장점:**
- ✅ 완전 무료
- ✅ 매우 빠른 배포
- ✅ 전 세계 CDN
- ✅ 자동 SSL

**단점:**
- ⚠️ 서버리스 함수로 변환 필요
- ⚠️ 실행 시간 제한 (10초)
- ⚠️ FastAPI 전체 앱 배포가 복잡할 수 있음

**무료 제공량:**
- 무제한 요청
- 100GB 대역폭
- 함수 실행 시간: 10초 제한

---

### 6. AWS/GCP/Azure (무료 티어)

**장점:**
- ✅ 강력한 인프라
- ✅ 확장성
- ✅ 다양한 서비스

**단점:**
- ⚠️ 설정이 복잡
- ⚠️ 무료 티어 제한적
- ⚠️ 초보자에게 어려움
- ⚠️ 크레딧 소진 시 요금 발생

**무료 제공량:**
- AWS: 12개월 무료 (제한적)
- GCP: $300 크레딧/월 (3개월)
- Azure: $200 크레딧/월 (1개월)

---

## 📊 비교표

| 플랫폼 | 무료 제공량 | 슬립 모드 | 설정 난이도 | 추천도 |
|--------|------------|----------|------------|--------|
| **Render** | 완전 무료 | 있음 (15분) | ⭐⭐⭐ 쉬움 | ⭐⭐⭐⭐⭐ |
| **Railway** | $5/월 크레딧 | 없음 | ⭐⭐⭐ 쉬움 | ⭐⭐⭐⭐ |
| **Fly.io** | 제한적 무료 | 없음 | ⭐⭐ 보통 | ⭐⭐⭐ |
| **PythonAnywhere** | 제한적 무료 | 없음 | ⭐⭐⭐ 쉬움 | ⭐⭐ |
| **Vercel** | 완전 무료 | 없음 | ⭐⭐ 보통 | ⭐⭐ |
| **AWS/GCP/Azure** | 제한적 무료 | 없음 | ⭐ 어려움 | ⭐⭐ |

## 🎯 추천 순위

### 1위: Render ⭐⭐⭐⭐⭐
- **완전 무료**로 사용 가능
- 슬립 모드가 있지만 첫 요청 후 정상 작동
- 설정이 매우 간단
- 안정적이고 빠름

### 2위: Railway ⭐⭐⭐⭐
- $5 크레딧/월로 거의 무료
- 슬립 모드 없음 (항상 실행)
- 설정이 간단
- 사용량이 적으면 무료로 사용 가능

### 3위: Fly.io ⭐⭐⭐
- 무료 티어 제공
- 빠르고 안정적
- 설정이 약간 복잡

## 🚀 빠른 시작 가이드

### Render 배포 (추천)

1. [Render](https://render.com/) 접속 및 로그인
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. **설정**:
   - **Name**: `dollar-investment-api`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend` (선택사항)
5. **Environment Variables**:
   - `SUPABASE_URL`: your_supabase_url
   - `SUPABASE_ANON_KEY`: your_supabase_anon_key
   - `NETLIFY_DOMAIN`: https://your-netlify-app.netlify.app (나중에 추가)
6. "Create Web Service" 클릭
7. 배포 완료 후 URL 복사

### Railway 배포

1. [Railway](https://railway.app/) 접속 및 로그인
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. **설정**:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   - `SUPABASE_URL`: your_supabase_url
   - `SUPABASE_ANON_KEY`: your_supabase_anon_key
   - `NETLIFY_DOMAIN`: https://your-netlify-app.netlify.app (나중에 추가)
6. 배포 완료 후 URL 복사

## 📝 주의사항

### 슬립 모드 (Render)
- 15분 동안 요청이 없으면 자동으로 슬립
- 첫 요청 시 깨어남 (약간의 지연 발생)
- **해결 방법**: 
  - UptimeRobot 등으로 주기적으로 핑 (무료)
  - 또는 슬립 모드를 무시하고 사용 (첫 요청 후 정상 작동)

### 환경 변수
- 모든 플랫폼에서 환경 변수 설정 필요
- `.env` 파일은 배포 시 사용되지 않음
- 플랫폼 대시보드에서 환경 변수 설정

### CORS 설정
- 백엔드에서 Netlify 도메인을 허용해야 함
- 환경 변수 `NETLIFY_DOMAIN`으로 설정 가능

## 🔗 관련 문서

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 전체 배포 가이드
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Netlify 배포 가이드
- [backend/render.yaml](./backend/render.yaml) - Render 설정 파일
- [backend/railway.json](./backend/railway.json) - Railway 설정 파일

