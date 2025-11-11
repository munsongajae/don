# Netlify 배포 가이드

## 🚀 빠른 시작

1. **Netlify 계정 생성/로그인**
   - https://app.netlify.com 접속
   - GitHub 계정으로 로그인

2. **새 사이트 생성**
   - "Add new site" → "Import an existing project"
   - GitHub 저장소 `don` 선택

3. **환경 변수 설정** (중요!)
   - Site settings → Environment variables
   - 다음 변수 추가:
     - `SUPABASE_URL` (Functions용)
     - `SUPABASE_ANON_KEY` (Functions용)
     - `VITE_SUPABASE_URL` (프론트엔드용)
     - `VITE_SUPABASE_ANON_KEY` (프론트엔드용)
     - `VITE_API_URL` (선택사항, 기간별 데이터용)

4. **배포**
   - GitHub에 푸시하면 자동 배포
   - 또는 Netlify 대시보드에서 수동 배포

## 📚 자세한 가이드

- `QUICK_DEPLOY_GUIDE.md` - 빠른 배포 가이드
- `DEPLOYMENT_STEPS.md` - 단계별 상세 가이드
- `DEPLOYMENT_PLAN.md` - 전체 배포 계획
- `NETLIFY_ENV_SETUP.md` - 환경 변수 설정 가이드

## ✅ 배포 체크리스트

- [ ] Netlify 계정 생성/로그인
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정 (Functions용)
- [ ] 환경 변수 설정 (프론트엔드용)
- [ ] 백엔드 URL 설정 (선택사항)
- [ ] 배포 실행
- [ ] 빌드 성공 확인
- [ ] Functions 동작 확인
- [ ] 사이트 테스트

