'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useInvestmentStore } from '@/store/useInvestmentStore';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import ConditionalAuthGuard from '@/components/auth/ConditionalAuthGuard';
import InvestmentForm from '@/components/investment/InvestmentForm';
import InvestmentList from '@/components/investment/InvestmentList';
import SellModal from '@/components/investment/SellModal';
import TossCard from '@/components/ui/TossCard';
import TossButton from '@/components/ui/TossButton';
import MetricCard from '@/components/metrics/MetricCard';
import { formatKrw, formatPercentage } from '@/lib/utils/formatters';
import { DollarInvestment, JpyInvestment } from '@/types';

function InvestmentPageContent() {
  const [currency, setCurrency] = useState<'dollar' | 'jpy'>('dollar');
  const [showForm, setShowForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<DollarInvestment | JpyInvestment | null>(null);
  
  const {
    dollarInvestments,
    jpyInvestments,
    dollarSellRecords,
    jpySellRecords,
    loading,
    fetchDollarInvestments,
    fetchJpyInvestments,
    fetchDollarSellRecords,
    fetchJpySellRecords,
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
    fetchDollarSellRecords();
    fetchJpySellRecords();
  }, [fetchCurrentRates, fetchDollarInvestments, fetchJpyInvestments, fetchDollarSellRecords, fetchJpySellRecords]);

  // investingJpy는 1엔당 원화를 반환하므로, 투자 탭에서는 100엔당으로 변환
  const currentRate = currency === 'dollar'
    ? (currentRates?.investingUsd || currentRates?.hanaRate || 0)
    : ((currentRates?.investingJpy || 0) * 100); // JPY: 1엔당 → 100엔당 변환

  // 매도 기록을 참조하여 남은 금액이 있는 투자만 필터링
  const getRemainingAmount = (investment: DollarInvestment | JpyInvestment): number => {
    const sellRecords = currency === 'dollar' ? dollarSellRecords : jpySellRecords;
    const totalSold = sellRecords
      .filter(record => record.investment_id === investment.id)
      .reduce((sum, record) => {
        if (currency === 'dollar') {
          return sum + (record as any).usd_amount;
        } else {
          return sum + (record as any).jpy_amount;
        }
      }, 0);
    
    if (currency === 'dollar') {
      return (investment as DollarInvestment).usd_amount - totalSold;
    } else {
      return (investment as JpyInvestment).jpy_amount - totalSold;
    }
  };

  // 매도 기록을 반영한 투자 목록 (남은 금액이 있는 투자만)
  const investmentsWithRemaining = (currency === 'dollar' ? dollarInvestments : jpyInvestments)
    .map(inv => {
      const remaining = getRemainingAmount(inv);
      return { ...inv, remaining };
    })
    .filter(inv => inv.remaining > 0); // 남은 금액이 있는 투자만

  const investments = investmentsWithRemaining;

  // 포트폴리오 성과 계산 (매도 기록 반영)
  const calculatePortfolioPerformance = () => {
    if (investments.length === 0) {
      return {
        totalPurchaseKrw: 0,
        totalCurrentKrw: 0,
        totalProfitKrw: 0,
        totalProfitRate: 0,
      };
    }

    // 매도 기록을 반영한 총 매수 금액 계산
    const totalPurchaseKrw = investments.reduce((sum, inv) => {
      // 원본 투자 정보 찾기
      const originalInvestment = (currency === 'dollar' 
        ? dollarInvestments.find(orig => orig.id === inv.id)
        : jpyInvestments.find(orig => orig.id === inv.id)
      ) || inv;
      
      const originalPurchaseKrw = originalInvestment.purchase_krw;
      const originalAmount = currency === 'dollar' 
        ? (originalInvestment as DollarInvestment).usd_amount 
        : (originalInvestment as JpyInvestment).jpy_amount;
      const remaining = (inv as any).remaining;
      // 남은 금액 비율에 따라 매수 금액 계산
      const ratio = originalAmount > 0 ? remaining / originalAmount : 0;
      return sum + (originalPurchaseKrw * ratio);
    }, 0);
    
    let totalCurrentKrw = 0;
    if (currency === 'dollar') {
      const totalUsd = investments.reduce((sum, inv) => sum + ((inv as any).remaining || 0), 0);
      totalCurrentKrw = totalUsd * currentRate;
    } else {
      const totalJpy = investments.reduce((sum, inv) => sum + ((inv as any).remaining || 0), 0);
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
    investmentNumber?: number;
  }) => {
    if (currency === 'dollar') {
      await createDollarInvestment({
        purchase_date: data.purchaseDate,
        usd_amount: data.amount,
        purchase_krw: data.purchaseKrw,
        exchange_rate: data.exchangeRate,
        exchange_name: data.exchangeName,
        investment_number: data.investmentNumber,
      } as any);
    } else {
      await createJpyInvestment({
        purchase_date: data.purchaseDate,
        jpy_amount: data.amount,
        purchase_krw: data.purchaseKrw,
        exchange_rate: data.exchangeRate,
        exchange_name: data.exchangeName,
        investment_number: data.investmentNumber,
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
    sellNumber?: number;
  }) => {
    if (!selectedInvestment) {
      throw new Error('선택된 투자가 없습니다.');
    }

    try {
      // 원본 투자 정보 찾기 (매도 기록 반영 전 원본 금액)
      const originalInvestment = (currency === 'dollar' 
        ? dollarInvestments.find(inv => inv.id === selectedInvestment.id)
        : jpyInvestments.find(inv => inv.id === selectedInvestment.id)
      ) || selectedInvestment;
      
      if (!originalInvestment) {
        throw new Error('투자 정보를 찾을 수 없습니다.');
      }
      
      const originalAmount = currency === 'dollar' 
        ? (originalInvestment as DollarInvestment).usd_amount
        : (originalInvestment as JpyInvestment).jpy_amount;
      
      if (originalAmount <= 0) {
        throw new Error('유효하지 않은 투자 금액입니다.');
      }
      
      // 원본 금액 기준으로 매수 금액 계산
      const purchaseKrw = (sellData.amount / originalAmount) * originalInvestment.purchase_krw;
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
          sell_number: sellData.sellNumber,
        } as any);
      } else {
        await createJpySellRecord({
          investment_id: sellData.investmentId,
          sell_date: sellData.sellDate,
          jpy_amount: sellData.amount,
          sell_krw: sellData.sellKrw,
          exchange_rate: sellData.exchangeRate,
          profit_loss: profitLoss,
          profit_rate: profitRate,
          sell_number: sellData.sellNumber,
        } as any);
      }
      
      // 성공 시에만 모달 닫기
      setSelectedInvestment(null);
    } catch (error) {
      console.error('매도 처리 중 오류:', error);
      // 에러를 다시 throw하여 SellModal에서 처리하도록 함
      throw error;
    }
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
          investments={investments.map(inv => {
            // 원본 투자 정보 찾기
            const originalInvestment = (currency === 'dollar' 
              ? dollarInvestments.find(orig => orig.id === inv.id)
              : jpyInvestments.find(orig => orig.id === inv.id)
            ) || inv;
            
            const originalAmount = currency === 'dollar' 
              ? (originalInvestment as DollarInvestment).usd_amount 
              : (originalInvestment as JpyInvestment).jpy_amount;
            const remaining = (inv as any).remaining;
            const ratio = originalAmount > 0 ? remaining / originalAmount : 0;
            
            return {
              ...inv,
              // 남은 금액으로 업데이트
              ...(currency === 'dollar' 
                ? { usd_amount: remaining }
                : { jpy_amount: remaining }
              ),
              // 매수 금액도 남은 금액 비율에 맞게 조정
              purchase_krw: originalInvestment.purchase_krw * ratio,
            };
          })}
          currentRate={currentRate}
          onDelete={currency === 'dollar' ? deleteDollarInvestment : deleteJpyInvestment}
          onSell={(investment) => setSelectedInvestment(investment)}
        />
      </div>

      {/* 매도 모달 */}
      {selectedInvestment && (() => {
        // 매도 기록을 반영한 남은 금액 계산
        const remaining = getRemainingAmount(selectedInvestment);
        const investmentWithRemaining = {
          ...selectedInvestment,
          ...(currency === 'dollar' 
            ? { usd_amount: remaining }
            : { jpy_amount: remaining }
          ),
        };
        
        return (
          <SellModal
            investment={investmentWithRemaining}
            currency={currency}
            currentRate={currentRate}
            onSell={handleSell}
            onClose={() => setSelectedInvestment(null)}
          />
        );
      })()}

      {loading && (
        <div className="text-center text-gray-500 py-8">로딩 중...</div>
      )}
    </div>
  );
}

export default function InvestmentPage() {
  return (
    <ConditionalAuthGuard
      title="투자 내역을 관리하려면 로그인이 필요합니다"
      description="로그인하면 투자 내역을 저장하고 여러 기기에서 동기화할 수 있습니다."
    >
      <InvestmentPageContent />
    </ConditionalAuthGuard>
  );
}
