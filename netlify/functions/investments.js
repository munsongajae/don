// Netlify Function: 투자 관리 API
// netlify/functions/investments.js

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
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// 데이터 정리 함수
function cleanData(data) {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      // memo는 null 허용
      if (key === 'memo') {
        cleaned[key] = null;
      }
      continue;
    }
    
    if (typeof value === 'number') {
      // NaN, Infinity 체크
      if (isNaN(value) || !isFinite(value)) {
        continue;
      }
      cleaned[key] = value;
    } else if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
      cleaned[key] = value;
    } else if (value instanceof Date) {
      cleaned[key] = value.toISOString();
    } else {
      // 다른 타입은 문자열로 변환 시도
      try {
        cleaned[key] = String(value);
      } catch (e) {
        continue;
      }
    }
  }
  return cleaned;
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

  if (!supabase) {
    return {
      statusCode: 503,
      headers: corsHeaders,
      body: JSON.stringify({ error: '데이터베이스 연결에 실패했습니다. Supabase 설정을 확인해주세요.' }),
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/investments', '');
    const body = event.body ? JSON.parse(event.body) : {};

    // 달러 투자 API
    if (path.startsWith('/dollar')) {
      const dollarPath = path.replace('/dollar', '');
      
      // GET /api/investments/dollar - 목록 조회
      if (dollarPath === '' || dollarPath === '/') {
        if (event.httpMethod === 'GET') {
          const { data, error } = await supabase
            .from('dollar_investments')
            .select('*')
            .order('purchase_date', { ascending: false });
          
          if (error) {
            throw error;
          }
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(data || []),
          };
        }
        
        // POST /api/investments/dollar - 투자 등록
        if (event.httpMethod === 'POST') {
          const cleanedData = cleanData(body);
          
          // 필수 필드 확인
          const requiredFields = ['investment_number', 'purchase_date', 'exchange_rate', 'purchase_krw', 'exchange_name'];
          const missing = requiredFields.filter(field => !(field in cleanedData));
          
          if (missing.length > 0) {
            return {
              statusCode: 400,
              headers: corsHeaders,
              body: JSON.stringify({ error: `필수 필드가 누락되었습니다: ${missing.join(', ')}` }),
            };
          }
          
          const { data, error } = await supabase
            .from('dollar_investments')
            .insert(cleanedData)
            .select();
          
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
      
      // DELETE /api/investments/dollar/{id} - 투자 삭제
      if (dollarPath.startsWith('/') && dollarPath.length > 1 && event.httpMethod === 'DELETE') {
        const investmentId = dollarPath.substring(1);
        
        const { error } = await supabase
          .from('dollar_investments')
          .delete()
          .eq('id', investmentId);
        
        if (error) {
          throw error;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };
      }
      
      // POST /api/investments/dollar/{id}/sell - 투자 매도
      if (dollarPath.includes('/sell') && event.httpMethod === 'POST') {
        const parts = dollarPath.split('/');
        const investmentId = parts[1];
        const { sell_rate, sell_amount } = body;
        
        if (!sell_rate || !sell_amount) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'sell_rate와 sell_amount가 필요합니다' }),
          };
        }
        
        // 투자 정보 조회
        const { data: investment, error: fetchError } = await supabase
          .from('dollar_investments')
          .select('*')
          .eq('id', investmentId)
          .single();
        
        if (fetchError || !investment) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: '투자 정보를 찾을 수 없습니다' }),
          };
        }
        
        const currentAmount = investment.usd_amount || 0;
        
        // 매도 금액 검증
        if (sell_amount > currentAmount) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: `보유 금액(${currentAmount.toFixed(2)}USD)보다 많이 매도할 수 없습니다`,
              remaining: currentAmount 
            }),
          };
        }
        
        // 매도 기록 저장
        const sellData = {
          investment_id: investmentId,
          investment_number: investment.investment_number,
          sell_date: new Date().toISOString(),
          purchase_rate: investment.exchange_rate,
          sell_rate: sell_rate,
          sell_amount: sell_amount,
          sell_krw: sell_amount * sell_rate,
          profit_krw: (sell_rate - investment.exchange_rate) * sell_amount,
          exchange_name: investment.exchange_name,
        };
        
        const { error: sellRecordError } = await supabase
          .from('dollar_sell_records')
          .insert(sellData);
        
        if (sellRecordError) {
          throw sellRecordError;
        }
        
        // 전량 매도: 투자 삭제
        const remaining = currentAmount - sell_amount;
        if (remaining <= 0.01) {
          const { error: deleteError } = await supabase
            .from('dollar_investments')
            .delete()
            .eq('id', investmentId);
          
          if (deleteError) {
            throw deleteError;
          }
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
              success: true, 
              message: `${sell_amount.toFixed(2)}USD 전량 매도 완료`,
              remaining: 0 
            }),
          };
        }
        
        // 분할 매도: 투자 금액 업데이트
        const newPurchaseKrw = remaining * investment.exchange_rate;
        const { error: updateError } = await supabase
          .from('dollar_investments')
          .update({
            usd_amount: remaining,
            purchase_krw: newPurchaseKrw,
          })
          .eq('id', investmentId);
        
        if (updateError) {
          throw updateError;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: true, 
            message: `${sell_amount.toFixed(2)}USD 매도 완료`,
            remaining: remaining 
          }),
        };
      }
    }
    
    // 엔화 투자 API (달러와 동일한 로직)
    if (path.startsWith('/jpy')) {
      const jpyPath = path.replace('/jpy', '');
      
      // GET /api/investments/jpy - 목록 조회
      if (jpyPath === '' || jpyPath === '/') {
        if (event.httpMethod === 'GET') {
          const { data, error } = await supabase
            .from('jpy_investments')
            .select('*')
            .order('purchase_date', { ascending: false });
          
          if (error) {
            throw error;
          }
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(data || []),
          };
        }
        
        // POST /api/investments/jpy - 투자 등록
        if (event.httpMethod === 'POST') {
          const cleanedData = cleanData(body);
          
          // 필수 필드 확인
          const requiredFields = ['investment_number', 'purchase_date', 'exchange_rate', 'purchase_krw', 'exchange_name'];
          const missing = requiredFields.filter(field => !(field in cleanedData));
          
          if (missing.length > 0) {
            return {
              statusCode: 400,
              headers: corsHeaders,
              body: JSON.stringify({ error: `필수 필드가 누락되었습니다: ${missing.join(', ')}` }),
            };
          }
          
          const { data, error } = await supabase
            .from('jpy_investments')
            .insert(cleanedData)
            .select();
          
          if (error) {
            throw error;
          }
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true, message: '투자가 등록되었습니다' }),
          };
        }
      }
      
      // DELETE /api/investments/jpy/{id} - 투자 삭제
      if (jpyPath.startsWith('/') && jpyPath.length > 1 && event.httpMethod === 'DELETE') {
        const investmentId = jpyPath.substring(1);
        
        const { error } = await supabase
          .from('jpy_investments')
          .delete()
          .eq('id', investmentId);
        
        if (error) {
          throw error;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true }),
        };
      }
      
      // POST /api/investments/jpy/{id}/sell - 투자 매도
      if (jpyPath.includes('/sell') && event.httpMethod === 'POST') {
        const parts = jpyPath.split('/');
        const investmentId = parts[1];
        const { sell_rate, sell_amount } = body;
        
        if (!sell_rate || !sell_amount) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'sell_rate와 sell_amount가 필요합니다' }),
          };
        }
        
        // 투자 정보 조회
        const { data: investment, error: fetchError } = await supabase
          .from('jpy_investments')
          .select('*')
          .eq('id', investmentId)
          .single();
        
        if (fetchError || !investment) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: '투자 정보를 찾을 수 없습니다' }),
          };
        }
        
        const currentAmount = investment.jpy_amount || 0;
        
        // 매도 금액 검증
        if (sell_amount > currentAmount) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: `보유 금액(${currentAmount.toFixed(2)}JPY)보다 많이 매도할 수 없습니다`,
              remaining: currentAmount 
            }),
          };
        }
        
        // 매도 기록 저장
        const sellData = {
          investment_id: investmentId,
          investment_number: investment.investment_number,
          sell_date: new Date().toISOString(),
          purchase_rate: investment.exchange_rate,
          sell_rate: sell_rate,
          sell_amount: sell_amount,
          sell_krw: sell_amount * sell_rate,
          profit_krw: (sell_rate - investment.exchange_rate) * sell_amount,
          exchange_name: investment.exchange_name,
        };
        
        const { error: sellRecordError } = await supabase
          .from('jpy_sell_records')
          .insert(sellData);
        
        if (sellRecordError) {
          throw sellRecordError;
        }
        
        // 전량 매도: 투자 삭제
        const remaining = currentAmount - sell_amount;
        if (remaining <= 0.01) {
          const { error: deleteError } = await supabase
            .from('jpy_investments')
            .delete()
            .eq('id', investmentId);
          
          if (deleteError) {
            throw deleteError;
          }
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
              success: true, 
              message: `${sell_amount.toFixed(2)}JPY 전량 매도 완료`,
              remaining: 0 
            }),
          };
        }
        
        // 분할 매도: 투자 금액 업데이트
        const newPurchaseKrw = remaining * investment.exchange_rate;
        const { error: updateError } = await supabase
          .from('jpy_investments')
          .update({
            jpy_amount: remaining,
            purchase_krw: newPurchaseKrw,
          })
          .eq('id', investmentId);
        
        if (updateError) {
          throw updateError;
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ 
            success: true, 
            message: `${sell_amount.toFixed(2)}JPY 매도 완료`,
            remaining: remaining 
          }),
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

