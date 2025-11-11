# GitHub에 있어야 할 파일 및 폴더 목록

## 📁 필수 파일 및 폴더

### 1. 루트 디렉토리 파일
```
.gitignore
README.md
package.json
package-lock.json
tsconfig.json
next.config.js
tailwind.config.ts
postcss.config.js
netlify.toml
```

### 2. app/ 폴더 (Next.js App Router)
```
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── (tabs)/
│   ├── layout.tsx
│   ├── summary/
│   │   └── page.tsx
│   ├── analysis/
│   │   └── page.tsx
│   ├── investment/
│   │   └── page.tsx
│   └── sell-records/
│       └── page.tsx
└── api/
    ├── exchange-rates/
    │   ├── current/
    │   │   └── route.ts
    │   └── period/
    │       └── [months]/
    │           └── route.ts
    ├── investments/
    │   ├── dollar/
    │   │   └── route.ts
    │   └── jpy/
    │       └── route.ts
    └── sell-records/
        ├── dollar/
        │   └── route.ts
        └── jpy/
            └── route.ts
```

### 3. components/ 폴더 (React 컴포넌트)
```
components/
├── charts/
│   └── TossChart.tsx
├── indicators/
│   └── ProgressIndicator.tsx
├── investment/
│   ├── InvestmentForm.tsx
│   ├── InvestmentList.tsx
│   └── SellModal.tsx
├── metrics/
│   └── MetricCard.tsx
├── navigation/
│   └── TossTabs.tsx
└── ui/
    ├── TossButton.tsx
    └── TossCard.tsx
```

### 4. lib/ 폴더 (유틸리티 및 서비스)
```
lib/
├── config/
│   └── constants.ts
├── database/
│   ├── dollar-db.ts
│   └── jpy-db.ts
├── services/
│   ├── exchange-rate.ts
│   └── index-calculator.ts
├── supabase/
│   ├── client.ts
│   └── server.ts
└── utils/
    ├── calculations.ts
    └── formatters.ts
```

### 5. store/ 폴더 (Zustand 상태 관리)
```
store/
├── useExchangeRateStore.ts
└── useInvestmentStore.ts
```

### 6. types/ 폴더 (TypeScript 타입 정의)
```
types/
└── index.ts
```

### 7. public/ 폴더 (정적 파일)
```
public/
└── (이미지, 아이콘 등 정적 파일 - 현재는 비어있을 수 있음)
```

### 8. SQL 파일 (선택사항)
```
supabase_schema.sql
add_sell_records_columns.sql
```

## ❌ 제외되어야 할 파일/폴더

### Streamlit 관련 (Python)
- `app.py`
- `components/*.py`
- `config/` (Python 파일)
- `database/*.py`
- `services/*.py`
- `utils/*.py`
- `requirements.txt`
- `pages/` (빈 폴더)
- `__pycache__/`
- `.streamlit/`

### 이전 React/Vite 앱
- `src/`
- `netlify/functions/`
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.node.json`
- `index.html`

### 빌드/캐시 파일
- `node_modules/`
- `.next/`
- `.env*.local`
- `.env`
- `*.tsbuildinfo`
- `next-env.d.ts`

### IDE 설정
- `.idea/`
- `.devcontainer/`
- `.vscode/`

### 불필요한 문서
- `DEPLOYMENT_PLAN.md`
- `DEPLOYMENT_STEPS.md`
- `NETLIFY_DEPLOY_CHECKLIST.md`
- `NETLIFY_ENV_SETUP.md`
- `QUICK_DEPLOY_GUIDE.md`
- `README_DEPLOY.md`

## ✅ 현재 Git에 추적 중인 파일 (확인 완료)

다음 파일들이 이미 Git에 추가되어 있습니다:
- ✅ 모든 app/ 폴더 파일
- ✅ 모든 components/ 폴더 파일 (TSX만)
- ✅ 모든 lib/ 폴더 파일
- ✅ 모든 store/ 폴더 파일
- ✅ types/index.ts
- ✅ 설정 파일들 (package.json, tsconfig.json 등)
- ✅ netlify.toml
- ✅ SQL 파일들

## 📝 체크리스트

현재 상태를 확인하려면:
```bash
git ls-files
```

누락된 파일이 있다면:
```bash
git add <파일경로>
git commit -m "Add missing file"
git push origin main
```

