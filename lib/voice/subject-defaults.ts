/**
 * Subject-Specific Voice Recognition Defaults
 *
 * Phase 1 (P0): 과목별 최적화된 기본 음성 설정
 * - 수학 튜터: 한국어 + Push-to-Talk + 수동 시작
 * - 영어 튜터: 영국 영어 + Always-On + 자동 시작
 * - 과학 튜터: 한국어 + Push-to-Talk + 수동 시작 (수학과 동일)
 */

import type { VoiceSettingsConfig } from '@/components/voice/VoiceSettings';

/**
 * 수학 튜터 기본 설정
 * - 한국어 입력 (수식과 한글 설명에 최적화)
 * - Push-to-Talk 모드 (정확한 수학 용어 입력을 위해)
 * - 수동 시작 (사용자가 준비되었을 때 시작)
 */
export const MATH_TUTOR_DEFAULTS: VoiceSettingsConfig = {
  // Voice Input
  inputMode: 'push-to-talk',
  inputLanguage: 'ko-KR',

  // Voice Output
  autoPlayResponses: true,
  repeatUserInput: false,
  outputLanguage: 'ko-KR',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  voiceVolume: 0.8,
  ttsEngine: 'puter',
  puterEngine: 'neural',

  // Advanced
  noiseSuppression: true,
  echoCancellation: true,
};

/**
 * 영어 튜터 기본 설정
 * - 영국 영어 입력 (자연스러운 영어 발음 연습)
 * - Push-to-Talk 모드 (사용자가 원할 때 음성 입력 시작)
 * - 수동 시작 (사용자가 버튼을 클릭해야 시작)
 *
 * 사용자 요청: "Always Listening" 모드 자동 실행 방지
 */
export const ENGLISH_TUTOR_DEFAULTS: VoiceSettingsConfig = {
  // Voice Input
  inputMode: 'push-to-talk', // Changed from 'continuous' to prevent auto-render
  inputLanguage: 'en-GB',

  // Voice Output
  autoPlayResponses: true,
  repeatUserInput: false,
  outputLanguage: 'en-GB',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  voiceVolume: 0.8,
  ttsEngine: 'puter',
  puterEngine: 'neural',

  // Advanced
  noiseSuppression: true,
  echoCancellation: true,
};

/**
 * 과학 튜터 기본 설정
 * - 한국어 입력 (과학 용어와 한글 설명에 최적화)
 * - Push-to-Talk 모드 (정확한 과학 용어 입력을 위해)
 * - 수동 시작 (사용자가 준비되었을 때 시작)
 */
export const SCIENCE_TUTOR_DEFAULTS: VoiceSettingsConfig = {
  // Voice Input
  inputMode: 'push-to-talk',
  inputLanguage: 'ko-KR',

  // Voice Output
  autoPlayResponses: true,
  repeatUserInput: false,
  outputLanguage: 'ko-KR',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  voiceVolume: 0.8,
  ttsEngine: 'puter',
  puterEngine: 'neural',

  // Advanced
  noiseSuppression: true,
  echoCancellation: true,
};

/**
 * 과목별 기본 설정 가져오기
 * @param subject 과목 ('english' | 'math' | 'science')
 * @returns 해당 과목에 최적화된 음성 설정
 */
export function getSubjectDefaultSettings(
  subject: 'english' | 'math' | 'science'
): VoiceSettingsConfig {
  if (subject === 'math') return MATH_TUTOR_DEFAULTS;
  if (subject === 'science') return SCIENCE_TUTOR_DEFAULTS;
  return ENGLISH_TUTOR_DEFAULTS;
}

/**
 * 과목별 자동 시작 여부
 * - 수학: 수동 시작 (사용자가 버튼 클릭)
 * - 영어: 수동 시작 (사용자가 버튼 클릭)
 * - 과학: 수동 시작 (사용자가 버튼 클릭)
 *
 * 사용자 요청에 따라 모든 과목에서 음성인식 수동 시작으로 변경
 */
export function shouldAutoStartVoice(subject: 'english' | 'math' | 'science'): boolean {
  return false; // 모든 과목에서 수동 시작
}

/**
 * 과목별 음성 입력 안내 메시지
 */
export function getVoiceInputGuideMessage(subject: 'english' | 'math' | 'science'): string {
  if (subject === 'math') {
    return '🎤 버튼을 길게 눌러 수학 문제를 말씀해주세요. (한국어 지원)';
  }
  if (subject === 'science') {
    return '🎤 버튼을 길게 눌러 과학 질문을 말씀해주세요. (한국어 지원)';
  }
  return '🎤 Press and hold the button to speak in English. (British accent supported)';
}

/**
 * 과목별 음성 설정 설명
 */
export function getVoiceSettingsDescription(
  subject: 'english' | 'math' | 'science'
): {
  title: string;
  description: string;
  features: string[];
} {
  if (subject === 'math') {
    return {
      title: '수학 튜터 음성 설정',
      description: '수식과 한국어 설명에 최적화된 설정입니다.',
      features: [
        '✓ 한국어 음성 인식',
        '✓ Push-to-Talk 모드 (정확한 입력)',
        '✓ 수동 시작 (준비되면 시작)',
        '✓ 수학 용어 최적화',
      ],
    };
  }

  if (subject === 'science') {
    return {
      title: '과학 튜터 음성 설정',
      description: '과학 용어와 한국어 설명에 최적화된 설정입니다.',
      features: [
        '✓ 한국어 음성 인식',
        '✓ Push-to-Talk 모드 (정확한 입력)',
        '✓ 수동 시작 (준비되면 시작)',
        '✓ 과학 용어 최적화',
      ],
    };
  }

  return {
    title: 'English Tutor Voice Settings',
    description: 'Optimized for natural English conversation practice.',
    features: [
      '✓ British English recognition',
      '✓ Push-to-Talk mode (speak when ready)',
      '✓ Manual start (user control)',
      '✓ Natural speech recognition',
    ],
  };
}
