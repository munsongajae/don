import { NextResponse } from 'next/server';

/**
 * CORS 헤더를 추가한 NextResponse 생성
 */
export function corsResponse(data: any, status: number = 200) {
  const response = NextResponse.json(data, { status });
  
  // CORS 헤더 추가
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

/**
 * OPTIONS 요청 처리 (CORS preflight)
 */
export function corsOptions() {
  const response = new NextResponse(null, { status: 200 });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

