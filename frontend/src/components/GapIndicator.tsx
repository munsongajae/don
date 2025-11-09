import { Card } from './Card';
import { formatNumber, formatPercentage } from '@/utils/formatters';

interface GapIndicatorProps {
  title: string;
  currentGap: number;
  midGap: number;
}

export const GapIndicator = ({ title, currentGap, midGap }: GapIndicatorProps) => {
  const isGood = currentGap > midGap;
  const oxSymbol = isGood ? 'O' : 'X';
  const oxColor = isGood ? 'text-green-600' : 'text-red-600';

  const diff = currentGap - midGap;
  const diffPercent = midGap !== 0 ? (diff / midGap) * 100 : 0;

  return (
    <Card>
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-4xl font-bold ${oxColor}`}>{oxSymbol}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(currentGap, 2)}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">중간 갭 비율:</span>
          <span className="font-semibold">{formatNumber(midGap, 2)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">차이:</span>
          <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatNumber(diff, 2)}% ({formatPercentage(diffPercent, 2)})
          </span>
        </div>
      </div>
    </Card>
  );
};

