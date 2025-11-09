interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaColor?: 'success' | 'error' | 'neutral';
}

export const MetricCard = ({
  label,
  value,
  delta,
  deltaColor = 'neutral',
}: MetricCardProps) => {
  const deltaColorClass = {
    success: 'text-green-600',
    error: 'text-red-600',
    neutral: 'text-gray-600',
  }[deltaColor];

  return (
    <div className="card">
      <div className="text-sm text-gray-600 font-medium mb-2">
        {label}
      </div>
      <div className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
        {value}
      </div>
      {delta && (
        <div className={`text-base font-semibold mt-2 ${deltaColorClass}`}>
          {delta}
        </div>
      )}
    </div>
  );
};

