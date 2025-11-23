# 오라클 클라우드 배포 가이드

## 오라클 클라우드 배포의 장점

### 1. **매우 관대한 무료 티어**
- **항상 무료 (Always Free)**: 
  - 2개의 VM 인스턴스 (각 1/8 OCPU, 1GB RAM)
  - 200GB 블록 스토리지
  - 10TB 아웃바운드 데이터 전송
  - 무기한 사용 가능 (신용카드 등록 필요하지만 과금되지 않음)

### 2. **Cloudflare 차단 문제 해결**
- **전통적인 서버 환경**: Vercel의 서버리스와 달리 전통적인 VM 환경
- **일반 서버 IP**: 데이터센터 IP가 아닌 일반 서버 IP 사용
- **지속적인 연결**: 서버리스의 콜드 스타트 없음
- **SSH 접속 가능**: 직접 서버에 접속하여 디버깅 가능

### 3. **실행 시간 제한 없음**
- Vercel: 10초 제한 (무료 플랜)
- 오라클 클라우드: 제한 없음

### 4. **비용**
- 항상 무료 티어로 충분한 경우가 많음
- 유료 플랜도 매우 저렴 (월 $5~10 정도)

## 배포 방법

### 방법 1: Docker를 사용한 배포 (권장)

#### 1. 오라클 클라우드 계정 생성
1. https://cloud.oracle.com 접속
2. 무료 계정 생성 (신용카드 등록 필요하지만 과금되지 않음)

#### 2. Compute Instance 생성
1. 대시보드 → **Compute** → **Instances**
2. **Create Instance** 클릭
3. 설정:
   - **Name**: `dollar-app` (원하는 이름)
   - **Image**: Ubuntu 22.04 (또는 최신 LTS)
   - **Shape**: VM.Standard.A1.Flex (ARM) 또는 VM.Standard.E2.1.Micro (x86)
   - **Networking**: Public IP 할당
   - **SSH Keys**: 기존 키 사용 또는 새로 생성
4. **Create** 클릭

#### 3. 보안 규칙 설정 (방화벽)
1. **Networking** → **Virtual Cloud Networks** → VCN 선택
2. **Security Lists** → **Default Security List** 선택
3. **Ingress Rules** → **Add Ingress Rules**
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `3000`
   - **Description**: "Next.js App"

#### 4. 서버에 접속 및 설정

```bash
# SSH 접속
ssh -i ~/.ssh/your_key opc@<PUBLIC_IP>

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker opc

# Git 설치
sudo apt install -y git

# 로그아웃 후 재접속 (docker 그룹 적용)
exit
ssh -i ~/.ssh/your_key opc@<PUBLIC_IP>
```

#### 5. 애플리케이션 배포

```bash
# 프로젝트 클론 (또는 직접 업로드)
git clone https://github.com/munsongajae/don.git
cd don

# 환경 변수 설정
nano .env.production
# 다음 내용 추가:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Docker 이미지 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

#### 6. Nginx 리버스 프록시 설정 (선택사항, 권장)

```bash
# Nginx 설치
sudo apt install -y nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/dollar-app
```

다음 내용 추가:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 또는 Public IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/dollar-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 방법 2: 직접 Node.js 설치 (Docker 없이)

```bash
# Node.js 20 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 프로젝트 클론
git clone https://github.com/munsongajae/don.git
cd don

# 의존성 설치
npm ci

# 환경 변수 설정
nano .env.production

# 빌드
npm run build

# PM2로 실행 (프로세스 관리)
sudo npm install -g pm2
pm2 start npm --name "dollar-app" -- start
pm2 save
pm2 startup  # 시스템 재시작 시 자동 시작
```

## 오라클 클라우드 vs Vercel vs Fly.io

| 항목 | Vercel | Fly.io | 오라클 클라우드 |
|------|--------|--------|----------------|
| 배포 환경 | 서버리스 | 전통 서버 | 전통 서버 (VM) |
| 실행 시간 제한 | 10초 (무료) | 제한 없음 | 제한 없음 |
| IP 타입 | 데이터센터 IP | 일반 서버 IP | 일반 서버 IP |
| Cloudflare 우회 | 어려움 | 상대적으로 쉬움 | 상대적으로 쉬움 |
| 무료 티어 | 제한적 | 제한적 | 매우 관대 |
| 비용 | 무료 플랜 있음 | 사용량 기반 | 항상 무료 가능 |
| 설정 복잡도 | 낮음 | 중간 | 중간~높음 |
| SSH 접속 | 불가능 | 가능 | 가능 |

## 주의사항

1. **신용카드 등록**: 무료 티어 사용에도 신용카드 등록이 필요하지만, 항상 무료 티어 범위 내에서는 과금되지 않습니다
2. **리소스 제한**: 무료 티어는 1/8 OCPU, 1GB RAM이므로 메모리 사용량을 최적화해야 합니다
3. **보안**: 방화벽 규칙을 올바르게 설정하고, SSH 키를 안전하게 관리하세요

## 트러블슈팅

### 메모리 부족 오류
```bash
# 스왑 메모리 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 포트 접근 불가
- 보안 규칙에서 포트 3000 (또는 80)이 열려있는지 확인
- VCN의 Security List 확인

### Docker 빌드 실패
```bash
# Docker 로그 확인
docker-compose logs

# 이미지 재빌드
docker-compose build --no-cache
```

## 추가 최적화

### 1. 도메인 연결 (선택사항)
- 오라클 클라우드 DNS 또는 외부 DNS 사용
- Let's Encrypt로 SSL 인증서 발급

### 2. 자동 배포 설정
- GitHub Actions를 사용하여 자동 배포
- 또는 Git webhook 사용

### 3. 모니터링
- PM2 모니터링 (Docker 없이 배포한 경우)
- 또는 Docker 로그 모니터링

## 예상 비용

- **항상 무료 티어**: $0/월 (1/8 OCPU, 1GB RAM)
- **유료 플랜**: 월 $5~10 (더 많은 리소스 필요 시)
