# 🎤 영어/수학 튜터 음성인식 기능 개선 계획서

**작성일**: 2025-11-03
**버전**: 1.0
**목적**: 전 세계 에듀테크 벤치마킹 기반 과목별 최적화된 음성인식 기능 구현

---

## 📊 Executive Summary

### 벤치마킹 인사이트 요약

| 서비스 | 핵심 기능 | 적용 가능 인사이트 |
|--------|----------|------------------|
| **ELSA Speak** | 실시간 발음 피드백 (90% 정확도) | ✅ 영어 튜터에 음성 품질 분석 적용 |
| **Duolingo** | AI 기반 대화형 학습, Video Call | ✅ Always-On 모드로 자연스러운 대화 |
| **Khan Academy** | Khanmigo AI 튜터 ($4/월) | ✅ 텍스트+음성 하이브리드 인터페이스 |
| **Voice UX Research** | Push-to-Talk vs Always-Listening | ✅ 과목별 최적 모드 차별화 |

### 핵심 개선 방향

1. **과목별 기본 설정 차별화**
   - 수학: Korean + Push-to-Talk (정확한 수식 입력 우선)
   - 영어: English (UK) + Always-On (자연스러운 회화 우선)

2. **음성 명령어 제어 시스템**
   - "Speaking Voice" / "Mute" 음성 명령어로 TTS On/Off
   - 핸즈프리 학습 환경 구축

3. **Always Listening 고도화**
   - 실시간 음성 활동 감지 (VAD)
   - 자동 침묵 구간 감지 및 전송
   - 배경 소음 필터링

4. **Playwright 자동화 테스트**
   - 음성인식 시나리오 테스트
   - 과목별 설정 검증
   - 음성 명령어 통합 테스트

---

## 🎯 Phase 1: 과목별 기본 설정 차별화 (P0 - Critical)

### 1.1 수학 튜터 기본 설정

**요구사항**:
- ✅ Input Language: Korean (ko-KR)
- ✅ Input Mode: Push-to-Talk (기본값)
- ✅ 음성인식 자동 시작: 비활성화 (클릭해야 시작)
- ✅ 수학 용어 및 수식 인식 최적화

**구현 전략**:
```typescript
// DEFAULT_VOICE_SETTINGS 오버라이드 (subject 기반)
export function getSubjectDefaultSettings(subject: 'english' | 'math'): VoiceSettingsConfig {
  const baseSettings = { ...DEFAULT_VOICE_SETTINGS };

  if (subject === 'math') {
    return {
      ...baseSettings,
      inputMode: 'push-to-talk',           // Push-to-Talk 기본값
      inputLanguage: 'ko-KR',               // 한국어
      autoPlayResponses: true,
      outputLanguage: 'ko-KR',
      noiseSuppression: true,               // 수식 읽을 때 정확성 중요
      echoCancellation: true,
    };
  }

  // English tutor settings...
}
```

**사용자 경험**:
1. 수학 튜터 접속 → 음성인식 버튼 비활성 상태
2. 사용자가 버튼 클릭 → Push-to-Talk 모드 활성화
3. 버튼 누르는 동안 음성 인식
4. 버튼 놓으면 자동 전송

**수학 특화 최적화**:
- 수식 읽기 패턴 인식 ("X squared plus 2X minus 1")
- 한국어 수학 용어 ("이차방정식", "미분", "적분")
- 숫자 연속 입력 정확도 개선

---

### 1.2 영어 튜터 기본 설정

**요구사항**:
- ✅ Input Language: English (UK) (en-GB)
- ✅ Input Mode: Always-On (기본값)
- ✅ 음성인식 자동 시작: 활성화 (페이지 로드 시 자동 시작)
- ✅ 영어 회화 학습 최적화

**구현 전략**:
```typescript
export function getSubjectDefaultSettings(subject: 'english' | 'math'): VoiceSettingsConfig {
  const baseSettings = { ...DEFAULT_VOICE_SETTINGS };

  if (subject === 'english') {
    return {
      ...baseSettings,
      inputMode: 'continuous',              // Always-On 기본값
      inputLanguage: 'en-GB',                // English (UK)
      autoPlayResponses: true,
      outputLanguage: 'en-GB',               // 영국 발음으로 응답
      repeatUserInput: false,                // 회화 흐름 유지
      noiseSuppression: true,
      echoCancellation: true,
    };
  }

  return baseSettings;
}
```

**사용자 경험**:
1. 영어 튜터 접속 → 즉시 "Always Listening" 모드 활성화
2. 실시간 음성 파형 애니메이션 표시
3. 사용자 발화 시작 → 자동 감지
4. 2초 침묵 → 자동 전송
5. 클릭하면 음성인식 중지 (토글)

