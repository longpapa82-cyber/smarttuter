// Base LLM Provider Interface
// All providers must implement this interface

import { LLMMessage, LLMResponse, LLMStreamChunk } from '../types';

export interface ILLMProvider {
  readonly name: string;
  readonly model: string;

  // Check if provider is available and configured
  isAvailable(): boolean;

  // Generate completion (non-streaming)
  complete(messages: LLMMessage[], maxTokens?: number): Promise<LLMResponse>;

  // Generate streaming completion
  streamComplete(
    messages: LLMMessage[],
    maxTokens?: number
  ): AsyncGenerator<LLMStreamChunk, void, unknown>;

  // Detect if error is credit exhaustion
  isCreditExhausted(error: any): boolean;

  // Detect if error is retryable
  isRetryable(error: any): boolean;
}
