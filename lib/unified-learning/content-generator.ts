// AI-Powered Content Generator
// Automatically generates quizzes and flashcards based on weaknesses

import Anthropic from '@anthropic-ai/sdk';
import { Weakness } from '../adaptive-learning/types';
import { Subject, GradeLevel, DifficultyLevel } from '../adaptive-learning/types';
import { Quiz, Flashcard } from '../interactive-learning/types';
import { VoiceTutorSession, TutorMessage } from '../voice-tutor/types';

// Server-side only - will be null in browser
const anthropic = typeof window === 'undefined'
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY!,
    })
  : null;

export class AIContentGenerator {
  /**
   * Generate targeted flashcard from weakness
   */
  async generateFlashcardFromWeakness(
    weakness: Weakness,
    subject: Subject,
    gradeLevel: GradeLevel
  ): Promise<Flashcard> {
    const severityNum = weakness.severity === 'critical' ? 5 : weakness.severity === 'moderate' ? 3 : 1;

    const prompt = `You are an educational content creator. Generate a flashcard to help a ${gradeLevel} student master this concept.

Weakness Details:
- Subject: ${subject}
- Knowledge Node: ${weakness.knowledgeNodeId}
- Node Name: ${weakness.nodeName}
- Severity: ${weakness.severity}
- Success Rate: ${(weakness.evidence.successRate * 100).toFixed(1)}%
- Attempts: ${weakness.evidence.attemptCount}

Create a clear, concise flashcard with:
1. Front: A question or concept prompt (keep it simple and direct)
2. Back: A clear explanation with examples appropriate for ${gradeLevel} level

Return ONLY a JSON object in this exact format:
{
  "front": "the question or concept",
  "back": "the explanation with examples"
}`;

    try {
      // Check if running in browser (anthropic will be null)
      if (!anthropic) {
        throw new Error('AI content generation is only available server-side');
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      // Extract JSON from response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const flashcardData = JSON.parse(jsonMatch[0]);

      // Create flashcard object
      const flashcard: Flashcard = {
        id: `flashcard-${Date.now()}-${Math.random()}`,
        front: flashcardData.front,
        back: flashcardData.back,
        subject: subject as 'math' | 'english',
        knowledgeNodeId: weakness.knowledgeNodeId,
        difficulty: severityNum as DifficultyLevel,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        reviewHistory: [],
        masteryScore: 0,
        createdAt: new Date(),
        createdFrom: 'ai_session',
      };

      return flashcard;
    } catch (error) {
      console.error('Failed to generate flashcard:', error);
      throw error;
    }
  }

  /**
   * Generate flashcards from voice session conversation
   */
  async generateFlashcardsFromVoiceSession(
    session: VoiceTutorSession,
    gradeLevel: GradeLevel
  ): Promise<Flashcard[]> {
    // Extract key concepts from conversation
    const conversationText = session.messages
      .filter(m => m.role === 'tutor')
      .map(m => m.content)
      .join('\n\n');

    const prompt = `You are an educational content creator. Analyze this ${session.subject} tutoring conversation and extract 3-5 key concepts that should be memorized as flashcards for a ${gradeLevel} student.

Conversation:
${conversationText}

For each key concept, create a flashcard with:
- Front: A clear question or concept prompt
- Back: A concise explanation

Return ONLY a JSON array in this exact format:
[
  {
    "front": "question or concept",
    "back": "explanation",
    "concept": "concept-id"
  }
]`;

    try {
      if (!anthropic) {
        throw new Error('AI content generation is only available server-side');
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      // Extract JSON from response
      const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const flashcardsData = JSON.parse(jsonMatch[0]);

      // Create flashcard objects
      const flashcards: Flashcard[] = flashcardsData.map((data: any) => ({
        id: `flashcard-voice-${Date.now()}-${Math.random()}`,
        front: data.front,
        back: data.back,
        subject: session.subject as 'math' | 'english',
        knowledgeNodeId: data.concept || `concept-${Date.now()}`,
        difficulty: 2 as DifficultyLevel, // Default medium difficulty
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date(),
        reviewHistory: [],
        masteryScore: 0,
        createdAt: new Date(),
        createdFrom: 'ai_session' as const,
      }));

      return flashcards;
    } catch (error) {
      console.error('Failed to generate flashcards from voice session:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Generate quiz from weakness
   */
  async generateQuizFromWeakness(
    weakness: Weakness,
    subject: Subject,
    gradeLevel: GradeLevel,
    questionCount: number = 5
  ): Promise<Quiz> {
    const severityNum = weakness.severity === 'critical' ? 5 : weakness.severity === 'moderate' ? 3 : 1;

    const prompt = `You are an educational quiz creator. Generate a ${questionCount}-question quiz to help a ${gradeLevel} student practice this weak area.

Weakness Details:
- Subject: ${subject}
- Knowledge Node: ${weakness.knowledgeNodeId}
- Node Name: ${weakness.nodeName}
- Severity: ${weakness.severity}
- Success Rate: ${(weakness.evidence.successRate * 100).toFixed(1)}%
- Student has ${weakness.evidence.attemptCount} attempts with low success rate

Create ${questionCount} multiple choice questions:
- Focus on the fundamental concept
- Start easier to build confidence
- Include clear explanations
- Use ${gradeLevel}-appropriate language

Return ONLY a JSON object in this exact format:
{
  "topic": "descriptive topic name",
  "questions": [
    {
      "id": "unique-id",
      "question": "the question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "why this is correct"
    }
  ]
}`;

    try {
      if (!anthropic) {
        throw new Error('AI content generation is only available server-side');
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      // Extract JSON from response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const quizData = JSON.parse(jsonMatch[0]);

      // Create quiz object
      const quiz: Quiz = {
        id: `quiz-weakness-${Date.now()}`,
        title: quizData.topic || weakness.nodeName || 'Practice Quiz',
        subject,
        difficulty: Math.max(1, severityNum - 1) as DifficultyLevel, // Slightly easier than severity
        questions: quizData.questions.map((q: any) => ({
          id: q.id || `q-${Date.now()}-${Math.random()}`,
          type: 'multiple_choice' as const,
          question: q.question,
          options: q.options,
          correctAnswer: String(q.correctAnswer),
          explanation: q.explanation,
          points: 10,
          bloomLevel: 'understand',
          knowledgeNodeId: weakness.knowledgeNodeId,
        })),
        timeLimit: quizData.questions.length * 90, // 90 seconds per question
        passingScore: 70,
        createdAt: new Date(),
        createdBy: 'ai-system',
        knowledgeNodeIds: [weakness.knowledgeNodeId],
        xpReward: quizData.questions.length * 10,
        bloomLevel: 'understand',
      };

      return quiz;
    } catch (error) {
      console.error('Failed to generate quiz from weakness:', error);
      throw error;
    }
  }

  /**
   * Generate learning note from voice session
   */
  async generateLearningNote(
    session: VoiceTutorSession,
    gradeLevel: GradeLevel
  ): Promise<{
    title: string;
    content: string;
    tags: string[];
  }> {
    const conversationText = session.messages
      .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n\n');

    const prompt = `You are an educational note-taker. Summarize this ${session.subject} tutoring session into clear study notes for a ${gradeLevel} student.

Session (${Math.floor(session.duration / 60)} minutes):
${conversationText}

Create study notes with:
1. Title: Concise topic summary
2. Content: Key concepts, examples, and tips (use markdown formatting)
3. Tags: 3-5 relevant keywords

Return ONLY a JSON object in this exact format:
{
  "title": "session topic",
  "content": "markdown formatted notes",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    try {
      if (!anthropic) {
        throw new Error('AI content generation is only available server-side');
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      // Extract JSON from response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const noteData = JSON.parse(jsonMatch[0]);

      return {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
      };
    } catch (error) {
      console.error('Failed to generate learning note:', error);
      throw error;
    }
  }
}

// Singleton instance
export const aiContentGenerator = new AIContentGenerator();
