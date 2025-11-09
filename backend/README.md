# 달러/엔화 투자 관리 앱 - Backend

FastAPI 기반의 백엔드 API 서버입니다.

## 🚀 기술 스택

- **FastAPI** (Python 웹 프레임워크)
- **Pandas** (데이터 처리)
- **yfinance** (환율 데이터)
- **Supabase** (데이터베이스)

## 📁 프로젝트 구조

```
backend/
├── main.py           # FastAPI 앱
├── run.py            # 서버 실행 스크립트
├── requirements.txt  # Python 의존성
└── runtime.txt       # Python 버전

services/             # 비즈니스 로직
├── exchange_rate.py
├── exchange_rate_cached.py
└── index_calculator.py

database/             # 데이터베이스 관련
├── dollar_db.py
├── jpy_db.py
├── exchange_history_db.py
└── supabase_client.py

config/               # 설정 파일
└── settings.py
```

## 🛠️ 설치 및 실행

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 가상 환경 생성 (선택사항)

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3. 의존성 설치

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 4. 서버 실행

```bash
python run.py
```

또는:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

백엔드 서버는 `http://localhost:8000`에서 실행됩니다.

### 5. API 문서 확인

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🚀 배포

### Render 배포

1. [Render](https://render.com/) 접속
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - Root Directory: `backend` (또는 루트)
   - Build Command: `pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 환경 변수 설정:
   - `SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_ANON_KEY`: Supabase Anon Key
   - `NETLIFY_DOMAIN`: Netlify 도메인 (CORS용)
6. "Create Web Service" 클릭

자세한 내용은 [RENDER_SOLUTION.md](./RENDER_SOLUTION.md)를 참조하세요.

### Railway 배포

1. [Railway](https://railway.app/) 접속
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. 설정:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 환경 변수 설정
6. 배포

## 📋 API 엔드포인트

### 환율 API
- `GET /api/exchange-rates/current` - 실시간 환율
- `GET /api/exchange-rates/period/{period_months}` - 기간별 데이터
- `GET /api/exchange-rates/usdt-krw` - USDT/KRW
- `GET /api/exchange-rates/hana-usd-krw` - 하나은행 USD/KRW
- `GET /api/exchange-rates/investing-usd-krw` - 인베스팅 USD/KRW
- `GET /api/exchange-rates/investing-jpy-krw` - 인베스팅 JPY/KRW

### 투자 관리 API
- `GET /api/investments/dollar` - 달러 투자 목록
- `POST /api/investments/dollar` - 달러 투자 등록
- `DELETE /api/investments/dollar/{id}` - 달러 투자 삭제
- `POST /api/investments/dollar/{id}/sell` - 달러 투자 매도
- `GET /api/investments/jpy` - 엔화 투자 목록
- `POST /api/investments/jpy` - 엔화 투자 등록
- `DELETE /api/investments/jpy/{id}` - 엔화 투자 삭제
- `POST /api/investments/jpy/{id}/sell` - 엔화 투자 매도

### 매도 기록 API
- `GET /api/sell-records/dollar` - 달러 매도 기록
- `DELETE /api/sell-records/dollar/{id}` - 달러 매도 기록 삭제
- `GET /api/sell-records/jpy` - 엔화 매도 기록
- `DELETE /api/sell-records/jpy/{id}` - 엔화 매도 기록 삭제

## 🔧 환경 변수

### 필수 환경 변수
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase Anon Key (eyJ... 형식 권장)

### 선택적 환경 변수
- `NETLIFY_DOMAIN`: Netlify 도메인 (CORS용)
- `ENVIRONMENT`: 환경 (production/development)

## 📝 참고사항

- Supabase 연결이 실패해도 yfinance에서 직접 데이터를 가져와 API가 정상 작동합니다
- CORS 설정은 환경 변수 `NETLIFY_DOMAIN`으로 Netlify 도메인을 허용합니다
- 환경 변수는 `.env` 파일에 저장되며, Git에 업로드되지 않습니다

## 📄 라이선스

MIT

