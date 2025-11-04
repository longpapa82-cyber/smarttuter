/**
 * Question Classifier
 *
 * AI를 사용하여 학생 질문이 어느 교과에 해당하는지 분류합니다.
 * Khan Academy Khanmigo의 주제 필터링 시스템을 참고하여 구현했습니다.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface QuestionClassification {
  subject: 'english' | 'math' | 'science' | 'social' | 'other';
  confidence: number; // 0-100
  isOnTopic: boolean;
  reason: string;
  detectedKeywords?: string[];
}

/**
 * AI를 사용하여 질문이 어느 교과에 해당하는지 분류
 *
 * @param question 학생의 질문
 * @param expectedSubject 기대하는 교과 ('english' | 'math')
 * @returns 분류 결과
 */
export async function classifyQuestion(
  question: string,
  expectedSubject: 'english' | 'math'
): Promise<QuestionClassification> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1, // 낮은 temperature로 일관된 분류
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `당신은 교육 전문가입니다. 다음 질문이 어느 교과에 해당하는지 정확하게 분류하세요.

질문: "${question}"

다음 카테고리 중 하나로 분류하세요:

1. **english** (영어):
   - 영어 문법, 어휘, 철자, 발음
   - 영어 독해, 작문, 에세이
   - 영어 회화, 대화 표현
   - 영문학, 영어 텍스트 분석
   - 예: "현재완료 시제", "How do I write an essay?", "What does 'elaborate' mean?"

2. **math** (수학):
   - 수학 계산, 연산, 문제 풀이
   - 대수학, 기하학, 미적분, 통계
   - 수학 개념, 공식, 정리
   - 수학 응용 문제
   - 예: "2+2는?", "이차방정식 푸는 법", "미적분 개념"

3. **science** (과학):
   - 물리, 화학, 생물, 지구과학
   - 과학 실험, 현상, 이론
   - 예: "광합성", "뉴턴의 법칙", "화학 반응"

4. **social** (사회):
   - 역사, 지리, 정치, 경제
   - 사회 현상, 문화
   - 예: "한국전쟁", "수도는?", "민주주의"

5. **other** (기타):
   - 일상 대화, 인사, 잡담
   - 교과와 무관한 질문
   - 예: "안녕", "날씨 어때?", "심심해"

중요 규칙:
- 질문이 명확히 영어 학습(문법, 어휘, 표현 등)과 관련되면 'english'
- 질문이 명확히 수학 계산이나 개념과 관련되면 'math'
- 애매한 경우 가장 가능성 높은 카테고리 선택
- 신뢰도(confidence)를 0-100으로 표시

JSON 형식으로만 응답하세요:
{
  "subject": "분류된 교과 (english|math|science|social|other)",
  "confidence": 신뢰도 (0-100),
  "reason": "분류 이유 (한국어)",
  "detectedKeywords": ["감지된 키워드들"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSON 추출 (```json ``` 마크다운 제거)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const classification = JSON.parse(jsonMatch[0]);

    return {
      subject: classification.subject,
      confidence: classification.confidence,
      isOnTopic: classification.subject === expectedSubject,
      reason: classification.reason,
      detectedKeywords: classification.detectedKeywords || []
    };

  } catch (error) {
    console.error('Question classification error:', error);

    // 폴백: 키워드 기반 간단한 분류
    return fallbackClassification(question, expectedSubject);
  }
}

/**
 * AI 실패 시 폴백: 키워드 기반 간단한 분류
 */
function fallbackClassification(
  question: string,
  expectedSubject: 'english' | 'math'
): QuestionClassification {
  const lowerQuestion = question.toLowerCase();

  // 영어 키워드
  const englishKeywords = [
    '문법', '어휘', '단어', '철자', '발음', 'grammar', 'vocabulary', 'spelling',
    '시제', '동사', '명사', '형용사', '부사', 'tense', 'verb', 'noun',
    '독해', '작문', 'reading', 'writing', 'essay',
    '회화', '대화', 'conversation', 'speaking'
  ];

  // 수학 키워드
  const mathKeywords = [
    '계산', '더하기', '빼기', '곱하기', '나누기', '+', '-', '×', '÷',
    '방정식', '함수', '미분', '적분', 'equation', 'function',
    '기하', '도형', '삼각', 'geometry', 'triangle',
    '확률', '통계', 'probability', 'statistics'
  ];

  // 과학 키워드
  const scienceKeywords = [
    '실험', '화학', '물리', '생물', 'experiment', 'chemistry', 'physics', 'biology',
    '광합성', '세포', '원자', 'photosynthesis', 'cell', 'atom'
  ];

  // 사회 키워드
  const socialKeywords = [
    '역사', '지리', '정치', '경제', 'history', 'geography', 'politics', 'economy',
    '전쟁', '수도', '민주', 'war', 'capital', 'democracy'
  ];

  // 키워드 매칭
  const hasEnglish = englishKeywords.some(kw => lowerQuestion.includes(kw));
  const hasMath = mathKeywords.some(kw => lowerQuestion.includes(kw));
  const hasScience = scienceKeywords.some(kw => lowerQuestion.includes(kw));
  const hasSocial = socialKeywords.some(kw => lowerQuestion.includes(kw));

  let subject: QuestionClassification['subject'] = 'other';
  let confidence = 50; // 기본 낮은 신뢰도

  if (hasEnglish) {
    subject = 'english';
    confidence = 70;
  } else if (hasMath) {
    subject = 'math';
    confidence = 70;
  } else if (hasScience) {
    subject = 'science';
    confidence = 70;
  } else if (hasSocial) {
    subject = 'social';
    confidence = 70;
  }

  return {
    subject,
    confidence,
    isOnTopic: subject === expectedSubject,
    reason: `키워드 기반 폴백 분류 (AI 오류)`,
    detectedKeywords: []
  };
}

/**
 * 빠른 검증: 명확히 off-topic인지 사전 체크
 * (API 호출 전 빠른 필터링)
 */
export function isObviouslyOffTopic(
  question: string,
  expectedSubject: 'english' | 'math'
): boolean {
  const lowerQuestion = question.toLowerCase();

  // 명확한 인사/잡담
  const casualGreetings = ['안녕', '하이', 'hi', 'hello', '심심', '놀아줘', '뭐해'];
  if (casualGreetings.some(g => lowerQuestion === g || lowerQuestion === g + '?')) {
    return true;
  }

  // 영어 튜터에서 명확한 수학 질문
  if (expectedSubject === 'english') {
    const obviousMath = ['방정식', '미분', '적분', '계산해', '더하기', '빼기'];
    if (obviousMath.some(kw => lowerQuestion.includes(kw))) {
      return true;
    }
  }

  // 수학 튜터에서 명확한 영어 질문
  if (expectedSubject === 'math') {
    const obviousEnglish = ['문법', '시제', '어휘', '단어', '철자', 'grammar'];
    if (obviousEnglish.some(kw => lowerQuestion.includes(kw))) {
      return true;
    }
  }

  return false;
}
