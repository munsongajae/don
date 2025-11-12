'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import TossCard from '@/components/ui/TossCard';
import TossButton from '@/components/ui/TossButton';
import { useRouter } from 'next/navigation';

interface ConditionalAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
}

export default function ConditionalAuthGuard({ 
  children, 
  fallback,
  title = '로그인이 필요합니다',
  description = '이 기능을 사용하려면 로그인이 필요합니다.',
}: ConditionalAuthGuardProps) {
  const router = useRouter();
  const { user, loading, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // 로딩 중이거나 초기화되지 않았으면 로딩 표시
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-toss-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 유도 UI 표시
  if (!user) {
    return fallback || (
      <TossCard className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
        <div className="space-y-3 mb-6 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            <span>투자 내역 저장 및 관리</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            <span>매도 기록 추적</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-green-500">✓</span>
            <span>여러 기기에서 동기화</span>
          </div>
        </div>
        <TossButton
          onClick={() => router.push('/auth/login')}
          variant="primary"
          fullWidth
          className="max-w-xs mx-auto"
        >
          Google로 로그인하기
        </TossButton>
      </TossCard>
    );
  }

  // 로그인되어 있으면 children 렌더링
  return <>{children}</>;
}