**영어 특화 최적화**:
- 영국 영어 발음 패턴 인식
- 연음, 축약형 정확도 개선 ("I'm", "you're", "won't")
- 발음 실수 실시간 피드백 (ELSA Speak 방식)

---

## 🗣️ Phase 2: 음성 명령어 제어 시스템 (P0 - Critical)

### 2.1 음성 명령어 처리 로직

**지원 명령어**:
| 명령어 | 영어 | 한국어 | 기능 | 우선순위 |
|--------|------|--------|------|---------|
| Speaking Voice | "Speaking Voice" | "말하기 시작" | TTS 켜기 | P0 |
| Mute | "Mute" | "음소거" | TTS 끄기 | P0 |
| Stop Listening | "Stop Listening" | "듣기 중지" | 음성인식 중지 | P1 |
| Start Listening | "Start Listening" | "듣기 시작" | 음성인식 시작 | P1 |
| Repeat | "Repeat" | "다시 말해" | 마지막 응답 재생 | P2 |
| Slower | "Speak Slower" | "천천히" | TTS 속도 감소 | P2 |
| Faster | "Speak Faster" | "빠르게" | TTS 속도 증가 | P2 |

**구현 전략**:
```typescript
// lib/voice/voice-command-processor.ts (신규 생성)

export interface VoiceCommand {
  command: string;
  aliases: string[];    // 다양한 표현 지원
  action: VoiceCommandAction;
  subjects?: ('english' | 'math' | 'both')[];  // 과목별 활성화
}

export type VoiceCommandAction =
  | 'toggle_tts'
  | 'enable_tts'
  | 'disable_tts'
  | 'stop_listening'
  | 'start_listening'
  | 'repeat_last'
  | 'adjust_speed';

export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    command: 'speaking_voice',
    aliases: ['speaking voice', 'speak', 'voice on', '말하기 시작', '음성 켜'],
    action: 'enable_tts',
    subjects: ['both'],
  },
  {
    command: 'mute',
    aliases: ['mute', 'silence', 'voice off', '음소거', '조용히', '음성 끄기'],
    action: 'disable_tts',
    subjects: ['both'],
  },
  {
    command: 'stop_listening',
    aliases: ['stop listening', 'pause', '듣기 중지', '멈춰'],
    action: 'stop_listening',
    subjects: ['both'],
  },
  {
    command: 'start_listening',
    aliases: ['start listening', 'listen', '듣기 시작', '들어'],
    action: 'start_listening',
    subjects: ['english'], // 영어 튜터만
  },
  {
    command: 'repeat',
    aliases: ['repeat', 'say again', '다시', '다시 말해', '반복'],
    action: 'repeat_last',
    subjects: ['both'],
  },
  {
    command: 'slower',
    aliases: ['speak slower', 'slow down', '천천히', '느리게'],
    action: 'adjust_speed',
    subjects: ['both'],
  },
  {
    command: 'faster',
    aliases: ['speak faster', 'speed up', '빠르게', '빨리'],
    action: 'adjust_speed',
    subjects: ['both'],
  },
];

/**
 * 음성 입력에서 명령어 감지
 */
export function detectVoiceCommand(
  transcript: string,
  subject: 'english' | 'math'
): VoiceCommand | null {
  const normalizedTranscript = transcript.toLowerCase().trim();

  for (const command of VOICE_COMMANDS) {
    // 과목 필터링
    if (command.subjects && !command.subjects.includes('both') && !command.subjects.includes(subject)) {
      continue;
    }

    // 명령어 매칭 (정확한 일치 또는 포함)
    for (const alias of command.aliases) {
      if (normalizedTranscript === alias || normalizedTranscript.includes(alias)) {
        return command;
      }
    }
  }

  return null;
}

/**
 * 명령어 실행
 */
export function executeVoiceCommand(
  command: VoiceCommand,
  context: {
    setVoiceSettings: (settings: VoiceSettingsConfig) => void;
    voiceSettings: VoiceSettingsConfig;
    speak: (text: string) => void;
    stop: () => void;
    startListening: () => void;
    stopListening: () => void;
    lastMessage: string;
  }
): boolean {
  const { action } = command;
  const { setVoiceSettings, voiceSettings, speak, stop, startListening, stopListening, lastMessage } = context;

  switch (action) {
    case 'enable_tts':
      setVoiceSettings({ ...voiceSettings, autoPlayResponses: true });
      speak('음성이 켜졌습니다'); // 확인 메시지
      return true;

    case 'disable_tts':
      speak('음성을 끕니다'); // 마지막 TTS
      setTimeout(() => {
        setVoiceSettings({ ...voiceSettings, autoPlayResponses: false });
        stop();
      }, 2000);
      return true;

    case 'stop_listening':
      stopListening();
      speak('듣기를 중지합니다');
      return true;

    case 'start_listening':
      startListening();
      speak('듣기를 시작합니다');
      return true;

    case 'repeat_last':
      if (lastMessage) {
        speak(lastMessage);
      }
      return true;

    case 'adjust_speed':
      const newSpeed = command.command === 'slower'
        ? Math.max(0.5, voiceSettings.voiceSpeed - 0.2)
        : Math.min(2.0, voiceSettings.voiceSpeed + 0.2);
      setVoiceSettings({ ...voiceSettings, voiceSpeed: newSpeed });
      speak(`속도를 ${newSpeed.toFixed(1)}배로 조정했습니다`);
      return true;

    default:
      return false;
  }
}
```

