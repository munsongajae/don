"""
캐시된 환율 데이터 수집 서비스 (데이터베이스 활용)
"""
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from typing import Tuple, Dict
from database.exchange_history_db import exchange_history_db
from services.index_calculator import fetch_period_data_and_current_rates

# pandas.Timestamp를 datetime으로 변환하는 헬퍼 함수
def _to_datetime(date_val):
    """pandas.Timestamp나 문자열을 datetime.datetime으로 변환"""
    if date_val is None:
        return None
    
    # 이미 datetime 객체면 그대로 반환
    if isinstance(date_val, datetime):
        return date_val
    
    # pandas.Timestamp인 경우
    if isinstance(date_val, pd.Timestamp):
        try:
            return date_val.to_pydatetime()
        except:
            return None
    
    # 문자열인 경우
    if isinstance(date_val, str):
        try:
            # YYYY-MM-DD 형식 먼저 시도
            return datetime.strptime(date_val, '%Y-%m-%d')
        except:
            try:
                # dateutil parser 시도
                from dateutil.parser import parse
                return parse(date_val)
            except:
                try:
                    # pandas로 변환 시도
                    ts = pd.to_datetime(date_val)
                    if isinstance(ts, pd.Timestamp):
                        return ts.to_pydatetime()
                    return ts
                except:
                    return None
    
    # 다른 타입인 경우 pandas로 변환 시도
    try:
        ts = pd.to_datetime(date_val)
        if isinstance(ts, pd.Timestamp):
            return ts.to_pydatetime()
        return ts
    except:
        return None

# 간단한 메모리 캐시
_cache_period_data = {}
CACHE_TTL = 3600  # 1시간

def _is_cache_valid(cache_entry):
    if cache_entry is None:
        return False
    if 'time' not in cache_entry:
        return False
    return (datetime.now() - cache_entry['time']).total_seconds() < CACHE_TTL

def fetch_period_data_with_cache(period_months=12) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, float]]:
    """
    데이터베이스 캐시를 활용하여 환율 데이터를 가져옵니다.
    DB에 있는 데이터는 재사용하고, 없는 부분만 yfinance에서 가져옵니다.
    네트워크 오류 시 기존 방식으로 폴백합니다.
    
    메모리 캐시(TTL 1시간)로 반복 호출을 방지합니다.
    
    Args:
        period_months: 분석 기간 (개월 단위, 기본값 12개월)
        
    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, float]]: 
            (Close 데이터, High 데이터, Low 데이터, 현재 환율 딕셔너리)
    """
    # 캐시 확인
    cache_key = period_months
    if cache_key in _cache_period_data and _is_cache_valid(_cache_period_data[cache_key]):
        return _cache_period_data[cache_key]['data']
    
    try:
        result = _fetch_with_db_cache(period_months)
        # 캐시에 저장
        _cache_period_data[cache_key] = {
            'data': result,
            'time': datetime.now()
        }
        return result
    except Exception as e:
        print(f"DB 캐시 실패, 기본 방식으로 폴백: {e}")
        result = fetch_period_data_and_current_rates(period_months)
        # 캐시에 저장
        _cache_period_data[cache_key] = {
            'data': result,
            'time': datetime.now()
        }
        return result


