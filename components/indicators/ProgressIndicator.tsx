'use client';

import TossCard from '@/components/ui/TossCard';
import clsx from 'clsx';

interface ProgressIndicatorProps {
  title: string;
  current: number;
  high: number;
  low: number;
  mid: number;
  signal?: 'O' | 'X' | '-';
  reverseLogic?: boolean;
  unit?: string;
  hideHighLow?: boolean;
}

export default function ProgressIndicator({
  title,
  current,
  high,
  low,
  mid,
  signal,
  reverseLogic = false,
  unit = '',
  hideHighLow = false,
}: ProgressIndicatorProps) {
  const range = high - low;
  const currentPosition = range > 0 ? ((current - low) / range) * 100 : 50;
  const midPosition = range > 0 ? ((mid - low) / range) * 100 : 50;
  
  const isGood = reverseLogic 
    ? current < mid 
    : current > mid;
  
  return (
    <TossCard className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {signal && (
          <span
            className={clsx(
              'text-2xl font-bold',
              {
                'text-green-600': signal === 'O',
                'text-red-600': signal === 'X',
                'text-gray-400': signal === '-',
              }
            )}
          >
            {signal}
          </span>
        )}
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {current.toLocaleString()}{unit}
        </div>
        {!hideHighLow && (
          <div className="text-sm text-gray-500">
            중간값: {mid.toLocaleString()}{unit} | 범위: {low.toLocaleString()}{unit} ~ {high.toLocaleString()}{unit}
          </div>
        )}
        {hideHighLow && (
          <div className="text-sm text-gray-500">
            중간값: {mid.toLocaleString()}{unit}
          </div>
        )}
      </div>
      
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        {/* 범위 표시 */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-gray-200" />
          <div 
            className="w-0.5 bg-gray-400" 
            style={{ left: `${Math.max(0, Math.min(100, midPosition))}%` }} 
          />
          <div className="flex-1 bg-gray-200" />
        </div>
        
        {/* 현재 위치 */}
        <div
          className={clsx(
            'absolute top-0 bottom-0 w-1 rounded-full transition-all duration-300 z-10',
            {
              'bg-green-500': isGood,
              'bg-red-500': !isGood,
            }
          )}
          style={{ left: `${Math.max(0, Math.min(100, currentPosition))}%` }}
        />
      </div>
    </TossCard>
  );
}

