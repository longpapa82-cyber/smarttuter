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
   - 대수학, 기하학, 미적분, 통계, 삼각법
   - 수학 개념, 공식, 정리, 법칙
   - 수학자 이름과 관련된 정리 (피타고라스, 유클리드, 페르마, 탈레스 등)
   - 도형, 넓이, 부피, 각도 관련 질문
   - 수학 응용 문제
   - **중요**: "~정리", "~법칙", "~공식"은 대부분 수학임
   - 예: "2+2는?", "이차방정식 푸는 법", "피타고라스 정리", "삼각형 넓이"

3. **science** (과학):
   - 물리, 화학, 생물, 지구과학
   - 과학 실험, 현상, 이론
   - 과학자 이름과 관련된 법칙 (뉴턴, 아인슈타인 등)
   - 예: "광합성", "뉴턴의 법칙", "화학 반응"

4. **social** (사회):
   - 역사, 지리, 정치, 경제
   - 사회 현상, 문화
   - 예: "한국전쟁", "수도는?", "민주주의"

5. **other** (기타):
   - 일상 대화, 인사, 잡담
   - 교과와 무관한 질문
   - **주의**: 모호한 경우 'other'가 아닌 가장 가능성 높은 교과로 분류
   - 예: "안녕", "날씨 어때?", "심심해"

🔴 **매우 중요한 분류 원칙**:
1. 수학/과학 관련 인명이 나오면 해당 교과로 분류 (피타고라스→math, 뉴턴→science)
2. "정리", "공식", "법칙" 단어가 있으면 높은 확률로 math 또는 science
3. 불확실한 경우 'other'보다는 가장 관련성 높은 교과 선택
4. 신뢰도는 정직하게 표시 (확실: 90-100, 관련성 높음: 70-89, 불확실: 50-69)

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
 * AI 실패 시 폴백: 관대한 분류 (Conservative Filtering)
 *
 * 핵심 원칙: "확실히 다른 교과인 경우만 차단, 불확실하면 expectedSubject로 통과"
 */
function fallbackClassification(
  question: string,
  expectedSubject: 'english' | 'math'
): QuestionClassification {
  const lowerQuestion = question.toLowerCase();

  // 1단계: 명확한 인사/잡담만 'other'로 분류
  const obviousCasual = ['안녕', '하이', 'hi', 'hello', '심심', '놀아줘', '뭐해', '굿'];
  if (obviousCasual.some(g => lowerQuestion === g || lowerQuestion === g + '?')) {
    return {
      subject: 'other',
      confidence: 90,
      isOnTopic: false,
      reason: '명확한 일상 대화',
      detectedKeywords: []
    };
  }

  // 2단계: 명확히 반대 교과인지 확인
  if (expectedSubject === 'math') {
    // 수학 튜터에서 명확한 영어 질문
    const obviousEnglish = [
      '문법', 'grammar', '시제', 'tense',
      '단어', 'vocabulary', '철자', 'spelling',
      '영작', 'essay'
    ];
    if (obviousEnglish.some(kw => lowerQuestion.includes(kw))) {
      return {
        subject: 'english',
        confidence: 85,
        isOnTopic: false,
        reason: '명확한 영어 학습 질문',
        detectedKeywords: []
      };
    }
  } else if (expectedSubject === 'english') {
    // 영어 튜터에서 명확한 수학 질문
    const obviousMath = [
      '방정식', 'equation', '미분', 'derivative',
      '적분', 'integral', '계산해', 'calculate'
    ];
    if (obviousMath.some(kw => lowerQuestion.includes(kw))) {
      return {
        subject: 'math',
        confidence: 85,
        isOnTopic: false,
        reason: '명확한 수학 계산/개념 질문',
        detectedKeywords: []
      };
    }
  }

  // 3단계: 패턴 기반 관대한 분류
  // "~정리", "~공식", "~법칙" → 대부분 수학/과학
  if (lowerQuestion.includes('정리') || lowerQuestion.includes('theorem')) {
    if (expectedSubject === 'math') {
      return {
        subject: 'math',
        confidence: 75,
        isOnTopic: true,
        reason: '정리 관련 질문은 수학일 가능성 높음',
        detectedKeywords: ['정리']
      };
    }
  }

  if (lowerQuestion.includes('공식') || lowerQuestion.includes('formula')) {
    if (expectedSubject === 'math') {
      return {
        subject: 'math',
        confidence: 75,
        isOnTopic: true,
        reason: '공식 관련 질문은 수학일 가능성 높음',
        detectedKeywords: ['공식']
      };
    }
  }

  // 4단계: 기본 전략 - 불확실하면 expectedSubject로 통과
  // (AI가 실패했고, 명확히 다른 교과도 아니면 일단 허용)
  return {
    subject: expectedSubject,
    confidence: 60, // 낮은 신뢰도지만 통과
    isOnTopic: true,
    reason: `불확실한 질문은 ${expectedSubject} 튜터가 처리 (관대한 필터링)`,
    detectedKeywords: []
  };
}

/**
 * 빠른 검증: 명확히 off-topic인지 사전 체크 (Conservative Filtering)
 * (API 호출 전 빠른 필터링)
 *
 * 핵심 원칙: "100% 확실한 경우만 true 반환"
 */
export function isObviouslyOffTopic(
  question: string,
  expectedSubject: 'english' | 'math' | 'science' | 'social-studies'
): boolean {
  const lowerQuestion = question.toLowerCase().trim();

  // 1. 명확한 인사/잡담만 차단 (단일 단어 또는 단순 인사)
  const casualGreetings = ['안녕', '하이', 'hi', 'hello', '심심', '놀아줘', '뭐해'];
  const isSingleWordGreeting = casualGreetings.some(
    g => lowerQuestion === g || lowerQuestion === g + '?' || lowerQuestion === g + '!'
  );
  if (isSingleWordGreeting) {
    return true;
  }

  // 2. 영어 튜터에서 명확한 수학 질문 (매우 제한적)
  if (expectedSubject === 'english') {
    const obviousMath = ['방정식 풀', '미분 계산', '적분 계산'];
    if (obviousMath.some(kw => lowerQuestion.includes(kw))) {
      return true;
    }
  }

  // 3. 수학 튜터에서 명확한 영어 질문 (매우 제한적)
  if (expectedSubject === 'math') {
    const obviousEnglish = ['문법 설명', '시제 설명', 'grammar rule'];
    if (obviousEnglish.some(kw => lowerQuestion.includes(kw))) {
      return true;
    }
  }

  // 4. 기본적으로 false (AI 분류로 넘김)
  // 불확실한 경우 AI가 판단하도록 함
  return false;
}
