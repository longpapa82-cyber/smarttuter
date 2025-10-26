# Phase 8 계획 - 개인화 & 적응형 학습 시스템

**계획일**: 2025-10-26
**목표**: 세계 최고 수준의 적응형 학습 시스템 구현 (Khan Academy, Duolingo, Century Tech 수준)

---

## 🎯 핵심 목표

### 연구 기반 설계
**참고 시스템**:
- **Khan Academy Khanmigo**: GPT-4 기반 소크라테스식 튜터링, 120M 사용자 개인화
- **Duolingo Max**: 적응형 대화, 실시간 피드백, 레벨별 동적 조정
- **Century Tech**: 클릭/답변 단위 성과 분석, 동적 콘텐츠 조정
- **Squirrel AI**: 초세밀 지식 포인트 시스템, 고급 개인화 알고리즘

**검증된 성과**:
- 54% 테스트 점수 향상 (AI 학습 환경)
- 30% 학습 성과 개선
- 10배 참여도 증가
- 22% 졸업률 증가 (조지아주립대 사례)

---

## 📊 구현 기능

### 1. 적응형 난이도 조정 시스템

**알고리즘 설계** (연구 기반):
```typescript
interface DifficultyAdjustment {
  // 학습자 능력 평가
  studentAbility: {
    currentLevel: number;        // 1-10 스케일
    confidence: number;          // 0-1 확신도
    learningRate: number;        // 학습 속도
    retentionRate: number;       // 학습 유지율
  };

  // 콘텐츠 난이도 평가
  contentDifficulty: {
    baseLevel: number;           // 기본 난이도
    prerequisites: string[];     // 선행 학습 요구사항
    complexity: number;          // 복잡도 점수
  };

  // 실시간 조정 요인
  realtimeFactors: {
    responseTime: number;        // 응답 시간 (초)
    attempts: number;            // 시도 횟수
    hintRequests: number;        // 힌트 요청 수
    accuracy: number;            // 정확도 %
  };
}
```

**조정 로직**:
```typescript
// Century Tech 방식: 클릭/답변 단위 분석
function adjustDifficulty(studentData: StudentPerformance): DifficultyLevel {
  // 1. 최근 5개 세션 분석
  const recentPerformance = analyzeRecent5Sessions(studentData);

  // 2. 성공률 기반 조정
  if (recentPerformance.accuracy > 0.85) {
    // 너무 쉬움 → 난이도 상승
    return increaseDifficulty(currentLevel, 0.5);
  } else if (recentPerformance.accuracy < 0.60) {
    // 너무 어려움 → 난이도 하락
    return decreaseDifficulty(currentLevel, 0.5);
  }

  // 3. 학습 속도 고려
  if (recentPerformance.avgResponseTime < expectedTime * 0.7) {
    // 빠른 학습자 → 도전적 콘텐츠
    return increaseDifficulty(currentLevel, 0.3);
  }

  // 4. 최적 난이도 유지 (Flow Theory)
  return maintainOptimalChallenge(studentData);
}
```

**난이도 레벨 정의**:
```typescript
enum DifficultyLevel {
  BEGINNER = 1,      // 기초 (정확도 목표: 85-95%)
  ELEMENTARY = 2,    // 초급 (정확도 목표: 80-90%)
  INTERMEDIATE = 3,  // 중급 (정확도 목표: 75-85%)
  ADVANCED = 4,      // 고급 (정확도 목표: 70-80%)
  EXPERT = 5,        // 전문가 (정확도 목표: 65-75%)
}
```

**XP 배수 연동** (Phase 7 통합):
```typescript
const XP_MULTIPLIERS = {
  [DifficultyLevel.BEGINNER]: 1.0,
  [DifficultyLevel.ELEMENTARY]: 1.2,
  [DifficultyLevel.INTERMEDIATE]: 1.5,
  [DifficultyLevel.ADVANCED]: 2.0,
  [DifficultyLevel.EXPERT]: 2.5,
};
```

### 2. 학습 경로 추천 시스템

**지식 그래프 구조** (Squirrel AI 방식):
```typescript
interface KnowledgeGraph {
  subject: 'math' | 'english';
  gradeLevel: GradeLevel;

  // 지식 노드 (초세밀 분해)
  nodes: KnowledgeNode[];

  // 선행 관계
  prerequisites: Map<string, string[]>;

  // 학습 경로
  pathways: LearningPathway[];
}

interface KnowledgeNode {
  id: string;
  name: string;
  category: string;           // 예: "대수학 > 방정식 > 일차방정식"
  difficulty: DifficultyLevel;
  estimatedTime: number;      // 분
  masteryThreshold: number;   // 숙달 기준 (0-1)
}
```

