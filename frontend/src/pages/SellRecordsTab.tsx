import { useState, useEffect, useMemo } from 'react';
import { useInvestmentStore } from '@/store/useInvestmentStore';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { MetricCard } from '@/components/MetricCard';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { format } from 'date-fns';

export const SellRecordsTab = () => {
  const [currency, setCurrency] = useState<'dollar' | 'jpy'>('dollar');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const {
    dollarSellRecords,
    jpySellRecords,
    fetchDollarSellRecords,
    fetchJpySellRecords,
    deleteDollarSellRecord,
    deleteJpySellRecord,
    loading,
    error,
  } = useInvestmentStore();

  useEffect(() => {
    fetchDollarSellRecords();
    fetchJpySellRecords();
  }, []);

  const allSellRecords = currency === 'dollar' ? dollarSellRecords : jpySellRecords;

  // 기간 필터링된 매도 기록
  const sellRecords = useMemo(() => {
    if (!startDate && !endDate) {
      return allSellRecords;
    }

    return allSellRecords.filter((record) => {
      const sellDate = new Date(record.sell_date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && sellDate < start) return false;
      if (end) {
        // 종료일을 포함하기 위해 하루 추가
        const endDatePlusOne = new Date(end);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        if (sellDate >= endDatePlusOne) return false;
      }
      return true;
    });
  }, [allSellRecords, startDate, endDate]);

  // 현황판 계산
  const summary = useMemo(() => {
    if (sellRecords.length === 0) {
      return {
        totalPurchaseKrw: 0,
        totalSellAmount: 0,
        totalProfitKrw: 0,
        profitRate: 0,
      };
    }

    // 매수금액: 매수 환율 * 매도 수량
    const totalPurchaseKrw = sellRecords.reduce(
      (sum, record) => sum + record.purchase_rate * record.sell_amount,
      0
    );

    // 매수 외화: 매도 수량 합계
    const totalSellAmount = sellRecords.reduce(
      (sum, record) => sum + record.sell_amount,
      0
    );

    // 확정 손익: profit_krw 합계
    const totalProfitKrw = sellRecords.reduce(
      (sum, record) => sum + (record.profit_krw || 0),
      0
    );

    // 수익률: 확정 손익 / 매수금액 * 100
    const profitRate = totalPurchaseKrw > 0 
      ? (totalProfitKrw / totalPurchaseKrw) * 100 
      : 0;

    return {
      totalPurchaseKrw,
      totalSellAmount,
      totalProfitKrw,
      profitRate,
    };
  }, [sellRecords]);

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      if (currency === 'dollar') {
        await deleteDollarSellRecord(id);
      } else {
        await deleteJpySellRecord(id);
      }
    }
  };

  if (error) {
    return (
      <Card className="bg-red-50 border-red-300">
        <div className="text-red-600">{error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center justify-between flex-wrap">
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
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              📅 시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              📅 종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
          {(startDate || endDate) && (
            <Button
              variant="secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              초기화
            </Button>
          )}
        </div>
      </div>

      {/* 현황판 */}
      {sellRecords.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="매수금액"
            value={formatCurrency(summary.totalPurchaseKrw, '원', false, false, 0)}
          />
          <MetricCard
            label={`매수 외화 (${currency === 'dollar' ? 'USD' : 'JPY'})`}
            value={`${summary.totalSellAmount.toFixed(2)} ${currency === 'dollar' ? 'USD' : 'JPY'}`}
          />
          <MetricCard
            label="확정 손익"
            value={formatCurrency(summary.totalProfitKrw, '원', true, false, 0)}
            delta={formatPercentage(summary.profitRate)}
            deltaColor={summary.totalProfitKrw >= 0 ? 'success' : 'error'}
          />
          <MetricCard
            label="수익률"
            value={formatPercentage(summary.profitRate, 2, false)}
            delta={summary.totalProfitKrw >= 0 ? '수익' : '손실'}
            deltaColor={summary.profitRate >= 0 ? 'success' : 'error'}
          />
        </div>
      )}

      {sellRecords.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-600">
            등록된 매도 기록이 없습니다.
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-sm font-semibold">번호</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">매도일</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">매수 환율</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">매도 환율</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">매도 수량</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">매도 금액</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">손익</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">거래소</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">작업</th>
                </tr>
              </thead>
              <tbody>
                {sellRecords.map((record) => {
                  const profitRate =
                    record.purchase_rate !== 0
                      ? ((record.sell_rate - record.purchase_rate) / record.purchase_rate) * 100
                      : 0;

                  return (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{record.investment_number}</td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(record.sell_date), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatCurrency(record.purchase_rate, '원', false, false, 2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatCurrency(record.sell_rate, '원', false, false, 2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatCurrency(record.sell_amount, currency === 'dollar' ? 'USD' : 'JPY', false, false, 2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatCurrency(record.sell_krw, '원', false, false, 0)}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right font-semibold ${
                          record.profit_krw >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(record.profit_krw, '원', true, false, 0)}
                        <br />
                        <span className="text-xs">
                          ({formatPercentage(profitRate, 2)})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{record.exchange_name}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="secondary"
                          className="text-xs px-3 py-1"
                          onClick={() => handleDelete(record.id)}
                        >
                          삭제
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {loading && (
        <Card>
          <div className="text-center py-4 text-gray-600">로딩 중...</div>
        </Card>
      )}
    </div>
  );
};
