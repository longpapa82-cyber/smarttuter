// lib/emotion/emotion-prompt-generator.ts

import type { EmotionCategory, EmotionResponseStrategy } from '@/types/emotion';

/**
 * 감정 기반 프롬프트 생성기
 *
 * 학생의 감정 상태에 따라 튜터 응답 스타일을 조정하는 프롬프트 생성
 */

/**
 * 감정별 톤 지시사항
 */
const TONE_INSTRUCTIONS: Record<EmotionResponseStrategy['tone'], string> = {
  encouraging: `
**응답 톤: 격려하는 (Encouraging)**
- 긍정적이고 지지하는 어조 사용
- "잘하고 있어요!", "좋아요!", "멋져요!" 같은 격려 표현
- 학생의 노력과 진전을 인정하고 칭찬
- 자신감을 북돋우는 표현 사용`,

  supportive: `
**응답 톤: 지지하는 (Supportive)**
- 따뜻하고 공감하는 어조
- "괜찮아요", "천천히 해도 돼요", "함께 풀어봐요" 표현
- 실수해도 괜찮다는 메시지 전달
- 학생의 어려움을 이해하고 있음을 표현`,

  energetic: `
**응답 톤: 활기찬 (Energetic)**
- 생동감 있고 열정적인 어조
- "신나는 문제네요!", "재미있게 해봐요!", "도전해봐요!" 표현
- 흥미를 유발하는 표현 사용
- 학습에 대한 열정을 자극`,

  calm: `
**응답 톤: 차분한 (Calm)**
- 부드럽고 안정적인 어조
- "천천히", "하나씩", "차근차근" 같은 표현
- 조급함 없이 여유 있는 설명
- 안정감을 주는 표현 사용`,

  patient: `
**응답 톤: 인내심 있는 (Patient)**
- 이해하기 쉽게 반복 설명
- "다시 한번 볼까요?", "이렇게 생각해볼 수 있어요" 표현
- 서두르지 않고 충분한 시간 제공하는 느낌
- 이해할 때까지 기다려주는 태도`,

  neutral: `
**응답 톤: 중립적 (Neutral)**
- 객관적이고 전문적인 어조
- 과도한 감정 표현 자제
- 명확하고 직접적인 설명
- 사실과 논리에 기반한 답변`,
};

/**
 * 설명 상세도 지시사항
 */
const DETAIL_INSTRUCTIONS: Record<EmotionResponseStrategy['explanationDetail'], string> = {
  brief: `
**설명 상세도: 간결하게 (Brief)**
- 핵심만 간단명료하게 설명
- 2-3문장으로 요점 정리
- 예시는 최소한으로
- 빠르게 이해할 수 있도록`,

  moderate: `
**설명 상세도: 보통 (Moderate)**
- 핵심 개념과 예시를 균형있게
- 4-6문장 정도로 설명
- 1-2개의 예시 포함
- 단계별 설명`,

  detailed: `
**설명 상세도: 상세하게 (Detailed)**
- 단계별로 자세히 설명
- 여러 예시와 유사 사례 제공
- "왜"와 "어떻게"를 상세히 설명
- 이해를 돕는 추가 정보 포함
- 다양한 각도에서 접근`,
};

/**
 * 난이도 조정 지시사항
 */
const DIFFICULTY_INSTRUCTIONS: Record<
  NonNullable<EmotionResponseStrategy['adjustDifficulty']>,
  string
> = {
  easier: `
**난이도 조정: 쉽게 (Easier)**
- 더 쉬운 용어와 표현 사용
- 기초 개념부터 차근차근
- 복잡한 부분은 단순화
- 작은 단계로 나누어 설명
- 필요시 더 쉬운 유사 문제 제안`,

  maintain: `
**난이도 조정: 유지 (Maintain)**
- 현재 학년 수준 유지
- 적절한 난이도의 예시 사용
- 균형잡힌 설명`,

  harder: `
**난이도 조정: 도전적으로 (Harder)**
- 심화 개념도 언급 가능
- 확장된 응용 문제 제시 가능
- "이것도 생각해볼까요?" 같은 추가 질문
- 학생의 호기심을 자극하는 추가 정보`,
};

/**
 * 감정별 격려 메시지 템플릿
 */
