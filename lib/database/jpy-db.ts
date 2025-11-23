import { supabase } from '@/lib/supabase/server';
import { JpyInvestment, JpySellRecord } from '@/types';

/**
 * 엔화 투자 목록을 가져옵니다.
 * @param userId 사용자 ID (선택적 - 없으면 모든 데이터, 있으면 해당 사용자 데이터만)
 */
export async function loadJpyInvestments(userId?: string): Promise<JpyInvestment[]> {
  try {
    let query = supabase
      .from('jpy_investments')
      .select('*')
      .order('purchase_date', { ascending: false });

    // user_id가 있으면 필터링 (사용자별 데이터만 조회)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('엔화 투자 목록 조회 실패:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      purchase_date: item.purchase_date,
      jpy_amount: item.jpy_amount,
      purchase_krw: item.purchase_krw,
      exchange_rate: item.exchange_rate,
      created_at: item.created_at,
      exchange_name: item.exchange_name,
      investment_number: item.investment_number,
    }));
  } catch (error) {
    console.error('엔화 투자 목록 조회 실패:', error);
    return [];
  }
}

/**
 * 엔화 투자를 저장합니다.
 */
export async function saveJpyInvestment(
  investment: Omit<JpyInvestment, 'id' | 'created_at'>
): Promise<JpyInvestment | null> {
  try {
    const userId = (investment as any).user_id;
    const providedNumber = (investment as any).investment_number;
    
    let investmentNumber: number;
    
    // 사용자가 번호를 제공한 경우 사용, 없으면 자동 생성
    if (providedNumber && providedNumber > 0) {
      investmentNumber = providedNumber;
    } else {
      // investment_number 자동 생성: 사용자별 최대값 + 1 (race condition 방지)
      let query = supabase
        .from('jpy_investments')
        .select('investment_number')
        .order('investment_number', { ascending: false })
        .limit(1);
      
      // user_id가 있으면 사용자별로 필터링 (사용자별 investment_number 생성)
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data: maxDataList, error: maxError } = await query;

      // 최대값이 없으면 1로 시작, 있으면 +1
      const maxInvestmentNumber = maxDataList && maxDataList.length > 0
        ? maxDataList[0]?.investment_number || 0
        : 0;
      investmentNumber = maxInvestmentNumber + 1;
    }

    // investment_number와 exchange_name, user_id를 포함하여 저장
    const investmentData = {
      ...investment,
      investment_number: investmentNumber,
      exchange_name: (investment as any).exchange_name || '미지정', // 기본값 설정
      user_id: (investment as any).user_id || null, // user_id 추가 (마이그레이션 후 필수)
    };

    const { data, error } = await supabase
      .from('jpy_investments')
      .insert([investmentData])
      .select()
      .single();

    if (error) {
      console.error('엔화 투자 저장 실패:', error);
      console.error('에러 상세:', JSON.stringify(error, null, 2));
      return null;
    }

    return {
      id: data.id,
      purchase_date: data.purchase_date,
      jpy_amount: data.jpy_amount,
      purchase_krw: data.purchase_krw,
      exchange_rate: data.exchange_rate,
      created_at: data.created_at,
      exchange_name: data.exchange_name,
    };
  } catch (error) {
    console.error('엔화 투자 저장 실패:', error);
    return null;
  }
}

/**
 * 엔화 투자를 삭제합니다.
 * @param id 투자 ID
 * @param userId 사용자 ID (선택적 - 본인 데이터만 삭제 가능하도록)
 */
export async function deleteJpyInvestment(id: string, userId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('jpy_investments')
      .delete()
      .eq('id', id);

    // user_id가 있으면 필터링 (본인 데이터만 삭제 가능)
    // TODO: 데이터베이스 마이그레이션 후 활성화
    // if (userId) {
    //   query = query.eq('user_id', userId);
    // }

    const { error } = await query;

    if (error) {
      console.error('엔화 투자 삭제 실패:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('엔화 투자 삭제 실패:', error);
    return false;
  }
}

/**
 * 엔화 매도 기록 목록을 가져옵니다.
 * @param userId 사용자 ID (선택적 - 없으면 모든 데이터, 있으면 해당 사용자 데이터만)
 */
export async function loadJpySellRecords(userId?: string): Promise<JpySellRecord[]> {
  try {
    let query = supabase
      .from('jpy_sell_records')
      .select('*')
      .order('sell_date', { ascending: false });

    // user_id가 있으면 필터링 (사용자별 데이터만 조회)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('엔화 매도 기록 조회 실패:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      investment_id: item.investment_id || '',
      sell_date: item.sell_date || '',
      jpy_amount: item.sell_amount != null ? Number(item.sell_amount) : 0, // sell_amount를 jpy_amount로 매핑
      sell_krw: item.sell_krw != null ? Number(item.sell_krw) : 0,
      exchange_rate: item.sell_rate != null ? Number(item.sell_rate) : 0, // sell_rate를 exchange_rate로 매핑
      profit_loss: item.profit_krw != null ? Number(item.profit_krw) : 0, // profit_krw를 profit_loss로 매핑
      profit_rate: 0, // profit_rate는 스키마에 없으므로 0으로 설정
      sell_number: undefined, // sell_number는 스키마에 없으므로 undefined
      created_at: item.created_at || '',
    }));
  } catch (error) {
    console.error('엔화 매도 기록 조회 실패:', error);
    return [];
  }
}

