import { Card } from './Card';
import { formatCurrency } from '@/utils/formatters';

interface FairRateIndicatorProps {
  title: string;
  currentRate: number;
  fairRate: number;
  currency?: string;
}

export const FairRateIndicator = ({
  title,
  currentRate,
  fairRate,
  currency = '원',
}: FairRateIndicatorProps) => {
  const isGood = currentRate < fairRate;
  const oxSymbol = isGood ? 'O' : 'X';
  const oxColor = isGood ? 'text-green-600' : 'text-red-600';

  const diff = fairRate - currentRate;
  const diffPercent = fairRate !== 0 ? (diff / fairRate) * 100 : 0;

  return (
    <Card>
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-4xl font-bold ${oxColor}`}>{oxSymbol}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(currentRate, currency, false, false, 2)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">적정 환율:</span>
          <span className="font-semibold">{formatCurrency(fairRate, currency, false, false, 2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">차이:</span>
          <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(diff), currency, diff >= 0, false, 2)} (
            {diffPercent >= 0 ? '+' : ''}
            {diffPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </Card>
  );
};

