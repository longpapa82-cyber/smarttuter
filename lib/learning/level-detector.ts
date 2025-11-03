// lib/learning/level-detector.ts

/**
 * CEFR 레벨 감지 시스템
 * 대화 내용을 분석하여 학생의 영어 수준을 자동으로 평가
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelAssessment {
  currentLevel: CEFRLevel;
  confidence: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendedLevel: CEFRLevel;
  assessmentDetails: {
    vocabularyLevel: CEFRLevel;
    grammarLevel: CEFRLevel;
    sentenceComplexity: CEFRLevel;
    overallScore: number;
  };
  nextSteps: string[];
}

export interface ConversationMessage {
  content: string;
  timestamp?: Date;
}

/**
 * CEFR 레벨별 특징
 */
const CEFR_CHARACTERISTICS = {
  A1: {
    vocabularySize: 500,
    avgWordsPerSentence: 5,
    commonWords: ['hello', 'yes', 'no', 'I', 'you', 'is', 'am', 'the', 'a'],
    grammarPatterns: ['simple present', 'basic pronouns', 'simple questions'],
    description: '기초 입문',
  },
  A2: {
    vocabularySize: 1000,
    avgWordsPerSentence: 8,
    commonWords: ['because', 'but', 'when', 'where', 'how', 'very', 'much', 'many'],
    grammarPatterns: ['simple past', 'future with will', 'basic modals', 'comparative'],
    description: '초급',
  },
  B1: {
    vocabularySize: 2000,
    avgWordsPerSentence: 12,
    commonWords: ['although', 'however', 'therefore', 'actually', 'basically', 'generally'],
    grammarPatterns: ['present perfect', 'conditionals', 'passive voice', 'complex sentences'],
    description: '중급 1',
  },
  B2: {
    vocabularySize: 4000,
    avgWordsPerSentence: 15,
    commonWords: ['nevertheless', 'furthermore', 'consequently', 'regarding', 'concerning'],
    grammarPatterns: ['all tenses', 'reported speech', 'mixed conditionals', 'subjunctive'],
    description: '중급 2',
  },
  C1: {
    vocabularySize: 8000,
    avgWordsPerSentence: 18,
    commonWords: ['notwithstanding', 'albeit', 'whereby', 'hitherto', 'thereof'],
    grammarPatterns: ['advanced structures', 'inversion', 'emphasis', 'formal register'],
    description: '고급 1',
  },
  C2: {
    vocabularySize: 16000,
    avgWordsPerSentence: 22,
    commonWords: ['heretofore', 'erstwhile', 'vis-à-vis', 'ipso facto', 'de facto'],
    grammarPatterns: ['native-like fluency', 'idiomatic expressions', 'nuanced register'],
    description: '고급 2 (원어민)',
  },
};

/**
 * 어휘 복잡도 분석
 */
export function analyzeVocabularyLevel(messages: ConversationMessage[]): CEFRLevel {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  const words = allText.match(/\b[a-z]+\b/g) || [];
  const uniqueWords = new Set(words);
  const vocabularySize = uniqueWords.size;

  // 평균 단어 길이 (복잡도 지표)
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

  // 고급 어휘 사용 빈도
  const advancedWords = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  };

  for (const word of words) {
    if (CEFR_CHARACTERISTICS.C2.commonWords.some(w => word.includes(w))) {
      advancedWords.C2++;
    } else if (CEFR_CHARACTERISTICS.C1.commonWords.some(w => word.includes(w))) {
      advancedWords.C1++;
    } else if (CEFR_CHARACTERISTICS.B2.commonWords.some(w => word.includes(w))) {
      advancedWords.B2++;
    } else if (CEFR_CHARACTERISTICS.B1.commonWords.some(w => word.includes(w))) {
      advancedWords.B1++;
    } else if (CEFR_CHARACTERISTICS.A2.commonWords.some(w => word.includes(w))) {
      advancedWords.A2++;
    } else if (CEFR_CHARACTERISTICS.A1.commonWords.some(w => word.includes(w))) {
      advancedWords.A1++;
    }
  }

  // 레벨 결정 로직
  if (vocabularySize < 50 || avgWordLength < 3.5) return 'A1';
  if (vocabularySize < 100 || avgWordLength < 4.0) return 'A2';
  if (vocabularySize < 200 || avgWordLength < 4.5) return 'B1';
  if (vocabularySize < 400 || avgWordLength < 5.0) return 'B2';
  if (vocabularySize < 800 || avgWordLength < 5.5) return 'C1';
  return 'C2';
}

