"""
Supabase 클라이언트 연결 관리
"""
from supabase import create_client, Client
from typing import Optional
from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY

# 간단한 싱글톤 캐시
_supabase_client_cache = None
_connection_attempted = False  # 연결 시도 여부 추적
_warning_printed = False  # 경고 메시지 출력 여부 추적

def get_supabase_client() -> Optional[Client]:
    """
    Supabase 클라이언트를 초기화하고 반환합니다.
    
    Returns:
        Client: Supabase 클라이언트 인스턴스, 실패 시 None
    """
    global _supabase_client_cache, _connection_attempted, _warning_printed
    
    # 캐시된 클라이언트가 있으면 반환
    if _supabase_client_cache is not None:
        return _supabase_client_cache
    
    # 이미 연결을 시도했고 실패한 경우, 경고 없이 None 반환
    if _connection_attempted:
        return None
    
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        if not _warning_printed:
            print("Warning: Supabase 설정이 필요합니다. .env 파일에 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정해주세요.")
            _warning_printed = True
        _connection_attempted = True
        return None
    
    # 연결 시도 표시
    _connection_attempted = True
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        _supabase_client_cache = supabase
        return supabase
    except Exception as e:
        error_msg = str(e)
        
        # 경고 메시지는 한 번만 출력
        if not _warning_printed:
            print(f"Warning: Supabase 연결 실패: {error_msg}")
            print("데이터베이스 캐시 없이 yfinance에서 직접 데이터를 가져옵니다.")
            
            # API 키 형식 관련 추가 정보 (디버깅용)
            if "Invalid API key" in error_msg:
                if SUPABASE_ANON_KEY.startswith("sb_publishable_"):
                    print("참고: Publishable Key 형식이 감지되었습니다. Python 백엔드에서는 Anon Key(eyJ... 형식)를 권장합니다.")
                elif SUPABASE_ANON_KEY.startswith("eyJ"):
                    print("참고: Anon Key 형식이지만 연결에 실패했습니다. Supabase 프로젝트 상태를 확인해주세요.")
            _warning_printed = True
        
        # 실패 상태도 캐시하여 반복 시도 방지
        _supabase_client_cache = None
        return None

