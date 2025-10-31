'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  getSpeechRecognitionErrorMessage,
  parseSpeechRecognitionResults,
  requestMicrophonePermission,
  type SpeechRecognitionConfig,
  type SpeechRecognitionResult,
} from '@/lib/voice/speech-recognition'

// SpeechRecognition types from Web Speech API
type SpeechRecognition = any
type SpeechRecognitionEvent = any
type SpeechRecognitionErrorEvent = any

export interface UseSpeechRecognitionOptions extends SpeechRecognitionConfig {
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
  onEnd?: () => void
  onStart?: () => void
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  isSupported: boolean
  startListening: () => Promise<void>
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported] = useState(() => isSpeechRecognitionSupported())
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    if (!isSupported) return

    const recognition = createSpeechRecognition({
      language: options.language || 'en-US',
      continuous: options.continuous ?? false,
      interimResults: options.interimResults ?? true,
      maxAlternatives: options.maxAlternatives || 1,
    })

    if (!recognition) return

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      optionsRef.current.onStart?.()
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
      optionsRef.current.onEnd?.()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = parseSpeechRecognitionResults(event)

      if (result.isFinal) {
        setTranscript(prev => prev + result.transcript + ' ')
        setInterimTranscript('')
      } else {
        setInterimTranscript(result.interimTranscript)
      }

      optionsRef.current.onResult?.(result)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getSpeechRecognitionErrorMessage(event.error)
      setError(errorMessage)
      setIsListening(false)
      optionsRef.current.onError?.(errorMessage)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [isSupported, options.language, options.continuous, options.interimResults, options.maxAlternatives])

  const startListening = useCallback(async () => {
    if (!isSupported || !recognitionRef.current || isListening) return

    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) {
      setError('Microphone permission denied')
      return
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }, [isSupported, isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping:', error)
      }
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}