/**
 * 문장 구조 복잡도 분석
 */
export function analyzeSentenceComplexity(messages: ConversationMessage[]): CEFRLevel {
  const allText = messages.map(m => m.content).join(' ');
  const sentences = allText.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length === 0) return 'A1';

  // 평균 문장 길이 (단어 수)
  const avgSentenceLength = sentences.reduce((sum, s) => {
    const words = s.match(/\b[a-z]+\b/gi) || [];
    return sum + words.length;
  }, 0) / sentences.length;

  // 복잡한 문장 패턴 감지
  const complexPatterns = {
    subordinateClauses: /\b(although|because|since|while|whereas|if|unless|until)\b/gi,
    relativePronouns: /\b(who|whom|whose|which|that)\b/gi,
    passiveVoice: /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
    perfectTenses: /\b(have|has|had)\s+\w+ed\b/gi,
    modalVerbs: /\b(could|would|should|might|must|ought)\b/gi,
  };

  let complexityScore = 0;
  for (const [pattern, regex] of Object.entries(complexPatterns)) {
    const matches = allText.match(regex);
    if (matches) complexityScore += matches.length;
  }

  // 문장당 복잡도
  const complexityPerSentence = complexityScore / sentences.length;

  // 레벨 결정
  if (avgSentenceLength < 6 || complexityPerSentence < 0.5) return 'A1';
  if (avgSentenceLength < 9 || complexityPerSentence < 1.0) return 'A2';
  if (avgSentenceLength < 13 || complexityPerSentence < 1.5) return 'B1';
  if (avgSentenceLength < 16 || complexityPerSentence < 2.0) return 'B2';
  if (avgSentenceLength < 20 || complexityPerSentence < 3.0) return 'C1';
  return 'C2';
}

/**
 * 문법 레벨 분석
 */
export function analyzeGrammarLevel(messages: ConversationMessage[]): CEFRLevel {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();

  // 문법 패턴 매칭
  const grammarPatterns = {
    A1: [
      /\bi am\b/g,
      /\byou are\b/g,
      /\bhe is\b/g,
      /\bshe is\b/g,
      /\bit is\b/g,
    ],
    A2: [
      /\b(i|you|he|she|it|we|they) (was|were)\b/g,
      /\bwill (go|be|have)\b/g,
      /\b(more|less) \w+ than\b/g,
    ],
    B1: [
      /\b(have|has) \w+ed\b/g,
      /\bif .+ (will|would)\b/g,
      /\b(is|are|was|were) being \w+ed\b/g,
    ],
    B2: [
      /\b(had) \w+ed\b/g,
      /\bwish .+ (would|could)\b/g,
      /\breported (that|how|what|when)\b/g,
    ],
    C1: [
      /\bhad .+ been \w+ing\b/g,
      /\bnot only .+ but also\b/g,
      /\b(scarcely|hardly|rarely) .+ (when|before)\b/g,
    ],
    C2: [
      /\bwere .+ to\b/g,
      /\blest .+ should\b/g,
      /\bnotwithstanding .+ (the|that)\b/g,
    ],
  };

  const scores: Record<CEFRLevel, number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  };

  for (const [level, patterns] of Object.entries(grammarPatterns)) {
    for (const pattern of patterns) {
      const matches = allText.match(pattern);
      if (matches) {
        scores[level as CEFRLevel] += matches.length;
      }
    }
  }

  // 가장 높은 점수의 레벨 찾기
  const sortedLevels = (Object.keys(scores) as CEFRLevel[]).sort((a, b) => scores[b] - scores[a]);

  // 최소 2개 이상의 패턴이 있어야 해당 레벨로 인정
  for (const level of sortedLevels) {
    if (scores[level] >= 2) return level;
  }

  return 'A1'; // 기본값
}

/**
 * 종합 레벨 평가
 */
