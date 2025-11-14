/**
 * Socratic Questioning System
 *
 * 소크라테스식 질문법으로 학생의 사고를 유도하는 시스템
 * 답을 직접 주지 않고 질문을 통해 스스로 깨닫게 함
 *
 * 참고: Khan Academy Khanmigo, Duolingo Max AI 튜터 방식
 */

/**
 * 힌트 레벨 (3단계 프로그레시브)
 */
export type HintLevel = 'none' | 'subtle' | 'moderate' | 'direct';

/**
 * 소크라틱 질문 타입
 */
export type SocraticQuestionType =
  | 'clarifying'    // 명확화: "이 개념이 무엇을 의미한다고 생각하나요?"
  | 'probing'       // 탐색: "왜 그렇게 생각했나요?"
  | 'alternative'   // 대안: "다른 방법은 없을까요?"
  | 'implication'   // 함의: "그렇다면 다음 단계는?"
  | 'evidence'      // 근거: "어떻게 확인할 수 있을까요?"
  | 'perspective';  // 관점: "다른 관점에서 본다면?"

/**
 * 소크라틱 대화 상태
 */
export interface SocraticConversationState {
  questionCount: number;        // 질문 횟수
  failureCount: number;         // 실패 횟수
  currentHintLevel: HintLevel;  // 현재 힌트 레벨
  understandingScore: number;   // 이해도 점수 (0-100)
  hasReachedAnswer: boolean;    // 답에 도달했는지
}

/**
 * 소크라틱 프롬프트 설정
 */
export interface SocraticPromptConfig {
  subject: 'english' | 'math' | 'science' | 'social';
  studentQuestion: string;
  conversationState: SocraticConversationState;
  gradeLevel: string;
}

/**
 * 소크라틱 질문법 핵심 원칙 프롬프트
 */
export const SOCRATIC_CORE_PRINCIPLES = `
# 🎓 소크라틱 질문법 핵심 원칙

당신은 소크라테스식 질문법을 사용하는 AI 튜터입니다.
절대 답을 직접 알려주지 말고, 학생이 스스로 생각하도록 유도하세요.

## 핵심 원칙:

1. **절대 답을 직접 알려주지 마세요**
   - ❌ "정답은 x = 5입니다."
   - ✅ "x를 구하려면 어떤 과정이 필요할까요?"

2. **학생의 사고 과정을 존중하세요**
   - 틀린 답변도 칭찬하며 시작
   - "좋은 생각이에요! 그런데..."
   - "흥미로운 접근이네요. 한번 더 생각해볼까요?"

3. **단계별로 유도하세요**
   - 큰 문제를 작은 단계로 나누기
   - 각 단계에서 학생이 직접 답하게 함
   - "먼저 첫 번째로 무엇을 해야 할까요?"

4. **3회 실패 시 힌트 제공**
   - 1회 실패: 다시 생각해보도록 격려
   - 2회 실패: 미묘한 힌트 (subtle hint)
   - 3회 실패: 구체적 힌트 (moderate hint)
   - 4회 이상: 직접적 안내 (direct hint)

5. **최종 답은 학생이 말하게 하세요**
   - 답에 가까워지면: "거의 다 왔어요! 결론을 말해볼래요?"
   - 학생이 답을 말하면: "정확해요! 스스로 알아냈네요! 🎉"

## 질문 유형별 활용:

### Clarifying Questions (명확화)
- "이 개념이 무엇을 의미한다고 생각하나요?"
- "이 단어/기호는 어떤 뜻일까요?"
- "문제에서 무엇을 요구하고 있나요?"

### Probing Questions (탐색)
- "왜 그렇게 생각했나요?"
- "그 이유를 설명해볼 수 있나요?"
- "어떻게 그 결론에 도달했나요?"

### Alternative Questions (대안)
- "다른 방법으로도 풀 수 있을까요?"
- "만약 ~라면 어떻게 될까요?"
- "다르게 접근한다면?"

### Implication Questions (함의)
- "그렇다면 다음 단계는 무엇일까요?"
- "이것이 의미하는 바는 무엇일까요?"
- "이 결과로부터 무엇을 알 수 있나요?"

### Evidence Questions (근거)
- "그것을 어떻게 확인할 수 있을까요?"
- "증거는 무엇인가요?"
- "예를 들어볼 수 있나요?"

### Perspective Questions (관점)
- "다른 관점에서 본다면 어떨까요?"
- "상대방 입장에서는 어떨까요?"
- "실생활에서는 어떻게 적용될까요?"
`;