**경로 생성 알고리즘**:
```typescript
function generateLearningPath(
  studentProfile: StudentProfile,
  targetGoal: string
): LearningPathway {
  // 1. 현재 숙달 상태 분석
  const masteredNodes = studentProfile.masteredKnowledge;
  const weakNodes = identifyWeaknesses(studentProfile);

  // 2. 목표까지의 최적 경로 계산 (Dijkstra 알고리즘)
  const path = findOptimalPath({
    start: masteredNodes,
    goal: targetGoal,
    constraints: {
      maxDifficulty: studentProfile.currentLevel + 1,
      maxTimePerSession: 30, // 분
      prioritizeWeaknesses: true,
    },
  });

  // 3. 선행 학습 검증
  const validPath = ensurePrerequisites(path, masteredNodes);

  // 4. 인지 부하 최소화 (연구 기반)
  const optimizedPath = minimizeCognitiveLoad(validPath);

  return {
    steps: optimizedPath,
    estimatedCompletion: calculateEstimatedTime(optimizedPath),
    milestones: identifyMilestones(optimizedPath),
  };
}
```

**추천 전략**:
```typescript
// Khan Academy 방식: 성과 기반 동적 조정
interface RecommendationStrategy {
  // 약점 우선 전략
  weaknessFirst: {
    weight: 0.4,
    logic: "정확도 < 70% 영역 우선 추천"
  };

  // 선행 학습 전략
  prerequisiteChain: {
    weight: 0.3,
    logic: "누락된 선행 지식 먼저 보완"
  };

  // 흥미 유지 전략
  engagementBoost: {
    weight: 0.2,
    logic: "성공 경험 제공 (쉬운 문제 섞기)"
  };

  // 도전 과제 전략
  challengeMode: {
    weight: 0.1,
    logic: "숙달 영역의 고급 문제"
  };
}
```

### 3. 약점 진단 시스템

**실시간 분석** (Century Tech 방식):
```typescript
interface WeaknessDiagnosis {
  // 지식 영역별 숙달도
  knowledgeMap: Map<string, MasteryLevel>;

  // 약점 카테고리
  weaknesses: Weakness[];

  // 학습 패턴 분석
  learningPatterns: {
    commonMistakes: MistakePattern[];
    strugglingConcepts: string[];
    timeBottlenecks: string[];
  };

  // 예측 분석
  predictions: {
    riskLevel: 'low' | 'medium' | 'high';
    interventionNeeded: boolean;
    recommendedActions: Action[];
  };
}

interface Weakness {
  knowledgeNodeId: string;
  severity: 'minor' | 'moderate' | 'critical';
  evidence: {
    attemptCount: number;
    successRate: number;
    avgTimeSpent: number;
    lastAttemptDate: Date;
  };
  rootCause: string;  // "선행 지식 부족" | "개념 오해" | "연습 부족"
  remediation: {
    recommendedContent: string[];
    estimatedTime: number;
    priority: number;
  };
}
```

**조기 경고 시스템** (조지아주립대 방식):
```typescript
// 800개 위험 요인 모니터링 (간소화 버전: 20개 핵심 요인)
function earlyWarningSystem(studentData: StudentProfile): Alert[] {
  const riskFactors = [
    // 참여도 요인
    { name: 'sessionFrequency', weight: 0.15 },
    { name: 'avgSessionDuration', weight: 0.10 },
    { name: 'streakBreaks', weight: 0.10 },

    // 성과 요인
    { name: 'accuracyTrend', weight: 0.20 },
    { name: 'difficultyProgression', weight: 0.15 },
    { name: 'xpGrowthRate', weight: 0.10 },

    // 행동 요인
    { name: 'hintDependency', weight: 0.10 },
    { name: 'skipRate', weight: 0.05 },
    { name: 'responseTimeVariance', weight: 0.05 },
  ];

  const totalRisk = calculateRiskScore(studentData, riskFactors);

  if (totalRisk > 0.7) {
    return [
      {
        severity: 'high',
        message: '학습 어려움이 감지되었습니다. 기초 복습을 추천합니다.',
        actions: ['reviewBasics', 'lowerDifficulty', 'provideHints'],
      },
    ];
  }

  return [];
}
```