### 2.2 SimpleChatInterface 통합

```typescript
// components/tutor-pages/SimpleChatInterface.tsx (수정)

import { detectVoiceCommand, executeVoiceCommand } from '@/lib/voice/voice-command-processor';

// handleSubmit 함수 내부 (라인 256 근처)
const handleSubmit = async (e?: React.FormEvent, messageText?: string) => {
  e?.preventDefault();

  const userMessage = messageText || input.trim();
  if (!userMessage || isLoading) return;

  // 🆕 음성 명령어 감지
  const voiceCommand = detectVoiceCommand(userMessage, subject);

  if (voiceCommand) {
    console.log('🎙️ Voice command detected:', voiceCommand.command);

    const executed = executeVoiceCommand(voiceCommand, {
      setVoiceSettings,
      voiceSettings,
      speak,
      stop,
      startListening: () => {/* ContinuousVoiceInput 제어 */},
      stopListening: () => {/* ContinuousVoiceInput 제어 */},
      lastMessage: messages[messages.length - 1]?.content || '',
    });

    if (executed) {
      setInput('');
      return; // 명령어 처리 완료, API 호출하지 않음
    }
  }

  // 기존 로직...
};
```

---

## 🚀 Phase 3: Always Listening 고도화 (P1 - High Priority)

### 3.1 실시간 음성 활동 감지 (VAD)

**목표**: ELSA Speak 수준의 정확한 음성/침묵 구분

**현재 문제점**:
- 단순 타이머 기반 침묵 감지 (부정확)
- 배경 소음에 민감
- 발화 중간의 짧은 휴지도 전송 트리거

**개선 방안**:
```typescript
// lib/voice/voice-activity-detector.ts (신규 생성)

export class VoiceActivityDetector {
  private audioContext: AudioContext;
  private analyzer: AnalyserNode;
  private dataArray: Uint8Array;
  private stream: MediaStream | null = null;

  // VAD 파라미터
  private readonly ENERGY_THRESHOLD = 0.02;        // 음성 에너지 임계값
  private readonly ZERO_CROSSING_THRESHOLD = 0.3;  // Zero-crossing rate
  private readonly MIN_SPEECH_DURATION = 300;      // 최소 발화 시간 (ms)
  private readonly MAX_SILENCE_DURATION = 2000;    // 최대 침묵 시간 (ms)

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 2048;
    this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
  }

  async initialize(stream: MediaStream): Promise<void> {
    this.stream = stream;
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyzer);
  }

  /**
   * 음성 에너지 레벨 계산
   */
  private getEnergyLevel(): number {
    this.analyzer.getByteTimeDomainData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    return Math.sqrt(sum / this.dataArray.length);
  }

  /**
   * Zero-crossing rate 계산 (음성/소음 구분)
   */
  private getZeroCrossingRate(): number {
    this.analyzer.getByteTimeDomainData(this.dataArray);

    let crossings = 0;
    for (let i = 1; i < this.dataArray.length; i++) {
      if (
        (this.dataArray[i] >= 128 && this.dataArray[i - 1] < 128) ||
        (this.dataArray[i] < 128 && this.dataArray[i - 1] >= 128)
      ) {
        crossings++;
      }
    }

    return crossings / this.dataArray.length;
  }

  /**
   * 음성 활동 감지
   */
  isSpeaking(): boolean {
    const energy = this.getEnergyLevel();
    const zcr = this.getZeroCrossingRate();

    // 음성: 높은 에너지 + 적절한 zero-crossing rate
    // 소음: 높은 에너지 + 매우 높은 zero-crossing rate
    return energy > this.ENERGY_THRESHOLD && zcr < this.ZERO_CROSSING_THRESHOLD;
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.audioContext.close();
  }
}
```

### 3.2 ContinuousVoiceInput 개선

