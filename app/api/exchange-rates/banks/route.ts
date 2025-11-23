import { NextRequest } from 'next/server';
import { getAllBankRates } from '@/lib/services/bank-rates';
import { corsResponse, corsOptions } from '@/lib/utils/cors';

// Vercel 서버리스 함수 타임아웃 설정 (최대 60초, Pro 플랜 필요)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currency = searchParams.get('currency') || 'USD';

  try {
    console.log(`[Bank Rates API] Fetching rates for currency: ${currency}`);
    const rates = await getAllBankRates(currency.toUpperCase());
    console.log(`[Bank Rates API] Successfully fetched rates for ${currency}:`, {
      totalBanks: Object.keys(rates).length,
      successfulBanks: Object.values(rates).filter(r => r !== null).length,
      investingRate: rates.INVESTING?.rate,
    });
    return corsResponse(rates);
  } catch (error) {
    console.error(`[Bank Rates API] Error fetching bank rates for ${currency}:`, error);
    console.error(`[Bank Rates API] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    return corsResponse(
      { 
        error: 'Failed to fetch bank rates',
        message: error instanceof Error ? error.message : 'Unknown error',
        currency: currency.toUpperCase(),
      },
      500
    );
  }
}

