'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import MetricCard from '@/components/metrics/MetricCard';
import { formatKrw, formatKrwPlain, formatPercentage } from '@/lib/utils/formatters';
import { calculateDollarIndexSeries, calculateCurrentDxy, calculateJpyIndexSeries, calculateCurrentJxy, calculateIndicatorSignal, calculateIndicatorSignals } from '@/lib/utils/calculations';

interface BankRateData {
  bank: string;
  rate: number;
  time: string;
  date: string;
  currency: string;
}

interface BankRatesResponse {
  KB: BankRateData | null;
  SHINHAN: BankRateData | null;
  HANA: BankRateData | null;
  WOORI: BankRateData | null;
  IBK: BankRateData | null;
  SC: BankRateData | null;
  BUSAN: BankRateData | null;
  IMBANK: BankRateData | null;
  NH: BankRateData | null;
  INVESTING: BankRateData | null;
}

const bankNames: Record<string, string> = {
  KB: '국민은행',
  SHINHAN: '신한은행',
  HANA: '하나은행',
  WOORI: '우리은행',
  IBK: '기업은행',
  SC: 'SC제일은행',
  BUSAN: '부산은행',
  IMBANK: 'IM뱅크',
  NH: 'NH농협은행',
  INVESTING: '인베스팅닷컴',
};