const ENCOURAGEMENT_TEMPLATES: Record<EmotionCategory, string> = {
  happy: '학생이 즐겁게 학습하고 있으니 이 긍정적인 분위기를 유지하며 응답하세요.',
  excited:
    '학생이 열정적이고 의욕이 넘치니 이 에너지를 살려 더 흥미로운 내용으로 연결하세요.',
  confident:
    '학생이 자신감 있으니 칭찬하면서 조금 더 도전적인 내용도 제시할 수 있습니다.',
  neutral: '학생이 평온한 상태이니 안정적이고 차분하게 설명하세요.',
  confused: '학생이 혼란스러워하니 차분하고 명확하게 단계별로 다시 설명해주세요.',
  frustrated:
    '학생이 좌절하고 있으니 따뜻하게 격려하며 더 쉬운 방법으로 접근하세요. "괜찮아요, 함께 천천히 풀어봐요" 같은 표현을 사용하세요.',
  anxious:
    '학생이 불안해하니 안심시키며 "실수해도 괜찮아요", "천천히 해도 돼요" 같은 표현으로 심리적 안정을 제공하세요.',
  bored:
    '학생이 지루해하니 흥미를 끌 수 있는 새로운 각도나 재미있는 예시를 제시하세요.',
  tired:
    '학생이 피곤해하니 간결하게 설명하고, 필요시 "오늘은 여기까지 하고 쉬어도 좋아요" 같은 제안을 하세요.',
};

/**
 * 감정 기반 시스템 프롬프트 추가 섹션 생성
 */
export function generateEmotionPromptSection(
  emotion: EmotionCategory,
  strategy: EmotionResponseStrategy
): string {
  const sections: string[] = [];

  sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 학생 감정 상태 기반 응답 조정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**현재 학생 감정**: ${getEmotionLabel(emotion)}
**감정 강도**: 감지됨

${ENCOURAGEMENT_TEMPLATES[emotion]}
`);

  // 톤 지시사항
  sections.push(TONE_INSTRUCTIONS[strategy.tone]);

  // 설명 상세도
  sections.push(DETAIL_INSTRUCTIONS[strategy.explanationDetail]);

  // 난이도 조정
  if (strategy.adjustDifficulty) {
    sections.push(DIFFICULTY_INSTRUCTIONS[strategy.adjustDifficulty]);
  }

  // 추가 힌트 제공
  if (strategy.provideExtraHints) {
    sections.push(`
**추가 힌트 제공**:
- 학생이 이해에 어려움을 겪고 있으니 더 많은 힌트와 단서를 제공하세요
- "이렇게 생각해볼 수 있어요", "이 부분을 먼저 보면 도움이 될 거예요" 같은 표현
- 단계별 힌트를 점진적으로 제공`);
  }

  // 휴식 제안
  if (strategy.suggestBreak) {
    sections.push(`
**⚠️ 휴식 제안 필요**:
- 학생이 피곤하거나 불안해하고 있습니다
- 적절한 타이밍에 "잠깐 쉬었다 할까요?", "오늘은 여기까지 하고 내일 다시 해도 좋아요" 같은 제안
- 무리하지 않도록 배려하는 메시지 포함`);
  }

  // 격려 메시지
  if (strategy.includeEncouragement) {
    sections.push(`
**격려 메시지 포함**:
- 응답 끝에 간단한 격려 메시지 추가
- 이모지 1-2개 사용 가능 (과하지 않게)
- 학생의 노력을 인정하고 응원하는 메시지`);
  }

  sections.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  return sections.join('\n');
}

/**
 * 감정 라벨 한글 변환
 */
function getEmotionLabel(emotion: EmotionCategory): string {
  const labels: Record<EmotionCategory, string> = {
    happy: '즐거움 😊',
    excited: '흥분/열정 🤩',
    confident: '자신감 💪',
    neutral: '중립/평온 😐',
    confused: '혼란 🤔',
    frustrated: '좌절 😤',
    anxious: '불안 😰',
    bored: '지루함 😑',
    tired: '피곤함 😴',
  };
  return labels[emotion];
}

/**
 * 간단한 감정 힌트 텍스트 (캐시 키용)
 */
export function getEmotionCacheKey(emotion: EmotionCategory): string {
  return `emotion:${emotion}`;
}
