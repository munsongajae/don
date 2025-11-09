# 저장소 분리 방법 (donfront & donback)

프론트엔드와 백엔드를 별도의 GitHub 저장소로 분리하는 단계별 가이드입니다.

## ✅ 1단계: 프론트엔드 저장소 (donfront) - 완료

프론트엔드는 이미 GitHub에 푸시되었습니다!
- 저장소: https://github.com/munsongajae/donfront

## 🚀 2단계: 백엔드 저장소 (donback) 생성

### GitHub에서 저장소 생성

1. https://github.com/new 접속
2. Repository name: `donback`
3. Public 또는 Private 선택
4. "Create repository" 클릭

### 로컬에서 백엔드 저장소 준비

**Windows PowerShell:**

```powershell
# 1. 상위 디렉토리로 이동
cd C:\webapp

# 2. 백엔드용 새 디렉토리 생성
mkdir donback
cd donback

# 3. Git 초기화
git init

# 4. 원격 저장소 추가
git remote add origin https://github.com/munsongajae/donback.git

# 5. 백엔드 파일들 복사
Copy-Item -Path ..\dollar\backend -Destination . -Recurse
Copy-Item -Path ..\dollar\services -Destination . -Recurse
Copy-Item -Path ..\dollar\database -Destination . -Recurse
Copy-Item -Path ..\dollar\config -Destination . -Recurse
Copy-Item -Path ..\dollar\render.yaml -Destination .

# 6. .gitignore 파일 복사
Copy-Item -Path ..\dollar\backend\.gitignore -Destination .\.gitignore

# 7. README.md 파일 복사
Copy-Item -Path ..\dollar\backend\README.md -Destination .\README.md

# 8. 파일 추가
git add .

# 9. 커밋
git commit -m "Initial commit: FastAPI backend for dollar investment app"

# 10. main 브랜치로 이름 변경
git branch -M main

# 11. 푸시
git push -u origin main --force
```

## 📁 백엔드 저장소에 포함할 파일

- [x] `backend/` 폴더 전체
- [x] `services/` 폴더 전체
- [x] `database/` 폴더 전체
- [x] `config/` 폴더 전체
- [x] `render.yaml` (프로젝트 루트)
- [x] `.gitignore`
- [x] `README.md`

## 🔧 Render 배포 설정

백엔드 저장소가 준비되면 Render에서 배포:

1. Render 대시보드 접속
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결 (donback)
4. 설정:
   - Root Directory: `backend`
   - Build Command: `pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 환경 변수:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. 배포

## 📚 참고 문서

- [CREATE_DONBACK.md](./CREATE_DONBACK.md) - 백엔드 저장소 생성 상세 가이드
- [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md) - 백엔드 저장소 구조 가이드
- [RENDER_SOLUTION.md](./RENDER_SOLUTION.md) - Render 배포 가이드

