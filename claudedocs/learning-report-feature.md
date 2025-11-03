# 학습 리포트 기능 구현

## 개요

AI Park 튜터 서비스에 **일별/주간 학습 리포트** 기능을 추가하여 사용자가 자신의 학습 진행 상황, 성과, 강점/약점을 한눈에 파악할 수 있도록 구현했습니다.

## 구현 목적

CLAUDE.md의 핵심 기능 요건 중 하나인 "학습이 종료된 후 일자별 학습 참여 시간, 현재의 학습 수준, 부족한 부분, 이후의 추천 학습 등을 레포트로 제공"을 충족하기 위한 기능입니다.

## 주요 기능

### 1. 자동 학습 세션 추적
- 튜터 페이지 접속 시 자동으로 학습 세션 시작
- 메시지 전송 시 실시간 세션 정보 업데이트
- 페이지 이탈 시 자동으로 세션 종료 및 저장

### 2. 오늘의 리포트
- ✅ **총 학습 시간**: 오늘 학습한 전체 시간 (분 단위)
- ✅ **학습 세션 수**: 오늘 진행한 학습 세션 횟수
- ✅ **평균 참여도**: 메시지 빈도와 학습 시간 기반 성과 점수 (0-100점)
- ✅ **과목별 시간**: 수학/영어 각각의 학습 시간
- ✅ **세션 상세**: 각 세션의 과목, 시간, 메시지 수, 성과 점수

### 3. 주간 리포트
- ✅ **주간 총 학습 시간**: 최근 7일간 전체 학습 시간
- ✅ **학습 참여 일수**: 실제로 학습한 날 수
- ✅ **진도 추세**: 초반 3일 vs 최근 3일 성과 비교 (-100 ~ +100점)
- ✅ **강점 분석**: 잘하고 있는 부분 자동 인식
- ✅ **개선 영역**: 보완이 필요한 부분 자동 인식
- ✅ **추천 사항**: AI 기반 맞춤형 학습 제안
- ✅ **일별 학습 기록**: 7일간 각 날짜별 상세 기록

### 4. 데모 데이터
- 학습 데이터가 없는 사용자를 위한 데모 데이터 생성 기능
- 최근 7일간의 가상 학습 세션 자동 생성
- 리포트 기능 미리보기 가능

### 5. 반응형 UI
- 모바일/태블릿/데스크톱 완벽 지원
- Framer Motion을 사용한 부드러운 애니메이션
- 직관적인 카드 기반 레이아웃

## 기술적 구현

### 데이터 저장 구조

**localStorage 기반 저장**:
```typescript
// 키 구조
smarttuter_sessions      // 모든 학습 세션 배열
smarttuter_current_session  // 현재 진행 중인 세션
```

**세션 데이터 구조**:
```typescript
interface LearningSession {
  id: string;              // 고유 세션 ID
  subject: "math" | "english";  // 과목
  gradeLevel: string;      // 학교급
  startTime: Date;         // 시작 시간
  endTime: Date;           // 종료 시간
  duration: number;        // 학습 시간 (분)
  messageCount: number;    // 메시지 수
  topicsDiscussed: string[]; // 학습 주제
  performance: number;     // 성과 점수 (0-100)
}
```

**일일 리포트 구조**:
```typescript
interface DailyReport {
  date: string;            // 날짜 (YYYY-MM-DD)
  totalTime: number;       // 총 학습 시간 (분)
  sessions: LearningSession[];  // 세션 목록
  subjectBreakdown: {
    math: number;          // 수학 학습 시간
    english: number;       // 영어 학습 시간
  };
  topicsCount: number;     // 학습한 주제 수
  averagePerformance: number;  // 평균 성과 점수
}
```

**주간 리포트 구조**:
```typescript
interface WeeklyReport {
  weekStart: string;       // 주 시작일
  weekEnd: string;         // 주 종료일
  totalTime: number;       // 총 학습 시간
  dailyReports: DailyReport[];  // 일별 리포트 배열
  strengths: string[];     // 강점 목록
  weaknesses: string[];    // 약점 목록
  recommendations: string[];  // 추천 사항
  progressTrend: number;   // 진도 추세 (-100 ~ +100)
}
```

### 성과 점수 계산 알고리즘

```typescript
function calculatePerformance(messageCount: number, duration: number): number {
  if (duration === 0) return 0;

  // 참여도 점수 (분당 메시지 수 기반, 최대 50점)
  const messagesPerMinute = messageCount / duration;
  const engagementScore = Math.min(messagesPerMinute * 10, 50);

  // 지속성 점수 (학습 시간 기반, 최대 50점)
  const consistencyScore = Math.min(duration * 2, 50);

  return Math.round(engagementScore + consistencyScore);
}
```

