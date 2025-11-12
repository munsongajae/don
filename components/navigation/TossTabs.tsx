'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuthStore } from '@/store/useAuthStore';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  href: string;
  requiresAuth?: boolean;
}

interface TossTabsProps {
  tabs: Tab[];
  activeTab: string;
}

export default function TossTabs({ tabs, activeTab }: TossTabsProps) {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 safe-area-top">
      <div className="flex items-center">
        <div className="flex flex-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={clsx(
                'flex-1 px-3 sm:px-4 py-3.5 sm:py-4 text-center font-semibold transition-all duration-200',
                'relative min-w-[70px] sm:min-w-[80px] touch-manipulation',
                {
                  'text-toss-blue-600': activeTab === tab.id,
                  'text-gray-600': activeTab !== tab.id,
                }
              )}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                {tab.icon && <span className="text-base sm:text-lg">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.requiresAuth && !user && (
                  <span className="text-xs">🔒</span>
                )}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-toss-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
        
        {/* 사용자 메뉴 */}
        <div className="relative px-3 sm:px-4">
          {user ? (
            <>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.email || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-toss-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-sm text-gray-700 font-medium">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-30 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.user_metadata?.full_name || '사용자'}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium"
            >
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

