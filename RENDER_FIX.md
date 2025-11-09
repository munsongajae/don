# Render 배포 오류 해결 (metadata-generation-failed)

## 🔴 문제
```
error: metadata-generation-failed
× Encountered error while generating package metadata.
```

## ✅ 해결 방법

### 1. requirements.txt 수정

`backend/requirements.txt` 파일을 다음과 같이 수정:

```txt
# Build tools (먼저 설치)
setuptools>=65.0.0
wheel>=0.40.0

# Core dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6

# Data processing
pandas==2.1.3
numpy>=1.24.0,<2.0.0

# Finance data
yfinance>=0.2.40

# Web scraping
beautifulsoup4==4.12.2
requests==2.31.0

# Database
supabase==2.0.3

# Utilities
python-dotenv==1.0.0
python-dateutil==2.8.2
```

### 2. render.yaml 수정

`backend/render.yaml` 파일:

```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    buildCommand: pip install --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: ENVIRONMENT
        value: production
      - key: PYTHON_VERSION
        value: "3.11.7"
```

### 3. runtime.txt 확인

`backend/runtime.txt` 파일:
```
python-3.11.7
```

## 🚀 Render 웹 UI에서 수동 설정

render.yaml이 작동하지 않을 경우, Render 웹 UI에서 직접 설정:

1. **Render 대시보드** → 서비스 선택
2. **Settings** 탭:
   - **Python Version**: `3.11` 선택
   - **Build Command**: 
     ```
     pip install --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt
     ```
   - **Start Command**: 
     ```
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Root Directory**: `backend`

3. **Environment Variables**:
   - `PYTHON_VERSION`: `3.11.7`
   - `SUPABASE_URL`: your_supabase_url
   - `SUPABASE_ANON_KEY`: your_supabase_anon_key
   - `ENVIRONMENT`: `production`

4. **Manual Deploy** → **Deploy latest commit**

## 🔍 추가 문제 해결

### 방법 1: 단계별 설치

빌드 명령어를 단계별로 나누어 실행:

```bash
pip install --upgrade pip
pip install --upgrade setuptools wheel
pip install --no-cache-dir numpy
pip install --no-cache-dir pandas
pip install --no-cache-dir -r requirements.txt
```

### 방법 2: Python 버전 변경

Python 3.10 사용 시도:

1. `backend/runtime.txt`: `python-3.10.12`
2. `render.yaml`: `pythonVersion: "3.10"`
3. 환경 변수: `PYTHON_VERSION=3.10.12`

### 방법 3: 패키지 버전 조정

문제가 되는 패키지 버전을 낮추기:

```txt
pandas==2.0.3
numpy==1.24.3
```

## 📝 체크리스트

- [ ] `backend/requirements.txt`에 `setuptools`, `wheel` 추가
- [ ] `backend/render.yaml`의 buildCommand에 빌드 도구 업그레이드 추가
- [ ] `backend/runtime.txt`에 Python 버전 명시
- [ ] 환경 변수 `PYTHON_VERSION` 설정
- [ ] `--no-cache-dir` 옵션 사용
- [ ] 변경사항 커밋 및 푸시
- [ ] Render에서 재배포

## 🎯 빠른 해결

가장 빠른 해결 방법:

1. **requirements.txt**에 `setuptools>=65.0.0`과 `wheel>=0.40.0` 추가
2. **render.yaml**의 buildCommand 수정:
   ```
   pip install --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt
   ```
3. 커밋 및 푸시
4. Render에서 재배포

