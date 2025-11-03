// types/emotion.ts

/**
 * 감정 감지 AI 시스템 타입 정의
 *
 * Gemini API를 활용한 실시간 감정 분석
 * 음성 톤, 텍스트 내용, 학습 패턴 기반 감정 파악
 */

/**
 * 기본 감정 카테고리
 */
export type EmotionCategory =
  | 'happy'        // 행복, 즐거움
  | 'excited'      // 흥분, 열정
  | 'confident'    // 자신감
  | 'neutral'      // 중립
  | 'confused'     // 혼란
  | 'frustrated'   // 좌절
  | 'anxious'      // 불안
  | 'bored'        // 지루함
  | 'tired';       // 피곤함

/**
 * 감정 강도 (0.0 ~ 1.0)
 */
export type EmotionIntensity = number;

/**
 * 감정 분석 결과
 */
export interface EmotionAnalysis {
  /** 주요 감정 */
  primary: EmotionCategory;

  /** 감정 강도 (0.0 ~ 1.0) */
  intensity: EmotionIntensity;

  /** 부차적 감정들 (최대 2개) */
  secondary?: EmotionCategory[];

  /** 감정 점수 맵 */
  scores: Partial<Record<EmotionCategory, number>>;

  /** 분석 신뢰도 (0.0 ~ 1.0) */
  confidence: number;

  /** 분석 타임스탬프 */
  timestamp: Date;

  /** 분석 소스 */
  source: 'text' | 'voice' | 'combined';
}

/**
 * 음성 톤 분석 데이터
 */
export interface VoiceToneAnalysis {
  /** 평균 피치 (Hz) */
  averagePitch?: number;

  /** 음량 (dB) */
  volume?: number;

  /** 말하는 속도 (words per minute) */
  speechRate?: number;

  /** 에너지 레벨 (0.0 ~ 1.0) */
  energy?: number;

  /** 톤의 변동성 */
  variability?: number;
}

/**
 * 감정 기반 응답 조정 전략
 */
export interface EmotionResponseStrategy {
  /** 응답 톤 조정 */
  tone: 'encouraging' | 'supportive' | 'energetic' | 'calm' | 'patient' | 'neutral';

  /** 설명 상세도 조정 */
  explanationDetail: 'brief' | 'moderate' | 'detailed';

  /** 격려 메시지 포함 여부 */
  includeEncouragement: boolean;

  /** 휴식 제안 여부 */
  suggestBreak: boolean;

  /** 난이도 조정 제안 */
  adjustDifficulty?: 'easier' | 'maintain' | 'harder';

  /** 추가 힌트 제공 */
  provideExtraHints: boolean;
}

/**
 * 감정 트래킹 히스토리
 */
export interface EmotionHistory {
  /** 세션 ID */
  sessionId: string;

  /** 사용자 ID */
  userId: string;

  /** 감정 분석 기록 */
  analyses: EmotionAnalysis[];

  /** 세션 시작 시간 */
  startTime: Date;

  /** 마지막 업데이트 시간 */
  lastUpdated: Date;

  /** 감정 트렌드 요약 */
  trend: EmotionTrend;
}

/**
 * 감정 트렌드 분석
 */
export interface EmotionTrend {
  /** 가장 빈번한 감정 */
  mostFrequent: EmotionCategory;

  /** 평균 감정 강도 */
  averageIntensity: number;

  /** 감정 변화율 (긍정적/부정적) */
  changeRate: 'improving' | 'stable' | 'declining';

  /** 주의 필요 여부 */
  needsAttention: boolean;

  /** 권장 액션 */
  recommendedAction?: 'continue' | 'take_break' | 'adjust_difficulty' | 'provide_support';
}

/**
 * Gemini API 감정 분석 요청
 */
export interface EmotionAnalysisRequest {
  /** 분석할 텍스트 */
  text: string;

  /** 이전 대화 컨텍스트 (선택) */
  conversationContext?: string[];

  /** 음성 톤 데이터 (선택) */
  voiceTone?: VoiceToneAnalysis;

  /** 학습 상황 정보 */
  learningContext?: {
    subject: 'math' | 'english';
    difficulty: string;
    recentPerformance?: 'good' | 'average' | 'poor';
  };
}

/**
 * 감정 설정
 */
export interface EmotionSettings {
  /** 감정 감지 활성화 */
  enabled: boolean;

  /** 자동 응답 조정 */
  autoAdjustResponse: boolean;

  /** 감정 히스토리 저장 */
  trackHistory: boolean;

  /** 민감도 (0.0 ~ 1.0) */
  sensitivity: number;

