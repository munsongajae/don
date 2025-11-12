import { create } from 'zustand';
import { DollarInvestment, JpyInvestment, DollarSellRecord, JpySellRecord } from '@/types';
import { API_BASE_URL } from '@/lib/config/constants';
import { supabase } from '@/lib/supabase/client';

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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/investments/dollar` : '/api/investments/dollar';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, { headers });
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/investments/dollar` : '/api/investments/dollar';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/investments/dollar?id=${id}` 
        : `/api/investments/dollar?id=${id}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/investments/jpy` : '/api/investments/jpy';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, { headers });
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/investments/jpy` : '/api/investments/jpy';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/investments/jpy?id=${id}` 
        : `/api/investments/jpy?id=${id}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/sell-records/dollar` : '/api/sell-records/dollar';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, { headers });
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/sell-records/dollar` : '/api/sell-records/dollar';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/sell-records/dollar?id=${id}` 
        : `/api/sell-records/dollar?id=${id}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/sell-records/jpy` : '/api/sell-records/jpy';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, { headers });
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/sell-records/jpy` : '/api/sell-records/jpy';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
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
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = API_BASE_URL 
        ? `${API_BASE_URL}/api/sell-records/jpy?id=${id}` 
        : `/api/sell-records/jpy?id=${id}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
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

