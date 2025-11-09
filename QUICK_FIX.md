# Supabase 연결 오류 빠른 해결 방법

## 문제
```
Warning: Supabase 연결 실패: Invalid API key
```

## 원인
`.env` 파일에 `sb_publishable_...` 형식의 Publishable Key가 설정되어 있지만, Python 백엔드에서는 `eyJ...` 형식의 Anon Key가 필요합니다.

## 해결 방법 (3단계)

### 1단계: Supabase Dashboard에서 Anon Key 찾기

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Settings** 클릭
4. **API** 섹션 클릭
5. **Project API keys** 섹션으로 스크롤
6. **`anon` `public`** 키 찾기 (이 키는 `eyJ...`로 시작합니다)
7. 키 옆의 **복사** 버튼 클릭

### 2단계: .env 파일 수정

프로젝트 루트의 `.env` 파일을 열고 다음을 수정:

```bash
# 기존 (잘못된 형식)
SUPABASE_ANON_KEY=sb_publishable_CvC2u...

# 수정 후 (올바른 형식)
SUPABASE_ANON_KEY=eyJ... (여기에 복사한 anon 키 붙여넣기)
```

### 3단계: 연결 테스트

```bash
python test_supabase_connection.py
```

성공 메시지가 나타나면 연결이 완료된 것입니다.

## 참고

- **현재 앱은 Supabase 없이도 작동합니다** (yfinance에서 직접 데이터 가져오기)
- 하지만 Supabase를 사용하면 데이터베이스 캐싱으로 성능이 향상됩니다
- API 키를 변경한 후에는 서버를 재시작해야 합니다

## 키 형식 비교

| 키 타입 | 형식 | 사용 용도 |
|---------|------|----------|
| ❌ Publishable Key | `sb_publishable_...` | 프론트엔드 JavaScript SDK용 |
| ✅ Anon Key | `eyJ...` | Python 백엔드용 (현재 필요) |
| ⚠️ Service Role Key | `eyJ...` | 서버 전용 (RLS 우회, 주의 필요) |

## 여전히 문제가 있다면?

1. Supabase 프로젝트가 일시 중지되지 않았는지 확인
2. URL이 올바른지 확인: `https://your-project-ref.supabase.co`
3. 키가 정확히 복사되었는지 확인 (공백 없이)
4. 서버 재시작: 백엔드 서버를 중지하고 다시 시작

