# Render numpy 빌드 에러 해결 가이드

Render에서 numpy 빌드 에러가 발생하는 경우의 해결 방법입니다.

## 🐛 문제 상황

```
ERROR: Failed to build 'numpy' when getting requirements to build wheel
```

## 🔧 해결 방법

### 방법 1: 빌드 명령어 개선 (권장) ⭐⭐⭐

Render 대시보드에서 Build Command를 다음으로 변경:

```bash
pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

또는 더 안정적인 버전:

```bash
pip install --upgrade pip setuptools wheel cython && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt --no-build-isolation
```

### 방법 2: requirements.txt 수정

`backend/requirements.txt`에서 numpy 버전을 명시적으로 고정:

```txt
numpy==1.24.3
```

범위 지정 대신 정확한 버전을 사용하면 빌드가 더 안정적입니다.

### 방법 3: Python 버전 변경

Python 3.11 대신 3.10 사용:

1. `backend/runtime.txt` 수정:
   ```
   python-3.10.12
   ```

2. Render 대시보드에서 Python Version: `3.10` 선택

### 방법 4: 빌드 도구 추가

빌드 명령어에 빌드 도구 추가:

```bash
pip install --upgrade pip setuptools wheel cython && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

### 방법 5: 사전 빌드된 wheel 사용

numpy를 먼저 설치하고 나머지 패키지 설치:

```bash
pip install --upgrade pip setuptools wheel && pip install --only-binary :all: numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

## 🚀 Render 대시보드 설정

### Build Command (권장)

```bash
pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

### 또는 (더 안정적인 버전)

```bash
pip install --upgrade pip setuptools wheel cython && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt --no-build-isolation
```

## 📝 render.yaml 수정

`render.yaml` 파일이 있다면 다음과 같이 수정:

```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"
    rootDir: backend
    buildCommand: pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: ENVIRONMENT
        value: production
```

## 🔍 문제 진단

### 1. 로그 확인

Render 대시보드 → 서비스 → "Logs" 탭에서 다음 확인:
- 어떤 Python 버전이 사용되는가?
- 어떤 numpy 버전을 설치하려고 하는가?
- 정확한 에러 메시지는 무엇인가?

### 2. 로컬에서 테스트

로컬에서 동일한 명령어 실행:

```bash
cd backend
pip install --upgrade pip setuptools wheel
pip install --no-cache-dir numpy==1.24.3
pip install --no-cache-dir -r requirements.txt
```

로컬에서 실패하면 Render에서도 실패할 가능성이 높습니다.

## ✅ 체크리스트

배포 전 확인사항:

- [ ] `backend/requirements.txt`에서 numpy 버전이 명시적으로 고정되어 있는가?
- [ ] Build Command에 numpy를 먼저 설치하는가?
- [ ] Python 버전이 3.10 또는 3.11인가?
- [ ] setuptools, wheel이 업그레이드되어 있는가?
- [ ] `--no-cache-dir` 옵션이 사용되는가?

## 💡 추가 팁

### numpy 버전 호환성

- Python 3.11: numpy 1.24.3 이상 권장
- Python 3.10: numpy 1.23.0 이상 권장

### 최소한의 패키지로 테스트

문제가 계속되면 `requirements-minimal.txt` 사용:

```bash
pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements-minimal.txt
```

### 대안: 사전 빌드된 wheel 사용

numpy는 대부분 사전 빌드된 wheel을 제공하므로, 빌드가 필요하지 않아야 합니다. 
빌드가 필요한 경우는 호환되지 않는 Python 버전이나 플랫폼일 수 있습니다.

## 🚨 여전히 문제가 발생하면

1. **Python 버전 변경**: 3.11 → 3.10
2. **numpy 버전 변경**: 1.24.3 → 1.23.5
3. **빌드 도구 추가**: cython 추가
4. **Render 지원팀 문의**: 로그와 함께 문의

## 📚 참고 자료

- [numpy 설치 가이드](https://numpy.org/install/)
- [Render Python 배포 가이드](https://render.com/docs/python-version)
- [pip 빌드 문제 해결](https://pip.pypa.io/en/stable/topics/build-system/)

