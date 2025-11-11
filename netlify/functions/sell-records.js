// Netlify Function: 매도 기록 API
// netlify/functions/sell-records.js

const { createClient } = require('@supabase/supabase-js');

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
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (!supabase) {
    return {
      statusCode: 503,
      headers: corsHeaders,
      body: JSON.stringify({ error: '데이터베이스 연결에 실패했습니다. Supabase 설정을 확인해주세요.' }),
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/sell-records', '');
    const queryParams = event.queryStringParameters || {};

    // 달러 매도 기록 API
    if (path.startsWith('/dollar')) {
      const dollarPath = path.replace('/dollar', '');
      
      // GET /api/sell-records/dollar - 목록 조회
      if ((dollarPath === '' || dollarPath === '/') && event.httpMethod === 'GET') {
        const { data, error } = await supabase
          .from('dollar_sell_records')
          .select('*')
          .order('sell_date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(data || []),
        };
      }
      
      // DELETE /api/sell-records/dollar/{id} - 매도 기록 삭제
      if (dollarPath.startsWith('/') && dollarPath.length > 1 && event.httpMethod === 'DELETE') {
        const recordId = dollarPath.substring(1);
        
        const { error } = await supabase
          .from('dollar_sell_records')
          .delete()
          .eq('id', recordId);
        
        if (error) {
          throw error;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };
      }
    }
    
    // 엔화 매도 기록 API
    if (path.startsWith('/jpy')) {
      const jpyPath = path.replace('/jpy', '');
      
      // GET /api/sell-records/jpy - 목록 조회
      if ((jpyPath === '' || jpyPath === '/') && event.httpMethod === 'GET') {
        const { data, error } = await supabase
          .from('jpy_sell_records')
          .select('*')
          .order('sell_date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(data || []),
        };
      }
      
      // DELETE /api/sell-records/jpy/{id} - 매도 기록 삭제
      if (jpyPath.startsWith('/') && jpyPath.length > 1 && event.httpMethod === 'DELETE') {
        const recordId = jpyPath.substring(1);
        
        const { error } = await supabase
          .from('jpy_sell_records')
          .delete()
          .eq('id', recordId);
        
        if (error) {
          throw error;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };
      }
    }
    
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