### 4. 상세 진도 분석 대시보드

**분석 지표** (AI 교육 연구 기반):
```typescript
interface ProgressAnalytics {
  // 1. 숙달도 맵
  masteryMap: {
    subject: 'math' | 'english';
    categories: CategoryMastery[];
    overallMastery: number;  // 0-100%
    visualMap: HeatMapData;  // 시각화용
  };

  // 2. 학습 속도
  learningVelocity: {
    xpPerHour: number;
    conceptsPerWeek: number;
    difficultyGrowthRate: number;
    comparisonToPeers: number;  // 백분위
  };

  // 3. 강점/약점 분석
  strengthsWeaknesses: {
    topStrengths: KnowledgeNode[];
    criticalWeaknesses: Weakness[];
    improvementAreas: string[];
  };

  // 4. 예측 분석
  predictions: {
    nextMilestone: string;
    estimatedAchievementDate: Date;
    recommendedPace: 'slower' | 'maintain' | 'faster';
  };

  // 5. 시간 분석
  timeAnalytics: {
    totalLearningTime: number;  // 분
    avgSessionTime: number;
    mostProductiveTime: string;  // "아침" | "오후" | "저녁"
    efficiencyScore: number;  // 0-100
  };
}
```

**시각화 컴포넌트**:
```typescript
// Recharts 사용
const VISUALIZATIONS = [
  // 1. 숙달도 히트맵
  'MasteryHeatMap',           // 지식 영역별 색상 코딩

  // 2. 학습 속도 차트
  'LearningVelocityChart',    // 시간별 XP/숙달도 그래프

  // 3. 강점/약점 레이더
  'StrengthWeaknessRadar',    // 6각형 레이더 차트

  // 4. 예측 타임라인
  'MilestonePrediction',      // 목표 달성 예측 시각화

  // 5. 학습 패턴 캘린더
  'ActivityHeatmapCalendar',  // GitHub 스타일 캘린더
];
```

---

## 🏗️ 기술 아키텍처

### 데이터 모델
```typescript
// lib/adaptive-learning/types.ts
interface AdaptiveLearningProfile {
  userId: string;

  // 능력 평가
  currentAbility: {
    math: AbilityScore;
    english: AbilityScore;
  };

  // 학습 이력
  history: {
    sessions: SessionRecord[];
    performance: PerformanceMetrics[];
    interactions: InteractionLog[];
  };

  // 지식 상태
  knowledgeState: {
    masteredNodes: string[];
    inProgressNodes: string[];
    weakNodes: Weakness[];
  };

  // 학습 경로
  learningPath: {
    current: LearningPathway;
    recommended: LearningPathway[];
    completed: LearningPathway[];
  };

  // 진단 결과
  diagnosis: {
    lastUpdate: Date;
    weaknesses: Weakness[];
    alerts: Alert[];
    recommendations: Recommendation[];
  };
}
```

### Zustand Store 확장
```typescript
// lib/adaptive-learning/store.ts
interface AdaptiveLearningStore {
  profile: AdaptiveLearningProfile | null;

  // Actions
  initializeAdaptiveLearning(userId: string): void;
  recordInteraction(interaction: InteractionLog): void;
  updateKnowledgeState(nodeId: string, mastery: number): void;
  adjustDifficulty(): DifficultyLevel;
  generateLearningPath(goal?: string): LearningPathway;
  diagnoseWeaknesses(): Weakness[];
  getRecommendations(): Recommendation[];
  analyzeProgress(): ProgressAnalytics;
}
```

### AI 통합 (Anthropic API)
```typescript
// lib/adaptive-learning/ai-tutor.ts
interface AITutorConfig {
  mode: 'adaptive';
  difficulty: DifficultyLevel;
  focusAreas: string[];
  weaknesses: Weakness[];
  learningPath: LearningPathway;
}

async function getAdaptiveResponse(
  userMessage: string,
  config: AITutorConfig
): Promise<TutorResponse> {
  const systemPrompt = generateAdaptivePrompt(config);

  return await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });
}

function generateAdaptivePrompt(config: AITutorConfig): string {
  return `
당신은 적응형 학습 튜터입니다.

