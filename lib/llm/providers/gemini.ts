// Gemini Provider Implementation
// Uses @google/genai SDK for Gemini 2.5 Flash

import { GoogleGenAI } from '@google/genai';
import { ILLMProvider } from './base';
import { LLMMessage, LLMResponse, LLMStreamChunk } from '../types';

export class GeminiProvider implements ILLMProvider {
  readonly name = 'gemini';
  readonly model: string;
  private client: GoogleGenAI | null = null;

  constructor(model: string = 'gemini-2.5-flash') {
    this.model = model;

    // Server-side only initialization
    if (typeof window === 'undefined' && process.env.GEMINI_API_KEY) {
      try {
        this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      } catch (error) {
        console.error('Failed to initialize Gemini client:', error);
        this.client = null;
      }
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.GEMINI_API_KEY;
  }

  async complete(messages: LLMMessage[], maxTokens: number = 2000): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error('Gemini client not initialized');
    }

    try {
      // Convert messages to Gemini format
      const prompt = this.convertMessages(messages);

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const text = response.text || '';

      return {
        text,
        provider: 'gemini',
        model: this.model,
        tokensUsed: {
          input: response.usageMetadata?.promptTokenCount || 0,
          output: response.usageMetadata?.candidatesTokenCount || 0,
        },
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw this.normalizeError(error);
    }
  }

  async *streamComplete(
    messages: LLMMessage[],
    maxTokens: number = 2000
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    if (!this.client) {
      throw new Error('Gemini client not initialized');
    }

    try {
      const prompt = this.convertMessages(messages);

      const response = await this.client.models.generateContentStream({
        model: this.model,
        contents: prompt,
      });

      for await (const chunk of response) {
        const text = chunk.text || '';
        yield { text, done: false };
      }

      yield { text: '', done: true };
    } catch (error: any) {
      console.error('Gemini streaming error:', error);
      throw this.normalizeError(error);
    }
  }

  isCreditExhausted(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    const status = error?.status || 0;

    return (
      status === 429 || // Rate limit (often due to quota)
      status === 402 || // Payment required
      /quota|billing|credit|payment|limit.*exceeded/i.test(message)
    );
  }

  isRetryable(error: any): boolean {
    const status = error?.status || 0;
    const message = error?.message?.toLowerCase() || '';

    // Retryable: temporary errors
    return (
      status === 503 || // Service unavailable
      status === 504 || // Gateway timeout
      /timeout|temporarily.*unavailable|try.*again/i.test(message)
    );
  }

  private convertMessages(messages: LLMMessage[]): string {
    // Gemini uses simple string prompts
    // Combine all messages into a coherent prompt
    return messages
      .map((msg) => {
        if (msg.role === 'system') return `System: ${msg.content}`;
        if (msg.role === 'user') return `User: ${msg.content}`;
        return `Assistant: ${msg.content}`;
      })
      .join('\n\n');
  }

  private normalizeError(error: any): Error {
    const normalized = new Error(error?.message || 'Gemini API error');
    (normalized as any).status = error?.status;
    (normalized as any).provider = 'gemini';
    (normalized as any).originalError = error;
    return normalized;
  }
}
