'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import TossCard from '@/components/ui/TossCard';
import { formatDate } from '@/lib/utils/formatters';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface TossChartProps {
  title: string;
  data: ChartDataPoint[];
  currentValue?: number;
  highValue?: number;
  lowValue?: number;
  midValue?: number;
  yAxisLabel?: string;
  yAxisDecimals?: number;
}

export default function TossChart({
  title,
  data,
  currentValue,
  highValue,
  lowValue,
  midValue,
  yAxisLabel = '',
  yAxisDecimals = 2,
}: TossChartProps) {
  // Y축 범위 계산
  const values = data.map(d => d.value);
  const minValue = Math.min(...values, lowValue || Infinity);
  const maxValue = Math.max(...values, highValue || Infinity);
  const padding = (maxValue - minValue) * 0.1;
  const yAxisDomain = [minValue - padding, maxValue + padding];

  // Y축 포맷터
  const formatYAxis = (value: number) => {
    return value.toFixed(yAxisDecimals);
  };

  // 툴팁 포맷터
  const formatTooltip = (value: number) => {
    return `${value.toFixed(yAxisDecimals)}${yAxisLabel}`;
  };

  return (
    <TossCard className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              domain={yAxisDomain}
              tickFormatter={formatYAxis}
              stroke="#6b7280"
              fontSize={12}
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={(value) => formatDate(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            {highValue && (
              <ReferenceLine
                y={highValue}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label="최고"
              />
            )}
            {lowValue && (
              <ReferenceLine
                y={lowValue}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label="최저"
              />
            )}
            {midValue && (
              <ReferenceLine
                y={midValue}
                stroke="#6b7280"
                strokeDasharray="2 2"
                label="중간"
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            {currentValue && (
              <ReferenceLine
                y={currentValue}
                stroke="#10b981"
                strokeWidth={2}
                label="현재"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </TossCard>
  );
}