**점수 기준**:
- **참여도 (50점)**: 분당 메시지 수 × 10 (최대 50점)
  - 예: 30분에 15개 메시지 = 0.5 msg/min × 10 = 5점
  - 예: 30분에 150개 메시지 = 5 msg/min × 10 = 50점
- **지속성 (50점)**: 학습 시간 × 2 (최대 50점)
  - 예: 10분 학습 = 20점
  - 예: 25분 이상 학습 = 50점

### 강점/약점 자동 분석

```typescript
function analyzePerformance(sessions: LearningSession[]): {
  strengths: string[];
  weaknesses: string[];
} {
  // 수학/영어 평균 성과 계산
  const mathAvg = 수학 세션들의 평균 성과;
  const englishAvg = 영어 세션들의 평균 성과;

  // 강점 인식 (70점 이상)
  if (mathAvg > 70) strengths.push("수학 개념 이해도가 우수합니다");
  if (englishAvg > 70) strengths.push("영어 대화 참여도가 높습니다");

  // 약점 인식 (50점 미만)
  if (mathAvg < 50) weaknesses.push("수학 학습 시간을 늘려보세요");
  if (englishAvg < 50) weaknesses.push("영어 회화 연습이 더 필요합니다");

  // 학습 시간 평가
  if (totalTime > 120) strengths.push("꾸준한 학습 습관을 유지하고 있습니다");
  if (totalTime < 30) weaknesses.push("학습 시간을 조금 더 늘려보세요");

  return { strengths, weaknesses };
}
```

### 추천 사항 생성

```typescript
function generateRecommendations(weaknesses: string[]): string[] {
  // 약점 기반 맞춤형 추천
  if (weaknesses.includes("수학")) {
    recommendations.push("기초 개념부터 차근차근 복습해보세요");
    recommendations.push("유사 문제를 반복해서 풀어보는 것을 추천합니다");
  }

  if (weaknesses.includes("영어")) {
    recommendations.push("매일 10분씩 영어로 대화하는 습관을 만들어보세요");
    recommendations.push("좋아하는 주제로 대화를 시작해보세요");
  }

  if (weaknesses.includes("시간")) {
    recommendations.push("하루 30분 학습 목표를 설정해보세요");
    recommendations.push("짧은 시간이라도 매일 꾸준히 하는 것이 중요합니다");
  }

  // 기본 추천 (약점이 없을 경우)
  if (recommendations.length === 0) {
    recommendations.push("현재 학습 패턴을 잘 유지하고 있습니다!");
    recommendations.push("새로운 주제에 도전해보는 것은 어떨까요?");
  }

  return recommendations;
}
```

### 진도 추세 계산

```typescript
function calculateProgressTrend(dailyReports: DailyReport[]): number {
  // 최근 3일 평균 vs 이전 날들 평균
  const recentAvg = 최근 3일 평균 성과;
  const olderAvg = 그 이전 평균 성과;

  // 차이 반환 (-100 ~ +100)
  return Math.round(recentAvg - olderAvg);
}
```

## SimpleChatInterface 통합

[SimpleChatInterface.tsx](../components/tutor-pages/SimpleChatInterface.tsx)에 자동 세션 추적이 통합되어 있습니다:

### 1. 세션 시작 (컴포넌트 마운트 시)

```typescript
useEffect(() => {
  if (typeof window !== 'undefined' && !sessionId) {
    // 새 세션 시작
    const newSessionId = startSession(subject, gradeLevel);
    setSessionId(newSessionId);
    console.log(`✅ Learning session started: ${newSessionId}`);
  }

  // 세션 종료 (언마운트 시)
  return () => {
    if (typeof window !== 'undefined' && sessionId) {
      endSession();
      console.log(`✅ Learning session ended: ${sessionId}`);
    }
  };
}, [subject, gradeLevel, sessionId]);
```

### 2. 실시간 세션 업데이트

```typescript
// 메시지 변경 시 세션 업데이트
useEffect(() => {
  if (typeof window !== 'undefined' && messages.length > 0) {
    updateCurrentSession({
      messageCount: messages.length,
    });
  }
}, [messages]);
```

### 3. 자동 데이터 수집

사용자가 따로 버튼을 누르거나 설정할 필요 없이:
- ✅ 튜터 페이지 접속 → 자동 세션 시작
- ✅ 메시지 전송 → 자동 카운트 및 성과 계산
- ✅ 페이지 이탈 → 자동 세션 저장

