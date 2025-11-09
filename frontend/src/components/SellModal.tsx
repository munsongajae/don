import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface Investment {
  id: string;
  investment_number: number;
  usd_amount?: number;
  jpy_amount?: number;
}

interface SellModalProps {
  investment: Investment | null;
  currency: 'dollar' | 'jpy';
  currentRate?: number;
  onConfirm: (investmentId: string, sellRate: number, sellAmount: number) => void;
  onCancel: () => void;
}

export const SellModal = ({
  investment,
  currency,
  currentRate = 0,
  onConfirm,
  onCancel,
}: SellModalProps) => {
  const [sellRate, setSellRate] = useState(currentRate.toString());
  const [sellAmount, setSellAmount] = useState('');

  useEffect(() => {
    if (currentRate) {
      setSellRate(currentRate.toString());
    }
  }, [currentRate]);

  if (!investment) return null;

  const maxAmount = currency === 'dollar' 
    ? (investment.usd_amount || 0) 
    : (investment.jpy_amount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(sellAmount);
    if (amount > maxAmount) {
      alert(`보유 수량(${maxAmount})보다 많이 매도할 수 없습니다.`);
      return;
    }
    if (amount <= 0) {
      alert('매도 수량은 0보다 커야 합니다.');
      return;
    }
    onConfirm(investment.id, parseFloat(sellRate), amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">매도</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              투자 번호
            </label>
            <div className="input bg-gray-100">{investment.investment_number}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              보유 수량 ({currency === 'dollar' ? 'USD' : 'JPY'})
            </label>
            <div className="input bg-gray-100">{maxAmount}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              매도 환율 ({currency === 'dollar' ? 'USD/KRW' : 'JPY/KRW'})
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={sellRate}
              onChange={(e) => setSellRate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              매도 수량 ({currency === 'dollar' ? 'USD' : 'JPY'})
            </label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              max={maxAmount}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              최대: {maxAmount} {currency === 'dollar' ? 'USD' : 'JPY'}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              매도
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              취소
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

