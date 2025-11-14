/**
 * Enhanced Grade Level Filter with Review Allowance
 *
 * Phase 2-2: 학년 수준 통제 강화 시스템
 *
 * 주요 기능:
 * 1. 신뢰도 임계값 상향 (0.7 → 0.85)
 * 2. 복습 허용 로직 (현재 학년보다 낮은 내용 질문 가능)
 * 3. 선행 학습 차단 강화 (현재 학년보다 높은 내용 차단)
 * 4. 상세한 학년 수준 안내 메시지
 */

import { ContentLevelDetection, GradeLevel, Subject } from '@/types/tutor';

export interface EnhancedGradeLevelConfig {
  /**
   * 최소 신뢰도 임계값 (0-1 범위)
   * 기본값: 0.85 (사용자 요구사항: 0.7에서 0.85로 상향)
   */
  minConfidenceThreshold: number;

  /**
   * 복습 허용 여부
   * true: 현재 학년보다 낮은 내용 질문 허용
   * false: 정확히 현재 학년 수준만 허용
   */
  allowReview: boolean;

  /**
   * 엄격한 선행 학습 차단 모드
   * true: 높은 수준 내용 엄격히 차단
   * false: 약간의 선행 학습 허용
   */
  strictAdvancedBlocking: boolean;

  /**
   * 학년 경계 버퍼 (학년)
   * 예: 1이면 현재 학년 ±1 범위까지 허용
   */
  gradeBuffer: number;
}

export interface EnhancedGradeLevelResult {
  /**
   * 질문 허용 여부
   */
  shouldRespond: boolean;

  /**
   * 수준 판정
   */
  levelAssessment: 'appropriate' | 'review-allowed' | 'too-advanced' | 'uncertain';

  /**
   * 최종 신뢰도 (0-1 범위)
   */
  confidence: number;

  /**
   * 안내 메시지 (차단 시)
   */
  guidanceMessage?: string;

  /**
   * 필터링 결정 이유
   */
  filterReason: string;

  /**
   * 감지된 수준 정보
   */
  detectedLevel?: {
    current: string;
    suggested: string;
    keywords: string[];
  };

  /**
   * 디버깅용 상세 정보
   */
  debug?: {
    originalConfidence: number;
    thresholdPassed: boolean;
    isReview: boolean;
    isAdvanced: boolean;
  };
}

/**
 * 기본 필터 설정
 */
export const DEFAULT_GRADE_LEVEL_CONFIG: EnhancedGradeLevelConfig = {
  minConfidenceThreshold: 0.85, // 85% 이상만 허용 (상향)
  allowReview: true,             // 복습 허용
  strictAdvancedBlocking: true,  // 선행 학습 엄격 차단
  gradeBuffer: 0,                // 정확히 현재 학년만
};

/**
 * 학년 수준 비교 (숫자로 변환)
 */
function gradeToNumber(gradeLevel: GradeLevel): number {
  const gradeMap: Record<GradeLevel, number> = {
    'elementary': 1,
    'middle': 2,
    'high': 3,
    'university': 4,
  };
  return gradeMap[gradeLevel] || 1;
}

/**
 * 학년 수준 이름
 */
function gradeLevelName(gradeLevel: GradeLevel): string {
  const nameMap: Record<GradeLevel, string> = {
    'elementary': '초등학교',
    'middle': '중학교',
    'high': '고등학교',
    'university': '대학교',
  };
  return nameMap[gradeLevel] || '초등학교';
}

/**
 * 수준별 안내 메시지 생성
 */
function generateGuidanceMessage(
  currentLevel: GradeLevel,
  detectedLevel: string,
  subject: Subject,
  keywords: string[],
  isAdvanced: boolean
): string {
  const currentName = gradeLevelName(currentLevel);
  const subjectName = {
    'math': '수학',
    'english': '영어',
    'science': '과학',
    'social-studies': '사회',
    'korean': '국어',
  }[subject] || subject;

  if (isAdvanced) {
    // 선행 학습 차단 메시지
    return `📚 **${currentName} 수준에 맞는 학습을 추천해요!**

질문하신 내용은 **${detectedLevel}** 수준이에요.

🎯 **왜 지금은 어려울까요?**
- 감지된 고급 주제: ${keywords.slice(0, 3).map(k => `\`${k}\``).join(', ')}
- 이 내용은 ${detectedLevel}에서 배우는 내용이에요

