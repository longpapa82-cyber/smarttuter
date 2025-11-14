/**
 * Phase 7: AI Retry Handler with Exponential Backoff
 *
 * Handles AI failures (empty responses, timeouts) with:
 * - Retry mechanism (up to 3 attempts)
 * - Exponential backoff (500ms, 1000ms, 2000ms)
 * - Keyword-based fallback extraction
 */

/**
 * Extract keywords from question when AI fails
 * This provides a fallback for topic identification
 */
export function extractKeywordsFromQuestion(
  question: string,
  subject: 'math' | 'english' | 'science' | 'social-studies' | 'korean'
): string[] {
  const keywords: string[] = [];

  // Subject-specific keyword extraction
  const keywordMaps = {
    math: {
      // Operations
      addition: ['덧셈', '더하기', 'addition', 'add', 'plus', '합'],
      subtraction: ['뺄셈', '빼기', 'subtraction', 'subtract', 'minus', '차'],
      multiplication: ['곱셈', '곱하기', 'multiplication', 'multiply', 'times', '곱'],
      division: ['나눗셈', '나누기', 'division', 'divide', '몫'],
      fractions: ['분수', 'fraction', 'numerator', 'denominator', '분모', '분자'],
      decimals: ['소수', 'decimal', '소수점'],
      equations: ['방정식', 'equation', '일차', '이차', 'linear', 'quadratic'],
    },

    english: {
      'present tense': ['현재', '시제', 'present', 'tense', '현재형'],
      'present perfect': ['현재완료', 'present perfect', '완료'],
      'passive voice': ['수동태', 'passive', 'voice', '피동'],
      'past tense': ['과거', 'past', 'tense', '과거형'],
    },

    science: {
      photosynthesis: ['광합성', 'photosynthesis', 'chlorophyll', '엽록소'],
      'cell structure': ['세포', 'cell', '세포막', 'nucleus', '핵'],
      evolution: ['진화', 'evolution', 'natural selection', '자연선택'],
    },

    'social-studies': {
      'government systems': ['정부', 'government', '삼권분립', 'branches', '정치'],
      democracy: ['민주주의', 'democracy', '민주', 'democratic'],
      constitution: ['헌법', 'constitution', '권리장전', 'bill of rights'],
      civilizations: ['문명', 'civilization', '고대', 'ancient'],
    },

    korean: {},
  };

  const subjectKeywords = keywordMaps[subject] || {};
  const questionLower = question.toLowerCase();

  // Match keywords from question
  for (const [topic, terms] of Object.entries(subjectKeywords)) {
    const termArray = terms as string[];
    for (const term of termArray) {
      if (questionLower.includes(term.toLowerCase()) || question.includes(term)) {
        keywords.push(topic);
        break; // Only add topic once
      }
    }
  }

  return keywords;
}

/**
 * Retry AI call with exponential backoff
 *
 * @param aiFunction - The AI function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 500ms)
 * @returns AI response or empty array on complete failure
 */
export async function retryAICall<T>(
  aiFunction: () => Promise<T>,
  validator: (result: T) => boolean,
  maxRetries: number = 3,
  baseDelay: number = 500
): Promise<T | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await aiFunction();

      // Validate result
      if (validator(result)) {
        if (attempt > 0) {
          console.log(`[AI Retry] ✅ Success on attempt ${attempt + 1}/${maxRetries}`);
        }
        return result;
      }

      // Invalid result, retry
      console.warn(
        `[AI Retry] ⚠️ Invalid result on attempt ${attempt + 1}/${maxRetries}, retrying...`
      );
    } catch (error) {
      console.error(
        `[AI Retry] ❌ Error on attempt ${attempt + 1}/${maxRetries}:`,
        error instanceof Error ? error.message : error
      );
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries - 1) {
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`[AI Retry] ⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`[AI Retry] 🚫 All ${maxRetries} attempts failed`);
  return null;
}

/**
 * Validate that AI response is not empty
 */
export function validateNotEmpty<T>(result: T): boolean {
  if (Array.isArray(result)) {
    return result.length > 0;
  }
  if (typeof result === 'string') {
    return result.trim().length > 0;
  }
  return result !== null && result !== undefined;
}

/**
 * Enhanced topic identification with retry and keyword fallback
 *
 * @param question - User question
 * @param subject - Subject context
 * @param aiFunction - AI topic identification function
 * @returns Array of identified topics
 */
export async function identifyTopicsWithRetry(
  question: string,
  subject: 'math' | 'english' | 'science' | 'social-studies' | 'korean',
  aiFunction: () => Promise<string[]>
): Promise<string[]> {
  // Try AI identification with retry
  const aiTopics = await retryAICall(
    aiFunction,
    validateNotEmpty,
    3, // max retries
    500 // base delay ms
  );

  if (aiTopics && aiTopics.length > 0) {
    console.log(`[AI Retry] ✅ AI topics identified:`, aiTopics);
    return aiTopics;
  }

  // AI failed after retries, use keyword fallback
  console.warn(
    `[AI Retry] 🔄 AI failed after retries, using keyword fallback for: "${question.substring(0, 50)}..."`
  );

  const keywordTopics = extractKeywordsFromQuestion(question, subject);

  if (keywordTopics.length > 0) {
    console.log(`[AI Retry] ✅ Keyword fallback found topics:`, keywordTopics);
    return keywordTopics;
  }

  // Complete failure
  console.error(
    `[AI Retry] 🚫 No topics identified via AI or keywords for: "${question.substring(0, 50)}..."`
  );
  return [];
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
