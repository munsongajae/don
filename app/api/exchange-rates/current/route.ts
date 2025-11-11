import { NextResponse } from 'next/server';
import { fetchCurrentRates } from '@/lib/services/exchange-rate';

export async function GET() {
  try {
    console.log('실시간 환율 조회 시작...');
    const rates = await fetchCurrentRates();
    console.log('실시간 환율 조회 완료:', rates);
    
    // 최소한 하나의 환율이라도 가져왔는지 확인
    if (!rates.investingUsd && !rates.hanaRate && !rates.usdtKrw && !rates.investingJpy) {
      console.warn('모든 환율 조회 실패');
      return NextResponse.json(
        { error: 'Failed to fetch exchange rates', rates },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(rates);
  } catch (error) {
    console.error('실시간 환율 조회 실패:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

