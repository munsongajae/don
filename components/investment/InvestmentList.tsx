'use client';

import TossCard from '@/components/ui/TossCard';
import TossButton from '@/components/ui/TossButton';
import { formatKrw, formatDate } from '@/lib/utils/formatters';
import { DollarInvestment, JpyInvestment } from '@/types';

interface InvestmentListProps {
  currency: 'dollar' | 'jpy';
  investments: (DollarInvestment | JpyInvestment)[];
  currentRate: number;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onSell: (investment: DollarInvestment | JpyInvestment) => void;
}

export default function InvestmentList({
  currency,
  investments,
  currentRate,
  onEdit,
  onDelete,
  onSell,
}: InvestmentListProps) {
  const calculateCurrentValue = (investment: DollarInvestment | JpyInvestment) => {
    if (currency === 'dollar') {
      const dollarInv = investment as DollarInvestment;
      return dollarInv.usd_amount * currentRate;
    } else {
      const jpyInv = investment as JpyInvestment;
      return (jpyInv.jpy_amount * currentRate) / 100; // JPY는 100엔당이므로
    }
  };

  const calculateProfit = (investment: DollarInvestment | JpyInvestment) => {
    const currentValue = calculateCurrentValue(investment);
    // 매도 기록 반영: 원본 매수 금액에서 남은 금액 비율만큼만 계산
    // investment는 이미 남은 금액으로 업데이트된 상태이므로,
    // 원본 매수 금액 비율을 계산해야 함
    const currentAmount = currency === 'dollar' 
      ? (investment as DollarInvestment).usd_amount
      : (investment as JpyInvestment).jpy_amount;
    
    // 원본 금액을 알 수 없으므로, purchase_krw를 그대로 사용
    // (이미 투자 목록에서 남은 금액으로 필터링되었으므로)
    return currentValue - investment.purchase_krw;
  };

  const calculateProfitRate = (investment: DollarInvestment | JpyInvestment) => {
    const profit = calculateProfit(investment);
    return (profit / investment.purchase_krw) * 100;
  };

  if (investments.length === 0) {
    return (
      <TossCard>
        <p className="text-center text-gray-500 py-8">
          등록된 투자가 없습니다.
        </p>
      </TossCard>
    );
  }

  return (
    <div className="space-y-4">
      {investments.map((investment) => {
        const profit = calculateProfit(investment);
        const profitRate = calculateProfitRate(investment);
        const currentValue = calculateCurrentValue(investment);

        return (
          <TossCard key={investment.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {formatDate(investment.purchase_date)}
                  </h4>
                  {(investment as any).investment_number && (
                    <span className="text-xs bg-toss-blue-100 text-toss-blue-700 px-2 py-1 rounded-full font-medium">
                      #{((investment as any).investment_number)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {currency === 'dollar'
                    ? `$${(investment as DollarInvestment).usd_amount.toLocaleString()}`
                    : `¥${(investment as JpyInvestment).jpy_amount.toLocaleString()}`}
                  {' '}@ {investment.exchange_rate.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">매수 금액</p>
                <p className="font-semibold text-gray-900">
                  {formatKrw(investment.purchase_krw)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">현재 평가액</span>
                <span className="font-semibold text-gray-900">
                  {formatKrw(currentValue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">평가 손익</span>
                <span
                  className={`font-semibold ${
                    profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {profit >= 0 ? '+' : ''}
                  {formatKrw(profit)} ({profitRate >= 0 ? '+' : ''}
                  {profitRate.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <TossButton
                variant="primary"
                size="sm"
                onClick={() => onSell(investment)}
                className="flex-1"
              >
                매도하기
              </TossButton>
              {onEdit && (
                <TossButton
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(investment.id)}
                  className="flex-1"
                >
                  수정
                </TossButton>
              )}
              <TossButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('정말 삭제하시겠습니까?')) {
                    onDelete(investment.id);
                  }
                }}
                className="flex-1"
              >
                삭제
              </TossButton>
            </div>
          </TossCard>
        );
      })}
    </div>
  );
}

