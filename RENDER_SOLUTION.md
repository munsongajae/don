# Render 배포 문제 최종 해결 가이드

## 🎯 가장 확실한 해결 방법

### 방법 1: Render 웹 UI에서 직접 설정 (100% 작동 보장) ⭐⭐⭐

이 방법이 가장 확실합니다. render.yaml을 사용하지 않고 웹 UI에서 직접 설정합니다.

#### 단계별 가이드:

1. **Render 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인

2. **기존 서비스 삭제** (있는 경우)
   - 서비스 선택 → Settings → Delete Service

3. **새 Web Service 생성**
   - "New +" 버튼 클릭
   - "Web Service" 선택
   - GitHub 저장소 연결 (don 저장소)

4. **기본 설정**
   ```
   Name: dollar-investment-api
   Environment: Python 3
   Region: 원하는 지역 (Singapore 권장)
   Branch: main
   Root Directory: backend  ⚠️ 매우 중요!
   ```

5. **빌드 및 시작 명령어**
   - **Build Command**:
     ```bash
     pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

6. **고급 설정**
   - Settings → Environment → Python Version: `3.11` 선택
   - Auto-Deploy: `Yes` (GitHub 푸시 시 자동 배포)

7. **환경 변수 추가**
   - Environment Variables 섹션에서 추가:
     ```
     SUPABASE_URL = your_supabase_url
     SUPABASE_ANON_KEY = your_supabase_anon_key
     ENVIRONMENT = production
     ```

8. **서비스 생성**
   - "Create Web Service" 클릭
   - 빌드 시작
   - 로그 확인

### 방법 2: render.yaml 사용 (Blueprint)

프로젝트 루트에 `render.yaml` 파일이 있으므로 Blueprint로 배포할 수 있습니다.

1. **Render 대시보드 접속**
2. **"New +" → "Blueprint" 선택**
3. **GitHub 저장소 연결**
4. **Render가 자동으로 render.yaml 인식**
5. **환경 변수 입력** (SUPABASE_URL, SUPABASE_ANON_KEY)
6. **"Apply" 클릭**

## 🔍 문제 진단

### Render 로그 확인 방법:

1. Render 대시보드 → 서비스 선택
2. "Logs" 탭 클릭
3. 빌드 로그에서 다음 확인:
   - 어떤 패키지에서 오류 발생?
   - Python 버전은 무엇인가?
   - 빌드 명령어가 실행되었는가?
   - 오류 메시지의 정확한 내용

### 일반적인 오류와 해결:

#### 1. "metadata-generation-failed"
**원인**: 패키지 메타데이터 생성 실패
**해결**:
- setuptools, wheel 업그레이드
- numpy를 먼저 설치
- `--no-cache-dir` 옵션 사용

#### 2. "Could not find a version that satisfies the requirement"
**원인**: 패키지 버전을 찾을 수 없음
**해결**:
- 패키지 버전을 명시적으로 지정
- 호환되는 버전 사용

#### 3. "ModuleNotFoundError: No module named 'services'"
**원인**: Python 경로 문제
**해결**:
- Root Directory가 `backend`로 설정되어 있는지 확인
- services 폴더가 backend와 같은 레벨에 있는지 확인

#### 4. "Command failed with exit code 1"
**원인**: 빌드 명령어 오류
**해결**:
- 빌드 명령어가 올바른지 확인
- 각 명령어를 `&&`로 연결

## 📋 체크리스트

배포 전 확인사항:

- [ ] Root Directory가 `backend`로 설정되어 있는가?
- [ ] Build Command에 numpy를 먼저 설치하는가?
- [ ] Python Version이 `3.11`로 설정되어 있는가?
- [ ] 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 설정되어 있는가?
- [ ] requirements.txt에 모든 필요한 패키지가 있는가?
- [ ] services 폴더가 backend와 같은 레벨에 있는가?

## 🚀 빠른 해결 (권장)

**가장 빠르고 확실한 방법:**

1. Render 웹 UI에서 서비스 생성
2. Root Directory: `backend` 설정 ⚠️
3. Build Command:
   ```bash
   pip install --upgrade pip setuptools wheel && pip install numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
   ```
4. Start Command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Python Version: `3.11`
6. 환경 변수 설정
7. 배포

## 💡 추가 팁

### 로컬에서 테스트:

배포 전 로컬에서 테스트하여 문제를 미리 발견:

```bash
cd backend
pip install --upgrade pip setuptools wheel
pip install numpy==1.24.3
pip install --no-cache-dir -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Python 3.10 사용:

Python 3.11에서 문제가 발생하면 3.10 사용:

1. Python Version: `3.10` 선택
2. runtime.txt: `python-3.10.12`

### 최소한의 패키지로 테스트:

문제가 계속되면 `backend/requirements-minimal.txt` 사용:

1. Build Command에서 `requirements-minimal.txt` 사용
2. 빌드 성공 후 점진적으로 패키지 추가

## 📞 문제가 계속되면

1. **Render 로그의 전체 오류 메시지 확인**
2. **어떤 패키지에서 오류가 발생하는지 확인**
3. **로컬에서 동일한 명령어 실행 테스트**
4. **Python 버전 변경 시도** (3.10 또는 3.11)
5. **Render 지원팀에 문의** (필요시)

## ✅ 성공 확인

배포가 성공하면:

1. Render 대시보드에서 서비스 상태가 "Live"로 표시
2. 서비스 URL로 접속하여 API 동작 확인
3. `/docs` 엔드포인트로 Swagger UI 확인

예: `https://your-app.onrender.com/docs`