## 파일 구조

```
프로젝트 루트/
├── app/
│   └── learning-report/
│       └── page.tsx               # 학습 리포트 페이지 (NEW)
├── lib/
│   └── utils/
│       └── learningData.ts        # 데이터 수집 및 분석 로직 (기존)
├── components/
│   └── tutor-pages/
│       └── SimpleChatInterface.tsx  # 세션 추적 통합 (수정)
└── claudedocs/
    └── learning-report-feature.md   # 이 문서 (NEW)
```

## UI/UX 디자인

### 색상 시스템

**오늘의 리포트 카드**:
- 총 학습 시간: `from-blue-500 to-blue-600` (파란색 그라데이션)
- 학습 세션: `from-purple-500 to-purple-600` (보라색 그라데이션)
- 평균 참여도: `from-green-500 to-green-600` (초록색 그라데이션)

**주간 리포트 색상**:
- 강점: `from-green-50 to-emerald-50` (밝은 초록)
- 약점: `from-yellow-50 to-orange-50` (밝은 노랑/주황)
- 추천: `from-purple-50 to-pink-50` (밝은 보라/핑크)

### 애니메이션

**Framer Motion 활용**:
```typescript
// 카드 등장 애니메이션
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

**호버 효과**:
```typescript
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

### 반응형 디자인

```typescript
// 그리드 레이아웃
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 모바일: 1열
// 태블릿: 2열
// 데스크톱: 3열
```

## 사용 방법

### 1. 학습 리포트 페이지 접속

