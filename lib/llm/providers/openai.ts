// OpenAI Provider Implementation
// Uses OpenAI SDK for GPT-4 models

import OpenAI from 'openai';
import { ILLMProvider } from './base';
import { LLMMessage, LLMResponse, LLMStreamChunk } from '../types';

export class OpenAIProvider implements ILLMProvider {
  readonly name = 'openai';
  readonly model: string;
  private client: OpenAI | null = null;

  constructor(model: string = 'gpt-4o') {
    this.model = model;

    // Server-side only initialization
    if (typeof window === 'undefined' && process.env.OPENAI_API_KEY) {
      try {
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
        this.client = null;
      }
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.OPENAI_API_KEY;
  }

  async complete(messages: LLMMessage[], maxTokens: number = 2000): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const openaiMessages = this.convertMessages(messages);

      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: openaiMessages,
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content || '';

      return {
        text,
        provider: 'openai',
        model: this.model,
        tokensUsed: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
        },
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw this.normalizeError(error);
    }
  }

  async *streamComplete(
    messages: LLMMessage[],
    maxTokens: number = 2000
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const openaiMessages = this.convertMessages(messages);

      const stream = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: openaiMessages,
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield { text: content, done: false };
        }
      }

      yield { text: '', done: true };
    } catch (error: any) {
      console.error('OpenAI streaming error:', error);
      throw this.normalizeError(error);
    }
  }

  isCreditExhausted(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    const code = error?.code || '';
    const status = error?.status || 0;

    return (
      status === 429 ||
      status === 402 ||
      code === 'insufficient_quota' ||
      /quota|billing|credit|payment|limit.*exceeded/i.test(message)
    );
  }

  isRetryable(error: any): boolean {
    const status = error?.status || 0;
    const message = error?.message?.toLowerCase() || '';

    return (
      status === 503 ||
      status === 504 ||
      status === 529 ||
      /timeout|temporarily.*unavailable|try.*again|overloaded/i.test(message)
    );
  }

  private convertMessages(messages: LLMMessage[]): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  private normalizeError(error: any): Error {
    const normalized = new Error(error?.message || 'OpenAI API error');
    (normalized as any).status = error?.status;
    (normalized as any).code = error?.code;
    (normalized as any).provider = 'openai';
    (normalized as any).originalError = error;
    return normalized;
  }
}