/**
 * 엔화 매도 기록을 저장합니다.
 */
export async function saveJpySellRecord(
  record: Omit<JpySellRecord, 'id' | 'created_at'>
): Promise<JpySellRecord | null> {
  try {
    const userId = (record as any).user_id;
    const providedSellNumber = (record as any).sell_number;
    
    // 투자 정보에서 매수 환율과 investment_number 가져오기
    let purchaseRate = 0;
    let investmentNumber = 0;
    if (record.investment_id) {
      const { data: investment } = await supabase
        .from('jpy_investments')
        .select('exchange_rate, investment_number')
        .eq('id', record.investment_id)
        .single();
      
      if (investment) {
        purchaseRate = Number(investment.exchange_rate) || 0;
        investmentNumber = Number(investment.investment_number) || 0;
      }
    }

    // 매도 번호는 스키마에 없으므로 저장하지 않음 (필요시 나중에 추가 가능)

    // user_id 추가 및 필드명 매핑 (코드 필드명 → DB 필드명)
    const recordData: any = {
      investment_id: record.investment_id,
      investment_number: investmentNumber,
      sell_date: record.sell_date,
      sell_amount: (record as any).jpy_amount || 0, // jpy_amount를 sell_amount로 매핑
      sell_krw: record.sell_krw,
      purchase_rate: purchaseRate, // 매수 환율
      sell_rate: record.exchange_rate, // 매도 환율 (exchange_rate를 sell_rate로 매핑)
      profit_krw: record.profit_loss, // profit_loss를 profit_krw로 매핑
      exchange_name: (record as any).exchange_name || null,
      user_id: (record as any).user_id || null,
    };

    const { data, error } = await supabase
      .from('jpy_sell_records')
      .insert([recordData])
      .select()
      .single();

    if (error) {
      console.error('엔화 매도 기록 저장 실패:', error);
      console.error('에러 상세:', JSON.stringify(error, null, 2));
      return null;
    }

    // 반환 시 DB 필드명을 코드 필드명으로 매핑
    return {
      id: data.id,
      investment_id: data.investment_id || '',
      sell_date: data.sell_date,
      jpy_amount: data.sell_amount != null ? Number(data.sell_amount) : 0, // sell_amount를 jpy_amount로 매핑
      sell_krw: data.sell_krw != null ? Number(data.sell_krw) : 0,
      exchange_rate: data.sell_rate != null ? Number(data.sell_rate) : 0, // sell_rate를 exchange_rate로 매핑
      profit_loss: data.profit_krw != null ? Number(data.profit_krw) : 0, // profit_krw를 profit_loss로 매핑
      profit_rate: 0, // profit_rate는 계산된 값이므로 0으로 설정 (스키마에 없음)
      sell_number: (record as any).sell_number || undefined, // sell_number는 스키마에 없으므로 원본 데이터에서 가져옴
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('엔화 매도 기록 저장 실패:', error);
    return null;
  }
}

/**
 * 엔화 매도 기록을 삭제합니다.
 * @param id 기록 ID
 * @param userId 사용자 ID (선택적 - 본인 데이터만 삭제 가능하도록)
 */
export async function deleteJpySellRecord(id: string, userId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('jpy_sell_records')
      .delete()
      .eq('id', id);

    // user_id가 있으면 필터링 (본인 데이터만 삭제 가능)
    // TODO: 데이터베이스 마이그레이션 후 활성화
    // if (userId) {
    //   query = query.eq('user_id', userId);
    // }

    const { error } = await query;

    if (error) {
      console.error('엔화 매도 기록 삭제 실패:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('엔화 매도 기록 삭제 실패:', error);
    return false;
  }
}

