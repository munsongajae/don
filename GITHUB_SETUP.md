# GitHub 저장소 업로드 가이드

## 1. 현재 상태 확인
- Git 저장소가 이미 초기화되어 있습니다
- 현재 원격 저장소: `https://github.com/munsongajae/dollar.git`
- 새로운 저장소: `https://github.com/munsongajae/don`

## 2. 단계별 업로드 방법

### 방법 1: 기존 원격 저장소를 새 저장소로 변경 (권장)

```bash
# 1. 변경사항 추가
git add .

# 2. 커밋
git commit -m "React/FastAPI 마이그레이션 완료"

# 3. 원격 저장소 URL 변경
git remote set-url origin https://github.com/munsongajae/don.git

# 4. 원격 저장소 확인
git remote -v

# 5. 푸시
git push -u origin main
```

### 방법 2: 새 원격 저장소 추가

```bash
# 1. 변경사항 추가
git add .

# 2. 커밋
git commit -m "React/FastAPI 마이그레이션 완료"

# 3. 기존 원격 저장소 제거 (선택사항)
git remote remove origin

# 4. 새 원격 저장소 추가
git remote add origin https://github.com/munsongajae/don.git

# 5. 푸시
git push -u origin main
```

## 3. 주의사항

### .env 파일은 업로드하지 않음
- `.gitignore`에 `.env`가 포함되어 있어 자동으로 제외됩니다
- GitHub에는 민감한 정보(API 키 등)를 올리지 않아야 합니다

### node_modules는 업로드하지 않음
- `frontend/node_modules/`는 `.gitignore`에 포함되어 있습니다
- 저장소 크기를 줄이기 위해 제외됩니다

### README.md 추가 권장
- 프로젝트 설명을 위한 README.md 파일을 추가하는 것을 권장합니다

## 4. 문제 해결

### 권한 오류가 발생하는 경우
```bash
# GitHub에 로그인되어 있는지 확인
# Personal Access Token을 사용해야 할 수 있습니다
```

### 충돌이 발생하는 경우
```bash
# 원격 저장소의 내용을 먼저 가져오기
git pull origin main --allow-unrelated-histories

# 충돌 해결 후
git add .
git commit -m "충돌 해결"
git push origin main
```

