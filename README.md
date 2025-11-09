# 달러/엔화 투자 관리 앱

Streamlit 기반의 투자 관리 애플리케이션을 React + FastAPI로 마이그레이션한 프로젝트입니다.

## 🚀 기술 스택

### Frontend
- **React** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **Zustand** (상태 관리)
- **Axios** (API 클라이언트)
- **Recharts** (차트 라이브러리)

### Backend
- **FastAPI** (Python 웹 프레임워크)
- **Pandas** (데이터 처리)
- **yfinance** (환율 데이터)
- **Supabase** (데이터베이스)

## 📁 프로젝트 구조

```
dollar/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── store/         # Zustand 스토어
│   │   └── utils/         # 유틸리티 함수
│   └── package.json
├── backend/           # FastAPI 백엔드
│   ├── main.py        # FastAPI 앱
│   ├── run.py         # 서버 실행 스크립트
│   └── requirements.txt
├── services/          # 비즈니스 로직
├── database/          # 데이터베이스 관련
└── config/            # 설정 파일
```

## 🛠️ 설치 및 실행

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Backend 설정

```bash
# 백엔드 디렉토리로 이동
cd backend

# 가상 환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python run.py
```

백엔드 서버는 `http://localhost:8000`에서 실행됩니다.

### 3. Frontend 설정

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

## 📋 주요 기능

### 1. 요약 탭 (Summary)
- 실시간 환율 정보
- 달러/엔화 투자 지표 (1개월, 3개월, 6개월, 1년)
- 매수 신호 표시 (O/X)

### 2. 분석 탭 (Analysis)
- 달러지수 (DXY) 차트
- 달러환율 (USD/KRW) 차트
- 엔화지수 (JXY) 차트
- 엔화환율 (JPY/KRW) 차트
- 기간별 분석 (1개월, 3개월, 6개월, 1년)

### 3. 투자 탭 (Investment)
- 달러/엔화 투자 등록
- 투자 목록 조회
- 포트폴리오 성과 분석
- 투자 매도 기능

### 4. 매도 기록 탭 (Sell Records)
- 매도 기록 조회
- 기간별 필터링
- 매도 현황판 (매수금액, 확정 손익, 수익률)

## 🚀 배포

### Netlify (Frontend) + Render/Railway (Backend)

자세한 배포 방법은 다음 문서를 참조하세요:
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 빠른 배포 가이드 (5분)
- [BACKEND_HOSTING.md](./BACKEND_HOSTING.md) - 백엔드 호스팅 플랫폼 비교
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 상세한 배포 가이드
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) - Netlify 배포 상세 가이드

**추천 배포 방법:**
1. **백엔드**: Render (완전 무료) 또는 Railway ($5 크레딧/월)
2. **프론트엔드**: Netlify (완전 무료)
3. 환경 변수 설정 (`VITE_API_URL`)
4. CORS 설정 업데이트

**빠른 배포 (5분):**
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) 참조

## 🔧 환경 변수

### 개발 환경
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase Anon Key (eyJ... 형식 권장)

### 배포 환경

#### Frontend (Netlify)
- `VITE_API_URL`: 백엔드 API URL

#### Backend (Railway/Render)
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase Anon Key
- `NETLIFY_DOMAIN`: Netlify 도메인 (CORS용, 선택사항)

## 📝 참고사항

- Supabase 연결이 실패해도 yfinance에서 직접 데이터를 가져와 앱이 정상 작동합니다
- 프론트엔드와 백엔드는 별도의 포트에서 실행됩니다 (Vite 프록시 사용)
- 환경 변수는 `.env` 파일에 저장되며, Git에 업로드되지 않습니다
- 배포 시 백엔드와 프론트엔드를 별도로 배포해야 합니다

## 📄 라이선스

MIT