  /** 최소 업데이트 간격 (초) */
  updateInterval: number;
}

/**
 * 감정 상태 UI 표시
 */
export interface EmotionDisplay {
  /** 표시할 이모지 */
  emoji: string;

  /** 색상 코드 */
  color: string;

  /** 배경 그라디언트 */
  gradient: string;

  /** 설명 텍스트 */
  label: string;

  /** 애니메이션 타입 */
  animation?: 'pulse' | 'bounce' | 'glow' | 'none';
}

/**
 * 감정별 UI 설정 맵
 */
export const EMOTION_DISPLAY_CONFIG: Record<EmotionCategory, EmotionDisplay> = {
  happy: {
    emoji: '😊',
    color: '#10B981',
    gradient: 'from-green-400 to-emerald-500',
    label: '즐거워하고 있어요',
    animation: 'bounce',
  },
  excited: {
    emoji: '🤩',
    color: '#F59E0B',
    gradient: 'from-yellow-400 to-orange-500',
    label: '열정적이에요',
    animation: 'pulse',
  },
  confident: {
    emoji: '💪',
    color: '#3B82F6',
    gradient: 'from-blue-400 to-indigo-500',
    label: '자신감 넘쳐요',
    animation: 'glow',
  },
  neutral: {
    emoji: '😐',
    color: '#6B7280',
    gradient: 'from-gray-400 to-gray-500',
    label: '평온해요',
    animation: 'none',
  },
  confused: {
    emoji: '🤔',
    color: '#8B5CF6',
    gradient: 'from-purple-400 to-violet-500',
    label: '고민 중이에요',
    animation: 'none',
  },
  frustrated: {
    emoji: '😤',
    color: '#EF4444',
    gradient: 'from-red-400 to-rose-500',
    label: '어려움을 느끼고 있어요',
    animation: 'pulse',
  },
  anxious: {
    emoji: '😰',
    color: '#F97316',
    gradient: 'from-orange-400 to-red-500',
    label: '불안해하고 있어요',
    animation: 'pulse',
  },
  bored: {
    emoji: '😑',
    color: '#64748B',
    gradient: 'from-slate-400 to-gray-500',
    label: '지루해하고 있어요',
    animation: 'none',
  },
  tired: {
    emoji: '😴',
    color: '#06B6D4',
    gradient: 'from-cyan-400 to-blue-500',
    label: '피곤해 보여요',
    animation: 'none',
  },
};

/**
 * 감정별 응답 전략 템플릿
 */
export const EMOTION_RESPONSE_TEMPLATES: Record<EmotionCategory, EmotionResponseStrategy> = {
  happy: {
    tone: 'energetic',
    explanationDetail: 'moderate',
    includeEncouragement: true,
    suggestBreak: false,
    adjustDifficulty: 'maintain',
    provideExtraHints: false,
  },
  excited: {
    tone: 'energetic',
    explanationDetail: 'moderate',
    includeEncouragement: true,
    suggestBreak: false,
    adjustDifficulty: 'harder',
    provideExtraHints: false,
  },
  confident: {
    tone: 'encouraging',
    explanationDetail: 'brief',
    includeEncouragement: false,
    suggestBreak: false,
    adjustDifficulty: 'harder',
    provideExtraHints: false,
  },
  neutral: {
    tone: 'neutral',
    explanationDetail: 'moderate',
    includeEncouragement: false,
    suggestBreak: false,
    adjustDifficulty: 'maintain',
    provideExtraHints: false,
  },
  confused: {
    tone: 'patient',
    explanationDetail: 'detailed',
    includeEncouragement: true,
    suggestBreak: false,
    adjustDifficulty: 'maintain',
    provideExtraHints: true,
  },
  frustrated: {
    tone: 'supportive',
    explanationDetail: 'detailed',
    includeEncouragement: true,
    suggestBreak: false,
    adjustDifficulty: 'easier',
    provideExtraHints: true,
  },
  anxious: {
    tone: 'calm',
    explanationDetail: 'detailed',
    includeEncouragement: true,
    suggestBreak: true,
    adjustDifficulty: 'easier',
    provideExtraHints: true,
  },
  bored: {
    tone: 'energetic',
    explanationDetail: 'brief',
    includeEncouragement: true,
    suggestBreak: false,
    adjustDifficulty: 'harder',
    provideExtraHints: false,
  },
  tired: {
    tone: 'calm',
    explanationDetail: 'brief',
    includeEncouragement: true,
    suggestBreak: true,
    adjustDifficulty: 'easier',
    provideExtraHints: false,
  },
};
