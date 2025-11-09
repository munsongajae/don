import { Card } from './Card';
import { formatNumber } from '@/utils/formatters';

interface IndicatorProps {
  title: string;
  currentValue: number;
  highValue: number;
  lowValue: number;
  midValue: number;
  reverseLogic?: boolean;
  multiplier?: number;
  unit?: string;
  hideHighLow?: boolean; // 최저/최고값 숨김 옵션
}

export const Indicator = ({
  title,
  currentValue,
  highValue,
  lowValue,
  midValue,
  reverseLogic = false,
  multiplier = 1,
  unit = '',
  hideHighLow = false,
}: IndicatorProps) => {
  // O/X 표시 로직
  const isGood = reverseLogic ? currentValue < midValue : currentValue > midValue;
  const oxSymbol = isGood ? 'O' : 'X';
  const oxColor = isGood ? 'text-green-600' : 'text-red-600';

  // 값 포맷팅
  const currentDisplay = currentValue * multiplier;
  const lowDisplay = lowValue * multiplier;
  const midDisplay = midValue * multiplier;
  const highDisplay = highValue * multiplier;

  // 최저/최고값 숨김 옵션이 있는 경우 위치 계산 (중간값 기준)
  let positionPercent: number;
  if (hideHighLow) {
    // 중간값을 50% 위치에 고정하고, 현재값의 상대적 위치 계산
    // 현재값이 중간값보다 작으면 0-50% 사이, 크면 50-100% 사이
    const range = Math.max(Math.abs(midValue - lowValue), Math.abs(highValue - midValue), 1);
    if (currentValue <= midValue) {
      // 중간값 이하: 0-50% 사이
      const ratio = lowValue !== midValue ? (currentValue - lowValue) / (midValue - lowValue) : 0.5;
      positionPercent = Math.max(0, Math.min(50, ratio * 50));
    } else {
      // 중간값 초과: 50-100% 사이
      const ratio = highValue !== midValue ? (currentValue - midValue) / (highValue - midValue) : 0.5;
      positionPercent = Math.max(50, Math.min(100, 50 + ratio * 50));
    }
  } else {
    // 기존 로직: 최저-최고값 기준으로 위치 계산
    positionPercent =
      highValue !== lowValue
        ? Math.max(0, Math.min(100, ((currentValue - lowValue) / (highValue - lowValue)) * 100))
        : 50;
  }

  return (
    <Card>
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-4xl font-bold ${oxColor}`}>{oxSymbol}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="relative mb-8 pt-8">
        {/* 현재값 표시 (검은색 바 위에) */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 text-base font-bold text-gray-900 bg-white px-2 py-1 rounded shadow-md border border-gray-300 whitespace-nowrap z-30"
          style={{ left: `${positionPercent}%` }}
        >
          {formatNumber(currentDisplay, 2)}
          {unit && <span className="text-sm ml-1">{unit}</span>}
        </div>
        <div className="h-6 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-lg border-2 border-gray-300 relative overflow-hidden">
          {/* 중간값 마커 (hideHighLow 옵션일 때만 표시) */}
          {hideHighLow && (
            <div
              className="absolute top-0 h-full w-0.5 bg-gray-800 border-l border-r border-gray-600 z-5"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-800 bg-white px-1 rounded whitespace-nowrap">
                중간
              </div>
            </div>
          )}
          <div
            className="absolute top-0 h-full w-1 bg-gray-900 z-10"
            style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        <div className={`flex ${hideHighLow ? 'justify-center' : 'justify-between'} mt-2 text-xs text-gray-600`}>
          {!hideHighLow && (
            <span>
              최저: {formatNumber(lowDisplay, 2)}
              {unit}
            </span>
          )}
          <span>
            중간: {formatNumber(midDisplay, 2)}
            {unit}
          </span>
          {!hideHighLow && (
            <span>
              최고: {formatNumber(highDisplay, 2)}
              {unit}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