export default function SummaryPage() {
  const { currentRates, periodData, loading, fetchCurrentRates, fetchPeriodData } = useExchangeRateStore();
  const [signals, setSignals] = useState<Record<number, any>>({});
  const [currentTime, setCurrentTime] = useState<string>('');
  const [usdBankRates, setUsdBankRates] = useState<BankRatesResponse | null>(null);
  const [jpyBankRates, setJpyBankRates] = useState<BankRatesResponse | null>(null);
  const [bankRatesLoading, setBankRatesLoading] = useState(false);

  useEffect(() => {
    fetchCurrentRates();
    // 모든 기간 데이터 가져오기
    [1, 3, 6, 12].forEach(period => {
      fetchPeriodData(period);
    });
    
    // 은행별 환율 조회
    const fetchBankRates = async () => {
      setBankRatesLoading(true);
      try {
        const [usdResponse, jpyResponse] = await Promise.all([
          fetch('/api/exchange-rates/banks?currency=USD'),
          fetch('/api/exchange-rates/banks?currency=JPY'),
        ]);

        if (!usdResponse.ok) {
          console.error('USD 환율 조회 실패:', usdResponse.status, usdResponse.statusText);
        }
        if (!jpyResponse.ok) {
          console.error('JPY 환율 조회 실패:', jpyResponse.status, jpyResponse.statusText);
        }

        const [usd, jpy] = await Promise.all([
          usdResponse.ok ? usdResponse.json() : null,
          jpyResponse.ok ? jpyResponse.json() : null,
        ]);

        if (usd) {
          console.log('USD 환율 조회 성공:', {
            totalBanks: Object.keys(usd).length,
            successfulBanks: Object.values(usd).filter((r: any) => r !== null).length,
          });
          setUsdBankRates(usd);
        } else {
          console.error('USD 환율 데이터가 null입니다.');
        }

        if (jpy) {
          console.log('JPY 환율 조회 성공:', {
            totalBanks: Object.keys(jpy).length,
            successfulBanks: Object.values(jpy).filter((r: any) => r !== null).length,
            investingRate: jpy.INVESTING?.rate,
          });
          setJpyBankRates(jpy);
        } else {
          console.error('JPY 환율 데이터가 null입니다.');
        }
      } catch (error) {
        console.error('은행별 환율 조회 실패:', error);
        if (error instanceof Error) {
          console.error('에러 상세:', error.message, error.stack);
        }
      } finally {
        setBankRatesLoading(false);
      }
    };
    
    fetchBankRates();
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
        // 분석 탭과 동일한 데이터 소스 사용 (currentRates 우선)
        let currentUsdKrw = data.currentRates.investingUsd || data.currentRates.hanaRate || 0;
        if (currentUsdKrw === 0) {
          // Fallback: currentPrices 사용
          currentUsdKrw = currentPrices.USD_KRW || 0;
        }
        if (currentUsdKrw === 0) {
          // 추가 Fallback: 마지막 종가 사용
          currentUsdKrw = getCurrentPrice('USD_KRW');
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

        // JPY/KRW 계산 (분석 탭과 동일한 데이터 소스 사용, currentRates 우선)
        let currentJpyKrw = data.currentRates.investingJpy || 0;
        if (currentJpyKrw === 0) {
          // Fallback: currentPrices 사용
          currentJpyKrw = currentPrices.JPY_KRW || 0;
        }
        if (currentJpyKrw === 0) {
          // 추가 Fallback: USD_KRW와 USD_JPY로부터 계산
          const usdKrw = getCurrentPrice('USD_KRW');
          const usdJpy = getCurrentPrice('USD_JPY');
          if (usdKrw > 0 && usdJpy > 0) {
            currentJpyKrw = usdKrw / usdJpy;
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-0">
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          환율 투자 관리
        </h1>
        {currentTime && (
          <p className="text-xs sm:text-sm text-gray-500">
            마지막 업데이트: {currentTime}
          </p>
        )}
      </div>

      {/* 실시간 환율 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">💱 실시간 환율</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <MetricCard
            title="USD/KRW (인베스팅)"
            value={currentRates ? formatKrwPlain(currentRates.investingUsd) : '로딩 중...'}
            icon="💵"
          />
          <MetricCard
            title="USD/KRW (하나은행)"
            value={currentRates ? formatKrwPlain(currentRates.hanaRate) : '로딩 중...'}
            icon="🏦"
          />
          <MetricCard
            title="USDT/KRW (빗썸)"
            value={currentRates ? formatKrwPlain(currentRates.usdtKrw) : '로딩 중...'}
            icon="₿"
          />
          <MetricCard
            title="JPY/KRW (인베스팅)"
            value={currentRates ? currentRates.investingJpy.toFixed(4) : '로딩 중...'}
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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">💵 달러 투자 지표</h2>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">기간</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">달러지수</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">원달러환율</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">갭 비율</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">적정환율</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const periodSignal = signals[period];
                return (
                  <tr key={period} className="border-b border-gray-100">
                    <td className="py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">{periodNames[period]}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">💴 엔화 투자 지표</h2>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">기간</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">엔화지수</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">엔화환율</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">갭 비율</th>
                <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">적정환율</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const periodSignal = signals[period];
                return (
                  <tr key={period} className="border-b border-gray-100">
                    <td className="py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm">{periodNames[period]}</td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
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

      {/* 달러 환율 테이블 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">💵 달러 USD-KRW</h2>
        {currentRates?.investingUsd && (
          <div className="mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              Investing {new Date().toLocaleString('ko-KR')}
            </div>
            <div className="text-2xl sm:text-3xl font-bold">
              {currentRates.investingUsd.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">은행</th>
                <th className="text-right py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">기준환율</th>
                <th className="text-right py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">GAP</th>
                <th className="text-right py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">기준시간</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'KB', data: usdBankRates?.KB },
                { key: 'SHINHAN', data: usdBankRates?.SHINHAN },
                { key: 'HANA', data: usdBankRates?.HANA },
                { key: 'WOORI', data: usdBankRates?.WOORI },
                { key: 'IBK', data: usdBankRates?.IBK },
                { key: 'SC', data: usdBankRates?.SC },
                { key: 'BUSAN', data: usdBankRates?.BUSAN },
                { key: 'IMBANK', data: usdBankRates?.IMBANK },
                { key: 'NH', data: usdBankRates?.NH },
              ].map(({ key, data }) => {
                if (!data) {
                  return (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">{bankNames[key]}</td>
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap">조회 실패</td>
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap">N/A</td>
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs text-gray-600 whitespace-nowrap"></td>
                    </tr>
                  );
                }

                // 분석탭과 동일한 데이터 소스 사용 (currentRates.investingUsd)
                const investingRate = currentRates?.investingUsd;
                const gap = investingRate ? investingRate - data.rate : null;
                const gapStr = gap !== null ? `${gap >= 0 ? '+' : ''}${gap.toFixed(2)}` : 'N/A';

                return (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-1.5 px-1 sm:py-2 sm:px-2 font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">{bankNames[key]}</td>
                    <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap">
                      {data.rate.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap ${gap && gap >= 0 ? 'text-red-600' : gap && gap < 0 ? 'text-blue-600' : ''}`}>
                      {gapStr}
                    </td>
                    <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs text-gray-600 whitespace-nowrap">{data.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 엔화 환율 테이블 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">💴 엔 JPY-KRW (100엔)</h2>
        {currentRates?.investingJpy && (
          <div className="mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              Investing {new Date().toLocaleString('ko-KR')}
            </div>
            <div className="text-2xl sm:text-3xl font-bold">
              {/* currentRates.investingJpy는 이미 100엔당으로 변환된 값 */}
              {currentRates.investingJpy.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">은행</th>
                <th className="text-right py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">기준환율</th>
                <th className="text-right py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">GAP</th>
                <th className="text-right py-1.5 px-1 sm:py-2 sm:px-2 font-semibold text-gray-900">기준시간</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'KB', data: jpyBankRates?.KB },
                { key: 'SHINHAN', data: jpyBankRates?.SHINHAN },
                { key: 'HANA', data: jpyBankRates?.HANA },
                { key: 'WOORI', data: jpyBankRates?.WOORI },
                { key: 'IBK', data: jpyBankRates?.IBK },
                { key: 'SC', data: jpyBankRates?.SC },
                { key: 'BUSAN', data: jpyBankRates?.BUSAN },
                { key: 'IMBANK', data: jpyBankRates?.IMBANK },
                { key: 'NH', data: jpyBankRates?.NH },
              ].map(({ key, data }) => {
                if (!data) {
                  return (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">{bankNames[key]}</td>
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap">조회 실패</td>
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap">N/A</td>
                      <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs text-gray-600 whitespace-nowrap"></td>
                    </tr>
                  );
                }

                // 분석탭과 동일한 데이터 소스 사용 (currentRates.investingJpy는 이미 100엔 기준으로 변환됨)
                const investingRate = currentRates?.investingJpy || null;
                const gap = investingRate ? investingRate - data.rate : null;
                const gapStr = gap !== null ? `${gap >= 0 ? '+' : ''}${gap.toFixed(2)}` : 'N/A';

                return (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-1.5 px-1 sm:py-2 sm:px-2 font-medium text-gray-900 text-xs sm:text-sm whitespace-nowrap">{bankNames[key]}</td>
                    <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap">
                      {data.rate.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs sm:text-sm whitespace-nowrap ${gap && gap >= 0 ? 'text-red-600' : gap && gap < 0 ? 'text-blue-600' : ''}`}>
                      {gapStr}
                    </td>
                    <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-right text-xs text-gray-600 whitespace-nowrap">{data.time}</td>
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
