/**
 * Phase 7: Question Complexity Classification System
 *
 * Distinguishes between:
 * - CONCEPT questions: "What is X?" → RAG Direct
 * - PROBLEM_SOLVING questions: "Solve X" → API
 *
 * This prevents RAG Direct false positives on problem-solving requests.
 */

export type QuestionType = 'concept' | 'problem_solving' | 'creative' | 'other';

export interface ComplexityClassification {
  /** Question type */
  type: QuestionType;

  /** Confidence score (0-100) */
  confidence: number;

  /** Should use RAG Direct? */
  allowRAGDirect: boolean;

  /** Reasoning for classification */
  reason: string;
}

/**
 * Keyword-based complexity classification (fast, no API calls)
 */
export function classifyQuestionComplexity(
  question: string,
  subject: 'math' | 'english' | 'science' | 'social-studies' | 'korean'
): ComplexityClassification {
  const questionLower = question.toLowerCase();
  const questionKo = question;

  // ═══════════════════════════════════════════════════════════════
  // PROBLEM SOLVING INDICATORS (High Priority)
  // ═══════════════════════════════════════════════════════════════

  const problemSolvingPatterns = {
    math: [
      // English patterns
      /solve\s+/i,
      /calculate\s+/i,
      /find\s+(the\s+)?(value|solution|answer)/i,
      /compute\s+/i,
      /evaluate\s+/i,
      /simplify\s+/i,
      /factor\s+/i,
      /expand\s+/i,
      // Korean patterns
      /풀어\s*주/,
      /계산해\s*주/,
      /구해\s*주/,
      /해결해\s*주/,
      /답을\s*구/,
      /값을\s*구/,
      /풀이/,
      // Math equation patterns
      /\d+x[\^²³\d]*\s*[+\-]\s*\d+/,  // "3x^2 + 5x - 2"
      /=\s*\d+\s*$/,                   // ends with "= 0"
      /\d+\s*[+\-×÷*/]\s*\d+/,        // arithmetic: "5 + 3"
    ],

    english: [
      // Writing requests
      /write\s+(a\s+)?(story|essay|paragraph)/i,
      /compose\s+/i,
      /create\s+(a\s+)?(story|poem)/i,
      // Korean writing
      /작문해\s*주/,
      /글을?\s*써\s*주/,
      /이야기를?\s*만들/,
      /창작해\s*주/,
    ],

    science: [
      /calculate\s+/i,
      /solve\s+/i,
      /find\s+(the\s+)?mass/i,
      /계산해\s*주/,
      /구해\s*주/,
    ],

    'social-studies': [
      /write\s+(a\s+)?essay/i,
      /analyze\s+(the\s+)?impact/i,
      /에세이\s*작성/,
      /분석해\s*주/,
    ],

    korean: [],
  };

  const patterns = problemSolvingPatterns[subject] || [];
  for (const pattern of patterns) {
    if (pattern.test(question)) {
      return {
        type: 'problem_solving',
        confidence: 90,
        allowRAGDirect: false,
        reason: `Problem-solving pattern detected: ${pattern}`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CREATIVE TASKS (Writing, Stories)
  // ═══════════════════════════════════════════════════════════════

  const creativePatterns = [
    /write\s+(a\s+)?(creative|imaginative|fictional)/i,
    /tell\s+(me\s+)?(a\s+)?story/i,
    /create\s+(a\s+)?character/i,
    /imagine\s+/i,
    /창의적/,
    /상상해/,
  ];

  for (const pattern of creativePatterns) {
    if (pattern.test(question)) {
      return {
        type: 'creative',
        confidence: 85,
        allowRAGDirect: false,
        reason: 'Creative task requires generation',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CONCEPT QUESTIONS (What is X? Explain X)
  // ═══════════════════════════════════════════════════════════════

  const conceptPatterns = [
    // English patterns
    /^what\s+is\s+/i,
    /^what\s+are\s+/i,
    /^define\s+/i,
    /^explain\s+/i,
    /^describe\s+/i,
    /^tell\s+me\s+about\s+/i,
    /what\s+does\s+.+\s+mean/i,
    // Korean patterns (more flexible for Korean sentence structure)
    /이란?\s*무엇/,
    /란?\s*무엇/,
    /가\s*뭐/,
    /이\s*뭐/,
    /에\s*대해/,
    /설명해/,
    /알려\s*주/,
    /뜻/,
  ];

  for (const pattern of conceptPatterns) {
    if (pattern.test(question)) {
      return {
        type: 'concept',
        confidence: 85,
        allowRAGDirect: true,
        reason: `Concept question pattern: ${pattern}`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DEFAULT: Concept question (safe default for RAG Direct)
  // ═══════════════════════════════════════════════════════════════

  // If question is short (< 100 chars) and no problem-solving patterns,
  // likely a concept question
  if (question.length < 100) {
    return {
      type: 'concept',
      confidence: 60,
      allowRAGDirect: true,
      reason: 'Short question without problem-solving indicators',
    };
  }

  return {
    type: 'other',
    confidence: 50,
    allowRAGDirect: true,
    reason: 'No clear classification, allowing RAG Direct',
  };
}

/**
 * Check if question should use RAG Direct based on complexity
 */
export function shouldUseRAGDirect(
  question: string,
  subject: 'math' | 'english' | 'science' | 'social-studies' | 'korean',
  minConfidence: number = 80
): boolean {
  const classification = classifyQuestionComplexity(question, subject);

  // Problem-solving and creative tasks should never use RAG Direct
  if (classification.type === 'problem_solving' || classification.type === 'creative') {
    return false;
  }

  // Concept questions with sufficient confidence can use RAG Direct
  if (classification.type === 'concept' && classification.confidence >= minConfidence) {
    return true;
  }

  // Default: allow RAG Direct but with lower confidence threshold
  return classification.allowRAGDirect;
}

/**
 * Log complexity classification for debugging
 */
export function logComplexityClassification(
  question: string,
  classification: ComplexityClassification
): void {
  const emoji = classification.allowRAGDirect ? '✅' : '🚫';
  console.log(
    `[Complexity] ${emoji} Type: ${classification.type} | ` +
    `Confidence: ${classification.confidence}% | ` +
    `RAG Direct: ${classification.allowRAGDirect} | ` +
    `Question: "${question.substring(0, 50)}..."`
  );
  console.log(`[Complexity] Reason: ${classification.reason}`);
}
