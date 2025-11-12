import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * 요청 헤더에서 인증 토큰을 추출하여 Supabase 클라이언트 생성
 * API Routes에서 사용
 */
export function createServerClientFromHeaders(request: NextRequest) {
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

/**
 * API 요청에서 인증 토큰을 추출하고 검증합니다.
 */
export async function verifyAuth(request: NextRequest): Promise<{
  user: any;
  error: Error | null;
}> {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: new Error('인증 토큰이 없습니다.'),
      };
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // 사용자 정보 확인
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: new Error('인증에 실패했습니다.'),
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error('인증 확인 중 오류가 발생했습니다.'),
    };
  }
}

/**
 * 쿠키에서 세션을 확인합니다 (클라이언트에서 쿠키로 인증하는 경우)
 */
export async function verifyAuthFromCookies(request: NextRequest): Promise<{
  user: any;
  error: Error | null;
}> {
  try {
    // 쿠키에서 access_token 추출
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return {
        user: null,
        error: new Error('인증 토큰이 없습니다.'),
      };
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // 사용자 정보 확인
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: new Error('인증에 실패했습니다.'),
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error('인증 확인 중 오류가 발생했습니다.'),
    };
  }
}

