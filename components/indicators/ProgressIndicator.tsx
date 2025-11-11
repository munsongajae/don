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
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        {signal && (
          <span
            className={clsx(
              'text-3xl sm:text-4xl font-bold min-w-[2rem] text-center',
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
      
      <div className="mb-5">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {current.toLocaleString()}{unit && <span className="ml-1 text-lg">{unit}</span>}
        </div>
        {!hideHighLow && (
          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
            <div>중간값: <span className="font-semibold">{mid.toLocaleString()}{unit}</span></div>
            <div className="flex flex-wrap gap-x-3">
              <span>최저: <span className="font-medium">{low.toLocaleString()}{unit}</span></span>
              <span>최고: <span className="font-medium">{high.toLocaleString()}{unit}</span></span>
            </div>
          </div>
        )}
        {hideHighLow && (
          <div className="text-xs sm:text-sm text-gray-600">
            중간값: <span className="font-semibold">{mid.toLocaleString()}{unit}</span>
          </div>
        )}
      </div>
      
      {/* 진행 바 컨테이너 */}
      <div className="relative">
        {/* 진행 바 배경 */}
        <div className="relative h-4 sm:h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          {/* 중간값 위치 표시선 */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-0 transition-all duration-300" 
            style={{ left: `${Math.max(0, Math.min(100, midPosition))}%` }}
          />
          
          {/* 현재 위치 마커 (더 크고 명확하게) */}
          <div
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 z-20 shadow-lg border-2 border-white',
              {
                'bg-green-500': isGood,
                'bg-red-500': !isGood,
              }
            )}
            style={{ left: `${Math.max(0, Math.min(100, currentPosition))}%` }}
          />
        </div>
        
        {/* 범위 라벨 (선택적) */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{low.toLocaleString()}</span>
          <span>{high.toLocaleString()}</span>
        </div>
      </div>
    </TossCard>
  );
}

