// lib/emotion/voice-tone-analyzer.ts

import type { VoiceToneAnalysis } from '@/types/emotion';

/**
 * 음성 톤 분석 유틸리티
 *
 * Web Audio API를 활용한 실시간 음성 특성 분석
 */
export class VoiceToneAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private bufferLength: number = 0;

  /**
   * 오디오 컨텍스트 초기화
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  /**
   * 마이크 스트림 연결
   */
  async connectMicrophone(stream: MediaStream): Promise<void> {
    if (!this.audioContext || !this.analyser) {
      await this.initialize();
    }

    if (!this.audioContext || !this.analyser) {
      throw new Error('Audio context not initialized');
    }

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
  }

  /**
   * 실시간 음성 톤 분석
   */
  analyzeTone(): VoiceToneAnalysis {
    if (!this.analyser || !this.dataArray) {
      return this.getDefaultAnalysis();
    }

    // 주파수 및 시간 도메인 데이터 수집
    // @ts-ignore - Web Audio API type compatibility issue
    this.analyser.getByteFrequencyData(this.dataArray);
    const timeData = new Uint8Array(this.bufferLength);
    // @ts-ignore - Web Audio API type compatibility issue
    this.analyser.getByteTimeDomainData(timeData);

    // 분석
    const volume = this.calculateVolume(this.dataArray);
    const averagePitch = this.calculateAveragePitch(this.dataArray);
    const energy = this.calculateEnergy(this.dataArray);
    const variability = this.calculateVariability(timeData);

    return {
      averagePitch,
      volume,
      energy,
      variability,
    };
  }

  /**
   * 음량 계산 (dB)
   */
  private calculateVolume(dataArray: Uint8Array): number {
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / dataArray.length;

    // 0-255 범위를 데시벨로 변환 (근사치)
    // -60dB ~ 0dB 범위
    const db = 20 * Math.log10(average / 255);
    return Math.max(-60, db);
  }

  /**
   * 평균 피치 계산 (Hz)
   */
  private calculateAveragePitch(dataArray: Uint8Array): number {
    // 피크 주파수 찾기
    let maxIndex = 0;
    let maxValue = 0;

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    // 인덱스를 주파수로 변환
    if (!this.audioContext) return 0;

    const nyquist = this.audioContext.sampleRate / 2;
    const frequency = (maxIndex * nyquist) / this.bufferLength;

    // 일반적인 음성 범위 (80Hz - 300Hz)
    return Math.max(80, Math.min(300, frequency));
  }

  /**
   * 에너지 레벨 계산 (0.0 - 1.0)
   */
  private calculateEnergy(dataArray: Uint8Array): number {
    const sum = dataArray.reduce((acc, val) => acc + val * val, 0);
    const rms = Math.sqrt(sum / dataArray.length);

    // 0-255 범위를 0-1로 정규화
    return Math.min(1, rms / 128);
  }

  /**
   * 톤 변동성 계산 (0.0 - 1.0)
   */
  private calculateVariability(timeData: Uint8Array): number {
    // 표준편차 계산
    const mean = timeData.reduce((acc, val) => acc + val, 0) / timeData.length;
    const variance =
      timeData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / timeData.length;
    const stdDev = Math.sqrt(variance);

    // 0-255 범위를 0-1로 정규화
    return Math.min(1, stdDev / 128);
  }

  /**
   * 말하는 속도 추정 (words per minute)
   *
   * 참고: 정확한 WPM은 음성 인식 결과 필요
   * 여기서는 에너지 변화를 기반으로 근사치 계산
   */
  estimateSpeechRate(durationSeconds: number, wordCount: number): number {
    if (durationSeconds === 0) return 0;
    return Math.round((wordCount / durationSeconds) * 60);
  }

  /**
   * 기본 분석 결과 (폴백)
   */
  private getDefaultAnalysis(): VoiceToneAnalysis {
    return {
      averagePitch: 150,
      volume: -30,
      energy: 0.5,
      variability: 0.5,
    };
  }

  /**
   * 감정 매핑 (음성 특성 → 감정 힌트)
   */
  mapToneToEmotionHints(tone: VoiceToneAnalysis): {
    energyLevel: 'low' | 'medium' | 'high';
    expressiveness: 'monotone' | 'moderate' | 'expressive';
    intensity: 'calm' | 'moderate' | 'intense';
  } {
    const { energy = 0.5, variability = 0.5, volume = -30 } = tone;

    // 에너지 레벨 분류
    let energyLevel: 'low' | 'medium' | 'high' = 'medium';
    if (energy < 0.3) energyLevel = 'low';
    else if (energy > 0.7) energyLevel = 'high';

    // 표현력 분류 (변동성 기반)
    let expressiveness: 'monotone' | 'moderate' | 'expressive' = 'moderate';
    if (variability < 0.2) expressiveness = 'monotone';
    else if (variability > 0.6) expressiveness = 'expressive';

    // 강도 분류 (음량 기반)
    let intensity: 'calm' | 'moderate' | 'intense' = 'moderate';
    if (volume < -40) intensity = 'calm';
    else if (volume > -20) intensity = 'intense';

    return { energyLevel, expressiveness, intensity };
  }

  /**
   * 리소스 정리
   */
  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
}

/**
 * 싱글톤 인스턴스
 */
let voiceToneAnalyzerInstance: VoiceToneAnalyzer | null = null;

export function getVoiceToneAnalyzer(): VoiceToneAnalyzer {
  if (!voiceToneAnalyzerInstance) {
    voiceToneAnalyzerInstance = new VoiceToneAnalyzer();
  }
  return voiceToneAnalyzerInstance;
}
