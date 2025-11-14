/**
 * Enhanced Subject Filter with Confidence Threshold Enforcement
 *
 * Phase 2-1: 교과별 경계 강화 시스템
 *
 * 주요 기능:
 * 1. 신뢰도 임계값 강제 적용 (0.8 → 0.9)
 * 2. Quick 분류와 AI 분류 간 교차 검증
 * 3. 엄격한 필터링 모드 지원
 * 4. 상세한 리다이렉트 메시지 생성
 */

import { QuestionClassification } from './question-classifier';
import { OptimizedClassification } from '../cache/api-optimizer';

export interface EnhancedFilterConfig {
  /**
   * 최소 신뢰도 임계값 (0-1 범위)
   * 기본값: 0.9 (사용자 요구사항: 0.8에서 0.9로 상향)
   */
  minConfidenceThreshold: number;

  /**
   * Quick 분류와 AI 분류 간 교차 검증 필요 여부
   * true: 두 결과가 일치해야만 높은 신뢰도 인정
   */
  requireCrossValidation: boolean;

  /**
   * 엄격한 필터링 모드
   * true: 불확실한 경우 차단 (안전 우선)
   * false: 불확실한 경우 허용 (관대한 필터링)
   */
  strictMode: boolean;

  /**
   * Quick 분류 신뢰도 보정 계수 (0-1 범위)
   * Quick 분류는 키워드 기반이므로 AI보다 신뢰도 낮게 평가
   * 기본값: 0.85 (Quick 분류 신뢰도를 85%로 보정)
   */
  quickClassificationPenalty: number;
}

export interface EnhancedFilterResult {
  /**
   * 이 질문에 응답해야 하는지 여부
   */
  shouldRespond: boolean;

  /**
   * 최종 신뢰도 점수 (0-1 범위)
   */
  confidence: number;

  /**
   * 검증 방법
   */
  validationMethod: 'quick-only' | 'ai-only' | 'cross-validated' | 'conflict-resolved';

  /**
   * 리다이렉트 메시지 (응답하지 않을 경우)
   */
  redirectMessage?: string;

  /**
   * 필터링 결정 이유
   */
  filterReason: string;

  /**
   * 디버깅용 상세 정보
   */
  debug?: {
    aiConfidence: number;
    quickConfidence?: number;
    thresholdPassed: boolean;
    crossValidationResult?: 'match' | 'conflict' | 'not-applicable';
  };
}

/**
 * 기본 필터 설정
 *
 * Phase 5: Restored minConfidenceThreshold to 0.9 after RAG-first pipeline implementation
 * RAG-first 파이프라인 구현 완료 후 임계값을 0.9로 복원
 * RAG Direct (90%+ 신뢰도)가 Enhanced Filter 이전에 실행되어 먼저 반환되므로,
 * Enhanced Filter는 이제 RAG가 실패한 경우에만 실행되며 높은 기준(90%)을 유지할 수 있음
 */
export const DEFAULT_FILTER_CONFIG: EnhancedFilterConfig = {
  minConfidenceThreshold: 0.9, // 90% 이상만 허용 (Phase 5: 0.5 → 0.9 복원)
  requireCrossValidation: true,
  strictMode: true,
  quickClassificationPenalty: 0.85, // Quick 분류 신뢰도 15% 감소
};

/**
 * 교과별 리다이렉트 메시지 생성
 */
