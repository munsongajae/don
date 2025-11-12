import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    try {
      // 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('세션 확인 실패:', error);
        set({ user: null, session: null, loading: false, initialized: true });
        return;
      }

      set({ 
        user: session?.user ?? null, 
        session: session, 
        loading: false, 
        initialized: true 
      });

      // 세션 변경 감지
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          user: session?.user ?? null, 
          session: session 
        });
      });
    } catch (error) {
      console.error('인증 초기화 실패:', error);
      set({ user: null, session: null, loading: false, initialized: true });
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      // 로컬 개발 환경에서도 명시적으로 redirectTo 사용
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      console.log('OAuth 시작 - redirectTo:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google 로그인 실패:', error);
        set({ loading: false });
        throw new Error(`Google 로그인 실패: ${error.message}`);
      }

      // data.url이 있으면 리디렉트가 시작됨
      if (data?.url) {
        console.log('OAuth URL 생성됨:', data.url);
        // 리디렉트는 Supabase가 자동으로 처리
      } else {
        console.warn('OAuth URL이 생성되지 않았습니다.');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Google 로그인 에러:', error);
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 실패:', error);
        throw error;
      }

      set({ user: null, session: null, loading: false });
    } catch (error) {
      console.error('로그아웃 에러:', error);
      set({ loading: false });
      throw error;
    }
  },

  checkSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('세션 확인 실패:', error);
        return;
      }

      set({ 
        user: session?.user ?? null, 
        session: session 
      });
    } catch (error) {
      console.error('세션 확인 에러:', error);
    }
  },
}));

