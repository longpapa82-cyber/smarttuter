# Science/Social 학습 데이터 저장 구현 완료 (P2-1)

## 구현 개요
과학과 사회 과목에 대한 학습 데이터 저장 및 대시보드 연동을 완료했습니다. 영어/수학과 동일한 Redis 기반 데이터 저장 시스템을 적용하여 일관성 있는 학습 분석을 제공합니다.

**작업 날짜**: 2025-11-08
**작업 우선순위**: P2-1 (Low Priority)
**작업 상태**: ✅ 완료

---

## 1. 구현 내용

### 1.1 TypeScript 타입 정의 추가

**파일**: `/types/learning-stats.ts`

#### 과학 상세 통계 인터페이스
```typescript
export interface ScienceDetailedStats {
  lastSession: LastSession | null;
  nextTopic: string | null;
  gradeProgress: {
    level: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  concepts: {
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'not_started';
  }[];
  analysis: LearningAnalysis;
}
```

#### 사회 상세 통계 인터페이스
```typescript
export interface SocialDetailedStats {
  lastSession: LastSession | null;
  nextTopic: string | null;
  gradeProgress: {
    level: string;
    progress: number;
  } | null;
  monthlyHours: {
    current: number;
    target: number;
  };
  periods: {
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'not_started';
  }[];
  analysis: LearningAnalysis;
}
```

**차이점**:
- **과학**: `concepts[]` - 개념별 진행도 추적
- **사회**: `periods[]` - 시대별/지역별 진행도 추적

### 1.2 Learning Stats API 확장

**파일**: `/app/api/user/learning-stats/route.ts`

#### 과학 과목 상세 통계 (Lines 100-129)
```typescript
if (subject === 'science') {
  const learningKey = `user:${userId}:learning:science`;
  const learningData = await db.get(learningKey);
  const parsedData = learningData ? JSON.parse(learningData) : null;

  const scienceStats: ScienceDetailedStats = {
    lastSession: parsedData?.lastSession || null,
    nextTopic: parsedData?.nextTopic || null,
    gradeProgress: parsedData?.gradeProgress || null,
    monthlyHours: {
      current: Math.round((parsedData?.totalHours || 0) * 10) / 10,
      target: 12,
    },
    concepts: parsedData?.concepts || [],
    analysis: {
      strengths: parsedData?.strengths || [],
      weaknesses: parsedData?.weaknesses || [],
      aiRecommendation:
        parsedData?.totalSessions > 0
          ? '체계적인 학습으로 과학 개념이 향상되고 있습니다!'
          : '과학 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
    },
  };

  return NextResponse.json({ success: true, data: scienceStats });
}
```

#### 사회 과목 상세 통계 (Lines 131-160)
```typescript
if (subject === 'social' || subject === 'social-studies') {
  const learningKey = `user:${userId}:learning:social-studies`;
  const learningData = await db.get(learningKey);
  const parsedData = learningData ? JSON.parse(learningData) : null;

  const socialStats: SocialDetailedStats = {
    lastSession: parsedData?.lastSession || null,
    nextTopic: parsedData?.nextTopic || null,
    gradeProgress: parsedData?.gradeProgress || null,
    monthlyHours: {
      current: Math.round((parsedData?.totalHours || 0) * 10) / 10,
      target: 12,
    },
    periods: parsedData?.periods || [],
    analysis: {
      strengths: parsedData?.strengths || [],
      weaknesses: parsedData?.weaknesses || [],
      aiRecommendation:
        parsedData?.totalSessions > 0
          ? '지속적인 학습으로 사회 이해력이 향상되고 있습니다!'
          : '사회 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
    },
  };

  return NextResponse.json({ success: true, data: socialStats });
}
```

**주요 특징**:
- 월간 학습 목표: 12시간 (영어 20시간, 수학 15시간 대비)
- 과목별 특화된 AI 추천 메시지
- 과학/사회 모두 지원하는 query parameter (`subject=social` or `subject=social-studies`)

#### 전체 통계 업데이트 (Lines 239-290)

**변경 전**:
```typescript
science: {
  weeklyHours: 0,
  weeklyGoal: 10,
  hasData: false,
  gradeLevel: null,
  completedUnits: 0,
  totalUnits: 0,
  currentTopic: null,
}
```

