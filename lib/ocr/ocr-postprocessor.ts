/**
 * OCR Post-processor
 *
 * Corrects common OCR misrecognitions in Korean math education context
 * Uses pattern-based rules and context-aware corrections
 */

export interface PostProcessResult {
  original: string;
  corrected: string;
  corrections: Correction[];
  confidence: number;
}

export interface Correction {
  type: 'misrecognition' | 'context' | 'math-symbol';
  original: string;
  corrected: string;
  position: number;
  reason: string;
}

/**
 * Common OCR misrecognitions in handwriting
 */
const MISRECOGNITION_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string;
  context?: RegExp; // Optional context check
  reason: string;
}> = [
  // Numbers vs Letters
  {
    pattern: /\b8\b(?=[\s]*[A-Z가-힣])/g, // 더 넓은 문맥: 한글, 알파벳
    replacement: 'B',
    reason: '숫자 8을 알파벳 B로 수정 (알파벳 문맥)'
  },
  {
    pattern: /\bB\b(?=\s*[+\-×÷=])/g,
    replacement: '8',
    reason: '알파벳 B를 숫자 8로 수정 (수식 문맥)'
  },
  {
    pattern: /\b1\b(?=[A-Z]{2,})/g,
    replacement: 'I',
    reason: '숫자 1을 알파벳 I로 수정'
  },
  {
    pattern: /\b0(?=[A-Z가-힣])/g, // word boundary 제거 (0A 같은 경우 인식)
    replacement: 'O',
    reason: '숫자 0을 알파벳 O로 수정'
  },
  {
    pattern: /\b5\b(?=[\s]*[A-Z가-힣])/g, // 더 넓은 문맥
    replacement: 'S',
    reason: '숫자 5를 알파벳 S로 수정'
  },
  {
    pattern: /\bZ\b(?=\s*[+\-×÷=])/g,
    replacement: '2',
    reason: '알파벳 Z를 숫자 2로 수정'
  },

  // Korean misrecognitions
  {
    pattern: /CollAl/g,
    replacement: 'C',
    reason: 'OCR 오인식 "CollAl"을 알파벳 C로 수정'
  },
  {
    pattern: /ㄱl/g,
    replacement: 'ㄱ',
    reason: '한글 ㄱ 오인식 수정'
  },
  {
    pattern: /ㄴl/g,
    replacement: 'ㄴ',
    reason: '한글 ㄴ 오인식 수정'
  },

  // Unit misrecognitions (ONLY apply with strong context)
  {
    pattern: /\b10\b(?=\s*$)/g,
    replacement: 'km',
    context: /거리는|길이는|거리가|길이가/, // More strict: require "는" or "가"
    reason: '거리 단위 문맥에서 10을 km으로 수정'
  },
  {
    pattern: /krn/gi, // word boundary 제거 (5krn 같은 경우 인식)
    replacement: 'km',
    reason: 'km 단위 오인식 수정'
  },
  {
    pattern: /\bcm\b(?=\d)/g,
    replacement: 'cm ',
    reason: 'cm 단위 띄어쓰기 보정'
  },

  // Math symbols
  {
    pattern: /×/g,
    replacement: '*',
    reason: '곱셈 기호 정규화'
  },
  {
    pattern: /÷/g,
    replacement: '/',
    reason: '나눗셈 기호 정규화'
  },
  {
    pattern: /－/g,
    replacement: '-',
    reason: '빼기 기호 정규화 (전각 → 반각)'
  },
  {
    pattern: /＋/g,
    replacement: '+',
    reason: '더하기 기호 정규화 (전각 → 반각)'
  },

  // Fraction patterns
  {
    pattern: /(\d+)\s*\/\s*(\d+)/g,
    replacement: '$1/$2',
    reason: '분수 띄어쓰기 제거'
  },

  // Root patterns
  {
    pattern: /√\s+/g,
    replacement: '√',
    reason: '루트 기호 띄어쓰기 제거'
  },
  {
    pattern: /\^(\d)/g,
    replacement: '^$1',
    reason: '지수 표기 정규화'
  },
];

/**
 * Context-aware pattern corrections
 */
const CONTEXT_PATTERNS: Array<{
  context: RegExp;
  corrections: Array<{ from: RegExp; to: string; reason: string }>;
}> = [
  {
    context: /삼각형|사각형|원|도형/,
    corrections: [
      { from: /([A-Z])8(?=[A-Z])/g, to: '$1B', reason: '도형 문맥에서 A8C → ABC' },
      { from: /\b8\b(?=[\s]*[가-힣])/g, to: 'B', reason: '도형 문맥에서 점 B' },
      { from: /\b1\b(?=[A-Z])/g, to: 'I', reason: '도형 문맥에서 점 I' },
    ],
  },
  {
    context: /거리|길이|km|m|cm/,
    corrections: [
      { from: /\b10\b(?!\d)/g, to: 'km', reason: '거리 단위 보정' },
    ],
  },
  {
    context: /좌표|점|위치/,
    corrections: [
      { from: /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, to: '($1, $2)', reason: '좌표 형식 정규화' },
    ],
  },
];

