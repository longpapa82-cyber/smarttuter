/**
 * 수학 풀이 단계 파서
 * Gemini의 단계별 풀이 응답을 파싱하여 구조화된 데이터로 변환
 */

export interface MathStep {
  stepNumber: number;
  title: string;
  explanation: string;
  equation?: string;
}

export interface ParsedSolution {
  hasProblem: boolean;
  problem?: string;
  hasSteps: boolean;
  steps: MathStep[];
  finalAnswer?: string;
  conceptExplanation?: string;
  practiceProblems?: string[];
}

/**
 * Gemini 응답에서 단계별 풀이 파싱
 */
export function parseStepByStepSolution(text: string): ParsedSolution {
  const result: ParsedSolution = {
    hasProblem: false,
    hasSteps: false,
    steps: [],
  };

  // 문제 추출
  const problemMatch = text.match(/\*\*문제\*\*:\s*([\s\S]+?)(?=\n\n|\*\*풀이 과정\*\*)/);

  if (problemMatch) {
    result.hasProblem = true;
    result.problem = problemMatch[1].trim();
  }

  // Step 패턴 찾기
  const stepPattern = /###\s*Step\s*(\d+):\s*(.+?)\n([\s\S]*?)(?=###\s*Step\s*\d+:|$|\*\*최종 답\*\*:)/gi;
  const steps: MathStep[] = [];

  let match;
  while ((match = stepPattern.exec(text)) !== null) {
    const stepNumber = parseInt(match[1]);
    const title = match[2].trim();
    const content = match[3].trim();

    // 코드 블록에서 수식 추출
    const equationMatch = content.match(/```\n?([\s\S]*?)```/);
    const equation = equationMatch ? equationMatch[1].trim() : undefined;

    // 설명 추출 (코드 블록 제외)
    const explanation = content.replace(/```[\s\S]*?```/g, '').trim();

    steps.push({
      stepNumber,
      title,
      explanation,
      equation,
    });
  }

  if (steps.length > 0) {
    result.hasSteps = true;
    result.steps = steps;
  }

  // 최종 답 추출
  const answerMatch = text.match(/\*\*최종 답\*\*:\s*([\s\S]+?)(?=\n\n|\*\*개념 설명\*\*|$)/);
  if (answerMatch) {
    result.finalAnswer = answerMatch[1].trim();
  }

  // 개념 설명 추출
  const conceptMatch = text.match(/\*\*개념 설명\*\*:\s*([\s\S]+?)(?=\n\n|\*\*연습 문제\*\*|$)/);
  if (conceptMatch) {
    result.conceptExplanation = conceptMatch[1].trim();
  }

  // 연습 문제 추출
  const practiceMatch = text.match(/\*\*연습 문제\*\*:\s*([\s\S]+?)$/);
  if (practiceMatch) {
    result.practiceProblems = [practiceMatch[1].trim()];
  }

  return result;
}

/**
 * 텍스트에 단계별 풀이가 포함되어 있는지 확인
 */
export function hasStepByStepFormat(text: string): boolean {
  // Step 1, Step 2 등의 패턴이 있는지 확인
  const stepPattern = /###\s*Step\s*\d+:/i;
  return stepPattern.test(text);
}

/**
 * 수식을 LaTeX 스타일로 변환 (간단한 변환)
 */
export function formatEquation(equation: string): string {
  // 기본적인 수식 포맷팅
  return equation
    .replace(/\^(\d+)/g, '<sup>$1</sup>') // 지수
    .replace(/sqrt\(([^)]+)\)/g, '√($1)') // 제곱근
    .replace(/∫/g, '∫') // 적분 기호 유지
    .trim();
}