```typescript
// components/voice/ContinuousVoiceInput.tsx (수정)

import { VoiceActivityDetector } from '@/lib/voice/voice-activity-detector';

export function ContinuousVoiceInput(props: ContinuousVoiceInputProps) {
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'silence'>('idle');

  // VAD 초기화
  useEffect(() => {
    if (isActive && !vadRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(async (stream) => {
          const vad = new VoiceActivityDetector();
          await vad.initialize(stream);
          vadRef.current = vad;

          // 실시간 VAD 모니터링
          const vadInterval = setInterval(() => {
            if (vad.isSpeaking()) {
              setSpeechState('speaking');
              setLastSpeechTime(Date.now());
            } else {
              setSpeechState('silence');
            }
          }, 100); // 100ms 간격으로 체크

          return () => clearInterval(vadInterval);
        });
    }

    return () => {
      vadRef.current?.cleanup();
      vadRef.current = null;
    };
  }, [isActive]);

  // 개선된 침묵 감지 로직
  useEffect(() => {
    if (!isActive || !autoSend || !transcript.trim()) return;

    const checkSilence = setInterval(() => {
      const timeSinceLastSpeech = Date.now() - lastSpeechTime;

      // VAD 기반 침묵 확인
      if (
        speechState === 'silence' &&
        timeSinceLastSpeech > silenceThreshold &&
        transcript.trim()
      ) {
        console.log('🤐 Smart VAD: Silence detected, sending transcript');
        onTranscript?.(transcript.trim());
        resetTranscript();
        setLastSpeechTime(Date.now());
      }
    }, 200); // 더 짧은 간격으로 체크

    return () => clearInterval(checkSilence);
  }, [isActive, autoSend, transcript, lastSpeechTime, silenceThreshold, speechState]);
}
```

### 3.3 배경 소음 필터링

**Web Audio API 활용**:
```typescript
// lib/voice/noise-suppression.ts (신규 생성)

export class NoiseSuppressionFilter {
  private audioContext: AudioContext;
  private noiseGate: DynamicsCompressorNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Noise Gate 설정
    this.noiseGate = this.audioContext.createDynamicsCompressor();
    this.noiseGate.threshold.setValueAtTime(-50, this.audioContext.currentTime); // dB
    this.noiseGate.knee.setValueAtTime(40, this.audioContext.currentTime);
    this.noiseGate.ratio.setValueAtTime(12, this.audioContext.currentTime);
    this.noiseGate.attack.setValueAtTime(0, this.audioContext.currentTime);
    this.noiseGate.release.setValueAtTime(0.25, this.audioContext.currentTime);
  }

  applyFilter(stream: MediaStream): MediaStream {
    const source = this.audioContext.createMediaStreamSource(stream);
    const destination = this.audioContext.createMediaStreamDestination();

    source.connect(this.noiseGate);
    this.noiseGate.connect(destination);

    return destination.stream;
  }
}
```

---

## 🧪 Phase 4: Playwright 자동화 테스트 (P1 - High Priority)

### 4.1 테스트 전략

**테스트 범위**:
1. ✅ 과목별 기본 설정 검증
2. ✅ 음성 명령어 처리 검증
3. ✅ Always-On vs Push-to-Talk 동작 검증
4. ✅ 음성인식 자동 시작/중지 검증
5. ✅ 언어 설정 검증

### 4.2 테스트 파일 구조

```
tests/e2e/voice-recognition/
├── math-tutor-voice.spec.ts          # 수학 튜터 음성인식 테스트
├── english-tutor-voice.spec.ts       # 영어 튜터 음성인식 테스트
├── voice-commands.spec.ts            # 음성 명령어 테스트
├── always-listening.spec.ts          # Always Listening 모드 테스트
└── voice-settings.spec.ts            # 음성 설정 UI 테스트
```

### 4.3 수학 튜터 음성인식 테스트

