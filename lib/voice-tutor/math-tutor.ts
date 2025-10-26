// Phase 10: Math Voice Tutor
// Socratic method, problem-solving guidance, concept explanation

import { VoiceTutorEngine } from './engine';
import {
  GradeLevel,
  MessageFeedback,
  MathAnalysis,
  MathProblem,
  MathProblemAttempt,
  CONVERSATION_STARTERS,
  VOICE_TUTOR_XP,
} from './types';

export class MathVoiceTutor extends VoiceTutorEngine {
  private currentProblem: MathProblem | null = null;
  private hintsUsed: number = 0;
  private problemAttempts: MathProblemAttempt[] = [];
  private startTime: number = 0;

  constructor(gradeLevel: GradeLevel, userId: string) {
    super('math', gradeLevel, userId);
  }

  // Start conversation with math greeting
  async startConversation(): Promise<string> {
    const starters = CONVERSATION_STARTERS.math[this.gradeLevel];
    const starter = starters[Math.floor(Math.random() * starters.length)];

    return `Hi! I'm your math tutor. ${starter} I'll guide you step-by-step using questions, so you can discover the solution yourself!`;
  }

  // Generate a math problem
  async generateProblem(topic?: string): Promise<MathProblem> {
    const topicContext = topic ? `Topic: ${topic}` : 'Choose an appropriate topic';

    const prompt = `
Generate a math problem for a ${this.gradeLevel} student.
${topicContext}

Requirements:
1. Appropriate difficulty for ${this.gradeLevel} level
2. Clear, well-worded question
3. Provide 3 progressive hints (each builds on the previous)
4. Step-by-step solution
5. Clear explanation of concepts

Use Socratic method in hints - ask guiding questions rather than giving answers.

Return ONLY valid JSON:
{
  "question": "word problem or equation",
  "difficulty": 3,
  "topic": "algebra",
  "category": "equations",
  "hints": [
    "What information do we know?",
    "What operation should we use first?",
    "How can we isolate the variable?"
  ],
  "solution": "x = 5",
  "steps": [
    "Start with the equation: 2x + 3 = 13",
    "Subtract 3 from both sides: 2x = 10",
    "Divide both sides by 2: x = 5"
  ],
  "explanation": "We used inverse operations to isolate the variable..."
}
`;

    const response = await this.callClaude(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      const problem: MathProblem = {
        ...JSON.parse(jsonMatch[0]),
        id: `problem-${Date.now()}`,
        createdAt: new Date(),
      };

      this.currentProblem = problem;
      this.hintsUsed = 0;
      this.startTime = Date.now();
      this.session.currentProblem = problem.question;

      return problem;
    } catch (error) {
      console.error('Failed to parse math problem:', error);
      // Return fallback problem
      return this.getFallbackProblem();
    }
  }

  private getFallbackProblem(): MathProblem {
    return {
      id: `problem-${Date.now()}`,
      question: 'What is 7 + 5?',
      difficulty: 1,
      topic: 'addition',
      category: 'arithmetic',
      hints: [
        'Try counting up from 7',
        'Use your fingers if it helps',
        'The answer is between 10 and 15',
      ],
      solution: '12',
      steps: ['Start with 7', 'Add 5', 'Result is 12'],
      explanation: 'When we add 7 and 5, we get 12.',
      createdAt: new Date(),
    };
  }

  // Analyze student's math response
  protected async analyzeInput(message: string): Promise<MathAnalysis> {
    if (!this.currentProblem) {
      // No active problem, generate one
      return {
        isCorrect: false,
        understanding: 'none',
        conceptGrasped: false,
        misconceptions: [],
        nextHint: 'Let me give you a problem first!',
        encouragement: '',
      };
    }

    const prompt = `
You are a math tutor using the Socratic method.

Problem: ${this.currentProblem.question}
Correct solution: ${this.currentProblem.solution}
Student answer: "${message}"
Hints already given: ${this.hintsUsed}/${this.currentProblem.hints.length}

Analyze:
1. Is the student's answer correct?
2. Level of understanding (none/partial/full)
3. Has the student grasped the concept?
4. Any misconceptions shown
5. What guidance to give next (as a QUESTION, not an answer)
6. Encouraging feedback

Important: Guide with questions, don't give the answer directly.

Return ONLY valid JSON:
{
  "isCorrect": false,
  "understanding": "partial",
  "conceptGrasped": false,
  "misconceptions": ["tried to add instead of multiply"],
  "nextHint": "What operation connects these numbers?",
  "encouragement": "You're on the right track!",
  "suggestedApproach": "Try breaking the problem into steps"
}
`;

    const response = await this.callClaude(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse math analysis:', error);
      return {
        isCorrect: false,
        understanding: 'partial',
        conceptGrasped: false,
        misconceptions: [],
        nextHint: 'Can you try again?',
        encouragement: 'Keep trying!',
      };
    }
  }

