# 교과별 대시보드 더미 데이터 문제 분석

## 문제 요약

사용자가 교과별 대시보드(영어/수학)에서 실제 학습 데이터가 아닌 하드코딩된 더미 데이터가 표시된다고 보고함.

## 스크린샷 분석 결과

### 영어 대시보드에서 확인된 더미 데이터

1. **학습 진행도 섹션**
   - CEFR Level: "A2 → B1 진행 중" (42%)
   - 이번 달 학습 시간: "12시간 / 목표 20시간"
   - 완료한 주제: "15개"
   - 마스터한 문법: "현재시제", "과거시제", "현재진행형"

2. **영어 마스터리 섹션**
   - 듣기: 80%
   - 말하기: 60%
   - 읽기: 100%
   - 쓰기: 40%
   - 종합 점수: 70% (B+)

3. **보조 학습 카드**
   - 발음 연습: "Phase 10 🎤"
   - 단어 암기: "SM-2 알고리즘"
   - 문법 퀴즈: "AI 맞춤형"
   - 작문 연습: "5-10분 학습"

4. **강점과 약점 분석**
   - 강점: "듣기 이해력", "기본 문법", "단어 암기"
   - 약점: "발음 (R, TH)", "고급 어휘", "긴 문장 작문"

5. **AI 추천**
   - "발음 집중 연습 2주 과정을 추천합니다. R과 TH 발음을 마스터하면 말하기 점수가 크게 향상될 것입니다."

## 근본 원인 분석

### 1. 영어 대시보드 (app/dashboard/english/page.tsx)

#### 문제 코드 위치

**라인 19-30: 하드코딩된 useState 초기값**
```typescript
const [lastSession, setLastSession] = useState({
  topic: "Travel Conversation",
  date: "2024-01-15",
  duration: 15
});
const [nextTopic, setNextTopic] = useState("Ordering at a Restaurant");
const [cefrLevel, setCefrLevel] = useState({ current: "A2", target: "B1", progress: 42 });
const [monthlyHours, setMonthlyHours] = useState({ current: 12, target: 20 });
const [completedTopics, setCompletedTopics] = useState(15);
const [masteredGrammar, setMasteredGrammar] = useState([
  "현재시제", "과거시제", "현재진행형"
]);
```

**라인 33-38: 하드코딩된 마스터리 데이터**
```typescript
const [mastery, setMastery] = useState({
  listening: 80,
  speaking: 60,
  reading: 100,
  writing: 40
});
```

**라인 41-42: 하드코딩된 강점/약점**
```typescript
const strengths = ["듣기 이해력", "기본 문법", "단어 암기"];
const weaknesses = ["발음 (R, TH)", "고급 어휘", "긴 문장 작문"];
```

#### 문제점
- **API 호출 없음**: 실제 학습 데이터를 가져오는 로직이 전혀 없음
- **useState만 사용**: 컴포넌트 마운트 시 초기값이 그대로 화면에 표시됨
- **useEffect 없음**: 데이터 fetching 로직 자체가 존재하지 않음

### 2. 수학 대시보드 (app/dashboard/math/page.tsx)

#### 문제 코드 위치

**라인 19-26: 하드코딩된 useState 초기값**
```typescript
const [lastSession, setLastSession] = useState({
  topic: "이차방정식 풀이",
  date: "2024-01-15",
  duration: 20
});
const [nextTopic, setNextTopic] = useState("이차함수 그래프");
const [gradeProgress, setGradeProgress] = useState({ level: "중2 수학", progress: 68 });
const [monthlyHours, setMonthlyHours] = useState({ current: 8, target: 15 });
```

**라인 29-35: 하드코딩된 단원 진행도**
```typescript
const [chapters, setChapters] = useState([
  { name: "일차방정식", progress: 100, status: "completed" as const },
  { name: "일차함수", progress: 100, status: "completed" as const },
  { name: "이차방정식", progress: 65, status: "in_progress" as const },
  { name: "이차함수", progress: 0, status: "not_started" as const },
  { name: "통계", progress: 0, status: "not_started" as const },
]);
```

