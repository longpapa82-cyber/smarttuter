/**
 * Question Classifier Tests
 *
 * Week 1 Day 1-2 구현에 대한 테스트
 */

import { describe, it, expect } from '@jest/globals';
import { classifyQuestion, isObviouslyOffTopic } from '@/lib/tutor/question-classifier';
import { filterBySubject } from '@/lib/tutor/response-filter';

describe('Question Classifier', () => {
  describe('English Tutor - On-Topic Questions', () => {
    const englishQuestions = [
      "현재완료 시제가 뭐예요?",
      "How do I use present perfect?",
      "문법 질문이에요",
      "elaborate는 무슨 뜻이에요?",
      "에세이 쓰는 법 알려주세요",
      "이 문장 맞나요? I have went to school",
      "영어로 '감사합니다'를 어떻게 말해요?"
    ];

    it.each(englishQuestions)('should classify "%s" as english', async (question) => {
      const result = await classifyQuestion(question, 'english');

      expect(result.subject).toBe('english');
      expect(result.isOnTopic).toBe(true);
      expect(result.confidence).toBeGreaterThan(50);
    });
  });

  describe('Math Tutor - On-Topic Questions', () => {
    const mathQuestions = [
      "12 + 8은 얼마예요?",
      "이차방정식 푸는 법",
      "피타고라스 정리가 뭐예요?",
      "분수 더하기 방법",
      "이 수학 문제 풀어주세요: 2x + 5 = 15",
      "삼각함수 설명해주세요",
      "확률 계산 어떻게 해요?"
    ];

    it.each(mathQuestions)('should classify "%s" as math', async (question) => {
      const result = await classifyQuestion(question, 'math');

      expect(result.subject).toBe('math');
      expect(result.isOnTopic).toBe(true);
      expect(result.confidence).toBeGreaterThan(50);
    });
  });

  describe('English Tutor - Off-Topic Questions', () => {
    const offTopicQuestions = [
      { question: "이차방정식 푸는 법", expected: 'math' },
      { question: "12 + 8은 얼마예요?", expected: 'math' },
      { question: "광합성이 뭐예요?", expected: 'science' },
      { question: "한국전쟁은 언제 일어났어요?", expected: 'social' },
      { question: "안녕", expected: 'other' },
      { question: "오늘 날씨 어때?", expected: 'other' }
    ];

    it.each(offTopicQuestions)(
      'should classify "$question" as $expected (not english)',
      async ({ question, expected }) => {
        const result = await classifyQuestion(question, 'english');

        expect(result.subject).toBe(expected);
        expect(result.isOnTopic).toBe(false);
      }
    );
  });

  describe('Math Tutor - Off-Topic Questions', () => {
    const offTopicQuestions = [
      { question: "현재완료 시제가 뭐예요?", expected: 'english' },
      { question: "문법 설명해주세요", expected: 'english' },
      { question: "광합성 원리", expected: 'science' },
      { question: "민주주의란?", expected: 'social' },
      { question: "심심해", expected: 'other' }
    ];

    it.each(offTopicQuestions)(
      'should classify "$question" as $expected (not math)',
      async ({ question, expected }) => {
        const result = await classifyQuestion(question, 'math');

        expect(result.subject).toBe(expected);
        expect(result.isOnTopic).toBe(false);
      }
    );
  });

  describe('isObviouslyOffTopic - Quick Pre-filter', () => {
    it('should quickly detect obvious greetings', () => {
      expect(isObviouslyOffTopic('안녕', 'english')).toBe(true);
      expect(isObviouslyOffTopic('hi', 'math')).toBe(true);
      expect(isObviouslyOffTopic('심심', 'english')).toBe(true);
    });

    it('should quickly detect obvious math questions for English tutor', () => {
      expect(isObviouslyOffTopic('방정식 풀어줘', 'english')).toBe(true);
      expect(isObviouslyOffTopic('미분 개념', 'english')).toBe(true);
      expect(isObviouslyOffTopic('12 더하기 8', 'english')).toBe(true);
    });

    it('should quickly detect obvious English questions for Math tutor', () => {
      expect(isObviouslyOffTopic('문법 설명', 'math')).toBe(true);
      expect(isObviouslyOffTopic('현재완료 시제', 'math')).toBe(true);
      expect(isObviouslyOffTopic('grammar rules', 'math')).toBe(true);
    });

    it('should allow on-topic questions through', () => {
      expect(isObviouslyOffTopic('현재완료 시제가 뭐예요?', 'english')).toBe(false);
      expect(isObviouslyOffTopic('이차방정식 푸는 법', 'math')).toBe(false);
    });
  });
});

