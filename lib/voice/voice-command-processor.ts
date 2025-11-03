/**
 * Voice Command Processor
 *
 * Phase 2 (P0): 음성 명령어 시스템
 * 사용자가 특정 명령어를 말하면 자동으로 인식하여 실행
 *
 * 지원 명령어:
 * - 음소거/Mute: TTS 끄기
 * - 소리켜/Unmute: TTS 켜기
 * - 그만/Stop listening: 음성 인식 중지
 * - 시작/Start listening: 음성 인식 시작
 * - 다시/Repeat: 마지막 응답 반복
 * - 천천히/Slower: 음성 속도 느리게
 * - 빠르게/Faster: 음성 속도 빠르게
 */

export type VoiceCommandType =
  | 'mute'
  | 'unmute'
  | 'stop_listening'
  | 'start_listening'
  | 'repeat'
  | 'slower'
  | 'faster';

export interface VoiceCommand {
  type: VoiceCommandType;
  koreanAliases: string[];
  englishAliases: string[];
  description: {
    ko: string;
    en: string;
  };
  confirmationMessage: {
    ko: string;
    en: string;
  };
}

/**
 * 7개 핵심 음성 명령어 정의
 */
export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    type: 'mute',
    koreanAliases: ['음소거', '소리꺼', '소리 꺼', '음성꺼', '음성 꺼', '조용'],
    englishAliases: ['mute', 'silence', 'quiet', 'turn off sound'],
    description: {
      ko: 'TTS 음성 응답 끄기',
      en: 'Turn off text-to-speech',
    },
    confirmationMessage: {
      ko: '음성을 껐습니다.',
      en: 'Sound muted.',
    },
  },
  {
    type: 'unmute',
    koreanAliases: ['소리켜', '소리 켜', '음성켜', '음성 켜', '음소거해제'],
    englishAliases: ['unmute', 'sound on', 'turn on sound', 'speak'],
    description: {
      ko: 'TTS 음성 응답 켜기',
      en: 'Turn on text-to-speech',
    },
    confirmationMessage: {
      ko: '음성을 켰습니다.',
      en: 'Sound unmuted.',
    },
  },
  {
    type: 'stop_listening',
    koreanAliases: ['듣기중지', '듣기 중지', '그만', '멈춰', '정지', '음성인식중지'],
    englishAliases: ['stop listening', 'stop', 'pause listening'],
    description: {
      ko: '음성 인식 중지',
      en: 'Stop voice recognition',
    },
    confirmationMessage: {
      ko: '음성 인식을 중지했습니다.',
      en: 'Voice recognition stopped.',
    },
  },
  {
    type: 'start_listening',
    koreanAliases: ['듣기시작', '듣기 시작', '시작', '음성인식시작'],
    englishAliases: ['start listening', 'listen', 'start'],
    description: {
      ko: '음성 인식 시작',
      en: 'Start voice recognition',
    },
    confirmationMessage: {
      ko: '음성 인식을 시작합니다.',
      en: 'Voice recognition started.',
    },
  },
  {
    type: 'repeat',
    koreanAliases: ['다시', '반복', '다시말해', '다시 말해', '한번더'],
    englishAliases: ['repeat', 'say again', 'again'],
    description: {
      ko: '마지막 응답 반복',
      en: 'Repeat last response',
    },
    confirmationMessage: {
      ko: '다시 말씀드리겠습니다.',
      en: 'Repeating...',
    },
  },
  {
    type: 'slower',
    koreanAliases: ['천천히', '느리게', '속도낮춰', '속도 낮춰'],
    englishAliases: ['slower', 'slow down', 'decrease speed'],
    description: {
      ko: '음성 속도 느리게',
      en: 'Decrease voice speed',
    },
    confirmationMessage: {
      ko: '속도를 낮췄습니다.',
      en: 'Speed decreased.',
    },
  },
  {
    type: 'faster',
    koreanAliases: ['빠르게', '빨리', '속도높여', '속도 높여'],
    englishAliases: ['faster', 'speed up', 'increase speed'],
    description: {
      ko: '음성 속도 빠르게',
      en: 'Increase voice speed',
    },
    confirmationMessage: {
      ko: '속도를 높였습니다.',
      en: 'Speed increased.',
    },
  },
];