def _fetch_with_db_cache(period_months=12) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, float]]:
    # 통화쌍 정의
    dxy_tickers = {
        'EUR_USD': 'EURUSD=X', 
        'USD_JPY': 'JPY=X', 
        'GBP_USD': 'GBPUSD=X',
        'USD_CAD': 'CAD=X', 
        'USD_SEK': 'SEK=X', 
        'USD_CHF': 'CHF=X'
    }
    usd_krw_ticker = 'USDKRW=X'
    all_currency_pairs = list(dxy_tickers.keys()) + ['USD_KRW']
    
    # 필요한 날짜 범위 계산
    end_date = datetime.now()
    start_date = end_date - timedelta(days=period_months * 30 + 7)  # 여유있게
    
    # 1. 데이터베이스에서 기존 데이터 조회
    try:
        df_close_db, df_high_db, df_low_db = exchange_history_db.load_history_data(
            all_currency_pairs, start_date, end_date
        )
    except Exception as e:
        df_close_db = pd.DataFrame()
        df_high_db = pd.DataFrame()
        df_low_db = pd.DataFrame()
    
    # 2. 각 통화쌍별 최근 날짜 확인
    try:
        latest_dates = exchange_history_db.get_all_latest_dates(all_currency_pairs)
        # 모든 날짜를 datetime 객체로 변환하여 보장
        for pair in all_currency_pairs:
            if pair in latest_dates and latest_dates[pair] is not None:
                converted = _to_datetime(latest_dates[pair])
                if converted is None:
                    print(f"Warning: {pair}의 날짜를 변환할 수 없습니다: {latest_dates[pair]} (type: {type(latest_dates[pair])})")
                    latest_dates[pair] = None
                else:
                    latest_dates[pair] = converted
    except Exception as e:
        print(f"최근 날짜 조회 중 오류: {e}")
        import traceback
        traceback.print_exc()
        latest_dates = {pair: None for pair in all_currency_pairs}
    
    # 3. 업데이트가 필요한지 확인 (모든 통화쌍이 최신이면 스킵)
    needs_update = []
    all_up_to_date = True
    
    for pair, latest_date in latest_dates.items():
        if latest_date is None:
            needs_update.append(pair)
            all_up_to_date = False
        else:
            try:
                # latest_date가 이미 datetime 객체인지 확인
                if not isinstance(latest_date, datetime):
                    # datetime 객체가 아니면 변환 시도
                    latest_date_dt = _to_datetime(latest_date)
                    if latest_date_dt is None:
                        print(f"Warning: {pair}의 날짜 변환 실패: {latest_date} (type: {type(latest_date)})")
                        needs_update.append(pair)
                        all_up_to_date = False
                        continue
                    latest_date = latest_date_dt
                
                # datetime 객체인지 최종 확인
                if isinstance(latest_date, datetime):
                    # 날짜 차이 계산
                    now = datetime.now()
                    days_since_update = (now - latest_date).days
                    if days_since_update >= 1:  # 1일 이상 지난 경우만 업데이트
                        needs_update.append(pair)
                        all_up_to_date = False
                else:
                    # 여전히 datetime 객체가 아니면 업데이트 필요로 표시
                    print(f"Warning: {pair}의 날짜가 datetime 객체가 아닙니다: {latest_date} (type: {type(latest_date)})")
                    needs_update.append(pair)
                    all_up_to_date = False
            except Exception as e:
                print(f"날짜 비교 실패 ({pair}): {e}")
                print(f"  latest_date type: {type(latest_date)}, value: {latest_date}")
                import traceback
                traceback.print_exc()
                # 에러가 발생하면 업데이트 필요로 표시
                needs_update.append(pair)
                all_up_to_date = False
    
    # 4. DB에 충분한 데이터가 있고 최신이면 바로 사용
    if all_up_to_date and not df_close_db.empty:
        df_close = df_close_db
        df_high = df_high_db
        df_low = df_low_db
        # Toast 제거 - 캐시된 함수 내에서 UI 요소 사용 불가
    else:
        # 5. 업데이트가 필요하거나 DB가 비어있으면 yfinance에서 가져오기
        period_map = {1: '1mo', 3: '3mo', 6: '6mo', 12: '1y'}
        period_str = period_map.get(period_months, '1y')
        
        # yfinance에서 데이터 가져오기 (개별 티커로 시도)
        ticker_list = list(dxy_tickers.values()) + [usd_krw_ticker]
        
        print(f"yfinance에서 {period_months}개월치 데이터를 가져오는 중... (티커: {ticker_list})")
        
        # start_date와 end_date 사용 (더 안정적)
        end_date = datetime.now()
        if period_months == 1:
            start_date = end_date - timedelta(days=35)
        elif period_months == 3:
            start_date = end_date - timedelta(days=95)
        elif period_months == 6:
            start_date = end_date - timedelta(days=185)
        else:  # 12개월
            start_date = end_date - timedelta(days=370)
        
        try:
            # 기간을 사용하여 다운로드 시도
            df_all = yf.download(
                ticker_list, 
                start=start_date.strftime('%Y-%m-%d'),
                end=end_date.strftime('%Y-%m-%d'),
                interval='1d',
                progress=False,
                group_by='ticker'
            )
        except Exception as e:
            print(f"yfinance 다운로드 실패 (period 사용): {e}")
            # period를 사용하여 재시도
            try:
                df_all = yf.download(ticker_list, period=period_str, interval='1d', progress=False)
            except Exception as e2:
                print(f"yfinance 다운로드 실패 (period 재시도): {e2}")
                # 개별 티커로 다운로드 시도
                df_all = None
        
        # 데이터가 비어있거나 다운로드 실패한 경우 개별 티커로 시도
        if df_all is None or df_all.empty:
            print("일괄 다운로드 실패, 개별 티커로 다운로드 시도...")
            ticker_data = {}
            for ticker in ticker_list:
                try:
                    ticker_obj = yf.Ticker(ticker)
                    # period를 먼저 시도, 실패하면 start/end 사용
                    try:
                        hist = ticker_obj.history(period=period_str, interval='1d')
                    except:
                        try:
                            hist = ticker_obj.history(
                                start=start_date.strftime('%Y-%m-%d'),
                                end=end_date.strftime('%Y-%m-%d'),
                                interval='1d'
                            )
                        except Exception as e2:
                            print(f"  {ticker} 다운로드 실패: {e2}")
                            hist = pd.DataFrame()
                    
                    if not hist.empty and len(hist) > 0:
                        ticker_data[ticker] = hist
                        print(f"  ✓ {ticker}: {len(hist)} 행 다운로드 성공")
                    else:
                        print(f"  ✗ {ticker}: 데이터 없음")
                except Exception as e:
                    print(f"  ✗ {ticker} 다운로드 실패: {e}")
            
            if ticker_data:
                # 모든 티커의 인덱스(날짜)를 통합
                all_dates = set()
                for hist in ticker_data.values():
                    all_dates.update(hist.index)
                all_dates = sorted(all_dates)
                
                # MultiIndex DataFrame 생성 (Ticker, Price 구조)
                data_dict = {}
                for ticker, hist in ticker_data.items():
                    for price_type in ['Open', 'High', 'Low', 'Close']:
                        if price_type in hist.columns:
                            key = (ticker, price_type)
                            data_dict[key] = pd.Series(hist[price_type], index=hist.index)
                
                if data_dict:
                    # 모든 날짜에 대해 DataFrame 생성
                    df_all = pd.DataFrame(index=all_dates)
                    for (ticker, price_type), series in data_dict.items():
                        df_all[(ticker, price_type)] = series
                    
                    # MultiIndex 컬럼 설정
                    df_all.columns = pd.MultiIndex.from_tuples(df_all.columns, names=['Ticker', 'Price'])
                    print(f"개별 다운로드 완료: {len(df_all)} 행, {len(ticker_data)} 티커")
                else:
                    df_all = pd.DataFrame()
            else:
                print("모든 티커 다운로드 실패")
                df_all = pd.DataFrame()
        
        # 데이터가 여전히 비어있으면 빈 DataFrame 반환
        if df_all.empty:
            print("Warning: yfinance에서 데이터를 가져오지 못했습니다. 빈 DataFrame을 반환합니다.")
            df_close_new = pd.DataFrame()
            df_high_new = pd.DataFrame()
            df_low_new = pd.DataFrame()
            df_open_new = pd.DataFrame()
        else:
            # 컬럼 이름 변경
            column_mapping = {v: k for k, v in dxy_tickers.items()}
            
            # MultiIndex 처리
            if isinstance(df_all.columns, pd.MultiIndex):
                # Price 레벨이 있는 경우 (Ticker, Price 구조)
                if df_all.columns.nlevels == 2:
                    df_close_new = pd.DataFrame(index=df_all.index)
                    df_high_new = pd.DataFrame(index=df_all.index)
                    df_low_new = pd.DataFrame(index=df_all.index)
                    df_open_new = pd.DataFrame(index=df_all.index)
                    
                    for ticker in ticker_list:
                        if (ticker, 'Close') in df_all.columns:
                            df_close_new[ticker] = df_all[(ticker, 'Close')]
                        if (ticker, 'High') in df_all.columns:
                            df_high_new[ticker] = df_all[(ticker, 'High')]
                        if (ticker, 'Low') in df_all.columns:
                            df_low_new[ticker] = df_all[(ticker, 'Low')]
                        if (ticker, 'Open') in df_all.columns:
                            df_open_new[ticker] = df_all[(ticker, 'Open')]
                # Close, High, Low, Open이 첫 번째 레벨인 경우
                elif 'Close' in [col[0] if isinstance(col, tuple) else col for col in df_all.columns]:
                    df_close_new = df_all['Close'].copy()
                    df_high_new = df_all['High'].copy()
                    df_low_new = df_all['Low'].copy()
                    df_open_new = df_all['Open'].copy()
                else:
                    # 알 수 없는 구조
                    print(f"Warning: 알 수 없는 MultiIndex 구조: {df_all.columns}")
                    df_close_new = pd.DataFrame(index=df_all.index)
                    df_high_new = pd.DataFrame(index=df_all.index)
                    df_low_new = pd.DataFrame(index=df_all.index)
                    df_open_new = pd.DataFrame(index=df_all.index)
            else:
                # 단일 레벨 컬럼인 경우 (일반적인 경우)
                # Close, High, Low, Open이 컬럼 이름에 포함되어 있는지 확인
                if 'Close' in df_all.columns:
                    df_close_new = df_all['Close'].copy() if isinstance(df_all['Close'], pd.DataFrame) else pd.DataFrame({df_all['Close'].name: df_all['Close']})
                    df_high_new = df_all['High'].copy() if isinstance(df_all['High'], pd.DataFrame) else pd.DataFrame({df_all['High'].name: df_all['High']})
                    df_low_new = df_all['Low'].copy() if isinstance(df_all['Low'], pd.DataFrame) else pd.DataFrame({df_all['Low'].name: df_all['Low']})
                    df_open_new = df_all['Open'].copy() if isinstance(df_all['Open'], pd.DataFrame) else pd.DataFrame({df_all['Open'].name: df_all['Open']})
                else:
                    # 티커 이름이 컬럼인 경우
                    df_close_new = pd.DataFrame(index=df_all.index)
                    df_high_new = pd.DataFrame(index=df_all.index)
                    df_low_new = pd.DataFrame(index=df_all.index)
                    df_open_new = pd.DataFrame(index=df_all.index)
                    
                    for ticker in ticker_list:
                        if ticker in df_all.columns:
                            df_close_new[ticker] = df_all[ticker]
            
            # 컬럼 이름 변경
            df_close_new.rename(columns=column_mapping, inplace=True)
            df_close_new.rename(columns={usd_krw_ticker: 'USD_KRW'}, inplace=True)
            
            df_high_new.rename(columns=column_mapping, inplace=True)
            df_high_new.rename(columns={usd_krw_ticker: 'USD_KRW'}, inplace=True)
            
            df_low_new.rename(columns=column_mapping, inplace=True)
            df_low_new.rename(columns={usd_krw_ticker: 'USD_KRW'}, inplace=True)
            
            df_open_new.rename(columns=column_mapping, inplace=True)
            df_open_new.rename(columns={usd_krw_ticker: 'USD_KRW'}, inplace=True)
            
            # 결측치 제거 (모든 컬럼이 NaN인 행만 제거)
            df_close_new.dropna(how='all', inplace=True)
            df_high_new.dropna(how='all', inplace=True)
            df_low_new.dropna(how='all', inplace=True)
            df_open_new.dropna(how='all', inplace=True)
        
        # JPY/KRW 및 JXY 계산 (0으로 나누기 방지)
        if not df_close_new.empty and 'USD_JPY' in df_close_new.columns and 'USD_KRW' in df_close_new.columns:
            try:
                # 0 값 필터링: USD_JPY와 USD_KRW가 모두 0보다 큰 경우만 계산
                # Close 데이터
                valid_close_mask = (df_close_new['USD_JPY'] > 0) & (df_close_new['USD_JPY'].notna()) & \
                                  (df_close_new['USD_KRW'] > 0) & (df_close_new['USD_KRW'].notna())
                df_close_new['JPY_KRW'] = np.where(
                    valid_close_mask,
                    df_close_new['USD_KRW'] / df_close_new['USD_JPY'],
                    np.nan
                )
                df_close_new['JXY'] = np.where(
                    (df_close_new['USD_JPY'] > 0) & (df_close_new['USD_JPY'].notna()),
                    100 / df_close_new['USD_JPY'],
                    np.nan
                )
                
                # High 데이터: USD_KRW High / USD_JPY Low (반대 관계)
                if 'USD_JPY' in df_low_new.columns:
                    valid_high_mask = (df_high_new['USD_KRW'] > 0) & (df_high_new['USD_KRW'].notna()) & \
                                     (df_low_new['USD_JPY'] > 0) & (df_low_new['USD_JPY'].notna())
                    df_high_new['JPY_KRW'] = np.where(
                        valid_high_mask,
                        df_high_new['USD_KRW'] / df_low_new['USD_JPY'],
                        np.nan
                    )
                    df_high_new['JXY'] = np.where(
                        (df_low_new['USD_JPY'] > 0) & (df_low_new['USD_JPY'].notna()),
                        100 / df_low_new['USD_JPY'],
                        np.nan
                    )
                
                # Low 데이터: USD_KRW Low / USD_JPY High (반대 관계)
                if 'USD_JPY' in df_high_new.columns:
                    valid_low_mask = (df_low_new['USD_KRW'] > 0) & (df_low_new['USD_KRW'].notna()) & \
                                    (df_high_new['USD_JPY'] > 0) & (df_high_new['USD_JPY'].notna())
                    df_low_new['JPY_KRW'] = np.where(
                        valid_low_mask,
                        df_low_new['USD_KRW'] / df_high_new['USD_JPY'],
                        np.nan
                    )
                    df_low_new['JXY'] = np.where(
                        (df_high_new['USD_JPY'] > 0) & (df_high_new['USD_JPY'].notna()),
                        100 / df_high_new['USD_JPY'],
                        np.nan
                    )
                
                # Open 데이터
                if not df_open_new.empty and 'USD_JPY' in df_open_new.columns and 'USD_KRW' in df_open_new.columns:
                    valid_open_mask = (df_open_new['USD_JPY'] > 0) & (df_open_new['USD_JPY'].notna()) & \
                                     (df_open_new['USD_KRW'] > 0) & (df_open_new['USD_KRW'].notna())
                    df_open_new['JPY_KRW'] = np.where(
                        valid_open_mask,
                        df_open_new['USD_KRW'] / df_open_new['USD_JPY'],
                        np.nan
                    )
                    df_open_new['JXY'] = np.where(
                        (df_open_new['USD_JPY'] > 0) & (df_open_new['USD_JPY'].notna()),
                        100 / df_open_new['USD_JPY'],
                        np.nan
                    )
            except Exception as e:
                print(f"Warning: JPY/KRW, JXY 계산 실패: {e}")
        
        # 6. 데이터베이스에 저장 (실패해도 계속 진행)
        try:
            success = exchange_history_db.save_history_data(
                df_close_new, df_high_new, df_low_new, df_open_new
            )
            # Toast 제거 - 캐시된 함수 내에서 UI 요소 사용 불가
        except Exception as e:
            # 에러 무시 - 데이터는 정상 사용 가능
            pass
        
        # 7. DB 데이터와 병합 (DB가 비어있지 않은 경우)
        if not df_close_db.empty:
            df_close = pd.concat([df_close_db, df_close_new]).sort_index()
            df_high = pd.concat([df_high_db, df_high_new]).sort_index()
            df_low = pd.concat([df_low_db, df_low_new]).sort_index()
            
            # 중복 제거 (최신 데이터 우선)
            df_close = df_close[~df_close.index.duplicated(keep='last')]
            df_high = df_high[~df_high.index.duplicated(keep='last')]
            df_low = df_low[~df_low.index.duplicated(keep='last')]
        else:
            df_close = df_close_new
            df_high = df_high_new
            df_low = df_low_new
    
    # 8. 현재 가격 가져오기
    current_rates = {}
    # Spinner 제거 - 캐시된 함수 내에서 UI 요소 사용 불가
    for key, ticker_symbol in dxy_tickers.items():
        ticker = yf.Ticker(ticker_symbol)
        try:
            price = ticker.info.get('regularMarketPrice')
            if price is not None:
                current_rates[key] = price
            elif not df_close.empty and key in df_close.columns:
                current_rates[key] = float(df_close[key].iloc[-1])
            else:
                # 마지막 fallback: yfinance에서 최신 데이터 가져오기
                hist = ticker.history(period="1d")
                if not hist.empty:
                    current_rates[key] = float(hist['Close'].iloc[-1])
                else:
                    print(f"Warning: {key}의 현재 가격을 가져올 수 없습니다.")
                    current_rates[key] = 0.0
        except Exception as e:
            print(f"Warning: {key} 현재 가격 조회 실패: {e}")
            if not df_close.empty and key in df_close.columns:
                current_rates[key] = float(df_close[key].iloc[-1])
            else:
                current_rates[key] = 0.0
    
    # USD/KRW
    try:
        ticker = yf.Ticker(usd_krw_ticker)
        price = ticker.info.get('regularMarketPrice')
        if price is not None:
            current_rates['USD_KRW'] = price
        elif not df_close.empty and 'USD_KRW' in df_close.columns:
            current_rates['USD_KRW'] = float(df_close['USD_KRW'].iloc[-1])
        else:
            hist = ticker.history(period="1d")
            if not hist.empty:
                current_rates['USD_KRW'] = float(hist['Close'].iloc[-1])
            else:
                print("Warning: USD/KRW의 현재 가격을 가져올 수 없습니다.")
                current_rates['USD_KRW'] = 0.0
    except Exception as e:
        print(f"Warning: USD/KRW 현재 가격 조회 실패: {e}")
        if not df_close.empty and 'USD_KRW' in df_close.columns:
            current_rates['USD_KRW'] = float(df_close['USD_KRW'].iloc[-1])
        else:
            current_rates['USD_KRW'] = 0.0
    
    # JXY와 JPY/KRW 계산 (0 값 필터링)
    try:
        usd_jpy_rate = current_rates.get('USD_JPY')
        # USD_JPY가 유효한 경우만 JXY 계산
        if usd_jpy_rate and usd_jpy_rate > 0 and not pd.isna(usd_jpy_rate):
            current_rates['JXY'] = 100 / usd_jpy_rate
        elif not df_close.empty and 'USD_JPY' in df_close.columns:
            # 마지막 유효한 값 찾기 (0이 아닌 값, NaN이 아닌 값)
            usd_jpy_series = df_close['USD_JPY'].dropna()
            usd_jpy_series = usd_jpy_series[usd_jpy_series > 0]
            if not usd_jpy_series.empty:
                usd_jpy_rate = float(usd_jpy_series.iloc[-1])
                current_rates['JXY'] = 100 / usd_jpy_rate
            else:
                current_rates['JXY'] = None  # 0 대신 None 사용
        else:
            current_rates['JXY'] = None  # 0 대신 None 사용
        
        usd_krw_rate = current_rates.get('USD_KRW')
        usd_jpy_rate = current_rates.get('USD_JPY')
        # 두 값이 모두 유효한 경우만 JPY/KRW 계산
        if (usd_jpy_rate and usd_jpy_rate > 0 and not pd.isna(usd_jpy_rate) and
            usd_krw_rate and usd_krw_rate > 0 and not pd.isna(usd_krw_rate)):
            current_rates['JPY_KRW'] = usd_krw_rate / usd_jpy_rate
        elif not df_close.empty and 'USD_KRW' in df_close.columns and 'USD_JPY' in df_close.columns:
            # 마지막 유효한 값 찾기 (0이 아닌 값, NaN이 아닌 값)
            usd_krw_series = df_close['USD_KRW'].dropna()
            usd_krw_series = usd_krw_series[usd_krw_series > 0]
            usd_jpy_series = df_close['USD_JPY'].dropna()
            usd_jpy_series = usd_jpy_series[usd_jpy_series > 0]
            
            if not usd_krw_series.empty and not usd_jpy_series.empty:
                usd_krw_rate = float(usd_krw_series.iloc[-1])
                usd_jpy_rate = float(usd_jpy_series.iloc[-1])
                current_rates['JPY_KRW'] = usd_krw_rate / usd_jpy_rate
            else:
                current_rates['JPY_KRW'] = None  # 0 대신 None 사용
        else:
            current_rates['JPY_KRW'] = None  # 0 대신 None 사용
    except Exception as e:
        print(f"Warning: JXY/JPY_KRW 계산 실패: {e}")
        current_rates['JXY'] = None  # 0 대신 None 사용
        current_rates['JPY_KRW'] = None  # 0 대신 None 사용
    
    # 인덱스가 DatetimeIndex가 되도록 보장
    try:
        if not isinstance(df_close.index, pd.DatetimeIndex):
            df_close.index = pd.to_datetime(df_close.index)
        if not isinstance(df_high.index, pd.DatetimeIndex):
            df_high.index = pd.to_datetime(df_high.index)
        if not isinstance(df_low.index, pd.DatetimeIndex):
            df_low.index = pd.to_datetime(df_low.index)
    except Exception as e:
        print(f"Warning: 인덱스를 DatetimeIndex로 변환 실패: {e}")
    
    return df_close, df_high, df_low, current_rates

