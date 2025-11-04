/**
 * Week 3 Day 3: Chain-of-Thought Reasoning
 *
 * Implements step-by-step reasoning to prevent logical errors and improve answer quality
 *
 * Features:
 * - Structured reasoning process
 * - Intermediate verification steps
 * - Transparent thinking for students to learn
 * - Error detection in reasoning chain
 *
 * Based on research:
 * - Chain-of-Thought Prompting (Google Research 2022)
 * - Step-by-step reasoning improves accuracy by 30-40%
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Subject } from './curriculum-database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ReasoningStep {
  stepNumber: number;
  description: string;
  thinking: string;
  result: string;
  confidence: number; // 0-100
  verified: boolean;
}

export interface ChainOfThought {
  question: string;
  steps: ReasoningStep[];
  finalAnswer: string;
  overallConfidence: number; // 0-100
  reasoningQuality: 'high' | 'medium' | 'low';
  warnings?: string[]; // Any logical inconsistencies detected
}

/**
 * Generate chain-of-thought reasoning for a question
 */
export async function generateChainOfThought(
  question: string,
  subject: Subject,
  gradeLevel: string,
  context?: string // Optional RAG context
): Promise<ChainOfThought> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Low temperature for consistent reasoning
        topP: 0.9,
      }
    });

    const prompt = buildChainOfThoughtPrompt(question, subject, gradeLevel, context);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the chain-of-thought response
    const chainOfThought = parseChainOfThoughtResponse(text, question);

    return chainOfThought;

  } catch (error) {
    console.error('[Chain-of-Thought] Error:', error);

    // Return fallback minimal reasoning
    return {
      question,
      steps: [],
      finalAnswer: 'Error generating reasoning',
      overallConfidence: 0,
      reasoningQuality: 'low',
      warnings: ['Failed to generate chain-of-thought reasoning']
    };
  }
}

/**
 * Build chain-of-thought prompt
 */
function buildChainOfThoughtPrompt(
  question: string,
  subject: Subject,
  gradeLevel: string,
  context?: string
): string {
  const subjectKo = subject === 'english' ? '영어' : '수학';

  let prompt = `You are a ${subjectKo} tutor for ${gradeLevel}학년 students. Answer this question using step-by-step reasoning.

${context ? `VERIFIED CONTENT (use this as reference):\n${context}\n\n` : ''}

STUDENT QUESTION:
${question}

INSTRUCTIONS:
1. Think through the problem step-by-step
2. Show your reasoning process clearly
3. Verify each step before moving to the next
4. Use ${gradeLevel}학년-appropriate language
5. Provide a clear final answer

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

Step 1: [What we need to understand]
Thinking: [Explain your reasoning]
Result: [Conclusion from this step]
Confidence: [0-100]

Step 2: [Next logical step]
Thinking: [Explain your reasoning]
Result: [Conclusion from this step]
Confidence: [0-100]

[Continue with more steps as needed]

Final Answer: [Clear, complete answer to the student's question]
Overall Confidence: [0-100]

Now provide your step-by-step reasoning:`;

  return prompt;
}

/**
 * Parse chain-of-thought response from AI
 */
