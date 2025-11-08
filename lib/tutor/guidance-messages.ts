/**
 * 학교급별 수준 초과 안내 메시지 템플릿
 * 자연스럽고 격려적인 톤으로 학생을 현재 수준으로 안내
 */

import { GuidanceMessages } from '@/types/tutor';

export const guidanceMessages: GuidanceMessages = {
  elementary: {
    tooAdvanced: {
      math: [
        '오, 정말 좋은 호기심이네요! 하지만 이 개념은 {학생 이름}가 중학교에 가면 배우게 될 내용이에요. 지금은 {현재 학년 적절한 개념}을 먼저 탄탄하게 다져볼까요? 그게 나중에 그 어려운 개념을 이해하는 데 큰 도움이 될 거예요!',
        '{학생 이름}의 질문은 정말 멋져요! 그런데 이건 조금 더 자란 후에 배우는 내용이에요. 지금 우리 학년에서는 {관련된 기초 개념}을 배우고 있는데, 이것부터 차근차근 알아볼까요?',
        '와, 어려운 것을 질문했네요! 그런데 이것은 중학생이나 고등학생이 배우는 내용이에요. 지금은 {기초 개념}을 확실하게 익히는 것이 더 중요해요. 함께 재미있게 공부해볼까요?'
      ],
      english: [
        "Wow, that's a great question! But that grammar is something you'll learn in middle school. Right now, let's focus on {current appropriate topic}. It will help you a lot later!",
        "I love your curiosity! However, that's a bit too advanced for now. Let's practice {simpler related topic} first, okay?",
        "That's a fantastic question! But it's for older students. How about we work on {current level topic} together? It'll be fun!"
      ],
      korean: [
        '📚 정말 좋은 질문이에요! 하지만 이 내용은 {학생 이름}가 중학교에 가면 배우게 될 거예요. 지금은 {현재 학년 적절한 개념}을 먼저 확실하게 익혀볼까요? 그게 나중에 더 어려운 내용을 이해하는 데 큰 도움이 될 거예요!',
        '✨ {학생 이름}의 호기심이 대단해요! 그런데 이건 조금 더 큰 학년에서 배우는 내용이에요. 지금 우리 학년에서는 {관련된 기초 개념}을 배우고 있는데, 이것부터 차근차근 알아볼까요?',
        '💡 와, 어려운 것을 질문했네요! 그런데 이것은 중학생이나 고등학생이 배우는 내용이에요. 지금은 {기초 개념}을 확실하게 익히는 것이 더 중요해요. 함께 재미있게 공부해볼까요?'
      ]
    }
  },

  middle: {
    tooAdvanced: {
      math: [
        '훌륭한 질문이에요! 이 주제는 고등학교 {학년}에서 다루는 내용인데, {학생 이름}가 벌써 관심을 가지다니 놀라워요. 지금 단계에서는 {중학교 수준 연결 개념}을 이해하는 게 먼저예요. 이걸 잘 다지면 나중에 그 고급 개념도 훨씬 쉽게 이해할 수 있을 거예요!',
        '정말 의욕이 넘치네요! 하지만 이 개념은 아직 중학생에게는 조금 어려워요. 대신 {관련 기초 개념}을 먼저 완벽하게 익혀볼까요? 그게 바로 그 어려운 개념으로 가는 지름길이에요!',
        '미래 지향적인 질문이네요! 그런데 이것은 고등학교 과정이에요. 지금은 {현재 학습 단계 개념}을 확실히 하는 것이 중요합니다. 이것만 잘 해도 고등학교에서 훨씬 수월할 거예요.'
      ],
      english: [
        "That's an excellent question! This grammar structure is taught in high school. For now, mastering {current level topic} will give you a strong foundation. Shall we work on that together?",
        "I appreciate your ambition! However, that topic is typically covered in advanced English courses. Let's solidify your understanding of {appropriate topic} first—it's essential for future learning!",
        "Great thinking! But that's a high school level topic. How about we focus on {middle school appropriate topic}? Once you master this, that advanced topic will be much easier later!"
      ],
      korean: [
        '📖 훌륭한 질문이에요! 이 내용은 고등학교에서 다루는 문법/문학 개념인데, {학생 이름}가 벌써 관심을 가지다니 놀라워요. 지금 단계에서는 {중학교 수준 연결 개념}을 이해하는 게 먼저예요. 이걸 잘 다지면 나중에 그 어려운 개념도 훨씬 쉽게 이해할 수 있을 거예요!',
        '✍️ 정말 의욕이 넘치네요! 하지만 이 개념은 아직 중학생에게는 조금 어려워요. 대신 {관련 기초 개념}을 먼저 완벽하게 익혀볼까요? 그게 바로 그 어려운 개념으로 가는 지름길이에요!',
        '📚 미래 지향적인 질문이네요! 그런데 이것은 고등학교 국어 과정이에요. 지금은 {현재 학습 단계 개념}을 확실히 하는 것이 중요합니다. 이것만 잘 해도 고등학교에서 훨씬 수월할 거예요.'
      ]
    }
  },

  high: {
    tooAdvanced: {
      math: [
        '흥미로운 질문입니다! 이 주제는 대학 수학에서 다루는 내용인데, 고등학교 과정과 연결해서 생각해보면 {고등학교 개념 연결} 부분을 먼저 확실히 이해하는 것이 중요합니다. 대학 과정에 대한 호기심을 갖는 건 훌륭하지만, 수능/내신에서 다루는 범위를 먼저 완벽하게 하는 것이 좋습니다.',
        '대학 수준의 질문이네요! 현재 고등학교 교육과정에서는 이 부분이 포함되지 않습니다. 하지만 {관련 고등 개념}을 깊이 이해하면, 대학에서 이 주제를 배울 때 훨씬 수월할 겁니다. 먼저 그 부분을 탐구해볼까요?',
        '선행학습에 대한 의지가 대단하네요! 하지만 이것은 대학 전공 수학 내용입니다. 고등학교 과정의 {해당 영역}을 완벽하게 마스터하는 것이 더 효율적입니다. 그 다음 단계로 자연스럽게 연결될 거예요.'
      ],
      english: [
        "That's a university-level topic! While your interest is commendable, focusing on {appropriate high school topic} will better prepare you for college English. Let's explore that area thoroughly.",
        "Impressive question! This falls under advanced academic English. For now, strengthening your {current level skill} will serve you well in university applications and future studies.",
        "You're thinking ahead! However, this is typically covered in university-level courses. Mastering {high school appropriate topic} first will give you a solid foundation for advanced study later."
      ],
      korean: [
        '🎓 흥미로운 질문입니다! 이 내용은 대학 국어학/국문학에서 다루는 전문적인 내용인데, 고등학교 과정과 연결해서 생각해보면 {고등학교 개념 연결} 부분을 먼저 확실히 이해하는 것이 중요합니다. 대학 과정에 대한 호기심을 갖는 건 훌륭하지만, 수능/내신에서 다루는 범위를 먼저 완벽하게 하는 것이 좋습니다.',
        '📖 대학 수준의 질문이네요! 현재 고등학교 교육과정에서는 이 부분이 포함되지 않습니다. 하지만 {관련 고등 개념}을 깊이 이해하면, 대학에서 이 주제를 배울 때 훨씬 수월할 겁니다. 먼저 그 부분을 탐구해볼까요?',
        '✍️ 선행학습에 대한 의지가 대단하네요! 하지만 이것은 대학 전공 국문학/국어학 내용입니다. 고등학교 과정의 {해당 영역}을 완벽하게 마스터하는 것이 더 효율적입니다. 그 다음 단계로 자연스럽게 연결될 거예요.'
      ]
    }
  },

  university: {
    tooAdvanced: {
      math: [
        '이 분야는 제가 전문적으로 다루기에는 한계가 있습니다. {관련 전공/과목}의 전문가나 교수님께 문의하시는 것을 추천드립니다. 제가 도울 수 있는 {가능한 영역}에 대해서는 최선을 다하겠습니다.',
        '솔직히 말씀드리면, 이 질문은 제 전문 영역을 벗어납니다. 하지만 기본적인 접근 방법이나 {관련 기초 개념}에 대해서는 함께 탐구해볼 수 있습니다.',
        '이것은 매우 전문적인 연구 수준의 질문이네요. 저는 기초부터 학부 수준까지 도와드릴 수 있지만, 이 수준은 전문 연구자나 지도교수님과 논의하시는 것이 더 적절할 것 같습니다.'
      ],
      english: [
        "This topic requires specialized expertise beyond my scope. I recommend consulting with a professor or subject matter expert in {specific field}. However, I can help with foundational approaches and {related basic concepts}.",
        "To be honest, this falls outside my area of expertise. For highly specialized topics like this, academic journals or expert consultation would be more appropriate. I'm here to help with {applicable areas} though!",
        "This is a very advanced research-level question. While I can assist with undergraduate-level content, topics at this level are best discussed with specialized researchers or your thesis advisor."
      ],
      korean: [
        '📚 이 분야는 제가 전문적으로 다루기에는 한계가 있습니다. {관련 전공/과목}의 전문가나 교수님께 문의하시는 것을 추천드립니다. 제가 도울 수 있는 {가능한 영역}에 대해서는 최선을 다하겠습니다.',
        '🎓 솔직히 말씀드리면, 이 질문은 제 전문 영역을 벗어납니다. 하지만 기본적인 접근 방법이나 {관련 기초 개념}에 대해서는 함께 탐구해볼 수 있습니다.',
        '📖 이것은 매우 전문적인 연구 수준의 질문이네요. 저는 기초부터 학부 수준까지 도와드릴 수 있지만, 이 수준은 전문 연구자나 지도교수님과 논의하시는 것이 더 적절할 것 같습니다.'
      ]
    },
    outOfExpertise: {
      honest: [
        '이 분야는 제가 충분한 전문성을 갖추지 못한 영역입니다. {대안적 자원}을 활용하시거나 해당 분야 전문가와 상담하시는 것을 권장드립니다. 제가 확실하게 도와드릴 수 있는 부분에 집중하는 것이 더 좋을 것 같습니다.',
        '죄송하지만 이 주제에 대해서는 정확한 정보를 제공하기 어렵습니다. 잘못된 정보를 드리는 것보다, 전문가의 조언을 구하시는 것이 현명한 선택일 것 같습니다.'
      ]
    }
  }
};

/**
 * 템플릿 변수를 실제 값으로 치환하는 헬퍼 함수
 */
export function fillMessageTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let message = template;

  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{${key}\\}`, 'g');
    message = message.replace(pattern, value);
  }

  return message;
}

/**
 * 학교급과 과목에 따라 랜덤하게 안내 메시지 선택
 */
export function getRandomGuidanceMessage(
  gradeLevel: 'elementary' | 'middle' | 'high' | 'university',
  subject: 'math' | 'english' | 'korean',
  variables?: Record<string, string>
): string {
  const messages = guidanceMessages[gradeLevel].tooAdvanced[subject];

  if (!messages || messages.length === 0) {
    return '이 내용은 현재 학년 수준을 넘어서는 것 같아요. 지금 배우고 있는 내용에 집중해볼까요?';
  }

  const randomIndex = Math.floor(Math.random() * messages.length);
  const template = messages[randomIndex];

  if (variables) {
    return fillMessageTemplate(template, variables);
  }

  return template;
}
