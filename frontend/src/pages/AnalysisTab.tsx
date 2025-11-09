import { useState, useEffect, useMemo, useCallback } from 'react';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Indicator } from '@/components/Indicator';
import { Chart } from '@/components/Chart';
import { calculateCurrentDxy, calculateDollarIndexSeries } from '@/utils/calculations';

export const AnalysisTab = () => {
  const [currency, setCurrency] = useState<'dollar' | 'jpy'>('dollar');
  const [period, setPeriod] = useState(12);
  const { fetchPeriodData, periodData, currentRates, loading, error } = useExchangeRateStore();
  const [chartData, setChartData] = useState<any>(null);

  // 1년치 데이터만 가져오기 (최초 1회)
  useEffect(() => {
    if (!periodData[12]) {
      fetchPeriodData(12);
    }
  }, []);

  // 데이터를 기간에 맞게 필터링하는 함수
  const filterDataByPeriod = (fullData: any, periodMonths: number) => {
    if (!fullData || !fullData.dates || fullData.dates.length === 0) {
      return null;
    }

    // 1년 데이터면 그대로 반환
    if (periodMonths === 12) {
      return fullData;
    }

    // 오늘 날짜 기준으로 N개월 전 날짜 계산
    const today = new Date();
    const targetDate = new Date();
    targetDate.setMonth(today.getMonth() - periodMonths);
    
    // 날짜 문자열을 Date 객체로 변환하여 비교
    const dates = fullData.dates;
    let startIndex = 0;
    
    // targetDate 이후의 첫 번째 인덱스 찾기
    for (let i = 0; i < dates.length; i++) {
      const dateStr = dates[i];
      const date = new Date(dateStr);
      if (date >= targetDate) {
        startIndex = i;
        break;
      }
    }
    
    // 최근 데이터만 추출 (startIndex부터 끝까지)
    const filteredDates = dates.slice(startIndex);
    
    // 각 통화쌍별 데이터 필터링
    const filteredDfClose: Record<string, number[]> = {};
    const filteredDfHigh: Record<string, number[]> = {};
    const filteredDfLow: Record<string, number[]> = {};
    
    if (fullData.dfClose) {
      for (const [key, values] of Object.entries(fullData.dfClose)) {
        if (Array.isArray(values)) {
          filteredDfClose[key] = values.slice(startIndex);
        }
      }
    }
    
    if (fullData.dfHigh) {
      for (const [key, values] of Object.entries(fullData.dfHigh)) {
        if (Array.isArray(values)) {
          filteredDfHigh[key] = values.slice(startIndex);
        }
      }
    }
    
    if (fullData.dfLow) {
      for (const [key, values] of Object.entries(fullData.dfLow)) {
        if (Array.isArray(values)) {
          filteredDfLow[key] = values.slice(startIndex);
        }
      }
    }
    
    return {
      dfClose: filteredDfClose,
      dfHigh: filteredDfHigh,
      dfLow: filteredDfLow,
      currentRates: fullData.currentRates,
      dates: filteredDates,
    };
  };

  // 필터링된 데이터 가져오기
  const getFilteredData = useCallback(() => {
    const fullYearData = periodData[12];
    if (!fullYearData) return null;
    return filterDataByPeriod(fullYearData, period);
  }, [periodData, period]);

  useEffect(() => {
    const data = getFilteredData();
    if (data) {
      loadChartData(data);
    }
  }, [getFilteredData, currency]);

  const loadChartData = (data: any) => {
    if (!data) return;

    if (currency === 'dollar') {
      // 달러 분석 데이터 준비
      const dxySeries = calculateDollarIndexSeries(data.dfClose);
      const dates = data.dates || [];
      const chartDataPoints = dates.map((date: string, index: number) => ({
        date,
        value: dxySeries[index] || 0,
      }));

      setChartData({
        dxy: chartDataPoints,
        usdKrw: dates.map((date: string, index: number) => ({
          date,
          value: data.dfClose.USD_KRW?.[index] || 0,
        })),
      });
    } else {
      // 엔화 분석 데이터 준비 (0 값 필터링)
      const dates = data.dates || [];
      const jpyKrwClose = data.dfClose.JPY_KRW || [];
      
      // 0 값이 아닌 데이터만 차트에 표시
      const chartDataPoints = dates
        .map((date: string, index: number) => {
          const value = jpyKrwClose[index];
          if (value && value > 0) {
            return {
              date,
              value: value * 100, // 100엔 기준
            };
          }
          return null;
        })
        .filter((point: any) => point !== null);
      
      setChartData({
        jpyKrw: chartDataPoints,
      });
    }
  };

  const analysisData = useMemo(() => {
    const fullYearData = periodData[12];
    if (!fullYearData) return null;
    const data = filterDataByPeriod(fullYearData, period);
    if (!data) return null;
    
    if (currency === 'dollar') {
      // 달러 분석
      const dxySeries = calculateDollarIndexSeries(data.dfClose);
      const currentDxy = calculateCurrentDxy(data.currentRates);

      const dxyHigh = Math.max(...dxySeries);
      const dxyLow = Math.min(...dxySeries);
      const dxyMid = (dxyHigh + dxyLow) / 2;

      const usdKrwHigh = Math.max(...(data.dfHigh.USD_KRW || []));
      const usdKrwLow = Math.min(...(data.dfLow.USD_KRW || []));
      const usdKrwMid = (usdKrwHigh + usdKrwLow) / 2;
      const currentUsdKrw = currentRates?.investingUsd || data.currentRates.USD_KRW;

      const gapCurrent = (currentDxy / currentUsdKrw) * 100;
      const gapMid = (dxyMid / usdKrwMid) * 100;

      const fairRate = (currentDxy / gapMid) * 100;

      return {
        dxy: { current: currentDxy, high: dxyHigh, low: dxyLow, mid: dxyMid },
        usdKrw: { current: currentUsdKrw, high: usdKrwHigh, low: usdKrwLow, mid: usdKrwMid },
        gap: { current: gapCurrent, mid: gapMid },
        fairRate: { current: currentUsdKrw, fair: fairRate },
      };
    } else {
      // 엔화 분석 (0 값 필터링)
      const usdJpyClose = (data.dfClose.USD_JPY || []).filter((rate: number) => rate && rate > 0);
      
      // 0 값을 필터링한 후 JXY 계산
      const jxySeries = usdJpyClose.map((rate: number) => 100 / rate).filter((val: number) => val && val > 0);
      
      // 현재 JXY 계산 (0 값 체크)
      let currentJxy = 0;
      if (data.currentRates.JXY && data.currentRates.JXY > 0) {
        currentJxy = data.currentRates.JXY;
      } else if (data.currentRates.USD_JPY && data.currentRates.USD_JPY > 0) {
        currentJxy = 100 / data.currentRates.USD_JPY;
      }

      // 유효한 데이터가 없는 경우 기본값 반환
      if (jxySeries.length === 0) {
        return {
          jxy: { current: currentJxy, high: 0, low: 0, mid: 0 },
          jpyKrw: { current: 0, high: 0, low: 0, mid: 0 },
          gap: { current: 0, mid: 0 },
          fairRate: { current: 0, fair: 0 },
        };
      }

      const jxyHigh = Math.max(...jxySeries);
      const jxyLow = Math.min(...jxySeries);
      const jxyMid = (jxyHigh + jxyLow) / 2;

      // JPY/KRW 데이터 필터링 (0 값 제거)
      const jpyKrwHigh = (data.dfHigh.JPY_KRW || []).filter((rate: number) => rate && rate > 0);
      const jpyKrwLow = (data.dfLow.JPY_KRW || []).filter((rate: number) => rate && rate > 0);
      
      // 현재 JPY/KRW 값 (0 값 체크)
      let currentJpyKrw = 0;
      if (currentRates?.investingJpy && currentRates.investingJpy > 0) {
        currentJpyKrw = currentRates.investingJpy;
      } else if (data.currentRates.JPY_KRW && data.currentRates.JPY_KRW > 0) {
        currentJpyKrw = data.currentRates.JPY_KRW;
      }

      // 유효한 데이터가 없는 경우 기본값 반환
      if (jpyKrwHigh.length === 0 || jpyKrwLow.length === 0) {
        return {
          jxy: { current: currentJxy, high: jxyHigh, low: jxyLow, mid: jxyMid },
          jpyKrw: { current: currentJpyKrw, high: 0, low: 0, mid: 0 },
          gap: { current: 0, mid: 0 },
          fairRate: { current: currentJpyKrw * 100, fair: 0 },
        };
      }

      const jpyKrwHighValue = Math.max(...jpyKrwHigh);
      const jpyKrwLowValue = Math.min(...jpyKrwLow);
      const jpyKrwMid = (jpyKrwHighValue + jpyKrwLowValue) / 2;

      // 갭 비율 계산 (유효한 값이 있을 때만)
      let gapCurrent = 0;
      let gapMid = 0;
      let fairRate = 0;
      
      if (currentJxy > 0 && currentJpyKrw > 0) {
        gapCurrent = ((currentJxy * 100) / (currentJpyKrw * 100)) * 100;
      }
      
      if (jxyMid > 0 && jpyKrwMid > 0) {
        gapMid = ((jxyMid * 100) / (jpyKrwMid * 100)) * 100;
        const midGapRatio = jxyMid / jpyKrwMid;
        if (midGapRatio > 0 && currentJxy > 0) {
          // fairRate는 1엔당 원화로 계산 (100을 곱하지 않음)
          fairRate = currentJxy / midGapRatio;
        }
      }

      return {
        jxy: { current: currentJxy, high: jxyHigh, low: jxyLow, mid: jxyMid },
        jpyKrw: { current: currentJpyKrw, high: jpyKrwHighValue, low: jpyKrwLowValue, mid: jpyKrwMid },
        gap: { current: gapCurrent, mid: gapMid },
        // 100엔당으로 표시하기 위해 100을 곱함
        fairRate: { current: currentJpyKrw * 100, fair: fairRate * 100 },
      };
    }
  }, [periodData, period, currency, currentRates]);

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => fetchPeriodData(12)}
      />
    );
  }

  if (loading && !analysisData) {
    return <LoadingSpinner />;
  }

  if (!analysisData) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-600">데이터를 불러오는 중...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            💱 통화 선택
          </label>
          <div className="flex gap-2">
            <Button
              variant={currency === 'dollar' ? 'primary' : 'secondary'}
              onClick={() => setCurrency('dollar')}
            >
              💵 달러
            </Button>
            <Button
              variant={currency === 'jpy' ? 'primary' : 'secondary'}
              onClick={() => setCurrency('jpy')}
            >
              💴 엔화
            </Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            📅 분석 기간
          </label>
          <select
            className="input"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={1}>1개월</option>
            <option value={3}>3개월</option>
            <option value={6}>6개월</option>
            <option value={12}>1년</option>
          </select>
        </div>
      </div>

      {currency === 'dollar' ? (
        <>
          <Indicator
            title="💵 달러지수 (DXY)"
            currentValue={analysisData.dxy.current}
            highValue={analysisData.dxy.high}
            lowValue={analysisData.dxy.low}
            midValue={analysisData.dxy.mid}
            reverseLogic={true}
          />

          <Indicator
            title="💵 달러환율 (USD/KRW)"
            currentValue={analysisData.usdKrw.current}
            highValue={analysisData.usdKrw.high}
            lowValue={analysisData.usdKrw.low}
            midValue={analysisData.usdKrw.mid}
            unit="원"
            reverseLogic={true}
          />

          <Indicator
            title="📊 달러 갭 비율"
            currentValue={analysisData.gap.current}
            highValue={analysisData.gap.mid * 1.5}
            lowValue={analysisData.gap.mid * 0.5}
            midValue={analysisData.gap.mid}
            unit="%"
            hideHighLow={true}
            reverseLogic={false}
          />

          <Indicator
            title="💰 적정 환율"
            currentValue={analysisData.fairRate.current}
            highValue={analysisData.fairRate.fair * 1.2}
            lowValue={analysisData.fairRate.fair * 0.8}
            midValue={analysisData.fairRate.fair}
            unit="원"
            hideHighLow={true}
            reverseLogic={true}
          />

          {chartData?.dxy && (
            <Chart
              title={`💵 달러 인덱스 (DXY) ${period === 12 ? '1년' : `${period}개월`} 차트`}
              data={chartData.dxy}
              currentValue={analysisData.dxy.current}
              highValue={analysisData.dxy.high}
              lowValue={analysisData.dxy.low}
              midValue={analysisData.dxy.mid}
              yAxisLabel="DXY"
            />
          )}

          {chartData?.usdKrw && (
            <Chart
              title={`💵 달러환율 (USD/KRW) ${period === 12 ? '1년' : `${period}개월`} 차트`}
              data={chartData.usdKrw}
              currentValue={analysisData.usdKrw.current}
              highValue={analysisData.usdKrw.high}
              lowValue={analysisData.usdKrw.low}
              midValue={analysisData.usdKrw.mid}
              yAxisLabel="원"
            />
          )}
        </>
      ) : (
        <>
          <Indicator
            title="💴 엔화지수 (JXY)"
            currentValue={analysisData.jxy.current}
            highValue={analysisData.jxy.high}
            lowValue={analysisData.jxy.low}
            midValue={analysisData.jxy.mid}
            reverseLogic={true}
          />

          <Indicator
            title="💴 엔화환율 (JPY/KRW, 100엔당)"
            currentValue={analysisData.jpyKrw.current * 100}
            highValue={analysisData.jpyKrw.high * 100}
            lowValue={analysisData.jpyKrw.low * 100}
            midValue={analysisData.jpyKrw.mid * 100}
            unit="원"
            reverseLogic={true}
          />

          <Indicator
            title="📊 엔화 갭 비율"
            currentValue={analysisData.gap.current}
            highValue={analysisData.gap.mid * 1.5}
            lowValue={analysisData.gap.mid * 0.5}
            midValue={analysisData.gap.mid}
            unit="%"
            hideHighLow={true}
            reverseLogic={false}
          />

          <Indicator
            title="💰 적정 환율 (100엔당)"
            currentValue={analysisData.fairRate.current}
            highValue={analysisData.fairRate.fair * 1.2}
            lowValue={analysisData.fairRate.fair * 0.8}
            midValue={analysisData.fairRate.fair}
            unit="원"
            hideHighLow={true}
            reverseLogic={true}
          />

          {chartData?.jpyKrw && (
            <Chart
              title={`💴 엔화환율 (JPY/KRW, 100엔당) ${period === 12 ? '1년' : `${period}개월`} 차트`}
              data={chartData.jpyKrw}
              currentValue={analysisData.fairRate.current}
              highValue={analysisData.jpyKrw.high * 100}
              lowValue={analysisData.jpyKrw.low * 100}
              midValue={analysisData.jpyKrw.mid * 100}
              yAxisLabel="원"
              yAxisDecimals={4}
            />
          )}
        </>
      )}
    </div>
  );
};