```typescript
// tests/e2e/voice-recognition/math-tutor-voice.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Math Tutor Voice Recognition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/math');
    await page.waitForLoadState('networkidle');
  });

  test('기본 설정: Korean + Push-to-Talk', async ({ page }) => {
    // 음성 설정 패널 열기
    await page.click('[aria-label="Open voice settings"]');
    await page.waitForSelector('h2:has-text("Voice Settings")');

    // Input Language 확인
    const inputLanguage = await page.locator('select[value*="inputLanguage"]').inputValue();
    expect(inputLanguage).toBe('ko-KR');

    // Input Mode 확인
    const pushToTalkRadio = await page.locator('input[value="push-to-talk"]');
    await expect(pushToTalkRadio).toBeChecked();

    // Output Language 확인
    const outputLanguage = await page.locator('select').nth(1).inputValue();
    expect(outputLanguage).toBe('ko-KR');
  });

  test('음성인식 자동 시작 비활성화', async ({ page }) => {
    // Continuous Voice Input 컴포넌트가 렌더링되지 않아야 함
    const continuousVoice = page.locator('button:has-text("Always Listening")');
    await expect(continuousVoice).not.toBeVisible();

    // Push-to-Talk 버튼만 표시
    const pttButton = page.locator('[aria-label*="Push to talk"], [aria-label*="Hold to speak"]');
    await expect(pttButton).toBeVisible();
  });

  test('Push-to-Talk 동작', async ({ page, context }) => {
    // 마이크 권한 부여
    await context.grantPermissions(['microphone']);

    // Push-to-Talk 버튼 찾기
    const pttButton = page.locator('[aria-label*="Hold to speak"]').first();
    await expect(pttButton).toBeVisible();

    // 버튼 누르기 시작
    await pttButton.dispatchEvent('mousedown');

    // "Listening" 상태 확인
    await page.waitForSelector('[aria-label*="Listening"]', { timeout: 3000 });

    // 버튼 놓기
    await pttButton.dispatchEvent('mouseup');

    // "Processing" 상태로 전환 확인
    await page.waitForSelector('[aria-label*="Processing"]', { timeout: 2000 });
  });

  test('수학 용어 인식 테스트', async ({ page, context }) => {
    // 이 테스트는 실제 음성 입력 시뮬레이션 필요
    // Speech Recognition API Mock 사용

    await page.addInitScript(() => {
      // @ts-ignore
      window.mockSpeechRecognition = {
        transcript: '이차방정식 x제곱 더하기 2x 빼기 1을 풀어주세요',
        language: 'ko-KR',
      };
    });

    // PTT 버튼 클릭하여 mock 트랜스크립트 전송
    const pttButton = page.locator('[aria-label*="Hold to speak"]').first();
    await pttButton.click();

    // 사용자 메시지가 제대로 전송되었는지 확인
    await expect(page.locator('.bg-blue-500:has-text("이차방정식")')).toBeVisible({ timeout: 5000 });
  });
});
```

### 4.4 영어 튜터 음성인식 테스트

```typescript
// tests/e2e/voice-recognition/english-tutor-voice.spec.ts

import { test, expect } from '@playwright/test';

test.describe('English Tutor Voice Recognition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tutor/english');
    await page.waitForLoadState('networkidle');
  });

  test('기본 설정: English (UK) + Always-On', async ({ page }) => {
    // 음성 설정 패널 열기
    await page.click('[aria-label="Open voice settings"]');
    await page.waitForSelector('h2:has-text("Voice Settings")');

    // Input Language 확인
    const inputLanguage = await page.locator('select').first().inputValue();
    expect(inputLanguage).toBe('en-GB');

    // Input Mode 확인 (Continuous = Always-On)
    const continuousRadio = await page.locator('input[value="continuous"]');
    await expect(continuousRadio).toBeChecked();

    // Output Language 확인
    const outputLanguage = await page.locator('select').nth(1).inputValue();
    expect(outputLanguage).toBe('en-GB');
  });

  test('음성인식 자동 시작', async ({ page, context }) => {
    // 마이크 권한 부여
    await context.grantPermissions(['microphone']);

    // Continuous Voice Input이 자동으로 활성화되어야 함
    const continuousButton = page.locator('button:has-text("Always Listening")');

    // 페이지 로드 후 5초 이내에 Always Listening 활성화 확인
    await expect(continuousButton).toBeVisible({ timeout: 5000 });

    // LIVE 인디케이터 확인
    const liveIndicator = page.locator('text=LIVE');
    await expect(liveIndicator).toBeVisible();
  });

  test('Always-On 모드 토글', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);

    // Always Listening 버튼 찾기
    const alwaysListeningBtn = page.locator('button:has-text("Always Listening")');
    await expect(alwaysListeningBtn).toBeVisible({ timeout: 5000 });

    // 클릭하여 중지
    await alwaysListeningBtn.click();

    // "Start Continuous Mode" 버튼으로 변경 확인
    await expect(page.locator('button:has-text("Start Continuous Mode")')).toBeVisible({ timeout: 3000 });

    // 다시 클릭하여 시작
    await page.locator('button:has-text("Start Continuous Mode")').click();

    // "Always Listening" 으로 복구 확인
    await expect(alwaysListeningBtn).toBeVisible({ timeout: 3000 });
  });

  test('실시간 음성 파형 애니메이션', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);

    // Always Listening 활성화 대기
    await page.waitForSelector('button:has-text("Always Listening")', { timeout: 5000 });

    // 파형 애니메이션 컨테이너 확인
    const waveformContainer = page.locator('.h-12').filter({ has: page.locator('.bg-gradient-to-t') });
    await expect(waveformContainer).toBeVisible();

    // 30개의 파형 바 확인
    const waveformBars = waveformContainer.locator('.flex-1.bg-gradient-to-t');
    await expect(waveformBars).toHaveCount(30);
  });

  test('자동 침묵 감지 및 전송', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);

    // Mock Speech Recognition
    await page.addInitScript(() => {
      // @ts-ignore
      window.mockSpeechRecognition = {
        transcript: 'Hello, how are you today?',
        language: 'en-GB',
        autoSendAfterSilence: 2000, // 2초 후 자동 전송
      };
    });

    // Always Listening 활성화 대기
    await page.waitForSelector('button:has-text("Always Listening")', { timeout: 5000 });

    // 트랜스크립트가 표시될 때까지 대기
    await expect(page.locator('text=Hello, how are you today?')).toBeVisible({ timeout: 8000 });

    // 2초 후 메시지가 전송되었는지 확인 (사용자 메시지 bubble)
    await expect(page.locator('.bg-blue-500:has-text("Hello, how are you today?")')).toBeVisible({ timeout: 3000 });
  });
});
```

