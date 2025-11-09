# 저장소 분리 완료 가이드

프론트엔드와 백엔드를 별도의 GitHub 저장소로 분리했습니다.

## ✅ 완료된 작업

### 1. 프론트엔드 저장소 (donfront) ✅

- **저장소**: https://github.com/munsongajae/donfront
- **상태**: 푸시 완료
- **포함된 파일**:
  - frontend/ 폴더의 모든 파일
  - frontend/netlify.toml
  - frontend/README.md
  - frontend/.gitignore

### 2. 백엔드 저장소 (donback) 준비 필요

백엔드 저장소를 생성하려면 다음 단계를 따르세요:

## 🚀 백엔드 저장소 (donback) 생성

### Windows PowerShell 명령어:

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

# 6. .gitignore 파일 생성
Copy-Item -Path ..\dollar\backend\.gitignore -Destination .\.gitignore

# 7. README.md 파일 생성
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

## 📁 백엔드 저장소 구조

```
donback/
├── backend/
│   ├── main.py
│   ├── run.py
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── render.yaml
│   └── ...
├── services/
├── database/
├── config/
└── render.yaml
```

## 🔧 배포 설정

### 프론트엔드 (Netlify)
- 저장소: donfront
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_URL`

### 백엔드 (Render)
- 저장소: donback
- Root Directory: `backend` (render.yaml 사용 시)
- Build Command: `pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## 📚 다음 단계

1. ✅ 프론트엔드 저장소 (donfront) 푸시 완료
2. ⏳ 백엔드 저장소 (donback) 생성 및 푸시
3. Netlify에서 donfront 배포
4. Render에서 donback 배포
5. 환경 변수 설정
6. CORS 설정

## 💡 참고사항

- 각 저장소는 독립적으로 관리됩니다
- 프론트엔드와 백엔드는 별도로 배포할 수 있습니다
- 환경 변수는 각 배포 플랫폼에서 설정해야 합니다

