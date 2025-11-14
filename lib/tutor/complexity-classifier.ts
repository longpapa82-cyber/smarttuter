/**
 * Phase 1 - Question Complexity Classifier
 *
 * Classifies questions into three complexity levels:
 * - Simple: Basic calculations, word meanings, simple facts (e.g., "2+3", "apple 뜻?")
 * - Intermediate: Concept explanations, problem solving (e.g., "이차방정식 푸는 법?")
 * - Advanced: Proofs, advanced theory (e.g., "페르마의 정리 증명")
 *
 * This prevents over-verbose responses to simple questions.
 */

export type QuestionComplexity = 'simple' | 'intermediate' | 'advanced';

export interface ComplexityAnalysis {
  complexity: QuestionComplexity;
  confidence: number;
  reasoning: string;
}

/**
 * Classify question complexity
 * Uses fast keyword-based patterns (no API call needed)
 */
export function classifyComplexity(
  question: string,
  subject: string
): ComplexityAnalysis {
  const trimmedQuestion = question.trim();
  const questionLower = trimmedQuestion.toLowerCase();

  // ========================================
  // SIMPLE PATTERNS (1-line answers needed)
  // ========================================

  // Pattern 1: Basic arithmetic (2+3, 10-5, 12*4, 100/5)
  const arithmeticPattern = /^\s*\d+\s*[\+\-\*\/×÷]\s*\d+\s*[=\?은는]?\s*$/;
  if (arithmeticPattern.test(trimmedQuestion)) {
    return {
      complexity: 'simple',
      confidence: 0.98,
      reasoning: 'Basic arithmetic calculation'
    };
  }

  // Pattern 2: Single word meaning (apple 뜻?, what is apple?)
  const wordMeaningPatterns = [
    /^.{1,15}\s*(뜻|의미|meaning)\??$/i,
    /^what\s+is\s+\w+\??$/i,
    /^.{1,15}(은|는|이란|이)\s+무엇/i,
  ];

  for (const pattern of wordMeaningPatterns) {
    if (pattern.test(trimmedQuestion)) {
      return {
        complexity: 'simple',
        confidence: 0.95,
        reasoning: 'Single word meaning query'
      };
    }
  }

  // Pattern 3: Direct answer questions (계산: 25, 답: 5)
  const directAnswerPattern = /^(계산|답|결과|answer)[:：]?\s*\d+/i;
  if (directAnswerPattern.test(trimmedQuestion)) {
    return {
      complexity: 'simple',
      confidence: 0.95,
      reasoning: 'Direct calculation result request'
    };
  }

  // Pattern 4: Very short questions (< 10 characters, likely simple)
  if (trimmedQuestion.length < 10 && /\d/.test(trimmedQuestion)) {
    return {
      complexity: 'simple',
      confidence: 0.85,
      reasoning: 'Very short question with numbers'
    };
  }

  // Pattern 5: Subject-specific simple patterns
  if (subject === 'math') {
    // Simple math questions
    const simpleMathKeywords = [
      /^구구단.*\d+단/i, // 구구단 3단
      /^.{1,20}\s*곱하기\s*\d+/i, // 3 곱하기 5
      /^.{1,20}\s*나누기\s*\d+/i, // 10 나누기 2
    ];

    for (const pattern of simpleMathKeywords) {
      if (pattern.test(trimmedQuestion)) {
        return {
          complexity: 'simple',
          confidence: 0.90,
          reasoning: 'Simple math operation'
        };
      }
    }
  }

  if (subject === 'english') {
    // Simple English questions
    const simpleEnglishKeywords = [
      /^how\s+do\s+you\s+say\s+.{1,20}\??$/i, // how do you say...
      /^.{1,20}\s*영어로\s*뭐/i, // ...영어로 뭐예요?
      /^translate\s+.{1,20}$/i, // translate ...
    ];

    for (const pattern of simpleEnglishKeywords) {
      if (pattern.test(trimmedQuestion)) {
        return {
          complexity: 'simple',
          confidence: 0.90,
          reasoning: 'Simple translation/word request'
        };
      }
    }
  }

  // ========================================
  // ADVANCED PATTERNS (detailed explanations needed)
  // ========================================

  const advancedKeywords = [
    // Math
    '증명', '정리', 'theorem', 'prove', 'proof', '유도', 'derive',
    '미분방정식', 'differential equation', '적분', 'integral',
    '군론', 'group theory', '위상수학', 'topology',
    '극한', 'limit', '연속성', 'continuity',

    // Science
    '양자', 'quantum', '상대성', 'relativity',
    '분자구조', 'molecular structure', '화학반응식',

    // General academic
    '심화', '고급', 'advanced', '원리', 'principle',
    '이론', 'theory', '공리', 'axiom',
  ];

  const hasAdvancedKeyword = advancedKeywords.some(kw =>
    questionLower.includes(kw.toLowerCase())
  );

  if (hasAdvancedKeyword) {
    return {
      complexity: 'advanced',
      confidence: 0.90,
      reasoning: 'Contains advanced topic keywords'
    };
  }

  // Advanced question patterns
  const advancedPatterns = [
    /증명.*하[시세요라]/i, // ...증명해라/증명하세요
    /유도.*하[시세요라]/i, // ...유도해라
    /.*왜.*인가\??$/i, // ...왜 그런가?
    /.*원리.*설명/i, // 원리를 설명...
  ];

  for (const pattern of advancedPatterns) {
    if (pattern.test(trimmedQuestion)) {
      return {
        complexity: 'advanced',
        confidence: 0.85,
        reasoning: 'Requires deep theoretical explanation'
      };
    }
  }

  // ========================================
  // INTERMEDIATE (default for concept questions)
  // ========================================

  // Intermediate indicators
  const intermediateKeywords = [
    '방법', '푸는', '풀이', 'solve', 'solution',
    '설명', 'explain', '어떻게', 'how',
    '개념', 'concept', '차이', 'difference',
    '예시', 'example', '문제', 'problem',
  ];

  const hasIntermediateKeyword = intermediateKeywords.some(kw =>
    questionLower.includes(kw.toLowerCase())
  );

  if (hasIntermediateKeyword) {
    return {
      complexity: 'intermediate',
      confidence: 0.80,
      reasoning: 'Standard concept or problem-solving question'
    };
  }

  // Question length heuristic
  if (trimmedQuestion.length > 50) {
    // Long questions are usually intermediate or advanced
    return {
      complexity: 'intermediate',
      confidence: 0.70,
      reasoning: 'Long question likely needs detailed explanation'
    };
  }

  // Default: Intermediate
  return {
    complexity: 'intermediate',
    confidence: 0.60,
    reasoning: 'Default classification for standard questions'
  };
}

/**
 * Get recommended response style based on complexity
 */
export function getResponseStyle(complexity: QuestionComplexity): {
  maxSentences: number;
  style: string;
  shouldIncludeExamples: boolean;
} {
  switch (complexity) {
    case 'simple':
      return {
        maxSentences: 2,
        style: 'concise',
        shouldIncludeExamples: false
      };
    case 'intermediate':
      return {
        maxSentences: 8,
        style: 'explanatory',
        shouldIncludeExamples: true
      };
    case 'advanced':
      return {
        maxSentences: 15,
        style: 'comprehensive',
        shouldIncludeExamples: true
      };
  }
}