**변경 후**:
```typescript
science: {
  weeklyHours: Math.round((scienceParsed?.totalHours || 0) * 10) / 10,
  weeklyGoal: 12,
  hasData: scienceParsed?.totalSessions > 0,
  gradeLevel: scienceParsed?.gradeLevel || null,
  completedUnits: scienceParsed?.concepts?.filter((c: any) => c.status === 'completed').length || 0,
  totalUnits: scienceParsed?.concepts?.length || 0,
  currentTopic: scienceParsed?.lastSession?.topic || null,
  detailed: {
    lastSession: scienceParsed?.lastSession || null,
    nextTopic: scienceParsed?.nextTopic || null,
    gradeProgress: scienceParsed?.gradeProgress || null,
    monthlyHours: {
      current: Math.round((scienceParsed?.totalHours || 0) * 10) / 10,
      target: 12
    },
    concepts: scienceParsed?.concepts || [],
    analysis: {
      strengths: scienceParsed?.strengths || [],
      weaknesses: scienceParsed?.weaknesses || [],
      aiRecommendation: scienceParsed?.totalSessions > 0
        ? '체계적인 학습으로 과학 개념이 향상되고 있습니다!'
        : '과학 튜터와 학습을 시작하여 진행도 분석을 받아보세요!',
    },
  }
}
```

**사회 과목도 동일한 패턴으로 업데이트** (periods 사용)

### 1.3 학습 세션 저장 로직 추가

**파일**: `/app/api/user/save-learning-session/route.ts`

#### 과학 과목 개념 진행도 업데이트 (Lines 137-167)
```typescript
if (sessionData.subject === 'science') {
  if (!learningStats.concepts) {
    learningStats.concepts = [];
  }

  sessionData.topicsDiscussed.forEach((topic) => {
    const existingConcept = learningStats.concepts.find(
      (c: any) => c.name === topic
    );

    if (existingConcept) {
      // 기존 개념 진행도 증가
      existingConcept.progress = Math.min(
        100,
        existingConcept.progress + sessionData.performance / 5
      );
      if (existingConcept.progress >= 100) {
        existingConcept.status = 'completed';
      }
    } else {
      // 새 개념 추가
      learningStats.concepts.push({
        name: topic,
        progress: Math.min(100, sessionData.performance / 2),
        status: sessionData.performance >= 80 ? 'completed' : 'in_progress',
      });
    }
  });
}
```

#### 사회 과목 시대/지역 진행도 업데이트 (Lines 169-199)
```typescript
if (sessionData.subject === 'social-studies') {
  if (!learningStats.periods) {
    learningStats.periods = [];
  }

  sessionData.topicsDiscussed.forEach((topic) => {
    const existingPeriod = learningStats.periods.find(
      (p: any) => p.name === topic
    );

    if (existingPeriod) {
      // 기존 시대/지역 진행도 증가
      existingPeriod.progress = Math.min(
        100,
        existingPeriod.progress + sessionData.performance / 5
      );
      if (existingPeriod.progress >= 100) {
        existingPeriod.status = 'completed';
      }
    } else {
      // 새 시대/지역 추가
      learningStats.periods.push({
        name: topic,
        progress: Math.min(100, sessionData.performance / 2),
        status: sessionData.performance >= 80 ? 'completed' : 'in_progress',
      });
    }
  });
}
```

**진행도 계산 로직**:
- 새 주제 추가 시: `performance / 2` (최대 50%)
- 기존 주제 업데이트: `+performance / 5` (최대 20% 증가)
- 100% 도달 시: `status = 'completed'`
- 성과 80% 이상 시: 즉시 `completed` 처리

---

## 2. 데이터 흐름

### 2.1 학습 데이터 저장 흐름

```
[과학/사회 튜터 세션]
         ↓
[LocalStorage에 임시 저장]
    (lib/utils/learningData.ts)
         ↓
[세션 종료 시 API 호출]
    POST /api/user/save-learning-session
         ↓
[Redis 저장]
    Key: user:{email}:learning:{science|social-studies}
         ↓
[통계 캐시 무효화]
    DEL user:{email}:learning-stats
```

