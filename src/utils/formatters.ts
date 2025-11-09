export const formatCurrency = (
  amount: number,
  currency: string = '원',
  withSign: boolean = false,
  asInteger: boolean = false,
  decimals: number = 2
): string => {
  const sign = amount > 0 && withSign ? '+' : '';
  const formatted = asInteger
    ? `${Math.round(amount).toLocaleString()}`
    : `${amount.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  return `${sign}${formatted}${currency}`;
};

export const formatPercentage = (
  value: number,
  decimals: number = 2,
  withSign: boolean = true
): string => {
  const sign = value > 0 && withSign ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

