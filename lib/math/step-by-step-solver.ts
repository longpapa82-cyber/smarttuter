/**
 * Step-by-Step Math Solver
 *
 * Khan Academy-style guided problem solving system
 * - Breaks down problems into manageable steps
 * - Provides hints and guidance
 * - Tracks student progress
 * - Validates answers at each step
 *
 * Features:
 * - AI-powered problem analysis (Gemini 2.0 Flash)
 * - Adaptive difficulty
 * - Personalized feedback
 * - Progress tracking
 */

export interface Step {
  stepNumber: number;
  instruction: string;        // "먼저 양변에서 5를 빼보세요"
  explanation?: string;        // 왜 이 단계가 필요한지
  hint?: string;               // 추가 힌트 (학생이 요청하면 표시)
  example?: string;            // 예시
  expectedAnswer?: string;     // 이 단계의 예상 답
  validationPattern?: string;  // 정규식 패턴
  completed: boolean;
  studentAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface StepByStepSession {
  id: string;
  problem: string;
  problemType: 'equation' | 'word-problem' | 'geometry' | 'calculus' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  steps: Step[];
  currentStepIndex: number;
  completed: boolean;
  score: number;              // 정답률 (0-100)
  hintsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepValidationResult {
  isCorrect: boolean;
  feedback: string;
  suggestion?: string;
  correctAnswer?: string;
}

/**
 * AI 프롬프트: 문제를 단계별로 분석
 */
export function generateStepByStepPrompt(problem: string, gradeLevel?: string): string {
  return `당신은 친절한 수학 튜터입니다. 다음 수학 문제를 단계별로 풀이하는 가이드를 만들어주세요.

문제: ${problem}
학년: ${gradeLevel || '중학교'}

다음 형식으로 JSON을 반환해주세요:

{
  "problemType": "equation" | "word-problem" | "geometry" | "calculus" | "other",
  "difficulty": "easy" | "medium" | "hard",
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "첫 번째로 해야 할 일 (학생에게 질문하듯이)",
      "explanation": "왜 이 단계가 필요한지 간단히 설명",
      "hint": "막힐 때 줄 수 있는 힌트",
      "example": "비슷한 예시 (선택)",
      "expectedAnswer": "이 단계의 예상 답"
    }
  ],
  "finalAnswer": "최종 답"
}

중요:
1. 각 단계는 학생이 스스로 생각할 수 있도록 질문 형태로 작성
2. 너무 많은 단계로 쪼개지 말고, 의미 있는 단위로 구성 (3-7단계)
3. 각 단계마다 학생이 무엇을 해야 하는지 명확히 제시
4. 힌트는 답을 직접 알려주지 않고, 생각할 방향만 제시
5. ${gradeLevel} 학생 수준에 맞는 용어와 설명 사용

JSON만 반환하고 다른 텍스트는 포함하지 마세요.`;
}

/**
 * AI 프롬프트: 학생 답변 검증
 */
export function generateValidationPrompt(
  problem: string,
  step: Step,
  studentAnswer: string
): string {
  return `당신은 수학 선생님입니다. 학생의 답을 평가해주세요.

문제: ${problem}
현재 단계: ${step.instruction}
예상 답: ${step.expectedAnswer}
학생 답변: ${studentAnswer}

다음 형식으로 JSON을 반환해주세요:

{
  "isCorrect": true | false,
  "feedback": "학생에게 줄 피드백 (격려 또는 교정)",
  "suggestion": "틀렸을 경우, 어떻게 접근해야 하는지 힌트",
  "correctAnswer": "틀렸을 경우에만, 정답"
}

평가 기준:
1. 수학적으로 동등한 답은 모두 정답 처리 (예: "x=3"과 "3"은 같음)
2. 사소한 표기 실수는 관대하게 처리
3. 피드백은 항상 긍정적이고 격려하는 톤으로
4. 틀렸을 때는 왜 틀렸는지 설명하되, 답을 직접 알려주지는 않음

JSON만 반환하고 다른 텍스트는 포함하지 마세요.`;
}

/**
 * AI 프롬프트: 추가 힌트 생성
 */
export function generateHintPrompt(
  problem: string,
  step: Step,
  studentAttempts: string[]
): string {
  return `학생이 다음 단계에서 막혔습니다. 추가 힌트를 제공해주세요.

문제: ${problem}
현재 단계: ${step.instruction}
기본 힌트: ${step.hint || '없음'}
학생의 시도: ${studentAttempts.join(', ')}

더 구체적이지만 답을 직접 알려주지 않는 힌트를 제공해주세요.
학생이 스스로 답을 찾을 수 있도록 방향만 제시하세요.

힌트만 반환하고 다른 텍스트는 포함하지 마세요.`;
}

/**
 * 세션 생성
 */
export function createStepByStepSession(
  problem: string,
  steps: Omit<Step, 'completed' | 'studentAnswer' | 'isCorrect' | 'feedback'>[],
  problemType: StepByStepSession['problemType'] = 'other',
  difficulty: StepByStepSession['difficulty'] = 'medium'
): StepByStepSession {
  return {
    id: generateSessionId(),
    problem,
    problemType,
    difficulty,
    steps: steps.map(step => ({
      ...step,
      completed: false,
    })),
    currentStepIndex: 0,
    completed: false,
    score: 0,
    hintsUsed: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 다음 단계로 이동
 */
export function moveToNextStep(session: StepByStepSession): StepByStepSession {
  const currentStep = session.steps[session.currentStepIndex];

  if (!currentStep.completed) {
    throw new Error('현재 단계를 완료해야 다음 단계로 이동할 수 있습니다.');
  }

  const nextIndex = session.currentStepIndex + 1;
  const completed = nextIndex >= session.steps.length;

  // 점수 계산 (정답 비율)
  const correctSteps = session.steps.filter(s => s.isCorrect).length;
  const score = Math.round((correctSteps / session.steps.length) * 100);

  return {
    ...session,
    currentStepIndex: nextIndex,
    completed,
    score,
    updatedAt: new Date(),
  };
}

/**
 * 단계 완료 처리
 */
export function completeStep(
  session: StepByStepSession,
  stepIndex: number,
  studentAnswer: string,
  isCorrect: boolean,
  feedback: string
): StepByStepSession {
  const updatedSteps = [...session.steps];
  updatedSteps[stepIndex] = {
    ...updatedSteps[stepIndex],
    completed: true,
    studentAnswer,
    isCorrect,
    feedback,
  };

  return {
    ...session,
    steps: updatedSteps,
    updatedAt: new Date(),
  };
}

/**
 * 힌트 사용 기록
 */
export function recordHintUsed(session: StepByStepSession): StepByStepSession {
  return {
    ...session,
    hintsUsed: session.hintsUsed + 1,
    updatedAt: new Date(),
  };
}

/**
 * 세션 ID 생성
 */
function generateSessionId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 현재 단계 가져오기
 */
export function getCurrentStep(session: StepByStepSession): Step | null {
  if (session.completed) {
    return null;
  }
  return session.steps[session.currentStepIndex] || null;
}

/**
 * 진행률 계산
 */
export function calculateProgress(session: StepByStepSession): number {
  const completedSteps = session.steps.filter(s => s.completed).length;
  return Math.round((completedSteps / session.steps.length) * 100);
}

/**
 * 세션 요약 정보
 */
export interface SessionSummary {
  totalSteps: number;
  completedSteps: number;
  correctSteps: number;
  hintsUsed: number;
  score: number;
  timeSpent?: number;
}

export function getSessionSummary(session: StepByStepSession): SessionSummary {
  const completedSteps = session.steps.filter(s => s.completed).length;
  const correctSteps = session.steps.filter(s => s.isCorrect).length;

  return {
    totalSteps: session.steps.length,
    completedSteps,
    correctSteps,
    hintsUsed: session.hintsUsed,
    score: session.score,
    timeSpent: session.updatedAt.getTime() - session.createdAt.getTime(),
  };
}

/**
 * 간단한 답변 정규화 (비교용)
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[=]/g, '')
    .replace(/[×*]/g, '*')
    .replace(/[÷/]/g, '/');
}

/**
 * 답변 유사도 체크 (간단한 버전)
 */
export function isAnswerSimilar(answer1: string, answer2: string): boolean {
  const norm1 = normalizeAnswer(answer1);
  const norm2 = normalizeAnswer(answer2);

  // 완전 일치
  if (norm1 === norm2) return true;

  // 수식 평가 (간단한 경우만)
  try {
    // 안전하지 않으므로 프로덕션에서는 수학 파서 라이브러리 사용 권장
    // 예: math.js, mathjs 등
    return false;
  } catch {
    return false;
  }
}