function generateRedirectMessage(
  currentTutor: 'english' | 'math' | 'science' | 'social-studies' | 'korean',
  detectedSubject?: string
): string {
  const tutorNames = {
    english: '영어',
    math: '수학',
    science: '과학',
    'social-studies': '사회',
    korean: '국어',
  };

  const currentTutorName = tutorNames[currentTutor];

  if (detectedSubject && detectedSubject !== currentTutor) {
    const detectedTutorName = tutorNames[detectedSubject as keyof typeof tutorNames] || '다른 교과';
    return `📚 **${currentTutorName} 튜터**입니다만, 질문이 **${detectedTutorName}** 관련으로 보여요.

해당 교과 튜터에게 질문하시면 더 정확한 답변을 받으실 수 있어요! 🎯`;
  }

  // 교과를 특정할 수 없는 경우
  return `📚 **${currentTutorName} 튜터**에서 도와드려요! ${currentTutorName} 관련 질문을 해주세요.

저는 ${currentTutorName} 전문 튜터예요. 다른 교과 질문은 해당 튜터에게 물어보시면 더 정확한 답변을 받으실 수 있어요! ✨`;
}

/**
 * Quick 분류와 AI 분류 간 교차 검증
 */
function crossValidateClassifications(
  aiClassification: QuestionClassification,
  quickClassification: OptimizedClassification | null,
  config: EnhancedFilterConfig
): {
  finalConfidence: number;
  validationMethod: EnhancedFilterResult['validationMethod'];
  crossValidationResult?: 'match' | 'conflict' | 'not-applicable';
} {
  // Quick 분류가 없으면 AI만 사용
  if (!quickClassification) {
    return {
      finalConfidence: aiClassification.confidence / 100,
      validationMethod: 'ai-only',
      crossValidationResult: 'not-applicable',
    };
  }

  // Quick 분류 신뢰도 보정 적용
  const adjustedQuickConfidence = (quickClassification.confidence / 100) * config.quickClassificationPenalty;
  const aiConfidence = aiClassification.confidence / 100;

  // 두 분류 결과가 일치하는지 확인
  const subjectsMatch = aiClassification.subject === quickClassification.subject;
  const bothOnTopic = aiClassification.isOnTopic && quickClassification.isOnTopic;

  if (subjectsMatch && bothOnTopic) {
    // ✅ 완전 일치: 두 신뢰도의 가중 평균 (AI 70%, Quick 30%)
    const finalConfidence = (aiConfidence * 0.7) + (adjustedQuickConfidence * 0.3);
    return {
      finalConfidence,
      validationMethod: 'cross-validated',
      crossValidationResult: 'match',
    };
  } else {
    // ❌ 불일치: AI 분류를 더 신뢰하되 신뢰도 감소
    console.warn('[Cross-Validation] Conflict detected:', {
      ai: { subject: aiClassification.subject, onTopic: aiClassification.isOnTopic },
      quick: { subject: quickClassification.subject, onTopic: quickClassification.isOnTopic },
    });

    // 불일치 시 AI 신뢰도에서 20% 감소
    const finalConfidence = aiConfidence * 0.8;
    return {
      finalConfidence,
      validationMethod: 'conflict-resolved',
      crossValidationResult: 'conflict',
    };
  }
}

/**
 * 향상된 교과별 필터링 함수
 *
 * @param aiClassification - AI 기반 질문 분류 결과
 * @param quickClassification - Quick 키워드 기반 분류 결과 (선택)
 * @param tutorType - 현재 튜터 교과
 * @param config - 필터 설정 (선택, 기본값 사용)
 * @returns 필터링 결과 및 상세 정보
 */
