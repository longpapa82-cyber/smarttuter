// Claude Provider Implementation
// Wraps existing Anthropic SDK for consistency

import Anthropic from '@anthropic-ai/sdk';
import { ILLMProvider } from './base';
import { LLMMessage, LLMResponse, LLMStreamChunk } from '../types';

export class ClaudeProvider implements ILLMProvider {
  readonly name = 'claude';
  readonly model: string;
  private client: Anthropic | null = null;

  constructor(model: string = 'claude-sonnet-4-20250514') {
    this.model = model;

    // Server-side only initialization
    if (typeof window === 'undefined' && process.env.ANTHROPIC_API_KEY) {
      try {
        this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      } catch (error) {
        console.error('Failed to initialize Claude client:', error);
        this.client = null;
      }
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!process.env.ANTHROPIC_API_KEY;
  }

  async complete(messages: LLMMessage[], maxTokens: number = 2000): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error('Claude client not initialized');
    }

    try {
      const anthropicMessages = this.convertMessages(messages);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: anthropicMessages,
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        text,
        provider: 'claude',
        model: this.model,
        tokensUsed: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      console.error('Claude API error:', error);
      throw this.normalizeError(error);
    }
  }

  async *streamComplete(
    messages: LLMMessage[],
    maxTokens: number = 2000
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    if (!this.client) {
      throw new Error('Claude client not initialized');
    }

    try {
      const anthropicMessages = this.convertMessages(messages);

      const stream = await this.client.messages.stream({
        model: this.model,
        max_tokens: maxTokens,
        messages: anthropicMessages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield { text: event.delta.text, done: false };
        }
      }

      yield { text: '', done: true };
    } catch (error: any) {
      console.error('Claude streaming error:', error);
      throw this.normalizeError(error);
    }
  }

  isCreditExhausted(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    const errorType = error?.type || '';
    const status = error?.status || 0;

    return (
      status === 402 ||
      status === 529 ||
      errorType === 'invalid_request_error' ||
      /credit|billing|quota|payment|balance.*low/i.test(message)
    );
  }

  isRetryable(error: any): boolean {
    const status = error?.status || 0;
    const message = error?.message?.toLowerCase() || '';

    return (
      status === 503 ||
      status === 504 ||
      status === 529 || // Overloaded
      /timeout|temporarily.*unavailable|overloaded|try.*again/i.test(message)
    );
  }

  private convertMessages(messages: LLMMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    // Claude doesn't support system messages in the messages array
    // Filter out system messages (should be handled separately if needed)
    return messages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  private normalizeError(error: any): Error {
    const normalized = new Error(error?.message || 'Claude API error');
    (normalized as any).status = error?.status;
    (normalized as any).type = error?.type;
    (normalized as any).provider = 'claude';
    (normalized as any).originalError = error;
    return normalized;
  }
}
