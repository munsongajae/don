import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { months: string } }
) {
  try {
    const months = parseInt(params.months, 10);
    
    if (isNaN(months) || months < 1 || months > 12) {
      return NextResponse.json(
        { error: 'Invalid period. Must be between 1 and 12 months.' },
        { status: 400 }
      );
    }

    // 동적 import를 사용하여 서버 사이드에서만 로드
    const { fetchPeriodData } = await import('@/lib/services/index-calculator');
    const data = await fetchPeriodData(months);
    return NextResponse.json(data);
  } catch (error) {
    console.error('기간별 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: 'Failed to fetch period data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

