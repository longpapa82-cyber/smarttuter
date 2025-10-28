// LLM Multi-Provider System - Main Export
// Unified interface for Claude, Gemini, and OpenAI

export { LLMManager, getLLMManager, resetLLMManager, type LLMManagerConfig } from './manager';
export { ClaudeProvider } from './providers/claude';
export { GeminiProvider } from './providers/gemini';
export { OpenAIProvider } from './providers/openai';
export type { ILLMProvider } from './providers/base';
export type {
  LLMProvider,
  LLMConfig,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMError,
} from './types';
export { PROVIDER_CONFIGS, DEFAULT_PROVIDER_CHAIN } from './types';