### 4.5 음성 명령어 테스트

```typescript
// tests/e2e/voice-recognition/voice-commands.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Voice Commands', () => {
  test.describe('Math Tutor', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tutor/math');
      await page.waitForLoadState('networkidle');
    });

    test('"Speaking Voice" 명령어 - TTS 켜기', async ({ page }) => {
      // TTS 끄기
      await page.click('[aria-label*="Disable text-to-speech"]');

      // "Speaking Voice" 입력 시뮬레이션
      await page.fill('input[placeholder*="메시지"]', 'Speaking Voice');
      await page.press('input[placeholder*="메시지"]', 'Enter');

      // TTS 활성화 확인
      await expect(page.locator('[aria-label*="Disable text-to-speech"]')).toBeVisible({ timeout: 3000 });

      // 확인 메시지 확인
      await expect(page.locator('text=음성이 켜졌습니다')).toBeVisible();
    });

    test('"Mute" 명령어 - TTS 끄기', async ({ page }) => {
      // "Mute" 입력
      await page.fill('input[placeholder*="메시지"]', 'Mute');
      await page.press('input[placeholder*="메시지"]', 'Enter');

      // TTS 비활성화 확인 (2초 후)
      await page.waitForTimeout(2500);
      await expect(page.locator('[aria-label*="Enable text-to-speech"]')).toBeVisible();
    });

    test('한국어 음성 명령어 - "음소거"', async ({ page }) => {
      await page.fill('input[placeholder*="메시지"]', '음소거');
      await page.press('input[placeholder*="메시지"]', 'Enter');

      await page.waitForTimeout(2500);
      await expect(page.locator('[aria-label*="Enable text-to-speech"]')).toBeVisible();
    });
  });

  test.describe('English Tutor', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tutor/english');
      await page.waitForLoadState('networkidle');
    });

    test('"Stop Listening" 명령어', async ({ page, context }) => {
      await context.grantPermissions(['microphone']);

      // Always Listening 활성화 대기
      await page.waitForSelector('button:has-text("Always Listening")', { timeout: 5000 });

      // "Stop Listening" 입력
      await page.fill('input[placeholder*="메시지"]', 'Stop Listening');
      await page.press('input[placeholder*="메시지"]', 'Enter');

      // Continuous mode 중지 확인
      await expect(page.locator('button:has-text("Start Continuous Mode")')).toBeVisible({ timeout: 3000 });
    });

    test('"Repeat" 명령어 - 마지막 응답 재생', async ({ page }) => {
      // 이전 대화 시뮬레이션
      await page.fill('input[placeholder*="메시지"]', 'Hello');
      await page.press('input[placeholder*="메시지"]', 'Enter');

      // 튜터 응답 대기
      await page.waitForSelector('.bg-white:has-text("Hello")', { timeout: 10000 });

      // "Repeat" 명령
      await page.fill('input[placeholder*="메시지"]', 'Repeat');
      await page.press('input[placeholder*="메시지"]', 'Enter');

      // TTS 재생 확인 (speak 함수 호출 체크)
      // Note: 실제 음성 재생은 브라우저 TTS API에 의존하므로 함수 호출만 검증
    });

    test('"Speak Slower" 명령어 - 속도 감소', async ({ page }) => {
      // 음성 설정 열기
      await page.click('[aria-label="Open voice settings"]');

      // 현재 속도 확인
      const initialSpeed = await page.locator('input[type="range"]').first().inputValue();

      // 설정 닫기
      await page.click('[aria-label="Close settings"]');

      // "Speak Slower" 입력
      await page.fill('input[placeholder*="메시지"]', 'Speak Slower');
      await page.press('input[placeholder*="메시지"]', 'Enter');

      // 속도 변경 확인
      await page.click('[aria-label="Open voice settings"]');
      const newSpeed = await page.locator('input[type="range"]').first().inputValue();

      expect(parseFloat(newSpeed)).toBeLessThan(parseFloat(initialSpeed));
    });
  });
});
```

