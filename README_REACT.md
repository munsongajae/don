# 환율 투자 관리 앱 - React 버전

Streamlit 앱을 React 기반으로 리모델링한 버전입니다. 토스 스타일의 모던한 UI/UX를 제공합니다.

## 프로젝트 구조

```
dollar/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/    # UI 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── store/         # 상태 관리 (Zustand)
│   │   ├── utils/         # 유틸리티 함수
│   │   └── App.tsx        # 메인 앱 컴포넌트
│   ├── package.json
│   └── vite.config.ts
├── backend/           # FastAPI 백엔드
│   ├── main.py        # API 서버
│   └── requirements.txt
└── (기존 Python 파일들)
```

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS (스타일링)
- Zustand (상태 관리)
- Recharts (차트)
- Axios (API 통신)

### Backend
- FastAPI
- Python 3.9+
- Supabase (데이터베이스)
- yfinance (환율 데이터)

## 설치 및 실행

### 1. 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 2. 백엔드 설정

```bash
cd backend
pip install -r requirements.txt
python main.py
```

백엔드는 `http://localhost:8000`에서 실행됩니다.

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

프론트엔드의 경우 `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 주요 기능

1. **종합 탭**: 모든 기간의 지표를 한눈에 확인
2. **분석 탭**: 통화별 상세 분석 및 차트
3. **투자 탭**: 투자 포트폴리오 관리
4. **매도 탭**: 매도 기록 관리

## API 엔드포인트

### 환율 API
- `GET /api/exchange-rates/current` - 실시간 환율
- `GET /api/exchange-rates/period/{period_months}` - 기간별 데이터

### 투자 관리 API
- `GET /api/investments/dollar` - 달러 투자 목록
- `POST /api/investments/dollar` - 달러 투자 등록
- `DELETE /api/investments/dollar/{id}` - 달러 투자 삭제
- `POST /api/investments/dollar/{id}/sell` - 달러 투자 매도

(엔화 투자도 동일한 패턴)

### 매도 기록 API
- `GET /api/sell-records/dollar` - 달러 매도 기록
- `DELETE /api/sell-records/dollar/{id}` - 매도 기록 삭제

## 개발 참고사항

### 상태 관리
- `useExchangeRateStore`: 환율 데이터 관리
- `useInvestmentStore`: 투자 데이터 관리

### 스타일링
- Tailwind CSS 사용
- 토스 스타일 디자인 시스템 적용
- 반응형 디자인 (모바일 최적화)

### 컴포넌트
- `Card`: 카드 컴포넌트
- `Button`: 버튼 컴포넌트
- `Tabs`: 탭 컴포넌트
- `MetricCard`: 메트릭 카드 컴포넌트

## 배포

### 프론트엔드 빌드
```bash
cd frontend
npm run build
```

빌드된 파일은 `frontend/dist` 디렉토리에 생성됩니다.

### 백엔드 배포
FastAPI는 uvicorn으로 실행할 수 있습니다:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 라이선스

기존 프로젝트와 동일한 라이선스를 따릅니다.

