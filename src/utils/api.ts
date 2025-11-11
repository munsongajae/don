import axios from 'axios';

// Netlify Functions 사용 시 baseURL은 빈 문자열 (같은 도메인)
// 개발 환경: Vite proxy 사용 (로컬 개발 시)
// 프로덕션 환경: Netlify Functions가 자동으로 /api/* 경로를 라우팅
const getApiBaseUrl = () => {
  // 개발 환경: Vite proxy 사용 (로컬 개발 시)
  if (import.meta.env.DEV) {
    return '';
  }
  // 프로덕션 환경: Netlify Functions 사용 (같은 도메인)
  return '';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃
});

// 요청 인터셉터: 에러 처리 개선
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 개선
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버가 응답했지만 에러 상태 코드
      const message = error.response.data?.detail || error.response.data?.message || error.message;
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못함
      console.error('API Request Error:', error.request);
      return Promise.reject(new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'));
    } else {
      // 요청 설정 중 에러 발생
      console.error('API Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// 환율 API
export const exchangeRateApi = {
  // 실시간 환율
  getCurrentRates: () => apiClient.get('/api/exchange-rates/current'),
  
  // 기간별 데이터
  // 주의: 기간별 데이터는 실행 시간 제한으로 인해 Functions로 구현하지 않았습니다.
  // 백엔드 URL이 있으면 백엔드 사용, 없으면 Functions 사용 (에러 가능)
  getPeriodData: (periodMonths: number) => {
    // 백엔드 URL이 있으면 백엔드 사용
    const backendUrl = import.meta.env.VITE_API_URL;
    if (backendUrl) {
      return axios.get(`${backendUrl}/api/exchange-rates/period/${periodMonths}`);
    }
    // 없으면 Functions 사용 (현재는 구현되지 않음)
    return apiClient.get(`/api/exchange-rates/period/${periodMonths}`);
  },
  
  // USDT/KRW
  getUsdtKrw: () => apiClient.get('/api/exchange-rates/usdt-krw'),
  
  // 하나은행 USD/KRW
  getHanaUsdKrw: () => apiClient.get('/api/exchange-rates/hana-usd-krw'),
  
  // 인베스팅 USD/KRW
  getInvestingUsdKrw: () => apiClient.get('/api/exchange-rates/investing-usd-krw'),
  
  // 인베스팅 JPY/KRW
  getInvestingJpyKrw: () => apiClient.get('/api/exchange-rates/investing-jpy-krw'),
};

// 투자 관리 API
export const investmentApi = {
  // 달러 투자
  getDollarInvestments: () => apiClient.get('/api/investments/dollar'),
  createDollarInvestment: (data: any) => 
    apiClient.post('/api/investments/dollar', data),
  deleteDollarInvestment: (id: string) => 
    apiClient.delete(`/api/investments/dollar/${id}`),
  sellDollarInvestment: (id: string, data: any) => 
    apiClient.post(`/api/investments/dollar/${id}/sell`, data),
  
  // 엔화 투자
  getJpyInvestments: () => apiClient.get('/api/investments/jpy'),
  createJpyInvestment: (data: any) => 
    apiClient.post('/api/investments/jpy', data),
  deleteJpyInvestment: (id: string) => 
    apiClient.delete(`/api/investments/jpy/${id}`),
  sellJpyInvestment: (id: string, data: any) => 
    apiClient.post(`/api/investments/jpy/${id}/sell`, data),
  
  // 매도 기록
  getDollarSellRecords: () => apiClient.get('/api/sell-records/dollar'),
  deleteDollarSellRecord: (id: string) => 
    apiClient.delete(`/api/sell-records/dollar/${id}`),
  getJpySellRecords: () => apiClient.get('/api/sell-records/jpy'),
  deleteJpySellRecord: (id: string) => 
    apiClient.delete(`/api/sell-records/jpy/${id}`),
};

export default apiClient;