**학생 현황**:
- 현재 난이도: ${config.difficulty}
- 약점: ${config.weaknesses.map(w => w.knowledgeNodeId).join(', ')}
- 학습 경로: ${config.learningPath.steps.join(' → ')}

**튜터링 전략**:
1. 난이도 ${config.difficulty}에 맞춰 설명
2. 약점 영역은 더 자세히 설명
3. 소크라테스식 질문으로 유도 (Khan Academy 방식)
4. 즉각적이고 구체적인 피드백 (Duolingo 방식)
5. 학습 경로에 따라 다음 단계 안내

**금지사항**:
- 학생 수준보다 너무 어려운 용어 사용
- 정답 직접 제공 (힌트와 질문으로 유도)
- 약점 영역 무시
`;
}
```

---

## 📁 파일 구조

```
lib/adaptive-learning/
├── types.ts                    # 타입 정의
├── store.ts                    # Zustand store
├── difficulty-adjuster.ts      # 난이도 조정 로직
├── path-generator.ts           # 학습 경로 생성
├── weakness-analyzer.ts        # 약점 진단
├── progress-calculator.ts      # 진도 계산
├── knowledge-graph.ts          # 지식 그래프 데이터
└── ai-tutor.ts                 # AI 튜터 통합

components/adaptive-learning/
├── DifficultyIndicator.tsx     # 현재 난이도 표시
├── LearningPathView.tsx        # 학습 경로 시각화
├── WeaknessReport.tsx          # 약점 리포트
├── MasteryHeatMap.tsx          # 숙달도 히트맵
├── ProgressDashboard.tsx       # 종합 대시보드
└── RecommendationPanel.tsx     # 추천 패널

app/
├── analytics/
│   └── page.tsx                # 상세 분석 페이지
└── learning-path/
    └── page.tsx                # 학습 경로 페이지
```

---

## 🎯 성공 지표

### 기능 완성도
- [ ] 난이도 자동 조정 작동
- [ ] 학습 경로 생성 및 업데이트
- [ ] 약점 진단 및 추천
- [ ] 진도 분석 대시보드
- [ ] AI 튜터 통합 (적응형 프롬프트)

### 성능 지표
- [ ] 분석 응답 시간 < 500ms
- [ ] 경로 생성 시간 < 1s
- [ ] LocalStorage 저장 안정성
- [ ] 실시간 업데이트 작동

### 사용자 경험
- [ ] 난이도 조정이 자연스러움
- [ ] 추천이 정확하고 유용함
- [ ] 시각화가 직관적
- [ ] Phase 7 게이미피케이션과 통합

### 연구 검증
- [ ] 알고리즘이 연구 기반
- [ ] 세계 최고 시스템 패턴 적용
- [ ] 교육학 원리 준수 (Flow Theory, Zone of Proximal Development)

---

## 🔮 Phase 7 통합

### XP 시스템 연동
- 난이도 배수 적용 (Expert: 2.5배)
- 약점 극복 시 보너스 XP
- 학습 경로 완료 시 마일스톤 XP

### 배지 시스템 확장
- 🧠 "약점 정복자" (5개 약점 극복)
- 📈 "빠른 학습자" (평균 속도 상위 10%)
- 🎯 "목표 달성" (학습 경로 완료)

### 대시보드 통합
- 게이미피케이션 + 적응형 학습 통합 뷰
- 레벨업과 난이도 상승 연계
- 스트릭과 학습 경로 진행률 연계

---

## 📅 구현 단계

### Step 1: 데이터 모델 & Store (30분)
- 타입 정의
- Zustand store 설정
- LocalStorage 통합

### Step 2: 난이도 조정 시스템 (45분)
- 알고리즘 구현
- 성과 분석 로직
- AI 프롬프트 적응

### Step 3: 학습 경로 생성 (60분)
- 지식 그래프 구축 (영어/수학 기본)
- 경로 생성 알고리즘
- UI 시각화

### Step 4: 약점 진단 (45분)
- 분석 로직
- 조기 경고 시스템
- 추천 생성

### Step 5: 진도 대시보드 (60분)
- 차트 컴포넌트
- 히트맵 구현
- 종합 분석 페이지

### Step 6: 통합 & 테스트 (45분)
- Phase 7 연동
- AI 튜터 통합
- 빌드 & 배포

**총 예상 시간**: 4.5시간

---

**준비 완료! 구현을 시작하겠습니다.** 🚀
