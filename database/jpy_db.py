"""
엔화 투자 관련 데이터베이스 작업
"""
from typing import Dict, List
from .supabase_client import get_supabase_client


def save_jpy_investment(investment_data: Dict) -> bool:
    """엔화 투자 데이터를 DB에 저장"""
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        # 데이터 정리: None 값, NaN 값, 잘못된 타입 처리
        cleaned_data = {}
        for key, value in investment_data.items():
            if value is None:
                # memo는 None일 수 있음 (선택적 필드)
                if key == 'memo':
                    cleaned_data[key] = None  # None 유지 (데이터베이스에서 NULL 허용)
                # 다른 None 값은 제외
                continue
            elif isinstance(value, float):
                # NaN 체크
                import math
                if math.isnan(value) or math.isinf(value):
                    continue
                cleaned_data[key] = value
            elif isinstance(value, (int, str, bool)):
                cleaned_data[key] = value
            elif hasattr(value, 'isoformat'):  # datetime 객체
                cleaned_data[key] = value.isoformat()
            else:
                # 다른 타입은 문자열로 변환
                try:
                    cleaned_data[key] = str(value)
                except:
                    continue
        
        # 필수 필드 확인
        required_fields = ['investment_number', 'purchase_date', 'exchange_rate', 'purchase_krw', 'exchange_name']
        if not all(key in cleaned_data for key in required_fields):
            missing = [key for key in required_fields if key not in cleaned_data]
            print(f"Error: 필수 필드가 누락되었습니다: {missing}")
            return False
        
        supabase.table('jpy_investments').insert(cleaned_data).execute()
        return True
    except Exception as e:
        import traceback
        print(f"데이터 저장 실패: {e}")
        print(f"데이터: {investment_data}")
        print(f"Traceback: {traceback.format_exc()}")
        return False


def load_jpy_investments() -> List[Dict]:
    """모든 엔화 투자 데이터를 DB에서 로드"""
    supabase = get_supabase_client()
    if not supabase:
        return []
    
    try:
        response = supabase.table('jpy_investments').select('*').order('purchase_date', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"데이터 로드 실패: {e}")
        return []


def delete_jpy_investment(investment_id: str) -> bool:
    """특정 엔화 투자 데이터를 DB에서 삭제"""
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        supabase.table('jpy_investments').delete().eq('id', investment_id).execute()
        return True
    except Exception as e:
        print(f"데이터 삭제 실패: {e}")
        return False


def save_jpy_sell_record(sell_data: Dict) -> bool:
    """엔화 매도 기록을 DB에 저장"""
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        # 데이터 정리: None 값, NaN 값, 잘못된 타입 처리
        cleaned_data = {}
        for key, value in sell_data.items():
            if value is None:
                # None 값은 제외 (선택적 필드인 경우)
                if key not in ['memo', 'exchange_name']:  # 선택적 필드는 제외 가능
                    continue
            elif isinstance(value, float):
                # NaN 체크
                import math
                if math.isnan(value) or math.isinf(value):
                    continue
                cleaned_data[key] = value
            elif isinstance(value, (int, str, bool)):
                cleaned_data[key] = value
            elif hasattr(value, 'isoformat'):  # datetime 객체
                cleaned_data[key] = value.isoformat()
            else:
                # 다른 타입은 문자열로 변환
                try:
                    cleaned_data[key] = str(value)
                except:
                    continue
        
        # 필수 필드 확인
        if not cleaned_data:
            print("Error: 저장할 데이터가 없습니다.")
            return False
        
        supabase.table('jpy_sell_records').insert(cleaned_data).execute()
        return True
    except Exception as e:
        import traceback
        print(f"매도 기록 저장 실패: {e}")
        print(f"데이터: {sell_data}")
        print(f"Traceback: {traceback.format_exc()}")
        return False


def load_jpy_sell_records() -> List[Dict]:
    """모든 엔화 매도 기록을 DB에서 로드"""
    supabase = get_supabase_client()
    if not supabase:
        return []
    
    try:
        response = supabase.table('jpy_sell_records').select('*').order('sell_date', desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"매도 기록 로드 실패: {e}")
        return []


def delete_jpy_sell_record(record_id: str) -> bool:
    """특정 엔화 매도 기록을 DB에서 삭제"""
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        supabase.table('jpy_sell_records').delete().eq('id', record_id).execute()
        return True
    except Exception as e:
        print(f"매도 기록 삭제 실패: {e}")
        return False


def sell_jpy_investment(investment_id: str, sell_rate: float, sell_amount: float) -> Dict:
    """
    엔화 투자를 매도 처리
    
    Args:
        investment_id: 투자 ID
        sell_rate: 매도 환율
        sell_amount: 매도 금액 (JPY)
        
    Returns:
        Dict: {'success': bool, 'message': str, 'remaining': float}
    """
    supabase = get_supabase_client()
    if not supabase:
        return {'success': False, 'message': 'DB 연결 실패', 'remaining': 0}
    
    try:
        # 투자 정보 조회
        response = supabase.table('jpy_investments').select('*').eq('id', investment_id).execute()
        if not response.data:
            return {'success': False, 'message': '투자 정보를 찾을 수 없습니다', 'remaining': 0}
        
        investment = response.data[0]
        current_amount = investment['jpy_amount']
        
        # 매도 금액 검증
        if sell_amount > current_amount:
            return {'success': False, 'message': f'보유 금액({current_amount:.2f}JPY)보다 많이 매도할 수 없습니다', 'remaining': current_amount}
        
        # 매도 기록 저장
        import datetime
        sell_data = {
            'investment_id': investment_id,
            'investment_number': investment['investment_number'],
            'sell_date': datetime.datetime.now().isoformat(),
            'purchase_rate': investment['exchange_rate'],
            'sell_rate': sell_rate,
            'sell_amount': sell_amount,
            'sell_krw': sell_amount * sell_rate,
            'profit_krw': (sell_rate - investment['exchange_rate']) * sell_amount,
            'exchange_name': investment['exchange_name']
        }
        
        save_success = save_jpy_sell_record(sell_data)
        if not save_success:
            return {'success': False, 'message': '매도 기록 저장 실패', 'remaining': current_amount}
        
        # 전량 매도: 투자 삭제
        remaining = current_amount - sell_amount
        if remaining <= 1:  # 거의 0에 가까우면 전량 매도로 처리
            supabase.table('jpy_investments').delete().eq('id', investment_id).execute()
            return {'success': True, 'message': f'{sell_amount:.2f}JPY 전량 매도 완료', 'remaining': 0}
        
        # 분할 매도: 투자 금액 업데이트
        new_purchase_krw = (current_amount - sell_amount) * investment['exchange_rate']
        supabase.table('jpy_investments').update({
            'jpy_amount': remaining,
            'purchase_krw': new_purchase_krw
        }).eq('id', investment_id).execute()
        
        return {'success': True, 'message': f'{sell_amount:.2f}JPY 매도 완료', 'remaining': remaining}
        
    except Exception as e:
        print(f"매도 처리 실패: {e}")
        return {'success': False, 'message': f'매도 처리 중 오류: {str(e)}', 'remaining': 0}

