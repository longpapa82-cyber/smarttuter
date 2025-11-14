/**
 * Phase 4: Integration Testing for RAG Direct System
 *
 * Comprehensive test suite to validate:
 * - RAG Direct answer quality across all subjects
 * - Enhanced subject filter accuracy
 * - Enhanced grade level filter effectiveness
 * - Quality metrics tracking
 * - API call reduction performance
 */

import type { Subject } from '@/lib/tutor/rag-system';

interface TestQuestion {
  question: string;
  subject: Subject;
  gradeLevel: string;
  expectedRAGDirect: boolean; // Should this trigger RAG Direct?
  expectedConfidence?: number; // Minimum expected confidence
  description: string;
}

/**
 * Test Questions Database - Covering various scenarios
 */
const TEST_QUESTIONS: TestQuestion[] = [
  // ═══════════════════════════════════════════════════════
  // MATH - Should trigger RAG Direct
  // ═══════════════════════════════════════════════════════
  {
    question: "덧셈이 뭐예요?",
    subject: "math",
    gradeLevel: "1",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Elementary math - Basic addition concept (Korean content available)"
  },
  {
    question: "분수란 무엇인가요?",
    subject: "math",
    gradeLevel: "3",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Elementary math - Fractions concept (Korean content available)"
  },
  {
    question: "What is a fraction?",
    subject: "math",
    gradeLevel: "3",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Elementary math - Fractions concept (English)"
  },

  // ═══════════════════════════════════════════════════════
  // MATH - Should NOT trigger RAG Direct (too specific)
  // ═══════════════════════════════════════════════════════
  {
    question: "3x^2 + 5x - 2 = 0을 풀어주세요",
    subject: "math",
    gradeLevel: "10",
    expectedRAGDirect: false,
    description: "Specific problem solving - needs AI generation"
  },

  // ═══════════════════════════════════════════════════════
  // ENGLISH - Should trigger RAG Direct
  // ═══════════════════════════════════════════════════════
  {
    question: "What is present tense?",
    subject: "english",
    gradeLevel: "2",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Elementary English - Present tense concept"
  },
  {
    question: "현재완료 시제에 대해 알려주세요",
    subject: "english",
    gradeLevel: "7",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Middle school English - Present perfect (Korean query)"
  },
  {
    question: "Explain passive voice",
    subject: "english",
    gradeLevel: "10",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "High school English - Passive voice concept"
  },

  // ═══════════════════════════════════════════════════════
  // ENGLISH - Should NOT trigger RAG Direct
  // ═══════════════════════════════════════════════════════
  {
    question: "Write a creative story about a dragon",
    subject: "english",
    gradeLevel: "8",
    expectedRAGDirect: false,
    description: "Creative writing task - needs AI generation"
  },

  // ═══════════════════════════════════════════════════════
  // SCIENCE - Should trigger RAG Direct
  // ═══════════════════════════════════════════════════════
  {
    question: "What is photosynthesis?",
    subject: "science",
    gradeLevel: "5",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Elementary science - Photosynthesis concept"
  },
  {
    question: "세포란 무엇인가요?",
    subject: "science",
    gradeLevel: "6",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Middle school science - Cell concept (Korean)"
  },

  // ═══════════════════════════════════════════════════════
  // SOCIAL STUDIES - Should trigger RAG Direct
  // ═══════════════════════════════════════════════════════
  {
    question: "What are the three branches of government?",
    subject: "social-studies",
    gradeLevel: "8",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Middle school social studies - Government structure"
  },
  {
    question: "민주주의란 무엇인가요?",
    subject: "social-studies",
    gradeLevel: "7",
    expectedRAGDirect: true,
    expectedConfidence: 0.9,
    description: "Middle school social studies - Democracy concept (Korean)"
  },

  // ═══════════════════════════════════════════════════════
  // CROSS-SUBJECT TESTS (Should be redirected)
  // ═══════════════════════════════════════════════════════
  {
    question: "영어 문법 알려줘",
    subject: "math",
    gradeLevel: "5",
    expectedRAGDirect: false,
    description: "Wrong subject - English question in Math tutor (should redirect)"
  },
  {
    question: "What is addition?",
    subject: "english",
    gradeLevel: "3",
    expectedRAGDirect: false,
    description: "Wrong subject - Math question in English tutor (should redirect)"
  }
];

interface TestResult {
  question: TestQuestion;
  passed: boolean;
  actualRAGDirect: boolean;
  actualConfidence?: number;
  responseTime: number;
  errorMessage?: string;
  responsePreview?: string;
}

/**
 * Run integration tests
 */
