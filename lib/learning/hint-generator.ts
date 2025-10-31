import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface HintGenerationRequest {
  problem: string
  subject: 'math' | 'english'
  gradeLevel: 'elementary' | 'middle' | 'high' | 'college'
  studentAttempt?: string
  previousHints?: string[]
}

export interface GeneratedHint {
  level: 1 | 2 | 3
  type: 'conceptual' | 'strategic' | 'procedural' | 'visual' | 'example'
  content: string
  visual?: string
}

/**
 * Generate adaptive hints using Claude AI
 * Follows Khan Academy's Socratic method - guides without giving away the answer
 */
export async function generateHints(
  request: HintGenerationRequest
): Promise<GeneratedHint[]> {
  const { problem, subject, gradeLevel, studentAttempt, previousHints = [] } = request

  const prompt = `You are an expert ${subject} tutor helping a ${gradeLevel} student solve a problem.

Problem: ${problem}

${studentAttempt ? `Student's current attempt: ${studentAttempt}` : ''}
${previousHints.length > 0 ? `Previous hints given: ${previousHints.join(', ')}` : ''}

Generate 3 progressive hints following these guidelines:

**Level 1 (Gentle Hint - Conceptual/Strategic)**:
- Point student to the right concept or strategy
- Ask a guiding question
- Don't reveal specific steps
- Example: "What mathematical property could help simplify this expression?"

**Level 2 (Moderate Hint - Procedural)**:
- Provide first step or partial strategy
- Still avoid complete solution
- Example: "Try combining like terms first, then isolate the variable"

**Level 3 (Detailed Hint - Partial Solution)**:
- Show the first major step worked out
- Explain the reasoning
- Let student complete remaining steps
- Example: "Step 1: 3x + 5 = 20 → 3x = 15 (subtract 5 from both sides). Now you try the next step!"

Return a JSON array of 3 hints with this structure:
[
  {
    "level": 1,
    "type": "conceptual" | "strategic" | "procedural" | "visual" | "example",
    "content": "hint text",
    "visual": "optional ASCII diagram or formula representation"
  }
]

Make hints encouraging, age-appropriate, and follow the Socratic method (guide discovery, don't just tell).`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to extract hints from AI response')
    }

    const hints: GeneratedHint[] = JSON.parse(jsonMatch[0])
    return hints

  } catch (error) {
    console.error('Error generating hints:', error)

    // Fallback hints if AI generation fails
    return getFallbackHints(subject, gradeLevel)
  }
}

/**
 * Generate fallback hints if AI generation fails
 */
function getFallbackHints(
  subject: 'math' | 'english',
  gradeLevel: string
): GeneratedHint[] {
  if (subject === 'math') {
    return [
      {
        level: 1,
        type: 'conceptual',
        content: 'Think about what mathematical operation or property might help solve this problem. What patterns do you notice?',
      },
      {
        level: 2,
        type: 'procedural',
        content: 'Try breaking the problem into smaller steps. Start by identifying what you know and what you need to find.',
      },
      {
        level: 3,
        type: 'procedural',
        content: 'Here\'s how to start: First, simplify any expressions or combine like terms. Then, use inverse operations to isolate what you\'re solving for.',
      },
    ]
  } else {
    return [
      {
        level: 1,
        type: 'conceptual',
        content: 'Consider the main idea or theme. What is the question really asking you to identify or explain?',
      },
      {
        level: 2,
        type: 'strategic',
        content: 'Look for context clues in the passage. What evidence supports your answer?',
      },
      {
        level: 3,
        type: 'procedural',
        content: 'Try this approach: Read the question carefully, identify key words, find relevant parts in the text, and formulate your answer using evidence.',
      },
    ]
  }
}

/**
 * Analyze student's attempt and generate contextual feedback
 */
export async function analyzeAttempt(
  problem: string,
  correctSolution: string,
  studentAttempt: string,
  subject: 'math' | 'english'
): Promise<{
  isCorrect: boolean
  feedback: string
  specificError?: string
  suggestedHintLevel: 1 | 2 | 3
}> {
  const prompt = `You are a ${subject} tutor analyzing a student's work.

Problem: ${problem}
Correct solution: ${correctSolution}
Student's attempt: ${studentAttempt}

Analyze the student's attempt and provide:
1. Is it correct? (true/false)
2. Encouraging feedback
3. If incorrect, what specific error was made?
4. What hint level would help? (1=gentle, 2=moderate, 3=detailed)

Return JSON:
{
  "isCorrect": boolean,
  "feedback": "encouraging message",
  "specificError": "description of mistake (if applicable)",
  "suggestedHintLevel": 1 | 2 | 3
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to extract analysis from AI response')
    }

    return JSON.parse(jsonMatch[0])

  } catch (error) {
    console.error('Error analyzing attempt:', error)

    // Fallback response
    return {
      isCorrect: false,
      feedback: 'Good effort! Let\'s work through this together.',
      suggestedHintLevel: 2,
    }
  }
}
