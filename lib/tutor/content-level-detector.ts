/**
 * 콘텐츠 수준 감지기
 * 학생의 질문이 현재 학교급 수준을 벗어났는지 감지
 * 하이브리드 방식: 키워드 감지 (빠름) + 의미 분석 (정확함)
 */

import {
  ContentLevelDetection,
  GradeLevel,
  Subject,
  GradeLevelDetail,
} from '@/types/tutor';
import { getConstraintsForProfile } from './constraints';

export class ContentLevelDetector {
  /**
   * 하이브리드 감지: 키워드 + 의미 분석
   */
  async detect(
    userInput: string,
    gradeLevel: GradeLevel,
    subject: Subject,
    gradeLevelDetail?: GradeLevelDetail
  ): Promise<ContentLevelDetection> {
    // Step 1: 빠른 키워드 감지
    const keywordResult = this.keywordDetection(
      userInput,
      gradeLevel,
      subject,
      gradeLevelDetail
    );

    // 높은 신뢰도면 바로 반환
    if (keywordResult.outOfScope && keywordResult.confidence > 0.8) {
      return {
        ...keywordResult,
        detectionMethod: 'keyword',
      };
    }

    // Step 2: 의미 분석은 현재는 키워드 결과 반환 (추후 AI 분석 추가 가능)
    return {
      ...keywordResult,
      detectionMethod: 'keyword',
    };
  }

  /**
   * 키워드 기반 감지 (빠름, 효율적)
   */
  private keywordDetection(
    input: string,
    gradeLevel: GradeLevel,
    subject: Subject,
    gradeLevelDetail?: GradeLevelDetail
  ): ContentLevelDetection {
    const constraints = getConstraintsForProfile(gradeLevel, gradeLevelDetail);
    const inputLower = input.toLowerCase();

    // 금지된 키워드 추출
    const forbiddenKeywords = this.getForbiddenKeywords(subject, constraints);

    // 감지된 키워드 찾기
    const detectedKeywords = forbiddenKeywords.filter((keyword) =>
      inputLower.includes(keyword.toLowerCase())
    );

    if (detectedKeywords.length > 0) {
      // 수준 초과 감지
      const suggestedLevel = this.getSuggestedLevel(
        gradeLevel,
        detectedKeywords
      );

      return {
        outOfScope: true,
        confidence: 0.9,
        detectedKeywords,
        suggestedLevel,
        reason: `Detected advanced topics: ${detectedKeywords.join(', ')}`,
      };
    }

    // 적절한 수준
    return {
      outOfScope: false,
      confidence: 0.7,
      reason: 'No forbidden keywords detected',
    };
  }

  /**
   * 제약 조건에서 금지된 키워드 추출
   */
  private getForbiddenKeywords(
    subject: Subject,
    constraints: any
  ): string[] {
    if (subject === 'english' && constraints.englishConstraints) {
      return [
        ...constraints.englishConstraints.vocabularyLevel.forbiddenTopics,
        ...constraints.englishConstraints.grammarComplexity
          .forbiddenStructures,
      ];
    }

    if (subject === 'math' && constraints.mathConstraints) {
      return constraints.mathConstraints.topicScope.forbiddenTopics;
    }

    return [];
  }

  /**
   * 감지된 키워드로부터 추천 학교급 추정
   */
  private getSuggestedLevel(
    currentLevel: GradeLevel,
    keywords: string[]
  ): string {
    // 간단한 휴리스틱: 고급 키워드 → 상위 학교급
    const advancedMathKeywords = [
      'calculus',
      '미적분',
      'derivative',
      'integral',
      'limit',
      '극한',
      '도함수',
      '적분',
    ];
    const universityKeywords = [
      'differential equation',
      'linear algebra',
      'multivariable',
      '미분방정식',
      '선형대수',
      '다변수',
    ];

    const hasUniversityKeywords = keywords.some((kw) =>
      universityKeywords.some((uk) => kw.toLowerCase().includes(uk.toLowerCase()))
    );
    const hasAdvancedKeywords = keywords.some((kw) =>
      advancedMathKeywords.some((ak) => kw.toLowerCase().includes(ak.toLowerCase()))
    );

    if (hasUniversityKeywords) {
      return '대학교 (university)';
    }
    if (hasAdvancedKeywords && currentLevel === 'middle') {
      return '고등학교 (high school)';
    }
    if (currentLevel === 'elementary') {
      return '중학교 (middle school)';
    }
    if (currentLevel === 'middle') {
      return '고등학교 (high school)';
    }
    if (currentLevel === 'high') {
      return '대학교 (university)';
    }

    return '상위 학년 (higher grade)';
  }
}

// 싱글톤 인스턴스
export const contentLevelDetector = new ContentLevelDetector();
