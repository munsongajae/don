'use client';

import { useEffect, useState } from 'react';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import MetricCard from '@/components/metrics/MetricCard';
import { formatKrw, formatPercentage } from '@/lib/utils/formatters';
import { calculateDollarIndexSeries, calculateCurrentDxy, calculateJpyIndexSeries, calculateCurrentJxy, calculateIndicatorSignal, calculateIndicatorSignals } from '@/lib/utils/calculations';

export default function SummaryPage() {
  const { currentRates, periodData, loading, fetchCurrentRates, fetchPeriodData } = useExchangeRateStore();
  const [signals, setSignals] = useState<Record<number, any>>({});
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    fetchCurrentRates();
    // 모든 기간 데이터 가져오기
    [1, 3, 6, 12].forEach(period => {
      fetchPeriodData(period);
    });
  }, []);

  // 클라이언트에서만 시간 업데이트 (hydration 에러 방지)
  useEffect(() => {
    // 초기 시간 설정만 (서버에서는 빈 문자열로 시작)
    setCurrentTime(new Date().toLocaleString('ko-KR'));
  }, []);

  useEffect(() => {
    // 기간별 신호 계산
    const newSignals: Record<number, any> = {};
    
    [1, 3, 6, 12].forEach(period => {
      const data = periodData[period];
      if (!data) return;

      try {
        const dxySeries = calculateDollarIndexSeries(data.close);
        
        // 원본과 동일: currentPrices에서 현재 가격 가져오기
        const currentPrices = data.currentPrices || {};
        
        console.log(`기간 ${period}개월: currentPrices:`, currentPrices);
        
        // currentPrices가 비어있거나 값이 없으면 마지막 종가 사용 (fallback)
        const getCurrentPrice = (key: string): number => {
          if (currentPrices[key] && currentPrices[key] > 0) {
            console.log(`기간 ${period}개월: ${key} 현재 가격 (currentPrices): ${currentPrices[key]}`);
            return currentPrices[key];
          }
          // Fallback: 마지막 종가 사용
          const closeArray = data.close[key] || [];
          if (closeArray.length > 0) {
            const lastClose = closeArray[closeArray.length - 1];
            if (lastClose > 0) {
              console.log(`기간 ${period}개월: ${key} 현재 가격 (fallback 종가): ${lastClose}`);
              return lastClose;
            } else {
              console.warn(`기간 ${period}개월: ${key} 마지막 종가가 0입니다.`);
            }
          } else {
            console.warn(`기간 ${period}개월: ${key} close 데이터가 없습니다.`);
          }
          console.warn(`기간 ${period}개월: ${key} 현재 가격을 가져올 수 없습니다. 0 반환.`);
          return 0;
        };
        
        const dxyHigh = Math.max(...dxySeries);
        const dxyLow = Math.min(...dxySeries);
        const dxyMid = (dxyHigh + dxyLow) / 2;
        
        // DXY 구성 통화별 현재 가격 가져오기
        const eurUsd = getCurrentPrice('EUR_USD');
        const usdJpy = getCurrentPrice('USD_JPY');
        const gbpUsd = getCurrentPrice('GBP_USD');
        const usdCad = getCurrentPrice('USD_CAD');
        const usdSek = getCurrentPrice('USD_SEK');
        const usdChf = getCurrentPrice('USD_CHF');
        
        console.log(`기간 ${period}개월: DXY 구성 통화 현재 가격:`, {
          EUR_USD: eurUsd,
          USD_JPY: usdJpy,
          GBP_USD: gbpUsd,
          USD_CAD: usdCad,
          USD_SEK: usdSek,
          USD_CHF: usdChf,
        });
        
        const currentDxy = calculateCurrentDxy({
          EUR_USD: eurUsd,
          USD_JPY: usdJpy,
          GBP_USD: gbpUsd,
          USD_CAD: usdCad,
          USD_SEK: usdSek,
          USD_CHF: usdChf,
        });
        
        console.log(`기간 ${period}개월: 계산된 currentDxy:`, currentDxy);

        const usdKrwHigh = Math.max(...(data.high.USD_KRW || []));
        const usdKrwLow = Math.min(...(data.low.USD_KRW || []));
        const usdKrwMid = (usdKrwHigh + usdKrwLow) / 2;
        // 원본과 동일: currentPrices에서 USD_KRW 가져오기 (우선순위: currentPrices > fallback 종가 > investingUsd > hanaRate)
        let currentUsdKrw = currentPrices.USD_KRW || 0;
        if (currentUsdKrw === 0) {
          // Fallback: 마지막 종가 사용
          currentUsdKrw = getCurrentPrice('USD_KRW');
        }
        if (currentUsdKrw === 0) {
          // 추가 Fallback: 실시간 환율 사용
          currentUsdKrw = data.currentRates.investingUsd || data.currentRates.hanaRate || 0;
        }
        console.log(`기간 ${period}개월: currentUsdKrw:`, currentUsdKrw, {
          fromCurrentPrices: currentPrices.USD_KRW,
          fromClose: getCurrentPrice('USD_KRW'),
          fromRealtime: data.currentRates.investingUsd || data.currentRates.hanaRate,
        });

        // JXY 계산 (원본과 동일: currentPrices에서 가져오기, 없으면 계산)
        let currentJxy = currentPrices.JXY || 0;
        if (currentJxy === 0) {
          // Fallback: USD_JPY로부터 계산
          const usdJpy = getCurrentPrice('USD_JPY');
          if (usdJpy > 0) {
            currentJxy = 100 / usdJpy;
          }
        }
        const jxySeries = calculateJpyIndexSeries(data.close);
        if (jxySeries.length === 0) {
          console.warn(`기간 ${period}개월: JXY 시리즈 데이터가 없습니다.`);
          return;
        }
        const jxyHigh = Math.max(...jxySeries);
        const jxyLow = Math.min(...jxySeries);
        const jxyMid = (jxyHigh + jxyLow) / 2;

        // JPY/KRW 계산 (원본과 동일: currentPrices에서 가져오기, 없으면 계산)
        let currentJpyKrw = currentPrices.JPY_KRW || 0;
        if (currentJpyKrw === 0) {
          // Fallback: USD_KRW와 USD_JPY로부터 계산
          const usdKrw = getCurrentPrice('USD_KRW');
          const usdJpy = getCurrentPrice('USD_JPY');
          if (usdKrw > 0 && usdJpy > 0) {
            currentJpyKrw = usdKrw / usdJpy;
          } else {
            currentJpyKrw = data.currentRates.investingJpy || 0;
          }
        }
        const jpyKrwHigh = Math.max(...((data.high.JPY_KRW || []).filter(v => v > 0)));
        const jpyKrwLow = Math.min(...((data.low.JPY_KRW || []).filter(v => v > 0)));
        const jpyKrwMid = jpyKrwHigh > 0 && jpyKrwLow > 0 ? (jpyKrwHigh + jpyKrwLow) / 2 : 0;

        // 지표 계산 (모든 값이 유효한 경우에만)
        if (currentDxy > 0 && dxyMid > 0 && currentUsdKrw > 0 && usdKrwMid > 0 && 
            currentJxy > 0 && jxyMid > 0 && currentJpyKrw > 0 && jpyKrwMid > 0) {
          const periodSignals = calculateIndicatorSignals(
            currentDxy,
            dxyMid,
            currentUsdKrw,
            usdKrwMid,
            currentJxy,
            jxyMid,
            currentJpyKrw,
            jpyKrwMid
          );

          newSignals[period] = periodSignals;
          console.log(`기간 ${period}개월 지표 계산 완료:`, periodSignals);
        } else {
          console.warn(`기간 ${period}개월: 일부 값이 0이어서 지표 계산 불가.`, {
            currentDxy,
            dxyMid,
            currentUsdKrw,
            usdKrwMid,
            currentJxy,
            jxyMid,
            currentJpyKrw,
            jpyKrwMid,
          });
        }
      } catch (error) {
        console.error(`기간 ${period}개월 신호 계산 실패:`, error);
      }
    });

    setSignals(newSignals);
  }, [periodData]);

  // 김치프리미엄 계산
  const kimchiPremium = currentRates && currentRates.usdtKrw && currentRates.investingUsd
    ? ((currentRates.usdtKrw / currentRates.investingUsd - 1) * 100)
    : 0;
  const kimchiDiff = currentRates && currentRates.usdtKrw && currentRates.investingUsd
    ? currentRates.usdtKrw - currentRates.investingUsd
    : 0;

  const periods = [1, 3, 6, 12];
  const periodNames: Record<number, string> = {
    1: '1개월',
    3: '3개월',
    6: '6개월',
    12: '1년',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          환율 투자 관리
        </h1>
        {currentTime && (
          <p className="text-gray-500">
            마지막 업데이트: {currentTime}
          </p>
        )}
      </div>

      {/* 실시간 환율 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💱 실시간 환율</h2>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="USD/KRW (인베스팅)"
            value={currentRates ? formatKrw(currentRates.investingUsd) : '로딩 중...'}
            icon="💵"
          />
          <MetricCard
            title="USD/KRW (하나은행)"
            value={currentRates ? formatKrw(currentRates.hanaRate) : '로딩 중...'}
            icon="🏦"
          />
          <MetricCard
            title="USDT/KRW (빗썸)"
            value={currentRates ? formatKrw(currentRates.usdtKrw) : '로딩 중...'}
            icon="₿"
          />
          <MetricCard
            title="JPY/KRW (인베스팅)"
            value={currentRates ? `${currentRates.investingJpy.toFixed(4)}원` : '로딩 중...'}
            icon="💴"
          />
          <MetricCard
            title="김치프리미엄"
            value={formatPercentage(kimchiPremium)}
            subtitle={formatKrw(kimchiDiff)}
            trend={kimchiPremium >= 0 ? 'up' : 'down'}
            trendValue={formatPercentage(Math.abs(kimchiPremium))}
            icon="🔥"
            className="col-span-2"
          />
        </div>
      </div>

      {/* 달러 투자 지표 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💵 달러 투자 지표</h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">기간</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">달러지수</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">원달러환율</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">갭 비율</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">적정환율</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const periodSignal = signals[period];
                return (
                  <tr key={period} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{periodNames[period]}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.dxy === 'O'
                            ? 'text-green-600'
                            : periodSignal?.dxy === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.dxy || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.usd_krw === 'O'
                            ? 'text-green-600'
                            : periodSignal?.usd_krw === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.usd_krw || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.gap_ratio === 'O'
                            ? 'text-green-600'
                            : periodSignal?.gap_ratio === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.gap_ratio || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.fair_rate === 'O'
                            ? 'text-green-600'
                            : periodSignal?.fair_rate === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.fair_rate || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 엔화 투자 지표 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💴 엔화 투자 지표</h2>
        <div className="bg-white rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">기간</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">엔화지수</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">엔화환율</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">갭 비율</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">적정환율</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const periodSignal = signals[period];
                return (
                  <tr key={period} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{periodNames[period]}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.jxy === 'O'
                            ? 'text-green-600'
                            : periodSignal?.jxy === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.jxy || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.jpy_krw === 'O'
                            ? 'text-green-600'
                            : periodSignal?.jpy_krw === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.jpy_krw || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.jpy_gap_ratio === 'O'
                            ? 'text-green-600'
                            : periodSignal?.jpy_gap_ratio === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.jpy_gap_ratio || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-2xl font-bold ${
                          periodSignal?.jpy_fair_rate === 'O'
                            ? 'text-green-600'
                            : periodSignal?.jpy_fair_rate === 'X'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {periodSignal?.jpy_fair_rate || '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="text-center text-gray-500 py-8">데이터 로딩 중...</div>
      )}
    </div>
  );
}
