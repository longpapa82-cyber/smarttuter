// Multi-Provider LLM Types
// Abstraction for different LLM providers (Claude, Gemini, OpenAI)

export type LLMProvider = 'claude' | 'gemini' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  priority: number; // Lower number = higher priority
  maxTokens: number;
  available: boolean;
}

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMStreamChunk {
  text: string;
  done: boolean;
}

export interface LLMResponse {
  text: string;
  provider: LLMProvider;
  model: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

export interface LLMError {
  provider: LLMProvider;
  type: 'credit_exhausted' | 'authentication' | 'rate_limit' | 'timeout' | 'unknown';
  message: string;
  retryable: boolean;
}

// Provider-specific configurations
export const PROVIDER_CONFIGS: Record<LLMProvider, { models: string[]; costPerMillion: { input: number; output: number } }> = {
  claude: {
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
    costPerMillion: { input: 3, output: 15 },
  },
  gemini: {
    models: ['gemini-2.5-flash', 'gemini-2.0-flash-001'],
    costPerMillion: { input: 0.15, output: 0.6 },
  },
  openai: {
    models: ['gpt-4o', 'gpt-4-turbo'],
    costPerMillion: { input: 2.5, output: 10 },
  },
};

// Default fallback chain
export const DEFAULT_PROVIDER_CHAIN: LLMProvider[] = ['claude', 'gemini', 'openai'];
