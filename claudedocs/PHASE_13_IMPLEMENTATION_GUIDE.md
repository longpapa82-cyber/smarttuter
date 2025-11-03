# Phase 13 구현 가이드

## 📖 목차
1. [온보딩 시스템 사용법](#온보딩-시스템-사용법)
2. [프로필 관리](#프로필-관리)
3. [추천 시스템 활용](#추천-시스템-활용)
4. [대시보드 컴포넌트](#대시보드-컴포넌트)
5. [Phase 14 통합 가이드](#phase-14-통합-가이드)

---

## 온보딩 시스템 사용법

### 기본 흐름

사용자가 `/onboarding` 페이지에 접속하면 6단계 온보딩 플로우가 시작됩니다:

```typescript
// app/onboarding/page.tsx
Step 0: WelcomeStep       → "시작하기" 클릭
Step 1: ExperienceStep    → 체험 또는 건너뛰기
Step 2: GradeLevelStep    → 학교급 선택 (자동 진행)
Step 3: SubjectStep       → 과목 선택 (복수)
Step 4: NicknameStep      → 닉네임 입력
Step 5: AuthStep          → 로그인 또는 게스트 모드

→ completeOnboarding() → /dashboard로 리디렉션
```

### 진행 상황 복구

새로고침해도 진행 상황이 유지됩니다:

```typescript
// LocalStorage: 'smarttutor_onboarding_progress'
{
  currentStep: 3,
  totalSteps: 6,
  completedSteps: [0, 1, 2],
  data: {
    gradeLevel: 'middle',
    preferredSubjects: ['english', 'math'],
    nickname: '학습왕'
  }
}
```

### 프로그램적 제어

```typescript
import {
  initializeOnboarding,
  advanceOnboardingStep,
  revertOnboardingStep,
  completeOnboarding,
  resetOnboarding
} from '@/lib/user/user-profile';

// 온보딩 초기화
const progress = initializeOnboarding();

// 다음 단계로 진행 (데이터 저장)
advanceOnboardingStep({ gradeLevel: 'middle' });

// 이전 단계로 되돌리기
revertOnboardingStep();

// 온보딩 완료 (프로필 생성)
completeOnboarding(); // → UserProfile 생성 및 저장

// 온보딩 리셋 (디버깅용)
resetOnboarding();
```

---

## 프로필 관리

### 프로필 생성 및 저장

```typescript
import { createUserProfile, saveUserProfile } from '@/lib/user/user-profile';

// 새 프로필 생성
const profile = createUserProfile({
  nickname: '학습왕',
  gradeLevel: 'middle',
  preferredSubjects: ['english', 'math'],
  learningGoals: '영어 회화 실력 향상',
  provider: 'guest'
});

// LocalStorage에 저장
saveUserProfile(profile);
```

### 프로필 조회 및 업데이트

```typescript
import { getUserProfile, updateUserProfile } from '@/lib/user/user-profile';

// 프로필 불러오기
const profile = getUserProfile();
if (profile) {
  console.log(`${profile.nickname}님 환영합니다!`);
}

// 프로필 업데이트
updateUserProfile({
  nickname: '수학천재',
  gradeLevel: 'high',
  preferredSubjects: ['math'],
  learningGoals: '수능 수학 만점 목표'
});
```

### 유효성 검사

```typescript
import { validateNickname } from '@/lib/user/user-profile';

const result = validateNickname('학습왕');
if (result.isValid) {
  console.log('✅ 유효한 닉네임');
} else {
  console.error('❌', result.error);
}

// 유효성 검사 규칙:
// - 길이: 2-20자
// - 허용 문자: 한글, 영문, 숫자, 언더스코어, 공백
// - 특수문자 제한
```

### 프로필 분석

```typescript
import {
  calculateProfileCompleteness,
  analyzeProfileForRecommendations
} from '@/lib/user/user-profile';

const profile = getUserProfile();

// 프로필 완성도 (0-100%)
const completeness = calculateProfileCompleteness(profile);
console.log(`프로필 완성도: ${completeness}%`);

// 추천 분석
const analysis = analyzeProfileForRecommendations(profile);
console.log('추천 과목:', analysis.recommendedSubject);
console.log('추천 난이도:', analysis.recommendedDifficulty);
console.log('추천 학습 영역:', analysis.recommendedFocus);

// 출력 예시:
// 추천 과목: 'english'
// 추천 난이도: 'intermediate'
// 추천 학습 영역: ['개념 이해', '문제 풀이', '실전 연습']
```

---

## 추천 시스템 활용

### 기본 사용법

```typescript
import {
  generateRecommendations,
  updateLearningActivity,
  type DashboardStats
} from '@/lib/recommendations/learning-recommendations';

// 학습 통계 준비
const stats: DashboardStats = {
  totalLearningTime: 750, // 분
  thisWeekTime: 120,
  averageScore: 85,
  reviewPendingCount: 5,
  lastLearningDate: new Date('2025-01-10'),
  consecutiveDays: 3
};

// 추천 항목 생성
const recommendations = generateRecommendations('user-123', stats);

// 추천 항목 표시
recommendations.forEach((rec) => {
  console.log(`${rec.icon} ${rec.title}`);
  console.log(`우선순위: ${rec.priority}`);
  console.log(`메시지: ${rec.message}`);
  if (rec.actionText) {
    console.log(`행동: ${rec.actionText} → ${rec.actionHref}`);
  }
});
```

### 학습 활동 추적

```typescript
import {
  updateLearningActivity,
  getLastLearningDate,
  getConsecutiveDays
} from '@/lib/recommendations/learning-recommendations';

// 튜터 페이지에서 학습 시작 시
function handleLearningStart(userId: string) {
  updateLearningActivity(userId);
  // → LocalStorage에 저장
  // → 연속 학습일 자동 계산
}

// 대시보드에서 통계 표시
function DashboardStats({ userId }: { userId: string }) {
  const lastDate = getLastLearningDate(userId);
  const consecutiveDays = getConsecutiveDays(userId);

  return (
    <div>
      <p>최근 학습: {lastDate?.toLocaleDateString()}</p>
      <p>연속 학습: {consecutiveDays}일 🔥</p>
    </div>
  );
}
```

### Phase 12 감정 분석 통합

```typescript
import {
  getEmotionBasedRecommendations
} from '@/lib/recommendations/learning-recommendations';

// 감정 기반 추천만 가져오기
const emotionRecs = getEmotionBasedRecommendations('user-123');

// 감정 패턴별 추천 예시:
// frustrated/anxious → 🧘 휴식 권장
// confused → 📚 개념 복습 추천
// bored → 🎮 게임형 학습 제안
// happy/excited → ✨ 격려 메시지
```

### 추천 항목 UI 구현 예시

```typescript
'use client';

import { useEffect, useState } from 'react';
import { generateRecommendations } from '@/lib/recommendations/learning-recommendations';

export function RecommendationsList({ userId, stats }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const recs = generateRecommendations(userId, stats);
    setRecommendations(recs);
  }, [userId, stats]);

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${
            rec.type === 'warning' ? 'bg-orange-50 border-orange-200' :
            rec.type === 'break' ? 'bg-blue-50 border-blue-200' :
            rec.type === 'encouragement' ? 'bg-green-50 border-green-200' :
            'bg-purple-50 border-purple-200'
          } border`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{rec.icon}</span>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{rec.title}</h4>
              <p className="text-sm text-gray-600">{rec.message}</p>
              {rec.actionText && (
                <a
                  href={rec.actionHref}
                  className="inline-block mt-2 text-sm font-medium text-purple-600 hover:text-purple-800"
                >
                  {rec.actionText} →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 대시보드 컴포넌트

### DashboardSection 사용법

```typescript
import DashboardSection from '@/components/dashboard/DashboardSection';

<DashboardSection
  title="학습 시작하기"
  subtitle="메인 학습 활동"
  icon="🚀"
>
  {/* 자식 컴포넌트 */}
</DashboardSection>
```

### ActionCard 사용법

```typescript
import ActionCard from '@/components/dashboard/ActionCard';

<ActionCard
  title="영어 튜터"
  description="AI와 함께하는 맞춤형 영어학습"
  icon="📚"
  gradient="from-blue-600 via-indigo-600 to-purple-600"
  ctaText="▶ 학습 시작"
  href="/tutor/english"
  badge={{
    text: '3일간 미접속',
    color: 'orange'
  }}
  stats={[
    { label: '총 학습 시간', value: '12시간 30분' },
    { label: '이번 주 학습', value: '0분' }
  ]}
/>
```

### AnalyticsCard 사용법

```typescript
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';

<AnalyticsCard
  title="학습 리포트"
  description="학습 통계 및 성과"
  icon="📈"
  gradient="from-green-500 to-emerald-600"
  href="/report"
  stats={[
    { label: '이번 주 학습', value: '5시간' },
    { label: '평균 점수', value: '85점' }
  ]}
  badge="NEW"
/>
```

### 프로필 편집 컴포넌트

```typescript
import EditableProfileSection from '@/components/profile/EditableProfileSection';

// 프로필 페이지에 추가
export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">프로필 설정</h1>
      <EditableProfileSection />
    </div>
  );
}
```

---

## Phase 14 통합 가이드

### 대시보드 페이지 통합

기존 `app/dashboard/page.tsx`에 Phase 13 컴포넌트 통합:

```typescript
'use client';

import { getUserProfile } from '@/lib/user/user-profile';
import { generateRecommendations, getConsecutiveDays } from '@/lib/recommendations/learning-recommendations';
import DashboardSection from '@/components/dashboard/DashboardSection';
import ActionCard from '@/components/dashboard/ActionCard';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';

export default function DashboardPage() {
  const profile = getUserProfile();
  const userId = profile?.id || 'guest';

  // 학습 통계 계산
  const stats = {
    totalLearningTime: 0, // TODO: 실제 데이터
    thisWeekTime: 0,
    averageScore: 0,
    reviewPendingCount: 0,
    lastLearningDate: null,
    consecutiveDays: getConsecutiveDays(userId)
  };

  // 추천 항목 생성
  const recommendations = generateRecommendations(userId, stats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 인사 */}
        <h1 className="text-4xl font-bold mb-2">
          안녕하세요, {profile?.nickname || '학습자'}님! 👋
        </h1>
        <p className="text-gray-600 mb-12">
          오늘도 함께 학습해볼까요?
        </p>

        {/* 섹션 1: 학습 시작하기 */}
        <DashboardSection title="학습 시작하기" icon="🚀">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              title="영어 튜터"
              description="AI와 함께하는 맞춤형 영어학습"
              icon="📚"
              gradient="from-blue-600 via-indigo-600 to-purple-600"
              ctaText="▶ 학습 시작"
              href="/tutor/english"
              stats={[
                { label: '총 학습 시간', value: '0분' },
                { label: '이번 주 학습', value: '0분' }
              ]}
            />
            <ActionCard
              title="수학 튜터"
              description="개념부터 문제풀이까지 완벽 학습"
              icon="🔢"
              gradient="from-purple-600 via-pink-600 to-rose-600"
              ctaText="▶ 학습 시작"
              href="/tutor/math"
              stats={[
                { label: '총 학습 시간', value: '0분' },
                { label: '이번 주 학습', value: '0분' }
              ]}
            />
          </div>
        </DashboardSection>

        {/* 섹션 2: 학습 현황 & 분석 */}
        <DashboardSection title="학습 현황 & 분석" icon="📊">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalyticsCard
              title="학습 리포트"
              description="학습 통계 및 성과"
              icon="📈"
              gradient="from-green-500 to-emerald-600"
              href="/report"
            />
            <AnalyticsCard
              title="복습 관리"
              description="복습 일정 및 관리"
              icon="🔄"
              gradient="from-orange-500 to-amber-600"
              href="/review"
            />
            <AnalyticsCard
              title="감정 분석"
              description="감정 분석 및 패턴"
              icon="🎭"
              gradient="from-purple-500 to-pink-500"
              href="/emotion-report"
              badge="Phase 12"
            />
          </div>
        </DashboardSection>

        {/* 섹션 3: 빠른 액세스 (추천 항목) */}
        <DashboardSection title="빠른 액세스" icon="⚡">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            {recommendations.length > 0 ? (
              <ul className="space-y-3">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{rec.title}</p>
                      <p className="text-sm text-gray-600">{rec.message}</p>
                    </div>
                    {rec.actionHref && (
                      <a
                        href={rec.actionHref}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">추천 항목이 없습니다.</p>
            )}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
```

### 온보딩 완료 후 대시보드 초기화

```typescript
// app/dashboard/page.tsx - useEffect 추가

useEffect(() => {
  // 온보딩 완료 데이터 확인
  const onboardingData = localStorage.getItem('onboarding_data');
  if (onboardingData) {
    const data = JSON.parse(onboardingData);
    console.log('온보딩 완료:', data);

    // 초기 학습 활동 기록
    updateLearningActivity(data.userId);

    // 온보딩 데이터 제거
    localStorage.removeItem('onboarding_data');
  }
}, []);
```

### 학습 페이지에서 활동 추적

```typescript
// app/tutor/[subject]/page.tsx

import { updateLearningActivity } from '@/lib/recommendations/learning-recommendations';
import { getUserProfile } from '@/lib/user/user-profile';

export default function TutorPage({ params }) {
  const profile = getUserProfile();

  useEffect(() => {
    if (profile) {
      // 학습 시작 시 활동 기록
      updateLearningActivity(profile.id);
    }
  }, [profile]);

  // ... 튜터 페이지 로직
}
```

---

## 디버깅 팁

### LocalStorage 확인

브라우저 개발자 도구 → Application → Local Storage:

```javascript
// 프로필 확인
localStorage.getItem('smarttutor_user_profile')

// 온보딩 진행 상황 확인
localStorage.getItem('smarttutor_onboarding_progress')

// 학습 활동 확인
localStorage.getItem('learning_activity_user-123')

// 감정 데이터 확인 (Phase 12)
localStorage.getItem('emotion_history_user-123')
```

### 프로필 리셋

```javascript
// 브라우저 콘솔에서 실행
localStorage.removeItem('smarttutor_user_profile');
localStorage.removeItem('smarttutor_onboarding_progress');
window.location.href = '/onboarding';
```

### 추천 시스템 테스트

```javascript
// 브라우저 콘솔에서 실행
const stats = {
  totalLearningTime: 750,
  thisWeekTime: 0,
  averageScore: 85,
  reviewPendingCount: 5,
  lastLearningDate: new Date(),
  consecutiveDays: 3
};

// 임시로 import 대신 전역 함수 사용
// (실제로는 모듈 import 필요)
console.log('추천 항목:', recommendations);
```

---

**문서 작성일**: 2025-01-XX
**버전**: 1.0
**관련 Phase**: Phase 13
**다음 단계**: Phase 14 (대시보드 완전 통합)
