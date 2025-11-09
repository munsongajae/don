# 저장소 분리 가이드: donfront & donback

프론트엔드와 백엔드를 별도의 GitHub 저장소로 분리합니다.

## 📦 저장소 구조

- **donfront** (https://github.com/munsongajae/donfront): 프론트엔드 (React)
- **donback** (https://github.com/munsongajae/donback): 백엔드 (FastAPI)

## 🚀 분리 방법

### 1단계: GitHub에서 저장소 생성

1. **donfront 저장소 생성**
   - https://github.com/new 접속
   - Repository name: `donfront`
   - Public 또는 Private 선택
   - "Create repository" 클릭

2. **donback 저장소 생성**
   - https://github.com/new 접속
   - Repository name: `donback`
   - Public 또는 Private 선택
   - "Create repository" 클릭

### 2단계: 프론트엔드 저장소 (donfront) 푸시

#### Windows (PowerShell) 명령어:

```powershell
# 1. frontend 디렉토리로 이동
cd frontend

# 2. Git 초기화 (이미 초기화되어 있으면 스킵)
git init

# 3. 원격 저장소 추가
git remote add origin https://github.com/munsongajae/donfront.git

# 4. 모든 파일 추가
git add .

# 5. 커밋
git commit -m "Initial commit: React frontend for dollar investment app"

# 6. main 브랜치로 이름 변경
git branch -M main

# 7. 푸시
git push -u origin main
```

#### 포함할 파일:
- `frontend/` 폴더의 모든 파일
- `frontend/netlify.toml`
- `frontend/README.md`
- `frontend/.gitignore`

### 3단계: 백엔드 저장소 (donback) 준비

백엔드 저장소에는 다음 폴더들이 필요합니다:
- `backend/` 폴더
- `services/` 폴더
- `database/` 폴더
- `config/` 폴더
- `render.yaml` (프로젝트 루트)

#### 방법 1: 새 디렉토리 생성 (권장)

```powershell
# 1. 상위 디렉토리로 이동
cd ..

# 2. 백엔드용 새 디렉토리 생성
mkdir donback
cd donback

# 3. Git 초기화
git init

# 4. 원격 저장소 추가
git remote add origin https://github.com/munsongajae/donback.git

# 5. 백엔드 파일들 복사 (수동 또는 스크립트)
# - backend/ 폴더
# - services/ 폴더
# - database/ 폴더
# - config/ 폴더
# - render.yaml

# 6. 파일 추가
git add .

# 7. 커밋
git commit -m "Initial commit: FastAPI backend for dollar investment app"

# 8. main 브랜치로 이름 변경
git branch -M main

# 9. 푸시
git push -u origin main
```

#### 방법 2: Git Subtree 사용

현재 저장소에서 특정 폴더만 새 저장소로 푸시:

```powershell
# 백엔드 파일들을 새 저장소로 푸시
# (이 방법은 복잡하므로 방법 1을 권장)
```

## 📝 수동 복사 가이드

### 백엔드 파일 복사

백엔드 저장소에 포함할 파일들:

1. **backend/** 폴더 전체
2. **services/** 폴더 전체
3. **database/** 폴더 전체
4. **config/** 폴더 전체
5. **render.yaml** (프로젝트 루트에서 복사)
6. **backend/README.md**
7. **backend/.gitignore**

### 복사 방법:

```powershell
# donback 디렉토리 생성
mkdir donback
cd donback

# 파일 복사 (PowerShell)
Copy-Item -Path ..\backend -Destination . -Recurse
Copy-Item -Path ..\services -Destination . -Recurse
Copy-Item -Path ..\database -Destination . -Recurse
Copy-Item -Path ..\config -Destination . -Recurse
Copy-Item -Path ..\render.yaml -Destination .
```

## ✅ 체크리스트

### 프론트엔드 저장소 (donfront)
- [ ] frontend/ 폴더의 모든 파일
- [ ] frontend/netlify.toml
- [ ] frontend/README.md
- [ ] frontend/.gitignore
- [ ] package.json
- [ ] 모든 소스 코드

### 백엔드 저장소 (donback)
- [ ] backend/ 폴더
- [ ] services/ 폴더
- [ ] database/ 폴더
- [ ] config/ 폴더
- [ ] render.yaml
- [ ] backend/README.md
- [ ] backend/.gitignore
- [ ] requirements.txt
- [ ] 모든 소스 코드

## 🔧 배포 설정

### 프론트엔드 (Netlify)
- Base directory: (없음, 루트가 frontend)
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_URL`

### 백엔드 (Render)
- Root Directory: (없음, 루트가 backend) 또는 `backend`
- Build Command: `pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## 📚 다음 단계

1. 각 저장소를 GitHub에 푸시
2. Netlify에서 donfront 배포
3. Render에서 donback 배포
4. 환경 변수 설정
5. CORS 설정

