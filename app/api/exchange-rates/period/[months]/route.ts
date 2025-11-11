import { NextRequest, NextResponse } from 'next/server';
import { fetchPeriodData } from '@/lib/services/index-calculator';

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

    const data = await fetchPeriodData(months);
    return NextResponse.json(data);
  } catch (error) {
    console.error('기간별 데이터 조회 실패:', error);
    return NextResponse.json(
      { error: 'Failed to fetch period data' },
      { status: 500 }
    );
  }
}