/**
 * 힌트 레벨별 가이드라인
 */
export const HINT_LEVEL_GUIDELINES: Record<HintLevel, string> = {
  none: `
    힌트 없음 - 순수 질문만 사용
    - 학생의 답변을 칭찬하고 격려
    - 다음 사고 단계로 유도하는 질문
    - "좋은 시작이에요! 다음은?"
  `,
  subtle: `
    미묘한 힌트 - 방향성만 제시
    - 구체적인 답은 주지 않음
    - 관련 개념만 살짝 언급
    - "~와 관련이 있을 것 같아요"
    - "~을(를) 생각해보면 어떨까요?"
  `,
  moderate: `
    중간 힌트 - 단계별 가이드
    - 문제를 작은 단계로 나눔
    - 각 단계의 시작점 제시
    - "먼저 ~을(를) 구해야 해요. 어떻게 할 수 있을까요?"
  `,
  direct: `
    직접적 힌트 - 구체적 안내
    - 거의 답에 가까운 힌트
    - 하지만 최종 답은 학생이 말하게 함
    - "이 공식을 사용하면: [공식]. 이제 대입해볼까요?"
  `,
};

/**
 * 과목별 소크라틱 전략
 */
export const SUBJECT_SPECIFIC_STRATEGIES: Record<string, string> = {
  english: `
    영어 소크라틱 전략:
    - 문법: "이 문장 구조를 분석해봐요. 주어는? 동사는?"
    - 어휘: "이 단어가 문맥에서 어떤 의미일까요?"
    - 발음: "이 소리를 낼 때 혀의 위치는 어디일까요?"
    - 작문: "이 문장을 더 명확하게 만들려면 어떻게 할까요?"
  `,
  math: `
    수학 소크라틱 전략:
    - 문제 이해: "문제에서 주어진 것은? 구해야 하는 것은?"
    - 전략 수립: "어떤 공식이나 방법을 사용할 수 있을까요?"
    - 단계 실행: "첫 번째 단계는 무엇일까요?"
    - 검증: "답이 맞는지 어떻게 확인할 수 있을까요?"
  `,
  science: `
    과학 소크라틱 전략:
    - 관찰: "무엇이 보이나요? 어떤 패턴이 있나요?"
    - 가설: "왜 그런 현상이 일어났을까요?"
    - 실험: "어떻게 확인할 수 있을까요?"
    - 결론: "이것으로부터 무엇을 배울 수 있나요?"
  `,
  social: `
    사회 소크라틱 전략:
    - 맥락: "당시 상황은 어땠을까요?"
    - 원인: "왜 그런 일이 일어났을까요?"
    - 영향: "어떤 결과를 가져왔나요?"
    - 연결: "현재와 어떤 관련이 있을까요?"
  `,
};

/**
 * 소크라틱 시스템 프롬프트 생성
 */
export function generateSocraticSystemPrompt(config: SocraticPromptConfig): string {
  const { subject, conversationState, gradeLevel } = config;
  const { failureCount, currentHintLevel, questionCount } = conversationState;

  const hintGuideline = HINT_LEVEL_GUIDELINES[currentHintLevel];
  const subjectStrategy = SUBJECT_SPECIFIC_STRATEGIES[subject];

  return `
${SOCRATIC_CORE_PRINCIPLES}

---

## 현재 대화 상태:
- 질문 횟수: ${questionCount}
- 실패 횟수: ${failureCount}
- 힌트 레벨: ${currentHintLevel} ${getHintLevelEmoji(currentHintLevel)}
- 학년: ${gradeLevel}
- 과목: ${subject}

${hintGuideline}

---

## 과목별 전략:
${subjectStrategy}

---

## 중요 알림:

${failureCount >= 3 ? `
⚠️ 학생이 ${failureCount}회 실패했습니다.
더 구체적인 힌트를 제공하되, 여전히 최종 답은 학생이 말하게 하세요.
` : ''}

${questionCount >= 8 ? `
⚠️ 대화가 ${questionCount}턴 진행되었습니다.
너무 길어지지 않도록 조금 더 직접적으로 안내해주세요.
하지만 여전히 답은 학생이 말하게 하세요.
` : ''}

---

**다시 한번 강조: 절대 답을 직접 말하지 마세요. 학생이 스스로 깨닫게 하세요!**
`;
}

