import { NextRequest } from 'next/server';
import { getAllBankRates } from '@/lib/services/bank-rates';
import { corsResponse, corsOptions } from '@/lib/utils/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currency = searchParams.get('currency') || 'USD';

  try {
    const rates = await getAllBankRates(currency.toUpperCase());
    return corsResponse(rates);
  } catch (error) {
    console.error('Error fetching bank rates:', error);
    return corsResponse(
      { 
        error: 'Failed to fetch bank rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      500
    );
  }
}

