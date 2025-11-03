/**
 * Error Diagnosis Response Parser
 *
 * Detects and parses error diagnosis format from AI responses
 */

import { ErrorDiagnosisResult, ErrorCategory } from './error-diagnosis';

/**
 * Check if message contains error diagnosis format
 */
export function hasErrorDiagnosisFormat(content: string): boolean {
  return (
    content.includes('### Error Category') &&
    content.includes('### Specific Mistake') &&
    (content.includes('### Concepts to Review') || content.includes('### Recommendations'))
  );
}

/**
 * Parse error diagnosis from AI response
 */
export function parseErrorDiagnosisResponse(content: string): ErrorDiagnosisResult | null {
  if (!hasErrorDiagnosisFormat(content)) {
    return null;
  }

  const lines = content.split('\n').map(line => line.trim());

  let category: ErrorCategory = 'careless';
  let specificMistake = '';
  const conceptsToReview: string[] = [];
  const recommendations: string[] = [];
  const similarProblems: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'medium';

  let currentSection = '';
  let buffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Section headers
    if (line === '### Error Category') {
      if (buffer && currentSection === 'mistake') specificMistake = buffer.trim();
      currentSection = 'category';
      buffer = '';
      continue;
    } else if (line === '### Specific Mistake') {
      currentSection = 'mistake';
      buffer = '';
      continue;
    } else if (line === '### Concepts to Review') {
      if (buffer && currentSection === 'mistake') specificMistake = buffer.trim();
      currentSection = 'concepts';
      buffer = '';
      continue;
    } else if (line === '### Recommendations') {
      currentSection = 'recommendations';
      buffer = '';
      continue;
    } else if (line === '### Similar Problems') {
      currentSection = 'problems';
      buffer = '';
      continue;
    } else if (line === '### Severity') {
      currentSection = 'severity';
      buffer = '';
      continue;
    }

    // Skip empty lines and other headers
    if (!line || line.startsWith('##') || line.startsWith('**')) continue;

    // Parse content based on section
    switch (currentSection) {
      case 'category':
        const categoryMatch = line.match(/\b(calculation|concept|careless|method)\b/i);
        if (categoryMatch) {
          category = categoryMatch[1].toLowerCase() as ErrorCategory;
        }
        break;

      case 'mistake':
        buffer += (buffer ? ' ' : '') + line;
        break;

      case 'concepts':
        if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
          const concept = line.replace(/^[-*\d.]\s*/, '').trim();
          if (concept && conceptsToReview.length < 3) {
            conceptsToReview.push(concept);
          }
        }
        break;

      case 'recommendations':
        if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
          const rec = line.replace(/^[-*\d.]\s*/, '').trim();
          if (rec && recommendations.length < 3) {
            recommendations.push(rec);
          }
        }
        break;

      case 'problems':
        if (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
          const problem = line.replace(/^[-*\d.]\s*/, '').trim();
          if (problem && similarProblems.length < 3) {
            similarProblems.push(problem);
          }
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

  // Finalize specific mistake if still in buffer
  if (buffer && currentSection === 'mistake') {
    specificMistake = buffer.trim();
  }

  // Get category label
  const categoryLabels: Record<ErrorCategory, string> = {
    calculation: '계산 실수',
    concept: '개념 이해 부족',
    careless: '부주의 실수',
    method: '풀이 방법 오류',
  };

  return {
    category,
    categoryLabel: categoryLabels[category],
    explanation: specificMistake,
    specificMistake,
    conceptsToReview: conceptsToReview.length > 0 ? conceptsToReview : ['기본 개념 복습'],
    recommendations: recommendations.length > 0 ? recommendations : ['비슷한 문제를 더 풀어보세요'],
    similarProblems: similarProblems.length > 0 ? similarProblems : ['관련 문제를 찾아서 연습하세요'],
    severity,
  };
}

/**
 * Extract clean message content without error diagnosis formatting
 */
export function extractCleanContent(content: string): string {
  if (!hasErrorDiagnosisFormat(content)) {
    return content;
  }

  // Find the start of error diagnosis format
  const errorCategoryIndex = content.indexOf('### Error Category');
  if (errorCategoryIndex === -1) {
    return content;
  }

  // Return content before error diagnosis
  return content.substring(0, errorCategoryIndex).trim();
}
