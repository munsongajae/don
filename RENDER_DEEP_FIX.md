# Render 배포 오류 심층 분석 및 해결

## 🔍 문제 원인 분석

### 가능한 원인들:

1. **render.yaml 위치 문제**
   - render.yaml이 `backend/` 폴더에 있으면 Render가 인식하지 못할 수 있음
   - Render는 프로젝트 루트에서 render.yaml을 찾음

2. **패키지 설치 순서 문제**
   - numpy가 pandas보다 먼저 설치되어야 함
   - 일부 패키지가 다른 패키지에 의존

3. **Python 경로 문제**
   - backend/main.py가 `Path(__file__).parent.parent`로 상위 디렉토리 참조
   - Render에서 rootDir이 backend로 설정되면 경로 문제 발생

4. **패키지 버전 호환성**
   - 특정 패키지 버전이 메타데이터 생성 실패 유발
   - pandas 2.1.3과 numpy 호환성 문제

5. **Render 설정 문제**
   - render.yaml이 무시되고 기본 설정 사용
   - 웹 UI 설정이 render.yaml보다 우선순위가 높음

## ✅ 해결 방법

### 방법 1: 프로젝트 루트에 render.yaml 생성 (권장)

1. **프로젝트 루트에 render.yaml 생성**:
   ```yaml
   services:
     - type: web
       name: dollar-investment-api
       env: python
       pythonVersion: "3.11"
       rootDir: backend
       buildCommand: pip install --upgrade pip setuptools wheel && pip install --no-cache-dir -r requirements.txt
       startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Render에서 Blueprint로 배포**:
   - "New +" → "Blueprint"
   - GitHub 저장소 연결
   - Render가 자동으로 루트의 render.yaml 인식

### 방법 2: 웹 UI에서 직접 설정 (가장 확실함)

1. **Render 대시보드에서 수동 설정**:

   **기본 설정:**
   - Name: `dollar-investment-api`
   - Environment: `Python 3`
   - Region: 원하는 지역 선택
   - Branch: `main`

   **빌드 설정:**
   - Root Directory: `backend`
   - Build Command: 
     ```bash
     pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
     ```
   - Start Command: 
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

   **고급 설정:**
   - Python Version: `3.11` 선택
   - Auto-Deploy: `Yes`

   **환경 변수:**
   - `SUPABASE_URL`: your_supabase_url
   - `SUPABASE_ANON_KEY`: your_supabase_anon_key
   - `ENVIRONMENT`: `production`

### 방법 3: 패키지 버전 조정

문제가 되는 패키지 버전을 더 안정적인 버전으로 변경:

```txt
# requirements.txt
setuptools>=65.0.0
wheel>=0.40.0
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
numpy==1.24.3  # 고정 버전 사용
pandas==2.0.3  # 더 안정적인 버전
yfinance>=0.2.40
beautifulsoup4==4.12.2
requests==2.31.0
supabase==2.0.3
python-dotenv==1.0.0
python-dateutil==2.8.2
```

### 방법 4: 단계별 설치

빌드 명령어를 단계별로 나누어 실행:

```bash
pip install --upgrade pip setuptools wheel
pip install numpy==1.24.3
pip install pandas==2.0.3
pip install --no-cache-dir -r requirements.txt
```

또는:

```bash
pip install --upgrade pip setuptools wheel && \
pip install numpy==1.24.3 && \
pip install pandas==2.0.3 && \
pip install --no-cache-dir fastapi uvicorn pydantic python-multipart && \
pip install --no-cache-dir yfinance beautifulsoup4 requests supabase python-dotenv python-dateutil
```

### 방법 5: Python 3.10 사용

Python 3.11에서 문제가 발생할 수 있으므로 3.10 사용:

1. **runtime.txt 수정**:
   ```
   python-3.10.12
   ```

2. **render.yaml 수정**:
   ```yaml
   pythonVersion: "3.10"
   ```

3. **환경 변수**:
   - `PYTHON_VERSION`: `3.10.12`

## 🔧 가장 확실한 해결 방법

### 단계별 가이드:

1. **Render 대시보드에서 서비스 삭제** (있는 경우)

2. **새 서비스 생성**:
   - "New +" → "Web Service"
   - GitHub 저장소 연결

3. **설정 입력**:
   - **Name**: `dollar-investment-api`
   - **Environment**: `Python 3`
   - **Region**: 선택
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ 중요!
   - **Build Command**: 
     ```bash
     pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

4. **고급 설정**:
   - Settings → Environment → Python Version: `3.11` 또는 `3.10`

5. **환경 변수 추가**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `ENVIRONMENT`: `production`

6. **배포**:
   - "Create Web Service" 클릭
   - 빌드 로그 확인

## 📋 체크리스트

- [ ] render.yaml이 프로젝트 루트에 있는지 확인
- [ ] Root Directory가 `backend`로 설정되어 있는지 확인
- [ ] Build Command에 numpy를 먼저 설치하는지 확인
- [ ] Python 버전이 명시되어 있는지 확인
- [ ] 환경 변수가 올바르게 설정되어 있는지 확인
- [ ] 빌드 로그에서 정확한 오류 메시지 확인

## 🐛 디버깅

### 빌드 로그 확인:

1. Render 대시보드 → 서비스 → "Logs" 탭
2. 빌드 로그에서 다음 확인:
   - 어떤 패키지에서 오류 발생?
   - Python 버전은 무엇인가?
   - 빌드 명령어가 제대로 실행되는가?

### 일반적인 오류:

1. **"Could not find a version that satisfies the requirement"**
   - 패키지 버전을 명시적으로 지정
   - 호환되는 버전 사용

2. **"metadata-generation-failed"**
   - setuptools, wheel 업그레이드
   - numpy를 먼저 설치
   - `--no-cache-dir` 옵션 사용

3. **"ModuleNotFoundError"**
   - requirements.txt에 패키지가 포함되어 있는지 확인
   - Python 경로 문제 확인

## 💡 추천 해결 순서

1. **웹 UI에서 직접 설정** (가장 확실함)
2. **프로젝트 루트에 render.yaml 생성**
3. **패키지 버전 조정** (numpy, pandas 고정 버전)
4. **Python 3.10 사용** (3.11에서 문제 발생 시)
5. **단계별 설치** (빌드 명령어 분리)

## 📞 추가 도움

문제가 계속되면:
1. Render 로그의 전체 오류 메시지 확인
2. 어떤 패키지에서 오류가 발생하는지 확인
3. 로컬에서 `pip install -r requirements.txt` 테스트

