import { NextRequest } from 'next/server';
import { fetchCurrentRates } from '@/lib/services/exchange-rate';
import { corsResponse, corsOptions } from '@/lib/utils/cors';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      const response = corsResponse(
        { error: 'Failed to fetch exchange rates', rates },
        503 // Service Unavailable
      );
      // Vercel CDN 캐시 비활성화
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    
    const response = corsResponse(rates);
    // Vercel CDN 캐시 비활성화 (실시간 데이터이므로)
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('실시간 환율 조회 실패:', error);
    const response = corsResponse(
      { 
        error: 'Failed to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
    // 에러 응답도 캐시하지 않음
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}

