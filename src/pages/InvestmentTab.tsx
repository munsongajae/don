import { useState, useEffect } from 'react';
import { useInvestmentStore } from '@/store/useInvestmentStore';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { MetricCard } from '@/components/MetricCard';
import { InvestmentForm } from '@/components/InvestmentForm';
import { InvestmentList } from '@/components/InvestmentList';
import { SellModal } from '@/components/SellModal';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

export const InvestmentTab = () => {
  const [currency, setCurrency] = useState<'dollar' | 'jpy'>('dollar');
  const [showForm, setShowForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const {
    dollarInvestments,
    jpyInvestments,
    fetchDollarInvestments,
    fetchJpyInvestments,
    createDollarInvestment,
    createJpyInvestment,
    deleteDollarInvestment,
    deleteJpyInvestment,
    sellDollarInvestment,
    sellJpyInvestment,
    loading,
    error,
  } = useInvestmentStore();
  const { currentRates } = useExchangeRateStore();

  useEffect(() => {
    fetchDollarInvestments();
    fetchJpyInvestments();
  }, []);

  const investments = currency === 'dollar' ? dollarInvestments : jpyInvestments;
  const currentRate =
    currency === 'dollar'
      ? currentRates?.investingUsd || 0
      : currentRates?.investingJpy || 0;

  // 포트폴리오 성과 계산
  const calculatePerformance = () => {
    if (!investments.length) {
      return {
        totalPurchaseKrw: 0,
        totalCurrentKrw: 0,
        totalProfitKrw: 0,
        totalProfitRate: 0,
      };
    }

    const totalPurchaseKrw = investments.reduce(
      (sum, inv) => sum + (inv.purchase_krw || 0),
      0
    );

    const totalAmount = investments.reduce(
      (sum, inv) => sum + (inv.usd_amount || inv.jpy_amount || 0),
      0
    );

    const totalCurrentKrw = totalAmount * currentRate;
    const totalProfitKrw = totalCurrentKrw - totalPurchaseKrw;
    const totalProfitRate =
      totalPurchaseKrw > 0 ? (totalProfitKrw / totalPurchaseKrw) * 100 : 0;

    return {
      totalPurchaseKrw,
      totalCurrentKrw,
      totalProfitKrw,
      totalProfitRate,
    };
  };

  const performance = calculatePerformance();

  const handleCreateInvestment = async (data: any) => {
    try {
      if (currency === 'dollar') {
        await createDollarInvestment(data);
      } else {
        await createJpyInvestment(data);
      }
      setShowForm(false);
      alert('투자가 등록되었습니다.');
    } catch (error: any) {
      alert(error.message || '투자 등록에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      if (currency === 'dollar') {
        await deleteDollarInvestment(id);
      } else {
        await deleteJpyInvestment(id);
      }
    }
  };

  const handleSell = async (investmentId: string, sellRate: number, sellAmount: number) => {
    try {
      if (currency === 'dollar') {
        await sellDollarInvestment(investmentId, { sell_rate: sellRate, sell_amount: sellAmount });
      } else {
        await sellJpyInvestment(investmentId, { sell_rate: sellRate, sell_amount: sellAmount });
      }
      setSelectedInvestment(null);
    } catch (error: any) {
      alert(error.message || '매도 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center justify-between">
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
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '취소' : '+ 투자 추가'}
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-300">
          <div className="text-red-600">{error}</div>
        </Card>
      )}

      {investments.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="총 매수금액" value={formatCurrency(performance.totalPurchaseKrw, '원', false, false, 0)} />
          <MetricCard
            label="현재 평가금액"
            value={formatCurrency(performance.totalCurrentKrw, '원', false, false, 0)}
          />
          <MetricCard
            label="평가손익"
            value={formatCurrency(performance.totalProfitKrw, '원', true, false, 0)}
            delta={formatPercentage(performance.totalProfitRate)}
            deltaColor={performance.totalProfitKrw >= 0 ? 'success' : 'error'}
          />
          <MetricCard
            label="현재 환율"
            value={formatCurrency(currentRate, '원', false, false, currency === 'dollar' ? 2 : 4)}
          />
        </div>
      )}

      {showForm && (
        <InvestmentForm
          currency={currency}
          currentRate={currentRate}
          onSubmit={handleCreateInvestment}
          onCancel={() => setShowForm(false)}
        />
      )}

      <InvestmentList
        investments={investments}
        currency={currency}
        currentRate={currentRate}
        onDelete={handleDelete}
        onSell={setSelectedInvestment}
      />

      {selectedInvestment && (
        <SellModal
          investment={selectedInvestment}
          currency={currency}
          currentRate={currentRate}
          onConfirm={handleSell}
          onCancel={() => setSelectedInvestment(null)}
        />
      )}

      {loading && (
        <Card>
          <div className="text-center py-4 text-gray-600">처리 중...</div>
        </Card>
      )}
    </div>
  );
};
