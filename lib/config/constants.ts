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