function parseChainOfThoughtResponse(
  response: string,
  question: string
): ChainOfThought {
  const steps: ReasoningStep[] = [];
  let finalAnswer = '';
  let overallConfidence = 80; // Default
  const warnings: string[] = [];

  try {
    // Extract steps using regex
    const stepPattern = /Step (\d+):\s*(.+?)\nThinking:\s*(.+?)\nResult:\s*(.+?)\nConfidence:\s*(\d+)/gs;

    let match;
    while ((match = stepPattern.exec(response)) !== null) {
      const stepNumber = parseInt(match[1]);
      const description = match[2].trim();
      const thinking = match[3].trim();
      const result = match[4].trim();
      const confidence = parseInt(match[5]);

      steps.push({
        stepNumber,
        description,
        thinking,
        result,
        confidence,
        verified: confidence >= 70 // Auto-verify if high confidence
      });

      // Warning if low confidence step
      if (confidence < 50) {
        warnings.push(`Low confidence in step ${stepNumber}: ${description}`);
      }
    }

    // Extract final answer
    const finalAnswerMatch = response.match(/Final Answer:\s*(.+?)(?=\nOverall Confidence:|$)/s);
    if (finalAnswerMatch) {
      finalAnswer = finalAnswerMatch[1].trim();
    }

    // Extract overall confidence
    const confidenceMatch = response.match(/Overall Confidence:\s*(\d+)/);
    if (confidenceMatch) {
      overallConfidence = parseInt(confidenceMatch[1]);
    }

  } catch (error) {
    console.error('[Chain-of-Thought Parsing] Error:', error);
    warnings.push('Error parsing reasoning steps');
  }

  // Determine reasoning quality
  let reasoningQuality: 'high' | 'medium' | 'low';
  if (steps.length >= 3 && overallConfidence >= 80) {
    reasoningQuality = 'high';
  } else if (steps.length >= 2 && overallConfidence >= 60) {
    reasoningQuality = 'medium';
  } else {
    reasoningQuality = 'low';
  }

  return {
    question,
    steps,
    finalAnswer: finalAnswer || response, // Use full response if parsing failed
    overallConfidence,
    reasoningQuality,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Format chain-of-thought for display to student
 */
export function formatChainOfThoughtForStudent(
  cot: ChainOfThought,
  showSteps: boolean = true
): string {
  let output = '';

  if (showSteps && cot.steps.length > 0) {
    output += '🤔 **단계별 풀이**\n\n';

    for (const step of cot.steps) {
      output += `**${step.stepNumber}단계**: ${step.description}\n`;
      output += `💭 ${step.thinking}\n`;
      output += `✅ ${step.result}\n\n`;
    }

    output += '---\n\n';
  }

  output += `📝 **답변**\n\n${cot.finalAnswer}`;

  // Add warnings if reasoning quality is low
  if (cot.reasoningQuality === 'low' && cot.warnings) {
    output += '\n\n⚠️ **주의**: 이 답변은 확실하지 않을 수 있습니다. 더 구체적으로 질문해주시면 더 정확하게 답변드릴 수 있어요!';
  }

  return output;
}

/**
 * Verify reasoning chain for logical consistency
 */
export function verifyReasoningChain(cot: ChainOfThought): {
  isConsistent: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check 1: Are there enough reasoning steps?
  if (cot.steps.length === 0) {
    issues.push('No reasoning steps provided');
  }

  // Check 2: Are all steps verified?
  const unverifiedSteps = cot.steps.filter(s => !s.verified);
  if (unverifiedSteps.length > 0) {
    issues.push(`${unverifiedSteps.length} unverified steps`);
  }

  // Check 3: Are there low-confidence steps?
  const lowConfidenceSteps = cot.steps.filter(s => s.confidence < 60);
  if (lowConfidenceSteps.length > 0) {
    issues.push(`${lowConfidenceSteps.length} low-confidence steps`);
  }

  // Check 4: Is overall confidence reasonable?
  if (cot.overallConfidence < 70) {
    issues.push(`Low overall confidence: ${cot.overallConfidence}%`);
  }

  // Check 5: Do steps build logically?
  for (let i = 1; i < cot.steps.length; i++) {
    const prevStep = cot.steps[i - 1];
    const currStep = cot.steps[i];

    // Check if step numbers are sequential
    if (currStep.stepNumber !== prevStep.stepNumber + 1) {
      issues.push(`Non-sequential steps: ${prevStep.stepNumber} → ${currStep.stepNumber}`);
    }
  }

  return {
    isConsistent: issues.length === 0,
    issues
  };
}

/**
 * Generate chain-of-thought for math problem solving
 */
export function buildMathChainOfThoughtPrompt(
  problem: string,
  gradeLevel: string
): string {
  return `You are a math tutor for ${gradeLevel}학년. Solve this problem step-by-step.

PROBLEM:
${problem}

SOLVE USING THESE STEPS:

Step 1: Understand the problem
Thinking: What is being asked? What information do we have?
Result: [Restate the problem in your own words]
Confidence: [0-100]

Step 2: Plan the solution
Thinking: What method/formula should we use? Why?
Result: [State the approach]
Confidence: [0-100]

Step 3: Execute the plan
Thinking: [Show the calculation step-by-step]
Result: [Intermediate result]
Confidence: [0-100]

Step 4: Check the answer
Thinking: Does this make sense? Can we verify it?
Result: [Verification]
Confidence: [0-100]

Final Answer: [Clear numerical answer with units if applicable]
Overall Confidence: [0-100]

Now solve:`;
}

/**
 * Generate chain-of-thought for English grammar explanation
 */
export function buildEnglishChainOfThoughtPrompt(
  question: string,
  gradeLevel: string
): string {
  return `You are an English tutor for ${gradeLevel}학년. Explain this grammar concept step-by-step.

QUESTION:
${question}

EXPLAIN USING THESE STEPS:

Step 1: Identify the grammar concept
Thinking: What grammar topic is being asked about?
Result: [Name the concept]
Confidence: [0-100]

Step 2: Explain the basic rule
Thinking: What is the fundamental rule or pattern?
Result: [State the rule clearly]
Confidence: [0-100]

Step 3: Provide examples
Thinking: What are good examples that illustrate this rule?
Result: [Give 2-3 clear examples]
Confidence: [0-100]

Step 4: Common mistakes
Thinking: What mistakes do students often make?
Result: [Mention common errors]
Confidence: [0-100]

Final Answer: [Complete, student-friendly explanation]
Overall Confidence: [0-100]

Now explain:`;
}

/**
 * Combine RAG + Chain-of-Thought for maximum accuracy
 */
export async function generateRAGChainOfThought(
  question: string,
  subject: Subject,
  gradeLevel: string,
  verifiedContext: string
): Promise<ChainOfThought> {
  // Use verified context in chain-of-thought reasoning
  return generateChainOfThought(question, subject, gradeLevel, verifiedContext);
}
