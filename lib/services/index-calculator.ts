import yahooFinance from 'yahoo-finance2';
import { DXY_INITIAL_CONSTANT, DXY_WEIGHTS, DXY_TICKERS, USD_KRW_TICKER, PERIOD_MAP } from '@/lib/config/constants';

// yahoo-finance2 인스턴스 생성 (생성자 함수 사용)
const yf = new yahooFinance();

export interface PeriodData {
  close: Record<string, number[]>;
  high: Record<string, number[]>;
  low: Record<string, number[]>;
  dates: string[];
  currentRates: {
    investingUsd: number;
    hanaRate: number;
    usdtKrw: number;
    investingJpy: number;
  };
  // 원본과 동일: 각 통화 쌍의 현재 가격 (DXY 계산용)
  currentPrices?: Record<string, number>;
}

/**
 * yahoo-finance2를 사용하여 지정된 기간의 OHLC 데이터를 가져옵니다.
 * 원본 Python 코드와 동일한 로직: yf.download()를 재현
 * 
 * 참고: yahoo-finance2는 historical 모듈이 없을 수 있으므로,
 * chart 모듈이나 다른 방법을 사용해야 할 수 있습니다.
 */
export async function fetchPeriodData(periodMonths: number = 12): Promise<PeriodData> {
  const allTickers = Object.values(DXY_TICKERS).concat([USD_KRW_TICKER]);
  const periodStr = PERIOD_MAP[periodMonths] || '1y';

  console.log(`yahoo-finance2에서 ${periodMonths}개월치 일별 OHLC 데이터를 가져오는 중...`);
  
  // 기간 계산 (원본과 동일)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - periodMonths);
  
  // 각 티커별로 데이터 가져오기 (병렬 처리)
  const tickerData: Record<string, any[]> = {};
  
  // yahoo-finance2 인스턴스의 historical 메서드 사용
  await Promise.allSettled(
    allTickers.map(async (ticker) => {
      try {
        // historical 모듈 사용 (원본 Python의 yf.download()와 유사)
        const quotes = await yf.historical(ticker, {
          period1: startDate, // Date 객체 또는 ISO 문자열
          period2: endDate,
          interval: '1d' as const, // 일별 데이터
          events: 'history' as const, // 가격 데이터
        });
        
        if (quotes && Array.isArray(quotes) && quotes.length > 0) {
          tickerData[ticker] = quotes;
          console.log(`티커 ${ticker} 데이터 가져오기 성공: ${quotes.length}개 데이터 포인트`);
        } else {
          console.warn(`티커 ${ticker} 데이터가 비어있습니다.`);
          tickerData[ticker] = [];
        }
      } catch (error: any) {
        console.error(`티커 ${ticker} 데이터 가져오기 실패:`, {
          message: error?.message,
          ticker,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        tickerData[ticker] = [];
      }
    })
  );

  // 티커를 키로 변환하는 매핑
  const tickerToKey: Record<string, string> = {};
  Object.entries(DXY_TICKERS).forEach(([key, ticker]) => {
    tickerToKey[ticker] = key;
  });
  tickerToKey[USD_KRW_TICKER] = 'USD_KRW';

  // 날짜별로 데이터 그룹화 (원본 Python의 pandas DataFrame 인덱스와 유사)
  type DateData = {
    date: string;
    [key: string]: any;
  };
  
  const dateMap = new Map<string, DateData>();
  
  // 각 티커의 데이터를 날짜별로 매핑
  Object.entries(tickerData).forEach(([ticker, quotes]) => {
    const key = tickerToKey[ticker] || ticker;
    
    quotes.forEach((quote: any) => {
      const dateStr = quote.date instanceof Date 
        ? quote.date.toISOString().split('T')[0]
        : new Date(quote.date).toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr });
      }
      
      const dateData = dateMap.get(dateStr)!;
      dateData[`${key}_close`] = quote.close || 0;
      dateData[`${key}_high`] = quote.high || 0;
      dateData[`${key}_low`] = quote.low || 0;
    });
  });
  
  // 모든 티커에 데이터가 있는 날짜만 필터링 (원본의 dropna와 동일)
  const allKeys = Object.values(tickerToKey);
  const validDateEntries = Array.from(dateMap.entries()).filter(([date, data]) => {
    // 모든 티커에 close 데이터가 있는지 확인
    return allKeys.every((key) => {
      const closeValue = data[`${key}_close`];
      return closeValue !== undefined && closeValue !== null && closeValue > 0;
    });
  });
  
  // 날짜 순서대로 정렬
  validDateEntries.sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  
  // 데이터 구조 변환 (원본과 동일: 컬럼 이름 매핑)
  const close: Record<string, number[]> = {};
  const high: Record<string, number[]> = {};
  const low: Record<string, number[]> = {};
  const validDates: string[] = [];
  
  // 각 키에 대해 배열 초기화
  allKeys.forEach((key) => {
    close[key] = [];
    high[key] = [];
    low[key] = [];
  });
  
  // 유효한 날짜별로 데이터 추출
  validDateEntries.forEach(([date, data]) => {
    validDates.push(date);
    allKeys.forEach((key) => {
      close[key].push(data[`${key}_close`] || 0);
      high[key].push(data[`${key}_high`] || 0);
      low[key].push(data[`${key}_low`] || 0);
    });
  });
  
  // JPY/KRW 및 JXY 추가 (원본과 동일)
  if (close['USD_JPY'] && close['USD_KRW']) {
    const jpyKrwClose: number[] = [];
    const jpyKrwHigh: number[] = [];
    const jpyKrwLow: number[] = [];
    const jxyClose: number[] = [];
    const jxyHigh: number[] = [];
    const jxyLow: number[] = [];
    
    for (let i = 0; i < validDates.length; i++) {
      const usdJpy = close['USD_JPY'][i];
      const usdKrw = close['USD_KRW'][i];
      
      if (usdJpy > 0 && usdKrw > 0) {
        jpyKrwClose.push(usdKrw / usdJpy);
        jxyClose.push(100 / usdJpy);
        
        const usdJpyHigh = high['USD_JPY'][i];
        const usdKrwHigh = high['USD_KRW'][i];
        const usdJpyLow = low['USD_JPY'][i];
        const usdKrwLow = low['USD_KRW'][i];
        
        if (usdJpyHigh > 0 && usdKrwHigh > 0) {
          jpyKrwHigh.push(usdKrwHigh / usdJpyHigh);
          jxyHigh.push(100 / usdJpyHigh);
        } else {
          jpyKrwHigh.push(usdKrw / usdJpy);
          jxyHigh.push(100 / usdJpy);
        }
        
        if (usdJpyLow > 0 && usdKrwLow > 0) {
          jpyKrwLow.push(usdKrwLow / usdJpyLow);
          jxyLow.push(100 / usdJpyLow);
        } else {
          jpyKrwLow.push(usdKrw / usdJpy);
          jxyLow.push(100 / usdJpy);
        }
      } else {
        jpyKrwClose.push(0);
        jpyKrwHigh.push(0);
        jpyKrwLow.push(0);
        jxyClose.push(0);
        jxyHigh.push(0);
        jxyLow.push(0);
      }
    }
    
    close['JPY_KRW'] = jpyKrwClose;
    high['JPY_KRW'] = jpyKrwHigh;
    low['JPY_KRW'] = jpyKrwLow;
    close['JXY'] = jxyClose;
    high['JXY'] = jxyHigh;
    low['JXY'] = jxyLow;
  }

  // 원본과 동일: 현재 가격 가져오기 (yf.Ticker().info.get('regularMarketPrice'))
  // yahoo-finance2에서는 quote 모듈 사용
  const currentPrices: Record<string, number> = {};
  
  console.log('각 통화쌍의 현재 종가를 가져오는 중...');
  console.log('가져올 티커 목록:', allTickers);
  console.log('가져올 키 목록:', allKeys);
  
  try {
    await Promise.allSettled(
      allTickers.map(async (ticker) => {
        try {
          console.log(`티커 ${ticker} quote 조회 시작...`);
          const quote = await yf.quote(ticker);
          const key = tickerToKey[ticker] || ticker;
          
          console.log(`티커 ${ticker} quote 응답:`, JSON.stringify(quote, null, 2).substring(0, 500));
          
          // yahoo-finance2의 quote 응답 구조 확인
          // regularMarketPrice 외에도 다른 필드가 있을 수 있음
          const price = quote?.regularMarketPrice || quote?.price || quote?.regularPrice || quote?.bid || quote?.ask || 0;
          
          if (price && price > 0) {
            currentPrices[key] = price;
            console.log(`${key} (${ticker}) 현재 가격 (quote): ${price}`);
          } else {
            console.warn(`${key} (${ticker}) quote에서 유효한 가격을 찾을 수 없습니다. 응답:`, quote);
            // Fallback: 마지막 종가 사용
            if (close[key] && close[key].length > 0) {
              const lastClose = close[key][close[key].length - 1];
              if (lastClose > 0) {
                currentPrices[key] = lastClose;
                console.log(`${key} (${ticker}) 현재 가격 (fallback 종가): ${lastClose}`);
              } else {
                console.warn(`${key} (${ticker}) 마지막 종가가 0입니다.`);
              }
            } else {
              console.warn(`${key} (${ticker}) close 데이터가 없습니다.`);
            }
          }
        } catch (error: any) {
          console.error(`티커 ${ticker} 현재 가격 조회 실패:`, {
            message: error?.message,
            stack: error?.stack?.substring(0, 200),
          });
          const key = tickerToKey[ticker] || ticker;
          // Fallback: 마지막 종가 사용 (원본과 동일)
          if (close[key] && close[key].length > 0) {
            const lastClose = close[key][close[key].length - 1];
            if (lastClose > 0) {
              currentPrices[key] = lastClose;
              console.log(`${key} (${ticker}) 현재 가격 (fallback 종가, 에러 후): ${lastClose}`);
            } else {
              console.warn(`${key} (${ticker}) 마지막 종가가 0입니다 (에러 후).`);
            }
          } else {
            console.warn(`${key} (${ticker}) close 데이터가 없습니다 (에러 후).`);
          }
        }
      })
    );
  } catch (error: any) {
    console.error('현재 가격 조회 중 오류:', error?.message);
  }
  
  console.log('quote 조회 후 currentPrices:', currentPrices);
  
  // 모든 티커에 대해 fallback 확인 (값이 없거나 0이면 마지막 종가 사용)
  // 원본과 동일: 모든 키에 대해 값이 있는지 확인하고, 없으면 마지막 종가 사용
  allKeys.forEach((key) => {
    if (!currentPrices[key] || currentPrices[key] <= 0) {
      if (close[key] && close[key].length > 0) {
        const lastClose = close[key][close[key].length - 1];
        if (lastClose > 0) {
          currentPrices[key] = lastClose;
          console.log(`${key} 현재 가격 (최종 fallback, 마지막 종가): ${lastClose}`);
        } else {
          console.warn(`${key} 마지막 종가가 0입니다. 데이터 길이: ${close[key].length}`);
        }
      } else {
        console.warn(`${key} close 데이터가 없습니다.`);
      }
    }
  });
  
  // 원본과 동일: JXY 및 JPY/KRW 계산
  // USD_JPY와 USD_KRW가 모두 있어야 계산 가능
  const hasUsdJpy = currentPrices['USD_JPY'] && currentPrices['USD_JPY'] > 0;
  const hasUsdKrw = currentPrices['USD_KRW'] && currentPrices['USD_KRW'] > 0;
  
  console.log('JXY/JPY_KRW 계산 준비:', {
    hasUsdJpy,
    hasUsdKrw,
    usdJpyValue: currentPrices['USD_JPY'],
    usdKrwValue: currentPrices['USD_KRW'],
  });
  
  if (hasUsdJpy && hasUsdKrw) {
    // JXY (일본 엔화 커런시 인덱스) - USD/JPY 역수로 계산
    currentPrices['JXY'] = 100 / currentPrices['USD_JPY'];
    
    // JPY/KRW (엔/원 환율) - USD/KRW / USD/JPY로 계산
    currentPrices['JPY_KRW'] = currentPrices['USD_KRW'] / currentPrices['USD_JPY'];
    console.log(`JXY 계산: ${currentPrices['JXY']}, JPY/KRW 계산: ${currentPrices['JPY_KRW']}`);
  } else {
    // Fallback: 마지막 종가 사용
    const hasUsdJpyClose = close['USD_JPY'] && close['USD_JPY'].length > 0;
    const hasUsdKrwClose = close['USD_KRW'] && close['USD_KRW'].length > 0;
    
    console.log('JXY/JPY_KRW fallback 준비:', {
      hasUsdJpyClose,
      hasUsdKrwClose,
      usdJpyCloseLength: close['USD_JPY']?.length || 0,
      usdKrwCloseLength: close['USD_KRW']?.length || 0,
    });
    
    if (hasUsdJpyClose && hasUsdKrwClose) {
      const usdJpy = close['USD_JPY'][close['USD_JPY'].length - 1];
      const usdKrw = close['USD_KRW'][close['USD_KRW'].length - 1];
      
      console.log('JXY/JPY_KRW fallback 값:', {
        usdJpy,
        usdKrw,
      });
      
      if (usdJpy > 0 && usdKrw > 0) {
        currentPrices['JXY'] = 100 / usdJpy;
        currentPrices['JPY_KRW'] = usdKrw / usdJpy;
        console.log(`JXY 계산 (fallback): ${currentPrices['JXY']}, JPY/KRW 계산 (fallback): ${currentPrices['JPY_KRW']}`);
      } else {
        console.warn('JXY/JPY_KRW fallback 실패: USD_JPY 또는 USD_KRW가 0입니다.');
      }
    } else {
      console.warn('JXY/JPY_KRW fallback 실패: close 데이터가 없습니다.');
    }
  }
  
  // 디버깅: currentPrices 최종 확인
  console.log('최종 currentPrices (모든 키):', Object.keys(currentPrices).map(key => ({
    key,
    value: currentPrices[key],
    hasValue: !!currentPrices[key] && currentPrices[key] > 0,
  })));
  
  // 실시간 환율 가져오기 (UI 표시용)
  const { fetchCurrentRates } = await import('./exchange-rate');
  const realtimeRates = await fetchCurrentRates();

  return {
    close,
    high,
    low,
    dates: validDates,
    currentRates: realtimeRates, // UI 표시용 실시간 환율
    currentPrices, // 원본과 동일: 각 통화 쌍의 현재 가격 (DXY 계산용)
  };
}

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
export function calculateCurrentDxy(currentRates: Record<string, number>): number {
  // 원본과 동일: 모든 통화 쌍의 현재가 필요
  let product = 1.0;
  
  for (const [key, weight] of Object.entries(DXY_WEIGHTS)) {
    if (currentRates[key] && currentRates[key] > 0) {
      product *= Math.pow(currentRates[key], weight);
    } else {
      return 0.0;
    }
  }
  
  return DXY_INITIAL_CONSTANT * product;
}

