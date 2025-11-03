/**
 * Error Diagnosis System
 *
 * Analyzes student errors and provides personalized feedback
 * for improved learning outcomes.
 */

export type ErrorCategory = 'calculation' | 'concept' | 'careless' | 'method';

export interface ErrorDiagnosisInput {
  problem: string;
  studentAnswer: string;
  correctAnswer: string;
  workingProcess?: string;
  schoolLevel: 'elementary' | 'middle' | 'high' | 'university';
}

export interface ErrorDiagnosisResult {
  category: ErrorCategory;
  categoryLabel: string;
  explanation: string;
  specificMistake: string;
  conceptsToReview: string[];
  recommendations: string[];
  similarProblems: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Error category metadata
 */
export const ERROR_CATEGORIES = {
  calculation: {
    label: '계산 실수',
    icon: '🔢',
    color: 'blue',
    description: '계산 과정에서 발생한 실수',
  },
  concept: {
    label: '개념 이해 부족',
    icon: '💡',
    color: 'amber',
    description: '기본 개념에 대한 이해가 부족함',
  },
  careless: {
    label: '부주의 실수',
    icon: '⚠️',
    color: 'orange',
    description: '집중력 부족으로 인한 실수',
  },
  method: {
    label: '풀이 방법 오류',
    icon: '🎯',
    color: 'red',
    description: '문제 해결 접근 방법이 잘못됨',
  },
} as const;

/**
 * Generate error diagnosis prompt for AI
 */
export function generateErrorDiagnosisPrompt(input: ErrorDiagnosisInput): string {
  const { problem, studentAnswer, correctAnswer, workingProcess, schoolLevel } = input;

  const schoolLevelLabel = {
    elementary: '초등학교',
    middle: '중학교',
    high: '고등학교',
    university: '대학교',
  }[schoolLevel];

  return `당신은 ${schoolLevelLabel} 수학 학습을 돕는 전문 튜터입니다. 학생의 오답을 진단하고 맞춤형 피드백을 제공해주세요.

**문제**:
${problem}

**학생 답변**: ${studentAnswer}
**정답**: ${correctAnswer}
${workingProcess ? `**학생의 풀이 과정**:\n${workingProcess}` : ''}

다음 형식으로 정확하게 답변해주세요:

### Error Category
[calculation | concept | careless | method] 중 하나를 선택

### Specific Mistake
학생이 구체적으로 어디서 무엇을 잘못했는지 명확하게 설명

### Concepts to Review
학생이 복습해야 할 개념들을 최대 3개까지 나열 (각 줄에 하나씩)

### Recommendations
학생에게 도움이 될 학습 방법이나 팁을 최대 3개까지 제공 (각 줄에 하나씩)

### Similar Problems
비슷한 유형의 연습 문제를 3개 제시 (각 줄에 하나씩)

### Severity
[low | medium | high] 중 하나를 선택하여 오류의 심각도 표시

**중요**: 학생의 자존감을 지키면서도 명확한 피드백을 제공하세요. 긍정적이고 격려하는 톤을 유지하세요.`;
}

/**
 * Parse AI response into structured error diagnosis result
 */
export function parseErrorDiagnosis(aiResponse: string): ErrorDiagnosisResult {
  const lines = aiResponse.split('\n').map(line => line.trim()).filter(line => line);

  let category: ErrorCategory = 'careless';
  let explanation = '';
  let specificMistake = '';
  const conceptsToReview: string[] = [];
  const recommendations: string[] = [];
  const similarProblems: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'medium';

  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect sections
    if (line.includes('### Error Category') || line.includes('###Error Category')) {
      currentSection = 'category';
      continue;
    } else if (line.includes('### Specific Mistake') || line.includes('###Specific Mistake')) {
      currentSection = 'mistake';
      continue;
    } else if (line.includes('### Concepts to Review') || line.includes('###Concepts to Review')) {
      currentSection = 'concepts';
      continue;
    } else if (line.includes('### Recommendations') || line.includes('###Recommendations')) {
      currentSection = 'recommendations';
      continue;
    } else if (line.includes('### Similar Problems') || line.includes('###Similar Problems')) {
      currentSection = 'problems';
      continue;
    } else if (line.includes('### Severity') || line.includes('###Severity')) {
      currentSection = 'severity';
      continue;
    }

    // Skip markdown headers
    if (line.startsWith('#')) continue;

    // Parse content based on current section
    switch (currentSection) {
      case 'category':
        const categoryMatch = line.match(/\b(calculation|concept|careless|method)\b/i);
        if (categoryMatch) {
          category = categoryMatch[1].toLowerCase() as ErrorCategory;
        }
        break;

      case 'mistake':
        if (!line.startsWith('-') && !line.startsWith('*')) {
          specificMistake += (specificMistake ? ' ' : '') + line;
        }
        break;

      case 'concepts':
        if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
          const concept = line.replace(/^[-*\d.]\s*/, '').trim();
          if (concept && conceptsToReview.length < 3) {
            conceptsToReview.push(concept);
          }
        } else if (line && !line.startsWith('#') && conceptsToReview.length < 3) {
          conceptsToReview.push(line);
        }
        break;

      case 'recommendations':
        if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
          const rec = line.replace(/^[-*\d.]\s*/, '').trim();
          if (rec && recommendations.length < 3) {
            recommendations.push(rec);
          }
        } else if (line && !line.startsWith('#') && recommendations.length < 3) {
          recommendations.push(line);
        }
        break;

      case 'problems':
        if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
          const problem = line.replace(/^[-*\d.]\s*/, '').trim();
          if (problem && similarProblems.length < 3) {
            similarProblems.push(problem);
          }
        } else if (line && !line.startsWith('#') && similarProblems.length < 3) {
          similarProblems.push(line);
        }
        break;

      case 'severity':
        const severityMatch = line.match(/\b(low|medium|high)\b/i);
        if (severityMatch) {
          severity = severityMatch[1].toLowerCase() as 'low' | 'medium' | 'high';
        }
        break;
    }
  }

  // Generate explanation from specific mistake
  explanation = specificMistake || '이 문제를 다시 한 번 살펴보세요.';

  return {
    category,
    categoryLabel: ERROR_CATEGORIES[category].label,
    explanation,
    specificMistake,
    conceptsToReview: conceptsToReview.length > 0 ? conceptsToReview : ['기본 개념 복습'],
    recommendations: recommendations.length > 0 ? recommendations : ['비슷한 문제를 더 풀어보세요'],
    similarProblems: similarProblems.length > 0 ? similarProblems : ['관련 문제를 찾아서 연습하세요'],
    severity,
  };
}

/**
 * Determine error severity based on category and context
 */
export function determineErrorSeverity(
  category: ErrorCategory,
  isRepeatedError: boolean = false
): 'low' | 'medium' | 'high' {
  if (isRepeatedError) return 'high';

  switch (category) {
    case 'concept':
      return 'high';
    case 'method':
      return 'medium';
    case 'calculation':
      return 'low';
    case 'careless':
      return 'low';
    default:
      return 'medium';
  }
}
