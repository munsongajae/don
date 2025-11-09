# 백엔드 저장소 구조 가이드

백엔드 저장소(donback)에 포함할 파일과 구조를 설명합니다.

## 📁 백엔드 저장소 구조

```
donback/
├── backend/           # 백엔드 메인 코드
│   ├── main.py
│   ├── run.py
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── render.yaml
│   ├── Procfile
│   ├── railway.json
│   └── README.md
├── services/          # 비즈니스 로직
│   ├── __init__.py
│   ├── exchange_rate.py
│   ├── exchange_rate_cached.py
│   └── index_calculator.py
├── database/          # 데이터베이스 관련
│   ├── __init__.py
│   ├── dollar_db.py
│   ├── jpy_db.py
│   ├── exchange_history_db.py
│   └── supabase_client.py
├── config/            # 설정 파일
│   ├── __init__.py
│   └── settings.py
└── render.yaml        # Render 배포 설정 (프로젝트 루트)
```

## 🔄 Render 배포 시 구조 조정

Render에서 `rootDir: backend`로 설정하면, 백엔드 파일들을 루트로 이동해야 할 수 있습니다.

### 옵션 1: Render에서 rootDir 사용 (권장)

render.yaml 설정:
```yaml
rootDir: backend
```

이 경우 Render는 backend 폴더를 루트로 인식하므로, 현재 구조 그대로 사용 가능합니다.

### 옵션 2: 백엔드 파일들을 루트로 이동

백엔드 저장소 구조를 다음과 같이 변경:

```
donback/
├── main.py            # backend/main.py에서 이동
├── run.py             # backend/run.py에서 이동
├── requirements.txt   # backend/requirements.txt에서 이동
├── runtime.txt        # backend/runtime.txt에서 이동
├── services/
├── database/
├── config/
└── render.yaml
```

이 경우 render.yaml에서 `rootDir` 설정을 제거합니다.

## 📝 백엔드 저장소 생성 스크립트

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

# 6. .gitignore 파일 생성 (backend/.gitignore를 루트로 복사하거나 새로 생성)
Copy-Item -Path ..\dollar\backend\.gitignore -Destination .\.gitignore

# 7. README.md 파일 생성 (backend/README.md를 루트로 복사하거나 새로 생성)
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

## 🔧 Render 배포 설정

### render.yaml 위치

render.yaml은 프로젝트 루트에 있어야 합니다.

```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    rootDir: backend  # backend 폴더를 루트로 설정
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

### 또는 rootDir 없이 사용

백엔드 파일들을 루트로 이동한 경우:

```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    # rootDir 제거
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

## ✅ 체크리스트

백엔드 저장소에 포함할 파일:

- [ ] backend/ 폴더
- [ ] services/ 폴더
- [ ] database/ 폴더
- [ ] config/ 폴더
- [ ] render.yaml (프로젝트 루트)
- [ ] .gitignore
- [ ] README.md

## 📚 참고사항

- backend/main.py는 `project_root = Path(__file__).parent.parent`로 상위 디렉토리를 참조합니다
- Render에서 rootDir을 backend로 설정하면, 이 경로가 올바르게 작동합니다
- services, database, config 폴더는 backend와 같은 레벨에 있어야 합니다

