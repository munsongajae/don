# Render Python 자동 업그레이드 문제 해결

## 🎯 문제

Render가 배포 시 자동으로 Python 최신 버전(3.13)을 사용하여 호환성 문제 발생

## ✅ 해결 방법 (3단계)

### 1단계: Render 대시보드에서 Python 버전 수동 설정 (가장 중요!) ⭐⭐⭐

**이것이 가장 확실한 방법입니다!**

1. Render 대시보드 접속: https://dashboard.render.com/
2. 서비스 선택
3. **Settings** 클릭
4. **Environment** 섹션 찾기
5. **Python Version** 드롭다운에서 **`3.11`** 선택
6. **Save Changes** 클릭

**중요**: Render 대시보드에서 수동으로 설정하면 `runtime.txt`보다 우선순위가 높습니다!

### 2단계: runtime.txt 파일 확인

`backend/runtime.txt` 파일이 올바른지 확인:

```
python-3.11.7
```

**파일 위치**: `backend/runtime.txt` (rootDir이 backend인 경우)

### 3단계: render.yaml 확인

`render.yaml` 파일에서:

```yaml
services:
  - type: web
    name: dollar-investment-api
    env: python
    pythonVersion: "3.11"  # 명시적으로 3.11 지정
    rootDir: backend
    buildCommand: pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 🔧 빌드 명령어에 버전 확인 추가

Build Command를 다음과 같이 수정하여 로그에서 Python 버전을 확인:

```bash
python --version && pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

이렇게 하면 배포 로그에서 실제 사용되는 Python 버전을 확인할 수 있습니다.

## 📋 Render의 Python 버전 우선순위

Render는 다음 순서로 Python 버전을 결정합니다:

1. **Render 대시보드 설정** ← 가장 높은 우선순위!
2. **render.yaml의 pythonVersion** (Blueprint 사용 시)
3. **runtime.txt 파일**
4. **기본값: 최신 버전** (위의 것들이 없거나 인식되지 않으면)

## ✅ 체크리스트

- [ ] Render 대시보드에서 Python Version을 `3.11`로 수동 설정
- [ ] `backend/runtime.txt` 파일이 존재하고 내용이 올바른가?
- [ ] `render.yaml`에 `pythonVersion: "3.11"`이 설정되어 있는가?
- [ ] 빌드 명령어에 `python --version` 추가하여 로그 확인
- [ ] 빌드 캐시를 클리어하고 재배포
- [ ] 배포 로그에서 Python 3.11.x가 사용되는지 확인

## 🚨 여전히 문제가 발생하면

### Python 3.10 사용

더 안정적인 Python 3.10 사용:

1. Render 대시보드: Python Version `3.10` 선택
2. `backend/runtime.txt`: `python-3.10.12`
3. `render.yaml`: `pythonVersion: "3.10"`

### 로그 확인

배포 로그에서:
- Python 버전이 무엇인지 확인
- `runtime.txt` 파일이 인식되었는지 확인
- 어떤 설정이 적용되었는지 확인

## 💡 핵심 포인트

**Render 대시보드에서 Python 버전을 수동으로 설정하는 것이 가장 확실합니다!**

`runtime.txt`나 `render.yaml`만으로는 부족할 수 있으며, Render가 자동으로 최신 버전을 사용할 수 있습니다.

