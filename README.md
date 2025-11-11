# Dollar Investment App

환율 투자 관리 애플리케이션 (Next.js 14 + TypeScript)

## 🚀 기술 스택

- **Frontend/Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Database**: Supabase
- **Data Sources**: 
  - Yahoo Finance (historical data)
  - Investing.com (real-time rates)
  - Bithumb (USDT/KRW)

## 📁 프로젝트 구조

```
dollar/
├── app/                    # Next.js App Router
│   ├── (tabs)/            # 탭 페이지들
│   │   ├── summary/       # 종합 탭
│   │   ├── analysis/      # 분석 탭
│   │   ├── investment/    # 투자 탭
│   │   └── sell-records/  # 매도 기록 탭
│   └── api/               # API Routes
├── components/            # React 컴포넌트
│   ├── charts/           # 차트 컴포넌트
│   ├── indicators/       # 지표 컴포넌트
│   ├── investment/       # 투자 관련 컴포넌트
│   ├── metrics/         # 메트릭 카드
│   ├── navigation/      # 네비게이션
│   └── ui/              # UI 컴포넌트
├── lib/                  # 유틸리티 및 서비스
│   ├── config/          # 설정
│   ├── database/        # 데이터베이스 함수
│   ├── services/        # 외부 API 서비스
│   ├── supabase/        # Supabase 클라이언트
│   └── utils/           # 유틸리티 함수
├── store/               # Zustand 스토어
├── types/               # TypeScript 타입 정의
└── public/              # 정적 파일
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수를 설정:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## 📦 배포

### Vercel (권장)
1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. 프로젝트 Import
3. 환경 변수 설정
4. Deploy

### Netlify
1. [Netlify](https://www.netlify.com)에 GitHub 계정으로 로그인
2. 프로젝트 Import
3. 환경 변수 설정
4. Deploy

## ✨ 주요 기능

- **실시간 환율 조회**: Investing.com, 하나은행, Bithumb
- **달러/엔화 투자 관리**: 매수/매도 기록 관리
- **투자 지표 분석**: DXY, JXY, 갭 비율, 적정 환율
- **차트 분석**: 1개월, 3개월, 6개월, 1년 데이터 시각화
- **포트폴리오 관리**: 평가 손익, 수익률 계산

## 📝 라이선스

MIT
