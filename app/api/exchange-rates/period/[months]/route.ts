import { NextRequest } from 'next/server';
import { corsResponse, corsOptions } from '@/lib/utils/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { months: string } }
) {
  try {
    const months = parseInt(params.months, 10);
    
    if (isNaN(months) || months < 1 || months > 12) {
      return corsResponse(
        { error: 'Invalid period. Must be between 1 and 12 months.' },
        400
      );
    }

    // 동적 import를 사용하여 서버 사이드에서만 로드
    const { fetchPeriodData } = await import('@/lib/services/index-calculator');
    const data = await fetchPeriodData(months);
    return corsResponse(data);
  } catch (error) {
    console.error('기간별 데이터 조회 실패:', error);
    return corsResponse(
      { error: 'Failed to fetch period data', message: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

