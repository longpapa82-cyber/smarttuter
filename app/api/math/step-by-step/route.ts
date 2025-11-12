/**
 * Step-by-Step Math Solver API
 *
 * Khan Academy-style guided problem solving
 * POST /api/math/step-by-step
 *
 * Actions:
 * - analyze: Break down problem into steps
 * - validate: Check student's answer for a step
 * - hint: Get additional hint for current step
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateStepByStepPrompt,
  generateValidationPrompt,
  generateHintPrompt,
  type Step,
  type StepByStepSession,
} from '@/lib/math/step-by-step-solver';
import { vertexAIClient } from '@/lib/ai/vertex-client';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Using Vertex AI for unlimited quota

interface AnalyzeRequest {
  action: 'analyze';
  problem: string;
  gradeLevel?: string;
}

interface ValidateRequest {
  action: 'validate';
  problem: string;
  step: Step;
  studentAnswer: string;
}

interface HintRequest {
  action: 'hint';
  problem: string;
  step: Step;
  studentAttempts: string[];
}

type RequestBody = AnalyzeRequest | ValidateRequest | HintRequest;

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    console.log(`[Step-by-Step API] Action: ${body.action}`);

    switch (body.action) {
      case 'analyze':
        return await handleAnalyze(body);
      case 'validate':
        return await handleValidate(body);
      case 'hint':
        return await handleHint(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[Step-by-Step API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 문제 분석 및 단계 생성
 */
