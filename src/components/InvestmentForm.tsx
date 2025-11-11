import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface InvestmentFormProps {
  currency: 'dollar' | 'jpy';
  onSubmit: (data: any) => void;
  onCancel: () => void;
  currentRate?: number;
}

export const InvestmentForm = ({
  currency,
  onSubmit,
  onCancel,
  currentRate,
}: InvestmentFormProps) => {
  const [investmentNumber, setInvestmentNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [exchangeRate, setExchangeRate] = useState(currentRate?.toString() || '');
  const [purchaseKrw, setPurchaseKrw] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeName, setExchangeName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      investment_number: parseInt(investmentNumber),
      purchase_date: purchaseDate,
      exchange_rate: parseFloat(exchangeRate),
      purchase_krw: parseFloat(purchaseKrw),
      [currency === 'dollar' ? 'usd_amount' : 'jpy_amount']: parseFloat(amount),
      exchange_name: exchangeName,
    };

    onSubmit(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            투자 번호
          </label>
          <input
            type="number"
            className="input"
            value={investmentNumber}
            onChange={(e) => setInvestmentNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            매수일
          </label>
          <input
            type="date"
            className="input"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            매수 환율 ({currency === 'dollar' ? 'USD/KRW' : 'JPY/KRW'})
          </label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            매수 금액 (원)
          </label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={purchaseKrw}
            onChange={(e) => setPurchaseKrw(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            보유 수량 ({currency === 'dollar' ? 'USD' : 'JPY'})
          </label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            거래소/은행
          </label>
          <input
            type="text"
            className="input"
            value={exchangeName}
            onChange={(e) => setExchangeName(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            등록
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        </div>
      </form>
    </Card>
  );
};

