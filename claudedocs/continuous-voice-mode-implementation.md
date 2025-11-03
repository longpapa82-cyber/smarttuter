# Continuous Voice Mode Implementation

## 개요

AI Park 튜터 서비스에 "Always On" 음성 인식 모드를 추가하여 사용자가 버튼을 누르지 않고도 계속해서 말할 수 있는 기능을 구현했습니다.

## 구현 목적

기존 Push-to-talk 모드는 버튼을 눌러야만 음성 인식이 시작되어 불편함이 있었습니다. Continuous Voice Mode는 한 번 활성화하면 계속해서 음성을 인식하여 더 자연스러운 대화 흐름을 제공합니다.

## 주요 기능

### 1. Always-On 음성 인식
- 토글 버튼 한 번 클릭으로 음성 인식 모드 활성화/비활성화
- 활성화 상태에서는 계속해서 사용자의 음성을 인식
- 2초간 침묵 후 자동으로 메시지 전송

### 2. 실시간 파형 시각화
- 30개의 바를 사용한 웨이브폼 애니메이션
- 음성 입력 크기에 따라 바의 높이가 실시간으로 변화
- Framer Motion을 사용한 부드러운 애니메이션

### 3. 라이브 상태 표시
- 현재 인식 중인 텍스트 실시간 표시
- 임시 인식 결과(interim) 표시
- 활성 상태 표시 (빨간색 점이 깜빡임)

### 4. 자동 전송
- 2초간 침묵 감지 시 자동으로 메시지 전송
- 전송 후 자동으로 transcript 초기화하여 다음 입력 준비

### 5. 에러 처리
- 브라우저 권한 거부 시 사용자 친화적 에러 메시지
- 음성 인식 실패 시 자동 복구
- 에러 발생 시 빨간색 배경으로 경고 표시

## 구현 세부사항

### 새로 생성된 파일

**파일**: [components/voice/ContinuousVoiceInput.tsx](../components/voice/ContinuousVoiceInput.tsx)

```typescript
interface ContinuousVoiceInputProps {
  onTranscript?: (transcript: string) => void
  language?: string
  disabled?: boolean
  autoSend?: boolean
  silenceThreshold?: number
}

export function ContinuousVoiceInput({
  onTranscript,
  language = 'ko-KR',
  disabled = false,
  autoSend = true,
  silenceThreshold = 2000,
}: ContinuousVoiceInputProps)
```

**주요 기능**:
- **useSpeechRecognition 훅 사용**: Web Speech Recognition API 활용
- **상태 관리**:
  - `isActive`: 음성 인식 모드 활성화 여부
  - `transcript`: 최종 인식된 텍스트
  - `interimTranscript`: 임시 인식 텍스트
  - `error`: 에러 메시지
  - `audioLevel`: 오디오 입력 크기 (0.0 - 1.0)
  - `lastSpeechTime`: 마지막 음성 입력 시간

- **Auto-send 로직**:
```typescript
useEffect(() => {
  if (!isActive || !autoSend || !transcript.trim()) return

  const timeSinceLastSpeech = Date.now() - lastSpeechTime

  if (timeSinceLastSpeech > silenceThreshold) {
    onTranscript?.(transcript.trim())
    resetTranscript()
    setLastSpeechTime(Date.now())
  }
}, [isActive, transcript, lastSpeechTime, autoSend, silenceThreshold])
```

- **Waveform 시각화**:
```typescript
{Array.from({ length: 30 }).map((_, i) => (
  <motion.div
    key={i}
    className="w-1 bg-blue-500 rounded-full"
    animate={{
      height: `${Math.max(10, audioLevel * 100 + Math.random() * 20)}%`,
    }}
    transition={{
      duration: 0.1,
      ease: 'linear',
    }}
  />
))}
```

### 수정된 파일

**파일**: [components/tutor-pages/SimpleChatInterface.tsx](../components/tutor-pages/SimpleChatInterface.tsx)

**변경 사항**:

1. **Import 추가**:
```typescript
import { ContinuousVoiceInput } from '@/components/voice/ContinuousVoiceInput'
```

2. **Form 레이아웃 변경**:
```typescript
<form className="max-w-4xl mx-auto space-y-3">
  {/* space-y-2 → space-y-3으로 변경하여 continuous mode UI 공간 확보 */}
```

3. **조건부 렌더링 추가**:
```typescript
{/* Continuous Voice Input (Always-On mode) */}
{voiceSettings.inputMode === 'continuous' && (
  <ContinuousVoiceInput
    onTranscript={(transcript) => {
      if (voiceSettings.repeatUserInput) {
        speak(transcript)
      }
      handleSubmit(undefined, transcript)
    }}
    language={voiceSettings.inputLanguage}
    disabled={isLoading}
    autoSend={true}
    silenceThreshold={2000}
  />
)}

{/* Push-to-talk mode (existing) */}
{voiceSettings.inputMode === 'push-to-talk' && (
  <VoiceButton
    onTranscript={handleVoiceInput}
    language={voiceSettings.inputLanguage}
    disabled={isLoading}
  />
)}
```