/**
 * Apply post-processing corrections to OCR result
 */
export function postProcessOCR(
  text: string,
  confidence: number = 1.0,
  context?: string
): PostProcessResult {
  let corrected = text;
  const corrections: Correction[] = [];
  let position = 0;

  // Step 1: Apply misrecognition pattern corrections
  for (const pattern of MISRECOGNITION_PATTERNS) {
    const matches = Array.from(corrected.matchAll(pattern.pattern));

    for (const match of matches) {
      // Check context if specified
      if (pattern.context && !pattern.context.test(context || text)) {
        continue;
      }

      const original = match[0];
      const matchPosition = match.index || 0;

      corrections.push({
        type: 'misrecognition',
        original,
        corrected: pattern.replacement,
        position: matchPosition,
        reason: pattern.reason,
      });
    }

    corrected = corrected.replace(pattern.pattern, pattern.replacement);
  }

  // Step 2: Apply context-aware corrections
  if (context) {
    for (const contextPattern of CONTEXT_PATTERNS) {
      if (contextPattern.context.test(context)) {
        for (const correction of contextPattern.corrections) {
          const matches = Array.from(corrected.matchAll(correction.from));

          for (const match of matches) {
            const original = match[0];
            const matchPosition = match.index || 0;

            corrections.push({
              type: 'context',
              original,
              corrected: correction.to,
              position: matchPosition,
              reason: correction.reason,
            });
          }

          corrected = corrected.replace(correction.from, correction.to);
        }
      }
    }
  }

  // Step 3: Math symbol normalization
  corrected = normalizeMathSymbols(corrected, corrections);

  // Calculate adjusted confidence
  const adjustedConfidence = calculateAdjustedConfidence(
    confidence,
    corrections.length,
    text.length
  );

  return {
    original: text,
    corrected,
    corrections,
    confidence: adjustedConfidence,
  };
}

/**
 * Normalize mathematical symbols and expressions
 */
function normalizeMathSymbols(text: string, corrections: Correction[]): string {
  let normalized = text;

  // IMPORTANT: Keep fractions tight first (before general operator spacing)
  normalized = normalized.replace(/(\d)\s*\/\s*(\d)/g, '$1/$2');

  // Normalize spacing around operators
  // Keep division tight (already handled), space others
  normalized = normalized.replace(/\s*([+\-*=])\s*/g, ' $1 ');

  // For division NOT in fractions (e.g., "12 ÷ 3" becomes "12 / 3")
  // Add spaces around "/" if not already a fraction
  normalized = normalized.replace(/(\d+)\/(?!\d)/g, '$1 /'); // After number, no digit follows
  normalized = normalized.replace(/(?<!\d)\/(\d+)/g, '/ $1'); // Before number, no digit precedes

  // Normalize parentheses
  normalized = normalized.replace(/\(\s+/g, '(');
  normalized = normalized.replace(/\s+\)/g, ')');

  // Remove extra spaces
  normalized = normalized.replace(/\s{2,}/g, ' ').trim();

  return normalized;
}

/**
 * Calculate adjusted confidence based on corrections applied
 */
function calculateAdjustedConfidence(
  originalConfidence: number,
  correctionCount: number,
  textLength: number
): number {
  if (correctionCount === 0) {
    return originalConfidence;
  }

  // Each correction slightly reduces confidence
  // But having corrections applied can actually increase trust in the result
  const correctionRatio = correctionCount / Math.max(textLength, 1);

  // Small number of corrections (< 10% of text): slight boost
  // Large number of corrections (> 30% of text): reduce confidence
  if (correctionRatio < 0.1) {
    return Math.min(originalConfidence + 0.05, 1.0);
  } else if (correctionRatio > 0.3) {
    return Math.max(originalConfidence - 0.1, 0.5);
  }

  return originalConfidence;
}

/**
 * Get correction summary for logging
 */
export function getCorrectionSummary(result: PostProcessResult): string {
  if (result.corrections.length === 0) {
    return '수정 없음';
  }

  const byType: Record<string, number> = {};
  for (const correction of result.corrections) {
    byType[correction.type] = (byType[correction.type] || 0) + 1;
  }

  const summary = Object.entries(byType)
    .map(([type, count]) => `${type}: ${count}개`)
    .join(', ');

  return `${result.corrections.length}개 수정 (${summary})`;
}
