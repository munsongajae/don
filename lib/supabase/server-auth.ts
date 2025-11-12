import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * 서버 사이드에서 사용할 Supabase 클라이언트 (인증 포함)
 * Next.js API Routes에서 사용
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // 정적 빌드에서는 API Routes가 없으므로 기본 클라이언트만 반환
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  
  // 쿠키에서 세션 토큰 가져오기 (수동 처리)
  const accessToken = cookieStore.get('sb-access-token')?.value;
  if (accessToken) {
    // 토큰이 있으면 헤더에 추가
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: cookieStore.get('sb-refresh-token')?.value || '',
    } as any).catch(() => {
      // 세션 설정 실패 시 무시 (정적 빌드에서는 사용되지 않음)
    });
  }

  return client;
}

/**
 * 요청 헤더에서 인증 토큰을 추출하여 Supabase 클라이언트 생성
 */
export function createServerClientFromHeaders(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  });

  return { client, token };
}