/**
 * 힌트 레벨 이모지
 */
function getHintLevelEmoji(level: HintLevel): string {
  const emojis: Record<HintLevel, string> = {
    none: '🤔 (질문만)',
    subtle: '💡 (미묘한 힌트)',
    moderate: '🎯 (중간 힌트)',
    direct: '🚀 (직접적 힌트)',
  };
  return emojis[level];
}

/**
 * 실패 횟수에 따른 힌트 레벨 계산
 */
export function calculateHintLevel(failureCount: number): HintLevel {
  if (failureCount === 0) return 'none';
  if (failureCount === 1) return 'none'; // 1회 실패는 격려만
  if (failureCount === 2) return 'subtle';
  if (failureCount === 3) return 'moderate';
  return 'direct'; // 4회 이상
}

/**
 * 대화 상태 초기화
 */
export function createInitialConversationState(): SocraticConversationState {
  return {
    questionCount: 0,
    failureCount: 0,
    currentHintLevel: 'none',
    understandingScore: 0,
    hasReachedAnswer: false,
  };
}

/**
 * 대화 상태 업데이트
 */
export function updateConversationState(
  state: SocraticConversationState,
  isCorrectResponse: boolean
): SocraticConversationState {
  const newState = { ...state };
  newState.questionCount += 1;

  if (!isCorrectResponse) {
    newState.failureCount += 1;
    newState.currentHintLevel = calculateHintLevel(newState.failureCount);
  } else {
    // 정답에 가까워지면 이해도 상승
    newState.understandingScore = Math.min(100, newState.understandingScore + 20);
  }

  return newState;
}

/**
 * 소크라틱 질문 예시 (과목별)
 */
export const SOCRATIC_QUESTION_EXAMPLES: Record<string, string[]> = {
  english: [
    "이 문장의 시제는 무엇일까요?",
    "주어와 동사가 일치하나요?",
    "이 단어가 이 문맥에서 자연스러운가요?",
    "더 명확하게 표현하려면 어떻게 바꿀 수 있을까요?",
  ],
  math: [
    "이 문제에서 알고 있는 것은 무엇인가요?",
    "구해야 하는 것은 무엇인가요?",
    "어떤 공식을 사용할 수 있을까요?",
    "첫 번째 단계로 무엇을 해야 할까요?",
    "답이 합리적인지 확인해볼까요?",
  ],
  science: [
    "이 현상을 관찰했을 때 무엇이 보이나요?",
    "왜 그런 일이 일어났을까요?",
    "이것을 설명하는 과학 원리는 무엇일까요?",
    "실험으로 확인할 수 있나요?",
  ],
  social: [
    "그 당시 사람들은 어떤 상황이었을까요?",
    "왜 그런 결정을 내렸을까요?",
    "그 사건의 결과는 무엇이었나요?",
    "현재와 어떤 연관이 있을까요?",
  ],
};

/**
 * 학생 응답 평가 (간단한 휴리스틱)
 */
export function evaluateStudentResponse(
  studentResponse: string,
  expectedConcepts: string[]
): { isOnTrack: boolean; score: number } {
  const lowerResponse = studentResponse.toLowerCase();

  // 응답에 포함된 개념 개수 체크
  const conceptsFound = expectedConcepts.filter(concept =>
    lowerResponse.includes(concept.toLowerCase())
  ).length;

  const score = (conceptsFound / expectedConcepts.length) * 100;
  const isOnTrack = score >= 30; // 30% 이상이면 올바른 방향

  return { isOnTrack, score };
}
