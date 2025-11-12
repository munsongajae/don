# Supabase 배포 설정 가이드

## 🔧 Supabase Dashboard 설정

배포된 사이트에서 Supabase 인증이 작동하려면 Supabase Dashboard에서 다음 설정이 필요합니다.

### 1. Authentication > URL Configuration

Supabase Dashboard → Authentication → URL Configuration에서 다음을 설정하세요:

#### Site URL
```
https://your-app.netlify.app
```
(실제 배포된 사이트 URL로 변경)

#### Redirect URLs
다음 URL들을 모두 추가하세요:

```
http://localhost:3000/auth/callback
https://your-app.netlify.app/auth/callback
```

**중요**: 
- 각 URL을 한 줄씩 입력
- 마지막에 슬래시(`/`) 없이 입력
- `http://`와 `https://` 모두 포함

### 2. Google OAuth 설정 확인

Supabase Dashboard → Authentication → Providers → Google에서:

1. **Enable Google provider** 체크
2. **Client ID (for OAuth)** 설정 확인
3. **Client Secret (for OAuth)** 설정 확인

### 3. Google Cloud Console 설정

Google Cloud Console → APIs & Services → Credentials에서:

#### Authorized redirect URIs에 추가:
```
https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
```

**참고**: 
- `[YOUR_SUPABASE_PROJECT_REF]`는 Supabase Dashboard의 프로젝트 설정에서 확인 가능
- 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

## 🌐 Netlify 환경 변수 설정

Netlify Dashboard → Site settings → Environment variables에서 다음을 설정:

### 필수 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

**확인 방법**:
1. Supabase Dashboard → Settings → API
2. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 복사
3. **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사

## ✅ 설정 확인 체크리스트

- [ ] Supabase Site URL 설정 (배포 사이트 URL)
- [ ] Supabase Redirect URLs 설정 (로컬 + 배포 URL)
- [ ] Google OAuth Provider 활성화
- [ ] Google Cloud Console Redirect URI 설정
- [ ] Netlify 환경 변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Netlify 재배포 (환경 변수 변경 후)

## 🐛 일반적인 오류 및 해결 방법

### 1. "redirect_uri_mismatch" 오류

**원인**: Google Cloud Console의 Redirect URI가 Supabase 콜백 URL과 일치하지 않음

**해결**:
- Google Cloud Console에서 Supabase 콜백 URL 확인
- 형식: `https://[PROJECT_REF].supabase.co/auth/v1/callback`

### 2. "Invalid redirect URL" 오류

**원인**: Supabase Dashboard의 Redirect URLs에 배포 사이트 URL이 없음

**해결**:
- Supabase Dashboard → Authentication → URL Configuration
- Redirect URLs에 `https://your-app.netlify.app/auth/callback` 추가

### 3. "Supabase 환경 변수가 설정되지 않았습니다" 오류

**원인**: Netlify 환경 변수가 설정되지 않았거나 잘못됨

**해결**:
- Netlify Dashboard에서 환경 변수 확인
- `NEXT_PUBLIC_` 접두사 확인
- 재배포 실행

## 📝 설정 예시

### Supabase Dashboard 설정 예시

```
Site URL: https://dollar-investment.netlify.app

Redirect URLs:
http://localhost:3000/auth/callback
https://dollar-investment.netlify.app/auth/callback
```

### Netlify 환경 변수 예시

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔄 설정 변경 후 재배포

환경 변수나 Supabase 설정을 변경한 후:

1. Netlify Dashboard → Deploys
2. "Trigger deploy" → "Clear cache and deploy site" 클릭

또는 Git에 푸시하면 자동으로 재배포됩니다.

