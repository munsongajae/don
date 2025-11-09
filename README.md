# 달러/엔화 투자 관리 앱 - Frontend

React + TypeScript 기반의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **React** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **Zustand** (상태 관리)
- **Axios** (API 클라이언트)
- **Recharts** (차트 라이브러리)

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

개발 환경에서는 환경 변수를 설정하지 않아도 됩니다 (Vite proxy 사용).

### 3. 개발 서버 실행

```bash
npm run dev
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

### 4. 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 🚀 배포

### Netlify 배포

1. [Netlify](https://www.netlify.com/) 접속
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 연결 (donfront)
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 환경 변수 설정:
   - `VITE_API_URL`: 백엔드 API URL
6. "Deploy site" 클릭

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

## 🔧 환경 변수

### 개발 환경
- `VITE_API_URL`: 백엔드 API URL (설정하지 않으면 Vite proxy 사용)

### 배포 환경
- `VITE_API_URL`: 백엔드 API URL (필수, 예: `https://your-app.onrender.com`)

## 📝 참고사항

- 백엔드 API와 통신하기 위해 `VITE_API_URL` 환경 변수가 필요합니다
- 개발 환경에서는 Vite proxy를 사용하여 `http://localhost:8000`으로 요청을 프록시합니다
- 프로덕션 환경에서는 환경 변수에 설정된 백엔드 URL을 사용합니다

## 📄 라이선스

MIT
