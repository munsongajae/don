import axios from 'axios';
import * as cheerio from 'cheerio';
import { BITHUMB_USDT_URL, INVESTING_EXCHANGE_RATES_TABLE_URL, HANA_BANK_URL } from '@/lib/config/constants';

// 간단한 메모리 캐시
interface CacheEntry<T> {
  data: T | null;
  time: number | null;
}

const cache: {
  usdt: CacheEntry<number>;
  hana: CacheEntry<number>;
  investingUsd: CacheEntry<number>;
  investingJpy: CacheEntry<number>;
} = {
  usdt: { data: null, time: null },
  hana: { data: null, time: null },
  investingUsd: { data: null, time: null },
  investingJpy: { data: null, time: null },
};

const CACHE_TTL = 180 * 1000; // 3분 (밀리초) - 원본과 동일

function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  if (!entry.data || !entry.time) {
    return false;
  }
  return Date.now() - entry.time < CACHE_TTL;
}

/**
 * Bithumb에서 USDT/KRW 현재가를 가져옵니다.
 */
export async function fetchUsdtKrwPrice(): Promise<number | null> {
  if (isCacheValid(cache.usdt)) {
    return cache.usdt.data;
  }

  try {
    const response = await axios.get(BITHUMB_USDT_URL, { timeout: 5000 });
    const priceStr = response.data?.data?.closing_price;
    const price = priceStr ? parseFloat(priceStr) : null;
    
    if (price) {
      cache.usdt = { data: price, time: Date.now() };
    }
    return price;
  } catch (error) {
    console.error('USDT 가격 조회 실패:', error);
    return null;
  }
}

/**
 * 하나은행에서 USD/KRW 환율을 가져옵니다.
 * 원본: 네이버 금융 메인 페이지에서 파싱
 */
export async function fetchHanaUsdKrwRate(): Promise<number | null> {
  if (isCacheValid(cache.hana)) {
    return cache.hana.data;
  }

  try {
    const response = await axios.get(HANA_BANK_URL, {
      timeout: 7000,
      headers: {
        'User-Agent': 'Mozilla/5.0', // 원본과 동일
      },
    });
    
    const $ = cheerio.load(response.data);
    // 원본 셀렉터: #exchangeList .head_info .value (select_one과 동일)
    const node = $('#exchangeList .head_info .value').first();
    if (!node || node.length === 0) {
      // 대체 셀렉터 시도
      const altNode = $('.head_info .value').first();
      if (!altNode || altNode.length === 0) {
        console.warn('하나은행 환율 셀렉터를 찾을 수 없습니다. HTML 길이:', response.data.length);
        // 디버깅: HTML 일부 출력
        if (response.data.includes('exchangeList')) {
          console.warn('exchangeList는 존재하지만 value를 찾을 수 없습니다.');
        }
        return null;
      }
      const text = altNode.text().trim();
      const num = text.replace(/,/g, '').replace('원', '').trim();
      const rate = num ? parseFloat(num) : null;
      
      if (rate && !isNaN(rate) && rate > 1000 && rate < 2000) {
        cache.hana = { data: rate, time: Date.now() };
        console.log('하나은행 환율 조회 성공 (대체 셀렉터):', rate);
        return rate;
      }
      return null;
    }
    
    const text = node.text().trim();
    // 숫자만 추출 (쉼표, "원" 제거)
    const num = text.replace(/,/g, '').replace('원', '').trim();
    const rate = num ? parseFloat(num) : null;
    
    if (rate && !isNaN(rate) && rate > 1000 && rate < 2000) {
      cache.hana = { data: rate, time: Date.now() };
      console.log('하나은행 환율 조회 성공:', rate);
      return rate;
    }
    
    console.warn('하나은행 환율 파싱 실패:', text, '파싱된 숫자:', num, '변환된 값:', rate);
    return null;
  } catch (error: any) {
    console.error('하나은행 환율 조회 실패:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data?.substring?.(0, 200),
    });
    return null;
  }
}

/**
 * 인베스팅닷컴에서 USD/KRW 환율을 가져옵니다.
 * 원본: 환율 테이블 페이지에서 파싱 (td.pid-650-last#last_12_28)
 * Vercel 환경 대응: 재시도 로직 및 Cloudflare 우회 헤더 추가
 */
