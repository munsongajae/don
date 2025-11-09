import { useEffect, useState, useCallback } from 'react';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import { MetricCard } from '@/components/MetricCard';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { calculateIndicatorSignals } from '@/utils/calculations';
import { calculateCurrentDxy, calculateDollarIndexSeries } from '@/utils/calculations';

const PERIODS = [1, 3, 6, 12];
const PERIOD_NAMES: Record<number, string> = {
  1: '1개월',
  3: '3개월',
  6: '6개월',
  12: '1년',
};

export const SummaryTab = () => {
  const { currentRates, fetchCurrentRates, fetchPeriodData, periodData } = useExchangeRateStore();
  const [allSignals, setAllSignals] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentRates();
  }, []);

  // 데이터를 기간에 맞게 필터링하는 함수 (날짜 기준)
  const filterDataByPeriod = useCallback((fullData: any, periodMonths: number) => {
    if (!fullData || !fullData.dates || fullData.dates.length === 0) {
      return null;
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
  }, []);

  const fetchAllPeriodData = useCallback(async () => {
    if (!currentRates) return;
    
    setLoading(true);
    const signals: Record<number, any> = {};

    // 1년치 데이터만 가져오기
    try {
      await fetchPeriodData(12);
    } catch (error) {
      console.error('Error fetching 1-year data:', error);
      setLoading(false);
      return;
    }

    // 데이터를 가져온 후 계산
    await new Promise(resolve => setTimeout(resolve, 500));
    const store = useExchangeRateStore.getState();
    
    // 1년치 데이터 가져오기
    const fullYearData = store.periodData[12];
    
    if (!fullYearData || !fullYearData.dates || fullYearData.dates.length === 0) {
      setLoading(false);
      return;
    }

    // 각 기간별로 데이터 필터링 및 계산
    for (const period of PERIODS) {
      try {
        // 1년치 데이터에서 필요한 기간만 필터링
        const data = period === 12 
          ? fullYearData 
          : filterDataByPeriod(fullYearData, period);
        if (!data || !data.dates || data.dates.length === 0) {
          signals[period] = {
            dxy: '-',
            usd_krw: '-',
            gap_ratio: '-',
            fair_rate: '-',
            jxy: '-',
            jpy_krw: '-',
            jpy_gap_ratio: '-',
            jpy_fair_rate: '-',
          };
          continue;
        }
        
        // 데이터가 비어있는지 확인
        const hasData = data.dfClose && Object.keys(data.dfClose).length > 0 && 
                       data.dfClose[Object.keys(data.dfClose)[0]]?.length > 0;
        if (!hasData) {
          signals[period] = {
            dxy: '-',
            usd_krw: '-',
            gap_ratio: '-',
            fair_rate: '-',
            jxy: '-',
            jpy_krw: '-',
            jpy_gap_ratio: '-',
            jpy_fair_rate: '-',
          };
          continue;
        }

        // 달러 지표 계산
        const dxySeries = calculateDollarIndexSeries(data.dfClose);
        const currentDxy = calculateCurrentDxy(data.currentRates);

        // 데이터가 있는지 확인
        if (dxySeries.length === 0) {
          signals[period] = {
            dxy: '-',
            usd_krw: '-',
            gap_ratio: '-',
            fair_rate: '-',
            jxy: '-',
            jpy_krw: '-',
            jpy_gap_ratio: '-',
            jpy_fair_rate: '-',
          };
          continue;
        }

        const dxy52wHigh = Math.max(...dxySeries);
        const dxy52wLow = Math.min(...dxySeries);
        const dxy52wMid = (dxy52wHigh + dxy52wLow) / 2;

        const usdKrwClose = data.dfClose.USD_KRW || [];
        const usdKrwHigh = data.dfHigh.USD_KRW || [];
        const usdKrwLow = data.dfLow.USD_KRW || [];
        const currentUsdKrw = currentRates?.investingUsd || data.currentRates?.USD_KRW || 0;

        const usdKrw52wHigh = Math.max(...usdKrwHigh);
        const usdKrw52wLow = Math.min(...usdKrwLow);
        const usdKrw52wMid = (usdKrw52wHigh + usdKrw52wLow) / 2;

        // 엔화 지표 계산 (0 값 필터링)
        const usdJpyClose = (data.dfClose.USD_JPY || []).filter((rate: number) => rate && rate > 0);
        const usdJpyHigh = (data.dfHigh.USD_JPY || []).filter((rate: number) => rate && rate > 0);
        const usdJpyLow = (data.dfLow.USD_JPY || []).filter((rate: number) => rate && rate > 0);

        // 0 값을 필터링한 후 계산
        const jxyClose = usdJpyClose.map((rate: number) => 100 / rate).filter((val: number) => val && val > 0);
        const jxyHigh = usdJpyLow.map((rate: number) => 100 / rate).filter((val: number) => val && val > 0);
        const jxyLow = usdJpyHigh.map((rate: number) => 100 / rate).filter((val: number) => val && val > 0);

        // 현재 JXY 계산 (0 값 체크)
        let currentJxy = 0;
        if (data.currentRates.JXY && data.currentRates.JXY > 0) {
          currentJxy = data.currentRates.JXY;
        } else if (data.currentRates.USD_JPY && data.currentRates.USD_JPY > 0) {
          currentJxy = 100 / data.currentRates.USD_JPY;
        }

        // 유효한 데이터가 없는 경우 스킵
        if (jxyHigh.length === 0 || jxyLow.length === 0) {
          signals[period] = {
            dxy: signals[period]?.dxy || '-',
            usd_krw: signals[period]?.usd_krw || '-',
            gap_ratio: signals[period]?.gap_ratio || '-',
            fair_rate: signals[period]?.fair_rate || '-',
            jxy: '-',
            jpy_krw: '-',
            jpy_gap_ratio: '-',
            jpy_fair_rate: '-',
          };
          continue;
        }

        const jxy52wHigh = Math.max(...jxyHigh);
        const jxy52wLow = Math.min(...jxyLow);
        const jxy52wMid = (jxy52wHigh + jxy52wLow) / 2;

        // JPY/KRW 데이터 필터링 (0 값 제거)
        const jpyKrwClose = (data.dfClose.JPY_KRW || []).filter((rate: number) => rate && rate > 0);
        const jpyKrwHigh = (data.dfHigh.JPY_KRW || []).filter((rate: number) => rate && rate > 0);
        const jpyKrwLow = (data.dfLow.JPY_KRW || []).filter((rate: number) => rate && rate > 0);
        
        // 현재 JPY/KRW 값 (0 값 체크)
        let currentJpyKrw = 0;
        if (currentRates?.investingJpy && currentRates.investingJpy > 0) {
          currentJpyKrw = currentRates.investingJpy;
        } else if (data.currentRates.JPY_KRW && data.currentRates.JPY_KRW > 0) {
          currentJpyKrw = data.currentRates.JPY_KRW;
        }

        // 유효한 데이터가 없는 경우 스킵
        if (jpyKrwHigh.length === 0 || jpyKrwLow.length === 0) {
          signals[period] = {
            dxy: signals[period]?.dxy || '-',
            usd_krw: signals[period]?.usd_krw || '-',
            gap_ratio: signals[period]?.gap_ratio || '-',
            fair_rate: signals[period]?.fair_rate || '-',
            jxy: currentJxy > 0 && jxy52wMid > 0 ? (currentJxy < jxy52wMid ? 'O' : 'X') : '-',
            jpy_krw: '-',
            jpy_gap_ratio: '-',
            jpy_fair_rate: '-',
          };
          continue;
        }

        const jpyKrw52wHigh = Math.max(...jpyKrwHigh);
        const jpyKrw52wLow = Math.min(...jpyKrwLow);
        const jpyKrw52wMid = (jpyKrw52wHigh + jpyKrw52wLow) / 2;

        // 신호 계산
        const periodSignals = calculateIndicatorSignals(
          currentDxy,
          dxy52wMid,
          currentUsdKrw,
          usdKrw52wMid,
          currentJxy,
          jxy52wMid,
          currentJpyKrw,
          jpyKrw52wMid
        );

        signals[period] = periodSignals;
      } catch (error) {
        console.error(`Error calculating signals for period ${period}:`, error);
        signals[period] = {
          dxy: '-',
          usd_krw: '-',
          gap_ratio: '-',
          fair_rate: '-',
          jxy: '-',
          jpy_krw: '-',
          jpy_gap_ratio: '-',
          jpy_fair_rate: '-',
        };
      }
    }

    setAllSignals(signals);
    setLoading(false);
  }, [currentRates, fetchPeriodData, filterDataByPeriod]);

  useEffect(() => {
    if (currentRates) {
      fetchAllPeriodData();
    }
  }, [currentRates, fetchAllPeriodData]);

  // 김치프리미엄 계산
  const kimchiPct =
    currentRates?.usdtKrw && currentRates?.investingUsd && currentRates.investingUsd > 0
      ? ((currentRates.usdtKrw / currentRates.investingUsd - 1) * 100)
      : 0;
  const diffKrw =
    currentRates?.usdtKrw && currentRates?.investingUsd
      ? currentRates.usdtKrw - currentRates.investingUsd
      : 0;

  const SignalCell = ({ signal }: { signal: string }) => {
    const isO = signal === 'O';
    const isX = signal === 'X';
    return (
      <td className="px-4 py-3 text-center">
        {isO && <span className="text-3xl font-bold text-green-600">O</span>}
        {isX && <span className="text-3xl font-bold text-red-600">X</span>}
        {!isO && !isX && <span className="text-lg">-</span>}
      </td>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-600 mb-6">
          모든 기간의 지표를 한눈에 확인하세요. <strong>O</strong>는 매수 신호,{' '}
          <strong>X</strong>는 매도 신호입니다.
        </p>

        <h2 className="text-2xl font-semibold mb-4">💱 실시간 환율</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-3">
            <MetricCard
              label="USD/KRW (인베스팅)"
              value={formatCurrency(currentRates?.investingUsd || 0, '원', false, false, 2)}
            />
            <MetricCard
              label="USDT/KRW (빗썸)"
              value={formatCurrency(currentRates?.usdtKrw || 0, '원', false, true)}
            />
            <MetricCard
              label="JPY/KRW (인베스팅)"
              value={formatCurrency(currentRates?.investingJpy || 0, '원', false, false, 4)}
            />
          </div>
          <div className="space-y-3">
            <MetricCard
              label="USD/KRW (하나은행)"
              value={formatCurrency(currentRates?.hanaRate || 0, '원', false, false, 2)}
            />
            <MetricCard
              label="김치프리미엄"
              value={formatPercentage(kimchiPct, 2, true)}
              delta={formatCurrency(diffKrw, '원', true, true)}
              deltaColor={kimchiPct >= 0 ? 'success' : 'error'}
            />
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      
      {!loading && Object.keys(allSignals).length === 0 && (
        <Card>
          <div className="text-center py-8 text-gray-600">
            데이터를 불러오는 중입니다...
          </div>
        </Card>
      )}

      {!loading && (
        <>
          <div>
            <h2 className="text-2xl font-semibold mb-4">💵 달러 투자 지표</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-center font-semibold">기간</th>
                      <th className="px-4 py-3 text-center font-semibold">달러지수</th>
                      <th className="px-4 py-3 text-center font-semibold">원달러환율</th>
                      <th className="px-4 py-3 text-center font-semibold">갭 비율</th>
                      <th className="px-4 py-3 text-center font-semibold">적정환율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period) => {
                      const signals = allSignals[period] || {};
                      return (
                        <tr key={period} className="border-b border-gray-200">
                          <td className="px-4 py-3 text-center font-semibold">
                            {PERIOD_NAMES[period]}
                          </td>
                          <SignalCell signal={signals.dxy} />
                          <SignalCell signal={signals.usd_krw} />
                          <SignalCell signal={signals.gap_ratio} />
                          <SignalCell signal={signals.fair_rate} />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">💴 엔화 투자 지표</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-center font-semibold">기간</th>
                      <th className="px-4 py-3 text-center font-semibold">엔화지수</th>
                      <th className="px-4 py-3 text-center font-semibold">엔화환율</th>
                      <th className="px-4 py-3 text-center font-semibold">갭 비율</th>
                      <th className="px-4 py-3 text-center font-semibold">적정환율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period) => {
                      const signals = allSignals[period] || {};
                      return (
                        <tr key={period} className="border-b border-gray-200">
                          <td className="px-4 py-3 text-center font-semibold">
                            {PERIOD_NAMES[period]}
                          </td>
                          <SignalCell signal={signals.jxy} />
                          <SignalCell signal={signals.jpy_krw} />
                          <SignalCell signal={signals.jpy_gap_ratio} />
                          <SignalCell signal={signals.jpy_fair_rate} />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card className="bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">📖 지표 설명</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <strong>달러 투자 지표:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    <strong>달러지수</strong>: 현재 DXY가 기간 중간값보다 낮으면 O (매수 신호)
                  </li>
                  <li>
                    <strong>원달러환율</strong>: 현재 USD/KRW가 기간 중간값보다 낮으면 O (매수
                    신호)
                  </li>
                  <li>
                    <strong>갭 비율</strong>: 현재 갭 비율이 기간 중간 갭 비율보다 높으면 O (매수
                    신호)
                  </li>
                  <li>
                    <strong>적정환율</strong>: 현재 환율이 적정 환율보다 낮으면 O (매수 신호)
                  </li>
                </ul>
              </div>
              <div>
                <strong>엔화 투자 지표:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    <strong>엔화지수</strong>: 현재 JXY가 기간 중간값보다 낮으면 O (매수 신호)
                  </li>
                  <li>
                    <strong>엔화환율</strong>: 현재 JPY/KRW가 기간 중간값보다 낮으면 O (매수 신호)
                  </li>
                  <li>
                    <strong>갭 비율</strong>: 현재 갭 비율이 기간 중간 갭 비율보다 높으면 O (매수
                    신호)
                  </li>
                  <li>
                    <strong>적정환율</strong>: 현재 환율이 적정 환율보다 낮으면 O (매수 신호)
                  </li>
                </ul>
              </div>
              <div className="mt-4 text-blue-600">
                💡 <strong>팁</strong>: 여러 기간에서 O가 많을수록 매수 타이밍으로 적합합니다.
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

