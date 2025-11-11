import { Card } from './Card';
import { Button } from './Button';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';
import { format } from 'date-fns';

interface Investment {
  id: string;
  investment_number: number;
  purchase_date: string;
  exchange_rate: number;
  purchase_krw: number;
  usd_amount?: number;
  jpy_amount?: number;
  exchange_name: string;
}

interface InvestmentListProps {
  investments: Investment[];
  currency: 'dollar' | 'jpy';
  currentRate?: number;
  onDelete: (id: string) => void;
  onSell: (investment: Investment) => void;
}

export const InvestmentList = ({
  investments,
  currency,
  currentRate = 0,
  onDelete,
  onSell,
}: InvestmentListProps) => {
  if (investments.length === 0) {
    return (
        <Card>
          <div className="text-center py-8 text-gray-600">
            등록된 투자가 없습니다.
          </div>
        </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold">번호</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">매수일</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">매수 환율</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">매수 금액</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">보유 수량</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">현재 가치</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">손익</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">거래소</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">작업</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment) => {
              const amount = currency === 'dollar' ? investment.usd_amount : investment.jpy_amount;
              const currentValue = (amount || 0) * currentRate;
              const profit = currentValue - investment.purchase_krw;
              const profitRate = investment.purchase_krw > 0 
                ? (profit / investment.purchase_krw) * 100 
                : 0;

              return (
                <tr key={investment.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{investment.investment_number}</td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(investment.purchase_date), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(investment.exchange_rate, '원', false, false, 2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(investment.purchase_krw, '원', false, false, 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatNumber(amount || 0, 2)} {currency === 'dollar' ? 'USD' : 'JPY'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(currentValue, '원', false, false, 0)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-semibold ${
                    profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(profit, '원', true, false, 0)}
                    <br />
                    <span className="text-xs">
                      ({formatPercentage(profitRate, 2)})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{investment.exchange_name}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="secondary"
                        className="text-xs px-3 py-1"
                        onClick={() => onSell(investment)}
                      >
                        매도
                      </Button>
                      <Button
                        variant="secondary"
                        className="text-xs px-3 py-1"
                        onClick={() => onDelete(investment.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