describe('Response Filter', () => {
  describe('English Tutor Filtering', () => {
    it('should allow English questions', () => {
      const classification = {
        subject: 'english' as const,
        confidence: 95,
        isOnTopic: true,
        reason: 'English grammar question'
      };

      const result = filterBySubject(classification, 'english');
      expect(result.shouldRespond).toBe(true);
    });

    it('should reject Math questions with redirect to Math Park', () => {
      const classification = {
        subject: 'math' as const,
        confidence: 90,
        isOnTopic: false,
        reason: 'Math calculation question'
      };

      const result = filterBySubject(classification, 'english');
      expect(result.shouldRespond).toBe(false);
      expect(result.redirectMessage).toContain('Math Park');
      expect(result.redirectMessage).toContain('영어');
    });

    it('should reject science questions', () => {
      const classification = {
        subject: 'science' as const,
        confidence: 85,
        isOnTopic: false,
        reason: 'Science question'
      };

      const result = filterBySubject(classification, 'english');
      expect(result.shouldRespond).toBe(false);
      expect(result.redirectMessage).toContain('과학');
      expect(result.redirectMessage).toContain('영어');
    });

    it('should handle casual conversations', () => {
      const classification = {
        subject: 'other' as const,
        confidence: 80,
        isOnTopic: false,
        reason: 'Casual greeting'
      };

      const result = filterBySubject(classification, 'english');
      expect(result.shouldRespond).toBe(false);
      expect(result.redirectMessage).toContain('영어 학습');
      expect(result.redirectMessage).toContain('질문 예시');
    });
  });

  describe('Math Tutor Filtering', () => {
    it('should allow Math questions', () => {
      const classification = {
        subject: 'math' as const,
        confidence: 95,
        isOnTopic: true,
        reason: 'Math calculation question'
      };

      const result = filterBySubject(classification, 'math');
      expect(result.shouldRespond).toBe(true);
    });

    it('should reject English questions with redirect to English Park', () => {
      const classification = {
        subject: 'english' as const,
        confidence: 90,
        isOnTopic: false,
        reason: 'English grammar question'
      };

      const result = filterBySubject(classification, 'math');
      expect(result.shouldRespond).toBe(false);
      expect(result.redirectMessage).toContain('English Park');
      expect(result.redirectMessage).toContain('수학');
    });

    it('should handle casual conversations', () => {
      const classification = {
        subject: 'other' as const,
        confidence: 75,
        isOnTopic: false,
        reason: 'Casual chat'
      };

      const result = filterBySubject(classification, 'math');
      expect(result.shouldRespond).toBe(false);
      expect(result.redirectMessage).toContain('수학 학습');
      expect(result.redirectMessage).toContain('질문 예시');
    });
  });

  describe('Confidence Thresholds', () => {
    it('should still filter even with low confidence if obviously off-topic', () => {
      const classification = {
        subject: 'science' as const,
        confidence: 60, // Lower confidence
        isOnTopic: false,
        reason: 'Possibly science'
      };

      const englishResult = filterBySubject(classification, 'english');
      expect(englishResult.shouldRespond).toBe(false);

      const mathResult = filterBySubject(classification, 'math');
      expect(mathResult.shouldRespond).toBe(false);
    });
  });
});
