# Supabase 배포 사이트 설정 빠른 수정 가이드

## ⚡ 빠른 해결 방법

배포된 사이트에서 오류가 발생한다면, 다음 설정을 확인하세요:

### 1️⃣ Supabase Dashboard 설정

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication → URL Configuration 이동**

3. **Site URL 설정**
   ```
   https://your-app.netlify.app
   ```
   (실제 배포된 사이트 URL로 변경)

4. **Redirect URLs에 추가**
   ```
   http://localhost:3000/auth/callback
   https://your-app.netlify.app/auth/callback
   ```
   
   **중요**: 
   - 각 URL을 한 줄씩 입력
   - 마지막 슬래시(`/`) 없이 입력
   - `http://`와 `https://` 모두 포함

### 2️⃣ Netlify 환경 변수 확인

Netlify Dashboard → Site settings → Environment variables:

**확인할 변수**:
- `NEXT_PUBLIC_SUPABASE_URL` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**값 확인 방법**:
1. Supabase Dashboard → Settings → API
2. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 복사
3. **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사

### 3️⃣ 재배포

설정 변경 후:
- Netlify Dashboard → Deploys → "Trigger deploy" → "Clear cache and deploy site"

## 🔍 현재 배포 사이트 URL 확인

Netlify Dashboard에서 현재 배포된 사이트 URL을 확인하세요:
- Site settings → Domain management
- 또는 Deploys 탭에서 최신 배포의 URL 확인

## ✅ 설정 완료 체크리스트

- [ ] Supabase Site URL = 배포 사이트 URL
- [ ] Supabase Redirect URLs에 배포 사이트 URL 추가
- [ ] Netlify 환경 변수 설정 확인
- [ ] Netlify 재배포 완료

## 🐛 여전히 오류가 발생한다면

1. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - 에러 메시지 확인

2. **Netlify 로그 확인**
   - Netlify Dashboard → Functions → Logs
   - 에러 메시지 확인

3. **Supabase 로그 확인**
   - Supabase Dashboard → Logs → API Logs
   - 인증 관련 에러 확인

