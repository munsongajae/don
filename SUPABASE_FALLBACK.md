# Supabase 연결 실패 시 폴백 동작

## 현재 상태

**중요:** 현재 `.env` 파일의 `SUPABASE_ANON_KEY`가 `sb_publishable_...` 형식(Publishable Key)인 경우, Supabase Python 클라이언트는 이를 지원하지 않아 연결에 실패합니다.

**하지만 앱은 정상적으로 작동합니다!**

## 폴백 메커니즘

1. **Supabase 연결 시도**
   - `get_supabase_client()`가 Supabase에 연결을 시도합니다
   - Publishable Key 형식이면 연결에 실패합니다

2. **경고 출력 및 폴백**
   - 연결 실패 시 경고 메시지만 출력하고 `None`을 반환합니다
   - 앱은 Supabase 없이도 계속 작동합니다

3. **yfinance 직접 사용**
   - 데이터베이스 캐시 없이 yfinance에서 직접 환율 데이터를 가져옵니다
   - 모든 기능이 정상적으로 작동합니다

## Streamlit 앱과의 일관성

기존 Streamlit 앱과 동일하게:
- Supabase 연결 실패해도 앱이 계속 작동
- 경고 메시지만 출력하고 폴백으로 전환
- 사용자 경험에 큰 영향 없음

## 권장 사항 (선택사항)

성능 향상을 위해 Supabase 캐싱을 사용하려면:

1. **Anon Key 사용 (권장)**
   - Supabase Dashboard > Settings > API
   - `anon` `public` 키 복사 (형식: `eyJ...`)
   - `.env` 파일의 `SUPABASE_ANON_KEY` 값을 `anon` 키로 교체

2. **현재 상태 유지**
   - Publishable Key를 그대로 사용해도 됩니다
   - 앱은 정상 작동하며, Supabase 캐시만 사용하지 않습니다

## 확인 방법

현재 상태를 확인하려면:

```python
from database.supabase_client import get_supabase_client
client = get_supabase_client()
if client:
    print("Supabase 연결 성공 (캐시 사용 가능)")
else:
    print("Supabase 연결 실패 (yfinance 직접 사용)")
```

## 참고

- **투자 데이터**: Supabase가 연결되지 않으면 투자 데이터가 저장되지 않습니다
- **환율 데이터**: yfinance에서 직접 가져오므로 문제없이 작동합니다
- **성능**: Supabase 캐시를 사용하면 더 빠르지만, 현재 상태로도 충분히 사용 가능합니다

