# 로그인 선택적 사용 개선 아이디어

## 📋 현재 상황

- 모든 탭이 `AuthGuard`로 보호되어 로그인 필수
- 로그인하지 않으면 `/auth/login`으로 리다이렉트

## 🎯 개선 목표

1. **로그인 없이 사용 가능**: 종합, 분석 탭
2. **로그인 필수**: 투자, 매도 탭
3. **부드러운 UX**: 로그인 유도 메시지 및 버튼

## 💡 개선 방안

### 방안 1: 선택적 AuthGuard (권장)

#### 구조
```
app/(tabs)/
  ├── layout.tsx (AuthGuard 제거)
  ├── summary/
  │   └── page.tsx (로그인 불필요)
  ├── analysis/
  │   └── page.tsx (로그인 불필요)
  ├── investment/
  │   └── page.tsx (개별 AuthGuard 또는 로그인 체크)
  └── sell-records/
      └── page.tsx (개별 AuthGuard 또는 로그인 체크)
```

#### 장점
- 각 페이지에서 독립적으로 인증 처리
- 유연한 접근 제어
- 명확한 구조

#### 구현 방법
1. `app/(tabs)/layout.tsx`에서 `AuthGuard` 제거
2. `investment/page.tsx`와 `sell-records/page.tsx`에 개별 인증 체크 추가
3. 로그인하지 않은 상태에서 접근 시 로그인 유도 UI 표시

---

### 방안 2: 조건부 AuthGuard

#### 구조
```
app/(tabs)/
  └── layout.tsx (조건부 AuthGuard)
      - 특정 경로만 인증 체크
      - 로그인 불필요한 경로는 통과
```

#### 장점
- 중앙 집중식 인증 관리
- 코드 중복 최소화

#### 단점
- 경로별 조건 로직이 복잡해질 수 있음

---

### 방안 3: 하이브리드 접근 (최적)

#### 구조
```
app/(tabs)/
  ├── layout.tsx (AuthGuard 제거, 공통 레이아웃만)
  ├── summary/
  │   └── page.tsx (로그인 불필요)
  ├── analysis/
  │   └── page.tsx (로그인 불필요)
  ├── investment/
  │   └── page.tsx (ConditionalAuthGuard 사용)
  └── sell-records/
      └── page.tsx (ConditionalAuthGuard 사용)
```

#### 새로운 컴포넌트: `ConditionalAuthGuard`
- 로그인하지 않은 경우: 로그인 유도 UI 표시 (리다이렉트 없음)
- 로그인한 경우: 정상적으로 페이지 표시

---

## 🎨 UI/UX 개선 아이디어

### 1. 로그인 유도 카드
투자/매도 탭에서 로그인하지 않은 경우:

```
┌─────────────────────────────────┐
│  💰 투자 내역을 관리하려면      │
│     로그인이 필요합니다          │
│                                 │
│  [Google로 로그인하기]          │
│                                 │
│  로그인하면:                    │
│  ✓ 투자 내역 저장 및 관리       │
│  ✓ 매도 기록 추적               │
│  ✓ 여러 기기에서 동기화         │
└─────────────────────────────────┘
```

### 2. 탭 네비게이션 개선
- 로그인하지 않은 상태에서 투자/매도 탭 클릭 시:
  - 즉시 리다이렉트하지 않음
  - 페이지는 표시하되 로그인 유도 카드 표시
  - 또는 탭에 작은 자물쇠 아이콘 표시

### 3. 기능별 접근 제어
- **종합 탭**: 완전 공개
- **분석 탭**: 완전 공개
- **투자 탭**: 
  - 조회: 로그인 불필요 (빈 상태 표시)
  - 등록/수정/삭제: 로그인 필수
- **매도 탭**: 로그인 필수

---

## 🔧 구현 세부사항

### 1. ConditionalAuthGuard 컴포넌트

```typescript
// components/auth/ConditionalAuthGuard.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import TossCard from '@/components/ui/TossCard';
import TossButton from '@/components/ui/TossButton';
import { useRouter } from 'next/navigation';

interface ConditionalAuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode; // 커스텀 로그인 유도 UI
}

export default function ConditionalAuthGuard({ 
  children, 
  fallback 
}: ConditionalAuthGuardProps) {
  const { user, loading, initialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized || loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return fallback || (
      <TossCard className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          로그인이 필요합니다
        </h2>
        <p className="text-gray-600 mb-6">
          이 기능을 사용하려면 로그인이 필요합니다.
        </p>
        <TossButton
          onClick={() => router.push('/auth/login')}
          variant="primary"
          fullWidth
        >
          로그인하기
        </TossButton>
      </TossCard>
    );
  }

  return <>{children}</>;
}
```

