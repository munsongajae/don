// Netlify Function: 환율 API
// netlify/functions/exchange-rates.js

const { createClient } = require('@supabase/supabase-js');
const yahooFinance = require('yahoo-finance2').default;
const axios = require('axios');
const cheerio = require('cheerio');

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

// 간단한 메모리 캐시
const cache = {
  usdt: { data: null, time: null },
  hana: { data: null, time: null },
  investingUsd: { data: null, time: null },
  investingJpy: { data: null, time: null },
};
const CACHE_TTL = 120000; // 2분 (밀리초)

function isCacheValid(cacheEntry) {
  if (!cacheEntry.data || !cacheEntry.time) {
    return false;
  }
  return Date.now() - cacheEntry.time < CACHE_TTL;
}

// USDT/KRW 조회 (Bithumb API)
async function fetchUsdtKrw() {
  if (isCacheValid(cache.usdt)) {
    return cache.usdt.data;
  }

  try {
    const response = await axios.get('https://api.bithumb.com/public/ticker/USDT_KRW', {
      timeout: 5000,
    });
    const price = parseFloat(response.data.data.closing_price);
    if (price) {
      cache.usdt.data = price;
      cache.usdt.time = Date.now();
      return price;
    }
    return null;
  } catch (error) {
    console.error('USDT/KRW fetch error:', error.message);
    return null;
  }
}

// 하나은행 USD/KRW 조회 (네이버 환율)
async function fetchHanaUsdKrw() {
  if (isCacheValid(cache.hana)) {
    return cache.hana.data;
  }

  try {
    const response = await axios.get('https://finance.naver.com/marketindex/', {
      timeout: 7000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $ = cheerio.load(response.data);
    const valueText = $('#exchangeList .head_info .value').text().trim();
    const price = parseFloat(valueText.replace(/,/g, '').replace('원', ''));
    
    if (price && !isNaN(price)) {
      cache.hana.data = price;
      cache.hana.time = Date.now();
      return price;
    }
    return null;
  } catch (error) {
    console.error('Hana USD/KRW fetch error:', error.message);
    return null;
  }
}

// 인베스팅 USD/KRW 조회
async function fetchInvestingUsdKrw() {
  if (isCacheValid(cache.investingUsd)) {
    return cache.investingUsd.data;
  }

  try {
    // 방법 1: yahoo-finance 사용
    const quote = await yahooFinance.quote('USDKRW=X');
    const price = quote?.regularMarketPrice;
    
    if (price && !isNaN(price)) {
      cache.investingUsd.data = price;
      cache.investingUsd.time = Date.now();
      return price;
    }
    
    // 방법 2: 인베스팅 웹사이트 스크래핑 (폴백)
    try {
      const response = await axios.get('https://kr.investing.com/currencies/exchange-rates-table', {
        timeout: 7000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const $ = cheerio.load(response.data);
      const cell = $('td.pid-650-last#last_12_28').text().trim();
      const price2 = parseFloat(cell.replace(/,/g, '').replace('원', ''));
      
      if (price2 && !isNaN(price2)) {
        cache.investingUsd.data = price2;
        cache.investingUsd.time = Date.now();
        return price2;
      }
    } catch (scrapeError) {
      console.error('Investing scraping error:', scrapeError.message);
    }
    
    return null;
  } catch (error) {
    console.error('Investing USD/KRW fetch error:', error.message);
    return null;
  }
}

// 인베스팅 JPY/KRW 조회
async function fetchInvestingJpyKrw() {
  if (isCacheValid(cache.investingJpy)) {
    return cache.investingJpy.data;
  }

  try {
    // 방법 1: yahoo-finance 사용
    const quote = await yahooFinance.quote('JPYKRW=X');
    const price = quote?.regularMarketPrice;
    
    if (price && !isNaN(price)) {
      cache.investingJpy.data = price;
      cache.investingJpy.time = Date.now();
      return price;
    }
    
    // 방법 2: 인베스팅 웹사이트 스크래핑 (폴백)
    try {
      const response = await axios.get('https://kr.investing.com/currencies/exchange-rates-table', {
        timeout: 7000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const $ = cheerio.load(response.data);
      const cell = $('td#last_2_28').text().trim();
      const price2 = parseFloat(cell.replace(/,/g, '').replace('원', ''));
      
      if (price2 && !isNaN(price2)) {
        cache.investingJpy.data = price2;
        cache.investingJpy.time = Date.now();
        return price2;
      }
    } catch (scrapeError) {
      console.error('Investing scraping error:', scrapeError.message);
    }
    
    return null;
  } catch (error) {
    console.error('Investing JPY/KRW fetch error:', error.message);
    return null;
  }
}

exports.handler = async (event, context) => {
  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/exchange-rates', '');
    const queryParams = event.queryStringParameters || {};

    // 실시간 환율 조회
    if (path === '/current' || path === '/current/') {
      const [investingUsd, hanaRate, usdtKrw, investingJpy] = await Promise.all([
        fetchInvestingUsdKrw(),
        fetchHanaUsdKrw(),
        fetchUsdtKrw(),
        fetchInvestingJpyKrw(),
      ]);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          investingUsd: investingUsd || 0,
          hanaRate: hanaRate || 0,
          usdtKrw: usdtKrw || 0,
          investingJpy: investingJpy || 0,
        }),
      };
    }

    // 개별 환율 조회
    if (path === '/usdt-krw' || path === '/usdt-krw/') {
      const rate = await fetchUsdtKrw();
      if (rate === null) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'USDT/KRW 데이터를 가져올 수 없습니다' }),
        };
      }
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ rate }),
      };
    }

    if (path === '/hana-usd-krw' || path === '/hana-usd-krw/') {
      const rate = await fetchHanaUsdKrw();
      if (rate === null) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: '하나은행 환율 데이터를 가져올 수 없습니다' }),
        };
      }
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ rate }),
      };
    }

    if (path === '/investing-usd-krw' || path === '/investing-usd-krw/') {
      const rate = await fetchInvestingUsdKrw();
      if (rate === null) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: '인베스팅 USD/KRW 데이터를 가져올 수 없습니다' }),
        };
      }
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ rate }),
      };
    }

    if (path === '/investing-jpy-krw' || path === '/investing-jpy-krw/') {
      const rate = await fetchInvestingJpyKrw();
      if (rate === null) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: '인베스팅 JPY/KRW 데이터를 가져올 수 없습니다' }),
        };
      }
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ rate }),
      };
    }

    // 기간별 데이터는 클라이언트에서 처리하므로 여기서는 처리하지 않음
    // 필요시 Supabase에서 캐시된 데이터를 가져오거나, 클라이언트에서 직접 yahoo-finance 사용

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message,
        detail: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    };
  }
};

