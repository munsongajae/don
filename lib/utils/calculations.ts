import { DXY_INITIAL_CONSTANT, DXY_WEIGHTS } from '@/lib/config/constants';

/**
 * 달러 인덱스 시리즈를 계산합니다.
 * 원본 Python 코드와 동일: 가중 기하평균 계산
 */
export function calculateDollarIndexSeries(
  dfClose: Record<string, number[]>
): number[] {
  const eurUsd = dfClose['EUR_USD'] || [];
  const length = eurUsd.length;
  
  if (length === 0) {
    return [];
  }

  const dxySeries: number[] = [];
  
  for (let i = 0; i < length; i++) {
    // 원본과 동일: 가중 기하평균 (음수 가중치는 자동으로 역수 처리)
    let product = 1.0;
    let hasAllValues = true;
    
    Object.entries(DXY_WEIGHTS).forEach(([key, weight]) => {
      const values = dfClose[key];
      if (values && values[i] && values[i] > 0) {
        // Python의 ** 연산자와 동일: Math.pow 사용 (음수 제곱도 지원)
        product *= Math.pow(values[i], weight);
      } else {
        hasAllValues = false;
      }
    });
    
    if (hasAllValues) {
      const dxy = DXY_INITIAL_CONSTANT * product;
      dxySeries.push(dxy);
    } else {
      dxySeries.push(0);
    }
  }
  
  return dxySeries;
}

/**
 * 현재 DXY 값을 계산합니다.
 * 원본 Python 코드와 동일: 가중 기하평균 계산
 */
export function calculateCurrentDxy(currentRates: {
  EUR_USD?: number;
  USD_JPY?: number;
  GBP_USD?: number;
  USD_CAD?: number;
  USD_SEK?: number;
  USD_CHF?: number;
}): number {
  // 원본과 동일: 가중 기하평균 (음수 가중치는 자동으로 역수 처리)
  let product = 1.0;
  
  for (const [key, weight] of Object.entries(DXY_WEIGHTS)) {
    const value = currentRates[key as keyof typeof currentRates];
    if (value && value > 0) {
      // Python의 ** 연산자와 동일: Math.pow 사용 (음수 제곱도 지원)
      product *= Math.pow(value, weight);
    } else {
      return 0.0;
    }
  }
  
  return DXY_INITIAL_CONSTANT * product;
}

/**
 * 지표 신호를 계산합니다 (O/X).
 */
export function calculateIndicatorSignals(
  currentDxy: number,
  dxy52wMid: number,
  currentUsdKrw: number,
  usdKrw52wMid: number,
  currentJxy: number,
  jxy52wMid: number,
  currentJpyKrw: number,
  jpyKrw52wMid: number
): {
  dxy: 'O' | 'X' | '-';
  usd_krw: 'O' | 'X' | '-';
  gap_ratio: 'O' | 'X' | '-';
  fair_rate: 'O' | 'X' | '-';
  jxy: 'O' | 'X' | '-';
  jpy_krw: 'O' | 'X' | '-';
  jpy_gap_ratio: 'O' | 'X' | '-';
  jpy_fair_rate: 'O' | 'X' | '-';
} {
  // 달러 지표
  const dxySignal: 'O' | 'X' | '-' = currentDxy < dxy52wMid ? 'O' : (currentDxy > dxy52wMid ? 'X' : '-');
  const usdKrwSignal: 'O' | 'X' | '-' = currentUsdKrw < usdKrw52wMid ? 'O' : (currentUsdKrw > usdKrw52wMid ? 'X' : '-');
  
  // 달러 갭 비율
  const currentGapRatio = (currentDxy / currentUsdKrw) * 100;
  const midGapRatio = (dxy52wMid / usdKrw52wMid) * 100;
  const gapRatioSignal: 'O' | 'X' | '-' = currentGapRatio > midGapRatio ? 'O' : (currentGapRatio < midGapRatio ? 'X' : '-');
  
  // 적정 환율
  const fairExchangeRate = (currentDxy / midGapRatio) * 100;
  const fairRateSignal: 'O' | 'X' | '-' = currentUsdKrw < fairExchangeRate ? 'O' : (currentUsdKrw > fairExchangeRate ? 'X' : '-');
  
  // 엔화 지표
  const jxySignal: 'O' | 'X' | '-' = currentJxy < jxy52wMid ? 'O' : (currentJxy > jxy52wMid ? 'X' : '-');
  const jpyKrwSignal: 'O' | 'X' | '-' = currentJpyKrw < jpyKrw52wMid ? 'O' : (currentJpyKrw > jpyKrw52wMid ? 'X' : '-');
  
  // 엔화 갭 비율 (100엔당 기준)
  const currentJpyGapRatio = (currentJxy * 100) / (currentJpyKrw * 100);
  const midJpyGapRatio = (jxy52wMid * 100) / (jpyKrw52wMid * 100);
  const jpyGapRatioSignal: 'O' | 'X' | '-' = currentJpyGapRatio > midJpyGapRatio ? 'O' : (currentJpyGapRatio < midJpyGapRatio ? 'X' : '-');
  
  // 엔화 적정 환율 (100엔당 기준)
  const midJpyGapRatioRaw = jxy52wMid / jpyKrw52wMid;
  const jpyFairExchangeRate = (currentJxy / midJpyGapRatioRaw) * 100;
  const currentJpyKrw100 = currentJpyKrw * 100;
  const jpyFairRateSignal: 'O' | 'X' | '-' = currentJpyKrw100 < jpyFairExchangeRate ? 'O' : (currentJpyKrw100 > jpyFairExchangeRate ? 'X' : '-');
  
  return {
    dxy: dxySignal,
    usd_krw: usdKrwSignal,
    gap_ratio: gapRatioSignal,
    fair_rate: fairRateSignal,
    jxy: jxySignal,
    jpy_krw: jpyKrwSignal,
    jpy_gap_ratio: jpyGapRatioSignal,
    jpy_fair_rate: jpyFairRateSignal,
  };
}

/**
 * 엔화 인덱스 (JXY) 시리즈를 계산합니다.
 * 원본 Python 코드와 동일: USD/JPY의 역수 × 100
 */
export function calculateJpyIndexSeries(
  dfClose: Record<string, number[]>
): number[] {
  const usdJpy = dfClose['USD_JPY'] || [];
  
  if (usdJpy.length === 0) {
    return [];
  }

  // 원본과 동일: JXY = 100 / USD_JPY
  return usdJpy.map(rate => rate > 0 ? 100 / rate : 0);
}

/**
 * 현재 JXY 값을 계산합니다.
 * 원본 Python 코드와 동일: USD/JPY의 역수 × 100
 */
export function calculateCurrentJxy(usdJpyRate: number): number {
  if (!usdJpyRate || usdJpyRate <= 0) {
    return 0;
  }
  
  // 원본과 동일: JXY = 100 / USD_JPY
  return 100 / usdJpyRate;
}

/**
 * 지표 신호를 계산합니다 (O/X).
 * 단일 지표용 (reverseLogic 지원)
 */
export function calculateIndicatorSignal(
  current: number,
  mid: number,
  reverseLogic: boolean = false
): 'O' | 'X' | '-' {
  if (current === mid) return '-';
  
  // reverseLogic이 true면: 현재값 < 중간값이면 O (매수 신호)
  // reverseLogic이 false면: 현재값 > 중간값이면 O (매수 신호)
  if (reverseLogic) {
    return current < mid ? 'O' : 'X';
  } else {
    return current > mid ? 'O' : 'X';
  }
}