/**
 * 음성 명령어 감지 결과
 */
export interface VoiceCommandDetectionResult {
  isCommand: boolean;
  command?: VoiceCommand;
  originalTranscript: string;
}

/**
 * 음성 입력에서 명령어 감지
 * @param transcript 음성 인식된 텍스트
 * @param language 현재 언어 설정 (ko-KR, en-GB 등)
 * @returns 명령어 감지 결과
 */
export function detectVoiceCommand(
  transcript: string,
  language: string
): VoiceCommandDetectionResult {
  const normalizedTranscript = transcript.toLowerCase().trim();
  const isKorean = language.startsWith('ko');

  // 각 명령어에 대해 매칭 검사
  for (const command of VOICE_COMMANDS) {
    const aliases = isKorean ? command.koreanAliases : command.englishAliases;

    for (const alias of aliases) {
      const normalizedAlias = alias.toLowerCase();

      // 정확한 매칭 또는 포함 검사
      if (
        normalizedTranscript === normalizedAlias ||
        normalizedTranscript.includes(normalizedAlias)
      ) {
        console.log(`🎤 Voice command detected: ${command.type} (${alias})`);
        return {
          isCommand: true,
          command,
          originalTranscript: transcript,
        };
      }
    }
  }

  // 명령어가 아님
  return {
    isCommand: false,
    originalTranscript: transcript,
  };
}

/**
 * 확인 메시지 가져오기
 * @param command 음성 명령어
 * @param language 현재 언어 설정
 * @returns 확인 메시지
 */
export function getConfirmationMessage(
  command: VoiceCommand,
  language: string
): string {
  const isKorean = language.startsWith('ko');
  return isKorean ? command.confirmationMessage.ko : command.confirmationMessage.en;
}

/**
 * 음성 속도 조정 계산
 * @param currentSpeed 현재 속도 (0.5 ~ 2.0)
 * @param adjustment 'slower' | 'faster'
 * @returns 조정된 속도
 */
export function adjustVoiceSpeed(
  currentSpeed: number,
  adjustment: 'slower' | 'faster'
): number {
  const SPEED_STEP = 0.1;
  const MIN_SPEED = 0.5;
  const MAX_SPEED = 2.0;

  let newSpeed = currentSpeed;

  if (adjustment === 'slower') {
    newSpeed = Math.max(MIN_SPEED, currentSpeed - SPEED_STEP);
  } else if (adjustment === 'faster') {
    newSpeed = Math.min(MAX_SPEED, currentSpeed + SPEED_STEP);
  }

  // 소수점 한 자리로 반올림
  return Math.round(newSpeed * 10) / 10;
}

/**
 * 명령어 도움말 메시지 생성
 * @param language 현재 언어 설정
 * @returns 도움말 메시지
 */
export function getVoiceCommandHelp(language: string): string {
  const isKorean = language.startsWith('ko');

  if (isKorean) {
    return `
📢 음성 명령어 사용 가능:
• 음소거 - TTS 끄기
• 소리켜 - TTS 켜기
• 그만 - 음성 인식 중지
• 시작 - 음성 인식 시작
• 다시 - 마지막 응답 반복
• 천천히 - 음성 속도 느리게
• 빠르게 - 음성 속도 빠르게
    `.trim();
  }

  return `
📢 Voice commands available:
• Mute - Turn off TTS
• Unmute - Turn on TTS
• Stop - Stop voice recognition
• Start - Start voice recognition
• Repeat - Repeat last response
• Slower - Decrease voice speed
• Faster - Increase voice speed
  `.trim();
}
