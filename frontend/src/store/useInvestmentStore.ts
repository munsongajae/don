import { create } from 'zustand';
import { investmentApi } from '@/utils/api';

interface Investment {
  id: string;
  investment_number: number;
  purchase_date: string;
  exchange_rate: number;
  purchase_krw: number;
  usd_amount?: number;
  jpy_amount?: number;
  exchange_name: string;
}

interface SellRecord {
  id: string;
  investment_id: string;
  investment_number: number;
  sell_date: string;
  purchase_rate: number;
  sell_rate: number;
  sell_amount: number;
  sell_krw: number;
  profit_krw: number;
  exchange_name: string;
}

interface InvestmentState {
  dollarInvestments: Investment[];
  jpyInvestments: Investment[];
  dollarSellRecords: SellRecord[];
  jpySellRecords: SellRecord[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchDollarInvestments: () => Promise<void>;
  fetchJpyInvestments: () => Promise<void>;
  fetchDollarSellRecords: () => Promise<void>;
  fetchJpySellRecords: () => Promise<void>;
  createDollarInvestment: (data: any) => Promise<void>;
  createJpyInvestment: (data: any) => Promise<void>;
  deleteDollarInvestment: (id: string) => Promise<void>;
  deleteJpyInvestment: (id: string) => Promise<void>;
  sellDollarInvestment: (id: string, data: any) => Promise<void>;
  sellJpyInvestment: (id: string, data: any) => Promise<void>;
  deleteDollarSellRecord: (id: string) => Promise<void>;
  deleteJpySellRecord: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  dollarInvestments: [],
  jpyInvestments: [],
  dollarSellRecords: [],
  jpySellRecords: [],
  loading: false,
  error: null,

  fetchDollarInvestments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await investmentApi.getDollarInvestments();
      set({ dollarInvestments: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || '달러 투자 데이터를 가져오는데 실패했습니다.',
        loading: false,
      });
    }
  },

  fetchJpyInvestments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await investmentApi.getJpyInvestments();
      set({ jpyInvestments: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || '엔화 투자 데이터를 가져오는데 실패했습니다.',
        loading: false,
      });
    }
  },

  fetchDollarSellRecords: async () => {
    set({ loading: true, error: null });
    try {
      const response = await investmentApi.getDollarSellRecords();
      set({ dollarSellRecords: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || '달러 매도 기록을 가져오는데 실패했습니다.',
        loading: false,
      });
    }
  },

  fetchJpySellRecords: async () => {
    set({ loading: true, error: null });
    try {
      const response = await investmentApi.getJpySellRecords();
      set({ jpySellRecords: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || '엔화 매도 기록을 가져오는데 실패했습니다.',
        loading: false,
      });
    }
  },

  createDollarInvestment: async (data: any) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.createDollarInvestment(data);
      await get().fetchDollarInvestments();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '달러 투자 등록에 실패했습니다.',
        loading: false,
      });
    }
  },

  createJpyInvestment: async (data: any) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.createJpyInvestment(data);
      await get().fetchJpyInvestments();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '엔화 투자 등록에 실패했습니다.',
        loading: false,
      });
    }
  },

  deleteDollarInvestment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.deleteDollarInvestment(id);
      await get().fetchDollarInvestments();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '달러 투자 삭제에 실패했습니다.',
        loading: false,
      });
    }
  },

  deleteJpyInvestment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.deleteJpyInvestment(id);
      await get().fetchJpyInvestments();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '엔화 투자 삭제에 실패했습니다.',
        loading: false,
      });
    }
  },

  sellDollarInvestment: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.sellDollarInvestment(id, data);
      await get().fetchDollarInvestments();
      await get().fetchDollarSellRecords();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '달러 매도에 실패했습니다.',
        loading: false,
      });
    }
  },

  sellJpyInvestment: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.sellJpyInvestment(id, data);
      await get().fetchJpyInvestments();
      await get().fetchJpySellRecords();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '엔화 매도에 실패했습니다.',
        loading: false,
      });
    }
  },

  deleteDollarSellRecord: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.deleteDollarSellRecord(id);
      await get().fetchDollarSellRecords();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '달러 매도 기록 삭제에 실패했습니다.',
        loading: false,
      });
    }
  },

  deleteJpySellRecord: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await investmentApi.deleteJpySellRecord(id);
      await get().fetchJpySellRecords();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || '엔화 매도 기록 삭제에 실패했습니다.',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

