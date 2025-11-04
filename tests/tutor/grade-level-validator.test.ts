/**
 * Week 2 Tests: Grade Level Validator
 *
 * Test coverage:
 * - Curriculum database queries
 * - Grade level validation
 * - Advanced learning detection
 * - Appropriate vs inappropriate topics
 */

import { describe, it, expect } from '@jest/globals';
import {
  getCurriculum,
  getTopicsByLevel,
  searchTopics,
  isTopicInGrade,
  getTopicGrade,
  type SchoolLevel,
  type Subject
} from '@/lib/tutor/curriculum-database';
import {
  validateGradeLevel,
  mightBeAdvancedTopic,
  getRecommendedTopics
} from '@/lib/tutor/grade-level-validator';

/**
 * ════════════════════════════════════════════════════════════════
 * CURRICULUM DATABASE TESTS
 * ════════════════════════════════════════════════════════════════
 */

describe('Curriculum Database', () => {
  describe('getCurriculum', () => {
    it('should get curriculum for grade 1 elementary English', () => {
      const curriculum = getCurriculum('1', 'english');
      expect(curriculum).toBeDefined();
      expect(curriculum?.grade).toBe('1');
      expect(curriculum?.schoolLevel).toBe('elementary');
      expect(curriculum?.subject).toBe('english');
      expect(curriculum?.topics.length).toBeGreaterThan(0);
    });

    it('should get curriculum for grade 7 middle Math', () => {
      const curriculum = getCurriculum('7', 'math');
      expect(curriculum).toBeDefined();
      expect(curriculum?.grade).toBe('7');
      expect(curriculum?.schoolLevel).toBe('middle');
      expect(curriculum?.subject).toBe('math');
    });

    it('should get curriculum for university Math', () => {
      const curriculum = getCurriculum('university-1', 'math');
      expect(curriculum).toBeDefined();
      expect(curriculum?.grade).toBe('university-1');
      expect(curriculum?.schoolLevel).toBe('university');
    });

    it('should return undefined for invalid grade', () => {
      const curriculum = getCurriculum('99', 'english');
      expect(curriculum).toBeUndefined();
    });
  });

  describe('getTopicsByLevel', () => {
    it('should get all elementary English topics', () => {
      const topics = getTopicsByLevel('elementary', 'english');
      expect(topics.length).toBeGreaterThan(10); // Multiple grades worth of topics
    });

    it('should get all high school Math topics', () => {
      const topics = getTopicsByLevel('high', 'math');
      expect(topics.length).toBeGreaterThan(5);
    });
  });

  describe('searchTopics', () => {
    it('should find present perfect in English curriculum', () => {
      const topics = searchTopics('present perfect', 'english');
      expect(topics.length).toBeGreaterThan(0);
      expect(topics[0].keywords.some(k => k.toLowerCase().includes('present'))).toBe(true);
    });

    it('should find quadratic in Math curriculum', () => {
      const topics = searchTopics('quadratic', 'math');
      expect(topics.length).toBeGreaterThan(0);
      expect(topics[0].name.toLowerCase().includes('quadratic') ||
             topics[0].keywords.some(k => k.toLowerCase().includes('quadratic'))).toBe(true);
    });

    it('should find topics by Korean keyword', () => {
      const topics = searchTopics('현재완료', 'english');
      expect(topics.length).toBeGreaterThan(0);
    });

    it('should filter by school level', () => {
      const topics = searchTopics('equation', 'math', 'middle');
      expect(topics.length).toBeGreaterThan(0);
      // All topics should have grade values 7-9
    });
  });

  describe('isTopicInGrade', () => {
    it('should confirm topic is in correct grade', () => {
      // Get a topic from grade 5
      const curriculum = getCurriculum('5', 'math');
      const topicId = curriculum?.topics[0]?.id;

      if (topicId) {
        expect(isTopicInGrade(topicId, '5', 'math')).toBe(true);
        expect(isTopicInGrade(topicId, '3', 'math')).toBe(false); // Wrong grade
      }
    });
  });

  describe('getTopicGrade', () => {
    it('should get correct grade for a topic', () => {
      const topics = searchTopics('alphabet', 'english');
      if (topics.length > 0) {
        const grade = getTopicGrade(topics[0].id, 'english');
        expect(grade).toBeDefined();
        expect(['1', '2']).toContain(grade); // Alphabet is early elementary
      }
    });
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * GRADE LEVEL VALIDATOR TESTS (Quick Pre-Filter)
 * ════════════════════════════════════════════════════════════════
 */

describe('Grade Level Validator - Quick Check', () => {
  describe('mightBeAdvancedTopic - Elementary Math', () => {
    it('should detect calculus as advanced for elementary', () => {
      expect(mightBeAdvancedTopic('미분이 뭐예요?', '3', 'math')).toBe(true);
      expect(mightBeAdvancedTopic('What is derivative?', '5', 'math')).toBe(true);
    });

    it('should detect quadratic as advanced for early elementary', () => {
      expect(mightBeAdvancedTopic('이차방정식 풀이', '4', 'math')).toBe(true);
    });

    it('should allow basic arithmetic for elementary', () => {
      expect(mightBeAdvancedTopic('12 + 8은 얼마예요?', '3', 'math')).toBe(false);
      expect(mightBeAdvancedTopic('What is 5 × 6?', '4', 'math')).toBe(false);
    });
  });

  describe('mightBeAdvancedTopic - Middle School Math', () => {
    it('should detect calculus as advanced for middle school', () => {
      expect(mightBeAdvancedTopic('적분 계산법', '8', 'math')).toBe(true);
    });

    it('should allow algebra for middle school', () => {
      expect(mightBeAdvancedTopic('방정식 풀이', '7', 'math')).toBe(false);
      expect(mightBeAdvancedTopic('How do you solve 2x + 5 = 13?', '8', 'math')).toBe(false);
    });
  });

  describe('mightBeAdvancedTopic - Elementary English', () => {
    it('should detect subjunctive as advanced for elementary', () => {
      expect(mightBeAdvancedTopic('가정법이 뭐예요?', '5', 'english')).toBe(true);
      expect(mightBeAdvancedTopic('What is subjunctive?', '6', 'english')).toBe(true);
    });

    it('should detect passive voice as advanced for early elementary', () => {
      expect(mightBeAdvancedTopic('수동태 설명', '4', 'english')).toBe(true);
    });

    it('should allow basic grammar for elementary', () => {
      expect(mightBeAdvancedTopic('What is a noun?', '3', 'english')).toBe(false);
      expect(mightBeAdvancedTopic('현재시제 설명', '4', 'english')).toBe(false);
    });
  });

  describe('mightBeAdvancedTopic - Middle School English', () => {
    it('should detect literary theory as advanced for middle school', () => {
      expect(mightBeAdvancedTopic('문학이론', '8', 'english')).toBe(true);
    });

    it('should allow present perfect for middle school', () => {
      expect(mightBeAdvancedTopic('현재완료 시제', '7', 'english')).toBe(false);
      expect(mightBeAdvancedTopic('What is present perfect?', '8', 'english')).toBe(false);
    });
  });
});

describe('Grade Level Validator - Recommended Topics', () => {
  it('should get recommended topics for grade 3 Math', () => {
    const topics = getRecommendedTopics('3', 'math', 3);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.length).toBeLessThanOrEqual(3);
  });

  it('should get recommended topics for grade 7 English', () => {
    const topics = getRecommendedTopics('7', 'english', 5);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.length).toBeLessThanOrEqual(5);
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * FULL VALIDATION TESTS (AI-based - requires API)
 * ════════════════════════════════════════════════════════════════
 */

describe('Grade Level Validator - Full Validation', () => {
  // Note: These tests require GEMINI_API_KEY and will be slow
  // Skip if no API key is available

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

  describe.skipIf(!hasApiKey)('validateGradeLevel - Elementary Math', () => {
    it('should allow basic arithmetic for grade 3', async () => {
      const result = await validateGradeLevel('12 + 8은 얼마예요?', '3', 'math');
      expect(result.isAppropriate).toBe(true);
    }, 10000); // 10 second timeout for AI call

    it('should reject calculus for grade 5', async () => {
      const result = await validateGradeLevel('미분이 뭐예요?', '5', 'math');
      expect(result.isAppropriate).toBe(false);
      expect(result.guidanceMessage).toBeDefined();
      expect(result.guidanceMessage).toContain('선행학습');
    }, 10000);

    it('should allow fractions for grade 5', async () => {
      const result = await validateGradeLevel('분수 덧셈 방법', '5', 'math');
      expect(result.isAppropriate).toBe(true);
    }, 10000);
  });

  describe.skipIf(!hasApiKey)('validateGradeLevel - Elementary English', () => {
    it('should allow present tense for grade 2', async () => {
      const result = await validateGradeLevel('현재 시제가 뭐예요?', '2', 'english');
      expect(result.isAppropriate).toBe(true);
    }, 10000);

    it('should reject present perfect for grade 3', async () => {
      const result = await validateGradeLevel('현재완료 시제 설명', '3', 'english');
      expect(result.isAppropriate).toBe(false);
      expect(result.guidanceMessage).toContain('선행학습');
    }, 10000);

    it('should allow basic nouns for grade 2', async () => {
      const result = await validateGradeLevel('What is a noun?', '2', 'english');
      expect(result.isAppropriate).toBe(true);
    }, 10000);
  });

  describe.skipIf(!hasApiKey)('validateGradeLevel - Middle School Math', () => {
    it('should allow algebra for grade 7', async () => {
      const result = await validateGradeLevel('방정식 푸는 법', '7', 'math');
      expect(result.isAppropriate).toBe(true);
    }, 10000);

    it('should reject calculus for grade 8', async () => {
      const result = await validateGradeLevel('미적분 개념', '8', 'math');
      expect(result.isAppropriate).toBe(false);
      expect(result.guidanceMessage).toBeDefined();
    }, 10000);

    it('should allow quadratics for grade 9', async () => {
      const result = await validateGradeLevel('이차방정식 풀이', '9', 'math');
      expect(result.isAppropriate).toBe(true);
    }, 10000);
  });

  describe.skipIf(!hasApiKey)('validateGradeLevel - High School', () => {
    it('should allow calculus for grade 12', async () => {
      const result = await validateGradeLevel('미분 계산', '12', 'math');
      expect(result.isAppropriate).toBe(true);
    }, 10000);

    it('should allow present perfect for grade 10', async () => {
      const result = await validateGradeLevel('현재완료 고급 용법', '10', 'english');
      expect(result.isAppropriate).toBe(true);
    }, 10000);
  });

  describe.skipIf(!hasApiKey)('validateGradeLevel - University', () => {
    it('should allow advanced calculus for university', async () => {
      const result = await validateGradeLevel('다변수 미적분', 'university-1', 'math');
      expect(result.isAppropriate).toBe(true);
    }, 10000);

    it('should allow literary theory for university', async () => {
      const result = await validateGradeLevel('비평 이론', 'university-1', 'english');
      expect(result.isAppropriate).toBe(true);
    }, 10000);
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * EDGE CASES
 * ════════════════════════════════════════════════════════════════
 */

describe('Grade Level Validator - Edge Cases', () => {
  it('should handle vague questions gracefully', async () => {
    const result = await validateGradeLevel('안녕하세요', '5', 'math');
    expect(result.isAppropriate).toBe(true); // Vague questions are allowed
  }, 10000);

  it('should handle mixed-level questions', async () => {
    const result = await validateGradeLevel('덧셈이랑 미분 둘 다 알려주세요', '5', 'math');
    // Should detect advanced content (calculus) even if basic content is also present
    expect(result.detectedTopics.some(dt => dt.isAdvanced)).toBe(true);
  }, 10000);

  it('should allow review of lower-level content', async () => {
    const result = await validateGradeLevel('알파벳 복습', '10', 'english');
    expect(result.isAppropriate).toBe(true); // Review is allowed
    expect(result.detectedTopics.some(dt => dt.isBelowLevel)).toBe(true);
  }, 10000);
});
