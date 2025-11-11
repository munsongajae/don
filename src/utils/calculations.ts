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

// 달러 인덱스 시리즈 계산
export const calculateDollarIndexSeries = (
  dfClose: Record<string, number[]>
): number[] => {
  // 빈 데이터 체크
  if (!dfClose || Object.keys(dfClose).length === 0) {
    return [];
  }
  
  const length = dfClose.EUR_USD?.length || 0;
  if (length === 0) {
    return [];
  }
  
  const dxySeries: number[] = [];

  for (let i = 0; i < length; i++) {
    // 각 값이 유효한지 확인
    const eurUsd = dfClose.EUR_USD?.[i];
    const usdJpy = dfClose.USD_JPY?.[i];
    const gbpUsd = dfClose.GBP_USD?.[i];
    const usdCad = dfClose.USD_CAD?.[i];
    const usdSek = dfClose.USD_SEK?.[i];
    const usdChf = dfClose.USD_CHF?.[i];
    
    // 모든 값이 유효한지 확인 (0이 아니고, 숫자인지)
    if (!eurUsd || !usdJpy || !gbpUsd || !usdCad || !usdSek || !usdChf) {
      continue;
    }
    
    const product =
      Math.pow(eurUsd || 1, DXY_WEIGHTS.EUR_USD) *
      Math.pow(usdJpy || 1, DXY_WEIGHTS.USD_JPY) *
      Math.pow(gbpUsd || 1, DXY_WEIGHTS.GBP_USD) *
      Math.pow(usdCad || 1, DXY_WEIGHTS.USD_CAD) *
      Math.pow(usdSek || 1, DXY_WEIGHTS.USD_SEK) *
      Math.pow(usdChf || 1, DXY_WEIGHTS.USD_CHF);

    dxySeries.push(DXY_INITIAL_CONSTANT * product);
  }

  return dxySeries;
};

// 현재 달러 인덱스 계산
export const calculateCurrentDxy = (
  currentRates: Record<string, number>
): number => {
  const product =
    Math.pow(currentRates.EUR_USD || 1, DXY_WEIGHTS.EUR_USD) *
    Math.pow(currentRates.USD_JPY || 1, DXY_WEIGHTS.USD_JPY) *
    Math.pow(currentRates.GBP_USD || 1, DXY_WEIGHTS.GBP_USD) *
    Math.pow(currentRates.USD_CAD || 1, DXY_WEIGHTS.USD_CAD) *
    Math.pow(currentRates.USD_SEK || 1, DXY_WEIGHTS.USD_SEK) *
    Math.pow(currentRates.USD_CHF || 1, DXY_WEIGHTS.USD_CHF);

  return DXY_INITIAL_CONSTANT * product;
};

// 지표 신호 계산
export const calculateIndicatorSignals = (
  currentDxy: number,
  dxy52wMid: number,
  currentUsdKrw: number,
  usdKrw52wMid: number,
  currentJxy: number,
  jxy52wMid: number,
  currentJpyKrw: number,
  jpyKrw52wMid: number
) => {
  // 달러 지표
  const dxySignal = currentDxy < dxy52wMid ? 'O' : 'X';
  const usdKrwSignal = currentUsdKrw < usdKrw52wMid ? 'O' : 'X';

  // 달러 갭 비율
  const currentGapRatio = (currentDxy / currentUsdKrw) * 100;
  const midGapRatio = (dxy52wMid / usdKrw52wMid) * 100;
  const gapRatioSignal = currentGapRatio > midGapRatio ? 'O' : 'X';

  // 적정 환율
  const fairExchangeRate = (currentDxy / midGapRatio) * 100;
  const fairRateSignal = currentUsdKrw < fairExchangeRate ? 'O' : 'X';

  // 엔화 지표 (0 값 체크)
  const jxySignal = (currentJxy > 0 && jxy52wMid > 0) ? (currentJxy < jxy52wMid ? 'O' : 'X') : '-';
  const jpyKrwSignal = (currentJpyKrw > 0 && jpyKrw52wMid > 0) ? (currentJpyKrw < jpyKrw52wMid ? 'O' : 'X') : '-';

  // 엔화 갭 비율 (0 값 체크)
  let jpyGapRatioSignal = '-';
  if (currentJxy > 0 && currentJpyKrw > 0 && jxy52wMid > 0 && jpyKrw52wMid > 0) {
    const currentJpyGapRatio = (currentJxy * 100) / (currentJpyKrw * 100);
    const midJpyGapRatio = (jxy52wMid * 100) / (jpyKrw52wMid * 100);
    jpyGapRatioSignal = currentJpyGapRatio > midJpyGapRatio ? 'O' : 'X';
  }

  // 엔화 적정 환율 (0 값 체크)
  let jpyFairRateSignal = '-';
  if (currentJxy > 0 && jxy52wMid > 0 && jpyKrw52wMid > 0) {
    const midJpyGapRatioRaw = jxy52wMid / jpyKrw52wMid;
    if (midJpyGapRatioRaw > 0) {
      const jpyFairExchangeRate = (currentJxy / midJpyGapRatioRaw) * 100;
      const currentJpyKrw100 = currentJpyKrw * 100;
      if (currentJpyKrw100 > 0) {
        jpyFairRateSignal = currentJpyKrw100 < jpyFairExchangeRate ? 'O' : 'X';
      }
    }
  }

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
};

