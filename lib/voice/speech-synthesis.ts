/**
 * Speech Synthesis Utilities
 * Text-to-Speech (TTS) wrapper for Web Speech API
 *
 * Features:
 * - Natural-sounding text-to-speech
 * - Multi-language voice selection
 * - Speed, pitch, and volume control
 * - Queue management for multiple utterances
 * - Pause/resume/cancel functionality
 *
 * Browser Support: All modern browsers (Chrome, Firefox, Safari, Edge)
 */

// Check if browser supports Speech Synthesis
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Get speechSynthesis instance
export function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  return window.speechSynthesis || null
}

export interface SpeechSynthesisConfig {
  lang?: string                  // 'ko-KR' | 'en-US' | etc.
  voice?: SpeechSynthesisVoice   // Specific voice
  rate?: number                  // Speed: 0.5 - 2.0 (1.0 = normal)
  pitch?: number                 // Pitch: 0.5 - 2.0 (1.0 = normal)
  volume?: number                // Volume: 0.0 - 1.0
}

/**
 * Get all available voices
 * Note: voices may load asynchronously, so this should be called after 'voiceschanged' event
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  const synthesis = getSpeechSynthesis()
  if (!synthesis) return []

  return synthesis.getVoices()
}

/**
 * Get voices for a specific language
 */
export function getVoicesForLanguage(lang: string): SpeechSynthesisVoice[] {
  const allVoices = getAvailableVoices()
  return allVoices.filter(voice => voice.lang.startsWith(lang.split('-')[0]))
}

/**
 * Get recommended voice for language
 * Prioritizes: local > female > default
 */
export function getRecommendedVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = getVoicesForLanguage(lang)

  if (voices.length === 0) return null

  // Prefer local voices (better quality, no network needed)
  const localVoices = voices.filter(v => v.localService)

  // Prefer female voices for educational content (research shows better clarity)
  const femaleVoices = (localVoices.length > 0 ? localVoices : voices).filter(v =>
    v.name.toLowerCase().includes('female') ||
    v.name.toLowerCase().includes('samantha') ||
    v.name.toLowerCase().includes('karen') ||
    v.name.toLowerCase().includes('victoria')
  )

  // Return first female voice, or first local voice, or first voice
  return femaleVoices[0] || localVoices[0] || voices[0]
}

/**
 * Create a speech utterance with configuration
 */
export function createUtterance(
  text: string,
  config: SpeechSynthesisConfig = {}
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)

  // Apply configuration
  utterance.lang = config.lang || 'en-US'
  utterance.rate = config.rate ?? 1.0
  utterance.pitch = config.pitch ?? 1.0
  utterance.volume = config.volume ?? 1.0

  // Set voice if specified
  if (config.voice) {
    utterance.voice = config.voice
  } else {
    // Auto-select recommended voice for language
    const recommendedVoice = getRecommendedVoice(utterance.lang)
    if (recommendedVoice) {
      utterance.voice = recommendedVoice
    }
  }

  return utterance
}

/**
 * Speak text with optional configuration
 */
export function speak(
  text: string,
  config: SpeechSynthesisConfig = {},
  callbacks?: {
    onStart?: () => void
    onEnd?: () => void
    onError?: (event: SpeechSynthesisErrorEvent) => void
    onPause?: () => void
    onResume?: () => void
  }
): SpeechSynthesisUtterance | null {
  const synthesis = getSpeechSynthesis()
  if (!synthesis) {
    console.warn('Speech synthesis not supported')
    return null
  }

  // Create utterance
  const utterance = createUtterance(text, config)

  // Attach callbacks
  if (callbacks?.onStart) utterance.onstart = callbacks.onStart
  if (callbacks?.onEnd) utterance.onend = callbacks.onEnd
  if (callbacks?.onError) utterance.onerror = callbacks.onError
  if (callbacks?.onPause) utterance.onpause = callbacks.onPause
  if (callbacks?.onResume) utterance.onresume = callbacks.onResume

  // Speak
  synthesis.speak(utterance)

  return utterance
}

/**
 * Pause speech synthesis
 */
export function pause(): void {
  const synthesis = getSpeechSynthesis()
  if (synthesis && synthesis.speaking && !synthesis.paused) {
    synthesis.pause()
  }
}

/**
 * Resume speech synthesis
 */
export function resume(): void {
  const synthesis = getSpeechSynthesis()
  if (synthesis && synthesis.paused) {
    synthesis.resume()
  }
}

/**
 * Cancel all speech synthesis
 */
export function cancel(): void {
  const synthesis = getSpeechSynthesis()
  if (synthesis) {
    synthesis.cancel()
  }
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  const synthesis = getSpeechSynthesis()
  return synthesis ? synthesis.speaking : false
}

/**
 * Check if currently paused
 */
export function isPaused(): boolean {
  const synthesis = getSpeechSynthesis()
  return synthesis ? synthesis.paused : false
}

/**
 * Get language-specific voice settings
 * Optimized for educational content
 */
export function getLanguageVoiceSettings(lang: string): Partial<SpeechSynthesisConfig> {
  const settings: Record<string, Partial<SpeechSynthesisConfig>> = {
    // English: Clear, slightly slower for comprehension
    'en-US': {
      rate: 0.9,
      pitch: 1.1,
      volume: 0.9,
    },
    'en-GB': {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.9,
    },

    // Korean: Natural pace, warm tone
    'ko-KR': {
      rate: 1.0,
      pitch: 1.2,
      volume: 0.9,
    },

    // Japanese: Slightly slower, clear enunciation
    'ja-JP': {
      rate: 0.95,
      pitch: 1.15,
      volume: 0.9,
    },

    // Chinese: Clear, moderate pace
    'zh-CN': {
      rate: 0.95,
      pitch: 1.1,
      volume: 0.9,
    },
  }

  const langPrefix = lang.split('-')[0]

  // Return exact match or prefix match or defaults
  return settings[lang] || settings[`${langPrefix}-*`] || {
    rate: 1.0,
    pitch: 1.0,
    volume: 0.9,
  }
}

/**
 * Split long text into chunks for better synthesis
 * Prevents browser timeout on very long text
 */
export function splitTextIntoChunks(text: string, maxLength: number = 200): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())

  return chunks
}

/**
 * Speak long text with automatic chunking
 */
export async function speakLongText(
  text: string,
  config: SpeechSynthesisConfig = {},
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const chunks = splitTextIntoChunks(text)

  for (let i = 0; i < chunks.length; i++) {
    await new Promise<void>((resolve, reject) => {
      speak(chunks[i], config, {
        onEnd: () => {
          onProgress?.(i + 1, chunks.length)
          resolve()
        },
        onError: (event) => {
          console.error('Speech synthesis error:', event)
          reject(event)
        },
      })
    })
  }
}

/**
 * Get estimated speech duration in milliseconds
 * Approximate calculation based on character count and rate
 */
export function estimateSpeechDuration(
  text: string,
  rate: number = 1.0
): number {
  // Average speaking rate: ~150 words per minute = 2.5 words per second
  // Average word length: ~5 characters
  // So: ~12.5 characters per second at normal rate

  const charactersPerSecond = 12.5 * rate
  const durationSeconds = text.length / charactersPerSecond

  return Math.ceil(durationSeconds * 1000)
}