### 4.6 통합 테스트 실행 스크립트

```json
// package.json (scripts 추가)

{
  "scripts": {
    "test:voice": "playwright test tests/e2e/voice-recognition --project=chromium",
    "test:voice:math": "playwright test tests/e2e/voice-recognition/math-tutor-voice.spec.ts",
    "test:voice:english": "playwright test tests/e2e/voice-recognition/english-tutor-voice.spec.ts",
    "test:voice:commands": "playwright test tests/e2e/voice-recognition/voice-commands.spec.ts",
    "test:voice:all": "playwright test tests/e2e/voice-recognition --project=chromium --project=firefox --project=webkit"
  }
}
```

---

## 📈 Phase 5: 사용 편의성 최적화 (P2 - Medium Priority)

### 5.1 시각적 피드백 개선

**현재 상태**:
- ✅ 음성 파형 애니메이션 (30개 바)
- ✅ LIVE 인디케이터
- ✅ 버튼 펄스 효과

**개선 방안**:
1. **음성 에너지 레벨 표시**
   - 실시간 dB 미터
   - 색상 코드: 초록(적정) / 노랑(낮음) / 빨강(과다)

2. **인터랙티브 튜토리얼**
   - 첫 방문자를 위한 음성인식 가이드
   - "Try saying 'Hello'" 같은 프롬프트

3. **음성 품질 인디케이터**
   - 마이크 품질: Good / Fair / Poor
   - 배경 소음 레벨 표시

### 5.2 접근성 개선

**WCAG 2.1 AA 준수**:
```typescript
// 모든 음성 컨트롤에 적절한 ARIA 레이블
<button
  aria-label="Start voice recognition in push-to-talk mode"
  aria-pressed={isListening}
  aria-live="polite"
  aria-atomic="true"
>
  {isListening ? 'Listening' : 'Hold to speak'}
</button>

// 음성 상태 변경 시 스크린 리더 알림
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {isListening && 'Voice recognition is now active'}
  {!isListening && 'Voice recognition stopped'}
</div>
```

### 5.3 오프라인 모드 지원

**Web Speech API 한계**:
- 온라인 연결 필수
- 오프라인 시 대체 UI 제공

```typescript
// 오프라인 감지
useEffect(() => {
  const handleOffline = () => {
    if (voiceSettings.inputMode !== 'disabled') {
      setVoiceSettings({ ...voiceSettings, inputMode: 'disabled' });
      alert('인터넷 연결이 끊겼습니다. 음성인식 기능이 일시 중지됩니다.');
    }
  };

  window.addEventListener('offline', handleOffline);
  return () => window.removeEventListener('offline', handleOffline);
}, [voiceSettings]);
```

---

## 🎓 사용자 교육 및 온보딩

### 6.1 튜터별 온보딩 메시지

**수학 튜터**:
```typescript
const mathTutorOnboarding = {
  title: '🎤 수학 튜터 음성 기능 안내',
  steps: [
    {
      title: 'Push-to-Talk 모드',
      description: '버튼을 눌러 말하고, 놓으면 자동으로 전송됩니다.',
      visual: '<마이크 버튼 애니메이션>',
    },
    {
      title: '수학 용어 정확하게',
      description: '"x제곱", "미분", "적분" 등 수학 용어를 천천히 명확하게 말해주세요.',
      example: '"이차방정식 x제곱 더하기 2x 빼기 1"',
    },
    {
      title: '음성 명령어',
      description: '"음소거"라고 말하면 음성이 꺼집니다.',
      commands: ['음소거', '말하기 시작', '다시 말해'],
    },
  ],
};
```

**영어 튜터**:
```typescript
const englishTutorOnboarding = {
  title: '🎤 English Tutor Voice Features',
  steps: [
    {
      title: 'Always Listening Mode',
      description: 'Speak naturally. I\'m always listening for your voice!',
      visual: '<파형 애니메이션>',
    },
    {
      title: 'Auto-send on Silence',
      description: 'Your message will be sent automatically after 2 seconds of silence.',
      tip: 'No need to press any buttons!',
    },
    {
      title: 'Voice Commands',
      description: 'Control with your voice: "Mute", "Repeat", "Speak slower"',
      commands: ['Mute', 'Speaking Voice', 'Repeat', 'Speak slower'],
    },
  ],
};
```