### 2.2 대시보드 데이터 조회 흐름

```
[과학/사회 대시보드 페이지]
         ↓
[학습 통계 API 호출]
    GET /api/user/learning-stats?subject={science|social}
         ↓
[Redis 조회]
    Key: user:{email}:learning:{science|social-studies}
         ↓
[상세 통계 반환]
    - lastSession
    - monthlyHours
    - concepts/periods 진행도
    - 강점/약점 분석
    - AI 추천
```

---

## 3. Redis 데이터 스키마

### 3.1 과학 과목 데이터 구조

**Key**: `user:{email}:learning:science`

```json
{
  "totalHours": 2.5,
  "totalSessions": 3,
  "lastSession": {
    "topic": "광합성 원리",
    "date": "2025-11-08T10:30:00Z",
    "duration": 25
  },
  "completedTopics": ["광합성 원리", "세포 구조", "DNA 구조"],
  "concepts": [
    {
      "name": "광합성 원리",
      "progress": 85,
      "status": "completed"
    },
    {
      "name": "세포 호흡",
      "progress": 45,
      "status": "in_progress"
    }
  ],
  "strengths": ["생물학 개념 이해"],
  "weaknesses": ["화학 반응식"],
  "mastery": {},
  "nextTopic": "세포 호흡",
  "gradeProgress": {
    "level": "고등학교",
    "progress": 60
  }
}
```

### 3.2 사회 과목 데이터 구조

**Key**: `user:{email}:learning:social-studies`

```json
{
  "totalHours": 1.8,
  "totalSessions": 2,
  "lastSession": {
    "topic": "조선시대 문화",
    "date": "2025-11-08T11:00:00Z",
    "duration": 30
  },
  "completedTopics": ["조선시대 문화", "고려시대 정치"],
  "periods": [
    {
      "name": "조선시대 문화",
      "progress": 90,
      "status": "completed"
    },
    {
      "name": "근현대사",
      "progress": 35,
      "status": "in_progress"
    }
  ],
  "strengths": ["역사적 맥락 이해"],
  "weaknesses": ["지리적 요소"],
  "mastery": {},
  "nextTopic": "근현대사",
  "gradeProgress": {
    "level": "중학교",
    "progress": 55
  }
}
```

---

## 4. API 엔드포인트

### 4.1 학습 통계 조회

#### 과학 상세 통계
```bash
GET /api/user/learning-stats?subject=science
```

**Response**:
```json
{
  "success": true,
  "data": {
    "lastSession": {
      "topic": "광합성 원리",
      "date": "2025-11-08T10:30:00Z",
      "duration": 25
    },
    "nextTopic": "세포 호흡",
    "gradeProgress": {
      "level": "고등학교",
      "progress": 60
    },
    "monthlyHours": {
      "current": 2.5,
      "target": 12
    },
    "concepts": [
      {
        "name": "광합성 원리",
        "progress": 85,
        "status": "completed"
      }
    ],
    "analysis": {
      "strengths": ["생물학 개념 이해"],
      "weaknesses": ["화학 반응식"],
      "aiRecommendation": "체계적인 학습으로 과학 개념이 향상되고 있습니다!"
    }
  }
}
```

#### 사회 상세 통계
```bash
GET /api/user/learning-stats?subject=social
# 또는
GET /api/user/learning-stats?subject=social-studies
```

**Response**:
```json
{
  "success": true,
  "data": {
    "lastSession": {
      "topic": "조선시대 문화",
      "date": "2025-11-08T11:00:00Z",
      "duration": 30
    },
    "nextTopic": "근현대사",
    "gradeProgress": {
      "level": "중학교",
      "progress": 55
    },
    "monthlyHours": {
      "current": 1.8,
      "target": 12
    },
    "periods": [
      {
        "name": "조선시대 문화",
        "progress": 90,
        "status": "completed"
      }
    ],
    "analysis": {
      "strengths": ["역사적 맥락 이해"],
      "weaknesses": ["지리적 요소"],
      "aiRecommendation": "지속적인 학습으로 사회 이해력이 향상되고 있습니다!"
    }
  }
}
```

