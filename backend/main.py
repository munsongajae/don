"""
FastAPI 백엔드 서버
환율 투자 관리 앱의 API 엔드포인트 제공
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import pandas as pd
import math
import numpy as np

# 프로젝트 루트를 Python 경로에 추가
import sys
from pathlib import Path
# Render에서 rootDir이 backend로 설정되면 parent만 사용
# 로컬에서는 parent.parent 사용
try:
    project_root = Path(__file__).parent.parent
    # services 폴더가 있는지 확인
    if (project_root / "services").exists():
        sys.path.insert(0, str(project_root))
    else:
        # Render 환경: backend가 루트이므로 현재 디렉토리의 services 사용
        # services는 backend와 같은 레벨이므로 parent로 이동
        project_root = Path(__file__).parent.parent
        sys.path.insert(0, str(project_root))
except Exception:
    # 폴백: 현재 디렉토리 기준
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from services.exchange_rate import (
    fetch_usdt_krw_price,
    fetch_hana_usd_krw_rate,
    fetch_investing_usd_krw_rate,
    fetch_investing_jpy_krw_rate,
)
from services.exchange_rate_cached import fetch_period_data_with_cache
from database.dollar_db import (
    load_dollar_investments,
    save_dollar_investment,
    delete_dollar_investment,
    sell_dollar_investment,
    load_dollar_sell_records,
    delete_dollar_sell_record,
)
from database.jpy_db import (
    load_jpy_investments,
    save_jpy_investment,
    delete_jpy_investment,
    sell_jpy_investment,
    load_jpy_sell_records,
    delete_jpy_sell_record,
)

app = FastAPI(title="환율 투자 관리 API")

# CORS 설정
# 환경 변수에서 허용할 오리진 가져오기 (배포 환경용)
import os
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# 환경 변수에서 Netlify 도메인이 있으면 추가
netlify_domain = os.getenv("NETLIFY_DOMAIN")
if netlify_domain:
    allowed_origins.append(netlify_domain)
    # Netlify는 https를 사용하므로 https 버전도 추가
    if not netlify_domain.startswith("https://"):
        allowed_origins.append(f"https://{netlify_domain}")

# 여러 Netlify 도메인을 쉼표로 구분하여 설정할 수 있음
netlify_domains = os.getenv("NETLIFY_DOMAINS")
if netlify_domains:
    for domain in netlify_domains.split(","):
        domain = domain.strip()
        if domain:
            allowed_origins.append(domain)
            if not domain.startswith("https://"):
                allowed_origins.append(f"https://{domain}")

# 개발 환경에서는 모든 오리진 허용 (선택사항)
# 프로덕션에서는 특정 도메인만 허용하는 것이 안전합니다
if os.getenv("ENVIRONMENT") == "development":
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic 모델
class InvestmentCreate(BaseModel):
    investment_number: int
    purchase_date: str
    exchange_rate: float
    purchase_krw: float
    usd_amount: Optional[float] = None
    jpy_amount: Optional[float] = None
    exchange_name: str

class SellRequest(BaseModel):
    sell_rate: float
    sell_amount: float

# 환율 API
@app.get("/api/exchange-rates/current")
async def get_current_rates():
    """실시간 환율 정보"""
    try:
        investing_usd = fetch_investing_usd_krw_rate() or 0
        hana_rate = fetch_hana_usd_krw_rate() or 0
        usdt_krw = fetch_usdt_krw_price() or 0
        investing_jpy = fetch_investing_jpy_krw_rate() or 0

        return {
            "investingUsd": investing_usd,
            "hanaRate": hana_rate,
            "usdtKrw": usdt_krw,
            "investingJpy": investing_jpy,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exchange-rates/usdt-krw")
async def get_usdt_krw():
    """USDT/KRW 환율"""
    try:
        rate = fetch_usdt_krw_price()
        if rate is None:
            raise HTTPException(status_code=404, detail="USDT/KRW 데이터를 가져올 수 없습니다")
        return {"rate": rate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exchange-rates/hana-usd-krw")
async def get_hana_usd_krw():
    """하나은행 USD/KRW 환율"""
    try:
        rate = fetch_hana_usd_krw_rate()
        if rate is None:
            raise HTTPException(status_code=404, detail="하나은행 환율 데이터를 가져올 수 없습니다")
        return {"rate": rate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exchange-rates/investing-usd-krw")
async def get_investing_usd_krw():
    """인베스팅 USD/KRW 환율"""
    try:
        rate = fetch_investing_usd_krw_rate()
        if rate is None:
            raise HTTPException(status_code=404, detail="인베스팅 USD/KRW 데이터를 가져올 수 없습니다")
        return {"rate": rate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exchange-rates/investing-jpy-krw")
async def get_investing_jpy_krw():
    """인베스팅 JPY/KRW 환율"""
    try:
        rate = fetch_investing_jpy_krw_rate()
        if rate is None:
            raise HTTPException(status_code=404, detail="인베스팅 JPY/KRW 데이터를 가져올 수 없습니다")
        return {"rate": rate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/exchange-rates/period/{period_months}")
async def get_period_data(period_months: int):
    """기간별 환율 데이터"""
    try:
        import traceback
        df_close, df_high, df_low, current_rates = fetch_period_data_with_cache(period_months)
        
        # DataFrame 인덱스를 DatetimeIndex로 변환 (필요한 경우)
        if not isinstance(df_close.index, pd.DatetimeIndex):
            try:
                df_close.index = pd.to_datetime(df_close.index)
                df_high.index = pd.to_datetime(df_high.index)
                df_low.index = pd.to_datetime(df_low.index)
            except Exception as e:
                print(f"Warning: 인덱스를 DatetimeIndex로 변환 실패: {e}")
        
        # DataFrame을 딕셔너리로 변환 (인덱스를 날짜 문자열로 변환)
        dates = []
        try:
            if df_close.empty:
                dates = []
            elif isinstance(df_close.index, pd.DatetimeIndex):
                dates = df_close.index.strftime('%Y-%m-%d').tolist()
            else:
                # 일반 Index인 경우 문자열로 변환
                try:
                    # 날짜로 변환 시도
                    date_index = pd.to_datetime(df_close.index)
                    dates = date_index.strftime('%Y-%m-%d').tolist()
                except:
                    # 변환 실패 시 문자열로
                    dates = [str(date) for date in df_close.index]
        except Exception as e:
            print(f"Warning: 날짜 변환 실패: {e}")
            # 폴백: 인덱스를 문자열로 변환
            if not df_close.empty:
                dates = [str(date) for date in df_close.index]
            else:
                dates = []
        
        # 각 컬럼을 리스트로 변환 (NaN, inf 값 처리)
        def clean_float_value(value):
            """NaN, inf, -inf 값을 None으로 변환 (JSON 호환)"""
            try:
                if value is None:
                    return None
                # pandas/numpy 타입 체크
                if hasattr(value, 'item'):
                    value = value.item()
                # NaN 체크
                if pd.isna(value):
                    return None
                # 숫자 타입 체크
                if isinstance(value, (int, float, np.integer, np.floating, np.number)):
                    value_float = float(value)
                    # inf, -inf 체크
                    if np.isinf(value_float) or np.isnan(value_float):
                        return None
                    # 매우 큰 값 체크 (JSON 호환성)
                    if abs(value_float) > 1e308:
                        return None
                    return value_float
                return value
            except (TypeError, ValueError, OverflowError):
                return None
        
        def clean_list(values):
            """리스트의 모든 값을 정리"""
            cleaned = []
            for v in values:
                cleaned_val = clean_float_value(v)
                cleaned.append(cleaned_val if cleaned_val is not None else None)
            return cleaned
        
        # 빈 DataFrame 처리
        if df_close.empty:
            df_close_dict = {}
            df_high_dict = {}
            df_low_dict = {}
        else:
            df_close_dict = {}
            df_high_dict = {}
            df_low_dict = {}
            
            for col in df_close.columns:
                try:
                    df_close_dict[col] = clean_list(df_close[col].tolist())
                    df_high_dict[col] = clean_list(df_high[col].tolist())
                    df_low_dict[col] = clean_list(df_low[col].tolist())
                except Exception as e:
                    print(f"Warning: 컬럼 {col} 처리 중 오류: {e}")
                    df_close_dict[col] = []
                    df_high_dict[col] = []
                    df_low_dict[col] = []
        
        # current_rates도 정리 (엔화 데이터는 None 유지)
        cleaned_current_rates = {}
        for key, value in current_rates.items():
            try:
                # 엔화 관련 데이터는 None을 유지 (0 값 필터링)
                if key in ['JXY', 'JPY_KRW'] and (value is None or value == 0):
                    cleaned_current_rates[key] = None
                    continue
                
                cleaned_value = clean_float_value(value)
                # 엔화 데이터가 0이면 None으로 변환
                if key in ['JXY', 'JPY_KRW'] and cleaned_value == 0:
                    cleaned_current_rates[key] = None
                else:
                    cleaned_current_rates[key] = cleaned_value if cleaned_value is not None else 0.0
            except Exception as e:
                print(f"Warning: current_rates[{key}] 처리 중 오류: {e}")
                # 엔화 데이터는 None, 다른 데이터는 0.0
                if key in ['JXY', 'JPY_KRW']:
                    cleaned_current_rates[key] = None
                else:
                    cleaned_current_rates[key] = 0.0
        
        return {
            "dfClose": df_close_dict,
            "dfHigh": df_high_dict,
            "dfLow": df_low_dict,
            "currentRates": cleaned_current_rates,
            "dates": dates,
        }
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        error_msg = str(e)
        print(f"=" * 80)
        print(f"Error in get_period_data (period_months={period_months}):")
        print(f"Error message: {error_msg}")
        print(f"Traceback:")
        print(error_detail)
        print(f"=" * 80)
        # 에러 메시지에 더 많은 정보 포함
        raise HTTPException(
            status_code=500, 
            detail=f"기간별 데이터 조회 실패: {error_msg}"
        )

# 투자 관리 API
@app.get("/api/investments/dollar")
async def get_dollar_investments():
    """달러 투자 목록"""
    try:
        investments = load_dollar_investments()
        return investments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/investments/dollar")
async def create_dollar_investment(investment: InvestmentCreate):
    """달러 투자 등록"""
    try:
        investment_data = investment.dict()
        success = save_dollar_investment(investment_data)
        if not success:
            # Supabase 연결 실패 시 명확한 에러 메시지
            from database.supabase_client import get_supabase_client
            client = get_supabase_client()
            if client is None:
                raise HTTPException(
                    status_code=503, 
                    detail="데이터베이스 연결에 실패했습니다. Supabase 설정을 확인해주세요."
                )
            raise HTTPException(status_code=500, detail="투자 등록에 실패했습니다")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in create_dollar_investment: {error_detail}")
        raise HTTPException(status_code=500, detail=f"투자 등록 중 오류가 발생했습니다: {str(e)}")

@app.delete("/api/investments/dollar/{investment_id}")
async def delete_dollar_investment_endpoint(investment_id: str):
    """달러 투자 삭제"""
    try:
        success = delete_dollar_investment(investment_id)
        if not success:
            raise HTTPException(status_code=404, detail="투자를 찾을 수 없습니다")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/investments/dollar/{investment_id}/sell")
async def sell_dollar_investment_endpoint(investment_id: str, sell_request: SellRequest):
    """달러 투자 매도"""
    try:
        result = sell_dollar_investment(
            investment_id,
            sell_request.sell_rate,
            sell_request.sell_amount
        )
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/investments/jpy")
async def get_jpy_investments():
    """엔화 투자 목록"""
    try:
        investments = load_jpy_investments()
        return investments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/investments/jpy")
async def create_jpy_investment(investment: InvestmentCreate):
    """엔화 투자 등록"""
    try:
        investment_data = investment.dict()
        # 날짜 형식 변환
        if 'purchase_date' in investment_data:
            investment_data['purchase_date'] = investment_data['purchase_date']
        success = save_jpy_investment(investment_data)
        if not success:
            # Supabase 연결 실패 시 명확한 에러 메시지
            from database.supabase_client import get_supabase_client
            client = get_supabase_client()
            if client is None:
                raise HTTPException(
                    status_code=503, 
                    detail="데이터베이스 연결에 실패했습니다. Supabase 설정을 확인해주세요."
                )
            raise HTTPException(status_code=500, detail="투자 등록에 실패했습니다")
        return {"success": True, "message": "투자가 등록되었습니다"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in create_jpy_investment: {error_detail}")
        raise HTTPException(status_code=500, detail=f"투자 등록 중 오류가 발생했습니다: {str(e)}")

@app.delete("/api/investments/jpy/{investment_id}")
async def delete_jpy_investment_endpoint(investment_id: str):
    """엔화 투자 삭제"""
    try:
        success = delete_jpy_investment(investment_id)
        if not success:
            raise HTTPException(status_code=404, detail="투자를 찾을 수 없습니다")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/investments/jpy/{investment_id}/sell")
async def sell_jpy_investment_endpoint(investment_id: str, sell_request: SellRequest):
    """엔화 투자 매도"""
    try:
        result = sell_jpy_investment(
            investment_id,
            sell_request.sell_rate,
            sell_request.sell_amount
        )
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 매도 기록 API
@app.get("/api/sell-records/dollar")
async def get_dollar_sell_records():
    """달러 매도 기록 목록"""
    try:
        records = load_dollar_sell_records()
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/sell-records/dollar/{record_id}")
async def delete_dollar_sell_record_endpoint(record_id: str):
    """달러 매도 기록 삭제"""
    try:
        success = delete_dollar_sell_record(record_id)
        if not success:
            raise HTTPException(status_code=404, detail="매도 기록을 찾을 수 없습니다")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sell-records/jpy")
async def get_jpy_sell_records():
    """엔화 매도 기록 목록"""
    try:
        records = load_jpy_sell_records()
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/sell-records/jpy/{record_id}")
async def delete_jpy_sell_record_endpoint(record_id: str):
    """엔화 매도 기록 삭제"""
    try:
        success = delete_jpy_sell_record(record_id)
        if not success:
            raise HTTPException(status_code=404, detail="매도 기록을 찾을 수 없습니다")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "환율 투자 관리 API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

