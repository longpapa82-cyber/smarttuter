/**
 * Audio Processing Utilities
 * Real-time audio analysis for voice visualization
 *
 * Features:
 * - Audio amplitude detection
 * - Frequency analysis
 * - Volume normalization
 * - Real-time processing with Web Audio API
 */

/**
 * Audio analyzer for real-time microphone input
 */
export class AudioAnalyzer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private animationFrame: number | null = null

  constructor(private fftSize: number = 256) {}

  /**
   * Initialize audio analyzer with microphone stream
   */
  async initialize(stream: MediaStream): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new AudioContext()

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = this.fftSize
      this.analyser.smoothingTimeConstant = 0.8

      // Connect microphone
      this.microphone = this.audioContext.createMediaStreamSource(stream)
      this.microphone.connect(this.analyser)

      // Create data array for frequency data
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error)
      throw error
    }
  }

  /**
   * Get current audio amplitude (0-1)
   */
  getAmplitude(): number {
    if (!this.analyser || !this.dataArray) return 0

    this.analyser.getByteTimeDomainData(this.dataArray)

    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128
      sum += normalized * normalized
    }

    const rms = Math.sqrt(sum / this.dataArray.length)
    return Math.min(1, rms * 2) // Normalize and amplify slightly
  }

  /**
   * Get frequency data (useful for advanced visualizations)
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null

    this.analyser.getByteFrequencyData(this.dataArray)
    return this.dataArray
  }

  /**
   * Get average volume level (0-100)
   */
  getVolume(): number {
    if (!this.analyser || !this.dataArray) return 0

    this.analyser.getByteFrequencyData(this.dataArray)

    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i]
    }

    return Math.round((sum / this.dataArray.length / 255) * 100)
  }

  /**
   * Start continuous monitoring with callback
   */
  startMonitoring(
    callback: (amplitude: number, volume: number) => void,
    interval: number = 50
  ): void {
    const monitor = () => {
      const amplitude = this.getAmplitude()
      const volume = this.getVolume()
      callback(amplitude, volume)

      this.animationFrame = requestAnimationFrame(monitor)
    }

    monitor()
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  /**
   * Cleanup and release resources
   */
  destroy(): void {
    this.stopMonitoring()

    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }

    if (this.analyser) {
      this.analyser.disconnect()
      this.analyser = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.dataArray = null
  }
}

/**
 * Simple amplitude smoother for stable visualizations
 */
export class AmplitudeSmoother {
  private history: number[] = []
  private maxHistory: number

  constructor(historySize: number = 5) {
    this.maxHistory = historySize
  }

  /**
   * Add new amplitude value and get smoothed result
   */
  smooth(value: number): number {
    this.history.push(value)

    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    return this.history.reduce((sum, v) => sum + v, 0) / this.history.length
  }

  /**
   * Reset smoother
   */
  reset(): void {
    this.history = []
  }
}

/**
 * Audio level detector (for voice activity detection)
 */
export class VoiceActivityDetector {
  private threshold: number
  private gracePeriod: number
  private silenceDuration: number = 0
  private lastSpeechTime: number = 0

  constructor(threshold: number = 0.02, gracePeriod: number = 500) {
    this.threshold = threshold
    this.gracePeriod = gracePeriod
  }

  /**
   * Update with current amplitude and check if speech is detected
   */
  update(amplitude: number, deltaTime: number): boolean {
    const isSpeaking = amplitude > this.threshold

    if (isSpeaking) {
      this.lastSpeechTime = Date.now()
      this.silenceDuration = 0
      return true
    } else {
      const timeSinceLastSpeech = Date.now() - this.lastSpeechTime
      this.silenceDuration += deltaTime

      // Consider still speaking if within grace period
      return timeSinceLastSpeech < this.gracePeriod
    }
  }

  /**
   * Get duration of silence in milliseconds
   */
  getSilenceDuration(): number {
    return this.silenceDuration
  }

  /**
   * Reset detector
   */
  reset(): void {
    this.silenceDuration = 0
    this.lastSpeechTime = 0
  }
}

/**
 * Request microphone access and create audio stream
 */
export async function getMicrophoneStream(
  constraints?: MediaTrackConstraints
): Promise<MediaStream> {
  const defaultConstraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    ...constraints,
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: defaultConstraints,
    })

    return stream
  } catch (error) {
    console.error('Failed to get microphone stream:', error)
    throw new Error('Microphone access denied or not available')
  }
}

/**
 * Stop all tracks in a media stream
 */
export function stopMediaStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

/**
 * Check if microphone is available
 */
export async function isMicrophoneAvailable(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some((device) => device.kind === 'audioinput')
  } catch (error) {
    console.error('Failed to enumerate devices:', error)
    return false
  }
}

/**
 * Get list of available audio input devices
 */
export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((device) => device.kind === 'audioinput')
  } catch (error) {
    console.error('Failed to get audio input devices:', error)
    return []
  }
}

/**
 * Normalize audio amplitude to target range
 */
export function normalizeAmplitude(
  value: number,
  min: number = 0,
  max: number = 1
): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Apply exponential smoothing to audio data
 */
export function exponentialSmoothing(
  current: number,
  target: number,
  factor: number = 0.1
): number {
  return current + (target - current) * factor
}

/**
 * Convert decibels to linear amplitude
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

/**
 * Convert linear amplitude to decibels
 */
export function linearToDb(amplitude: number): number {
  return 20 * Math.log10(Math.max(amplitude, 0.00001))
}
