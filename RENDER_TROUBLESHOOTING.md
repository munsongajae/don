# Render 배포 문제 해결 가이드

## 🔧 일반적인 빌드 오류 해결

### 1. metadata-generation-failed 오류

이 오류는 주로 패키지 설치 중 메타데이터 생성 실패로 발생합니다.

#### 해결 방법:

1. **Python 버전 명시**
   - `backend/runtime.txt` 파일 생성
   - 내용: `python-3.11.7`

2. **pip 업그레이드**
   - `render.yaml`의 buildCommand에 `pip install --upgrade pip` 추가
   - 또는 Render 대시보드에서 Build Command 수정:
     ```
     pip install --upgrade pip && pip install -r requirements.txt
     ```

3. **패키지 버전 호환성 확인**
   - `requirements.txt`에서 패키지 버전 범위 명시
   - 예: `numpy>=1.24.0,<2.0.0`

### 2. 빌드 명령어 오류

#### 문제:
- `buildCommand`가 잘못된 디렉토리에서 실행됨
- Python 경로 문제

#### 해결 방법:

**render.yaml 사용 시:**
```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    buildCommand: pip install --upgrade pip && pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Render 웹 UI 사용 시:**
- Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Root Directory: `backend`

### 3. Python 버전 불일치

#### 해결 방법:

1. **runtime.txt 파일 생성**
   ```
   python-3.11.7
   ```

2. **render.yaml에 Python 버전 명시**
   ```yaml
   pythonVersion: "3.11"
   ```

3. **Render 대시보드에서 Python 버전 선택**
   - Settings → Environment → Python Version: 3.11

### 4. 패키지 설치 실패

#### 해결 방법:

1. **requirements.txt 검증**
   ```bash
   # 로컬에서 테스트
   cd backend
   pip install -r requirements.txt
   ```

2. **문제가 있는 패키지 버전 조정**
   - 특정 패키지 버전을 낮추거나 높이기
   - 호환되는 버전 범위 명시

3. **의존성 충돌 해결**
   ```bash
   pip install pip-tools
   pip-compile requirements.in
   ```

## 📝 Render 배포 체크리스트

### 필수 설정:

- [ ] `backend/runtime.txt` 파일 생성 (Python 버전 명시)
- [ ] `backend/render.yaml` 파일 생성 (또는 웹 UI에서 설정)
- [ ] `backend/requirements.txt` 파일 확인
- [ ] Build Command에 `pip install --upgrade pip` 포함
- [ ] Start Command가 올바른지 확인
- [ ] Root Directory가 `backend`로 설정되어 있는지 확인

### 환경 변수:

- [ ] `SUPABASE_URL` 설정
- [ ] `SUPABASE_ANON_KEY` 설정
- [ ] `NETLIFY_DOMAIN` 설정 (CORS용, 선택사항)

## 🚀 올바른 Render 설정

### 방법 1: render.yaml 사용 (권장)

1. `backend/render.yaml` 파일 생성:
```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    buildCommand: pip install --upgrade pip && pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: ENVIRONMENT
        value: production
```

2. Render 대시보드에서:
   - "New +" → "Blueprint"
   - GitHub 저장소 연결
   - Render가 자동으로 `render.yaml` 인식

### 방법 2: 웹 UI 사용

1. **Render 대시보드 설정:**
   - Name: `dollar-investment-api`
   - Environment: `Python 3`
   - Root Directory: `backend`
   - Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Python 버전 설정:**
   - Settings → Environment → Python Version: `3.11`

3. **환경 변수 추가:**
   - `SUPABASE_URL`: your_supabase_url
   - `SUPABASE_ANON_KEY`: your_supabase_anon_key
   - `NETLIFY_DOMAIN`: https://your-app.netlify.app (나중에 추가)

## 🔍 로그 확인

배포 실패 시 Render 대시보드에서 로그를 확인하세요:

1. Render 대시보드 → 서비스 선택
2. "Logs" 탭 클릭
3. 빌드 로그에서 오류 메시지 확인
4. 일반적인 오류:
   - `ModuleNotFoundError`: 패키지 설치 실패
   - `ImportError`: 경로 문제
   - `SyntaxError`: Python 버전 문제

## 💡 추가 팁

### 1. 로컬에서 테스트

배포 전 로컬에서 테스트:
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. 빌드 시간 단축

- 불필요한 패키지 제거
- `--no-cache-dir` 옵션 사용 (필요시):
  ```
  pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
  ```

### 3. 의존성 최적화

- `requirements.txt`에 필요한 패키지만 포함
- 버전 범위를 적절히 설정
- 최신 버전 사용 (호환성 확인 후)

## 📚 참고 자료

- [Render 공식 문서](https://render.com/docs)
- [Render Python 가이드](https://render.com/docs/deploy-python)
- [Render 문제 해결](https://render.com/docs/troubleshooting-deploys)

