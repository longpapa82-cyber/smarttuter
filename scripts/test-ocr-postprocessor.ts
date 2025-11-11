/**
 * OCR Post-processor Test Script
 *
 * Tests the accuracy of OCR post-processing correction rules
 * Run: npx tsx scripts/test-ocr-postprocessor.ts
 */

import { postProcessOCR, getCorrectionSummary } from '../lib/ocr/ocr-postprocessor';

interface TestCase {
  id: string;
  category: string;
  input: string;
  expected: string;
  context?: string;
  description: string;
}

const testCases: TestCase[] = [
  // ============================================================================
  // A. 숫자 ↔ 알파벳 혼동
  // ============================================================================
  {
    id: 'TC-001',
    category: '숫자→알파벳',
    input: '점 8에서 점 C까지',
    expected: '점 B에서 점 C까지',
    description: '알파벳 문맥에서 8→B 변환'
  },
  {
    id: 'TC-002',
    category: '알파벳→숫자',
    input: 'B + 5 = 13',
    expected: '8 + 5 = 13',
    description: '수식 문맥에서 B→8 변환'
  },
  {
    id: 'TC-003',
    category: '숫자→알파벳',
    input: '0A 위의 점',
    expected: 'OA 위의 점',
    description: '알파벳 문맥에서 0→O 변환'
  },
  {
    id: 'TC-004',
    category: '숫자→알파벳',
    input: '점 5와 점 T',
    expected: '점 S와 점 T',
    description: '알파벳 문맥에서 5→S 변환'
  },
  {
    id: 'TC-005',
    category: '알파벳→숫자',
    input: 'Z + 3 = 5',
    expected: '2 + 3 = 5',
    description: '수식 문맥에서 Z→2 변환'
  },

  // ============================================================================
  // B. 한글 오인식
  // ============================================================================
  {
    id: 'TC-006',
    category: '한글 오인식',
    input: 'CollAl점과 D점',
    expected: 'C점과 D점',
    description: 'OCR 오인식 CollAl→C'
  },
  {
    id: 'TC-007',
    category: '한글 오인식',
    input: 'ㄱl = 5cm',
    expected: 'ㄱ = 5cm',
    description: '한글 ㄱ 오인식 수정'
  },
  {
    id: 'TC-008',
    category: '한글 오인식',
    input: 'ㄴl + ㄷ = 10',
    expected: 'ㄴ + ㄷ = 10',
    description: '한글 ㄴ 오인식 수정'
  },

  // ============================================================================
  // C. 단위 오인식
  // ============================================================================
  {
    id: 'TC-009',
    category: '단위 보정',
    input: '거리는 10',
    expected: '거리는 km',
    context: '거리 측정 문제',
    description: '거리 문맥에서 10→km'
  },
  {
    id: 'TC-010',
    category: '단위 보정',
    input: '길이는 10',
    expected: '길이는 km',
    context: '길이 측정',
    description: '길이 문맥에서 10→km'
  },
  {
    id: 'TC-011',
    category: '단위 보정',
    input: '5krn',
    expected: '5km',
    description: 'km 단위 오인식 수정'
  },

  // ============================================================================
  // D. 수학 기호 정규화
  // ============================================================================
  {
    id: 'TC-012',
    category: '수학 기호',
    input: '3 × 4',
    expected: '3 * 4',
    description: '곱셈 기호 × → *'
  },
  {
    id: 'TC-013',
    category: '수학 기호',
    input: '12 ÷ 3',
    expected: '12 / 3',
    description: '나눗셈 기호 ÷ → /'
  },
  {
    id: 'TC-014',
    category: '수학 기호',
    input: '5 － 2',
    expected: '5 - 2',
    description: '전각 빼기 → 반각 빼기'
  },
  {
    id: 'TC-015',
    category: '수학 기호',
    input: '3 ＋ 7',
    expected: '3 + 7',
    description: '전각 더하기 → 반각 더하기'
  },
  {
    id: 'TC-016',
    category: '분수 띄어쓰기',
    input: '1 / 2',
    expected: '1/2',
    description: '분수 띄어쓰기 제거'
  },
  {
    id: 'TC-017',
    category: '제곱근 띄어쓰기',
    input: '√ 25',
    expected: '√25',
    description: '루트 기호 띄어쓰기 제거'
  },

  // ============================================================================
  // E. 문맥 기반 보정
  // ============================================================================
  {
    id: 'TC-018',
    category: '도형 문맥',
    input: '삼각형 A8C',
    expected: '삼각형 ABC',
    context: '도형 문제',
    description: '도형 문맥에서 8→B'
  },
  {
    id: 'TC-019',
    category: '도형 문맥',
    input: '사각형 ABCD에서 점 8',
    expected: '사각형 ABCD에서 점 B',
    context: '사각형 넓이',
    description: '도형 문맥에서 8→B'
  },
  {
    id: 'TC-020',
    category: '좌표 문맥',
    input: '좌표 ( 3 , 5 )',
    expected: '좌표 (3, 5)',
    context: '좌표평면',
    description: '좌표 형식 정규화'
  },

  // ============================================================================
  // F. 복합 수식
  // ============================================================================
  {
    id: 'TC-021',
    category: '복합 수식',
    input: '(3 × 4) ÷ 2 = 6',
    expected: '(3 * 4) / 2 = 6',
    description: '복합 수학 기호 정규화'
  },
  {
    id: 'TC-022',
    category: '복합 수식',
    input: '√ 25 ＋ 1 / 2',
    expected: '√25 + 1/2',
    description: '제곱근 + 분수 정규화'
  },
];

