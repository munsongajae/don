import { create } from 'zustand';
import { DollarInvestment, JpyInvestment, DollarSellRecord, JpySellRecord } from '@/types';

interface InvestmentStore {
  dollarInvestments: DollarInvestment[];
  jpyInvestments: JpyInvestment[];
  dollarSellRecords: DollarSellRecord[];
  jpySellRecords: JpySellRecord[];
  loading: boolean;
  error: string | null;

  // Dollar
  fetchDollarInvestments: () => Promise<void>;
  createDollarInvestment: (data: Omit<DollarInvestment, 'id' | 'created_at'>) => Promise<void>;
  deleteDollarInvestment: (id: string) => Promise<void>;
  
  // JPY
  fetchJpyInvestments: () => Promise<void>;
  createJpyInvestment: (data: Omit<JpyInvestment, 'id' | 'created_at'>) => Promise<void>;
  deleteJpyInvestment: (id: string) => Promise<void>;
  
  // Sell Records
  fetchDollarSellRecords: () => Promise<void>;
  createDollarSellRecord: (data: Omit<DollarSellRecord, 'id' | 'created_at'>) => Promise<void>;
  deleteDollarSellRecord: (id: string) => Promise<void>;
  
  fetchJpySellRecords: () => Promise<void>;
  createJpySellRecord: (data: Omit<JpySellRecord, 'id' | 'created_at'>) => Promise<void>;
  deleteJpySellRecord: (id: string) => Promise<void>;
  
  clearError: () => void;
}

export const useInvestmentStore = create<InvestmentStore>((set, get) => ({
  dollarInvestments: [],
  jpyInvestments: [],
  dollarSellRecords: [],
  jpySellRecords: [],
  loading: false,
  error: null,

  fetchDollarInvestments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/investments/dollar');
      if (!response.ok) {
        throw new Error('달러 투자 목록 조회 실패');
      }
      const data = await response.json();
      set({ dollarInvestments: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  createDollarInvestment: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/investments/dollar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('달러 투자 등록 실패');
      }
      set({ loading: false });
      await get().fetchDollarInvestments();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  deleteDollarInvestment: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/investments/dollar?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('달러 투자 삭제 실패');
      }
      await get().fetchDollarInvestments();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  fetchJpyInvestments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/investments/jpy');
      if (!response.ok) {
        throw new Error('엔화 투자 목록 조회 실패');
      }
      const data = await response.json();
      set({ jpyInvestments: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  createJpyInvestment: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/investments/jpy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('엔화 투자 등록 실패');
      }
      set({ loading: false });
      await get().fetchJpyInvestments();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  deleteJpyInvestment: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/investments/jpy?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('엔화 투자 삭제 실패');
      }
      await get().fetchJpyInvestments();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  fetchDollarSellRecords: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sell-records/dollar');
      if (!response.ok) {
        throw new Error('달러 매도 기록 조회 실패');
      }
      const data = await response.json();
      set({ dollarSellRecords: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  createDollarSellRecord: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sell-records/dollar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('달러 매도 기록 등록 실패');
      }
      set({ loading: false });
      await get().fetchDollarSellRecords();
      await get().fetchDollarInvestments(); // 투자 목록도 갱신
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  deleteDollarSellRecord: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/sell-records/dollar?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('달러 매도 기록 삭제 실패');
      }
      await get().fetchDollarSellRecords();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  fetchJpySellRecords: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sell-records/jpy');
      if (!response.ok) {
        throw new Error('엔화 매도 기록 조회 실패');
      }
      const data = await response.json();
      set({ jpySellRecords: data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  createJpySellRecord: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sell-records/jpy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('엔화 매도 기록 등록 실패');
      }
      set({ loading: false });
      await get().fetchJpySellRecords();
      await get().fetchJpyInvestments(); // 투자 목록도 갱신
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  deleteJpySellRecord: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/sell-records/jpy?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('엔화 매도 기록 삭제 실패');
      }
      await get().fetchJpySellRecords();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