export function enhancedFilterBySubject(
  aiClassification: QuestionClassification,
  quickClassification: OptimizedClassification | null,
  tutorType: 'english' | 'math' | 'science' | 'social-studies' | 'korean',
  config: EnhancedFilterConfig = DEFAULT_FILTER_CONFIG
): EnhancedFilterResult {
  // 1️⃣ 교차 검증으로 최종 신뢰도 계산
  const { finalConfidence, validationMethod, crossValidationResult } =
    crossValidateClassifications(aiClassification, quickClassification, config);

  // 2️⃣ 신뢰도 임계값 체크
  const thresholdPassed = finalConfidence >= config.minConfidenceThreshold;

  // 디버깅 정보 수집
  const debug = {
    aiConfidence: aiClassification.confidence,
    quickConfidence: quickClassification?.confidence,
    thresholdPassed,
    crossValidationResult,
  };

  // 3️⃣ 교과 일치 여부 확인
  const subjectMatches = aiClassification.subject === tutorType || aiClassification.subject === 'other';
  const isOnTopic = aiClassification.isOnTopic;

  // 4️⃣ 필터링 결정 로직

  // Case 1: 교과 일치 + 높은 신뢰도 → 응답 허용
  if (subjectMatches && isOnTopic && thresholdPassed) {
    return {
      shouldRespond: true,
      confidence: finalConfidence,
      validationMethod,
      filterReason: `교과 일치 (${tutorType}) + 높은 신뢰도 (${(finalConfidence * 100).toFixed(1)}%)`,
      debug,
    };
  }

  // Case 2: 교과 일치하지만 낮은 신뢰도
  if (subjectMatches && isOnTopic && !thresholdPassed) {
    if (config.strictMode) {
      // 엄격 모드: 신뢰도 부족으로 차단
      return {
        shouldRespond: false,
        confidence: finalConfidence,
        validationMethod,
        redirectMessage: `죄송해요, 질문을 정확히 이해하지 못했어요. 😅

${tutorType === 'korean' ? '국어' : tutorType === 'english' ? '영어' : tutorType === 'math' ? '수학' : tutorType === 'science' ? '과학' : '사회'} 관련 질문을 좀 더 구체적으로 다시 물어봐 주시겠어요?`,
        filterReason: `신뢰도 부족 (${(finalConfidence * 100).toFixed(1)}% < ${(config.minConfidenceThreshold * 100).toFixed(0)}%)`,
        debug,
      };
    } else {
      // 관대한 모드: 낮은 신뢰도지만 허용
      return {
        shouldRespond: true,
        confidence: finalConfidence,
        validationMethod,
        filterReason: `관대한 필터링: 교과 일치 + 낮은 신뢰도 (${(finalConfidence * 100).toFixed(1)}%)`,
        debug,
      };
    }
  }

  // Case 3: 교과 불일치 → 리다이렉트
  if (!subjectMatches || !isOnTopic) {
    const detectedSubject = aiClassification.subject !== 'other' ? aiClassification.subject : undefined;
    return {
      shouldRespond: false,
      confidence: finalConfidence,
      validationMethod,
      redirectMessage: generateRedirectMessage(tutorType, detectedSubject),
      filterReason: `교과 불일치 (감지: ${aiClassification.subject}, 현재: ${tutorType})`,
      debug,
    };
  }

  // Case 4: 기본 케이스 (이론상 도달 불가)
  return {
    shouldRespond: false,
    confidence: finalConfidence,
    validationMethod,
    redirectMessage: generateRedirectMessage(tutorType),
    filterReason: '예상치 못한 분류 결과',
    debug,
  };
}

/**
 * 필터링 결과를 스트림 응답으로 변환
 */
export function createFilterRedirectStream(filterResult: EnhancedFilterResult): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      if (filterResult.redirectMessage) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: filterResult.redirectMessage })}\n\n`)
        );
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

/**
 * 필터링 통계 로깅
 */
export function logFilterDecision(
  tutorType: string,
  question: string,
  filterResult: EnhancedFilterResult
): void {
  const emoji = filterResult.shouldRespond ? '✅' : '🚫';
  const confidenceStr = (filterResult.confidence * 100).toFixed(1);

  console.log(
    `[Enhanced Filter] ${emoji} ${tutorType.toUpperCase()} | ` +
    `"${question.substring(0, 40)}..." | ` +
    `${confidenceStr}% (${filterResult.validationMethod}) | ` +
    `${filterResult.filterReason}`
  );

  if (filterResult.debug?.crossValidationResult === 'conflict') {
    console.warn(`[Enhanced Filter] ⚠️ Cross-validation conflict detected - using AI classification`);
  }
}
