# .env 파일 설정 가이드

## .env 파일 위치

**.env 파일은 프로젝트 루트에 위치해야 합니다.**

```
dollar/
├── .env                    ← 여기에 위치
├── backend/
│   ├── main.py
│   └── run.py
├── config/
│   └── settings.py         ← 여기서 .env 로드
├── database/
├── services/
└── ...
```

## .env 파일 내용

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 중요 사항

### 1. API 키 형식

Supabase는 두 가지 키 형식을 제공합니다:

#### ✅ Anon Key (권장)
- 형식: `eyJ...` (JWT 토큰 형식)
- 위치: Supabase Dashboard > Settings > API > Project API keys > `anon` `public`
- 현재 Python 클라이언트에서 지원됨

#### ⚠️ Publishable Key (최신)
- 형식: `sb_publishable_...`
- 위치: Supabase Dashboard > Settings > API > Project API keys > `publishable`
- **현재 Python 클라이언트에서 지원되지 않을 수 있음**

### 2. 올바른 키 확인 방법

1. Supabase Dashboard 접속
2. Settings > API 이동
3. **Project API keys** 섹션에서:
   - `anon` `public` 키 복사 (JWT 형식)
   - 또는 `publishable` 키 복사 (새 형식)

### 3. 현재 문제

현재 `.env` 파일에 `sb_publishable_...` 형식의 키가 설정되어 있어서 연결이 실패할 수 있습니다.

**해결 방법:**
1. Supabase Dashboard에서 `anon` `public` 키를 복사
2. `.env` 파일의 `SUPABASE_ANON_KEY` 값을 `anon` 키로 교체

## 설정 확인

다음 Python 코드로 환경 변수가 제대로 로드되는지 확인할 수 있습니다:

```python
from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY
print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_ANON_KEY: {SUPABASE_ANON_KEY[:20]}..." if SUPABASE_ANON_KEY else "Not set")
```

## 참고

- `config/settings.py`는 자동으로 프로젝트 루트의 `.env` 파일을 찾습니다
- `backend/.env` 파일도 존재하지만, 프로젝트 루트의 `.env` 파일이 우선순위가 높습니다
- 환경 변수는 어디서 서버를 실행하든 일관되게 로드됩니다

