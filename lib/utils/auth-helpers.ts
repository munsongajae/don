import { supabase } from '@/lib/supabase/client';

/**
 * API 호출 시 사용할 헤더를 생성합니다.
 * 인증 토큰이 있으면 Authorization 헤더에 포함시킵니다.
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('세션 확인 실패:', error);
  }

  return headers;
}

