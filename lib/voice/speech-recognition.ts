/**
 * Speech Recognition Utilities
 * Web Speech API wrapper with React hooks support
 *
 * Features:
 * - Real-time speech-to-text
 * - Multi-language support (Korean/English)
 * - Continuous listening mode
 * - Interim results display
 * - Error handling and recovery
 *
 * Browser Support: Chrome, Edge (Chromium), Safari (partial)
 */

// Check if browser supports Web Speech API
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window
  )
}

// Get SpeechRecognition constructor (with webkit prefix fallback)
export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null

  return ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) || null
}

export interface SpeechRecognitionConfig {
  language?: string              // 'ko-KR' | 'en-US' | 'ja-JP' etc.
  continuous?: boolean           // Continue listening after result
  interimResults?: boolean       // Return interim results
  maxAlternatives?: number       // Number of alternative results
}

export interface SpeechRecognitionResult {
  transcript: string             // Final recognized text
  interimTranscript: string      // Partial text (while speaking)
  confidence: number             // Confidence score (0-1)
  isFinal: boolean              // Is this the final result?
}

export interface SpeechRecognitionError {
  error: string                  // Error type
  message: string                // Human-readable message
}

/**
 * Create and configure a SpeechRecognition instance
 */
export function createSpeechRecognition(
  config: SpeechRecognitionConfig = {}
): any {
  const SpeechRecognitionConstructor = getSpeechRecognition()

  if (!SpeechRecognitionConstructor) {
    console.warn('Speech recognition not supported in this browser')
    return null
  }

  const recognition = new SpeechRecognitionConstructor()

  // Configure recognition
  recognition.lang = config.language || 'en-US'
  recognition.continuous = config.continuous ?? false
  recognition.interimResults = config.interimResults ?? true
  recognition.maxAlternatives = config.maxAlternatives || 1

  return recognition
}

/**
 * Request microphone permission
 * Returns true if permission granted, false otherwise
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Stop all tracks (we just needed to check permission)
    stream.getTracks().forEach(track => track.stop())

    return true
  } catch (error) {
    console.error('Microphone permission denied:', error)
    return false
  }
}

/**
 * Check if microphone permission is granted
 */
export async function checkMicrophonePermission(): Promise<PermissionState> {
  try {
    if (!navigator.permissions) {
      // Fallback for browsers without Permissions API
      return 'prompt'
    }

    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return result.state
  } catch (error) {
    console.error('Error checking microphone permission:', error)
    return 'prompt'
  }
}

/**
 * Get human-readable error message from SpeechRecognitionErrorEvent
 */
export function getSpeechRecognitionErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'no-speech': 'No speech detected. Please try again.',
    'aborted': 'Speech recognition was aborted.',
    'audio-capture': 'No microphone found or microphone access denied.',
    'network': 'Network error occurred. Check your internet connection.',
    'not-allowed': 'Microphone access was denied. Please allow microphone access.',
    'service-not-allowed': 'Speech recognition service is not allowed.',
    'bad-grammar': 'Grammar error in speech recognition.',
    'language-not-supported': 'Language is not supported.',
  }

  return errorMessages[error] || `Speech recognition error: ${error}`
}

/**
 * Parse SpeechRecognitionEvent results
 */
export function parseSpeechRecognitionResults(
  event: SpeechRecognitionEvent
): SpeechRecognitionResult {
  let finalTranscript = ''
  let interimTranscript = ''
  let confidence = 0

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i]
    const transcript = result[0].transcript

    if (result.isFinal) {
      finalTranscript += transcript + ' '
      confidence = result[0].confidence
    } else {
      interimTranscript += transcript
    }
  }

  return {
    transcript: finalTranscript.trim(),
    interimTranscript: interimTranscript.trim(),
    confidence,
    isFinal: event.results[event.results.length - 1]?.isFinal || false,
  }
}

/**
 * Get available speech recognition languages
 */
export function getAvailableLanguages(): { code: string; name: string }[] {
  return [
    { code: 'ko-KR', name: 'Korean' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
  ]
}

/**
 * Detect language from text (simple heuristic)
 * Returns language code that should be used for speech recognition
 */
export function detectLanguage(text: string): string {
  // Korean characters (Hangul)
  const koreanRegex = /[\u3131-\u318E\uAC00-\uD7A3]/

  // Japanese characters (Hiragana, Katakana, Kanji)
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/

  // Chinese characters
  const chineseRegex = /[\u4E00-\u9FFF]/

  if (koreanRegex.test(text)) return 'ko-KR'
  if (japaneseRegex.test(text)) return 'ja-JP'
  if (chineseRegex.test(text)) return 'zh-CN'

  // Default to English
  return 'en-US'
}
