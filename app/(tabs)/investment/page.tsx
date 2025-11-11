'use client';

import { useEffect, useState } from 'react';
import { useInvestmentStore } from '@/store/useInvestmentStore';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import InvestmentForm from '@/components/investment/InvestmentForm';
import InvestmentList from '@/components/investment/InvestmentList';
import SellModal from '@/components/investment/SellModal';
import TossCard from '@/components/ui/TossCard';
import TossButton from '@/components/ui/TossButton';
import MetricCard from '@/components/metrics/MetricCard';
import { formatKrw, formatPercentage } from '@/lib/utils/formatters';
import { DollarInvestment, JpyInvestment } from '@/types';

export default function InvestmentPage() {
  const [currency, setCurrency] = useState<'dollar' | 'jpy'>('dollar');
  const [showForm, setShowForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<DollarInvestment | JpyInvestment | null>(null);
  
  const {
    dollarInvestments,
    jpyInvestments,
    loading,
    fetchDollarInvestments,
    fetchJpyInvestments,
    createDollarInvestment,
    createJpyInvestment,
    deleteDollarInvestment,
    deleteJpyInvestment,
    createDollarSellRecord,
    createJpySellRecord,
  } = useInvestmentStore();

  const { currentRates, fetchCurrentRates } = useExchangeRateStore();

  useEffect(() => {
    fetchCurrentRates();
    fetchDollarInvestments();
    fetchJpyInvestments();
  }, [fetchCurrentRates, fetchDollarInvestments, fetchJpyInvestments]);

  const currentRate = currency === 'dollar'
    ? (currentRates?.investingUsd || currentRates?.hanaRate || 0)
    : (currentRates?.investingJpy || 0);

  const investments = currency === 'dollar' ? dollarInvestments : jpyInvestments;

  // 포트폴리오 성과 계산
  const calculatePortfolioPerformance = () => {
    if (investments.length === 0) {
      return {
        totalPurchaseKrw: 0,
        totalCurrentKrw: 0,
        totalProfitKrw: 0,
        totalProfitRate: 0,
      };
    }

    const totalPurchaseKrw = investments.reduce((sum, inv) => sum + inv.purchase_krw, 0);
    
    let totalCurrentKrw = 0;
    if (currency === 'dollar') {
      const totalUsd = (investments as DollarInvestment[]).reduce((sum, inv) => sum + inv.usd_amount, 0);
      totalCurrentKrw = totalUsd * currentRate;
    } else {
      const totalJpy = (investments as JpyInvestment[]).reduce((sum, inv) => sum + inv.jpy_amount, 0);
      totalCurrentKrw = (totalJpy * currentRate) / 100; // JPY는 100엔당이므로
    }

    const totalProfitKrw = totalCurrentKrw - totalPurchaseKrw;
    const totalProfitRate = totalPurchaseKrw > 0 ? (totalProfitKrw / totalPurchaseKrw) * 100 : 0;

    return {
      totalPurchaseKrw,
      totalCurrentKrw,
      totalProfitKrw,
      totalProfitRate,
    };
  };

  const portfolio = calculatePortfolioPerformance();

  const handleCreateInvestment = async (data: {
    amount: number;
    exchangeRate: number;
    purchaseKrw: number;
    purchaseDate: string;
    exchangeName: string;
  }) => {
    if (currency === 'dollar') {
      await createDollarInvestment({
        purchase_date: data.purchaseDate,
        usd_amount: data.amount,
        purchase_krw: data.purchaseKrw,
        exchange_rate: data.exchangeRate,
        exchange_name: data.exchangeName,
      } as any);
    } else {
      await createJpyInvestment({
        purchase_date: data.purchaseDate,
        jpy_amount: data.amount,
        purchase_krw: data.purchaseKrw,
        exchange_rate: data.exchangeRate,
        exchange_name: data.exchangeName,
      } as any);
    }
    setShowForm(false);
  };

  const handleSell = async (sellData: {
    investmentId: string;
    amount: number;
    sellKrw: number;
    exchangeRate: number;
    sellDate: string;
  }) => {
    if (!selectedInvestment) return;

    const purchaseKrw = (sellData.amount / (currency === 'dollar' 
      ? (selectedInvestment as DollarInvestment).usd_amount
      : (selectedInvestment as JpyInvestment).jpy_amount)) * selectedInvestment.purchase_krw;
    const profitLoss = sellData.sellKrw - purchaseKrw;
    const profitRate = purchaseKrw > 0 ? (profitLoss / purchaseKrw) * 100 : 0;

    if (currency === 'dollar') {
      await createDollarSellRecord({
        investment_id: sellData.investmentId,
        sell_date: sellData.sellDate,
        usd_amount: sellData.amount,
        sell_krw: sellData.sellKrw,
        exchange_rate: sellData.exchangeRate,
        profit_loss: profitLoss,
        profit_rate: profitRate,
      });
    } else {
      await createJpySellRecord({
        investment_id: sellData.investmentId,
        sell_date: sellData.sellDate,
        jpy_amount: sellData.amount,
        sell_krw: sellData.sellKrw,
        exchange_rate: sellData.exchangeRate,
        profit_loss: profitLoss,
        profit_rate: profitRate,
      });
    }
    setSelectedInvestment(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">투자</h1>

      {/* 통화 선택 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setCurrency('dollar')}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
            currency === 'dollar'
              ? 'bg-toss-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          💵 달러
        </button>
        <button
          onClick={() => setCurrency('jpy')}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
            currency === 'jpy'
              ? 'bg-toss-blue-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          💴 엔화
        </button>
      </div>

      {/* 포트폴리오 성과 */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="총 매수 금액"
          value={formatKrw(portfolio.totalPurchaseKrw)}
          icon="💰"
        />
        <MetricCard
          title="현재 평가액"
          value={formatKrw(portfolio.totalCurrentKrw)}
          icon="📊"
        />
        <MetricCard
          title="평가 손익"
          value={formatKrw(portfolio.totalProfitKrw)}
          subtitle={formatPercentage(portfolio.totalProfitRate)}
          trend={portfolio.totalProfitKrw >= 0 ? 'up' : 'down'}
          trendValue={formatPercentage(Math.abs(portfolio.totalProfitRate))}
          icon="📈"
          className="col-span-2"
        />
      </div>

      {/* 투자 등록 폼 */}
      {showForm ? (
        <InvestmentForm
          currency={currency}
          currentRate={currentRate}
          onSubmit={handleCreateInvestment}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <TossButton
          variant="primary"
          fullWidth
          onClick={() => setShowForm(true)}
        >
          ➕ 투자 추가
        </TossButton>
      )}

      {/* 투자 목록 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 투자 내역</h2>
        <InvestmentList
          currency={currency}
          investments={investments}
          currentRate={currentRate}
          onDelete={currency === 'dollar' ? deleteDollarInvestment : deleteJpyInvestment}
          onSell={(investment) => setSelectedInvestment(investment)}
        />
      </div>

      {/* 매도 모달 */}
      {selectedInvestment && (
        <SellModal
          investment={selectedInvestment}
          currency={currency}
          currentRate={currentRate}
          onSell={handleSell}
          onClose={() => setSelectedInvestment(null)}
        />
      )}

      {loading && (
        <div className="text-center text-gray-500 py-8">로딩 중...</div>
      )}
    </div>
  );
}
