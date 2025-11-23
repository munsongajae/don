'use client';

import { useState } from 'react';
import TossCard from '@/components/ui/TossCard';
import TossButton from '@/components/ui/TossButton';
import { formatKrw } from '@/lib/utils/formatters';
import { DollarInvestment, JpyInvestment } from '@/types';

interface SellModalProps {
  investment: DollarInvestment | JpyInvestment;
  currency: 'dollar' | 'jpy';
  currentRate: number;
  onSell: (data: {
    investmentId: string;
    amount: number;
    sellKrw: number;
    exchangeRate: number;
    sellDate: string;
    sellNumber?: number;
  }) => Promise<void>;
  onClose: () => void;
}

export default function SellModal({
  investment,
  currency,
  currentRate,
  onSell,
  onClose,
}: SellModalProps) {
  const [sellAmount, setSellAmount] = useState(
    currency === 'dollar'
      ? (investment as DollarInvestment).usd_amount.toString()
      : (investment as JpyInvestment).jpy_amount.toString()
  );
  const [exchangeRate, setExchangeRate] = useState(currentRate.toString());
  const [sellDate, setSellDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sellNumber, setSellNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxAmount =
    currency === 'dollar'
      ? (investment as DollarInvestment).usd_amount
      : (investment as JpyInvestment).jpy_amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(sellAmount);
    const rateNum = parseFloat(exchangeRate);

    if (!amountNum || amountNum <= 0) {
      alert('매도 금액을 입력해주세요.');
      return;
    }

    if (amountNum > maxAmount) {
      alert(`최대 ${maxAmount.toLocaleString()}까지 매도할 수 있습니다.`);
      return;
    }

    if (!rateNum || rateNum <= 0) {
      alert('환율을 입력해주세요.');
      return;
    }

    // 엔화의 경우 환율이 100엔당 원화이므로 계산 방식이 다름
    const sellKrw = currency === 'jpy'
      ? (amountNum * rateNum) / 100  // JPY: (엔화금액 * 100엔당환율) / 100
      : amountNum * rateNum;         // USD: 달러금액 * 환율
    const purchaseKrw = (amountNum / maxAmount) * investment.purchase_krw;
    const profitLoss = sellKrw - purchaseKrw;

    setIsSubmitting(true);
    try {
      await onSell({
        investmentId: investment.id,
        amount: amountNum,
        sellKrw,
        exchangeRate: rateNum,
        sellDate,
        sellNumber: sellNumber ? parseInt(sellNumber, 10) : undefined,
      });
      onClose();
    } catch (error) {
      console.error('매도 실패:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '매도에 실패했습니다. 다시 시도해주세요.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 엔화의 경우 환율이 100엔당 원화이므로 계산 방식이 다름
  const sellKrw = currency === 'jpy'
    ? (parseFloat(sellAmount) * parseFloat(exchangeRate)) / 100 || 0
    : parseFloat(sellAmount) * parseFloat(exchangeRate) || 0;
  const purchaseKrw =
    (parseFloat(sellAmount) / maxAmount) * investment.purchase_krw || 0;
  const profitLoss = sellKrw - purchaseKrw;
  const profitRate = purchaseKrw > 0 ? (profitLoss / purchaseKrw) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <TossCard className="w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {currency === 'dollar' ? '💵 달러' : '💴 엔화'} 매도
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매도 번호 (선택사항)
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={sellNumber}
              onChange={(e) => setSellNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
              placeholder="자동 생성 (비워두면 자동으로 번호가 생성됩니다)"
            />
            <p className="text-xs text-gray-500 mt-1">
              번호를 입력하지 않으면 자동으로 생성됩니다.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매도 금액 ({currency === 'dollar' ? 'USD' : 'JPY'})
            </label>
            <input
              type="number"
              step="0.01"
              max={maxAmount}
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
              placeholder="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              최대: {maxAmount.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              환율 ({currency === 'dollar' ? 'USD/KRW' : 'JPY/KRW'})
            </label>
            <input
              type="number"
              step="0.01"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
              placeholder={currentRate.toString()}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              현재 환율: {currentRate.toLocaleString()}
              {currency === 'jpy' && ' (100엔당)'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              매도 일자
            </label>
            <input
              type="date"
              value={sellDate}
              onChange={(e) => setSellDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
              required
            />
          </div>

          {sellKrw > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  매도 금액
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatKrw(sellKrw)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  매수 금액
                </span>
                <span className="text-sm text-gray-600">
                  {formatKrw(purchaseKrw)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  실현 손익
                </span>
                <span
                  className={`text-lg font-bold ${
                    profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {profitLoss >= 0 ? '+' : ''}
                  {formatKrw(profitLoss)} ({profitRate >= 0 ? '+' : ''}
                  {profitRate.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <TossButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? '매도 중...' : '매도하기'}
            </TossButton>
            <TossButton
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              취소
            </TossButton>
          </div>
        </form>
      </TossCard>
    </div>
  );
}

