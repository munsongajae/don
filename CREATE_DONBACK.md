# 백엔드 저장소 (donback) 생성 가이드

백엔드 파일들을 별도의 GitHub 저장소로 푸시하는 방법입니다.

## 📦 백엔드 저장소 구조

```
donback/
├── backend/           # 백엔드 메인 코드
│   ├── main.py
│   ├── run.py
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── render.yaml
│   └── ...
├── services/          # 비즈니스 로직
├── database/          # 데이터베이스 관련
├── config/            # 설정 파일
└── render.yaml        # Render 배포 설정 (프로젝트 루트)
```

## 🚀 생성 방법

### Windows PowerShell:

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

# 7. README.md 파일 생성 (backend/README.md 사용)
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

## 📝 포함할 파일

- [x] backend/ 폴더 전체
- [x] services/ 폴더 전체
- [x] database/ 폴더 전체
- [x] config/ 폴더 전체
- [x] render.yaml
- [x] .gitignore
- [x] README.md

## 🔧 Render 배포 설정

render.yaml 파일이 프로젝트 루트에 있어야 합니다.

```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    rootDir: backend
    buildCommand: pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: ENVIRONMENT
        value: production
```

## ✅ 완료 후

1. GitHub에서 donback 저장소 확인
2. Render에서 donback 저장소 연결
3. 환경 변수 설정
4. 배포

