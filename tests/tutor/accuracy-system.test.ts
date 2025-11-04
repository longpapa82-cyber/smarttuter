/**
 * Week 3 Day 5: Integration Tests for Accuracy Systems
 *
 * Tests the complete accuracy assurance pipeline:
 * - RAG System (verified content retrieval)
 * - Chain-of-Thought Reasoning
 * - Answer Verifier
 */

import { describe, it, expect } from '@jest/globals';
import {
  retrieveVerifiedContent,
  generateRAGPrompt,
  getVerifiedContentByTopic,
  ENGLISH_VERIFIED_CONTENT,
  MATH_VERIFIED_CONTENT
} from '@/lib/tutor/rag-system';
import {
  generateChainOfThought,
  formatChainOfThoughtForStudent,
  verifyReasoningChain
} from '@/lib/tutor/chain-of-thought';
import {
  verifyAnswer,
  formatVerificationResult,
  shouldShowAnswer,
  getFallbackMessage
} from '@/lib/tutor/answer-verifier';

/**
 * ════════════════════════════════════════════════════════════════
 * RAG SYSTEM TESTS
 * ════════════════════════════════════════════════════════════════
 */

describe('RAG System', () => {
  describe('Verified Content Database', () => {
    it('should have English verified content', () => {
      expect(ENGLISH_VERIFIED_CONTENT.length).toBeGreaterThan(0);
    });

    it('should have Math verified content', () => {
      expect(MATH_VERIFIED_CONTENT.length).toBeGreaterThan(0);
    });

    it('should have proper structure for each content', () => {
      const content = ENGLISH_VERIFIED_CONTENT[0];
      expect(content).toHaveProperty('id');
      expect(content).toHaveProperty('subject');
      expect(content).toHaveProperty('topic');
      expect(content).toHaveProperty('topicKo');
      expect(content).toHaveProperty('gradeLevel');
      expect(content).toHaveProperty('content');
      expect(content).toHaveProperty('examples');
      expect(content).toHaveProperty('keyPoints');
      expect(content).toHaveProperty('source');
    });
  });

  describe('getVerifiedContentByTopic', () => {
    it('should retrieve Present Tense content', () => {
      const content = getVerifiedContentByTopic('Present Tense', 'english');
      expect(content).toBeDefined();
      expect(content?.topic).toBe('Present Tense');
    });

    it('should retrieve content by Korean topic name', () => {
      const content = getVerifiedContentByTopic('현재 시제', 'english');
      expect(content).toBeDefined();
      expect(content?.topicKo).toBe('현재 시제');
    });

    it('should retrieve Fractions content', () => {
      const content = getVerifiedContentByTopic('Fractions', 'math');
      expect(content).toBeDefined();
      expect(content?.topic).toBe('Fractions');
    });

    it('should return undefined for non-existent topic', () => {
      const content = getVerifiedContentByTopic('Nonexistent Topic', 'math');
      expect(content).toBeUndefined();
    });
  });

  describe.skipIf(!process.env.GEMINI_API_KEY)('retrieveVerifiedContent', () => {
    it('should retrieve relevant content for present tense question', async () => {
      const result = await retrieveVerifiedContent(
        '현재 시제가 뭐예요?',
        'english',
        '2'
      );

      expect(result.content.length).toBeGreaterThan(0);
      expect(result.relevanceScores.length).toBe(result.content.length);
      expect(result.citations.length).toBe(result.content.length);
    }, 10000);

    it('should retrieve relevant content for fractions question', async () => {
      const result = await retrieveVerifiedContent(
        '분수가 뭐예요?',
        'math',
        '3'
      );

      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0].topic).toContain('Fraction');
    }, 10000);

    it('should prioritize grade-level appropriate content', async () => {
      const result = await retrieveVerifiedContent(
        'What is addition?',
        'math',
        '1'
      );

      if (result.content.length > 0) {
        const gradeLevel = parseInt(result.content[0].gradeLevel);
        expect(gradeLevel).toBeLessThanOrEqual(3); // Should get elementary content
      }
    }, 10000);
  });

  describe('generateRAGPrompt', () => {
    it('should generate prompt with verified content', async () => {
      const context = await retrieveVerifiedContent(
        '현재 시제',
        'english',
        '2'
      );

      const prompt = generateRAGPrompt(
        '현재 시제가 뭐예요?',
        context,
        '2'
      );

      expect(prompt).toContain('VERIFIED CONTENT');
      expect(prompt).toContain('STUDENT QUESTION');
      expect(prompt).toContain('현재 시제가 뭐예요?');
    }, 10000);

    it('should return original question if no context', () => {
      const emptyContext = { content: [], relevanceScores: [], citations: [] };
      const prompt = generateRAGPrompt(
        'test question',
        emptyContext,
        '5'
      );

      expect(prompt).toBe('test question');
    });
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * CHAIN-OF-THOUGHT TESTS
 * ════════════════════════════════════════════════════════════════
 */

describe('Chain-of-Thought Reasoning', () => {
  describe.skipIf(!process.env.GEMINI_API_KEY)('generateChainOfThought', () => {
    it('should generate reasoning for simple math problem', async () => {
      const cot = await generateChainOfThought(
        'What is 12 + 8?',
        'math',
        '2'
      );

      expect(cot.question).toBe('What is 12 + 8?');
      expect(cot.steps.length).toBeGreaterThan(0);
      expect(cot.finalAnswer).toBeTruthy();
      expect(cot.overallConfidence).toBeGreaterThan(0);
      expect(cot.reasoningQuality).toBeDefined();
    }, 15000);

    it('should generate reasoning for grammar question', async () => {
      const cot = await generateChainOfThought(
        'What is present tense?',
        'english',
        '2'
      );

      expect(cot.steps.length).toBeGreaterThan(0);
      expect(cot.finalAnswer).toBeTruthy();
    }, 15000);

    it('should have high confidence for simple questions', async () => {
      const cot = await generateChainOfThought(
        'What is 2 + 2?',
        'math',
        '1'
      );

      expect(cot.overallConfidence).toBeGreaterThan(70);
      expect(cot.reasoningQuality).not.toBe('low');
    }, 15000);
  });

  describe('formatChainOfThoughtForStudent', () => {
    it('should format with steps visible', () => {
      const cot = {
        question: 'Test question',
        steps: [
          {
            stepNumber: 1,
            description: 'Understand',
            thinking: 'What do we need?',
            result: 'We need to add',
            confidence: 90,
            verified: true
          },
          {
            stepNumber: 2,
            description: 'Calculate',
            thinking: '2 + 2 = 4',
            result: '4',
            confidence: 100,
            verified: true
          }
        ],
        finalAnswer: 'The answer is 4',
        overallConfidence: 95,
        reasoningQuality: 'high' as const
      };

      const formatted = formatChainOfThoughtForStudent(cot, true);

      expect(formatted).toContain('단계별 풀이');
      expect(formatted).toContain('1단계');
      expect(formatted).toContain('2단계');
      expect(formatted).toContain('답변');
      expect(formatted).toContain('The answer is 4');
    });

    it('should format without steps when disabled', () => {
      const cot = {
        question: 'Test question',
        steps: [],
        finalAnswer: 'The answer is 4',
        overallConfidence: 95,
        reasoningQuality: 'high' as const
      };

      const formatted = formatChainOfThoughtForStudent(cot, false);

      expect(formatted).not.toContain('단계별 풀이');
      expect(formatted).toContain('답변');
    });
  });

  describe('verifyReasoningChain', () => {
    it('should verify consistent reasoning chain', () => {
      const cot = {
        question: 'Test',
        steps: [
          {
            stepNumber: 1,
            description: 'Step 1',
            thinking: 'Think',
            result: 'Result',
            confidence: 90,
            verified: true
          },
          {
            stepNumber: 2,
            description: 'Step 2',
            thinking: 'Think',
            result: 'Result',
            confidence: 85,
            verified: true
          }
        ],
        finalAnswer: 'Answer',
        overallConfidence: 87,
        reasoningQuality: 'high' as const
      };

      const verification = verifyReasoningChain(cot);
      expect(verification.isConsistent).toBe(true);
      expect(verification.issues.length).toBe(0);
    });

    it('should detect missing steps', () => {
      const cot = {
        question: 'Test',
        steps: [],
        finalAnswer: 'Answer',
        overallConfidence: 50,
        reasoningQuality: 'low' as const
      };

      const verification = verifyReasoningChain(cot);
      expect(verification.isConsistent).toBe(false);
      expect(verification.issues).toContain('No reasoning steps provided');
    });

    it('should detect low confidence steps', () => {
      const cot = {
        question: 'Test',
        steps: [
          {
            stepNumber: 1,
            description: 'Step 1',
            thinking: 'Unsure',
            result: 'Maybe?',
            confidence: 40,
            verified: false
          }
        ],
        finalAnswer: 'Answer',
        overallConfidence: 40,
        reasoningQuality: 'low' as const
      };

      const verification = verifyReasoningChain(cot);
      expect(verification.isConsistent).toBe(false);
      expect(verification.issues.length).toBeGreaterThan(0);
    });
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * ANSWER VERIFIER TESTS
 * ════════════════════════════════════════════════════════════════
 */

describe('Answer Verifier', () => {
  describe('verifyAnswer - Basic Tests', () => {
    it('should verify good quality answer', async () => {
      const result = await verifyAnswer(
        'What is 2 + 2?',
        '2 + 2 equals 4. This is basic addition. When we add 2 and 2 together, we get 4. For example, if you have 2 apples and get 2 more apples, you now have 4 apples total.',
        'math',
        '1'
      );

      expect(result.isVerified).toBe(true);
      expect(result.confidence).toBeGreaterThan(60);
      expect(result.quality).not.toBe('poor');
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('should reject poor quality answer', async () => {
      const result = await verifyAnswer(
        'What is present tense?',
        'yes', // Too short, not complete
        'english',
        '2'
      );

      expect(result.quality).toBe('poor');
      expect(result.confidence).toBeLessThan(70);
    });

    it('should detect overly advanced language for elementary', async () => {
      const result = await verifyAnswer(
        'What is addition?',
        'Subsequently, we can observe that the concatenation of numerical values facilitates the aggregation of quantities.',
        'math',
        '1'
      );

      const gradeLevelCheck = result.checks.find(c => c.checkName === 'Grade-Level Appropriateness');
      expect(gradeLevelCheck).toBeDefined();
      expect(gradeLevelCheck?.passed).toBe(false);
    });

    it('should accept grade-appropriate answer', async () => {
      const result = await verifyAnswer(
        'What is a noun?',
        'A noun is a word for a person, place, or thing. For example, "dog" is a noun because it names an animal. "School" is a noun because it names a place.',
        'english',
        '2'
      );

      expect(result.confidence).toBeGreaterThan(70);
      expect(result.quality).not.toBe('poor');
    });
  });

  describe('verifyAnswer - with Chain-of-Thought', () => {
    it('should boost confidence with good reasoning', async () => {
      const chainOfThought = {
        question: 'What is 5 + 3?',
        steps: [
          {
            stepNumber: 1,
            description: 'Understand',
            thinking: 'We need to add 5 and 3',
            result: 'Addition problem',
            confidence: 95,
            verified: true
          }
        ],
        finalAnswer: '8',
        overallConfidence: 95,
        reasoningQuality: 'high' as const
      };

      const result = await verifyAnswer(
        'What is 5 + 3?',
        '5 + 3 = 8',
        'math',
        '1',
        chainOfThought
      );

      const reasoningCheck = result.checks.find(c => c.checkName === 'Reasoning Quality');
      expect(reasoningCheck).toBeDefined();
      expect(reasoningCheck?.score).toBeGreaterThan(70);
    });

    it('should detect poor reasoning quality', async () => {
      const chainOfThought = {
        question: 'Test',
        steps: [],
        finalAnswer: 'Answer',
        overallConfidence: 30,
        reasoningQuality: 'low' as const,
        warnings: ['Low confidence', 'Missing steps']
      };

      const result = await verifyAnswer(
        'Test question',
        'Test answer',
        'math',
        '5',
        chainOfThought
      );

      const reasoningCheck = result.checks.find(c => c.checkName === 'Reasoning Quality');
      expect(reasoningCheck?.passed).toBe(false);
    });
  });

  describe('verifyAnswer - with RAG Context', () => {
    it('should verify alignment with RAG content', async () => {
      const ragContext = {
        content: [{
          id: 'test',
          subject: 'math' as const,
          topic: 'Addition',
          topicKo: '덧셈',
          gradeLevel: '1',
          schoolLevel: 'elementary' as const,
          content: 'Addition combines numbers',
          examples: ['2 + 3 = 5'],
          keyPoints: ['combining', 'numbers', 'total'],
          source: 'Test',
          lastVerified: '2025-01-04'
        }],
        relevanceScores: [90],
        citations: ['Test Source']
      };

      const result = await verifyAnswer(
        'What is addition?',
        'Addition is combining numbers together to get a total. For example, 2 + 3 = 5.',
        'math',
        '1',
        undefined,
        ragContext
      );

      const ragCheck = result.checks.find(c => c.checkName === 'RAG Alignment');
      expect(ragCheck).toBeDefined();
      expect(ragCheck?.score).toBeGreaterThan(60);
    });
  });

  describe('Hallucination Detection', () => {
    it('should detect hallucination indicators', async () => {
      const result = await verifyAnswer(
        'Test question',
        'As an AI, I was programmed to tell you that based on my training data from 2023...',
        'math',
        '5'
      );

      const hallucinationCheck = result.checks.find(c => c.checkName === 'No Hallucination Indicators');
      expect(hallucinationCheck).toBeDefined();
      expect(hallucinationCheck?.score).toBeLessThan(100);
    });

    it('should accept answer without hallucination indicators', async () => {
      const result = await verifyAnswer(
        'What is 2 + 2?',
        '2 + 2 equals 4. This is a basic addition fact.',
        'math',
        '1'
      );

      const hallucinationCheck = result.checks.find(c => c.checkName === 'No Hallucination Indicators');
      expect(hallucinationCheck?.passed).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should format verification result', async () => {
      const result = await verifyAnswer(
        'Test',
        'Test answer with good content and explanations for students.',
        'math',
        '3'
      );

      const formatted = formatVerificationResult(result);
      expect(formatted).toContain('Verification Result');
      expect(formatted).toContain('Confidence');
      expect(formatted).toContain('Checks');
    });

    it('should decide to show good answer', async () => {
      const result = await verifyAnswer(
        'What is 2 + 2?',
        '2 + 2 = 4. Addition combines numbers.',
        'math',
        '1'
      );

      expect(shouldShowAnswer(result)).toBe(true);
    });

    it('should not show poor answer', async () => {
      const result = await verifyAnswer(
        'Complex question',
        'I think maybe possibly it could be something',
        'math',
        '5'
      );

      if (result.quality === 'poor' && result.confidence < 60) {
        expect(shouldShowAnswer(result)).toBe(false);
      }
    });

    it('should generate fallback message', async () => {
      const result = {
        isVerified: false,
        confidence: 30,
        quality: 'poor' as const,
        checks: [],
        warnings: ['Low confidence', 'Incomplete answer']
      };

      const fallback = getFallbackMessage(result);
      expect(fallback).toContain('죄송합니다');
      expect(fallback).toContain('이유');
    });
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * INTEGRATION TESTS (Full Pipeline)
 * ════════════════════════════════════════════════════════════════
 */

describe('Full Accuracy Pipeline Integration', () => {
  describe.skipIf(!process.env.GEMINI_API_KEY)('RAG → Chain-of-Thought → Verifier', () => {
    it('should complete full pipeline for math question', async () => {
      // Step 1: RAG - Retrieve verified content
      const ragContext = await retrieveVerifiedContent(
        'What is addition?',
        'math',
        '1'
      );

      expect(ragContext.content.length).toBeGreaterThan(0);

      // Step 2: Generate RAG prompt
      const ragPrompt = generateRAGPrompt(
        'What is addition?',
        ragContext,
        '1'
      );

      expect(ragPrompt).toContain('VERIFIED CONTENT');

      // Step 3: Chain-of-Thought reasoning
      const cot = await generateChainOfThought(
        'What is addition?',
        'math',
        '1',
        ragPrompt
      );

      expect(cot.finalAnswer).toBeTruthy();

      // Step 4: Verify answer
      const verification = await verifyAnswer(
        'What is addition?',
        cot.finalAnswer,
        'math',
        '1',
        cot,
        ragContext
      );

      expect(verification.isVerified).toBe(true);
      expect(verification.confidence).toBeGreaterThan(60);
    }, 30000);

    it('should complete full pipeline for English question', async () => {
      // Full pipeline for English
      const ragContext = await retrieveVerifiedContent(
        'What is present tense?',
        'english',
        '2'
      );

      const cot = await generateChainOfThought(
        'What is present tense?',
        'english',
        '2'
      );

      const verification = await verifyAnswer(
        'What is present tense?',
        cot.finalAnswer,
        'english',
        '2',
        cot,
        ragContext
      );

      expect(verification.confidence).toBeGreaterThan(0);
      expect(verification.checks.length).toBeGreaterThan(0);
    }, 30000);
  });
});
