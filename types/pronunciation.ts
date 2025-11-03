// types/pronunciation.ts - 발음 분석 타입 정의

/**
 * 음소(Phoneme) 분석 결과
 */
export interface PhonemeAnalysis {
  target: string;          // 목표 음소 (예: /ð/ for "the")
  actual: string;          // 실제 발음 음소
  accuracy: number;        // 정확도 0-1
  position: number;        // 단어 내 위치 (0-based)
  feedback: string;        // 개선 피드백
  severity: 'perfect' | 'good' | 'fair' | 'poor';
}

/**
 * 유창성(Fluency) 분석 결과
 */
export interface FluencyAnalysis {
  wordsPerMinute: number;      // 분당 단어 수
  pauseCount: number;          // 부적절한 멈춤 횟수
  pauseDuration: number;       // 평균 멈춤 시간 (ms)
  rhythm: number;              // 리듬 점수 0-100
  consistency: number;         // 속도 일관성 0-1
}

/**
 * 억양(Intonation) 분석 결과
 */
export interface IntonationAnalysis {
  pattern: 'rising' | 'falling' | 'flat' | 'rising-falling';
  appropriateness: number;     // 문맥상 적절성 0-1
  nativelikeness: number;      // 원어민 유사도 0-1
  pitchRange: number;          // 음높이 범위 (Hz)
  pitchVariation: number;      // 음높이 변화도 0-1
}

/**
 * 음향 데이터 (Waveform & Pitch)
 */
export interface AudioFeatures {
  waveform: Float32Array;      // 파형 데이터
  pitchContour: number[];      // 피치 곡선 (Hz)
  energy: number[];            // 에너지 레벨
  timestamps: number[];        // 시간 포인트 (ms)
  duration: number;            // 총 길이 (ms)
}

/**
 * 종합 발음 분석 결과
 */
export interface PronunciationAnalysis {
  // 기본 정보
  text: string;                // 분석 대상 텍스트
  transcript: string;          // 실제 인식된 텍스트

  // 음소 분석
  phonemes: PhonemeAnalysis[];
  phonemeAccuracy: number;     // 평균 음소 정확도 0-100

  // 유창성 분석
  fluency: FluencyAnalysis;
  fluencyScore: number;        // 유창성 점수 0-100

  // 억양 분석
  intonation: IntonationAnalysis;
  intonationScore: number;     // 억양 점수 0-100

  // 음향 데이터
  audioFeatures: AudioFeatures;

  // 종합 평가
  overallScore: number;        // 종합 점수 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

  // 개선 제안
  improvements: {
    category: 'phoneme' | 'fluency' | 'intonation';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    examples?: string[];
  }[];

  // 메타데이터
  timestamp: Date;
  processingTime: number;      // 분석 소요 시간 (ms)
}

/**
 * 발음 학습 기록
 */
export interface PronunciationHistory {
  userId: string;
  date: Date;
  analyses: PronunciationAnalysis[];

  // 진행도
  totalAttempts: number;
  averageScore: number;
  improvement: number;         // 개선율 (%)

  // 약점 음소
  weakPhonemes: {
    phoneme: string;
    accuracy: number;
    practiceCount: number;
  }[];

  // 학습 통계
  totalPracticeTime: number;   // 총 연습 시간 (minutes)
  sessionsCompleted: number;
  streakDays: number;
}

/**
 * 발음 연습 모드
 */
export type PronunciationMode =
  | 'word'              // 단어 연습
  | 'phrase'            // 구문 연습
  | 'sentence'          // 문장 연습
  | 'conversation'      // 자유 대화
  | 'minimal-pairs';    // 최소 대립쌍 (예: /r/ vs /l/)

/**
 * 발음 난이도
 */
export type PronunciationDifficulty =
  | 'beginner'          // 초급 (기본 음소)
  | 'intermediate'      // 중급 (이중모음, 연음)
  | 'advanced'          // 고급 (억양, 리듬)
  | 'native';           // 원어민 수준

/**
 * 발음 연습 콘텐츠
 */
export interface PronunciationExercise {
  id: string;
  mode: PronunciationMode;
  difficulty: PronunciationDifficulty;

  // 연습 내용
  targetText: string;          // 연습할 텍스트
  targetPhonemes: string[];    // 집중 음소
  audioExample?: string;       // 원어민 발음 오디오 URL

  // 가이드
  tips: string[];              // 발음 팁
  commonMistakes: string[];    // 흔한 실수
  visualGuide?: string;        // 입 모양 가이드 이미지/영상 URL

  // 메타데이터
  category: string;            // 예: "Consonants", "Vowels", "Stress"
  tags: string[];
  estimatedTime: number;       // 예상 소요 시간 (minutes)
}

/**
 * Web Audio API 음향 분석 설정
 */
export interface AudioAnalysisConfig {
  sampleRate: number;          // 샘플링 레이트 (Hz)
  fftSize: number;             // FFT 크기 (주파수 해상도)
  smoothingTimeConstant: number; // 평활화 상수
  minDecibels: number;
  maxDecibels: number;
}

/**
 * 음소 분류 모델 예측 결과
 */
export interface PhonemeClassification {
  phoneme: string;
  confidence: number;          // 신뢰도 0-1
  alternatives: {
    phoneme: string;
    confidence: number;
  }[];
}
