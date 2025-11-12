import { create } from 'zustand';
import { PeriodData, ExchangeRate } from '@/types';
import { API_BASE_URL } from '@/lib/config/constants';

interface ExchangeRateStore {
  currentRates: ExchangeRate | null;
  periodData: Record<number, PeriodData | null>;
  loading: boolean;
  error: string | null;
  
  fetchCurrentRates: () => Promise<void>;
  fetchPeriodData: (periodMonths: number) => Promise<void>;
  clearError: () => void;
}

export const useExchangeRateStore = create<ExchangeRateStore>((set, get) => ({
  currentRates: null,
  periodData: {},
  loading: false,
  error: null,

  fetchCurrentRates: async () => {
    set({ loading: true, error: null });
    try {
      // API_BASE_URL이 있으면 절대 URL 사용, 없으면 상대 URL 사용
      const apiUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/exchange-rates/current`
        : '/api/exchange-rates/current';
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('실시간 환율 조회 실패');
      }
      const data = await response.json();
      set({ currentRates: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  fetchPeriodData: async (periodMonths: number) => {
    const state = get();
    // 이미 캐시된 데이터가 있으면 스킵
    if (state.periodData[periodMonths]) {
      return;
    }

    set({ loading: true, error: null });
    try {
      // API_BASE_URL이 있으면 절대 URL 사용, 없으면 상대 URL 사용
      const apiUrl = API_BASE_URL
        ? `${API_BASE_URL}/api/exchange-rates/period/${periodMonths}`
        : `/api/exchange-rates/period/${periodMonths}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '기간별 데이터 조회 실패');
      }
      const data = await response.json();
      set((state) => ({
        periodData: {
          ...state.periodData,
          [periodMonths]: data,
        },
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('fetchPeriodData 에러:', error);
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
      // 에러가 발생해도 기존 데이터는 유지
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