💡 **대신 이렇게 해보세요:**
1. 현재 학년의 ${subjectName} 기초를 탄탄히 다져보세요
2. 기본 개념을 완전히 이해한 후 다음 단계로 나아가요
3. 선생님께 학년에 맞는 학습 자료를 요청해보세요

✨ **${currentName} ${subjectName}**에 대해 궁금한 점을 질문해주세요!`;
  }

  // 불확실한 경우
  return `🤔 질문 내용이 학년 수준과 맞는지 확실하지 않아요.

**${currentName} ${subjectName}** 관련 질문을 좀 더 구체적으로 다시 해주시겠어요?`;
}

/**
 * 복습인지 선행 학습인지 판단
 */
function assessLevelRelation(
  currentLevel: GradeLevel,
  suggestedLevel: string
): 'review' | 'advanced' | 'same' | 'unknown' {
  const currentNum = gradeToNumber(currentLevel);

  // suggestedLevel 파싱 (예: "중학교 (middle school)" → "middle")
  const levelMatch = suggestedLevel.match(/(elementary|middle|high|university)/i);
  if (!levelMatch) {
    return 'unknown';
  }

  const suggestedGrade = levelMatch[1].toLowerCase() as GradeLevel;
  const suggestedNum = gradeToNumber(suggestedGrade);

  if (suggestedNum < currentNum) {
    return 'review';
  } else if (suggestedNum > currentNum) {
    return 'advanced';
  } else {
    return 'same';
  }
}

/**
 * 향상된 학년 수준 필터링 함수
 *
 * @param levelDetection - content-level-detector의 감지 결과
 * @param currentGradeLevel - 학생의 현재 학교급
 * @param subject - 현재 교과
 * @param config - 필터 설정 (선택, 기본값 사용)
 * @returns 필터링 결과 및 상세 정보
 */
export function enhancedGradeLevelFilter(
  levelDetection: ContentLevelDetection,
  currentGradeLevel: GradeLevel,
  subject: Subject,
  config: EnhancedGradeLevelConfig = DEFAULT_GRADE_LEVEL_CONFIG
): EnhancedGradeLevelResult {
  // 1️⃣ 신뢰도 임계값 체크 (상향된 0.85)
  const thresholdPassed = levelDetection.confidence >= config.minConfidenceThreshold;

  // 디버깅 정보 수집
  const debug = {
    originalConfidence: levelDetection.confidence,
    thresholdPassed,
    isReview: false,
    isAdvanced: false,
  };

  // 2️⃣ 적절한 수준 - 즉시 허용
  if (!levelDetection.outOfScope) {
    return {
      shouldRespond: true,
      levelAssessment: 'appropriate',
      confidence: levelDetection.confidence,
      filterReason: `적절한 학년 수준 (${gradeLevelName(currentGradeLevel)})`,
      debug,
    };
  }

  // 3️⃣ 수준 초과 감지됨 - 복습 vs 선행 학습 판단
  if (levelDetection.outOfScope && levelDetection.suggestedLevel) {
    const levelRelation = assessLevelRelation(currentGradeLevel, levelDetection.suggestedLevel);

    debug.isReview = levelRelation === 'review';
    debug.isAdvanced = levelRelation === 'advanced';

    // Case A: 복습 (현재보다 낮은 수준)
    if (levelRelation === 'review' && config.allowReview) {
      return {
        shouldRespond: true,
        levelAssessment: 'review-allowed',
        confidence: levelDetection.confidence,
        filterReason: `복습 허용 (${levelDetection.suggestedLevel} → ${gradeLevelName(currentGradeLevel)})`,
        detectedLevel: {
          current: gradeLevelName(currentGradeLevel),
          suggested: levelDetection.suggestedLevel,
          keywords: levelDetection.detectedKeywords || [],
        },
        debug,
      };
    }

    // Case B: 선행 학습 (현재보다 높은 수준)
    if (levelRelation === 'advanced') {
      // 신뢰도가 임계값 이상이면 차단
      if (thresholdPassed && config.strictAdvancedBlocking) {
        const guidanceMessage = generateGuidanceMessage(
          currentGradeLevel,
          levelDetection.suggestedLevel,
          subject,
          levelDetection.detectedKeywords || [],
          true
        );

        return {
          shouldRespond: false,
          levelAssessment: 'too-advanced',
          confidence: levelDetection.confidence,
          guidanceMessage,
          filterReason: `선행 학습 차단 (${gradeLevelName(currentGradeLevel)} → ${levelDetection.suggestedLevel})`,
          detectedLevel: {
            current: gradeLevelName(currentGradeLevel),
            suggested: levelDetection.suggestedLevel,
            keywords: levelDetection.detectedKeywords || [],
          },
          debug,
        };
      }

      // 신뢰도가 낮으면 불확실 - 허용 (관대한 처리)
      return {
        shouldRespond: true,
        levelAssessment: 'uncertain',
        confidence: levelDetection.confidence,
        filterReason: `불확실 (신뢰도 ${(levelDetection.confidence * 100).toFixed(1)}% < ${(config.minConfidenceThreshold * 100).toFixed(0)}%)`,
        debug,
      };
    }

    // Case C: 동일 수준 or 불명확 - 허용
    return {
      shouldRespond: true,
      levelAssessment: 'appropriate',
      confidence: levelDetection.confidence,
      filterReason: `동일 학년 수준`,
      debug,
    };
  }

  // 4️⃣ 기본 케이스 (suggestedLevel 없음) - 신뢰도만 체크
  if (!thresholdPassed) {
    // 낮은 신뢰도 - 불확실하므로 허용 (관대한 처리)
    return {
      shouldRespond: true,
      levelAssessment: 'uncertain',
      confidence: levelDetection.confidence,
      filterReason: `낮은 신뢰도로 허용 (${(levelDetection.confidence * 100).toFixed(1)}%)`,
      debug,
    };
  }

  // 높은 신뢰도지만 suggestedLevel 없음 - 차단 (안전 우선)
  return {
    shouldRespond: false,
    levelAssessment: 'too-advanced',
    confidence: levelDetection.confidence,
    guidanceMessage: generateGuidanceMessage(
      currentGradeLevel,
      '상위 학년',
      subject,
      levelDetection.detectedKeywords || [],
      true
    ),
    filterReason: `수준 초과 감지 (suggestedLevel 미상)`,
    debug,
  };
}

/**
 * 필터링 결과를 스트림 응답으로 변환
 */
export function createGradeLevelGuidanceStream(result: EnhancedGradeLevelResult): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      if (result.guidanceMessage) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: result.guidanceMessage })}\n\n`)
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
export function logGradeLevelDecision(
  subject: string,
  question: string,
  currentGrade: string,
  result: EnhancedGradeLevelResult
): void {
  const emoji = result.shouldRespond ? '✅' : '🚫';
  const confidenceStr = (result.confidence * 100).toFixed(1);
  const assessment = {
    'appropriate': '적절',
    'review-allowed': '복습',
    'too-advanced': '선행',
    'uncertain': '불확실',
  }[result.levelAssessment];

  console.log(
    `[Grade Level Filter] ${emoji} ${subject.toUpperCase()} | ` +
    `"${question.substring(0, 40)}..." | ` +
    `Grade: ${currentGrade} | ` +
    `${assessment} (${confidenceStr}%) | ` +
    `${result.filterReason}`
  );

  if (result.detectedLevel) {
    console.log(
      `[Grade Level Filter] 📊 Detected: ${result.detectedLevel.suggested} | ` +
      `Keywords: ${result.detectedLevel.keywords.slice(0, 3).join(', ')}`
    );
  }
}
