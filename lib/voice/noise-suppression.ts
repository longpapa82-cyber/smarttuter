/**
 * Noise Suppression Module
 *
 * Phase 3 (P1): Background noise filtering
 *
 * Web Audio API를 사용한 노이즈 억제:
 * 1. DynamicsCompressor - 큰 소리 제한, 작은 소리 증폭
 * 2. BiquadFilter - 특정 주파수 대역 필터링
 * 3. Gain - 입력 볼륨 조절
 */

export interface NoiseSuppressorConfig {
  /**
   * Enable noise suppression
   */
  enabled: boolean;

  /**
   * Compressor threshold (decibels)
   * 기본값: -50dB
   */
  threshold: number;

  /**
   * Compressor knee (decibels)
   * 기본값: 40dB
   */
  knee: number;

  /**
   * Compressor ratio
   * 기본값: 12 (12:1 압축비)
   */
  ratio: number;

  /**
   * Compressor attack (seconds)
   * 기본값: 0.003 (3ms)
   */
  attack: number;

  /**
   * Compressor release (seconds)
   * 기본값: 0.25 (250ms)
   */
  release: number;

  /**
   * High-pass filter frequency (Hz)
   * 낮은 주파수 잡음 제거 (예: 에어컨 소음)
   * 기본값: 100Hz
   */
  highPassFrequency: number;

  /**
   * Low-pass filter frequency (Hz)
   * 높은 주파수 잡음 제거
   * 기본값: 8000Hz
   */
  lowPassFrequency: number;

  /**
   * Input gain (0.0 ~ 2.0)
   * 기본값: 1.0
   */
  inputGain: number;
}

export const DEFAULT_NOISE_SUPPRESSOR_CONFIG: NoiseSuppressorConfig = {
  enabled: true,
  threshold: -50,
  knee: 40,
  ratio: 12,
  attack: 0.003,
  release: 0.25,
  highPassFrequency: 100,
  lowPassFrequency: 8000,
  inputGain: 1.0,
};

/**
 * Noise Suppressor using Web Audio API
 */
export class NoiseSuppressor {
  private config: NoiseSuppressorConfig;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  constructor(config: Partial<NoiseSuppressorConfig> = {}) {
    this.config = { ...DEFAULT_NOISE_SUPPRESSOR_CONFIG, ...config };
  }

  /**
   * Initialize noise suppressor
   */
  async initialize(inputStream: MediaStream): Promise<MediaStream> {
    if (!this.config.enabled) {
      console.log('⚙️ Noise suppression disabled, using original stream');
      return inputStream;
    }

    try {
      this.audioContext = new AudioContext();

      // Create audio processing chain
      this.sourceNode = this.audioContext.createMediaStreamSource(inputStream);
      this.gainNode = this.audioContext.createGain();
      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.lowPassFilter = this.audioContext.createBiquadFilter();
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.destinationNode = this.audioContext.createMediaStreamDestination();

      // Configure gain
      this.gainNode.gain.value = this.config.inputGain;

      // Configure high-pass filter (remove low-frequency noise)
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.value = this.config.highPassFrequency;
      this.highPassFilter.Q.value = 1.0;

      // Configure low-pass filter (remove high-frequency noise)
      this.lowPassFilter.type = 'lowpass';
      this.lowPassFilter.frequency.value = this.config.lowPassFrequency;
      this.lowPassFilter.Q.value = 1.0;

      // Configure compressor
      this.compressorNode.threshold.value = this.config.threshold;
      this.compressorNode.knee.value = this.config.knee;
      this.compressorNode.ratio.value = this.config.ratio;
      this.compressorNode.attack.value = this.config.attack;
      this.compressorNode.release.value = this.config.release;

      // Connect processing chain
      this.sourceNode
        .connect(this.gainNode)
        .connect(this.highPassFilter)
        .connect(this.lowPassFilter)
        .connect(this.compressorNode)
        .connect(this.destinationNode);

      console.log('🔇 Noise suppression initialized:', {
        highPass: `${this.config.highPassFrequency}Hz`,
        lowPass: `${this.config.lowPassFrequency}Hz`,
        threshold: `${this.config.threshold}dB`,
        ratio: `${this.config.ratio}:1`,
      });

      return this.destinationNode.stream;
    } catch (error) {
      console.error('❌ Failed to initialize noise suppression:', error);
      return inputStream; // Fallback to original stream
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NoiseSuppressorConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.gainNode) {
      this.gainNode.gain.value = this.config.inputGain;
    }

    if (this.highPassFilter) {
      this.highPassFilter.frequency.value = this.config.highPassFrequency;
    }

    if (this.lowPassFilter) {
      this.lowPassFilter.frequency.value = this.config.lowPassFrequency;
    }

    if (this.compressorNode) {
      this.compressorNode.threshold.value = this.config.threshold;
      this.compressorNode.knee.value = this.config.knee;
      this.compressorNode.ratio.value = this.config.ratio;
      this.compressorNode.attack.value = this.config.attack;
      this.compressorNode.release.value = this.config.release;
    }

    console.log('🔧 Noise suppressor config updated:', config);
  }

  /**
   * Get current reduction level (in decibels)
   */
  getReductionLevel(): number {
    if (!this.compressorNode) return 0;
    return this.compressorNode.reduction;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.highPassFilter) {
      this.highPassFilter.disconnect();
      this.highPassFilter = null;
    }

    if (this.lowPassFilter) {
      this.lowPassFilter.disconnect();
      this.lowPassFilter = null;
    }

    if (this.compressorNode) {
      this.compressorNode.disconnect();
      this.compressorNode = null;
    }

    if (this.destinationNode) {
      this.destinationNode.disconnect();
      this.destinationNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log('🗑️ Noise suppressor destroyed');
  }
}

/**
 * Create noise suppressor with environment preset
 */
export function createNoiseSuppressor(
  environment: 'quiet' | 'normal' | 'noisy'
): NoiseSuppressor {
  const presets: Record<string, Partial<NoiseSuppressorConfig>> = {
    quiet: {
      enabled: false, // Not needed in quiet environment
    },
    normal: {
      enabled: true,
      threshold: -50,
      ratio: 12,
      highPassFrequency: 100,
      lowPassFrequency: 8000,
    },
    noisy: {
      enabled: true,
      threshold: -40, // More aggressive
      ratio: 20, // Higher compression
      highPassFrequency: 150, // Remove more low-frequency noise
      lowPassFrequency: 7000, // Remove more high-frequency noise
    },
  };

  return new NoiseSuppressor(presets[environment]);
}