  // Generate response using Socratic method
  protected async generateResponse(
    analysis: MathAnalysis,
    userMessage: string
  ): Promise<string> {
    if (analysis.isCorrect) {
      // Success!
      const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
      this.recordAttempt(userMessage, true, timeSpent, analysis.understanding);

      // Update session stats
      this.session.problemsSolved = (this.session.problemsSolved || 0) + 1;
      this.session.hintsGiven = (this.session.hintsGiven || 0) + this.hintsUsed;

      return `🎉 Excellent! ${analysis.encouragement} ${
        this.hintsUsed === 0
          ? "And you solved it without any hints - amazing!"
          : ''
      } Would you like to try another problem?`;
    }

    // Not correct - guide with Socratic questions
    let response = analysis.encouragement;

    if (analysis.understanding === 'none') {
      response += ` ${analysis.nextHint}`;
    } else if (analysis.understanding === 'partial') {
      response += ` You're getting closer! ${analysis.nextHint}`;
    }

    if (analysis.misconceptions.length > 0) {
      response += ` Be careful: ${analysis.misconceptions[0]}`;
    }

    if (analysis.suggestedApproach) {
      response += ` Hint: ${analysis.suggestedApproach}`;
    }

    return response;
  }

  // Generate feedback
  protected async generateFeedback(
    analysis: MathAnalysis
  ): Promise<MessageFeedback | undefined> {
    return {
      type: 'concept',
      score: analysis.isCorrect ? 100 : analysis.understanding === 'partial' ? 60 : 30,
      suggestions: analysis.misconceptions.length > 0
        ? [`Watch out for: ${analysis.misconceptions[0]}`]
        : undefined,
      corrections: !analysis.isCorrect ? analysis.nextHint : undefined,
      isPositive: analysis.isCorrect || analysis.understanding !== 'none',
    };
  }

  // Give a hint (called explicitly by user)
  async giveHint(): Promise<string> {
    if (!this.currentProblem) {
      return "Let me give you a problem first!";
    }

    if (this.hintsUsed >= this.currentProblem.hints.length) {
      // All hints used - show first step of solution
      return `You've used all hints. Here's the first step: ${this.currentProblem.steps[0]}. Can you continue from here?`;
    }

    const hint = this.currentProblem.hints[this.hintsUsed];
    this.hintsUsed++;
    this.session.hintsGiven = (this.session.hintsGiven || 0) + 1;

    return `💡 Hint ${this.hintsUsed}/${this.currentProblem.hints.length}: ${hint}`;
  }

  // Show solution (when student gives up)
  async showSolution(): Promise<string> {
    if (!this.currentProblem) {
      return "There's no active problem.";
    }

    const { solution, steps, explanation } = this.currentProblem;

    let response = `The solution is: **${solution}**\n\n`;
    response += `Here's how to solve it:\n`;
    steps.forEach((step, i) => {
      response += `${i + 1}. ${step}\n`;
    });
    response += `\n${explanation}`;

    // Record as failed attempt
    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    this.recordAttempt('gave up', false, timeSpent, 'none');

    return response;
  }

  // Record problem attempt
  private recordAttempt(
    answer: string,
    isCorrect: boolean,
    timeSpent: number,
    understanding: 'none' | 'partial' | 'full'
  ): void {
    if (!this.currentProblem) return;

    const attempt: MathProblemAttempt = {
      problemId: this.currentProblem.id,
      studentAnswer: answer,
      isCorrect,
      hintsUsed: this.hintsUsed,
      timeSpent,
      understanding,
      misconceptions: [],
      timestamp: new Date(),
    };

    this.problemAttempts.push(attempt);
  }

  // Get current problem
  getCurrentProblem(): MathProblem | null {
    return this.currentProblem;
  }

  // Get problem attempts
  getProblemAttempts(): MathProblemAttempt[] {
    return this.problemAttempts;
  }

  // Calculate XP (override to include problem-specific XP)
  protected calculateXP(feedback?: MessageFeedback): number {
    let xp = super.calculateXP(feedback);

    if (feedback?.type === 'concept' && feedback.isPositive) {
      if (feedback.score === 100) {
        // Solved correctly
        if (this.hintsUsed === 0) {
          xp += VOICE_TUTOR_XP.problemSolvedWithoutHints;
        } else {
          xp += VOICE_TUTOR_XP.problemSolved;
        }
      }
    }

    return xp;
  }

  // Explain a concept
  async explainConcept(concept: string): Promise<string> {
    const prompt = `
You are a patient math tutor explaining a concept to a ${this.gradeLevel} student.

Concept: ${concept}

Explain:
1. What it is (simple definition)
2. Why it's useful
3. A simple example
4. A real-world application

Use age-appropriate language and be encouraging.
Keep it concise (3-4 sentences).
`;

    const response = await this.callClaude(prompt);
    return response.trim();
  }
}
