'use client';

import TossCard from '@/components/ui/TossCard';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
}: MetricCardProps) {
  return (
    <TossCard className={clsx('mb-4', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {trend && trendValue && (
          <span
            className={clsx('text-sm font-semibold', {
              'text-green-600': trend === 'up',
              'text-red-600': trend === 'down',
              'text-gray-600': trend === 'neutral',
            })}
          >
            {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
          </span>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {subtitle && (
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </TossCard>
  );
}

