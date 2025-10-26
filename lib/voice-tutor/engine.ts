// Phase 10: Voice Tutor Engine
// Base class for English and Math tutors

import Anthropic from '@anthropic-ai/sdk';
import {
  TutorSubject,
  VoiceTutorSession,
  TutorMessage,
  MessageFeedback,
  TutorPromptContext,
  GradeLevel,
  VOICE_TUTOR_XP,
} from './types';

// Server-side only - will be null in browser
const anthropic = typeof window === 'undefined'
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })
  : null;

export abstract class VoiceTutorEngine {
  protected subject: TutorSubject;
  protected gradeLevel: GradeLevel;
  protected session: VoiceTutorSession;
  protected conversationHistory: TutorMessage[] = [];

  constructor(subject: TutorSubject, gradeLevel: GradeLevel, userId: string) {
    this.subject = subject;
    this.gradeLevel = gradeLevel;
    this.session = this.createSession(userId);
  }

  private createSession(userId: string): VoiceTutorSession {
    return {
      id: `session-${Date.now()}`,
      userId,
      subject: this.subject,
      gradeLevel: this.gradeLevel,
      startTime: new Date(),
      status: 'active',
      duration: 0,
      messages: [],
      speakingTime: 0,
      listeningTime: 0,
      interactionCount: 0,
      xpEarned: VOICE_TUTOR_XP.sessionStart,
      badgesEarned: [],
    };
  }

  // Main conversation method
  async converse(userMessage: string, audioMetadata?: {
    confidence?: number;
    duration?: number;
  }): Promise<{
    response: string;
    feedback?: MessageFeedback;
    xpEarned: number;
  }> {
    // 1. Add user message to history
    const userMsg = this.addMessage('user', userMessage, audioMetadata);

    // 2. Analyze user input (subject-specific)
    const analysis = await this.analyzeInput(userMessage);

    // 3. Generate appropriate response
    const response = await this.generateResponse(analysis, userMessage);

    // 4. Generate feedback
    const feedback = await this.generateFeedback(analysis);

    // 5. Add tutor response to history
    this.addMessage('tutor', response, undefined, feedback);

    // 6. Calculate XP
    const xpEarned = this.calculateXP(feedback);

    // 7. Update session
    this.updateSession(xpEarned);

    return { response, feedback, xpEarned };
  }

  // Abstract methods to be implemented by subject-specific tutors
  protected abstract analyzeInput(message: string): Promise<any>;
  protected abstract generateResponse(analysis: any, userMessage: string): Promise<string>;
  protected abstract generateFeedback(analysis: any): Promise<MessageFeedback | undefined>;

  // Helper: Add message to conversation
  protected addMessage(
    role: 'user' | 'tutor',
    content: string,
    metadata?: { confidence?: number; duration?: number },
    feedback?: MessageFeedback
  ): TutorMessage {
    const message: TutorMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      confidence: metadata?.confidence,
      duration: metadata?.duration,
      feedback,
    };

    this.conversationHistory.push(message);
    this.session.messages.push(message);

    return message;
  }

  // Helper: Call Claude API
  protected async callClaude(prompt: string): Promise<string> {
    try {
      if (!anthropic) {
        throw new Error('Voice tutor is only available server-side');
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      console.error('Claude API error:', error);
      return 'I apologize, but I encountered an error. Could you please repeat that?';
    }
  }

  // Helper: Build context for prompts
  protected buildContext(): TutorPromptContext {
    return {
      subject: this.subject,
      gradeLevel: this.gradeLevel,
      sessionHistory: this.conversationHistory,
      currentTopic: this.session.currentTopic,
    };
  }

  // Helper: Calculate XP rewards
  protected calculateXP(feedback?: MessageFeedback): number {
    let xp = VOICE_TUTOR_XP.messageResponse;

    if (feedback) {
      if (feedback.isPositive) {
        if (feedback.type === 'pronunciation' && (feedback.score || 0) >= 90) {
          xp += VOICE_TUTOR_XP.correctPronunciation;
        }
        if (feedback.type === 'grammar' && (feedback.score || 0) === 100) {
          xp += VOICE_TUTOR_XP.perfectGrammar;
        }
        if (feedback.type === 'concept') {
          xp += VOICE_TUTOR_XP.problemSolved;
        }
      }
    }

    return xp;
  }

  // Helper: Update session stats
  protected updateSession(xpEarned: number): void {
    this.session.interactionCount++;
    this.session.xpEarned += xpEarned;
    this.session.duration = Math.floor(
      (new Date().getTime() - this.session.startTime.getTime()) / 1000
    );
  }

  // Get session summary
  getSession(): VoiceTutorSession {
    return this.session;
  }

  // End session
  endSession(): VoiceTutorSession {
    this.session.status = 'completed';
    this.session.endTime = new Date();

    // Bonus XP for completing session
    this.session.xpEarned += VOICE_TUTOR_XP.sessionComplete;

    // Bonus for long sessions (15+ minutes)
    if (this.session.duration >= 900) {
      this.session.xpEarned += VOICE_TUTOR_XP.longSession;
    }

    return this.session;
  }

  // Pause session
  pauseSession(): void {
    this.session.status = 'paused';
  }

  // Resume session
  resumeSession(): void {
    this.session.status = 'active';
  }

  // Get conversation history
  getHistory(): TutorMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation (for new topic)
  clearHistory(): void {
    this.conversationHistory = [];
    this.session.currentTopic = undefined;
  }
}