## 사용 방법

### 1. Continuous Voice Mode 활성화

1. 튜터 페이지 접속 (예: http://localhost:3000/tutor/english)
2. 우측 상단 설정 아이콘 (⚙️) 클릭
3. **Voice Input** 섹션에서 **Input Mode** 선택
4. **Always On (Continuous)** 선택

### 2. 음성 인식 시작

1. 채팅 입력창 위의 **Start Continuous Mode** 버튼 클릭
2. 버튼이 빨간색으로 변하고 "Always Listening" 텍스트 표시
3. 웨이브폼 애니메이션이 나타남
4. 말하기 시작하면 실시간으로 텍스트가 표시됨

### 3. 자동 전송

1. 말을 멈춘 후 2초 동안 침묵하면 자동으로 메시지 전송
2. 전송 후 자동으로 다음 입력을 준비
3. 계속해서 대화 가능

### 4. 음성 인식 중지

1. **Always Listening** 버튼 다시 클릭
2. 버튼이 파란색으로 변하고 "Start Continuous Mode"로 돌아옴
3. 웨이브폼 애니메이션 사라짐

## 기술적 세부사항

### Web Speech Recognition API

```typescript
const {
  isListening,
  transcript,
  interimTranscript,
  error,
  startListening,
  stopListening,
  resetTranscript,
} = useSpeechRecognition({
  lang: language,
  continuous: true,  // 계속해서 인식
  interimResults: true,  // 임시 결과도 표시
  onResult: (result) => {
    setLastSpeechTime(Date.now())
    // 오디오 레벨 시뮬레이션
    const randomLevel = 0.3 + Math.random() * 0.7
    setAudioLevel(randomLevel)
  },
})
```

### 침묵 감지 로직

```typescript
const checkSilenceInterval = useInterval(() => {
  if (!isActive || !autoSend || !transcript.trim()) return

  const timeSinceLastSpeech = Date.now() - lastSpeechTime

  // 2초간 침묵 + 텍스트 있음 → 자동 전송
  if (timeSinceLastSpeech > silenceThreshold) {
    onTranscript?.(transcript.trim())
    resetTranscript()
    setLastSpeechTime(Date.now())
  }
}, 500) // 500ms마다 체크
```

### 오디오 레벨 시뮬레이션

실제 Web Speech API는 오디오 레벨을 제공하지 않으므로, 음성 인식 결과가 들어올 때마다 랜덤 레벨을 생성하여 웨이브폼 애니메이션을 만듭니다.

```typescript
onResult: (result) => {
  setLastSpeechTime(Date.now())
  const randomLevel = 0.3 + Math.random() * 0.7
  setAudioLevel(randomLevel)
}
```

## UI/UX 디자인

### 1. 버튼 상태

**비활성 상태** (파란색):
```tsx
<button className="bg-blue-500 hover:bg-blue-600">
  <Mic className="w-6 h-6" />
  Start Continuous Mode
</button>
```

**활성 상태** (빨간색):
```tsx
<button className="bg-red-500 hover:bg-red-600">
  <Radio className="w-6 h-6 animate-pulse" />
  Always Listening
</button>
```

### 2. 웨이브폼 애니메이션

```tsx
<div className="flex items-center justify-center gap-1 h-12 bg-gray-50 rounded-lg p-2">
  {Array.from({ length: 30 }).map((_, i) => (
    <motion.div
      className="w-1 bg-blue-500 rounded-full"
      animate={{ height: `${audioLevel * 100}%` }}
      transition={{ duration: 0.1 }}
    />
  ))}
</div>
```

### 3. 실시간 텍스트 표시

```tsx
{transcript && (
  <div className="text-sm bg-blue-50 p-2 rounded">
    <span className="font-semibold text-blue-600">Recognized:</span>
    <span className="ml-2">{transcript}</span>
  </div>
)}

{interimTranscript && (
  <div className="text-sm bg-gray-50 p-2 rounded">
    <span className="font-semibold text-gray-600">Listening...:</span>
    <span className="ml-2 text-gray-500 italic">{interimTranscript}</span>
  </div>
)}
```

### 4. 라이브 상태 표시

```tsx
{isActive && (
  <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    <span>LIVE</span>
  </div>
)}
```

### 5. 에러 표시

```tsx
{error && (
  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-600">
      <AlertCircle className="inline w-4 h-4 mr-1" />
      {error}
    </p>
  </div>
)}
```

## 브라우저 호환성

### 지원 브라우저
- ✅ Chrome/Edge (Chromium): 완벽 지원
- ✅ Safari: 완벽 지원
- ⚠️ Firefox: 일부 지원 (플래그 활성화 필요)

### 권한 요청
첫 사용 시 브라우저에서 마이크 권한 요청:
```
"localhost wants to use your microphone"
[Block] [Allow]
```

권한을 거부하면 에러 메시지 표시:
```
❌ Microphone access denied. Please allow microphone access in your browser settings.
```

## 성능 최적화

### 1. 메모리 관리
- 음성 인식 중지 시 자동으로 리소스 정리
- `useEffect` cleanup 함수로 메모리 누수 방지

```typescript
useEffect(() => {
  return () => {
    if (isListening) {
      stopListening()
    }
  }
}, [])
```

### 2. 렌더링 최적화
- Framer Motion의 `layout` 애니메이션 사용
- 웨이브폼 바는 `key={i}`로 안정적인 렌더링

### 3. 배터리 효율
- 침묵 감지는 500ms 간격으로 체크 (너무 빈번하지 않게)
- 비활성 시 모든 interval 자동 정리

## 문제 해결

### 1. 마이크 권한 거부됨
**증상**: "Microphone access denied" 에러

**해결**:
1. 브라우저 주소창 왼쪽 자물쇠 아이콘 클릭
2. 사이트 설정 → 마이크 → 허용
3. 페이지 새로고침

### 2. 음성 인식이 작동하지 않음
**증상**: 버튼을 눌러도 웨이브폼이 나타나지 않음

**해결**:
1. 브라우저 콘솔에서 에러 확인
2. Firefox의 경우: `about:config`에서 `media.webspeech.recognition.enable` = true
3. HTTPS 또는 localhost에서만 작동 (HTTP에서는 불가능)

### 3. 자동 전송이 너무 빨리/늦게 됨
**증상**: 말을 끝내기도 전에 전송되거나, 너무 오래 기다려야 함

**해결**:
`silenceThreshold` 값 조정 (기본값: 2000ms):
```typescript
<ContinuousVoiceInput
  silenceThreshold={3000}  // 3초로 늘리기
/>
```

### 4. 웨이브폼이 움직이지 않음
**증상**: 말해도 웨이브폼 바가 변하지 않음

**원인**: 오디오 레벨 시뮬레이션 문제

**해결**: 콘솔에서 `onResult` 콜백이 호출되는지 확인

## 향후 개선 사항

### 1. 실제 오디오 레벨 API 사용
- Web Audio API와 통합하여 실제 마이크 입력 레벨 사용
- 더 정확한 웨이브폼 시각화

### 2. 음성 감지 알고리즘 개선
- VAD (Voice Activity Detection) 알고리즘 적용
- 배경 소음 필터링

### 3. 커스터마이징 옵션
- 침묵 시간 조절 UI 추가
- 웨이브폼 색상/스타일 커스터마이징
- 음성 인식 감도 조절

### 4. 오프라인 지원
- 브라우저 내장 음성 인식 캐싱
- 오프라인 시 대체 TTS 엔진 자동 전환

### 5. 다중 언어 자동 감지
- 사용자가 말하는 언어 자동 감지
- 언어에 따라 자동으로 입력 언어 전환

## 관련 파일

- [components/voice/ContinuousVoiceInput.tsx](../components/voice/ContinuousVoiceInput.tsx) - Continuous Voice 컴포넌트
- [components/tutor-pages/SimpleChatInterface.tsx](../components/tutor-pages/SimpleChatInterface.tsx) - 메인 채팅 인터페이스
- [hooks/useSpeechRecognition.ts](../hooks/useSpeechRecognition.ts) - 음성 인식 훅
- [components/voice/VoiceButton.tsx](../components/voice/VoiceButton.tsx) - Push-to-talk 버튼
- [components/voice/VoiceSettings.tsx](../components/voice/VoiceSettings.tsx) - 음성 설정 UI

## 참고 자료

- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechRecognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Framer Motion - Animations](https://www.framer.com/motion/)
- [React Hooks](https://react.dev/reference/react)

## 테스트 방법

### 1. 로컬 테스트
```bash
npm run dev
```

브라우저에서 http://localhost:3000/tutor/english 접속

### 2. 확인 사항
- [x] 설정에서 "Always On" 모드 선택 가능
- [x] "Start Continuous Mode" 버튼 클릭 시 활성화
- [x] 웨이브폼 애니메이션 표시
- [x] 실시간 텍스트 인식 표시
- [x] 2초 침묵 후 자동 전송
- [x] 라이브 상태 표시 (빨간 점 깜빡임)
- [x] 에러 처리 (권한 거부 시 메시지)
- [x] 중지 버튼으로 비활성화 가능

### 3. 브라우저별 테스트
- [x] Chrome/Edge: 완벽 작동
- [x] Safari: 완벽 작동
- [ ] Firefox: 플래그 활성화 후 테스트 필요

## 결론

Continuous Voice Mode 구현으로 AI Park 튜터 서비스의 음성 인식 기능이 크게 개선되었습니다:

✅ **사용자 경험 향상**: 버튼을 누르지 않고도 자연스러운 대화 가능
✅ **실시간 피드백**: 웨이브폼과 텍스트로 음성 인식 상태 확인
✅ **자동 전송**: 침묵 감지로 편리한 메시지 전송
✅ **안정적 구현**: 에러 처리와 브라우저 호환성 확보

다음 단계로는 실제 오디오 레벨 API 통합, 음성 감지 알고리즘 개선 등의 작업이 예정되어 있습니다.