**라인 38-39: 하드코딩된 강점/약점**
```typescript
const strengths = ["계산 능력", "기본 개념 이해", "공식 암기"];
const weaknesses = ["복잡한 응용문제", "기하학적 직관", "문제 해석"];
```

#### 문제점
- 영어 대시보드와 동일한 패턴의 문제
- 실제 학습 데이터 대신 하드코딩된 값만 표시

### 3. 과학/사회 대시보드

**파일 미존재**:
- `app/dashboard/science/page.tsx` - 없음
- `app/dashboard/social/page.tsx` - 없음

메인 대시보드([app/dashboard/page.tsx](app/dashboard/page.tsx))에서 과학/사회 카드가 링크되어 있으나 실제 페이지가 구현되지 않음.

## 메인 대시보드 vs 교과별 대시보드 비교

| 항목 | 메인 대시보드 | 교과별 대시보드 |
|------|--------------|----------------|
| **API 연동** | ✅ `/api/user/learning-stats` 사용 | ❌ API 호출 없음 |
| **데이터 소스** | ✅ 실시간 API 데이터 | ❌ 하드코딩된 초기값 |
| **Empty State** | ✅ EmptyLearningCard 컴포넌트 | ❌ 처리 없음 |
| **Auto-refresh** | ✅ 60초마다 갱신 | ❌ 갱신 로직 없음 |
| **사용자별 데이터** | ✅ 세션 기반 조회 | ❌ 모든 사용자 동일 |

## 우선순위별 수정 계획

### 🔴 Critical (즉시 수정 필요)

#### 1. 영어 대시보드 API 연동
- **파일**: `app/dashboard/english/page.tsx`
- **작업**:
  - `/api/user/learning-stats` API에서 영어 학습 데이터 가져오기
  - useEffect로 데이터 fetching 로직 추가
  - 로딩 상태 관리 추가
  - Empty state 처리 (학습 데이터 없을 때)

#### 2. 수학 대시보드 API 연동
- **파일**: `app/dashboard/math/page.tsx`
- **작업**:
  - `/api/user/learning-stats` API에서 수학 학습 데이터 가져오기
  - useEffect로 데이터 fetching 로직 추가
  - 로딩 상태 관리 추가
  - Empty state 처리 (학습 데이터 없을 때)

#### 3. API 확장 - 교과별 상세 데이터 지원
- **파일**: `app/api/user/learning-stats/route.ts`
- **작업**:
  - 영어 상세 데이터 구조 추가 (CEFR level, skills, topics, grammar)
  - 수학 상세 데이터 구조 추가 (chapters, topics, mastery)
  - 강점/약점 분석 데이터 추가
  - AI 추천 로직 추가

### 🟡 High (중요)

#### 4. 타입 정의 확장
- **파일**: `types/learning-stats.ts`
- **작업**:
  - 영어 상세 타입 추가:
    ```typescript
    interface EnglishDetailedStats {
      cefrLevel: { current: string; target: string; progress: number };
      monthlyHours: { current: number; target: number };
      completedTopics: number;
      masteredGrammar: string[];
      mastery: {
        listening: number;
        speaking: number;
        reading: number;
        writing: number;
      };
      strengths: string[];
      weaknesses: string[];
      aiRecommendation: string;
    }
    ```
  - 수학 상세 타입 추가:
    ```typescript
    interface MathDetailedStats {
      gradeProgress: { level: string; progress: number };
      monthlyHours: { current: number; target: number };
      chapters: Array<{
        name: string;
        progress: number;
        status: 'completed' | 'in_progress' | 'not_started';
      }>;
      strengths: string[];
      weaknesses: string[];
      aiRecommendation: string;
    }
    ```

#### 5. Empty State 컴포넌트 생성
- **파일**: `components/dashboard/EmptySubjectDashboard.tsx` (신규)
- **작업**:
  - 교과별 대시보드용 Empty State UI
  - "아직 학습 기록이 없습니다" 메시지
  - 튜터 시작하기 CTA 버튼

