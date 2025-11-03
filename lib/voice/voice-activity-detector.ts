/**
 * Voice Activity Detection (VAD)
 *
 * Phase 3 (P1): Always Listening Enhancement
 *
 * VAD 알고리즘:
 * 1. Energy Level - RMS (Root Mean Square) 계산으로 음성 에너지 측정
 * 2. Zero-Crossing Rate - 신호의 부호 변화 빈도로 음성/잡음 구분
 *
 * 참고: ELSA Speak는 90% 정확도의 VAD 사용
 */

export interface VADConfig {
  /**
   * Energy threshold (0.0 ~ 1.0)
   * 이 값보다 높은 에너지가 감지되면 음성으로 판단
   * 기본값: 0.02 (조용한 환경), 0.05 (일반 환경), 0.1 (시끄러운 환경)
   */
  energyThreshold: number;

  /**
   * Zero-crossing rate threshold (0.0 ~ 1.0)
   * 음성은 낮은 ZCR, 잡음은 높은 ZCR 특성
   * 기본값: 0.3
   */
  zcrThreshold: number;

  /**
   * FFT size for frequency analysis
   * 기본값: 2048
   */
  fftSize: number;

  /**
   * Smoothing factor (0.0 ~ 1.0)
   * 급격한 변화 방지를 위한 평활화
   * 기본값: 0.8
   */
  smoothingFactor: number;

  /**
   * Minimum speech duration (ms)
   * 이 시간 이상 지속되어야 실제 음성으로 인정
   * 기본값: 300ms
   */
  minSpeechDuration: number;

  /**
   * Maximum silence duration (ms)
   * 이 시간 이상 침묵하면 발화 종료로 판단
   * 기본값: 2000ms
   */
  maxSilenceDuration: number;
}

export const DEFAULT_VAD_CONFIG: VADConfig = {
  energyThreshold: 0.02,
  zcrThreshold: 0.3,
  fftSize: 2048,
  smoothingFactor: 0.8,
  minSpeechDuration: 300,
  maxSilenceDuration: 2000,
};

/**
 * Voice Activity Detector
 */
export class VoiceActivityDetector {
  private config: VADConfig;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private previousDataArray: Uint8Array | null = null;

  // State tracking
  private smoothedEnergy: number = 0;
  private isSpeaking: boolean = false;
  private speechStartTime: number = 0;
  private lastSpeechTime: number = 0;

  constructor(config: Partial<VADConfig> = {}) {
    this.config = { ...DEFAULT_VAD_CONFIG, ...config };
  }

  /**
   * Initialize VAD with audio stream
   */
  async initialize(stream: MediaStream): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.previousDataArray = new Uint8Array(this.analyser.frequencyBinCount);

      console.log('🎤 VAD initialized:', {
        fftSize: this.config.fftSize,
        frequencyBinCount: this.analyser.frequencyBinCount,
        sampleRate: this.audioContext.sampleRate,
      });
    } catch (error) {
      console.error('❌ Failed to initialize VAD:', error);
      throw error;
    }
  }

  /**
   * Calculate RMS (Root Mean Square) energy level
   */
  private calculateEnergy(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteTimeDomainData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / this.dataArray.length);

    // Exponential smoothing for stability
    this.smoothedEnergy =
      this.config.smoothingFactor * this.smoothedEnergy +
      (1 - this.config.smoothingFactor) * rms;

    return this.smoothedEnergy;
  }

  /**
   * Calculate Zero-Crossing Rate
   * 신호가 0을 교차하는 빈도 (음성은 낮음, 잡음은 높음)
   */
  private calculateZeroCrossingRate(): number {
    if (!this.dataArray || !this.previousDataArray) return 0;

    let crossings = 0;
    for (let i = 1; i < this.dataArray.length; i++) {
      const current = this.dataArray[i] - 128;
      const previous = this.dataArray[i - 1] - 128;

      if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) {
        crossings++;
      }
    }

    // Copy current to previous for next iteration
    this.previousDataArray.set(this.dataArray);

    return crossings / this.dataArray.length;
  }

  /**
   * Detect if user is currently speaking
   */
  isSpeakingNow(): boolean {
    const energy = this.calculateEnergy();
    const zcr = this.calculateZeroCrossingRate();

    const now = Date.now();

    // Voice detected: high energy + low ZCR
    const voiceDetected =
      energy > this.config.energyThreshold && zcr < this.config.zcrThreshold;

    if (voiceDetected) {
      if (!this.isSpeaking) {
        // Start of speech
        this.speechStartTime = now;
        this.lastSpeechTime = now;
      } else {
        // Ongoing speech
        this.lastSpeechTime = now;
      }

      // Only confirm as speaking after minimum duration
      const speechDuration = now - this.speechStartTime;
      if (speechDuration >= this.config.minSpeechDuration) {
        this.isSpeaking = true;
      }
    } else {
      // No voice detected
      const silenceDuration = now - this.lastSpeechTime;

      if (this.isSpeaking && silenceDuration >= this.config.maxSilenceDuration) {
        // End of speech
        this.isSpeaking = false;
        this.speechStartTime = 0;
      }
    }

    return this.isSpeaking;
  }

  /**
   * Get current audio metrics
   */
  getMetrics(): {
    energy: number;
    zcr: number;
    isSpeaking: boolean;
    speechDuration: number;
  } {
    const energy = this.calculateEnergy();
    const zcr = this.calculateZeroCrossingRate();
    const speechDuration = this.isSpeaking
      ? Date.now() - this.speechStartTime
      : 0;

    return {
      energy,
      zcr,
      isSpeaking: this.isSpeaking,
      speechDuration,
    };
  }

  /**
   * Get normalized audio level (0.0 ~ 1.0) for visualization
   */
  getAudioLevel(): number {
    return Math.min(1.0, this.smoothedEnergy * 10); // Scale up for visibility
  }

  /**
   * Update VAD configuration
   */
  updateConfig(config: Partial<VADConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 VAD config updated:', config);
  }

  /**
   * Reset VAD state
   */
  reset(): void {
    this.smoothedEnergy = 0;
    this.isSpeaking = false;
    this.speechStartTime = 0;
    this.lastSpeechTime = 0;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.previousDataArray = null;
    this.reset();
    console.log('🗑️ VAD destroyed');
  }
}

/**
 * Create VAD with environment-specific config
 */
export function createVAD(environment: 'quiet' | 'normal' | 'noisy'): VoiceActivityDetector {
  const configs: Record<string, Partial<VADConfig>> = {
    quiet: {
      energyThreshold: 0.02,
      zcrThreshold: 0.3,
    },
    normal: {
      energyThreshold: 0.05,
      zcrThreshold: 0.35,
    },
    noisy: {
      energyThreshold: 0.1,
      zcrThreshold: 0.4,
    },
  };

  return new VoiceActivityDetector(configs[environment]);
}
