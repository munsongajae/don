'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useInvestmentStore } from '@/store/useInvestmentStore';
import ConditionalAuthGuard from '@/components/auth/ConditionalAuthGuard';
import TossCard from '@/components/ui/TossCard';
import MetricCard from '@/components/metrics/MetricCard';
import { formatKrw, formatPercentage, formatDate } from '@/lib/utils/formatters';
import { DollarSellRecord, JpySellRecord } from '@/types';

function SellRecordsPageContent() {
  const [currency, setCurrency] = useState<'dollar' | 'jpy'>('dollar');
  const [period, setPeriod] = useState<'all' | 1 | 3 | 12>('all');
  
  const {
    dollarSellRecords,
    jpySellRecords,
    loading,
    fetchDollarSellRecords,
    fetchJpySellRecords,
    deleteDollarSellRecord,
    deleteJpySellRecord,
  } = useInvestmentStore();

  useEffect(() => {
    fetchDollarSellRecords();
    fetchJpySellRecords();
  }, [fetchDollarSellRecords, fetchJpySellRecords]);

  const sellRecords = currency === 'dollar' ? dollarSellRecords : jpySellRecords;

  // 기간별 필터링
  const filteredRecords = sellRecords.filter((record) => {
    if (period === 'all') return true;
    const recordDate = new Date(record.sell_date);
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - period, now.getDate());
    return recordDate >= monthsAgo;
  });

  // 대시보드 계산
  const calculateDashboard = () => {
    if (filteredRecords.length === 0) {
      return {
        totalPurchaseKrw: 0,
        totalForeignCurrency: 0,
        realizedProfitLoss: 0,
        profitRate: 0,
      };
    }

    const totalPurchaseKrw = filteredRecords.reduce((sum, record) => {
      // 매도 기록에서 매수 금액 계산 (투자 목록에서 가져와야 하지만, 여기서는 근사값 사용)
      const sellKrw = record.sell_krw || 0;
      const profitLoss = record.profit_loss || 0;
      return sum + (sellKrw - profitLoss);
    }, 0);

    const totalForeignCurrency = currency === 'dollar'
      ? filteredRecords.reduce((sum, record) => {
          const usdAmount = (record as DollarSellRecord).usd_amount;
          return sum + (usdAmount || 0);
        }, 0)
      : filteredRecords.reduce((sum, record) => {
          const jpyAmount = (record as JpySellRecord).jpy_amount;
          return sum + (jpyAmount || 0);
        }, 0);

    const realizedProfitLoss = filteredRecords.reduce((sum, record) => {
      return sum + (record.profit_loss || 0);
    }, 0);
    const profitRate = totalPurchaseKrw > 0 ? (realizedProfitLoss / totalPurchaseKrw) * 100 : 0;

    return {
      totalPurchaseKrw,
      totalForeignCurrency,
      realizedProfitLoss,
      profitRate,
    };
  };

  const dashboard = calculateDashboard();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">매도 기록</h1>

      {/* 통화 선택 */}
      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => setCurrency('dollar')}
          className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
            currency === 'dollar'
              ? 'bg-toss-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          💵 달러
        </button>
        <button
          onClick={() => setCurrency('jpy')}
          className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
            currency === 'jpy'
              ? 'bg-toss-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          💴 엔화
        </button>
      </div>

      {/* 기간 필터 */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {(['all', 1, 3, 12] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              period === p
                ? 'bg-toss-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {p === 'all' ? '전체' : p === 12 ? '1년' : `${p}개월`}
          </button>
        ))}
      </div>

      {/* 대시보드 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">📊 대시보드</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <MetricCard
            title="총 매수 금액"
            value={formatKrw(dashboard.totalPurchaseKrw)}
            icon="💰"
          />
          <MetricCard
            title={`총 ${currency === 'dollar' ? '달러' : '엔화'} 매도`}
            value={currency === 'dollar' 
              ? `$${dashboard.totalForeignCurrency.toLocaleString()}`
              : `¥${dashboard.totalForeignCurrency.toLocaleString()}`
            }
            icon="💵"
          />
          <MetricCard
            title="실현 손익"
            value={formatKrw(dashboard.realizedProfitLoss)}
            subtitle={formatPercentage(dashboard.profitRate)}
            trend={dashboard.realizedProfitLoss >= 0 ? 'up' : 'down'}
            trendValue={formatPercentage(Math.abs(dashboard.profitRate))}
            icon="📈"
            className="col-span-2"
          />
        </div>
      </div>

      {/* 매도 기록 목록 */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">📋 매도 기록</h2>
        {filteredRecords.length === 0 ? (
          <TossCard>
            <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">
              매도 기록이 없습니다.
            </p>
          </TossCard>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredRecords.map((record) => (
              <TossCard key={record.id}>
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {formatDate(record.sell_date)}
                      </h4>
                      {(record as any).sell_number && (
                        <span className="text-xs bg-toss-blue-100 text-toss-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                          #{((record as any).sell_number)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {currency === 'dollar' ? (
                        <>
                          ${((record as DollarSellRecord).usd_amount || 0).toLocaleString()}
                        </>
                      ) : (
                        <>
                          ¥{((record as JpySellRecord).jpy_amount || 0).toLocaleString()}
                        </>
                      )}
                      {' '}@ {(record.exchange_rate || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                    <p className="text-xs sm:text-sm text-gray-500">매도 금액</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {formatKrw(record.sell_krw || 0)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">실현 손익</span>
                    <span
                      className={`font-semibold text-sm sm:text-base ${
                        (record.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {(record.profit_loss || 0) >= 0 ? '+' : ''}
                      {formatKrw(record.profit_loss || 0)} {(record.profit_rate || 0) >= 0 ? '+' : ''}
                      {(record.profit_rate || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4">
                  <button
                    onClick={() => {
                      if (confirm('정말 삭제하시겠습니까?')) {
                        if (currency === 'dollar') {
                          deleteDollarSellRecord(record.id);
                        } else {
                          deleteJpySellRecord(record.id);
                        }
                      }
                    }}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </TossCard>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center text-gray-500 py-8">로딩 중...</div>
      )}
    </div>
  );
}

export default function SellRecordsPage() {
  return (
    <ConditionalAuthGuard
      title="매도 기록을 확인하려면 로그인이 필요합니다"
      description="로그인하면 매도 기록을 저장하고 관리할 수 있습니다."
    >
      <SellRecordsPageContent />
    </ConditionalAuthGuard>
  );
}
