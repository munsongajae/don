import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card } from './Card';

interface ChartData {
  date: string;
  value: number;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  currentValue: number;
  highValue: number;
  lowValue: number;
  midValue: number;
  yAxisLabel?: string;
  yAxisDecimals?: number; // Y축 소수점 자릿수
}

export const Chart = ({
  title,
  data,
  currentValue,
  highValue,
  lowValue,
  midValue,
  yAxisDecimals,
}: ChartProps) => {
  // 실제 데이터의 최소/최대값 계산
  const dataValues = data.map((d) => d.value).filter((v) => v !== null && v !== undefined && !isNaN(v));
  const dataMin = dataValues.length > 0 ? Math.min(...dataValues) : lowValue;
  const dataMax = dataValues.length > 0 ? Math.max(...dataValues) : highValue;
  
  // Y축 범위 계산 (실제 데이터 범위와 high/low 값을 모두 고려)
  const yMin = Math.min(dataMin, lowValue, currentValue);
  const yMax = Math.max(dataMax, highValue, currentValue);
  
  // 약간의 여백 추가 (5%)
  const padding = (yMax - yMin) * 0.05;
  const yAxisDomain = [Math.max(0, yMin - padding), yMax + padding];

  // Y축 틱 포맷터
  const formatYAxisTick = (value: number) => {
    if (yAxisDecimals !== undefined) {
      return value.toFixed(yAxisDecimals);
    }
    // 기본: 값이 1보다 작으면 소수점 4자리, 그 외에는 2자리
    if (Math.abs(value) < 1) {
      return value.toFixed(4);
    }
    return value.toFixed(2);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" />
          <XAxis
            dataKey="date"
            stroke="#8B95A1"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#8B95A1" 
            style={{ fontSize: '12px' }}
            domain={yAxisDomain}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('ko-KR');
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3182F6"
            strokeWidth={2}
            name="값"
            dot={false}
          />
          <ReferenceLine
            y={currentValue}
            stroke="#F04452"
            strokeDasharray="5 5"
            label={{ value: `현재: ${currentValue.toFixed(2)}`, position: 'right' }}
          />
          <ReferenceLine
            y={highValue}
            stroke="#00C471"
            strokeDasharray="3 3"
            label={{ value: `최고: ${highValue.toFixed(2)}`, position: 'right' }}
          />
          <ReferenceLine
            y={lowValue}
            stroke="#FFA500"
            strokeDasharray="3 3"
            label={{ value: `최저: ${lowValue.toFixed(2)}`, position: 'right' }}
          />
          <ReferenceLine
            y={midValue}
            stroke="#8B95A1"
            strokeDasharray="4 4"
            label={{ value: `중간: ${midValue.toFixed(2)}`, position: 'right' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