### 🟢 Medium (개선)

#### 6. 과학 대시보드 생성
- **파일**: `app/dashboard/science/page.tsx` (신규)
- **작업**:
  - 수학 대시보드와 유사한 구조
  - API 연동
  - Empty state 처리

#### 7. 사회 대시보드 생성
- **파일**: `app/dashboard/social/page.tsx` (신규)
- **작업**:
  - 수학 대시보드와 유사한 구조
  - API 연동
  - Empty state 처리

#### 8. Auto-refresh 기능 추가
- **작업**: 모든 교과별 대시보드에 60초 자동 갱신 추가
- **패턴**: 메인 대시보드와 동일

## 기술적 구현 세부사항

### API 응답 구조 (확장)

```typescript
// GET /api/user/learning-stats?subject=english
{
  success: true,
  data: {
    // 기본 통계 (기존)
    weeklyHours: 12,
    weeklyGoal: 20,
    hasData: true,

    // 영어 상세 통계 (신규)
    detailed: {
      cefrLevel: {
        current: "A2",
        target: "B1",
        progress: 42
      },
      lastSession: {
        topic: "Travel Conversation",
        date: "2024-01-15",
        duration: 15
      },
      nextTopic: "Ordering at a Restaurant",
      completedTopics: 15,
      masteredGrammar: ["현재시제", "과거시제", "현재진행형"],
      skills: {
        listening: 80,
        speaking: 60,
        reading: 100,
        writing: 40
      },
      strengths: ["듣기 이해력", "기본 문법", "단어 암기"],
      weaknesses: ["발음 (R, TH)", "고급 어휘", "긴 문장 작문"],
      aiRecommendation: "발음 집중 연습 2주 과정을 추천합니다..."
    }
  }
}
```

### 컴포넌트 로직 패턴

```typescript
// app/dashboard/english/page.tsx (수정 후)
function EnglishDashboardContent() {
  const [stats, setStats] = useState<EnglishDetailedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/user/learning-stats?subject=english');
        const result = await response.json();

        if (result.success && result.data?.detailed) {
          setStats(result.data.detailed);
        } else {
          setStats(null); // Empty state
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) return <LoadingSpinner />;

  // Empty state
  if (!stats) return <EmptySubjectDashboard subject="english" />;

  // Real data display
  return <div>...</div>;
}
```

## 예상 작업 시간

- Critical 작업: 2-3시간
- High 작업: 1-2시간
- Medium 작업: 2-3시간
- **총 예상 시간**: 5-8시간

## 위험도 평가

| 위험 요소 | 확률 | 영향 | 완화 방안 |
|----------|------|------|----------|
| API 응답 지연 | 중간 | 높음 | 로딩 스피너, 타임아웃 처리 |
| 데이터 불일치 | 낮음 | 중간 | 타입 검증, 기본값 설정 |
| 빈 데이터 처리 | 높음 | 낮음 | Empty state 컴포넌트 |
| 기존 코드 충돌 | 낮음 | 낮음 | 점진적 마이그레이션 |

## 성공 기준

1. ✅ 신규 사용자(학습 기록 없음) → Empty state 표시
2. ✅ 기존 사용자(학습 기록 있음) → 실제 데이터 표시
3. ✅ 모든 하드코딩된 값 제거
4. ✅ API 기반 동적 데이터 로딩
5. ✅ 60초 자동 갱신 작동
6. ✅ 로딩 상태 적절히 표시
7. ✅ 에러 발생 시 Graceful degradation

## 다음 단계

수정 계획 승인 후:
1. Critical 작업부터 순차적으로 진행
2. 각 단계마다 테스트 및 검증
3. 완료 후 통합 테스트
4. 문서 업데이트

---

**작성일**: 2025-11-08
**작성자**: Claude Code
**상태**: 분석 완료, 수정 대기
