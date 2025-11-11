import { supabase } from '@/lib/supabase/server';
import { JpyInvestment, JpySellRecord } from '@/types';

/**
 * 엔화 투자 목록을 가져옵니다.
 */
export async function loadJpyInvestments(): Promise<JpyInvestment[]> {
  try {
    const { data, error } = await supabase
      .from('jpy_investments')
      .select('*')
      .order('purchase_date', { ascending: false });

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
    // investment_number 자동 생성: 최대값 + 1 (race condition 방지)
    const { data: maxDataList, error: maxError } = await supabase
      .from('jpy_investments')
      .select('investment_number')
      .order('investment_number', { ascending: false })
      .limit(1);

    // 최대값이 없으면 1로 시작, 있으면 +1
    const maxInvestmentNumber = maxDataList && maxDataList.length > 0
      ? maxDataList[0]?.investment_number || 0
      : 0;
    const investmentNumber = maxInvestmentNumber + 1;

    // investment_number와 exchange_name을 포함하여 저장
    const investmentData = {
      ...investment,
      investment_number: investmentNumber,
      exchange_name: (investment as any).exchange_name || '미지정', // 기본값 설정
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
    };
  } catch (error) {
    console.error('엔화 투자 저장 실패:', error);
    return null;
  }
}

/**
 * 엔화 투자를 삭제합니다.
 */
export async function deleteJpyInvestment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jpy_investments')
      .delete()
      .eq('id', id);

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
 */
export async function loadJpySellRecords(): Promise<JpySellRecord[]> {
  try {
    const { data, error } = await supabase
      .from('jpy_sell_records')
      .select('*')
      .order('sell_date', { ascending: false });

    if (error) {
      console.error('엔화 매도 기록 조회 실패:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      investment_id: item.investment_id || '',
      sell_date: item.sell_date || '',
      jpy_amount: item.jpy_amount != null ? Number(item.jpy_amount) : 0,
      sell_krw: item.sell_krw != null ? Number(item.sell_krw) : 0,
      exchange_rate: item.exchange_rate != null ? Number(item.exchange_rate) : 0,
      profit_loss: item.profit_loss != null ? Number(item.profit_loss) : 0,
      profit_rate: item.profit_rate != null ? Number(item.profit_rate) : 0,
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
    const { data, error } = await supabase
      .from('jpy_sell_records')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('엔화 매도 기록 저장 실패:', error);
      return null;
    }

    return {
      id: data.id,
      investment_id: data.investment_id,
      sell_date: data.sell_date,
      jpy_amount: data.jpy_amount,
      sell_krw: data.sell_krw,
      exchange_rate: data.exchange_rate,
      profit_loss: data.profit_loss,
      profit_rate: data.profit_rate,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('엔화 매도 기록 저장 실패:', error);
    return null;
  }
}

/**
 * 엔화 매도 기록을 삭제합니다.
 */
export async function deleteJpySellRecord(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jpy_sell_records')
      .delete()
      .eq('id', id);

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

