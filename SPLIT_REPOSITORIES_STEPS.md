# 저장소 분리 단계별 가이드

프론트엔드와 백엔드를 별도의 GitHub 저장소로 분리하는 방법입니다.

## 📦 저장소

- **donfront**: https://github.com/munsongajae/donfront (프론트엔드)
- **donback**: https://github.com/munsongajae/donback (백엔드)

## ✅ 1단계: 프론트엔드 저장소 (donfront) - 완료

프론트엔드는 이미 푸시되었습니다!

### 포함된 파일:
- frontend/ 폴더의 모든 파일
- frontend/netlify.toml
- frontend/README.md
- frontend/.gitignore

## 🚀 2단계: 백엔드 저장소 (donback) 준비

### 방법: 새 디렉토리 생성 및 파일 복사

#### Windows PowerShell 명령어:

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
# dollar 디렉토리에서 다음 파일/폴더 복사:
Copy-Item -Path ..\dollar\backend -Destination . -Recurse
Copy-Item -Path ..\dollar\services -Destination . -Recurse
Copy-Item -Path ..\dollar\database -Destination . -Recurse
Copy-Item -Path ..\dollar\config -Destination . -Recurse
Copy-Item -Path ..\dollar\render.yaml -Destination .

# 6. 파일 추가
git add .

# 7. 커밋
git commit -m "Initial commit: FastAPI backend for dollar investment app"

# 8. main 브랜치로 이름 변경
git branch -M main

# 9. 푸시 (강제 푸시가 필요할 수 있음)
git push -u origin main --force
```

### 백엔드 저장소에 포함할 파일:

- [x] backend/ 폴더 전체
- [x] services/ 폴더 전체
- [x] database/ 폴더 전체
- [x] config/ 폴더 전체
- [x] render.yaml
- [x] backend/README.md (이미 생성됨)
- [x] backend/.gitignore (이미 생성됨)

## 📝 3단계: 백엔드 저장소 구조 확인

백엔드 저장소의 최종 구조:

```
donback/
├── backend/
│   ├── main.py
│   ├── run.py
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── render.yaml
│   ├── Procfile
│   ├── railway.json
│   └── README.md
├── services/
│   ├── exchange_rate.py
│   ├── exchange_rate_cached.py
│   └── index_calculator.py
├── database/
│   ├── dollar_db.py
│   ├── jpy_db.py
│   ├── exchange_history_db.py
│   └── supabase_client.py
├── config/
│   └── settings.py
└── render.yaml
```

## 🔧 4단계: 배포 설정

### 프론트엔드 (Netlify)
- 저장소: donfront
- Base directory: (없음, 루트가 frontend)
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_URL`

### 백엔드 (Render)
- 저장소: donback
- Root Directory: (없음, 루트가 backend) 또는 백엔드 파일들이 루트에 있으면 그대로
- Build Command: `pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT` (또는 `cd backend && uvicorn main:app ...`)
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## 📚 다음 단계

1. ✅ 프론트엔드 저장소 (donfront) 푸시 완료
2. ⏳ 백엔드 저장소 (donback) 푸시
3. Netlify에서 donfront 배포
4. Render에서 donback 배포
5. 환경 변수 설정
6. CORS 설정

## 💡 참고사항

- 각 저장소는 독립적으로 관리됩니다
- 프론트엔드와 백엔드는 별도로 배포할 수 있습니다
- 환경 변수는 각 배포 플랫폼에서 설정해야 합니다

