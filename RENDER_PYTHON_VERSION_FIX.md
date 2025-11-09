# Render Python 버전 자동 업그레이드 문제 해결

## 🐛 문제

Render가 배포 시 자동으로 Python의 최신 버전(3.13)을 설치하여 호환성 문제 발생

## ✅ 해결 방법

### 방법 1: runtime.txt 파일 위치 확인 및 수정 (가장 중요) ⭐⭐⭐

Render는 `runtime.txt` 파일을 읽어 Python 버전을 결정합니다. 하지만 **파일 위치가 중요**합니다.

#### 올바른 위치
- `backend/runtime.txt` (rootDir이 backend인 경우)
- 또는 프로젝트 루트의 `runtime.txt`

#### 파일 내용
```
python-3.11.7
```

**중요**: 공백이나 추가 내용이 있으면 안 됩니다!

### 방법 2: render.yaml에서 Python 버전 명시

`render.yaml` 파일에서 Python 버전을 명시적으로 설정:

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

### 방법 3: Render 대시보드에서 Python 버전 설정

1. Render 대시보드 → 서비스 → **Settings**
2. **Environment** 섹션
3. **Python Version** 드롭다운에서 **`3.11`** 선택
4. **Save Changes**

### 방법 4: 빌드 명령어에서 Python 버전 확인

빌드 명령어 시작 부분에 Python 버전 확인 추가:

```bash
python --version && pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

이렇게 하면 로그에서 실제 사용되는 Python 버전을 확인할 수 있습니다.

## 🔧 종합 해결 방법 (권장)

### 1단계: runtime.txt 파일 확인

`backend/runtime.txt` 파일이 다음 내용만 포함하는지 확인:

```
python-3.11.7
```

**주의사항**:
- 파일 끝에 빈 줄이 있어도 됩니다
- 다른 내용이 있으면 안 됩니다
- 정확한 형식: `python-3.11.7` 또는 `python-3.11`

### 2단계: render.yaml 확인

`render.yaml` 파일에서:

```yaml
pythonVersion: "3.11"
```

이렇게 명시적으로 설정되어 있는지 확인합니다.

### 3단계: Render 대시보드 설정

1. Render 대시보드 접속
2. 서비스 → Settings
3. **Python Version: `3.11`** 선택
4. **Save Changes**

### 4단계: 빌드 명령어에 버전 확인 추가

Build Command를 다음과 같이 수정:

```bash
python --version && pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

### 5단계: 재배포

1. "Manual Deploy" 클릭
2. "Clear build cache & deploy site" 선택
3. 배포 시작
4. 로그에서 Python 버전 확인

## 📝 파일 구조 확인

올바른 파일 구조:

```
donback/
├── backend/
│   ├── runtime.txt          # python-3.11.7
│   ├── requirements.txt
│   ├── main.py
│   └── render.yaml          # pythonVersion: "3.11"
└── render.yaml              # pythonVersion: "3.11"
```

## 🚨 문제 진단

### 로그에서 확인할 사항

배포 로그의 시작 부분에서:

```
Python 3.11.x
```

이렇게 나와야 합니다. 만약:

```
Python 3.13.x
```

이렇게 나오면 Render가 `runtime.txt`를 인식하지 못한 것입니다.

### 해결 방법

1. **runtime.txt 파일 위치 확인**
   - `backend/runtime.txt`에 있는지 확인
   - 파일 내용이 정확한지 확인

2. **Render 대시보드에서 수동 설정**
   - Settings → Python Version → `3.11` 선택
   - 이것이 가장 확실한 방법입니다

3. **render.yaml 사용**
   - Blueprint 방식으로 배포하는 경우
   - `render.yaml`의 `pythonVersion`이 우선순위가 높습니다

## 💡 추가 팁

### Python 3.10 사용 (더 안정적)

만약 Python 3.11에서도 문제가 발생하면 3.10 사용:

1. `backend/runtime.txt`:
   ```
   python-3.10.12
   ```

2. `render.yaml`:
   ```yaml
   pythonVersion: "3.10"
   ```

3. Render 대시보드: Python Version `3.10` 선택

### 빌드 명령어에서 강제 설정

빌드 명령어 시작 부분에:

```bash
export PYTHON_VERSION=3.11 && python --version && pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

하지만 이 방법은 Render에서 작동하지 않을 수 있습니다.

## ✅ 최종 체크리스트

- [ ] `backend/runtime.txt` 파일이 존재하고 내용이 `python-3.11.7`인가?
- [ ] `render.yaml`에 `pythonVersion: "3.11"`이 설정되어 있는가?
- [ ] Render 대시보드에서 Python Version이 `3.11`로 설정되어 있는가?
- [ ] 빌드 로그에서 Python 3.11.x가 사용되는지 확인했는가?
- [ ] 빌드 캐시를 클리어하고 재배포했는가?

## 🔍 Render의 Python 버전 우선순위

Render는 다음 순서로 Python 버전을 결정합니다:

1. **Render 대시보드 설정** (가장 높은 우선순위)
2. **render.yaml의 pythonVersion** (Blueprint 사용 시)
3. **runtime.txt 파일** (일반적인 경우)
4. **기본값: 최신 버전** (위의 것들이 없으면)

따라서 **Render 대시보드에서 수동으로 설정하는 것이 가장 확실**합니다!

## 📚 참고 자료

- [Render Python 버전 문서](https://render.com/docs/python-version)
- [runtime.txt 형식](https://devcenter.heroku.com/articles/python-runtimes)