### 4.2 학습 세션 저장

```bash
POST /api/user/save-learning-session
Content-Type: application/json

{
  "subject": "science",  // 또는 "social-studies"
  "gradeLevel": "high",
  "duration": 25,
  "messageCount": 12,
  "topicsDiscussed": ["광합성 원리", "세포 호흡"],
  "performance": 75,
  "startTime": "2025-11-08T10:00:00Z",
  "endTime": "2025-11-08T10:25:00Z"
}
```

---

## 5. 대시보드 페이지 현황

### 5.1 현재 구현 상태

**과학 대시보드**: `/app/dashboard/science/page.tsx`
```typescript
export default function ScienceDashboardPage() {
  return <EmptySubjectDashboard subject="science" />;
}
```

**사회 대시보드**: `/app/dashboard/social/page.tsx`
```typescript
export default function SocialDashboardPage() {
  return <EmptySubjectDashboard subject="social" />;
}
```

### 5.2 EmptySubjectDashboard 컴포넌트

**파일**: `/components/dashboard/EmptySubjectDashboard.tsx`

**기능**:
- 학습 데이터가 없을 때 표시되는 안내 화면
- 과목별 맞춤 아이콘, 그라데이션, 설명
- 튜터 페이지로 이동하는 CTA 버튼
- Framer Motion 애니메이션 효과

**과학 과목 설정**:
```typescript
science: {
  name: '과학',
  icon: Beaker,
  gradient: 'from-green-500 via-emerald-600 to-teal-600',
  tutorPath: '/tutor/science',
  description: 'AI 튜터와 과학 학습을 시작하여',
  feature: '개념별 이해도 분석과 실험 추천',
}
```

**사회 과목 설정**:
```typescript
social: {
  name: '사회',
  icon: Globe,
  gradient: 'from-orange-500 via-amber-600 to-yellow-600',
  tutorPath: '/tutor/social-studies',
  description: 'AI 튜터와 사회 학습을 시작하여',
  feature: '시대별/지역별 학습 진행도 분석',
}
```

---

## 6. 구현 완료 항목

### ✅ 완료된 작업

1. **TypeScript 타입 정의**
   - `ScienceDetailedStats` 인터페이스 추가
   - `SocialDetailedStats` 인터페이스 추가
   - `ScienceStats.detailed` 속성 추가
   - `SocialStats.detailed` 속성 추가

2. **Learning Stats API 확장**
   - `GET /api/user/learning-stats?subject=science` 지원
   - `GET /api/user/learning-stats?subject=social` 지원
   - `GET /api/user/learning-stats?subject=social-studies` 지원
   - 전체 통계에 과학/사회 실제 데이터 반영

3. **Save Learning Session API 확장**
   - 과학 과목 `concepts[]` 진행도 업데이트 로직
   - 사회 과목 `periods[]` 진행도 업데이트 로직
   - 성과 기반 자동 상태 전환 (in_progress → completed)

4. **Redis 데이터 구조 설계**
   - `user:{email}:learning:science` 키 구조
   - `user:{email}:learning:social-studies` 키 구조
   - 과학: concepts 배열로 개념별 추적
   - 사회: periods 배열로 시대별 추적

5. **대시보드 인프라 준비**
   - EmptySubjectDashboard 컴포넌트 활용
   - 과학/사회 튜터 페이지 연결
   - 학습 시작 유도 UI 완비

---

## 7. 향후 개선 가능 영역

### 7.1 대시보드 실제 데이터 표시 (선택사항)

현재는 EmptySubjectDashboard만 표시하지만, 향후 실제 데이터가 있을 때:

```typescript
// 예시: ScienceDashboardPage
"use client";

import { useState, useEffect } from 'react';
import { ScienceTopicProgress } from '@/components/dashboard/ScienceTopicProgress';
import { EmptySubjectDashboard } from '@/components/dashboard/EmptySubjectDashboard';

export default function ScienceDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/learning-stats?subject=science')
      .then(res => res.json())
      .then(data => {
        setStats(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>로딩중...</div>;
  if (!stats || stats.concepts.length === 0) {
    return <EmptySubjectDashboard subject="science" />;
  }

  return <ScienceTopicProgress concepts={stats.concepts} />;
}
```

