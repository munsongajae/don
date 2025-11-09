import axios from 'axios';

// 환경 변수에서 API URL 가져오기 (배포 환경에서 백엔드 URL)
// 개발 환경: Vite proxy 사용 (빈 문자열)
// 프로덕션 환경: 환경 변수에서 백엔드 URL 사용
const getApiBaseUrl = () => {
  // Vite 환경 변수 사용 (VITE_ 접두사 필요)
  // Netlify에서 환경 변수로 설정한 백엔드 URL 사용
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 개발 환경: Vite proxy 사용 (로컬 개발 시)
  if (import.meta.env.DEV) {
    return '';
  }
  // 프로덕션 환경에서 VITE_API_URL이 없으면 에러
  // Netlify 환경 변수에 VITE_API_URL을 설정해야 합니다
  console.warn('VITE_API_URL이 설정되지 않았습니다. Netlify 환경 변수를 확인해주세요.');
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
  getPeriodData: (periodMonths: number) => 
    apiClient.get(`/api/exchange-rates/period/${periodMonths}`),
  
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

