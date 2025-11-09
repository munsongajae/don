# numpy 빌드 에러 빠른 해결 방법

## 🚨 문제
```
ERROR: Failed to build 'numpy' when getting requirements to build wheel
```

## ✅ 해결 방법 (3가지)

### 방법 1: Render 대시보드에서 Build Command 수정 (가장 빠름) ⭐

Render 대시보드 → 서비스 → Settings → Build Command를 다음으로 변경:

```bash
pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

**변경 사항:**
- numpy 설치 시 `--no-cache-dir` 옵션 추가
- requirements.txt 설치 시에도 `--no-cache-dir` 옵션 추가

### 방법 2: requirements.txt 수정

`backend/requirements.txt` 파일에서:

**변경 전:**
```txt
numpy>=1.24.0,<2.0.0
```

**변경 후:**
```txt
numpy==1.24.3
```

그리고 Render 대시보드에서 Build Command:
```bash
pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
```

### 방법 3: Python 버전 변경 (방법 1, 2가 안 되면)

1. `backend/runtime.txt` 수정:
   ```
   python-3.10.12
   ```

2. Render 대시보드에서 Python Version: `3.10` 선택

3. Build Command:
   ```bash
   pip install --upgrade pip setuptools wheel && pip install --no-cache-dir numpy==1.24.3 && pip install --no-cache-dir -r requirements.txt
   ```

## 🎯 권장 순서

1. **방법 1 시도** (Render 대시보드에서 Build Command 수정)
2. **방법 2 시도** (requirements.txt 수정)
3. **방법 3 시도** (Python 버전 변경)

## 📝 체크리스트

- [ ] Build Command에 `--no-cache-dir` 옵션이 있는가?
- [ ] numpy 버전이 명시적으로 고정되어 있는가? (1.24.3)
- [ ] setuptools, wheel이 먼저 업그레이드되는가?
- [ ] Python 버전이 3.10 또는 3.11인가?

## 💡 추가 팁

- 빌드가 실패하면 Render 로그를 확인하세요
- 로컬에서 테스트: `pip install --no-cache-dir numpy==1.24.3`
- 문제가 계속되면 Python 3.10 사용을 권장합니다