export async function fetchInvestingUsdKrwRate(): Promise<number | null> {
  if (isCacheValid(cache.investingUsd)) {
    return cache.investingUsd.data;
  }

  // Cloudflare 우회를 위한 최적화된 헤더 세트 (JPY와 동일)
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://kr.investing.com/',
    'DNT': '1',
  };

  // 재시도 로직 (최대 3회)
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 첫 시도 전에도 약간의 랜덤 딜레이 (0.5~1.5초) - Cloudflare 우회를 위해
      if (attempt === 1) {
        const initialDelay = 500 + Math.random() * 1000; // 0.5~1.5초 랜덤
        await new Promise(resolve => setTimeout(resolve, initialDelay));
      } else {
        // 재시도 간 딜레이 증가 (3초, 5초, 8초)
        const delay = 2000 + (attempt - 1) * 2000; // 3초, 5초, 8초
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await axios.get(INVESTING_EXCHANGE_RATES_TABLE_URL, {
        headers,
        timeout: 10000, // Vercel 무료 플랜 제한을 고려하여 10초로 설정
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // 5xx 에러만 throw
      });

      // Cloudflare 보호 페이지 체크
      if (response.data && typeof response.data === 'string' && response.data.includes('Just a moment')) {
        console.warn(`[fetchInvestingUsdKrwRate] Cloudflare 보호 페이지 감지 (시도 ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }

      if (response.status !== 200) {
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }
    
      // 원본과 동일: find("td", {"class": "pid-650-last", "id": "last_12_28"})
      // BeautifulSoup의 find는 class와 id를 모두 만족하는 요소를 찾음
      const $ = cheerio.load(response.data);
      
      // 원본 Python 코드와 동일: class="pid-650-last" AND id="last_12_28"
      // Cheerio에서 속성을 모두 만족하는 요소 찾기
      let cell = $('td.pid-650-last[id="last_12_28"]').first();
      if (cell.length === 0) {
        // 대체: 다른 방법으로 시도
        cell = $('td#last_12_28.pid-650-last').first();
      }
      if (cell.length === 0) {
        // 대체: id만으로 찾기
        cell = $('td#last_12_28').first();
      }
      if (cell.length === 0) {
        // 디버깅: HTML에서 관련 텍스트 검색
        const htmlContent = response.data;
        const hasLast1228 = htmlContent.includes('last_12_28');
        const hasPid650 = htmlContent.includes('pid-650');
        console.warn(`[fetchInvestingUsdKrwRate] 셀렉터 실패 (시도 ${attempt}/${maxRetries}):`, {
          hasLast1228,
          hasPid650,
          htmlLength: htmlContent.length,
          statusCode: response.status,
        });
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }
      
      const text = cell.text().trim();
      // 원본과 동일: 쉼표, "원" 제거
      const num = text.replace(/,/g, '').replace('원', '').trim();
      const rate = num ? parseFloat(num) : null;
      
      // 원본과 동일: 유효성 검사 없이 바로 반환 (원본은 검사하지 않음)
      if (rate && !isNaN(rate)) {
        cache.investingUsd = { data: rate, time: Date.now() };
        console.log('인베스팅닷컴 USD/KRW 조회 성공:', rate);
        return rate;
      }
      
      console.warn(`[fetchInvestingUsdKrwRate] 파싱 실패 (시도 ${attempt}/${maxRetries}):`, {
        text,
        num,
        rate,
        cellHtml: cell.html()?.substring(0, 100),
      });
      
      if (attempt < maxRetries) {
        continue; // 재시도
      }
      return null;
    } catch (error: any) {
      // 403 에러인 경우 재시도
      if (error?.response?.status === 403 && attempt < maxRetries) {
        console.warn(`[fetchInvestingUsdKrwRate] 403 에러 (시도 ${attempt}/${maxRetries}), 재시도 중...`);
        continue;
      }

      // 마지막 시도에서만 에러 로깅
      if (attempt === maxRetries) {
        console.error('인베스팅닷컴 USD/KRW 조회 실패 (3회 시도 후):', {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data?.substring?.(0, 200),
        });
      }
    }
  }

  return null;
}

/**
 * 인베스팅닷컴에서 JPY/KRW 환율을 가져옵니다.
 * 원본: 환율 테이블 페이지에서 파싱 (td#last_2_28)
 * Investing.com의 last_2_28은 1엔당이므로 100엔당으로 변환하여 반환
 */
export async function fetchInvestingJpyKrwRate(): Promise<number | null> {
  if (isCacheValid(cache.investingJpy)) {
    return cache.investingJpy.data;
  }

  // Cloudflare 우회를 위한 최적화된 헤더 세트
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://kr.investing.com/',
    'DNT': '1',
  };

  // 재시도 로직 (최대 3회)
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 첫 시도 전에도 약간의 랜덤 딜레이 (0.5~1.5초) - Cloudflare 우회를 위해
      if (attempt === 1) {
        const initialDelay = 500 + Math.random() * 1000; // 0.5~1.5초 랜덤
        await new Promise(resolve => setTimeout(resolve, initialDelay));
      } else {
        // 재시도 간 딜레이 증가 (3초, 5초, 8초)
        const delay = 2000 + (attempt - 1) * 2000; // 3초, 5초, 8초
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await axios.get(INVESTING_EXCHANGE_RATES_TABLE_URL, {
        headers,
        timeout: 10000, // Vercel 무료 플랜 제한을 고려하여 10초로 설정
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // 5xx 에러만 throw
      });

      // Cloudflare 보호 페이지 체크
      if (response.data && typeof response.data === 'string' && response.data.includes('Just a moment')) {
        console.warn(`[fetchInvestingJpyKrwRate] Cloudflare 보호 페이지 감지 (시도 ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }

      if (response.status !== 200) {
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }
    
      const $ = cheerio.load(response.data);
      // 원본 셀렉터: td#last_2_28 (find("td", {"id": "last_2_28"}))
      const cell = $('td#last_2_28').first();
      if (cell.length === 0) {
        // 디버깅: HTML에서 관련 텍스트 검색
        const htmlContent = response.data;
        if (htmlContent.includes('last_2_28')) {
          console.warn('인베스팅닷컴 JPY/KRW: last_2_28은 존재하지만 셀렉터로 찾을 수 없습니다.');
        } else {
          console.warn('인베스팅닷컴 JPY/KRW: last_2_28을 찾을 수 없습니다. HTML 길이:', htmlContent.length);
        }
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }
      
      const text = cell.text().trim();
      // 원본과 동일: 쉼표, "원" 제거
      const num = text.replace(/,/g, '').replace('원', '').trim();
      const rate = num ? parseFloat(num) : null;
      
      // 원본과 동일: 유효성 검사 없이 바로 반환
      // Investing.com의 last_2_28은 1엔당이므로 100엔당으로 변환
      if (rate && !isNaN(rate)) {
        const rate100 = rate * 100; // 100엔당으로 변환
        cache.investingJpy = { data: rate100, time: Date.now() };
        console.log('인베스팅닷컴 JPY/KRW 조회 성공 (100엔당):', rate100);
        return rate100;
      }
      
      console.warn('인베스팅닷컴 JPY/KRW 파싱 실패:', {
        text,
        num,
        rate,
        cellHtml: cell.html()?.substring(0, 100),
      });
      
      if (attempt < maxRetries) {
        continue; // 재시도
      }
      return null;
    } catch (error: any) {
      // 403 에러인 경우 재시도
      if (error?.response?.status === 403 && attempt < maxRetries) {
        console.warn(`[fetchInvestingJpyKrwRate] 403 에러 (시도 ${attempt}/${maxRetries}), 재시도 중...`);
        continue;
      }

      // 마지막 시도에서만 에러 로깅
      if (attempt === maxRetries) {
        console.error('인베스팅닷컴 JPY/KRW 조회 실패 (3회 시도 후):', {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data?.substring?.(0, 200),
        });
      }
    }
  }

  return null;
}

