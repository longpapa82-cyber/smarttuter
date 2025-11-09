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
    const forbiddenKeywords = this.getForbiddenKeywords(subject, constraints, gradeLevel, gradeLevelDetail);

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
    constraints: any,
    gradeLevel?: GradeLevel,
    gradeLevelDetail?: GradeLevelDetail
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

    if (subject === 'korean') {
      return this.getKoreanForbiddenKeywords(gradeLevel || 'elementary', gradeLevelDetail);
    }

    return [];
  }

  /**
   * 국어 과목 학년별 금지 키워드
   */
  private getKoreanForbiddenKeywords(
    gradeLevel: GradeLevel,
    gradeLevelDetail?: GradeLevelDetail
  ): string[] {
    // 초등학교: 중/고등 문법 용어 금지
    if (gradeLevel === 'elementary') {
      return [
        '형태소', '음운', '음절', '음소', '형태론', '통사론', '의미론',
        '문법론', '어문 규정', '표준어 규정', '외래어 표기법',
        '국어사', '고전 문법', '중세 국어', '근대 국어',
        '품사론', '문장 성분', '주성분', '부속성분', '독립성분',
        '안은문장', '안긴문장', '관형절', '명사절', '부사절', '서술절', '인용절',
        '능동', '피동', '사동', '이중 피동', '이중 사동',
        '겹문장', '이어진문장', '연결어미', '전성어미',
        // 고급 문학 이론
        '소설론', '시론', '극론', '수필론',
        '서사', '서정', '극', '교술',
        '내재율', '외재율', '모음조화',
        '동화', '탈락', '축약', '첨가',
        '시점', '이인칭', '작중화자', '전지적 시점',
        '복선', '반어', '역설', '풍자', '상징', '알레고리'
      ];
    }

    // 중학교: 고급 문법/고전문학 금지
    if (gradeLevel === 'middle') {
      return [
        '국어사', '고전 문법', '중세 국어', '근대 국어',
        '음운 변동', '동화', '탈락', '축약', '첨가', '도치',
        '형태소 분석', '형태론', '통사론',
        '표준어 규정', '외래어 표기법', '로마자 표기법',
        '이중 피동', '이중 사동',
        '고전 시가론', '향가', '고려가요', '시조', '가사',
        '고소설', '한문학', '판소리', '민요',
        '구조주의', '형식주의', '신비평',
        '정신분석 비평', '마르크스 비평'
      ];
    }

    // 고등학교: 대학 전공 수준 금지
    if (gradeLevel === 'high') {
      return [
        '생성문법', '변형문법', '촘스키',
        '구조주의 언어학', '소쉬르',
        '화용론', '담화 분석', '텍스트 언어학',
        '역사 언어학', '비교 언어학',
        '심리언어학', '사회언어학', '응용언어학',
        '음성학', '음운론 이론',
        // 고급 문학 이론
        '탈구조주의', '해체주의', '포스트모더니즘',
        '페미니즘 비평', '후기 식민주의 비평',
        '신역사주의', '문화 연구',
        '정전론', '캐논', '이데올로기 비평'
      ];
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