---

## 📊 성능 및 모니터링

### 7.1 음성인식 메트릭

**수집 데이터**:
```typescript
interface VoiceRecognitionMetrics {
  // 사용 통계
  totalSessions: number;
  averageSessionDuration: number;
  pushToTalkUsage: number;
  continuousUsage: number;

  // 정확도 메트릭
  recognitionAccuracy: number;
  commandRecognitionRate: number;
  averageConfidenceScore: number;

  // 사용자 행동
  manualCorrections: number;
  voiceCommandUsage: Record<string, number>;
  averageMessageLength: number;

  // 기술 메트릭
  averageRecognitionLatency: number;
  errorRate: number;
  silenceDetectionAccuracy: number;
}
```

### 7.2 A/B 테스트

**테스트 시나리오**:
1. **수학 튜터: Push-to-Talk vs Continuous**
   - 50% 사용자 → Push-to-Talk 기본값
   - 50% 사용자 → Continuous 기본값
   - 측정: 사용자 선호도, 전환율, 학습 효율

2. **침묵 임계값 최적화**
   - A: 1.5초
   - B: 2.0초
   - C: 2.5초
   - 측정: 오전송률, 사용자 만족도

---

## 🚀 배포 계획

### Phase별 배포 일정

| Phase | 기능 | 우선순위 | 예상 시간 | 배포 타겟 |
|-------|------|---------|----------|----------|
| Phase 1 | 과목별 기본 설정 차별화 | P0 | 4-6시간 | Week 1 |
| Phase 2 | 음성 명령어 시스템 | P0 | 6-8시간 | Week 1 |
| Phase 3 | Always Listening 고도화 | P1 | 8-10시간 | Week 2 |
| Phase 4 | Playwright 테스트 | P1 | 6-8시간 | Week 2 |
| Phase 5 | 사용 편의성 최적화 | P2 | 4-6시간 | Week 3 |

### 전체 예상 소요 시간: **28-38시간**

---

## ✅ 체크리스트

### Phase 1 - 과목별 기본 설정
- [ ] `lib/voice/subject-defaults.ts` 생성
- [ ] `getSubjectDefaultSettings()` 함수 구현
- [ ] SimpleChatInterface.tsx에서 과목별 설정 적용
- [ ] 수학 튜터: Korean + Push-to-Talk 검증
- [ ] 영어 튜터: English (UK) + Always-On 검증

### Phase 2 - 음성 명령어
- [ ] `lib/voice/voice-command-processor.ts` 생성
- [ ] 7개 핵심 명령어 구현
- [ ] SimpleChatInterface.tsx 통합
- [ ] 명령어 확인 TTS 피드백
- [ ] 한국어/영어 명령어 모두 지원

### Phase 3 - Always Listening 고도화
- [ ] `lib/voice/voice-activity-detector.ts` 생성
- [ ] VAD (Voice Activity Detection) 구현
- [ ] ContinuousVoiceInput 개선
- [ ] NoiseSuppressionFilter 구현
- [ ] 실시간 음성 에너지 표시

### Phase 4 - Playwright 테스트
- [ ] `tests/e2e/voice-recognition/` 디렉토리 생성
- [ ] math-tutor-voice.spec.ts 작성
- [ ] english-tutor-voice.spec.ts 작성
- [ ] voice-commands.spec.ts 작성
- [ ] 모든 테스트 통과 확인

### Phase 5 - 사용 편의성
- [ ] 온보딩 플로우 구현
- [ ] 시각적 피드백 개선
- [ ] 접근성 ARIA 레이블 추가
- [ ] 오프라인 모드 대응
- [ ] 사용자 교육 자료 작성

---

## 📚 참고 자료

### 벤치마킹 서비스 문서
- [ELSA Speak - Speech Recognition Technology](https://elsaspeak.com/en/)
- [Duolingo - AI-Powered Language Learning](https://blog.duolingo.com/)
- [Khan Academy - Khanmigo AI Tutor](https://www.khanmigo.ai/)
- [Voice UX Best Practices - Nielsen Norman Group](https://www.nngroup.com/articles/voice-interaction-ux/)

### 기술 문서
- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Voice Activity Detection - Research Paper](https://dl.acm.org/doi/10.1145/3369807)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)

---

## 📝 업데이트 로그

- **2025-11-03**: 초안 작성 및 벤치마킹 분석 완료
