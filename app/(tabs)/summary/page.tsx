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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentRates();
      // 은행별 환율도 주기적으로 갱신
      const fetchBankRates = async () => {
        try {
          const [usdResponse, jpyResponse] = await Promise.all([
            fetch('/api/exchange-rates/banks?currency=USD'),
            fetch('/api/exchange-rates/banks?currency=JPY'),
          ]);

          const [usd, jpy] = await Promise.all([
            usdResponse.ok ? usdResponse.json() : null,
            jpyResponse.ok ? jpyResponse.json() : null,
          ]);

          if (usd) setUsdBankRates(usd);
          if (jpy) setJpyBankRates(jpy);
        } catch (error) {
          console.error('은행별 환율 갱신 실패:', error);
        }
      };
      fetchBankRates();
    }, 60000); // 60초마다 갱신

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateSignals = async () => {
      if (!periodData[1] || !periodData[3] || !periodData[6] || !periodData[12] || !currentRates) {
        return;
      }

      try {
        const signals = calculateIndicatorSignals({
          period1: periodData[1],
          period3: periodData[3],
          period6: periodData[6],
          period12: periodData[12],
          currentRates,
        });
        setSignals(signals);
      } catch (error) {
        console.error('신호 계산 실패:', error);
      }
    };

    updateSignals();
  }, [periodData, currentRates]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setCurrentTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !currentRates) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">환율 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentRates) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">환율 데이터를 불러올 수 없습니다.</p>
          <button
            onClick={() => fetchCurrentRates()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const currentDxy = calculateCurrentDxy(periodData[1], currentRates);
  const currentJxy = calculateCurrentJxy(periodData[1], currentRates);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 실시간 환율 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="USD/KRW"
            value={formatKrw(currentRates.investingUsd || currentRates.hanaRate || 0)}
            subtitle={currentRates.investingUsd ? 'Investing.com' : currentRates.hanaRate ? '하나은행' : 'N/A'}
            trend={null}
          />
          <MetricCard
            title="JPY/KRW (100엔)"
            value={formatKrw((currentRates.investingJpy || 0) * 100)}
            subtitle={currentRates.investingJpy ? 'Investing.com' : 'N/A'}
            trend={null}
          />
          <MetricCard
            title="DXY"
            value={currentDxy.toFixed(2)}
            subtitle="달러 지수"
            trend={null}
          />
          <MetricCard
            title="JXY"
            value={currentJxy.toFixed(2)}
            subtitle="엔화 지수"
            trend={null}
          />
        </div>

        {/* 신호 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[1, 3, 6, 12].map((period) => {
            const signal = signals[period];
            const signalText = signal?.signal || 'N/A';
            const signalColor =
              signalText === '매수' ? 'text-green-600' : signalText === '매도' ? 'text-red-600' : 'text-gray-600';

            return (
              <MetricCard
                key={period}
                title={`${period}개월 신호`}
                value={signalText}
                subtitle={signal?.description || ''}
                trend={null}
              />
            );
          })}
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
                {/* currentRates.investingJpy는 1엔당이므로 100엔당으로 변환 */}
                {(currentRates.investingJpy * 100).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

                  // 분석탭과 동일한 데이터 소스 사용 (currentRates.investingJpy, 100엔 기준으로 변환)
                  const investingRate = currentRates?.investingJpy ? currentRates.investingJpy * 100 : null;
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
      </div>
    </div>
  );
}