export function assessLevel(messages: ConversationMessage[]): LevelAssessment {
  if (messages.length === 0) {
    return {
      currentLevel: 'A1',
      confidence: 0,
      strengths: [],
      weaknesses: ['대화 데이터가 부족합니다. 더 많이 대화해보세요.'],
      recommendedLevel: 'A1',
      assessmentDetails: {
        vocabularyLevel: 'A1',
        grammarLevel: 'A1',
        sentenceComplexity: 'A1',
        overallScore: 0,
      },
      nextSteps: ['영어 튜터와 대화를 시작해보세요!'],
    };
  }

  // 각 영역별 레벨 분석
  const vocabularyLevel = analyzeVocabularyLevel(messages);
  const grammarLevel = analyzeGrammarLevel(messages);
  const sentenceComplexity = analyzeSentenceComplexity(messages);

  // 레벨을 숫자로 변환 (평균 계산을 위해)
  const levelToNumber = (level: CEFRLevel): number => {
    const mapping = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    return mapping[level];
  };

  const numberToLevel = (num: number): CEFRLevel => {
    const rounded = Math.round(num);
    const mapping: Record<number, CEFRLevel> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
    return mapping[rounded] || 'A1';
  };

  // 가중 평균 계산 (어휘 40%, 문법 40%, 문장 복잡도 20%)
  const avgScore =
    levelToNumber(vocabularyLevel) * 0.4 +
    levelToNumber(grammarLevel) * 0.4 +
    levelToNumber(sentenceComplexity) * 0.2;

  const currentLevel = numberToLevel(avgScore);
  const overallScore = avgScore * 16.67; // 0-100 점수로 변환

  // 신뢰도 계산 (더 많은 메시지 = 더 높은 신뢰도)
  const confidence = Math.min(100, messages.length * 10);

  // 강점/약점 분석
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const vocabNum = levelToNumber(vocabularyLevel);
  const grammarNum = levelToNumber(grammarLevel);
  const complexityNum = levelToNumber(sentenceComplexity);

  if (vocabNum >= avgScore) {
    strengths.push(`어휘력이 우수합니다 (${CEFR_CHARACTERISTICS[vocabularyLevel].description})`);
  } else {
    weaknesses.push(`어휘력 향상이 필요합니다 (현재 ${CEFR_CHARACTERISTICS[vocabularyLevel].description})`);
  }

  if (grammarNum >= avgScore) {
    strengths.push(`문법 사용이 정확합니다 (${CEFR_CHARACTERISTICS[grammarLevel].description})`);
  } else {
    weaknesses.push(`문법 연습이 필요합니다 (현재 ${CEFR_CHARACTERISTICS[grammarLevel].description})`);
  }

  if (complexityNum >= avgScore) {
    strengths.push(`복잡한 문장 구사 능력이 좋습니다 (${CEFR_CHARACTERISTICS[sentenceComplexity].description})`);
  } else {
    weaknesses.push(`문장 구조를 다양하게 연습해보세요 (현재 ${CEFR_CHARACTERISTICS[sentenceComplexity].description})`);
  }

  // 추천 레벨 (현재 레벨 또는 한 단계 위)
  const currentNum = levelToNumber(currentLevel);
  const recommendedNum = Math.min(6, currentNum + (confidence > 70 ? 1 : 0));
  const recommendedLevel = numberToLevel(recommendedNum);

  // 다음 단계 제안
  const nextSteps: string[] = [];

  if (weaknesses.includes('어휘력 향상이 필요합니다')) {
    nextSteps.push(`${CEFR_CHARACTERISTICS[recommendedLevel].description} 레벨 어휘 학습`);
    nextSteps.push('매일 새로운 단어 10개씩 익히기');
  }

  if (weaknesses.includes('문법 연습이 필요합니다')) {
    nextSteps.push(`${grammarLevel} 레벨 문법 패턴 집중 연습`);
    nextSteps.push('문법 예문을 따라 쓰고 말하기');
  }

  if (weaknesses.includes('문장 구조를 다양하게 연습해보세요')) {
    nextSteps.push('긴 문장 만들기 연습');
    nextSteps.push('접속사와 관계대명사 활용하기');
  }

  if (nextSteps.length === 0) {
    nextSteps.push(`${recommendedLevel} 레벨 학습 자료로 실력 향상`);
    nextSteps.push('다양한 주제로 대화 연습하기');
  }

  return {
    currentLevel,
    confidence: Math.round(confidence),
    strengths,
    weaknesses,
    recommendedLevel,
    assessmentDetails: {
      vocabularyLevel,
      grammarLevel,
      sentenceComplexity,
      overallScore: Math.round(overallScore),
    },
    nextSteps,
  };
}

