/**
 * API Call Optimizer
 * 
 * 목적: API 호출을 최소화하고 효율적으로 관리
 * 
 * 전략:
 * 1. RAG 시스템 우선 사용 (API 호출 없이 답변 가능)
 * 2. Classifier + Verifier를 하나의 호출로 배치 처리
 * 3. 간단한 질문은 경량 처리
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface OptimizedClassification {
  subject: 'english' | 'math' | 'science' | 'social' | 'korean' | 'other';
  confidence: number;
  isOnTopic: boolean;
  reason: string;
  needsVerification: boolean; // 검증이 필요한지 여부
  suggestedAction: 'rag' | 'ai' | 'redirect'; // 권장 처리 방식
}

/**
 * 키워드 기반 빠른 분류 (API 호출 없음)
 */
export function quickClassify(
  question: string,
  expectedSubject: 'english' | 'math' | 'science' | 'social' | 'korean'
): OptimizedClassification | null {
  const lower = question.toLowerCase();

  // 명확한 키워드가 있는 경우 즉시 분류
  const keywords = {
    math: ['수학', '계산', '방정식', 'equation', 'calculate', '더하기', '빼기', '곱하기', '나누기',
           'algebra', 'geometry', '함수', 'function', '그래프', 'graph', '각도', 'angle'],
    english: ['영어', 'english', 'grammar', '문법', 'vocabulary', '어휘', 'spelling', '철자',
              'pronunciation', '발음', 'reading', '독해', 'writing', '작문'],
    science: ['과학', 'science', '실험', 'experiment', '화학', 'chemistry', '물리', 'physics',
              '생물', 'biology', '원소', 'element', '세포', 'cell', '에너지', 'energy'],
    social: ['사회', 'social', '역사', 'history', '지리', 'geography', '정치', 'politics',
             '경제', 'economics', '문화', 'culture', '시민', 'civic'],
    korean: ['국어', 'korean', '문학', 'literature', '시', 'poem', '소설', 'novel',
             '작가', 'author', '맞춤법', 'spelling', '한글', 'hangul', '독서', 'reading']
  };

  // 과목별 키워드 매칭
  const matches = {
    math: keywords.math.filter(kw => lower.includes(kw)).length,
    english: keywords.english.filter(kw => lower.includes(kw)).length,
    science: keywords.science.filter(kw => lower.includes(kw)).length,
    social: keywords.social.filter(kw => lower.includes(kw)).length,
    korean: keywords.korean.filter(kw => lower.includes(kw)).length,
  };

  const maxMatches = Math.max(...Object.values(matches));

  // 명확한 매칭이 있는 경우
  if (maxMatches >= 2) {
    const subject = Object.entries(matches).find(([_, count]) => count === maxMatches)?.[0] as any;
    const isOnTopic = subject === expectedSubject;

    return {
      subject,
      confidence: Math.min(95, 70 + maxMatches * 10),
      isOnTopic,
      reason: isOnTopic 
        ? `키워드 기반 빠른 분류: ${subject} 관련 질문` 
        : `다른 과목(${subject}) 질문으로 감지됨`,
      needsVerification: false,
      suggestedAction: isOnTopic ? 'rag' : 'redirect',
    };
  }

  // 명확하지 않은 경우 null 반환 (AI 분류 필요)
  return null;
}

/**
 * 배치 처리: 분류 + 검증을 한 번에
 */
export async function classifyAndVerify(
  question: string,
  expectedSubject: 'english' | 'math' | 'science' | 'social',
  answer: string
): Promise<{
  classification: OptimizedClassification;
  verification: {
    isAccurate: boolean;
    confidence: number;
    issues: string[];
  };
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 40,
    }
  });

  const prompt = `당신은 교육 전문가입니다. 다음 작업을 한 번에 수행하세요:

1. 질문 분류: 이 질문이 어느 과목에 해당하는지 판단
2. 답변 검증: 제공된 답변이 정확하고 적절한지 검증

질문: "${question}"
기대 과목: ${expectedSubject}
제공된 답변: "${answer}"

다음 JSON 형식으로 응답하세요:
{
  "subject": "영어|수학|과학|사회|기타 중 하나",
  "confidence": 0-100,
  "isOnTopic": true/false,
  "reason": "분류 이유",
  "answerAccurate": true/false,
  "answerConfidence": 0-100,
  "issues": ["발견된 문제점들"]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // JSON 파싱
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    classification: {
      subject: parsed.subject === '영어' ? 'english' : 
               parsed.subject === '수학' ? 'math' :
               parsed.subject === '과학' ? 'science' :
               parsed.subject === '사회' ? 'social' : 'other',
      confidence: parsed.confidence,
      isOnTopic: parsed.isOnTopic,
      reason: parsed.reason,
      needsVerification: false,
      suggestedAction: parsed.isOnTopic ? 'rag' : 'redirect',
    },
    verification: {
      isAccurate: parsed.answerAccurate,
      confidence: parsed.answerConfidence,
      issues: parsed.issues || [],
    }
  };
}

/**
 * API 호출 통계
 */
class APICallTracker {
  private calls: { timestamp: number; endpoint: string }[] = [];
  private readonly WINDOW_SIZE = 24 * 60 * 60 * 1000; // 24시간

  track(endpoint: string): void {
    const now = Date.now();
    this.calls.push({ timestamp: now, endpoint });
    
    // 오래된 기록 제거
    this.calls = this.calls.filter(call => now - call.timestamp < this.WINDOW_SIZE);
  }

  getCount(hours: number = 24): number {
    const now = Date.now();
    const cutoff = now - (hours * 60 * 60 * 1000);
    return this.calls.filter(call => call.timestamp > cutoff).length;
  }

  getRemainingQuota(): number {
    const used = this.getCount(24);
    return Math.max(0, 50 - used); // 50회/일 제한
  }

  getStats(): {
    last24h: number;
    last1h: number;
    remaining: number;
  } {
    return {
      last24h: this.getCount(24),
      last1h: this.getCount(1),
      remaining: this.getRemainingQuota(),
    };
  }
}

export const apiTracker = new APICallTracker();
