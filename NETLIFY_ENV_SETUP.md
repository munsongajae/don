# Netlify 환경 변수 설정 가이드

## 🔐 환경 변수 설정 방법

Netlify 대시보드에서 환경 변수를 설정해야 합니다.

### 1. Netlify 대시보드 접속

1. https://app.netlify.com 접속
2. 사이트 선택 (또는 새 사이트 생성)
3. **Site settings** → **Environment variables** 클릭

### 2. 환경 변수 추가

다음 환경 변수들을 추가하세요:

#### 필수 환경 변수 (Functions용)

```
SUPABASE_URL=https://dejdgsibdoguzknvihog.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlamRnc2liZG9ndXprbnZpaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ4MTEsImV4cCI6MjA3NTIyMDgxMX0.vplvq5tb_Q0fXIX3H3H6uw6_WxbCdgQ1cTRECzdNhnM
```

**주의**: Functions는 `process.env`를 사용하므로 `VITE_` 접두사가 **없습니다**.

#### 필수 환경 변수 (프론트엔드용)

```
VITE_SUPABASE_URL=https://dejdgsibdoguzknvihog.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlamRnc2liZG9ndXprbnZpaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDQ4MTEsImV4cCI6MjA3NTIyMDgxMX0.vplvq5tb_Q0fXIX3H3H6uw6_WxbCdgQ1cTRECzdNhnM
```

**주의**: 프론트엔드는 `import.meta.env`를 사용하므로 `VITE_` 접두사가 **필요합니다**.

#### 선택적 환경 변수 (기간별 데이터용)

```
VITE_API_URL=https://your-backend-url.onrender.com
```

기간별 데이터를 위해 백엔드 URL을 설정할 수 있습니다. 없으면 에러가 발생할 수 있습니다.

### 3. 환경 변수 스코프 설정

- **All scopes**: 모든 브랜치와 배포에 적용
- **Specific branches**: 특정 브랜치에만 적용 (예: production, main)

### 4. 환경 변수 확인

환경 변수를 추가한 후:
1. **Redeploy site** 클릭하여 재배포
2. 배포 로그에서 환경 변수 로드 확인
3. Functions 로그에서 환경 변수 확인

## 📋 환경 변수 체크리스트

- [ ] `SUPABASE_URL` (Functions용)
- [ ] `SUPABASE_ANON_KEY` (Functions용)
- [ ] `VITE_SUPABASE_URL` (프론트엔드용)
- [ ] `VITE_SUPABASE_ANON_KEY` (프론트엔드용)
- [ ] `VITE_API_URL` (선택사항, 기간별 데이터용)

## ⚠️ 주의사항

1. **환경 변수 이름 구분**
   - Functions: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (VITE_ 없음)
   - 프론트엔드: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (VITE_ 필요)

2. **보안**
   - 환경 변수는 Netlify 대시보드에서만 설정
   - `.env` 파일을 Git에 커밋하지 않음
   - `SUPABASE_ANON_KEY`는 공개되어도 안전하지만, 민감한 정보는 보호

3. **재배포**
   - 환경 변수를 추가/수정한 후에는 재배포 필요
   - Netlify 대시보드 → Deploys → "Trigger deploy" → "Deploy site"

## 🔧 환경 변수 테스트

배포 후 Functions 로그에서 환경 변수 확인:

1. Netlify 대시보드 → Functions → Logs
2. Functions 실행 로그 확인
3. 환경 변수 로드 확인

또는 Functions 코드에서 테스트:

```javascript
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
```

