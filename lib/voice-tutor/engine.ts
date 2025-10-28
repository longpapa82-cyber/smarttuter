// Phase 10: Voice Tutor Engine
// Base class for English and Math tutors
// Now supports multi-provider LLM system with automatic fallback

import { getLLMManager, type LLMMessage } from '@/lib/llm';
import {
  TutorSubject,
  VoiceTutorSession,
  TutorMessage,
  MessageFeedback,
  TutorPromptContext,
  GradeLevel,
  VOICE_TUTOR_XP,
} from './types';

// Multi-provider LLM manager (server-side only)
const llmManager = typeof window === 'undefined' ? getLLMManager() : null;

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

  // Helper: Call LLM API with automatic provider fallback
  protected async callClaude(prompt: string): Promise<string> {
    try {
      if (!llmManager) {
        throw new Error('Voice tutor is only available server-side');
      }

      // Convert to LLM message format
      const messages: LLMMessage[] = [
        {
          role: 'user',
          content: prompt,
        },
      ];

      // Use multi-provider system with automatic fallback
      const response = await llmManager.complete(messages, 2000);

      // Log which provider was used for monitoring
      console.log(`[VoiceTutor] Response from ${response.provider} (${response.model})`);

      return response.text;
    } catch (error: any) {
      console.error('LLM API error:', error);

      // Check attempt log to see what happened
      const attemptLog = llmManager?.getAttemptLog() || [];
      const allProvidersExhausted = attemptLog.every((attempt) => !attempt.success);

      // Graceful error handling with context about which providers were tried
      const errorMessage = error?.message || '';

      // If all providers exhausted or credit issues
      if (allProvidersExhausted || /credit|billing|quota|payment|balance|no.*provider/i.test(errorMessage)) {
        const providersAttempted = attemptLog.map((a) => a.provider).join(', ') || 'Claude';

        return this.subject === 'english'
          ? `I'm very sorry, but our AI tutoring service is temporarily unavailable. 😔\n\nWe tried multiple providers (${providersAttempted}) but encountered limitations.\n\nPlease ask your administrator to:\n• Refill API credits (Claude, Gemini, or OpenAI)\n• Configure at least one working API key\n\nIn the meantime, you can try our Quiz and Flashcard features on the Dashboard!\n\n죄송합니다. AI 튜터링 서비스가 일시적으로 이용 불가능합니다. 관리자에게 API 크레딧 충전 또는 API 키 설정을 요청해주세요. 대시보드의 퀴즈와 플래시카드를 이용해보세요!`
          : `죄송합니다. AI 튜터 서비스가 일시적으로 이용 불가능합니다. 😔\n\n여러 공급자(${providersAttempted})를 시도했지만 제한이 발생했습니다.\n\n관리자에게 다음을 요청해주세요:\n• API 크레딧 충전 (Claude, Gemini, 또는 OpenAI)\n• 최소 하나의 작동하는 API 키 설정\n\n그동안 대시보드에서 퀴즈와 플래시카드를 이용하실 수 있습니다!\n\nI'm sorry, but our AI tutor service is temporarily unavailable. Please ask your administrator to refill credits or configure API keys. Try our Quiz and Flashcards in the meantime!`;
      }

      // Configuration errors
      if (/api.*key|unauthorized|authentication|configuration/i.test(errorMessage)) {
        return this.subject === 'english'
          ? `I apologize, but there seems to be an API configuration issue. Please contact your administrator to configure at least one LLM provider (Claude, Gemini, or OpenAI).\n\n죄송합니다. API 설정에 문제가 있습니다. 관리자에게 문의해주세요.`
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