/**
 * 모든 실시간 환율을 가져옵니다.
 * 원본과 동일한 로직: Investing.com 실패 시 하나은행 데이터를 fallback으로 사용
 */
export async function fetchCurrentRates() {
  // 병렬로 모든 환율 조회 (원본과 동일)
  const [investingUsd, hanaRate, usdtKrw, investingJpy] = await Promise.allSettled([
    fetchInvestingUsdKrwRate(),
    fetchHanaUsdKrwRate(),
    fetchUsdtKrwPrice(),
    fetchInvestingJpyKrwRate(),
  ]);

  // Promise.allSettled 결과 처리
  const investingUsdValue = investingUsd.status === 'fulfilled' ? investingUsd.value : null;
  const hanaRateValue = hanaRate.status === 'fulfilled' ? hanaRate.value : null;
  const usdtKrwValue = usdtKrw.status === 'fulfilled' ? usdtKrw.value : null;
  const investingJpyValue = investingJpy.status === 'fulfilled' ? investingJpy.value : null;

  // Investing.com이 실패하면 하나은행 데이터를 fallback으로 사용 (원본과 동일)
  const finalInvestingUsd = investingUsdValue || hanaRateValue || 0;
  
  return {
    investingUsd: finalInvestingUsd,
    hanaRate: hanaRateValue || finalInvestingUsd || 0,
    usdtKrw: usdtKrwValue || 0,
    investingJpy: investingJpyValue || 0,
  };
}