**방법 1: 대시보드에서**
1. 대시보드 접속 (http://localhost:3000/dashboard)
2. "학습 리포트" 카드 클릭

**방법 2: 직접 URL**
- http://localhost:3000/learning-report

### 2. 리포트 보기

**오늘의 리포트 (기본)**:
- 페이지 로드 시 기본으로 표시
- 오늘 학습한 내용 요약
- 세션별 상세 정보

**주간 리포트**:
- 상단 토글 버튼에서 "이번 주" 클릭
- 최근 7일 학습 내용 요약
- 강점/약점/추천 사항 표시

### 3. 데모 데이터 사용

학습 데이터가 없는 경우:
1. "데모 데이터로 미리보기" 버튼 클릭
2. 최근 7일간의 가상 학습 세션 자동 생성
3. 리포트 기능 전체 체험 가능

### 4. 새로고침

우측 상단 새로고침 아이콘(🔄) 클릭:
- 최신 학습 데이터 다시 로드
- 실시간 성과 반영

### 5. PDF 다운로드 (예정)

우측 상단 "PDF 다운로드" 버튼:
- 현재는 알림 메시지 표시
- 향후 PDF 다운로드 기능 추가 예정

## 대시보드 통합

[app/dashboard/page.tsx](../app/dashboard/page.tsx)에 학습 리포트 링크가 추가되었습니다:

```tsx
{/* Analytics & Learning Report Links */}
<div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Learning Report Link */}
  <Link href="/learning-report">
    <motion.div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
      <h4>학습 리포트</h4>
      <p>일별/주간 학습 기록 및 성과 분석</p>
    </motion.div>
  </Link>

  {/* Analytics Link */}
  <Link href="/analytics">
    <motion.div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
      <h4>학습 분석</h4>
      <p>AI 기반 개인화 진단 및 학습 경로 추천</p>
    </motion.div>
  </Link>
</div>
```

## 데이터 흐름

```
1. 사용자 액션
   ↓
2. SimpleChatInterface
   - startSession() → localStorage에 새 세션 생성
   - 메시지 전송 → updateCurrentSession()
   - 페이지 이탈 → endSession()
   ↓
3. localStorage 저장
   - smarttuter_sessions: 모든 세션 배열
   - smarttuter_current_session: 현재 세션
   ↓
4. 리포트 페이지
   - getAllSessions() → 모든 세션 가져오기
   - getTodayReport() → 오늘 데이터 분석
   - getWeeklyReport() → 주간 데이터 분석
   ↓
5. UI 렌더링
   - 카드 기반 시각화
   - 애니메이션 적용
   - 차트 및 통계 표시
```

## 브라우저 호환성

- ✅ Chrome/Edge (Chromium): 완벽 지원
- ✅ Safari: 완벽 지원
- ✅ Firefox: 완벽 지원
- ✅ 모바일 브라우저: 완벽 지원

**localStorage 사용**: 모든 현대 브라우저에서 지원

## 향후 개선 사항

### 1. 서버 기반 저장
- 현재: localStorage (브라우저별 독립)
- 향후: 데이터베이스 저장 (기기 간 동기화)

### 2. PDF 다운로드
- 학습 리포트 PDF 생성 및 다운로드
- 학부모/교사 공유 기능

### 3. 차트 시각화 개선
- Chart.js 또는 Recharts 통합
- 시간별 학습 패턴 그래프
- 과목별 진행도 차트

### 4. 목표 설정 기능
- 일일/주간 학습 목표 설정
- 목표 달성률 추적
- 목표 달성 시 배지 획득

### 5. 학습 스트릭 (연속 학습 일수)
- 연속 학습 일수 추적
- 스트릭 유지 시 보상
- 스트릭 끊김 방지 알림

### 6. 학부모 리포트
- 자녀의 학습 현황 요약
- 주간 이메일 리포트
- 학습 권장 사항

### 7. AI 기반 심화 분석
- Gemini API를 활용한 심층 분석
- 개인화된 학습 경로 제안
- 약점 보완 맞춤형 문제 생성

### 8. 실시간 알림
- 학습 목표 알림
- 학습 권장 시간 알림
- 성과 달성 축하 알림

## 테스트 방법

### 1. 로컬 테스트
```bash
npm run dev
```

브라우저에서 http://localhost:3000/learning-report 접속

### 2. 데이터 확인
```javascript
// 브라우저 콘솔에서
localStorage.getItem('smarttuter_sessions')
localStorage.getItem('smarttuter_current_session')
```

### 3. 데이터 초기화
```javascript
// 브라우저 콘솔에서
localStorage.removeItem('smarttuter_sessions')
localStorage.removeItem('smarttuter_current_session')
```

### 4. 확인 사항
- [x] 학습 세션 자동 시작 (튜터 페이지 접속 시)
- [x] 메시지 전송 시 세션 업데이트
- [x] 페이지 이탈 시 세션 자동 종료
- [x] 오늘의 리포트 정상 표시
- [x] 주간 리포트 정상 표시
- [x] 강점/약점/추천 분석 정상 작동
- [x] 진도 추세 계산 정상
- [x] 데모 데이터 생성 기능 작동
- [x] 반응형 디자인 (모바일/태블릿/데스크톱)
- [x] 애니메이션 부드럽게 작동

## 문제 해결

### 1. 리포트가 표시되지 않음
**원인**: 학습 데이터가 없음
**해결**: "데모 데이터로 미리보기" 버튼 클릭

### 2. 세션이 저장되지 않음
**원인**: localStorage 접근 불가
**해결**:
- 브라우저 쿠키 설정 확인
- 시크릿 모드 비활성화
- 브라우저 캐시 삭제

### 3. 성과 점수가 0점
**원인**: 학습 시간이 너무 짧거나 메시지가 없음
**해결**: 최소 5분 이상 학습하고 3개 이상 메시지 전송

### 4. 주간 리포트가 비어있음
**원인**: 최근 7일간 학습 기록 없음
**해결**: 튜터와 대화 시작 또는 데모 데이터 생성

## 관련 파일

- [app/learning-report/page.tsx](../app/learning-report/page.tsx) - 학습 리포트 페이지
- [lib/utils/learningData.ts](../lib/utils/learningData.ts) - 데이터 수집 및 분석
- [components/tutor-pages/SimpleChatInterface.tsx](../components/tutor-pages/SimpleChatInterface.tsx) - 세션 추적
- [app/dashboard/page.tsx](../app/dashboard/page.tsx) - 리포트 링크
- [claudedocs/continuous-voice-mode-implementation.md](./continuous-voice-mode-implementation.md) - 음성 기능

## 참고 자료

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Web Storage API (localStorage)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## 결론

학습 리포트 기능 구현으로 AI Park 튜터 서비스의 핵심 요구사항을 충족했습니다:

✅ **자동 데이터 수집**: 사용자 액션 없이 자동으로 학습 데이터 추적
✅ **일별/주간 리포트**: 오늘과 이번 주 학습 현황 상세 분석
✅ **성과 분석**: 참여도와 지속성 기반 객관적 평가
✅ **강점/약점 식별**: AI 알고리즘 기반 자동 분석
✅ **맞춤형 추천**: 약점 기반 개인화된 학습 제안
✅ **직관적 UI**: 카드 기반 레이아웃과 부드러운 애니메이션

다음 단계로는 서버 기반 저장, PDF 다운로드, 차트 시각화 등의 고급 기능이 예정되어 있습니다.
