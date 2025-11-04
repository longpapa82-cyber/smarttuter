/**
 * Response Filter
 *
 * 질문이 교과 범위 내인지 확인하고 필터링합니다.
 * Khan Academy Khanmigo의 주제 이탈 방지 시스템을 참고했습니다.
 */

import type { QuestionClassification } from './question-classifier';

export interface FilterResult {
  shouldRespond: boolean;
  redirectMessage?: string;
  filterReason?: string;
}

/**
 * 질문이 교과 범위 내인지 확인하고 필터링
 *
 * @param classification 질문 분류 결과
 * @param tutorType 튜터 타입 ('english' | 'math')
 * @returns 필터링 결과
 */
export function filterBySubject(
  classification: QuestionClassification,
  tutorType: 'english' | 'math'
): FilterResult {
  // 교과가 일치하면 응답 허용
  if (classification.isOnTopic) {
    return { shouldRespond: true };
  }

  // 교과 이탈 시 친절한 안내 메시지
  const redirectMessages = generateRedirectMessages(tutorType);

  const message = redirectMessages[classification.subject] ||
    `현재는 ${tutorType === 'english' ? '영어' : '수학'} 학습만 지원하고 있어요. 관련 질문을 해주세요!`;

  return {
    shouldRespond: false,
    redirectMessage: message,
    filterReason: `Off-topic: ${classification.subject} (expected: ${tutorType})`
  };
}

/**
 * 교과별 리디렉션 메시지 생성
 */
function generateRedirectMessages(tutorType: 'english' | 'math'): Record<string, string> {
  if (tutorType === 'english') {
    return {
      math: `🧮 수학 관련 질문은 **Math Park**에서 도와드릴 수 있어요!

저는 영어 전문 튜터라서 영어 문법, 어휘, 독해, 작문, 회화를 도와드려요.

**영어 학습 질문 예시**:
- 현재완료 시제가 뭐예요?
- "elaborate"는 무슨 뜻이에요?
- 에세이 쓰는 법 알려주세요!
- 이 문장 문법적으로 맞나요?

영어 관련 질문을 해주세요! 😊`,

      science: `🔬 과학 질문은 현재 지원하지 않아요.

저는 영어 전문 튜터예요! 영어 문법, 어휘, 독해, 작문에 대해 물어보세요!

**도와드릴 수 있는 것들**:
✅ 영어 문법 규칙 설명
✅ 단어 뜻과 사용법
✅ 독해 지문 이해하기
✅ 영작문 첨삭

영어 학습으로 함께 해볼까요?`,

      social: `📚 사회 과목은 현재 지원하지 않아요.

저는 영어 학습 전문 튜터랍니다!

**제가 도와드릴 수 있는 영어 학습**:
- 영문법 마스터하기
- 어휘력 키우기
- 영어 독해 실력 향상
- 영작문 연습

영어 공부 같이 해볼까요? 😊`,

      other: `안녕하세요! 👋

저는 영어 학습을 도와주는 AI 튜터예요.

**도와드릴 수 있는 것들**:
📝 영어 문법 (시제, 문장 구조 등)
📖 영어 독해 (지문 이해, 요약)
✍️ 영어 작문 (에세이, 문장 만들기)
💬 영어 회화 (표현, 대화 연습)

영어 학습과 관련된 질문을 해주시면 더 잘 도와드릴 수 있어요!

**질문 예시**: "현재완료 시제를 설명해주세요" 또는 "이 문장 맞나요?"

무엇이 궁금하신가요?`
    };
  } else {
    // math tutor
    return {
      english: `📚 영어 관련 질문은 **English Park**에서 도와드릴 수 있어요!

저는 수학 전문 튜터라서 수학 계산, 문제 풀이, 개념 설명을 도와드려요.

**수학 학습 질문 예시**:
- 12 + 8은 얼마예요?
- 이차방정식 푸는 법 알려주세요
- 피타고라스 정리가 뭐예요?
- 이 문제 풀이 과정 설명해주세요

수학 관련 질문을 해주세요! 🧮`,

      science: `🔬 과학 질문은 현재 지원하지 않아요.

저는 수학 전문 튜터예요! 수학 계산, 문제 풀이, 개념 설명을 도와드려요!

**도와드릴 수 있는 것들**:
✅ 사칙연산, 분수, 소수 계산
✅ 방정식, 함수 풀이
✅ 기하학, 도형 문제
✅ 확률, 통계 개념

수학 학습으로 함께 해볼까요?`,

      social: `📚 사회 과목은 현재 지원하지 않아요.

저는 수학 학습 전문 튜터랍니다!

**제가 도와드릴 수 있는 수학 학습**:
- 수학 계산 문제 풀이
- 개념 설명과 이해
- 문제 해결 전략
- 단계별 풀이 과정

수학 공부 같이 해볼까요? 🧮`,

      other: `안녕하세요! 👋

저는 수학 학습을 도와주는 AI 튜터예요.

**도와드릴 수 있는 것들**:
🔢 계산 (사칙연산, 분수, 소수 등)
📐 기하학 (도형, 넓이, 부피)
📊 대수학 (방정식, 함수, 그래프)
📈 확률과 통계

수학 학습과 관련된 질문을 해주시면 더 잘 도와드릴 수 있어요!

**질문 예시**: "12 × 15는 얼마예요?" 또는 "이차방정식 푸는 법 알려주세요"

무엇이 궁금하신가요?`
    };
  }
}

/**
 * 필터링 이유를 로깅용으로 포맷
 */
export function formatFilterLog(
  classification: QuestionClassification,
  filterResult: FilterResult,
  tutorType: 'english' | 'math'
): string {
  return `[Filter] Tutor: ${tutorType} | Question Subject: ${classification.subject} | ` +
    `Confidence: ${classification.confidence}% | ` +
    `Allowed: ${filterResult.shouldRespond} | ` +
    `Reason: ${filterResult.filterReason || 'On-topic'}`;
}
