// 달러 인덱스 계산 상수
export const DXY_INITIAL_CONSTANT = 50.143432;
export const DXY_WEIGHTS = {
  EUR_USD: -0.576,
  USD_JPY: 0.136,
  GBP_USD: -0.119,
  USD_CAD: 0.091,
  USD_SEK: 0.042,
  USD_CHF: 0.036,
};

// Yahoo Finance 티커
export const DXY_TICKERS = {
  EUR_USD: 'EURUSD=X',
  USD_JPY: 'JPY=X',
  GBP_USD: 'GBPUSD=X',
  USD_CAD: 'CAD=X',
  USD_SEK: 'SEK=X',
  USD_CHF: 'CHF=X',
};

export const USD_KRW_TICKER = 'USDKRW=X';

// 기간 설정
export const PERIOD_MAP: Record<number, string> = {
  1: '1mo',
  3: '3mo',
  6: '6mo',
  12: '1y',
};

// 외부 API URL (원본 Streamlit 앱과 동일)
export const INVESTING_EXCHANGE_RATES_TABLE_URL = 'https://kr.investing.com/currencies/exchange-rates-table';
export const HANA_BANK_URL = 'https://finance.naver.com/marketindex/';
export const BITHUMB_USDT_URL = 'https://api.bithumb.com/public/ticker/USDT_KRW';

// API Base URL (환경에 따라 변경)
// 개발 환경: 현재 포트를 사용하거나 상대 경로 사용
// 프로덕션: Netlify 배포 URL 사용
export const API_BASE_URL = 
  typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? '' // 로컬 개발: 상대 경로 사용 (같은 서버에서 실행되므로)
      : process.env.NEXT_PUBLIC_API_BASE_URL || '' // 프로덕션: Netlify URL 또는 빈 문자열 (상대 경로)
    : ''; // 서버 사이드: 상대 경로

