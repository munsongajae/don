// Exchange Rate Types
export interface ExchangeRate {
  investingUsd: number;
  hanaRate: number;
  usdtKrw: number;
  investingJpy: number;
}

export interface PeriodData {
  close: Record<string, number[]>;
  high: Record<string, number[]>;
  low: Record<string, number[]>;
  dates: string[];
  currentRates: ExchangeRate;
  // 원본과 동일: 각 통화 쌍의 현재 가격 (DXY 계산용)
  currentPrices?: Record<string, number>;
}

// Investment Types
export interface DollarInvestment {
  id: string;
  purchase_date: string;
  usd_amount: number;
  purchase_krw: number;
  exchange_rate: number;
  exchange_name?: string;
  investment_number?: number;
  created_at: string;
}

export interface JpyInvestment {
  id: string;
  purchase_date: string;
  jpy_amount: number;
  purchase_krw: number;
  exchange_rate: number;
  exchange_name?: string;
  investment_number?: number;
  created_at: string;
}

// Sell Record Types
export interface DollarSellRecord {
  id: string;
  investment_id: string;
  sell_date: string;
  usd_amount: number;
  sell_krw: number;
  exchange_rate: number;
  profit_loss: number;
  profit_rate: number;
  sell_number?: number;
  created_at: string;
}

export interface JpySellRecord {
  id: string;
  investment_id: string;
  sell_date: string;
  jpy_amount: number;
  sell_krw: number;
  exchange_rate: number;
  profit_loss: number;
  profit_rate: number;
  sell_number?: number;
  created_at: string;
}

// Indicator Types
export interface IndicatorSignal {
  dxy: 'O' | 'X' | '-';
  usd_krw: 'O' | 'X' | '-';
  gap_ratio: 'O' | 'X' | '-';
  fair_rate: 'O' | 'X' | '-';
  jxy: 'O' | 'X' | '-';
  jpy_krw: 'O' | 'X' | '-';
  jpy_gap_ratio: 'O' | 'X' | '-';
  jpy_fair_rate: 'O' | 'X' | '-';
}

