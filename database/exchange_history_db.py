"""
환율 히스토리 데이터베이스 관리
"""
import pandas as pd
import numpy as np
import math
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict
from database.supabase_client import get_supabase_client


class ExchangeHistoryDB:
    """환율 히스토리 데이터베이스 관리 클래스"""
    
    def __init__(self):
        try:
            self.supabase = get_supabase_client()
        except Exception as e:
            print(f"Warning: ExchangeHistoryDB 초기화 중 오류: {e}")
            self.supabase = None
    
    def get_latest_date(self, currency_pair: str) -> Optional[datetime]:
        """특정 통화쌍의 가장 최근 날짜를 조회합니다."""
        if not self.supabase:
            return None
        
        try:
            response = self.supabase.table('exchange_rate_history') \
                .select('date') \
                .eq('currency_pair', currency_pair) \
                .order('date', desc=True) \
                .limit(1) \
                .execute()
            
            if response.data and len(response.data) > 0:
                date_str = response.data[0].get('date')
                if date_str is None:
                    return None
                
                # 문자열을 직접 파싱
                if isinstance(date_str, str):
                    try:
                        # YYYY-MM-DD 형식으로 파싱
                        return datetime.strptime(date_str, '%Y-%m-%d')
                    except:
                        try:
                            # pandas로 변환 후 datetime으로 변환
                            date_val = pd.to_datetime(date_str)
                            if isinstance(date_val, pd.Timestamp):
                                return date_val.to_pydatetime()
                            return date_val
                        except:
                            return None
                else:
                    # 이미 다른 타입인 경우
                    try:
                        date_val = pd.to_datetime(date_str)
                        if isinstance(date_val, pd.Timestamp):
                            return date_val.to_pydatetime()
                        if isinstance(date_val, datetime):
                            return date_val
                        return None
                    except:
                        return None
            return None
        except Exception as e:
            print(f"최근 날짜 조회 실패 ({currency_pair}): {e}")
            return None
    
    def get_all_latest_dates(self, currency_pairs: list) -> Dict[str, Optional[datetime]]:
        """모든 통화쌍의 가장 최근 날짜를 한번에 조회합니다."""
        if not self.supabase:
            return {pair: None for pair in currency_pairs}
        
        try:
            # 빈 리스트인 경우 처리
            if not currency_pairs:
                return {}
            
            response = self.supabase.table('exchange_rate_history') \
                .select('currency_pair, date') \
                .in_('currency_pair', currency_pairs) \
                .order('date', desc=True) \
                .execute()
            
            # 각 통화쌍별로 가장 최근 날짜 추출
            latest_dates = {}
            
            # 응답 데이터가 없는 경우 처리
            if not response.data:
                return {pair: None for pair in currency_pairs}
            
            # 통화쌍별로 그룹화
            pair_date_map = {}
            for item in response.data:
                pair = item.get('currency_pair')
                if pair and pair in currency_pairs:
                    if pair not in pair_date_map:
                        pair_date_map[pair] = []
                    try:
                        date_str = item.get('date')
                        if date_str is None:
                            continue
                        
                        # 문자열을 datetime으로 변환
                        if isinstance(date_str, str):
                            # YYYY-MM-DD 형식으로 파싱
                            try:
                                date_val = datetime.strptime(date_str, '%Y-%m-%d')
                            except:
                                # 다른 형식 시도
                                date_val = pd.to_datetime(date_str)
                                if isinstance(date_val, pd.Timestamp):
                                    date_val = date_val.to_pydatetime()
                        else:
                            # 이미 datetime 객체이거나 다른 타입
                            date_val = pd.to_datetime(date_str)
                            if isinstance(date_val, pd.Timestamp):
                                date_val = date_val.to_pydatetime()
                        
                        # 최종적으로 datetime.datetime 객체인지 확인
                        if isinstance(date_val, datetime):
                            pair_date_map[pair].append(date_val)
                    except Exception as e:
                        print(f"날짜 변환 실패 ({pair}, date: {item.get('date')}): {e}")
                        continue
            
            # 각 통화쌍의 최근 날짜 설정
            for pair in currency_pairs:
                if pair in pair_date_map and pair_date_map[pair]:
                    latest_date = max(pair_date_map[pair])
                    # 최종적으로 datetime.datetime 객체인지 확인 및 변환
                    if isinstance(latest_date, pd.Timestamp):
                        latest_date = latest_date.to_pydatetime()
                    elif not isinstance(latest_date, datetime):
                        # datetime 객체가 아니면 변환 시도
                        try:
                            latest_date = pd.to_datetime(latest_date).to_pydatetime()
                        except:
                            print(f"Warning: {pair}의 날짜를 datetime으로 변환할 수 없습니다: {latest_date}")
                            latest_dates[pair] = None
                            continue
                    latest_dates[pair] = latest_date
                else:
                    latest_dates[pair] = None
            
            return latest_dates
        except Exception as e:
            print(f"최근 날짜 일괄 조회 실패: {e}")
            import traceback
            traceback.print_exc()
            return {pair: None for pair in currency_pairs}
    
    def save_history_data(self, df_close: pd.DataFrame, df_high: pd.DataFrame, 
                          df_low: pd.DataFrame, df_open: Optional[pd.DataFrame] = None) -> bool:
        """OHLC 데이터를 데이터베이스에 저장합니다."""
        if not self.supabase:
            return False
        
        try:
            # Open 데이터가 없으면 Close로 대체
            if df_open is None:
                df_open = df_close.copy()
            
            records = []
            for date_idx in df_close.index:
                # 인덱스가 이미 datetime이거나 Timestamp인 경우 처리
                if isinstance(date_idx, pd.Timestamp):
                    date_str = date_idx.strftime('%Y-%m-%d')
                elif isinstance(date_idx, datetime):
                    date_str = date_idx.strftime('%Y-%m-%d')
                else:
                    # 문자열이거나 다른 타입인 경우
                    date_str = pd.to_datetime(date_idx).strftime('%Y-%m-%d')
                
                for currency_pair in df_close.columns:
                    try:
                        # NaN 값 체크 및 변환
                        def safe_float(value):
                            """NaN, None, inf 값을 None으로 변환"""
                            if pd.isna(value) or value is None:
                                return None
                            try:
                                val_float = float(value)
                                # inf, -inf 체크 (math.isinf 사용)
                                if math.isinf(val_float) or pd.isna(val_float):
                                    return None
                                # 0 값도 체크 (엔화 데이터의 경우)
                                if val_float == 0 and currency_pair in ['JPY_KRW', 'JXY']:
                                    return None
                                return val_float
                            except (TypeError, ValueError, OverflowError):
                                return None
                        
                        open_val = safe_float(df_open.loc[date_idx, currency_pair])
                        high_val = safe_float(df_high.loc[date_idx, currency_pair])
                        low_val = safe_float(df_low.loc[date_idx, currency_pair])
                        close_val = safe_float(df_close.loc[date_idx, currency_pair])
                        
                        # 모든 값이 None이면 스킵 (데이터 없음)
                        if all(v is None for v in [open_val, high_val, low_val, close_val]):
                            continue
                        
                        # 최소한 하나의 값은 있어야 함
                        record = {
                            'date': date_str,
                            'currency_pair': currency_pair,
                            'open': open_val if open_val is not None else 0.0,
                            'high': high_val if high_val is not None else 0.0,
                            'low': low_val if low_val is not None else 0.0,
                            'close': close_val if close_val is not None else 0.0
                        }
                        records.append(record)
                    except Exception as e:
                        print(f"Warning: {currency_pair} at {date_str} 처리 실패: {e}")
                        continue
            
            # 배치 업서트 (중복 시 업데이트)
            if records:
                try:
                    # 배치 크기 제한 (Supabase 제한 고려)
                    batch_size = 1000
                    for i in range(0, len(records), batch_size):
                        batch = records[i:i + batch_size]
                        # onConflict 파라미터로 UNIQUE 제약조건 컬럼 지정
                        self.supabase.table('exchange_rate_history').upsert(
                            batch, 
                            on_conflict='date,currency_pair'
                        ).execute()
                    return True
                except Exception as e:
                    import traceback
                    print(f"배치 저장 실패: {e}")
                    print(f"레코드 수: {len(records)}")
                    print(f"Traceback: {traceback.format_exc()}")
                    # 첫 번째 레코드만 확인
                    if records:
                        print(f"첫 번째 레코드 예시: {records[0]}")
                    return False
            
            return False
        except Exception as e:
            import traceback
            print(f"데이터 저장 실패: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            return False
    
    def load_history_data(self, currency_pairs: list, start_date: datetime, 
                          end_date: datetime) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """데이터베이스에서 OHLC 데이터를 조회합니다."""
        if not self.supabase:
            return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
        
        try:
            start_str = start_date.strftime('%Y-%m-%d')
            end_str = end_date.strftime('%Y-%m-%d')
            
            response = self.supabase.table('exchange_rate_history') \
                .select('*') \
                .in_('currency_pair', currency_pairs) \
                .gte('date', start_str) \
                .lte('date', end_str) \
                .order('date') \
                .execute()
            
            if not response.data:
                return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
            
            # 데이터프레임 생성
            df = pd.DataFrame(response.data)
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
            
            # OHLC 별로 pivot
            df_close = df.pivot_table(values='close', index='date', columns='currency_pair')
            df_high = df.pivot_table(values='high', index='date', columns='currency_pair')
            df_low = df.pivot_table(values='low', index='date', columns='currency_pair')
            
            # 인덱스가 DatetimeIndex인지 확인하고 변환
            if not isinstance(df_close.index, pd.DatetimeIndex):
                try:
                    df_close.index = pd.to_datetime(df_close.index)
                    df_high.index = pd.to_datetime(df_high.index)
                    df_low.index = pd.to_datetime(df_low.index)
                except Exception as e:
                    print(f"Warning: DB 데이터 인덱스 변환 실패: {e}")
            
            return df_close, df_high, df_low
        except Exception as e:
            print(f"데이터 조회 실패: {e}")
            return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
    
    def get_data_coverage(self, currency_pairs: list, 
                          required_months: int) -> Dict[str, bool]:
        """각 통화쌍의 데이터 커버리지를 확인합니다."""
        if not self.supabase:
            return {pair: False for pair in currency_pairs}
        
        required_date = datetime.now() - timedelta(days=required_months * 30)
        latest_dates = self.get_all_latest_dates(currency_pairs)
        
        coverage = {}
        for pair in currency_pairs:
            latest = latest_dates.get(pair)
            if latest is None:
                coverage[pair] = False
            else:
                # 최근 데이터가 오늘이거나 어제인 경우 충분한 커버리지로 판단
                days_ago = (datetime.now() - latest).days
                coverage[pair] = days_ago <= 1
        
        return coverage


# 전역 인스턴스
exchange_history_db = ExchangeHistoryDB()

