// Phase 9: AI Quiz Generation
// Bloom's Taxonomy based difficulty adjustment

import Anthropic from '@anthropic-ai/sdk';
import {
  Quiz,
  QuizQuestion,
  QuizGenerationRequest,
  DIFFICULTY_BLOOM_MAP,
  BLOOM_LEVELS,
  QUIZ_XP_REWARDS,
} from './types';
import { getNodeById } from '../adaptive-learning/knowledge-graph';

// Server-side only - will be null in browser
const anthropic = typeof window === 'undefined'
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })
  : null;

export class QuizGenerator {
  /**
   * Generate quiz using Claude AI
   */
  static async generateQuiz(request: QuizGenerationRequest): Promise<Quiz> {
    const {
      subject,
      gradeLevel,
      difficulty,
      knowledgeNodeId,
      questionCount = 5,
      questionTypes = ['multiple_choice', 'short_answer', 'true_false'],
      timeLimit,
    } = request;

    // Get knowledge node info if specified
    let topicContext = '';
    let knowledgeNodeIds: string[] = [];

    if (knowledgeNodeId) {
      const node = getNodeById(knowledgeNodeId);
      if (node) {
        topicContext = `주제: ${node.name}\n카테고리: ${node.category}\n`;
        knowledgeNodeIds = [knowledgeNodeId];
      }
    }

    // Get Bloom's Taxonomy levels for this difficulty
    const bloomLevels = DIFFICULTY_BLOOM_MAP[difficulty];
    const bloomDescriptions = bloomLevels.map(level => BLOOM_LEVELS[level as keyof typeof BLOOM_LEVELS]).join(', ');

    // Generate quiz using Claude
    const prompt = this.buildQuizPrompt(
      subject,
      gradeLevel,
      difficulty,
      questionCount,
      questionTypes,
      bloomDescriptions,
      topicContext
    );

    try {
      if (!anthropic) {
        throw new Error('Quiz generation is only available server-side');
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Parse AI response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const questions = this.parseQuizResponse(content.text, knowledgeNodeId);

      // Create quiz object
      const quiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: topicContext
          ? `${getNodeById(knowledgeNodeId!)?.name} 퀴즈`
          : `${subject === 'math' ? '수학' : '영어'} 퀴즈`,
        subject,
        difficulty,
        questions,
        timeLimit,
        passingScore: 70,
        createdAt: new Date(),
        createdBy: 'ai',
        knowledgeNodeIds,
        xpReward: QUIZ_XP_REWARDS.completion + (difficulty * 10),
        bloomLevel: bloomDescriptions,
      };

      return quiz;
    } catch (error) {
      console.error('Quiz generation failed:', error);
      // Return fallback quiz
      return this.createFallbackQuiz(request);
    }
  }

  /**
   * Build quiz generation prompt
   */
  private static buildQuizPrompt(
    subject: string,
    gradeLevel: string,
    difficulty: number,
    questionCount: number,
    questionTypes: string[],
    bloomLevels: string,
    topicContext: string
  ): string {
    const subjectKorean = subject === 'math' ? '수학' : '영어';
    const gradeLevelKorean = {
      elementary: '초등학교',
      middle: '중학교',
      high: '고등학교',
      university: '대학교',
    }[gradeLevel] || '중학교';

    return `
다음 조건에 맞는 퀴즈 ${questionCount}문제를 생성해주세요.

**조건**:
- 과목: ${subjectKorean}
- 학교급: ${gradeLevelKorean}
- 난이도: ${difficulty}/5
- Bloom's Taxonomy 수준: ${bloomLevels}
${topicContext}

**문제 유형 분포** (${questionCount}문제):
- 객관식 (multiple_choice): ${Math.ceil(questionCount * 0.6)}문제
- 단답형 (short_answer): ${Math.floor(questionCount * 0.2)}문제
- 참/거짓 (true_false): ${Math.floor(questionCount * 0.2)}문제

**출력 형식** (JSON):
\`\`\`json
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "문제 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": "정답",
      "explanation": "정답 해설",
      "points": 20
    },
    {
      "type": "short_answer",
      "question": "문제 내용",
      "correctAnswer": "정답",
      "explanation": "정답 해설",
      "points": 20
    },
    {
      "type": "true_false",
      "question": "문제 내용",
      "options": ["참", "거짓"],
      "correctAnswer": "참" 또는 "거짓",
      "explanation": "정답 해설",
      "points": 20
    }
  ]
}
\`\`\`

**중요**:
- 학생 수준에 적합한 문제 출제
- 명확하고 정확한 정답
- 자세한 해설 (왜 정답인지, 오답은 왜 틀렸는지)
- 객관식은 매력적인 오답 포함
- JSON 형식 엄수
`;
  }

  /**
   * Parse AI response to quiz questions
   */
  private static parseQuizResponse(
    response: string,
    knowledgeNodeId?: string
  ): QuizQuestion[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[1]);
      const questions: QuizQuestion[] = parsed.questions.map(
        (q: any, index: number) => ({
          id: `q-${Date.now()}-${index}`,
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points || 20,
          knowledgeNodeId,
        })
      );

      return questions;
    } catch (error) {
      console.error('Failed to parse quiz response:', error);
      return [];
    }
  }

  /**
   * Create fallback quiz when AI fails
   */
  private static createFallbackQuiz(request: QuizGenerationRequest): Quiz {
    const questions: QuizQuestion[] = [
      {
        id: 'q-fallback-1',
        type: 'multiple_choice',
        question: '이 문제는 임시 문제입니다. AI 생성에 실패했습니다.',
        options: ['선택지 1', '선택지 2', '선택지 3', '선택지 4'],
        correctAnswer: '선택지 1',
        explanation: 'AI 퀴즈 생성 기능이 일시적으로 사용 불가능합니다.',
        points: 20,
      },
    ];

    return {
      id: `quiz-fallback-${Date.now()}`,
      title: 'Fallback Quiz',
      subject: request.subject,
      difficulty: request.difficulty,
      questions,
      timeLimit: request.timeLimit,
      passingScore: 70,
      createdAt: new Date(),
      createdBy: 'system',
      knowledgeNodeIds: request.knowledgeNodeId ? [request.knowledgeNodeId] : [],
      xpReward: 50,
      bloomLevel: BLOOM_LEVELS[request.difficulty],
    };
  }
}
