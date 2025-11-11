// lib/pronunciation/pronunciation-analyzer.ts
// 발음 분석 엔진 - Web Audio API 기반

import * as Tone from 'tone';
import type {
  PronunciationAnalysis,
  PhonemeAnalysis,
  FluencyAnalysis,
  IntonationAnalysis,
  AudioFeatures,
  AudioAnalysisConfig,
} from '@/types/pronunciation';
import {
  calculatePronunciationAccuracy,
  calculateWordAccuracies,
  calculatePhonemeAccuracyWithSimilarity,
  calculateComprehensiveScore,
  type WordAccuracy,
} from './accuracy-calculator';
import {
  getPhoneTip,
  findDifficultPhonemes,
} from './phoneme-tips-database';

/**
 * 발음 분석기 클래스
 * Web Audio API를 사용하여 실시간 발음 분석
 */
export class PronunciationAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private config: AudioAnalysisConfig;

  constructor(config?: Partial<AudioAnalysisConfig>) {
    this.config = {
      sampleRate: config?.sampleRate ?? 44100,
      fftSize: config?.fftSize ?? 2048,
      smoothingTimeConstant: config?.smoothingTimeConstant ?? 0.8,
      minDecibels: config?.minDecibels ?? -90,
      maxDecibels: config?.maxDecibels ?? -10,
    };
  }

  /**
   * 오디오 컨텍스트 초기화
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      this.analyser.minDecibels = this.config.minDecibels;
      this.analyser.maxDecibels = this.config.maxDecibels;

      console.log('✅ PronunciationAnalyzer initialized');
    } catch (error) {
      console.error('❌ Failed to initialize PronunciationAnalyzer:', error);
      throw error;
    }
  }

  /**
   * 오디오 스트림 연결
   */
  async connectStream(stream: MediaStream): Promise<void> {
    if (!this.audioContext || !this.analyser) {
      await this.initialize();
    }

    const source = this.audioContext!.createMediaStreamSource(stream);
    source.connect(this.analyser!);
  }

  /**
   * 파형 데이터 추출
   */
  getWaveformData(): Float32Array {
    if (!this.analyser) throw new Error('Analyzer not initialized');

    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);

    return dataArray;
  }

  /**
   * 주파수 데이터 추출
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) throw new Error('Analyzer not initialized');

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    return dataArray;
  }

  /**
   * 피치(음높이) 추출 - 자기상관(Autocorrelation) 알고리즘
   */
  extractPitch(waveform: Float32Array): number | null {
    const SIZE = waveform.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let bestOffset = -1;
    let bestCorrelation = 0;
    let rms = 0;

    // RMS 계산 (신호 강도)
    for (let i = 0; i < SIZE; i++) {
      const val = waveform[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    // 신호가 너무 약하면 null 반환
    if (rms < 0.01) return null;

    // 자기상관 계산
    let lastCorrelation = 1;
    for (let offset = 0; offset < MAX_SAMPLES; offset++) {
      let correlation = 0;

      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(waveform[i] - waveform[i + offset]);
      }

      correlation = 1 - correlation / MAX_SAMPLES;

      if (correlation > 0.9 && correlation > lastCorrelation) {
        const foundGoodCorrelation = correlation > bestCorrelation;
        if (foundGoodCorrelation) {
          bestCorrelation = correlation;
          bestOffset = offset;
        }
      }

      lastCorrelation = correlation;
    }

    if (bestCorrelation > 0.01 && bestOffset !== -1) {
      const fundamentalFreq = this.config.sampleRate / bestOffset;
      return fundamentalFreq;
    }

    return null;
  }

  /**
   * 에너지 레벨 계산 (RMS)
   */
  calculateEnergy(waveform: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < waveform.length; i++) {
      sum += waveform[i] * waveform[i];
    }
    return Math.sqrt(sum / waveform.length);
  }

  /**
   * 음소 분석 (개선된 버전 - Levenshtein Distance 기반)
   * 단어 단위로 분석하여 더 정확한 피드백 제공
   */
  analyzePhonemes(
    targetText: string,
    transcript: string
  ): PhonemeAnalysis[] {
    const analyses: PhonemeAnalysis[] = [];

    // 단어 단위로 정확도 계산
    const wordAccuracies = calculateWordAccuracies(targetText, transcript);

    // 각 단어를 음소 분석으로 변환
    let position = 0;
    for (const wordAcc of wordAccuracies) {
      const targetWord = wordAcc.expectedWord;
      const actualWord = wordAcc.word;

      // 단어별 정확도를 0-1 범위로 변환
      const accuracy = wordAcc.accuracy / 100;

      // 심각도 결정
      let severity: 'perfect' | 'good' | 'fair' | 'poor';
      if (accuracy >= 0.95) {
        severity = 'perfect';
      } else if (accuracy >= 0.80) {
        severity = 'good';
      } else if (accuracy >= 0.60) {
        severity = 'fair';
      } else {
        severity = 'poor';
      }

      // 피드백 생성
      const feedback = this.getWordFeedback(targetWord, actualWord, accuracy);

      analyses.push({
        target: targetWord,
        actual: actualWord,
        accuracy,
        position,
        feedback,
        severity,
      });

      position++;
    }

    return analyses;
  }

  /**
   * 단어별 피드백 생성 (개선된 버전)
   * 발음 팁 데이터베이스를 활용
   */
  private getWordFeedback(target: string, actual: string, accuracy: number): string {
    // 정확도가 높으면 피드백 불필요
    if (accuracy >= 0.95) {
      return '완벽합니다! 🎉';
    }

    // 완전히 틀린 경우
    if (!actual || accuracy < 0.3) {
      return `"${target}" 단어를 다시 발음해보세요`;
    }

    // 어려운 음소 찾기
    const difficultPhonemes = findDifficultPhonemes(target);

    if (difficultPhonemes.length > 0) {
      const tip = difficultPhonemes[0];
      return `${tip.koreanGuide} (예: ${tip.examples.join(', ')})`;
    }

    // 일반적인 피드백
    if (accuracy >= 0.80) {
      return '거의 완벽해요! 조금만 더 연습하면 됩니다 😊';
    } else if (accuracy >= 0.60) {
      return `"${target}" 발음을 천천히 다시 시도해보세요`;
    } else {
      return `"${target}" 발음이 어려워 보이네요. 천천히 따라해보세요`;
    }
  }

  /**
   * 유창성 분석
   */
  analyzeFluency(
    audioFeatures: AudioFeatures,
    wordCount: number
  ): FluencyAnalysis {
    const durationMinutes = audioFeatures.duration / 60000;
    const wordsPerMinute = Math.round(wordCount / durationMinutes);

    // 침묵 구간 감지 (에너지 < 0.01)
    const pauses = audioFeatures.energy.filter((e) => e < 0.01);
    const pauseCount = Math.floor(pauses.length / 10); // 연속된 침묵을 하나로 카운트

    // 평균 멈춤 시간 (ms)
    const pauseDuration = pauses.length > 0 ? (audioFeatures.duration * pauses.length) / audioFeatures.energy.length : 0;

    // 리듬 점수: WPM이 120-150 범위 내일 때 최고점
    const idealWPM = 135;
    const wpmDiff = Math.abs(wordsPerMinute - idealWPM);
    const rhythm = Math.max(0, 100 - wpmDiff * 2);

    // 속도 일관성: 에너지 변화의 표준편차 기반
    const energyMean = audioFeatures.energy.reduce((a, b) => a + b, 0) / audioFeatures.energy.length;
    const variance = audioFeatures.energy.reduce((sum, e) => sum + Math.pow(e - energyMean, 2), 0) / audioFeatures.energy.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 1 - stdDev * 5);

    return {
      wordsPerMinute,
      pauseCount,
      pauseDuration,
      rhythm,
      consistency,
    };
  }

  /**
   * 억양 분석
   */
  analyzeIntonation(pitchContour: number[]): IntonationAnalysis {
    if (pitchContour.length < 2) {
      return {
        pattern: 'flat',
        appropriateness: 0.5,
        nativelikeness: 0.5,
        pitchRange: 0,
        pitchVariation: 0,
      };
    }

    // 피치 범위
    const pitchRange = Math.max(...pitchContour) - Math.min(...pitchContour);

    // 피치 변화 패턴 감지
    const startPitch = pitchContour[0];
    const endPitch = pitchContour[pitchContour.length - 1];
    const midPitch = pitchContour[Math.floor(pitchContour.length / 2)];

    let pattern: 'rising' | 'falling' | 'flat' | 'rising-falling' = 'flat';

    if (endPitch > startPitch * 1.1) {
      pattern = 'rising';
    } else if (endPitch < startPitch * 0.9) {
      pattern = 'falling';
    } else if (midPitch > startPitch * 1.1 && endPitch < midPitch * 0.9) {
      pattern = 'rising-falling';
    }

    // 피치 변화도
    const pitchDiffs = pitchContour.slice(1).map((p, i) => Math.abs(p - pitchContour[i]));
    const avgPitchDiff = pitchDiffs.reduce((a, b) => a + b, 0) / pitchDiffs.length;
    const pitchVariation = Math.min(1, avgPitchDiff / 50); // 정규화

    // 적절성 및 원어민 유사도 (휴리스틱)
    const appropriateness = pitchVariation > 0.1 ? 0.8 : 0.5; // 변화가 있어야 자연스러움
    const nativelikeness = pitchRange > 30 ? 0.7 : 0.5; // 충분한 음높이 범위

    return {
      pattern,
      appropriateness,
      nativelikeness,
      pitchRange,
      pitchVariation,
    };
  }

  /**
   * 종합 발음 분석
   */
  async analyze(
    audioBlob: Blob,
    targetText: string,
    transcript: string
  ): Promise<PronunciationAnalysis> {
    const startTime = performance.now();

    try {
      // 오디오 디코딩
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

      // 파형 데이터 추출
      const waveform = audioBuffer.getChannelData(0);
      const duration = audioBuffer.duration * 1000; // ms

      // 피치 추출 (시간 윈도우마다)
      const windowSize = 2048;
      const hopSize = 512;
      const pitchContour: number[] = [];
      const energy: number[] = [];

      for (let i = 0; i < waveform.length - windowSize; i += hopSize) {
        const window = waveform.slice(i, i + windowSize);
        const pitch = this.extractPitch(window);
        if (pitch) pitchContour.push(pitch);

        const energyLevel = this.calculateEnergy(window);
        energy.push(energyLevel);
      }

      // 음향 특성
      const audioFeatures: AudioFeatures = {
        waveform,
        pitchContour,
        energy,
        timestamps: Array.from({ length: pitchContour.length }, (_, i) => (i * hopSize * 1000) / this.config.sampleRate),
        duration,
      };

      // 음소 분석
      const phonemes = this.analyzePhonemes(targetText, transcript);
      const phonemeAccuracy = (phonemes.reduce((sum, p) => sum + p.accuracy, 0) / phonemes.length) * 100;

      // 유창성 분석
      const wordCount = targetText.split(/\s+/).length;
      const fluency = this.analyzeFluency(audioFeatures, wordCount);
      const fluencyScore = (fluency.rhythm + fluency.consistency * 100) / 2;

      // 억양 분석
      const intonation = this.analyzeIntonation(pitchContour);
      const intonationScore = (intonation.appropriateness + intonation.nativelikeness + intonation.pitchVariation) * 33.33;

      // 종합 점수 (가중 평균)
      const overallScore = phonemeAccuracy * 0.5 + fluencyScore * 0.3 + intonationScore * 0.2;

      // 등급 부여
      const grade = this.calculateGrade(overallScore);

      // 개선 제안 생성
      const improvements = this.generateImprovements(phonemes, fluency, intonation);

      const processingTime = performance.now() - startTime;

      return {
        text: targetText,
        transcript,
        phonemes,
        phonemeAccuracy,
        fluency,
        fluencyScore,
        intonation,
        intonationScore,
        audioFeatures,
        overallScore,
        grade,
        improvements,
        timestamp: new Date(),
        processingTime,
      };
    } catch (error) {
      console.error('❌ Pronunciation analysis error:', error);
      throw error;
    }
  }

  /**
   * 점수에 따른 등급 계산
   */
  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * 개선 제안 생성
   */
  private generateImprovements(
    phonemes: PhonemeAnalysis[],
    fluency: FluencyAnalysis,
    intonation: IntonationAnalysis
  ) {
    const improvements: PronunciationAnalysis['improvements'] = [];

    // 음소 개선 제안
    const poorPhonemes = phonemes.filter((p) => p.severity === 'poor' || p.severity === 'fair');
    if (poorPhonemes.length > 0) {
      improvements.push({
        category: 'phoneme',
        priority: 'high',
        suggestion: `${poorPhonemes.length}개 음소 발음 개선 필요`,
        examples: poorPhonemes.slice(0, 3).map((p) => `${p.target}: ${p.feedback}`),
      });
    }

    // 유창성 개선 제안
    if (fluency.rhythm < 70) {
      improvements.push({
        category: 'fluency',
        priority: fluency.rhythm < 50 ? 'high' : 'medium',
        suggestion: `말하기 속도 조절 필요 (현재 ${fluency.wordsPerMinute} WPM, 목표 120-150 WPM)`,
      });
    }

    if (fluency.pauseCount > 5) {
      improvements.push({
        category: 'fluency',
        priority: 'medium',
        suggestion: `부적절한 멈춤 감소 필요 (${fluency.pauseCount}회 감지)`,
        examples: ['문장 중간이 아닌 문장 끝에서 멈추세요', '자연스러운 호흡점을 찾으세요'],
      });
    }

    // 억양 개선 제안
    if (intonation.pitchVariation < 0.3) {
      improvements.push({
        category: 'intonation',
        priority: 'medium',
        suggestion: '억양 변화 부족 - 더 다양한 톤으로 말해보세요',
        examples: ['중요한 단어를 강조하세요', '질문할 때는 끝을 올리세요'],
      });
    }

    return improvements;
  }

  /**
   * 리소스 정리
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }
}

/**
 * 전역 싱글톤 인스턴스
 */
let globalAnalyzer: PronunciationAnalyzer | null = null;

export function getPronunciationAnalyzer(): PronunciationAnalyzer {
  if (!globalAnalyzer) {
    globalAnalyzer = new PronunciationAnalyzer();
  }
  return globalAnalyzer;
}
