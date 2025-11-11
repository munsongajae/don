/**
 * 숫자를 통화 형식으로 포맷팅합니다.
 */
export function formatCurrency(value: number, currency: 'KRW' | 'USD' | 'JPY' = 'KRW'): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }

  const formatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency === 'KRW' ? 'KRW' : currency === 'USD' ? 'USD' : 'JPY',
    minimumFractionDigits: currency === 'JPY' ? 4 : 0,
    maximumFractionDigits: currency === 'JPY' ? 4 : 0,
  });

  return formatter.format(value);
}

/**
 * 숫자를 원화 형식으로 포맷팅합니다 (원 단위 표시).
 */
export function formatKrw(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0원';
  }
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}

/**
 * 숫자를 퍼센트 형식으로 포맷팅합니다.
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * 숫자를 간단한 형식으로 포맷팅합니다.
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }
  return value.toFixed(decimals);
}

/**
 * 날짜를 포맷팅합니다.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 날짜와 시간을 포맷팅합니다.
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