### 2. 투자 탭 개선

```typescript
// app/(tabs)/investment/page.tsx
'use client';

import ConditionalAuthGuard from '@/components/auth/ConditionalAuthGuard';
import { useAuthStore } from '@/store/useAuthStore';

export default function InvestmentPage() {
  const { user } = useAuthStore();
  
  // 로그인하지 않은 경우 빈 상태 표시
  if (!user) {
    return (
      <ConditionalAuthGuard
        fallback={
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">투자</h1>
            <TossCard className="text-center py-12">
              {/* 로그인 유도 UI */}
            </TossCard>
          </div>
        }
      >
        {/* 실제 투자 페이지 */}
      </ConditionalAuthGuard>
    );
  }
  
  // 로그인한 경우 정상 표시
  return (
    <div className="space-y-6">
      {/* 기존 투자 페이지 내용 */}
    </div>
  );
}
```

### 3. 탭 네비게이션 개선

```typescript
// components/navigation/TossTabs.tsx
const tabs = [
  { id: 'summary', label: '종합', icon: '📊', href: '/summary', requiresAuth: false },
  { id: 'analysis', label: '분석', icon: '📈', href: '/analysis', requiresAuth: false },
  { id: 'investment', label: '투자', icon: '💰', href: '/investment', requiresAuth: true },
  { id: 'sell-records', label: '매도', icon: '📋', href: '/sell-records', requiresAuth: true },
];

// 탭에 자물쇠 아이콘 표시 (로그인 필요 시)
{tab.requiresAuth && !user && (
  <span className="text-xs">🔒</span>
)}
```

---

## 📊 기능별 접근 권한 매트릭스

| 기능 | 로그인 없이 | 로그인 필요 |
|------|------------|------------|
| 실시간 환율 조회 | ✅ | ✅ |
| 지표 신호 확인 | ✅ | ✅ |
| 차트 보기 | ✅ | ✅ |
| 투자 내역 조회 | ❌ (빈 상태) | ✅ |
| 투자 내역 등록 | ❌ | ✅ |
| 투자 내역 수정/삭제 | ❌ | ✅ |
| 매도 기록 조회 | ❌ | ✅ |
| 매도 기록 등록 | ❌ | ✅ |

---

## 🚀 구현 우선순위

### Phase 1: 기본 구조
1. ✅ `app/(tabs)/layout.tsx`에서 `AuthGuard` 제거
2. ✅ `ConditionalAuthGuard` 컴포넌트 생성
3. ✅ 투자/매도 탭에 조건부 인증 적용

### Phase 2: UX 개선
1. ✅ 로그인 유도 카드 디자인
2. ✅ 탭 네비게이션에 자물쇠 아이콘 추가
3. ✅ 부드러운 전환 애니메이션

### Phase 3: 고급 기능
1. 로컬 스토리지에 임시 데이터 저장 (선택적)
2. 로그인 후 데이터 마이그레이션
3. 오프라인 모드 지원

---

## 💭 추가 고려사항

### 1. 데이터 보안
- 로그인하지 않은 상태에서도 API 호출은 가능하지만, 개인 데이터는 접근 불가
- API Routes에서 `user_id` 체크는 그대로 유지

### 2. 성능
- 로그인하지 않은 상태에서도 환율 조회는 정상 작동
- 불필요한 API 호출 최소화

### 3. 사용자 경험
- 로그인 유도 메시지는 친절하고 명확하게
- 로그인 후 원래 페이지로 돌아오기 (redirect)

---

## 🎯 추천 방안

**방안 3 (하이브리드 접근)**을 추천합니다:

1. **유연성**: 각 페이지에서 독립적으로 인증 처리
2. **명확성**: 어떤 기능이 로그인이 필요한지 명확
3. **확장성**: 향후 기능 추가 시 쉽게 확장 가능
4. **UX**: 로그인 유도가 자연스럽고 부드러움

