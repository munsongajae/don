import { create } from 'zustand';
import { exchangeRateApi } from '@/utils/api';

interface CurrentRates {
  investingUsd?: number;
  hanaRate?: number;
  usdtKrw?: number;
  investingJpy?: number;
}

interface PeriodData {
  dfClose: Record<string, number[]>;
  dfHigh: Record<string, number[]>;
  dfLow: Record<string, number[]>;
  currentRates: Record<string, number>;
  dates: string[];
}

interface ExchangeRateState {
  currentRates: CurrentRates | null;
  periodData: Record<number, PeriodData | null>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  fetchCurrentRates: () => Promise<void>;
  fetchPeriodData: (periodMonths: number) => Promise<void>;
  clearError: () => void;
}

export const useExchangeRateStore = create<ExchangeRateState>((set, get) => ({
  currentRates: null,
  periodData: {},
  loading: false,
  error: null,
  lastUpdated: null,

  fetchCurrentRates: async () => {
    set({ loading: true, error: null });
    try {
      const response = await exchangeRateApi.getCurrentRates();
      const data = response.data;

      set({
        currentRates: {
          investingUsd: data.investingUsd,
          hanaRate: data.hanaRate,
          usdtKrw: data.usdtKrw,
          investingJpy: data.investingJpy,
        },
        lastUpdated: new Date(),
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('fetchCurrentRates error:', error);
      const errorMessage = error?.message || error?.response?.data?.detail || '환율 데이터를 가져오는데 실패했습니다.';
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  fetchPeriodData: async (periodMonths: number) => {
    const { periodData } = get();
    if (periodData[periodMonths]) {
      return; // 이미 캐시된 데이터가 있으면 스킵
    }

    set({ loading: true, error: null });
    try {
      const response = await exchangeRateApi.getPeriodData(periodMonths);
      const data = response.data;

      set((state) => ({
        periodData: {
          ...state.periodData,
          [periodMonths]: data,
        },
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      console.error('fetchPeriodData error:', error);
      const errorMessage = error?.message || error?.response?.data?.detail || `기간별 데이터(${periodMonths}개월)를 가져오는데 실패했습니다.`;
      set({
        error: errorMessage,
        loading: false,
      });
      // 에러가 발생해도 기존 데이터는 유지
    }
  },

  clearError: () => set({ error: null }),
}));

