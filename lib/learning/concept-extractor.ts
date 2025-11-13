/**
 * AI-based Concept Extraction for Learning Analytics
 *
 * Extracts meaningful learning concepts from user questions/conversations
 * instead of using timestamps, enabling better learning progress tracking.
 */

import { generateVertexAIStream } from '@/lib/ai/vertex-ai';

export type Subject = 'math' | 'english' | 'science' | 'social-studies' | 'korean';

/**
 * Extract a meaningful concept identifier from a learning interaction
 *
 * @param message - User's question or message
 * @param subject - Subject area
 * @param gradeLevel - Student's grade level
 * @returns Concept ID in snake_case format (e.g., "linear_equations", "pythagorean_theorem")
 */
export async function extractConceptId(
  message: string,
  subject: Subject,
  gradeLevel: string
): Promise<string> {
  try {
    // Create subject-specific prompt
    const prompt = createConceptExtractionPrompt(message, subject, gradeLevel);

    // Use Gemini Flash for fast concept extraction
    const streamIterator = await generateVertexAIStream(
      prompt,
      {
        temperature: 0.1, // Low temperature for consistent extraction
        maxTokens: 64,
      }
    );

    // Collect streaming response
    let conceptText = '';
    for await (const chunk of streamIterator) {
      conceptText += chunk;
    }

    // Clean and format the concept
    const conceptId = cleanConceptId(conceptText.trim(), subject);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Concept Extraction] "${message.substring(0, 50)}..." → "${conceptId}"`);
    }

    return conceptId;

  } catch (error) {
    console.error('[Concept Extraction] Error:', error);
    // Fallback to timestamp-based ID
    return `${subject}_concept_${Date.now()}`;
  }
}

/**
 * Create subject-specific prompts for concept extraction
 */
function createConceptExtractionPrompt(
  message: string,
  subject: Subject,
  gradeLevel: string
): string {
  const basePrompt = `Extract the main learning concept from this ${subject} question.
Return ONLY the concept name in English, using underscores for spaces (snake_case).
Use standard educational terminology.

Grade Level: ${gradeLevel}
Question: "${message}"

Examples:
- "2x + 3 = 7을 풀어줘" → linear_equations
- "피타고라스의 정리 설명해줘" → pythagorean_theorem
- "What is photosynthesis?" → photosynthesis
- "삼각함수의 기본 개념" → trigonometric_functions

Concept:`;

  // Subject-specific refinements
  switch (subject) {
    case 'math':
      return `${basePrompt}
Math topics include: algebra, geometry, calculus, statistics, number_theory, etc.`;

    case 'english':
      return `${basePrompt}
English topics include: grammar, vocabulary, reading_comprehension, writing, conversation, etc.`;

    case 'science':
      return `${basePrompt}
Science topics include: physics, chemistry, biology, earth_science, astronomy, etc.`;

    case 'social-studies':
      return `${basePrompt}
Social studies topics include: history, geography, civics, economics, culture, etc.`;

    case 'korean':
      return `${basePrompt}
Korean topics include: grammar, literature, writing, reading_comprehension, etc.`;

    default:
      return basePrompt;
  }
}

/**
 * Clean and validate concept ID
 */
function cleanConceptId(conceptText: string, subject: Subject): string {
  // Remove any quotes, extra whitespace, or explanation text
  let cleaned = conceptText
    .toLowerCase()
    .replace(/["'`]/g, '')
    .replace(/^concept:?\s*/i, '')
    .replace(/\s+/g, '_')
    .trim();

  // Take only the first line if multiple lines
  cleaned = cleaned.split('\n')[0];

  // Remove any non-alphanumeric characters except underscores
  cleaned = cleaned.replace(/[^a-z0-9_]/g, '');

  // Ensure it starts with a letter
  if (cleaned && !/^[a-z]/.test(cleaned)) {
    cleaned = cleaned.replace(/^[^a-z]+/, '');
  }

  // Validate length
  if (cleaned.length < 3 || cleaned.length > 50) {
    // Fallback if invalid
    return `${subject}_concept_${Date.now()}`;
  }

  // Add subject prefix
  return `${subject}_${cleaned}`;
}

/**
 * Batch extract concepts for multiple messages (optimization)
 */
export async function extractConceptsBatch(
  messages: Array<{ message: string; subject: Subject; gradeLevel: string }>
): Promise<string[]> {
  // Process in parallel for better performance
  const promises = messages.map(({ message, subject, gradeLevel }) =>
    extractConceptId(message, subject, gradeLevel)
  );

  return Promise.all(promises);
}