async function handleAnalyze(body: AnalyzeRequest) {
  console.log('[Step-by-Step] Analyzing problem...');
  console.log(`[Step-by-Step] Problem: ${body.problem}`);
  console.log(`[Step-by-Step] Grade Level: ${body.gradeLevel || '중학교'}`);

  const prompt = generateStepByStepPrompt(body.problem, body.gradeLevel);

  try {
    console.log('[Step-by-Step] Calling Vertex AI...');
    const result = await callVertexAI(prompt, true, true); // expectJSON=true, validateSteps=true
    console.log('[Step-by-Step] Vertex AI response received, length:', result.length);
    console.log('[Step-by-Step] Vertex AI response preview:', result.substring(0, 200));
    console.log('[Step-by-Step] Full Vertex AI response:', result);

    console.log('[Step-by-Step] Parsing response...');
    const parsed = parseVertexAIResponse(result);

    console.log('[Step-by-Step] Parsed object keys:', Object.keys(parsed));
    console.log('[Step-by-Step] Parsed steps type:', typeof parsed.steps);
    console.log('[Step-by-Step] Parsed steps value:', JSON.stringify(parsed.steps));
    console.log(`[Step-by-Step] Generated ${parsed.steps?.length || 0} steps`);

    // Validate steps array
    if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      console.error('[Step-by-Step] ❌ Invalid or empty steps array');
      console.error('[Step-by-Step] Parsed object:', JSON.stringify(parsed, null, 2));
      throw new Error('AI did not generate valid steps. Please try again with a simpler problem.');
    }

    // Validate each step has required fields
    for (let i = 0; i < parsed.steps.length; i++) {
      const step = parsed.steps[i];
      if (!step.instruction || !step.stepNumber) {
        console.error(`[Step-by-Step] ❌ Step ${i} missing required fields:`, step);
        throw new Error(`Invalid step format at step ${i + 1}`);
      }
    }

    console.log('[Step-by-Step] ✅ Analysis complete and validated');

    return NextResponse.json({
      success: true,
      problemType: parsed.problemType || 'other',
      difficulty: parsed.difficulty || 'medium',
      steps: parsed.steps,
      finalAnswer: parsed.finalAnswer,
    });
  } catch (error: any) {
    console.error('[Step-by-Step] ❌ Analysis failed:', error);
    console.error('[Step-by-Step] Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to analyze problem: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

/**
 * 학생 답변 검증
 */
async function handleValidate(body: ValidateRequest) {
  console.log('[Step-by-Step] Validating answer...');
  console.log(`[Step-by-Step] Student answer: ${body.studentAnswer}`);

  const prompt = generateValidationPrompt(
    body.problem,
    body.step,
    body.studentAnswer
  );

  try {
    const result = await callVertexAI(prompt, true, false); // expectJSON=true, validateSteps=false
    const parsed = parseVertexAIResponse(result);

    console.log('[Step-by-Step] ✅ Validation complete');
    console.log(`[Step-by-Step] Is correct: ${parsed.isCorrect}`);

    return NextResponse.json({
      success: true,
      isCorrect: parsed.isCorrect || false,
      feedback: parsed.feedback || '좋은 시도입니다!',
      suggestion: parsed.suggestion,
      correctAnswer: parsed.correctAnswer,
    });
  } catch (error: any) {
    console.error('[Step-by-Step] Validation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to validate answer: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

/**
 * 추가 힌트 요청
 */
async function handleHint(body: HintRequest) {
  console.log('[Step-by-Step] Generating hint...');

  const prompt = generateHintPrompt(
    body.problem,
    body.step,
    body.studentAttempts
  );

  try {
    const result = await callVertexAI(prompt, false, false); // expectJSON=false, validateSteps=false
    const hint = result.trim();

    console.log('[Step-by-Step] ✅ Hint generated');

    return NextResponse.json({
      success: true,
      hint,
    });
  } catch (error: any) {
    console.error('[Step-by-Step] Hint generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate hint: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Vertex AI 호출 with 재시도 로직 (무제한 할당량)
 * @param validateSteps - true면 steps 배열을 검증 (analyze용), false면 검증 안 함 (validate/hint용)
 */
async function callVertexAI(
  prompt: string,
  expectJSON: boolean = true,
  validateSteps: boolean = false,
  retries: number = 2
): Promise<any> {
  console.log('[Step-by-Step] callVertexAI started');
  console.log('[Step-by-Step] Prompt length:', prompt.length);
  console.log('[Step-by-Step] Validate steps:', validateSteps);
  console.log('[Step-by-Step] Retries remaining:', retries);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Step-by-Step] ⚠️ Retry attempt ${attempt}/${retries}`);
      }

      // Use Vertex AI client for unlimited quota
      const text = await vertexAIClient.generateContent(
        prompt,
        'flash', // Use flash tier for step-by-step
        {
          temperature: attempt === 0 ? 0.7 : 0.5, // Lower temperature on retry for more consistent output
          maxTokens: 2048,
          topP: 0.95,
          topK: 40,
        }
      );

      console.log('[Step-by-Step] ✅ Vertex AI response received, length:', text.length);

      if (!expectJSON) {
        return text;
      }

      // Validate that we can parse the JSON before returning
      try {
        const parsed = parseVertexAIResponse(text);

        // Only validate steps array if requested (for analyze action)
        if (validateSteps) {
          if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
            throw new Error('Response has empty or invalid steps array');
          }
        }

        console.log('[Step-by-Step] ✅ JSON validation passed');
        return text;
      } catch (parseError: any) {
        console.error(`[Step-by-Step] ❌ Parsing failed on attempt ${attempt + 1}:`, parseError.message);

        if (attempt < retries) {
          console.log('[Step-by-Step] Will retry with lower temperature...');
          continue; // Try again
        }

        // Last attempt failed, throw error
        throw new Error(`Failed to get valid JSON after ${retries + 1} attempts: ${parseError.message}`);
      }
    } catch (error: any) {
      console.error(`[Step-by-Step] ❌ callVertexAI exception on attempt ${attempt + 1}:`, error);

      if (attempt < retries) {
        console.log('[Step-by-Step] Will retry...');
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms before retry
        continue;
      }

      // Last attempt failed
      console.error('[Step-by-Step] Error stack:', error.stack);
      throw error;
    }
  }

  throw new Error('Failed to get response after all retries');
}

/**
 * JSON 자동 수정 - 일반적인 AI 응답 오류 패턴 수정
 */
function repairJSON(jsonStr: string): string {
  let repaired = jsonStr;

  // 1. Trailing commas 제거
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // 2. 마지막 요소 뒤 쉼표 제거 (배열)
  repaired = repaired.replace(/,(\s*])/g, '$1');

  // 3. 마지막 속성 뒤 쉼표 제거 (객체)
  repaired = repaired.replace(/,(\s*})/g, '$1');

  // 4. 열리지 않은 따옴표 수정 (간단한 경우만)
  const quoteCount = (repaired.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    // 홀수면 마지막에 " 추가
    repaired += '"';
  }

  // 5. 열린 대괄호/중괄호 닫기
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  if (openBraces > closeBraces) {
    repaired += '}'.repeat(openBraces - closeBraces);
  }

  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;
  if (openBrackets > closeBrackets) {
    repaired += ']'.repeat(openBrackets - closeBrackets);
  }

  return repaired;
}

/**
 * Vertex AI 응답에서 JSON 추출 및 파싱 (초강력 버전)
 */
function parseVertexAIResponse(text: string): any {
  console.log('[Step-by-Step] parseVertexAIResponse - Input length:', text.length);

  // JSON 코드 블록 제거 (```json ... ```)
  let cleaned = text.trim();
  cleaned = cleaned.replace(/```json\s*/g, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  cleaned = cleaned.trim();

  console.log('[Step-by-Step] After cleaning, length:', cleaned.length);

  // 전략 1: 첫 번째 { 부터 마지막 } 까지
  let start = cleaned.indexOf('{');
  if (start === -1) {
    console.error('[Step-by-Step] ❌ No JSON found in response');
    console.error('[Step-by-Step] Cleaned text:', cleaned);
    throw new Error('No JSON found in response');
  }

  // 여러 전략으로 JSON 추출 시도
  const strategies = [
    // 전략 1: 첫 { 부터 마지막 }
    () => cleaned.substring(start, cleaned.lastIndexOf('}') + 1),

    // 전략 2: 첫 { 부터 끝까지 (trailing } 추가 가능)
    () => {
      let json = cleaned.substring(start);
      // 열린 괄호 개수 세기
      const openCount = (json.match(/\{/g) || []).length;
      const closeCount = (json.match(/\}/g) || []).length;
      // 닫는 괄호가 부족하면 추가
      if (openCount > closeCount) {
        json += '}'.repeat(openCount - closeCount);
      }
      return json;
    },

    // 전략 3: 균형잡힌 괄호 찾기
    () => {
      let depth = 0;
      let end = start;
      for (let i = start; i < cleaned.length; i++) {
        if (cleaned[i] === '{') depth++;
        if (cleaned[i] === '}') depth--;
        if (depth === 0 && i > start) {
          end = i;
          break;
        }
      }
      return cleaned.substring(start, end + 1);
    }
  ];

  // 각 전략 시도 (자동 수정 포함)
  for (let i = 0; i < strategies.length; i++) {
    try {
      let jsonStr = strategies[i]();
      console.log(`[Step-by-Step] Trying strategy ${i + 1}, length:`, jsonStr.length);

      // 먼저 원본으로 시도
      try {
        const parsed = JSON.parse(jsonStr);
        console.log('[Step-by-Step] ✅ JSON parsed successfully with strategy', i + 1);
        return parsed;
      } catch (originalError) {
        // 원본 실패 시 자동 수정 시도
        console.log(`[Step-by-Step] Strategy ${i + 1} failed, trying auto-repair...`);
        const repaired = repairJSON(jsonStr);

        try {
          const parsed = JSON.parse(repaired);
          console.log('[Step-by-Step] ✅ JSON parsed after auto-repair with strategy', i + 1);
          return parsed;
        } catch (repairError) {
          throw originalError; // 수정도 실패하면 원본 에러 throw
        }
      }
    } catch (error) {
      console.log(`[Step-by-Step] Strategy ${i + 1} failed:`, (error as Error).message);

      if (i === strategies.length - 1) {
        // 마지막 전략도 실패 - 더 자세한 로그
        console.error('[Step-by-Step] ❌ All parsing strategies failed');
        console.error('[Step-by-Step] Full response (first 1000 chars):', cleaned.substring(0, 1000));
        console.error('[Step-by-Step] Last error:', (error as Error).message);
        throw new Error(`Failed to parse JSON after ${strategies.length} attempts: ${(error as Error).message}`);
      }
    }
  }

  throw new Error('Failed to parse JSON');
}

/**
 * Health check
 */
export async function GET() {
  const status = vertexAIClient.getStatus();
  return NextResponse.json({
    service: 'Step-by-Step Math Solver',
    vertexAI: status.vertexAIEnabled,
    fallbackAvailable: status.fallbackAvailable,
    model: status.vertexAIEnabled ? 'gemini-2.5-flash' : 'gemini-2.0-flash-exp',
  });
}