/**
 * 레벨별 추천 학습 자료
 */
export function getRecommendedContent(level: CEFRLevel): {
  topics: string[];
  grammarFocus: string[];
  vocabularyThemes: string[];
  practiceActivities: string[];
} {
  const recommendations = {
    A1: {
      topics: ['자기소개', '일상생활', '가족', '취미', '음식'],
      grammarFocus: ['be동사', '일반동사 현재형', '단수/복수', '기본 의문문'],
      vocabularyThemes: ['숫자', '색깔', '요일', '날씨', '기본 동사'],
      practiceActivities: ['인사하기', '자기소개하기', '물건 이름 말하기', '간단한 질문하기'],
    },
    A2: {
      topics: ['쇼핑', '여행', '건강', '날씨', '직업'],
      grammarFocus: ['과거형', '미래형(will)', '비교급/최상급', '기본 조동사'],
      vocabularyThemes: ['교통수단', '장소', '시간 표현', '형용사'],
      practiceActivities: ['물건 사기', '길 묻기', '예약하기', '경험 말하기'],
    },
    B1: {
      topics: ['교육', '기술', '환경', '문화', '사회 이슈'],
      grammarFocus: ['현재완료', '조건문', '수동태', '간접화법'],
      vocabularyThemes: ['추상적 개념', '감정 표현', '의견 표현', '연결어'],
      practiceActivities: ['의견 나누기', '경험 설명하기', '계획 말하기', '이유 설명하기'],
    },
    B2: {
      topics: ['비즈니스', '과학', '정치', '예술', '국제 관계'],
      grammarFocus: ['모든 시제', '혼합 조건문', '가정법', '강조 구문'],
      vocabularyThemes: ['전문 용어', '관용 표현', '뉘앙스', '격식/비격식'],
      practiceActivities: ['토론하기', '프레젠테이션', '논증하기', '요약하기'],
    },
    C1: {
      topics: ['학술', '철학', '경제', '법률', '고급 문학'],
      grammarFocus: ['도치', '생략', '복잡한 문장 구조', '수사학적 표현'],
      vocabularyThemes: ['학술 어휘', '전문 분야', '문체', '비유적 표현'],
      practiceActivities: ['학술 토론', '논문 발표', '비판적 분석', '창작'],
    },
    C2: {
      topics: ['모든 주제 (원어민 수준)'],
      grammarFocus: ['원어민 수준 문법', '미묘한 뉘앙스', '방언', '전문 용어'],
      vocabularyThemes: ['전문가 수준', '문학적 표현', '역사적 용법', '신조어'],
      practiceActivities: ['원어민과 동등한 대화', '전문 분야 글쓰기', '통역/번역', '강의'],
    },
  };

  return recommendations[level];
}

/**
 * 학년별 적절한 CEFR 레벨 매핑
 */
export function getAppropriateLevel(gradeLevel: string): CEFRLevel {
  if (gradeLevel.includes('초등')) {
    const grade = parseInt(gradeLevel.match(/\d+/)?.[0] || '1');
    if (grade <= 3) return 'A1';
    if (grade <= 6) return 'A2';
  } else if (gradeLevel.includes('중학')) {
    const grade = parseInt(gradeLevel.match(/\d+/)?.[0] || '1');
    if (grade === 1) return 'A2';
    if (grade === 2) return 'B1';
    return 'B1';
  } else if (gradeLevel.includes('고등')) {
    const grade = parseInt(gradeLevel.match(/\d+/)?.[0] || '1');
    if (grade === 1) return 'B1';
    if (grade === 2) return 'B2';
    return 'B2';
  } else if (gradeLevel.includes('대학')) {
    return 'C1';
  }

  return 'A1'; // 기본값
}
