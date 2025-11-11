# 학교급/학년 선택 프로세스 고도화 계획서

> **작성일**: 2025-01-10
> **목적**: 1회 등록 강제 및 전용 수정 메뉴 구현을 통한 사용자 경험 개선

---

## 📋 목차

1. [요구사항 분석](#1-요구사항-분석)
2. [벤치마킹 분석](#2-벤치마킹-분석)
3. [현재 시스템 분석](#3-현재-시스템-분석)
4. [설계 옵션 비교](#4-설계-옵션-비교)
5. [권장 솔루션 상세 설계](#5-권장-솔루션-상세-설계)
6. [구현 계획](#6-구현-계획)
7. [기존 코드 변경 사항](#7-기존-코드-변경-사항)
8. [테스트 계획](#8-테스트-계획)

---

## 1. 요구사항 분석

### 1.1 핵심 요구사항

#### A. 1회 등록 강제 (First-Time Setup)
**목표**: 학교급과 학년 선택은 선택 이력이 없는 회원에 한해 1회만 등록

**세부 요구사항**:
- ✅ 온보딩 시 최초 1회 학년 선택
- ✅ 선택 완료 후에는 일반 프로필 편집에서 수정 불가
- ✅ 선택 이력 추적 (`gradeLevelSetAt` timestamp)
- ✅ 변경 이력 로깅 (감사 목적)

#### B. 전용 수정 메뉴 (Dedicated Change Flow)
**목표**: 사용자가 원하는 별도의 수정 메뉴를 통해서만 학교급과 학년 선택 수정 가능

**세부 요구사항**:
- ✅ Settings 페이지에 "학년 변경" 전용 섹션 생성
- ✅ 변경 시 확인 모달 표시 (영향 안내)
- ✅ 변경 전후 데이터 보존 (학습 통계 유지)
- ✅ 24시간 내 1회 변경 제한 (남용 방지)

#### C. 사용자 경험 최적화
**목표**: 편의성과 신중함의 균형

**세부 요구사항**:
- ✅ 첫 등록: 부드럽고 자연스러운 온보딩 플로우
- ✅ 수정: 명확한 경고 + 의도 확인 → 신중한 변경 유도
- ✅ 투명성: "언제든 설정에서 변경 가능" 안내
- ✅ 접근성: 모바일/데스크톱 모두 최적화

---

## 2. 벤치마킹 분석

### 2.1 Khan Academy 패턴

#### 온보딩 플로우
```
1. Welcome
2. Grade Selection → 즉시 맞춤형 과목 리스트 제공
3. Subject Recommendation
4. Account Creation (Optional)
```

**핵심 특징**:
- 학년 선택을 온보딩 초기에 배치 (개인화 우선)
- 학년에 따라 표시되는 과목/콘텐츠 자동 필터링
- "Change Grade Level" 전용 UI in Settings

#### 설정 페이지 구조
```
Settings
├─ Account Settings
├─ Learning Preferences
│  ├─ Current Grade: [초등학교 6학년]
│  └─ [Change Grade Level] Button
└─ Privacy & Data
```

**UX 특징**:
- Read-only display + 전용 버튼
- 변경 시 별도 페이지로 이동
- 변경 후 맞춤형 콘텐츠 자동 재설정

### 2.2 Duolingo 패턴

#### 개인화 우선 온보딩
```
1. Language Selection
2. Goal Setting (Daily XP)
3. Proficiency Test (Optional)
4. Personalized Learning Path
```

**핵심 특징**:
- 첫 선택 후 "언제든 변경 가능" 명시
- Settings에서 Goal 변경 시 확인 모달
- 변경 영향 명확히 안내 ("진행도 유지됨")

### 2.3 EdTech UX Best Practices (2024-2025)

#### Incremental Onboarding
- **발견**: 30% 이상의 온보딩 단계는 불필요
- **적용**: 핵심 정보만 수집 (Grade + Subject)
- **결과**: 완료율 향상, 사용자 이탈 감소

#### Settings Editor 패턴
- **Random Access**: 원하는 설정 바로 접근 가능
- **Categorization**: 카테고리별 명확한 구분
- **Save Strategy**:
  - Platform-wide: 즉시 적용
  - Websites: Save 버튼 사용
  - Apps: 둘 다 사용 가능

#### Profile Navigation Hierarchy
```
Settings → Account Settings → Profile → Edit → Save
Settings → Learning Info → [Change] → Confirm → Save
```

**핵심 원칙**:
1. 중요한 변경은 확인 단계 추가
2. 변경 영향 명확히 안내
3. 실수 방지 메커니즘 (Undo, Cancel)

---

## 3. 현재 시스템 분석

### 3.1 온보딩 플로우

**현재 구조** (`app/onboarding/page.tsx`):
```
Step 0: Welcome
Step 1: Experience (Skip 가능)
Step 2: Grade Level Selection ← 핵심
Step 3: Subject Selection
Step 4: Nickname Input
Step 5: Auth (Optional)
```

**Grade Level Step 동작** (`components/onboarding/GradeLevelStep.tsx`):
```typescript
const handleSelect = (level: GradeLevel) => {
  setSelectedLevel(level);
  // 0.5초 후 자동으로 다음 단계로
  setTimeout(() => {
    onNext(level);
  }, 500);
};
```

### 3.2 데이터 모델

**UserProfile** (`types/user.ts`):
```typescript
export interface UserProfile {
  id: string;
  nickname: string;
  gradeLevel: GradeLevel; // ← 변경 대상
  preferredSubjects: Subject[];
  createdAt: Date;
  updatedAt: Date;

  // 선택사항
  learningGoals?: string;
  avatar?: string;
  email?: string;
  provider?: AuthProvider;
}
```

**현재 문제점**:
❌ `gradeLevelSetAt` 필드 없음 → 최초 설정 시점 추적 불가
❌ `gradeLevelHistory` 없음 → 변경 이력 추적 불가
❌ 변경 제한 메커니즘 없음 → 무제한 변경 가능

### 3.3 프로필 편집 UI

**EditableProfileSection** (`components/profile/EditableProfileSection.tsx`):
```typescript
// Line 131-163: Grade Level 편집
{isEditing ? (
  <div className="grid grid-cols-2 gap-2">
    {GRADE_LEVEL_OPTIONS.map((option) => (
      <button
        onClick={() => setGradeLevel(option.value)}
        // 클릭만으로 변경 가능 ← 문제
      />
    ))}
  </div>
) : (
  <p>{GRADE_LEVEL_OPTIONS.find(...)?.label}</p>
)}
```

**현재 문제점**:
❌ 일반 프로필 편집에서 자유롭게 변경 가능
❌ 변경 확인 절차 없음
❌ 변경 영향 안내 없음
❌ 1회 등록 강제 메커니즘 없음

### 3.4 사용자 프로필 관리

**user-profile.ts** (`lib/user/user-profile.ts`):
```typescript
// Line 103-117: 프로필 업데이트
export function updateUserProfile(
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): void {
  const current = getUserProfile();
  if (!current) return;

  const updated: UserProfile = {
    ...current,
    ...updates,
    updatedAt: new Date(), // ← gradeLevel 변경 이력 추적 없음
  };

  saveUserProfile(updated);
}
```

**현재 문제점**:
❌ gradeLevel 변경 시 특별 처리 없음
❌ 변경 이력 로깅 없음
❌ 변경 제한 검증 없음

---

## 4. 설계 옵션 비교

### Option A: 모달 기반 변경 플로우 ⭐ (권장)

#### 구조
```
Settings Page
├─ Learning Info Section
│  ├─ Current Grade: [초등학교 6학년] (Read-only)
│  └─ [학년 변경하기] Button
│     ↓ Click
│     Opens Modal
│     ├─ Warning Message
│     ├─ Grade Level Selector
│     ├─ [취소] [변경하기] Buttons
│     └─ Confirmation Modal (Double Check)
└─ Other Settings...
```

#### 장점
✅ 변경 전 명확한 안내
✅ 실수 방지 (2단계 확인)
✅ 기존 설정 페이지에 자연스럽게 통합
✅ 모바일 친화적
✅ 구현 복잡도 중간

#### 단점
⚠️ 모달 관리 복잡성
⚠️ 2단계 확인이 번거로울 수 있음

#### 비용 분석
- **개발 시간**: 4-6시간
- **파일 수정**: 5-7개
- **신규 컴포넌트**: 2개
- **API 엔드포인트**: 1개

---

### Option B: 전용 페이지 플로우

#### 구조
```
Settings Page
└─ [학년 변경하기] Link
   ↓ Navigate
   /settings/change-grade
   ├─ Warning Banner
   ├─ Current Grade Display
   ├─ New Grade Selector
   ├─ Impact Explanation
   └─ [취소] [변경하기] Buttons
```

#### 장점
✅ 중요한 변경임을 강조
✅ 상세한 설명 공간 확보
✅ 단계별 안내 가능
✅ 명확한 UX Flow

#### 단점
⚠️ 추가 페이지 생성 필요
⚠️ 간단한 변경에 과도할 수 있음
⚠️ 모바일에서 뒤로가기 처리 필요

#### 비용 분석
- **개발 시간**: 6-8시간
- **파일 수정**: 6-9개
- **신규 페이지**: 1개
- **신규 컴포넌트**: 3-4개
- **API 엔드포인트**: 1개

---

### Option C: In-Place 편집 + 확인

#### 구조
```
Profile Page
└─ Editable Profile Section
   └─ Grade Level
      ├─ [편집] Button
      │  ↓ Click
      │  Grade Selector appears
      │  ↓ Select
      │  Confirmation Modal
      └─ [저장]
```

#### 장점
✅ 최소 변경
✅ 기존 사용자 익숙한 UI
✅ 빠른 구현

#### 단점
❌ "1회 등록" 철학과 맞지 않음
❌ 너무 쉽게 변경 가능
❌ 전용 수정 메뉴 요구사항 미충족
❌ 변경 중요성 강조 부족

#### 비용 분석
- **개발 시간**: 2-3시간
- **파일 수정**: 2-3개
- **신규 컴포넌트**: 1개 (Modal)
- **API 엔드포인트**: 0개 (기존 활용)

---

### 4.4 옵션 비교 매트릭스

| 기준 | Option A (모달) | Option B (페이지) | Option C (In-Place) |
|------|----------------|------------------|---------------------|
| **요구사항 충족도** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **UX 품질** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **구현 난이도** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **유지보수성** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **모바일 최적화** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **변경 중요성 강조** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **개발 비용** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **총점** | **30/35** ⭐ | **29/35** | **23/35** |

**결론**: **Option A (모달 기반)** 채택
- 요구사항 완벽 충족
- UX/모바일 최적화 우수
- 구현 비용 합리적
- Khan Academy 등 업계 표준 패턴

---

## 5. 권장 솔루션 상세 설계

### 5.1 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐      ┌──────────────────────┐    │
│  │ Onboarding Flow │      │  Settings Page       │    │
│  │                 │      │                      │    │
│  │ GradeLevelStep  │      │  LearningInfoSection │    │
│  │  ↓              │      │   ↓                  │    │
│  │ setGradeLevel() │      │  GradeLevelChangeModal│   │
│  │  ↓              │      │   ↓                  │    │
│  │ completeOnboard()│     │  updateGradeLevel()  │    │
│  └─────────────────┘      └──────────────────────┘    │
│         │                           │                  │
│         └───────────┬───────────────┘                  │
│                     ↓                                  │
│         ┌────────────────────────┐                     │
│         │   useUserStore         │                     │
│         │   (Zustand State)      │                     │
│         └────────────────────────┘                     │
│                     │                                  │
│         ┌───────────┴────────────┐                     │
│         ↓                        ↓                     │
│  ┌─────────────┐       ┌──────────────────┐           │
│  │ LocalStorage│       │  API Routes      │           │
│  │             │       │                  │           │
│  │ user_profile│       │ /api/user/       │           │
│  │             │       │  grade-level     │           │
│  └─────────────┘       └──────────────────┘           │
│                                 │                      │
└─────────────────────────────────┼──────────────────────┘
                                  ↓
                   ┌──────────────────────────┐
                   │  Database (Optional)     │
                   │  - Redis (Session Data)  │
                   │  - Change History Log    │
                   └──────────────────────────┘
```

### 5.2 데이터 모델 확장

#### UserProfile 확장 (types/user.ts)

```typescript
export interface UserProfile {
  // 기존 필드
  id: string;
  nickname: string;
  gradeLevel: GradeLevel;
  preferredSubjects:  Subject[];
  createdAt: Date;
  updatedAt: Date;

  // 선택사항
  learningGoals?: string;
  avatar?: string;
  email?: string;
  provider?: AuthProvider;

  // ✨ 신규 필드 (학년 관리)
  gradeLevelSetAt: string; // ISO date - 최초 설정 시각
  gradeLevelLastChangedAt?: string; // ISO date - 마지막 변경 시각
  gradeLevelHistory?: GradeLevelChange[]; // 변경 이력
}

// ✨ 신규 타입: 학년 변경 이력
export interface GradeLevelChange {
  fromGrade: GradeLevel | null; // null = 최초 설정
  toGrade: GradeLevel;
  changedAt: string; // ISO date
  reason: 'initial_setup' | 'user_change' | 'admin_change';
  userAgent?: string; // 변경 시 브라우저 정보
}
```

#### API Request/Response 타입

```typescript
// POST /api/user/grade-level/update
export interface UpdateGradeLevelRequest {
  newGradeLevel: GradeLevel;
  reason?: string; // 선택적 변경 사유
}

export interface UpdateGradeLevelResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
  error?: string;
  canRetryAt?: string; // 24시간 제한 시 재시도 가능 시각
}

// GET /api/user/grade-level/change-eligibility
export interface GradeLevelChangeEligibility {
  canChange: boolean;
  reason?: 'rate_limited' | 'no_profile' | 'ok';
  lastChangedAt?: string;
  nextAvailableAt?: string; // 24시간 제한 해제 시각
}
```

### 5.3 컴포넌트 설계

#### A. Settings 페이지 구조

**파일**: `app/settings/page.tsx` (신규 또는 개선)

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import LearningInfoSection from '@/components/settings/LearningInfoSection';
import NotificationSection from '@/components/settings/NotificationSection';
import SecuritySection from '@/components/settings/SecuritySection';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold gradient-text mb-8">
          설정
        </h1>

        <div className="space-y-6">
          {/* 학습 정보 섹션 */}
          <LearningInfoSection />

          {/* 알림 설정 */}
          <NotificationSection />

          {/* 보안 설정 */}
          <SecuritySection />
        </div>
      </div>
    </div>
  );
}
```

#### B. LearningInfoSection 컴포넌트

**파일**: `components/settings/LearningInfoSection.tsx` (신규)

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Edit3 } from 'lucide-react';
import { getUserProfile } from '@/lib/user/user-profile';
import { GRADE_LEVEL_OPTIONS, SUBJECT_OPTIONS } from '@/types/user';
import GradeLevelChangeModal from './GradeLevelChangeModal';

export default function LearningInfoSection() {
  const profile = getUserProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!profile) return null;

  const gradeOption = GRADE_LEVEL_OPTIONS.find(
    opt => opt.value === profile.gradeLevel
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">학습 정보</h2>
            <p className="text-sm text-gray-600">현재 학년 및 선호 과목</p>
          </div>
        </div>
      </div>

      {/* 현재 학년 표시 (Read-only) */}
      <div className="space-y-4">
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-start space-x-3">
            <span className="text-3xl">{gradeOption?.emoji}</span>
            <div>
              <p className="text-sm font-medium text-gray-700">현재 학년</p>
              <p className="text-lg font-semibold text-gray-900">
                {gradeOption?.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {gradeOption?.description}
              </p>
              {profile.gradeLevelSetAt && (
                <p className="text-xs text-gray-400 mt-1">
                  설정일: {new Date(profile.gradeLevelSetAt).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          </div>

          {/* 변경 버튼 */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all"
          >
            <Edit3 className="w-4 h-4" />
            변경하기
          </button>
        </div>

        {/* 선호 과목 표시 (Read-only) */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-700 mb-2">선호 과목</p>
          <div className="flex gap-2">
            {profile.preferredSubjects.map((subject) => {
              const option = SUBJECT_OPTIONS.find(o => o.value === subject);
              return (
                <span
                  key={subject}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {option?.emoji} {option?.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 학년 변경 모달 */}
      <GradeLevelChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentGrade={profile.gradeLevel}
      />
    </motion.div>
  );
}
```

#### C. GradeLevelChangeModal 컴포넌트

**파일**: `components/settings/GradeLevelChangeModal.tsx` (신규)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { GRADE_LEVEL_OPTIONS, type GradeLevel } from '@/types/user';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentGrade: GradeLevel;
}

export default function GradeLevelChangeModal({ isOpen, onClose, currentGrade }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canChange, setCanChange] = useState(true);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null);

  // 변경 가능 여부 확인
  useEffect(() => {
    if (isOpen) {
      checkEligibility();
    }
  }, [isOpen]);

  const checkEligibility = async () => {
    try {
      const res = await fetch('/api/user/grade-level/change-eligibility');
      const data = await res.json();

      setCanChange(data.canChange);
      setNextAvailableAt(data.nextAvailableAt || null);

      if (!data.canChange && data.reason === 'rate_limited') {
        setError(`24시간 내 1회만 변경 가능합니다. 다음 변경 가능 시각: ${new Date(data.nextAvailableAt).toLocaleString('ko-KR')}`);
      }
    } catch (err) {
      console.error('변경 가능 여부 확인 실패:', err);
    }
  };

  const handleSelectGrade = (grade: GradeLevel) => {
    if (grade === currentGrade) {
      setError('현재 학년과 동일합니다.');
      return;
    }
    setSelectedGrade(grade);
    setError('');
  };

  const handleProceed = () => {
    if (!selectedGrade) {
      setError('새 학년을 선택해주세요.');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedGrade) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/grade-level/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newGradeLevel: selectedGrade,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '학년 변경에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      // 성공
      window.location.reload(); // 프로필 재로딩
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedGrade(null);
    setError('');
  };

  const handleClose = () => {
    if (!isLoading) {
      handleCancel();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {!showConfirm ? (
                // Step 1: 학년 선택
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">학년 변경</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        새로운 학년을 선택해주세요
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Warning */}
                  <div className="p-6 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">학년을 변경하면:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>추천 콘텐츠가 새 학년에 맞게 재설정됩니다</li>
                          <li>학습 통계와 성취 기록은 모두 유지됩니다</li>
                          <li>24시간 내 1회만 변경할 수 있습니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Current Grade */}
                  <div className="p-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">현재 학년</p>
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <span>{GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.emoji}</span>
                      <span>{GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.label}</span>
                    </div>
                  </div>

                  {/* Grade Selection */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">새 학년 선택</p>

                    {!canChange && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {GRADE_LEVEL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSelectGrade(option.value)}
                          disabled={!canChange || option.value === currentGrade}
                          className={`
                            p-4 rounded-xl border-2 transition-all text-left
                            ${selectedGrade === option.value
                              ? 'border-primary-600 bg-primary-50'
                              : option.value === currentGrade
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : !canChange
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{option.emoji}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {option.label}
                                {option.value === currentGrade && (
                                  <span className="ml-2 text-xs text-gray-500">(현재)</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">{option.description}</div>
                            </div>
                            {selectedGrade === option.value && (
                              <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {error && canChange && (
                      <p className="mt-4 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleProceed}
                      disabled={!selectedGrade || !canChange || isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </>
              ) : (
                // Step 2: 확인
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">변경 확인</h2>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Confirmation */}
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-amber-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      정말 학년을 변경하시겠습니까?
                    </h3>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">현재 학년</span>
                        <span className="font-semibold text-gray-900">
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.emoji}{' '}
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-center my-2">
                        <span className="text-2xl">→</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">새 학년</span>
                        <span className="font-semibold text-primary-600">
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === selectedGrade)?.emoji}{' '}
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === selectedGrade)?.label}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-600">
                      이 작업은 되돌릴 수 없으며, 24시간 동안 다시 변경할 수 없습니다.
                    </p>

                    {error && (
                      <p className="mt-4 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          변경 중...
                        </>
                      ) : (
                        '변경하기'
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### 5.4 API 엔드포인트

#### A. 변경 가능 여부 확인

**파일**: `app/api/user/grade-level/change-eligibility/route.ts` (신규)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserProfile } from '@/lib/user/user-profile';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { canChange: false, reason: 'unauthorized' },
        { status: 401 }
      );
    }

    const profile = getUserProfile();

    if (!profile) {
      return NextResponse.json(
        { canChange: false, reason: 'no_profile' },
        { status: 404 }
      );
    }

    // 24시간 제한 확인
    if (profile.gradeLevelLastChangedAt) {
      const lastChanged = new Date(profile.gradeLevelLastChangedAt);
      const now = new Date();
      const hoursSinceLastChange = (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastChange < 24) {
        const nextAvailableAt = new Date(lastChanged.getTime() + 24 * 60 * 60 * 1000);

        return NextResponse.json({
          canChange: false,
          reason: 'rate_limited',
          lastChangedAt: profile.gradeLevelLastChangedAt,
          nextAvailableAt: nextAvailableAt.toISOString(),
        });
      }
    }

    return NextResponse.json({
      canChange: true,
      reason: 'ok',
    });
  } catch (error) {
    console.error('[Grade Level API] Eligibility check failed:', error);
    return NextResponse.json(
      { canChange: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
```

#### B. 학년 변경

**파일**: `app/api/user/grade-level/update/route.ts` (신규)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserProfile, updateUserProfile } from '@/lib/user/user-profile';
import { GradeLevel, GRADE_LEVEL_OPTIONS } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newGradeLevel } = body as { newGradeLevel: GradeLevel };

    // 유효성 검사
    if (!newGradeLevel || !GRADE_LEVEL_OPTIONS.find(o => o.value === newGradeLevel)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 학년입니다.' },
        { status: 400 }
      );
    }

    const profile = getUserProfile();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 학년과 동일한지 확인
    if (profile.gradeLevel === newGradeLevel) {
      return NextResponse.json(
        { success: false, error: '현재 학년과 동일합니다.' },
        { status: 400 }
      );
    }

    // 24시간 제한 확인
    if (profile.gradeLevelLastChangedAt) {
      const lastChanged = new Date(profile.gradeLevelLastChangedAt);
      const now = new Date();
      const hoursSinceLastChange = (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastChange < 24) {
        const nextAvailableAt = new Date(lastChanged.getTime() + 24 * 60 * 60 * 1000);

        return NextResponse.json({
          success: false,
          error: '24시간 내 1회만 변경 가능합니다.',
          canRetryAt: nextAvailableAt.toISOString(),
        }, { status: 429 });
      }
    }

    // 변경 이력 생성
    const now = new Date().toISOString();
    const change: GradeLevelChange = {
      fromGrade: profile.gradeLevel,
      toGrade: newGradeLevel,
      changedAt: now,
      reason: 'user_change',
      userAgent: request.headers.get('user-agent') || undefined,
    };

    const newHistory = [
      ...(profile.gradeLevelHistory || []),
      change,
    ];

    // 프로필 업데이트
    updateUserProfile({
      gradeLevel: newGradeLevel,
      gradeLevelLastChangedAt: now,
      gradeLevelHistory: newHistory,
    });

    const updatedProfile = getUserProfile();

    return NextResponse.json({
      success: true,
      message: '학년이 성공적으로 변경되었습니다.',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('[Grade Level API] Update failed:', error);
    return NextResponse.json(
      { success: false, error: '학년 변경에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 5.5 UX 플로우

#### A. 첫 등록 (온보딩)

```
1. 사용자가 앱 첫 방문
   ↓
2. /onboarding/quick 리다이렉트
   ↓
3. Step 0: Welcome
   ↓
4. Step 1: Experience (Skip 가능)
   ↓
5. Step 2: Grade Level Selection ⭐
   - 4가지 학교급 중 선택
   - 선택 시 0.5초 후 자동 진행
   ↓
6. Step 3: Subject Selection
   ↓
7. Step 4: Nickname Input
   ↓
8. Step 5: Auth (Skip 가능)
   ↓
9. 온보딩 완료
   - createUserProfile() 호출
   - gradeLevelSetAt: 현재 시각 ⭐
   - gradeLevelHistory: [초기 설정] ⭐
   ↓
10. /dashboard로 리다이렉트
    - "언제든 설정에서 학년을 변경할 수 있습니다" 토스트
```

#### B. 학년 변경 (Settings)

```
1. 사용자가 /settings 방문
   ↓
2. "학습 정보" 섹션에서 현재 학년 확인
   - 현재 학년: 초등학교 6학년
   - 설정일: 2025-01-01
   - [변경하기] 버튼 표시
   ↓
3. [변경하기] 클릭
   ↓
4. GradeLevelChangeModal 오픈
   ↓
5. Step 1: 학년 선택
   - 경고 메시지 표시:
     "학년을 변경하면 추천 콘텐츠가 재설정됩니다"
   - 현재 학년 표시 (비활성화)
   - 4가지 학교급 선택 가능
   - 24시간 제한 확인 (canChange API 호출)
   ↓
6. 새 학년 선택
   ↓
7. [다음] 클릭
   ↓
8. Step 2: 확인
   - "정말 학년을 변경하시겠습니까?"
   - 현재 학년 → 새 학년 표시
   - "24시간 동안 다시 변경할 수 없습니다" 경고
   ↓
9. [변경하기] 클릭
   ↓
10. API 호출 (POST /api/user/grade-level/update)
    - 24시간 제한 재확인
    - 변경 이력 추가
    - gradeLevelLastChangedAt 업데이트
    ↓
11. 성공 시
    - 페이지 새로고침
    - "학년이 변경되었습니다" 토스트
    - 대시보드 콘텐츠 자동 재설정
```

---

## 6. 구현 계획

### 6.1 Phase 1: 데이터 모델 확장 (1-2시간)

#### Task 1.1: UserProfile 타입 확장
- [ ] `types/user.ts` 수정
- [ ] `gradeLevelSetAt` 필드 추가
- [ ] `gradeLevelLastChangedAt` 필드 추가
- [ ] `gradeLevelHistory` 필드 추가
- [ ] `GradeLevelChange` 타입 정의

#### Task 1.2: user-profile.ts 로직 업데이트
- [ ] `createUserProfile()` 수정: `gradeLevelSetAt` 초기화
- [ ] `updateUserProfile()` 수정: 이력 관리 로직 추가 (옵션)

#### Task 1.3: 기존 프로필 마이그레이션
- [ ] `gradeLevelSetAt` 없는 프로필 → `createdAt` 값으로 설정
- [ ] 초기 이력 생성

### 6.2 Phase 2: Settings 페이지 및 컴포넌트 (2-3시간)

#### Task 2.1: Settings 페이지 생성/개선
- [ ] `app/settings/page.tsx` 생성
- [ ] 레이아웃 구조 설정
- [ ] 섹션 배치

#### Task 2.2: LearningInfoSection 컴포넌트
- [ ] `components/settings/LearningInfoSection.tsx` 생성
- [ ] 현재 학년 표시 (Read-only)
- [ ] 선호 과목 표시
- [ ] [변경하기] 버튼
- [ ] 모달 연동

#### Task 2.3: GradeLevelChangeModal 컴포넌트
- [ ] `components/settings/GradeLevelChangeModal.tsx` 생성
- [ ] Step 1: 학년 선택 UI
- [ ] Step 2: 확인 UI
- [ ] 경고 메시지
- [ ] 로딩 상태 관리
- [ ] 에러 핸들링

### 6.3 Phase 3: API 엔드포인트 (1-2시간)

#### Task 3.1: 변경 가능 여부 확인 API
- [ ] `app/api/user/grade-level/change-eligibility/route.ts` 생성
- [ ] 24시간 제한 로직
- [ ] 응답 타입 정의

#### Task 3.2: 학년 변경 API
- [ ] `app/api/user/grade-level/update/route.ts` 생성
- [ ] 유효성 검사
- [ ] 24시간 제한 재확인
- [ ] 변경 이력 추가
- [ ] 프로필 업데이트

### 6.4 Phase 4: EditableProfileSection 수정 (30분-1시간)

#### Task 4.1: 학년 편집 제거
- [ ] `components/profile/EditableProfileSection.tsx` 수정
- [ ] Grade Level 편집 UI 제거 → Read-only로 변경
- [ ] "설정에서 변경하세요" 안내 추가
- [ ] Link to Settings 추가

### 6.5 Phase 5: 온보딩 개선 (30분)

#### Task 5.1: 온보딩 완료 시 gradeLevelSetAt 설정
- [ ] `lib/user/user-profile.ts` - `completeOnboarding()` 수정
- [ ] `gradeLevelSetAt` 현재 시각으로 설정
- [ ] 초기 이력 생성

#### Task 5.2: 온보딩 완료 후 안내
- [ ] "언제든 설정에서 학년을 변경할 수 있습니다" 토스트

### 6.6 Phase 6: Navigation 업데이트 (30분)

#### Task 6.1: Settings 링크 추가
- [ ] TopNavigation - ProfileDropdown에 Settings 링크 확인/추가
- [ ] Mobile Navigation에 Settings 링크 확인/추가

---

## 7. 기존 코드 변경 사항

### 7.1 파일별 변경 내역

#### A. types/user.ts
```typescript
// ✨ 신규 추가
export interface UserProfile {
  // ... 기존 필드

  // 학년 관리
  gradeLevelSetAt: string; // ✨ 신규
  gradeLevelLastChangedAt?: string; // ✨ 신규
  gradeLevelHistory?: GradeLevelChange[]; // ✨ 신규
}

// ✨ 신규 타입
export interface GradeLevelChange {
  fromGrade: GradeLevel | null;
  toGrade: GradeLevel;
  changedAt: string;
  reason: 'initial_setup' | 'user_change' | 'admin_change';
  userAgent?: string;
}
```

#### B. lib/user/user-profile.ts

**변경 전** (Line 21-42):
```typescript
export function createUserProfile(data: {
  nickname: string;
  gradeLevel: GradeLevel;
  preferredSubjects: Subject[];
  learningGoals?: string;
  email?: string;
  provider?: 'credentials' | 'google' | 'github' | 'guest';
}): UserProfile {
  const now = new Date();

  return {
    id: generateUserId(),
    nickname: data.nickname,
    gradeLevel: data.gradeLevel,
    preferredSubjects: data.preferredSubjects,
    createdAt: now,
    updatedAt: now,
    learningGoals: data.learningGoals,
    email: data.email,
    provider: data.provider || 'guest',
  };
}
```

**변경 후**:
```typescript
export function createUserProfile(data: {
  nickname: string;
  gradeLevel: GradeLevel;
  preferredSubjects: Subject[];
  learningGoals?: string;
  email?: string;
  provider?: 'credentials' | 'google' | 'github' | 'guest';
}): UserProfile {
  const now = new Date();
  const nowISO = now.toISOString();

  return {
    id: generateUserId(),
    nickname: data.nickname,
    gradeLevel: data.gradeLevel,
    preferredSubjects: data.preferredSubjects,
    createdAt: now,
    updatedAt: now,
    learningGoals: data.learningGoals,
    email: data.email,
    provider: data.provider || 'guest',

    // ✨ 학년 관리 필드
    gradeLevelSetAt: nowISO,
    gradeLevelHistory: [
      {
        fromGrade: null,
        toGrade: data.gradeLevel,
        changedAt: nowISO,
        reason: 'initial_setup',
      },
    ],
  };
}
```

#### C. components/profile/EditableProfileSection.tsx

**변경 전** (Line 131-163):
```typescript
{/* Grade Level */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    학교급
  </label>
  {isEditing ? (
    <div className="grid grid-cols-2 gap-2">
      {GRADE_LEVEL_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => setGradeLevel(option.value)}
          className={`p-3 rounded-lg border-2 transition-all ${
            gradeLevel === option.value
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          {/* ... */}
        </button>
      ))}
    </div>
  ) : (
    <p className="text-gray-900 font-semibold">
      {GRADE_LEVEL_OPTIONS.find((o) => o.value === profile.gradeLevel)?.label}
    </p>
  )}
</div>
```

**변경 후**:
```typescript
{/* Grade Level - Read-only with Settings link */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    학교급
  </label>
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-2">
      <span className="text-2xl">
        {GRADE_LEVEL_OPTIONS.find((o) => o.value === profile.gradeLevel)?.emoji}
      </span>
      <div>
        <p className="text-gray-900 font-semibold">
          {GRADE_LEVEL_OPTIONS.find((o) => o.value === profile.gradeLevel)?.label}
        </p>
        {profile.gradeLevelSetAt && (
          <p className="text-xs text-gray-500 mt-1">
            설정일: {new Date(profile.gradeLevelSetAt).toLocaleDateString('ko-KR')}
          </p>
        )}
      </div>
    </div>
    <Link
      href="/settings"
      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
    >
      변경하기 →
    </Link>
  </div>
  <p className="text-xs text-gray-500 mt-2">
    ℹ️ 학년은 설정 페이지에서 변경할 수 있습니다
  </p>
</div>
```

#### D. 신규 파일

**생성 필요**:
1. `app/settings/page.tsx` (신규)
2. `components/settings/LearningInfoSection.tsx` (신규)
3. `components/settings/GradeLevelChangeModal.tsx` (신규)
4. `components/settings/NotificationSection.tsx` (신규 또는 기존 활용)
5. `components/settings/SecuritySection.tsx` (신규 또는 기존 활용)
6. `app/api/user/grade-level/change-eligibility/route.ts` (신규)
7. `app/api/user/grade-level/update/route.ts` (신규)

### 7.2 비교표: 현재 vs 개선 후

| 항목 | 현재 | 개선 후 |
|------|------|---------|
| **학년 선택 위치** | 온보딩 + 프로필 편집 | 온보딩 + Settings 전용 |
| **프로필 편집에서 학년** | 자유 변경 가능 | Read-only (링크로 Settings 이동) |
| **변경 확인 절차** | 없음 | 2단계 확인 (선택 + 확인) |
| **변경 영향 안내** | 없음 | 명확한 경고 메시지 |
| **변경 제한** | 없음 | 24시간 내 1회 |
| **변경 이력 추적** | 없음 | gradeLevelHistory 배열 |
| **최초 설정 시각** | 없음 | gradeLevelSetAt |
| **마지막 변경 시각** | 없음 | gradeLevelLastChangedAt |
| **API 엔드포인트** | 없음 (기존 updateUserProfile) | 전용 API 2개 |
| **UX 패턴** | In-place editing | Modal-based flow |
| **모바일 최적화** | 보통 | 우수 (Modal) |
| **실수 방지** | 약함 | 강함 (2단계 + 제한) |

---

## 8. 테스트 계획

### 8.1 단위 테스트

#### A. 데이터 모델
```typescript
// createUserProfile 테스트
test('createUserProfile sets gradeLevelSetAt', () => {
  const profile = createUserProfile({
    nickname: 'Test',
    gradeLevel: 'elementary',
    preferredSubjects: ['english'],
  });

  expect(profile.gradeLevelSetAt).toBeDefined();
  expect(profile.gradeLevelHistory).toHaveLength(1);
  expect(profile.gradeLevelHistory[0].reason).toBe('initial_setup');
});
```

#### B. API 엔드포인트
```typescript
// 24시간 제한 테스트
test('Grade level change rate limit', async () => {
  // 1. 첫 변경 성공
  const res1 = await fetch('/api/user/grade-level/update', {
    method: 'POST',
    body: JSON.stringify({ newGradeLevel: 'middle' }),
  });
  expect(res1.status).toBe(200);

  // 2. 24시간 내 재변경 시도 → 429
  const res2 = await fetch('/api/user/grade-level/update', {
    method: 'POST',
    body: JSON.stringify({ newGradeLevel: 'high' }),
  });
  expect(res2.status).toBe(429);
});
```

### 8.2 통합 테스트

#### A. 온보딩 플로우
- [ ] 온보딩 완료 시 `gradeLevelSetAt` 설정 확인
- [ ] 초기 이력 생성 확인
- [ ] 대시보드로 리다이렉트 확인

#### B. Settings 학년 변경 플로우
- [ ] Settings 페이지 접근
- [ ] 현재 학년 표시 확인
- [ ] [변경하기] 버튼 클릭 → 모달 오픈
- [ ] 학년 선택 → [다음]
- [ ] 확인 화면 → [변경하기]
- [ ] 변경 성공 → 페이지 새로고침
- [ ] 새 학년 반영 확인

#### C. 24시간 제한
- [ ] 첫 변경 성공
- [ ] 24시간 내 재변경 시도 → 제한 메시지
- [ ] 24시간 경과 후 변경 성공

### 8.3 E2E 테스트 (Playwright)

```typescript
// e2e/grade-level-change.spec.ts
test('Complete grade level change flow', async ({ page }) => {
  // 1. 로그인
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. Settings 이동
  await page.goto('/settings');

  // 3. 현재 학년 확인
  const currentGrade = await page.locator('[data-testid="current-grade"]').textContent();
  expect(currentGrade).toContain('초등학생');

  // 4. 변경하기 클릭
  await page.click('[data-testid="change-grade-button"]');

  // 5. 모달 오픈 확인
  await expect(page.locator('[data-testid="grade-change-modal"]')).toBeVisible();

  // 6. 새 학년 선택
  await page.click('[data-testid="grade-option-middle"]');

  // 7. 다음 버튼
  await page.click('[data-testid="modal-next-button"]');

  // 8. 확인 화면
  await expect(page.locator('text=정말 학년을 변경하시겠습니까?')).toBeVisible();

  // 9. 변경하기
  await page.click('[data-testid="modal-confirm-button"]');

  // 10. 성공 확인
  await expect(page.locator('text=학년이 변경되었습니다')).toBeVisible();

  // 11. 새 학년 반영 확인
  const newGrade = await page.locator('[data-testid="current-grade"]').textContent();
  expect(newGrade).toContain('중학생');
});
```

### 8.4 수동 테스트 체크리스트

#### 온보딩
- [ ] 온보딩 시 학년 선택 동작
- [ ] 온보딩 완료 후 프로필 생성
- [ ] gradeLevelSetAt 설정 확인
- [ ] 대시보드 리다이렉트

#### Settings
- [ ] Settings 페이지 접근
- [ ] 현재 학년 Read-only 표시
- [ ] 설정일 표시
- [ ] [변경하기] 버튼 동작

#### 모달
- [ ] 모달 오픈 애니메이션
- [ ] 경고 메시지 표시
- [ ] 학년 선택 UI
- [ ] 현재 학년 비활성화
- [ ] [다음] 버튼 활성화/비활성화
- [ ] 확인 화면 표시
- [ ] [변경하기] 로딩 상태
- [ ] 에러 핸들링

#### 제한사항
- [ ] 24시간 내 재변경 시도 → 에러
- [ ] 에러 메시지에 재시도 가능 시각 표시
- [ ] 24시간 경과 후 변경 성공

#### 프로필 편집
- [ ] EditableProfileSection에서 학년 Read-only
- [ ] Settings 링크 동작
- [ ] 안내 메시지 표시

#### 모바일
- [ ] 모바일 화면에서 모달 레이아웃
- [ ] 터치 인터랙션
- [ ] 스크롤 동작
- [ ] 뒤로가기 처리

---

## 9. 요약 및 다음 단계

### 9.1 요약

이 계획서는 **학교급/학년 선택 프로세스 고도화**를 위한 종합 설계 문서입니다.

**핵심 개선 사항**:
1. ✅ 1회 등록 강제 메커니즘
2. ✅ Settings 페이지 전용 수정 메뉴
3. ✅ 2단계 확인 플로우
4. ✅ 24시간 내 1회 변경 제한
5. ✅ 변경 이력 추적
6. ✅ 명확한 영향 안내

**기술 스택**:
- Next.js 15 App Router
- Framer Motion (Modal 애니메이션)
- Zustand (상태 관리)
- NextAuth (인증)
- TailwindCSS (스타일링)

**예상 개발 시간**: 6-10시간
**파일 변경 수**: 7-10개
**신규 컴포넌트**: 3개
**신규 API**: 2개

### 9.2 다음 단계

사용자 승인 대기 중입니다. 승인 시 아래 순서로 진행합니다:

**Phase 1**: 데이터 모델 확장 (1-2시간)
**Phase 2**: Settings 페이지 및 컴포넌트 (2-3시간)
**Phase 3**: API 엔드포인트 (1-2시간)
**Phase 4**: EditableProfileSection 수정 (30분-1시간)
**Phase 5**: 온보딩 개선 (30분)
**Phase 6**: Navigation 업데이트 (30분)

**총 예상 시간**: 6-10시간

---

## 10. 참고 자료

### 10.1 벤치마킹 소스
- Khan Academy: https://www.khanacademy.org/
- Duolingo: https://www.duolingo.com/
- EdTech UX Best Practices 2024-2025
- Settings Editor Patterns: http://designinginterfaces.com/patterns/settings-editor/

### 10.2 기술 문서
- Next.js 15 App Router: https://nextjs.org/docs
- Framer Motion: https://www.framer.com/motion/
- Zustand: https://zustand-demo.pmnd.rs/
- TailwindCSS: https://tailwindcss.com/

---

**문서 버전**: 1.0
**최종 수정**: 2025-01-10
**작성자**: Claude (AI Assistant)
**승인**: 대기 중