### 7.2 과목별 특화 컴포넌트 개발

**과학**:
- ScienceTopicProgress: MathTopicProgress 패턴 활용
- 개념별 마스터리 시각화 (물리/화학/생물/지구과학)

**사회**:
- SocialTopicProgress: 시대별/지역별 진행도
- 타임라인 시각화 (역사적 순서)

---

## 8. 테스트 시나리오

### 8.1 과학 튜터 학습 데이터 저장

1. 과학 튜터 페이지 접속: `http://localhost:3000/tutor/science`
2. 학습 세션 진행 (예: "광합성 원리"에 대해 질문)
3. 세션 종료
4. Redis 확인:
   ```bash
   redis-cli
   GET user:{email}:learning:science
   ```
5. 대시보드 확인: `http://localhost:3000/dashboard/science`
6. 전체 통계 확인: `GET /api/user/learning-stats`

**기대 결과**:
- Redis에 science 키 생성
- totalHours, totalSessions 증가
- concepts 배열에 "광합성 원리" 추가
- progress와 status 자동 계산

### 8.2 사회 튜터 학습 데이터 저장

1. 사회 튜터 페이지 접속: `http://localhost:3000/tutor/social-studies`
2. 학습 세션 진행 (예: "조선시대 문화"에 대해 질문)
3. 세션 종료
4. Redis 확인:
   ```bash
   redis-cli
   GET user:{email}:learning:social-studies
   ```
5. 대시보드 확인: `http://localhost:3000/dashboard/social`
6. 전체 통계 확인: `GET /api/user/learning-stats`

**기대 결과**:
- Redis에 social-studies 키 생성
- totalHours, totalSessions 증가
- periods 배열에 "조선시대 문화" 추가
- progress와 status 자동 계산

---

## 9. 영어/수학과의 비교

| 항목 | 영어 | 수학 | 과학 | 사회 |
|------|------|------|------|------|
| **주요 데이터 구조** | mastery (4대 영역) | chapters[] | concepts[] | periods[] |
| **진행도 단위** | listening, speaking, reading, writing | 단원별 챕터 | 개념별 | 시대별/지역별 |
| **월간 목표** | 20시간 | 15시간 | 12시간 | 12시간 |
| **특화 분석** | CEFR 레벨 | 챕터 완료율 | 개념 이해도 | 시대적 맥락 |
| **Redis Key** | learning:english | learning:math | learning:science | learning:social-studies |

**공통점**:
- totalHours, totalSessions 누적
- lastSession 저장
- strengths/weaknesses 분석
- AI 추천 메시지
- performance 기반 진행도 계산

**차이점**:
- 데이터 구조가 과목 특성에 맞게 설계됨
- 과학/사회는 목표 시간이 낮음 (부담 감소)
- 진행도 시각화 방식이 다름 (4대 영역 vs 챕터 vs 개념 vs 시대)

---

## 10. 결론

**P2-1 작업이 성공적으로 완료**되었습니다.

### 주요 성과

1. ✅ **일관성 있는 데이터 구조**: 영어/수학 패턴을 과학/사회에도 적용
2. ✅ **과목별 특화**: concepts (과학), periods (사회)로 맞춤 설계
3. ✅ **완전한 API 지원**: GET/POST 엔드포인트 모두 구현
4. ✅ **Redis 스키마 확립**: 명확한 키 구조와 데이터 형식
5. ✅ **확장 가능한 구조**: 향후 대시보드 실데이터 표시 준비 완료

### 남은 선택 작업 (P3)

1. **과학 대시보드 실데이터 표시**: ScienceTopicProgress 컴포넌트 개발
2. **사회 대시보드 실데이터 표시**: SocialTopicProgress 컴포넌트 개발
3. **타임라인 시각화**: 사회 과목 시대별 진행도 타임라인
4. **개념 맵 시각화**: 과학 과목 개념 간 연관성 표시

---

**작업 완료 시각**: 2025-11-08
**총 소요 시간**: 약 45분
**변경 파일 수**: 3개 (types, learning-stats API, save-session API)
**추가 코드 라인 수**: 약 200줄