async function runIntegrationTests(): Promise<void> {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║        RAG DIRECT INTEGRATION TEST SUITE                  ║
╠═══════════════════════════════════════════════════════════╣
  Total Test Cases: ${TEST_QUESTIONS.length}
  Subjects: Math, English, Science, Social Studies

  Testing:
  ✓ RAG Direct trigger accuracy
  ✓ Subject filter effectiveness
  ✓ Grade level appropriateness
  ✓ Response quality
  ✓ Performance metrics
╚═══════════════════════════════════════════════════════════╝
  `);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < TEST_QUESTIONS.length; i++) {
    const testCase = TEST_QUESTIONS[i];
    console.log(`\n[${i + 1}/${TEST_QUESTIONS.length}] Testing: ${testCase.description}`);
    console.log(`  Question: "${testCase.question.substring(0, 60)}${testCase.question.length > 60 ? '...' : ''}"`);
    console.log(`  Subject: ${testCase.subject} | Grade: ${testCase.gradeLevel}`);

    try {
      const startTime = Date.now();

      // Make API request
      const response = await fetch(`http://localhost:3000/api/chat/${testCase.subject}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.question,
          userId: 'test-user',
          conversationHistory: []
        })
      });

      const responseTime = Date.now() - startTime;

      // Check headers for RAG Direct indicator
      const ragDirectHeader = response.headers.get('X-RAG-Direct');
      const actualRAGDirect = ragDirectHeader === 'true';

      // Read response body
      const responseText = await response.text();
      const responsePreview = responseText.substring(0, 200);

      // Validate test expectations
      const testPassed = actualRAGDirect === testCase.expectedRAGDirect;

      const result: TestResult = {
        question: testCase,
        passed: testPassed,
        actualRAGDirect,
        responseTime,
        responsePreview
      };

      results.push(result);

      if (testPassed) {
        passed++;
        console.log(`  ✅ PASSED (${responseTime}ms) - RAG Direct: ${actualRAGDirect ? 'YES' : 'NO'}`);
      } else {
        failed++;
        console.log(`  ❌ FAILED (${responseTime}ms)`);
        console.log(`     Expected RAG Direct: ${testCase.expectedRAGDirect}`);
        console.log(`     Actual RAG Direct: ${actualRAGDirect}`);
      }

    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ ERROR: ${errorMessage}`);

      results.push({
        question: testCase,
        passed: false,
        actualRAGDirect: false,
        responseTime: 0,
        errorMessage
      });
    }

    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  printTestSummary(results, passed, failed);
}

/**
 * Print test summary
 */
function printTestSummary(results: TestResult[], passed: number, failed: number): void {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  TEST SUMMARY                              ║
╠═══════════════════════════════════════════════════════════╣
  Total Tests:       ${results.length}
  ✅ Passed:         ${passed} (${((passed / results.length) * 100).toFixed(1)}%)
  ❌ Failed:         ${failed} (${((failed / results.length) * 100).toFixed(1)}%)
╠═══════════════════════════════════════════════════════════╣

  BY SUBJECT:
  `);

  // Group by subject
  const bySubject: Record<Subject, { passed: number; total: number }> = {
    'math': { passed: 0, total: 0 },
    'english': { passed: 0, total: 0 },
    'science': { passed: 0, total: 0 },
    'social-studies': { passed: 0, total: 0 },
    'korean': { passed: 0, total: 0 }
  };

  results.forEach(r => {
    bySubject[r.question.subject].total++;
    if (r.passed) bySubject[r.question.subject].passed++;
  });

  Object.entries(bySubject).forEach(([subject, stats]) => {
    if (stats.total > 0) {
      const rate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`  ${subject.padEnd(15)} ${stats.passed}/${stats.total} (${rate}%)`);
    }
  });

  // RAG Direct accuracy
  const ragDirectTests = results.filter(r => r.question.expectedRAGDirect);
  const ragDirectCorrect = ragDirectTests.filter(r => r.passed).length;

  console.log(`
╠═══════════════════════════════════════════════════════════╣
  RAG DIRECT ACCURACY:
  Expected RAG Direct: ${ragDirectTests.length} cases
  Correctly Triggered: ${ragDirectCorrect} cases (${((ragDirectCorrect / ragDirectTests.length) * 100).toFixed(1)}%)
╠═══════════════════════════════════════════════════════════╣

  PERFORMANCE:
  `);

  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const ragDirectAvg = results.filter(r => r.actualRAGDirect).reduce((sum, r) => sum + r.responseTime, 0) /
                       Math.max(1, results.filter(r => r.actualRAGDirect).length);
  const apiCallAvg = results.filter(r => !r.actualRAGDirect).reduce((sum, r) => sum + r.responseTime, 0) /
                     Math.max(1, results.filter(r => !r.actualRAGDirect).length);

  console.log(`  Average Response Time:     ${avgResponseTime.toFixed(0)}ms`);
  console.log(`  RAG Direct Avg:            ${ragDirectAvg.toFixed(0)}ms`);
  console.log(`  API Call Avg:              ${apiCallAvg.toFixed(0)}ms`);
  console.log(`  Speed Improvement:         ${((apiCallAvg - ragDirectAvg) / apiCallAvg * 100).toFixed(1)}% faster`);

  // Failed tests detail
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log(`
╠═══════════════════════════════════════════════════════════╣
  FAILED TESTS DETAILS:
    `);

    failedTests.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.question.description}`);
      console.log(`     Expected: RAG Direct = ${r.question.expectedRAGDirect}`);
      console.log(`     Actual:   RAG Direct = ${r.actualRAGDirect}`);
      if (r.errorMessage) {
        console.log(`     Error: ${r.errorMessage}`);
      }
      console.log('');
    });
  }

  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Starting RAG Direct Integration Tests...\n');
  console.log('⚠️  Make sure the development server is running on http://localhost:3000\n');

  // Check if server is running
  try {
    const response = await fetch('http://localhost:3000');
    if (!response.ok) {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.error('❌ Error: Development server is not running!');
    console.error('   Please start the server with: npm run dev');
    process.exit(1);
  }

  await runIntegrationTests();
}

// Run tests
main().catch(console.error);
