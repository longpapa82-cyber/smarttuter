// LLM Manager - Intelligent Provider Selection and Fallback
// Automatically tries providers in priority order on failure

import { ILLMProvider } from './providers/base';
import { ClaudeProvider } from './providers/claude';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { LLMMessage, LLMResponse, LLMStreamChunk, LLMProvider as LLMProviderType } from './types';

export interface LLMManagerConfig {
  providerChain?: LLMProviderType[];
  enableFallback?: boolean;
  logAttempts?: boolean;
}

export class LLMManager {
  private providers: Map<LLMProviderType, ILLMProvider>;
  private providerChain: LLMProviderType[];
  private enableFallback: boolean;
  private logAttempts: boolean;
  private attemptLog: Array<{ provider: LLMProviderType; success: boolean; error?: string }> = [];

  constructor(config: LLMManagerConfig = {}) {
    this.providerChain = config.providerChain || ['claude', 'gemini', 'openai'];
    this.enableFallback = config.enableFallback !== false; // Default true
    this.logAttempts = config.logAttempts !== false; // Default true

    // Initialize all providers
    this.providers = new Map<LLMProviderType, ILLMProvider>();
    this.providers.set('claude', new ClaudeProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('openai', new OpenAIProvider());
  }

  /**
   * Get list of available providers in priority order
   */
  getAvailableProviders(): LLMProviderType[] {
    return this.providerChain.filter((name) => {
      const provider = this.providers.get(name);
      return provider?.isAvailable();
    });
  }

  /**
   * Complete a prompt with automatic fallback
   */
  async complete(messages: LLMMessage[], maxTokens: number = 2000): Promise<LLMResponse> {
    this.attemptLog = []; // Reset log

    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error(
        'No LLM providers available. Please configure at least one: ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY'
      );
    }

    let lastError: any = null;

    for (const providerName of availableProviders) {
      const provider = this.providers.get(providerName)!;

      try {
        if (this.logAttempts) {
          console.log(`[LLMManager] Attempting provider: ${providerName}`);
        }

        const response = await provider.complete(messages, maxTokens);

        // Success!
        this.attemptLog.push({ provider: providerName, success: true });

        if (this.logAttempts) {
          console.log(
            `[LLMManager] ✅ Success with ${providerName} (${response.tokensUsed?.input || 0} in, ${response.tokensUsed?.output || 0} out)`
          );
        }

        return response;
      } catch (error: any) {
        lastError = error;

        const errorType = provider.isCreditExhausted(error)
          ? 'credit_exhausted'
          : provider.isRetryable(error)
            ? 'retryable'
            : 'unknown';

        this.attemptLog.push({
          provider: providerName,
          success: false,
          error: `${errorType}: ${error.message}`,
        });

        if (this.logAttempts) {
          console.log(`[LLMManager] ❌ Failed with ${providerName}: ${errorType} - ${error.message}`);
        }

        // If credit exhausted or non-retryable, try next provider
        if (provider.isCreditExhausted(error) || !provider.isRetryable(error)) {
          if (this.enableFallback && availableProviders.indexOf(providerName) < availableProviders.length - 1) {
            console.log(`[LLMManager] 🔄 Falling back to next provider...`);
            continue;
          }
        }

        // If retryable error and it's the last provider, throw
        throw error;
      }
    }

    // If we get here, all providers failed
    throw new Error(
      `All LLM providers failed. Last error: ${lastError?.message || 'Unknown error'}. Attempted: ${this.attemptLog.map((a) => a.provider).join(', ')}`
    );
  }

  /**
   * Stream complete with automatic fallback
   */
  async *streamComplete(
    messages: LLMMessage[],
    maxTokens: number = 2000
  ): AsyncGenerator<LLMStreamChunk & { provider?: LLMProviderType }, void, unknown> {
    this.attemptLog = [];

    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error(
        'No LLM providers available. Please configure at least one: ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY'
      );
    }

    let lastError: any = null;

    for (const providerName of availableProviders) {
      const provider = this.providers.get(providerName)!;

      try {
        if (this.logAttempts) {
          console.log(`[LLMManager] Streaming with provider: ${providerName}`);
        }

        for await (const chunk of provider.streamComplete(messages, maxTokens)) {
          yield { ...chunk, provider: providerName };
        }

        // Success!
        this.attemptLog.push({ provider: providerName, success: true });

        if (this.logAttempts) {
          console.log(`[LLMManager] ✅ Streaming success with ${providerName}`);
        }

        return; // Streaming completed successfully
      } catch (error: any) {
        lastError = error;

        const errorType = provider.isCreditExhausted(error)
          ? 'credit_exhausted'
          : provider.isRetryable(error)
            ? 'retryable'
            : 'unknown';

        this.attemptLog.push({
          provider: providerName,
          success: false,
          error: `${errorType}: ${error.message}`,
        });

        if (this.logAttempts) {
          console.log(`[LLMManager] ❌ Streaming failed with ${providerName}: ${errorType}`);
        }

        // Try next provider if credit exhausted
        if (provider.isCreditExhausted(error) || !provider.isRetryable(error)) {
          if (this.enableFallback && availableProviders.indexOf(providerName) < availableProviders.length - 1) {
            console.log(`[LLMManager] 🔄 Falling back to next provider for streaming...`);
            continue;
          }
        }

        throw error;
      }
    }

    throw new Error(
      `All LLM providers failed for streaming. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Get attempt log for debugging
   */
  getAttemptLog() {
    return this.attemptLog;
  }

  /**
   * Force a specific provider (disable fallback)
   */
  async completeWithProvider(
    providerName: LLMProviderType,
    messages: LLMMessage[],
    maxTokens: number = 2000
  ): Promise<LLMResponse> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`Provider ${providerName} is not available. Check API key configuration.`);
    }

    return provider.complete(messages, maxTokens);
  }

  /**
   * Get provider status for monitoring
   */
  getProviderStatus(): Record<LLMProviderType, { available: boolean; model: string; priority: number }> {
    const status: any = {};

    this.providerChain.forEach((name, index) => {
      const provider = this.providers.get(name);
      status[name] = {
        available: provider?.isAvailable() || false,
        model: provider?.model || 'N/A',
        priority: index + 1,
      };
    });

    return status;
  }
}

// Singleton instance
let globalManager: LLMManager | null = null;

export function getLLMManager(config?: LLMManagerConfig): LLMManager {
  if (!globalManager) {
    globalManager = new LLMManager(config);
  }
  return globalManager;
}

export function resetLLMManager() {
  globalManager = null;
}
