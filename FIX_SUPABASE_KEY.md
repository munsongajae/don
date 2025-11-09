# Supabase API 키 문제 해결 가이드

## 현재 문제

**오류 메시지:** `Invalid API key`

**원인:** `.env` 파일에 `sb_publishable_...` 형식의 Publishable Key가 설정되어 있지만, Supabase Python 클라이언트(버전 2.0.3)는 이 형식을 지원하지 않습니다.

## 해결 방법

### 방법 1: Anon Key 사용 (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **API 키 찾기**
   - 왼쪽 메뉴에서 **Settings** 클릭
   - **API** 섹션 클릭
   - **Project API keys** 섹션으로 스크롤

3. **Anon Key 복사**
   - `anon` `public` 키를 찾습니다
   - 이 키는 `eyJ...` 형식으로 시작하는 JWT 토큰입니다
   - 키 옆의 **복사** 버튼 클릭

4. **.env 파일 수정**
   - 프로젝트 루트의 `.env` 파일 열기
   - `SUPABASE_ANON_KEY` 값을 복사한 `anon` 키로 교체
   ```bash
   SUPABASE_URL=https://dejdgsibdoguzknvihog.supabase.co
   SUPABASE_ANON_KEY=eyJ... (여기에 anon 키 붙여넣기)
   ```

5. **연결 테스트**
   ```bash
   python test_supabase_connection.py
   ```

### 방법 2: Supabase 클라이언트 업데이트 (시도해볼 수 있음)

최신 버전의 Supabase Python 클라이언트가 Publishable Key를 지원할 수 있습니다:

```bash
pip install --upgrade supabase
```

그러나 현재(2024년 기준) 대부분의 버전은 여전히 Anon Key만 지원합니다.

## 키 형식 비교

| 키 타입 | 형식 | Python 클라이언트 지원 | 용도 |
|---------|------|----------------------|------|
| **Anon Key** | `eyJ...` (JWT) | ✅ 지원 | 백엔드 서버용 |
| **Publishable Key** | `sb_publishable_...` | ❌ 미지원 | 프론트엔드용 (새 형식) |

## 확인 방법

다음 명령으로 현재 설정된 키 형식을 확인할 수 있습니다:

```bash
python test_supabase_connection.py
```

## 주의사항

- **Anon Key**는 공개되어도 상대적으로 안전하지만, RLS(Row Level Security) 정책을 올바르게 설정해야 합니다
- **Service Role Key**는 절대 프론트엔드나 공개 저장소에 노출하면 안 됩니다
- `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다

## 추가 도움말

문제가 계속되면:
1. Supabase 프로젝트 상태 확인 (일시 중지되지 않았는지)
2. 네트워크 연결 확인
3. Supabase Dashboard에서 키가 올바르게 표시되는지 확인
4. 키를 다시 생성해보기 (Settings > API > Regenerate key)