// ============================================================================
// Test Runner
// ============================================================================

function runTests() {
  console.log('🧪 OCR Post-processor Accuracy Test\n');
  console.log('='.repeat(80));
  console.log('\n');

  let passed = 0;
  let failed = 0;
  const failedTests: { id: string; expected: string; actual: string }[] = [];

  for (const test of testCases) {
    const result = postProcessOCR(test.input, 1.0, test.context);
    const success = result.corrected === test.expected;

    if (success) {
      passed++;
      console.log(`✅ ${test.id} - ${test.category}`);
      console.log(`   Input:    "${test.input}"`);
      console.log(`   Expected: "${test.expected}"`);
      console.log(`   Actual:   "${result.corrected}"`);
      console.log(`   ${getCorrectionSummary(result)}`);
    } else {
      failed++;
      failedTests.push({
        id: test.id,
        expected: test.expected,
        actual: result.corrected,
      });
      console.log(`❌ ${test.id} - ${test.category}`);
      console.log(`   Input:    "${test.input}"`);
      console.log(`   Expected: "${test.expected}"`);
      console.log(`   Actual:   "${result.corrected}" ⚠️ MISMATCH`);
      console.log(`   ${getCorrectionSummary(result)}`);
    }
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`✅ Passed: ${passed} (${((passed / testCases.length) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed / testCases.length) * 100).toFixed(1)}%)`);
  console.log('');

  // Category breakdown
  const categoryStats: Record<string, { total: number; passed: number }> = {};
  for (const test of testCases) {
    if (!categoryStats[test.category]) {
      categoryStats[test.category] = { total: 0, passed: 0 };
    }
    categoryStats[test.category].total++;

    const result = postProcessOCR(test.input, 1.0, test.context);
    if (result.corrected === test.expected) {
      categoryStats[test.category].passed++;
    }
  }

  console.log('📈 Category Breakdown:\n');
  for (const [category, stats] of Object.entries(categoryStats)) {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  }
  console.log('');

  if (failedTests.length > 0) {
    console.log('⚠️ Failed Tests:\n');
    for (const ft of failedTests) {
      console.log(`  ${ft.id}:`);
      console.log(`    Expected: "${ft.expected}"`);
      console.log(`    Actual:   "${ft.actual}"`);
    }
    console.log('');
  }

  // Success criteria
  const successRate = (passed / testCases.length) * 100;
  console.log('🎯 Success Criteria:\n');
  console.log(`  Target: 95% accuracy`);
  console.log(`  Result: ${successRate.toFixed(1)}% ${successRate >= 95 ? '✅' : '❌'}`);
  console.log('');

  if (successRate >= 95) {
    console.log('🎉 Post-processor Test PASSED!\n');
  } else {
    console.log('⚠️ Post-processor Test FAILED - needs improvement\n');
  }

  return { passed, failed, successRate };
}

// Run tests
runTests();
