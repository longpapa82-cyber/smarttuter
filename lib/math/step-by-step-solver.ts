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

**CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown code blocks, no other text.**

Response format (JSON only):
{
  "problemType": "equation",
  "difficulty": "medium",
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "첫 번째로 해야 할 일 (학생에게 질문하듯이)",
      "explanation": "왜 이 단계가 필요한지 간단히 설명",
      "hint": "막힐 때 줄 수 있는 힌트",
      "expectedAnswer": "이 단계의 예상 답"
    },
    {
      "stepNumber": 2,
      "instruction": "두 번째 단계",
      "explanation": "설명",
      "hint": "힌트",
      "expectedAnswer": "답"
    }
  ],
  "finalAnswer": "최종 답"
}

Requirements:
1. problemType must be one of: "equation", "word-problem", "geometry", "calculus", "other"
2. difficulty must be one of: "easy", "medium", "hard"
3. steps array MUST have 3-7 steps (never 0 or empty)
4. Each step MUST have: stepNumber (integer), instruction (string), explanation (string), hint (string), expectedAnswer (string)
5. Use ${gradeLevel || '중학교'} appropriate language and terminology
6. Each step should guide the student to think, not give away the answer
7. hints should point direction, not reveal answers

Example for "2x + 5 = 13":
{
  "problemType": "equation",
  "difficulty": "easy",
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "먼저 양변에서 5를 빼보세요. 무엇이 남을까요?",
      "explanation": "등식의 양변에 같은 값을 더하거나 빼도 등식은 유지됩니다",
      "hint": "13에서 5를 빼면 얼마인가요?",
      "expectedAnswer": "2x = 8"
    },
    {
      "stepNumber": 2,
      "instruction": "이제 양변을 2로 나눠보세요. x의 값은?",
      "explanation": "x의 계수로 나누면 x의 값을 구할 수 있습니다",
      "hint": "8을 2로 나누면 얼마인가요?",
      "expectedAnswer": "x = 4"
    }
  ],
  "finalAnswer": "x = 4"
}

IMPORTANT: Return ONLY the JSON object. No markdown, no code blocks, no explanations. Start with { and end with }.`;
}

/**
 * AI 프롬프트: 학생 답변 검증
 */
export function generateValidationPrompt(
  problem: string,
  step: Step,
  studentAnswer: string
): string {
  return `당신은 친절한 수학 선생님입니다. 학생의 답을 평가해주세요.

문제: ${problem}
현재 단계: ${step.instruction}
예상 답: ${step.expectedAnswer}
학생 답변: ${studentAnswer}

**CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no other text.**

Response format (JSON only):
{
  "isCorrect": true,
  "feedback": "긍정적인 피드백 메시지",
  "suggestion": "틀렸을 경우 힌트",
  "correctAnswer": "틀렸을 경우에만 정답"
}

평가 기준:
1. **한글 표현 인식**: "2루트2", "루트3", "제곱", "분의" 등 한글 수학 표현을 정확히 이해하고 평가
   - "2루트2" = "2√2" (같은 의미)
   - "3분의2" = "2/3" (같은 의미)
   - "x제곱" = "x²" (같은 의미)
2. **동등성 인식**: 수학적으로 같은 값은 모두 정답 처리
   - "x=3"과 "3"은 같음
   - "1/2"와 "0.5"는 같음
   - "2√2"와 "√8"은 같음
3. **표기 관대함**: 사소한 표기법 차이는 무시
   - 공백, 괄호, 순서 등
4. **긍정적 피드백**: 항상 격려하는 톤으로
5. **힌트 제공**: 틀렸을 때는 방향만 제시, 답은 직접 알려주지 않음

Example for correct answer:
{
  "isCorrect": true,
  "feedback": "정확해요! 잘 이해하고 계시네요! ✨",
  "suggestion": "",
  "correctAnswer": ""
}

Example for incorrect answer:
{
  "isCorrect": false,
  "feedback": "좋은 시도예요! 하지만 계산을 다시 한번 확인해보세요.",
  "suggestion": "분수를 더할 때는 분모를 같게 만들어야 해요",
  "correctAnswer": ""
}

IMPORTANT: Return ONLY the JSON object. No markdown, no code blocks, no explanations. Start with { and end with }.`;
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
