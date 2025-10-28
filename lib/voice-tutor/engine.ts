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
    } catch (error: any) {
      console.error('Claude API error:', error);

      // Graceful error handling - detect credit exhaustion
      const errorMessage = error?.message || '';
      const errorType = error?.type || '';
      const errorStatus = error?.status || 0;

      // Credit exhaustion detection
      if (
        /credit|billing|quota|payment|balance/i.test(errorMessage) ||
        errorType === 'invalid_request_error' ||
        errorStatus === 402 ||
        errorStatus === 529
      ) {
        return this.subject === 'english'
          ? `I'm very sorry, but our AI tutoring service is temporarily unavailable due to API credit limitations. 😔\n\nPlease ask your administrator to refill the Claude API credits so we can continue our learning session together.\n\nIn the meantime, you can try our Quiz and Flashcard features on the Dashboard!\n\n죄송합니다. AI 튜터링 서비스를 위한 API 크레딧이 부족합니다. 관리자에게 크레딧 충전을 요청해주세요. 대시보드의 퀴즈와 플래시카드 기능을 이용해보세요!`
          : `죄송합니다. 현재 AI 튜터 서비스의 API 크레딧이 부족하여 일시적으로 이용이 어렵습니다. 😔\n\n관리자에게 Claude API 크레딧 충전을 요청해주세요.\n\n그동안 대시보드에서 퀴즈와 플래시카드 학습을 이용하실 수 있습니다!\n\nI'm sorry, but our AI tutor service is temporarily unavailable due to API credit limitations. Please ask your administrator to refill the credits. Try our Quiz and Flashcards in the meantime!`;
      }

      // Authentication/API key errors
      if (/api.*key|unauthorized|authentication|forbidden/i.test(errorMessage) || errorStatus === 401) {
        return this.subject === 'english'
          ? `I apologize, but there seems to be an API configuration issue. Please contact your administrator to check the API key settings.\n\n죄송합니다. API 설정에 문제가 있습니다. 관리자에게 문의해주세요.`
          : `죄송합니다. API 설정에 문제가 있습니다. 관리자에게 문의해주세요.\n\nI apologize, but there seems to be an API configuration issue. Please contact your administrator.`;
      }

      // Generic fallback
      return this.subject === 'english'
        ? `I apologize, but I encountered a temporary error. Could you please try again? If the problem persists, please contact support.\n\n죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.`
        : `죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.\n\nI apologize, but I encountered a temporary error. Please try again.`;
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
