'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

function CallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialize, checkSession } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // OAuth 에러가 있는 경우
      if (errorParam) {
        console.error('OAuth 에러:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        return;
      }

      // 인증 코드가 있으면 직접 처리
      if (code) {
        console.log('인증 코드 발견, 세션 교환 시도...');
        // Supabase 클라이언트에서 직접 코드 교환
        const { supabase } = await import('@/lib/supabase/client');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('세션 교환 실패:', exchangeError);
          setError(exchangeError.message);
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
          return;
        }
        
        if (data.session) {
          console.log('세션 교환 성공:', data.session.user?.email);
          // 세션 확인 후 리디렉트
          await initialize();
          router.push('/summary');
          return;
        }
      }

      // 인증 코드가 없으면 세션 확인
      console.log('인증 코드가 없습니다. 세션 확인 시도...');
      
      // Supabase 클라이언트에서 직접 세션 확인
      const { supabase } = await import('@/lib/supabase/client');
      
      // URL 해시에서 세션 확인 (Supabase가 URL 해시에 세션을 저장할 수 있음)
      const { data: { session: hashSession }, error: hashError } = await supabase.auth.getSession();
      
      if (hashSession && !hashError) {
        console.log('해시에서 세션 확인됨:', hashSession.user?.email);
        await initialize();
        router.push('/summary');
        return;
      }
      
      // 인증 상태 초기화
      await initialize();
      
      // 세션 확인
      await checkSession();
      
      // 잠시 대기 후 세션 재확인 (Supabase가 세션을 설정하는 데 시간이 걸릴 수 있음)
      let attempts = 0;
      const maxAttempts = 5;
      
      const checkSessionInterval = setInterval(async () => {
        attempts++;
        await checkSession();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('세션 확인됨:', session.user?.email);
          clearInterval(checkSessionInterval);
          router.push('/summary');
        } else if (attempts >= maxAttempts) {
          console.error('세션 확인 실패: 최대 시도 횟수 초과');
          clearInterval(checkSessionInterval);
          setError('세션을 확인할 수 없습니다. 다시 로그인해주세요.');
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      }, 500);
    };

    handleCallback();
  }, [searchParams, router, initialize, checkSession]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-800 mb-2">인증 실패</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600">로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-12 w-12 text-toss-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">인증 처리 중...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-toss-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <CallbackPageContent />
    </Suspense>
  );
}

