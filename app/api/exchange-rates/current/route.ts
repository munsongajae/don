import { NextRequest } from 'next/server';
import { fetchCurrentRates } from '@/lib/services/exchange-rate';
import { corsResponse, corsOptions } from '@/lib/utils/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    console.log('실시간 환율 조회 시작...');
    const rates = await fetchCurrentRates();
    console.log('실시간 환율 조회 완료:', rates);
    
    // 최소한 하나의 환율이라도 가져왔는지 확인
    if (!rates.investingUsd && !rates.hanaRate && !rates.usdtKrw && !rates.investingJpy) {
      console.warn('모든 환율 조회 실패');
      return corsResponse(
        { error: 'Failed to fetch exchange rates', rates },
        503 // Service Unavailable
      );
    }
    
    return corsResponse(rates);
  } catch (error) {
    console.error('실시간 환율 조회 실패:', error);
    return corsResponse(
      { 
        error: 'Failed to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
}

