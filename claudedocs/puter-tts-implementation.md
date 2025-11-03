# Puter.js TTS 구현 문서

## 개요

SmartTuter에 Puter.js 기반 고품질 TTS(Text-to-Speech) 엔진을 추가하여 사용자가 선택할 수 있도록 구현했습니다.

## 구현 목적

기존 Web Speech API의 음성 품질 문제를 해결하기 위해 더 자연스러운 무료 TTS 솔루션을 도입했습니다.

## Puter.js 선택 이유

### ✅ 장점
1. **완전 무료**: API 키 불필요, 무제한 사용
2. **한국어 지원**: ko-KR 언어 코드 완벽 지원
3. **3가지 품질 옵션**:
   - **Standard**: 빠른 응답 속도
   - **Neural**: 품질과 속도의 균형 (기본값, 권장)
   - **Generative**: 가장 자연스러운 음성 (최고 품질)
4. **간단한 구현**: CDN을 통한 단일 스크립트 로드
5. **브라우저 호환성**: 모든 모던 브라우저 지원

### ⚠️ 제한사항
- 3,000자 제한 (튜터 대화에는 충분함)
- 인터넷 연결 필요

## 구현 세부사항

### 1. Puter.js 스크립트 로드

**파일**: [app/layout.tsx](../app/layout.tsx#L93)

```tsx
<head>
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <script src="https://js.puter.com/v2/" async></script>
</head>
```

### 2. Puter TTS Hook 생성

**파일**: [hooks/usePuterTTS.ts](../hooks/usePuterTTS.ts)

```typescript
export function usePuterTTS({
  language = 'ko-KR',
  engine = 'neural',
  voice,
}: UsePuterTTSProps = {}) {
  // Puter.js 로드 확인
  // 음성 재생 관리
  // 에러 처리

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isReady,
    error,
  };
}
```

**주요 기능**:
- Puter.js 로드 대기 및 확인
- 3,000자 제한 자동 처리
- 음성 재생/중지/일시정지/재개
- 상세한 에러 로깅

### 3. VoiceSettings 확장

**파일**: [components/voice/VoiceSettings.tsx](../components/voice/VoiceSettings.tsx)

**인터페이스 확장**:
```typescript
export interface VoiceSettingsConfig {
  // ... 기존 설정들 ...
  ttsEngine: 'browser' | 'puter' // TTS 엔진 선택
  puterEngine: 'standard' | 'neural' | 'generative' // Puter.js 품질
}
```

**기본값**:
```typescript
export const DEFAULT_VOICE_SETTINGS: VoiceSettingsConfig = {
  // ... 기존 설정들 ...
  ttsEngine: 'puter', // Puter.js를 기본값으로 설정 (고품질)
  puterEngine: 'neural', // Neural 엔진 (균형 잡힌 품질/속도)
}
```

**UI 컴포넌트**:
- TTS 엔진 선택 드롭다운
- Puter 품질 선택 드롭다운 (Puter 선택 시에만 표시)
- 설명 텍스트로 사용자 가이드 제공

### 4. SimpleChatInterface 통합

**파일**: [components/tutor-pages/SimpleChatInterface.tsx](../components/tutor-pages/SimpleChatInterface.tsx#L54-L71)

```typescript
// Browser TTS (Web Speech API)
const browserTTS = useSpeechSynthesis({
  lang: voiceSettings.outputLanguage,
  rate: voiceSettings.voiceSpeed,
  pitch: voiceSettings.voicePitch,
  volume: voiceSettings.voiceVolume,
});

// Puter.js TTS (Higher quality)
const puterTTS = usePuterTTS({
  language: voiceSettings.outputLanguage,
  engine: voiceSettings.puterEngine,
});

// Select active TTS based on settings
const activeTTS = voiceSettings.ttsEngine === 'puter' ? puterTTS : browserTTS;
const { speak, stop, isSpeaking } = activeTTS;
const isTTSSupported = voiceSettings.ttsEngine === 'puter' ? puterTTS.isReady : browserTTS.isSupported;
```

**동작 방식**:
1. 두 TTS 엔진을 모두 초기화
2. `voiceSettings.ttsEngine` 값에 따라 활성 엔진 선택
3. 통일된 인터페이스로 음성 재생/중지 제어

## 사용 방법

### 기본 사용 (자동)

서비스 첫 접속 시 **Puter.js Neural 엔진**이 기본으로 설정되어 있어 별도 설정 없이 고품질 음성을 사용할 수 있습니다.

### 수동 설정 변경

1. 튜터 화면에서 **설정 아이콘 (⚙️)** 클릭
2. **Voice Output** 섹션에서 **TTS Engine** 선택:
   - **Puter.js (High Quality, Recommended)**: 고품질 음성
   - **Browser TTS (Standard)**: 브라우저 기본 음성
3. Puter.js 선택 시 **Voice Quality** 옵션 표시:
   - **Standard (Fast)**: 빠른 응답
   - **Neural (Balanced, Recommended)**: 균형 잡힌 품질 (기본값)
   - **Generative (Most Natural)**: 가장 자연스러운 음성

### 학년별 자동 최적화

시스템이 학년에 따라 음성을 자동으로 최적화합니다:

- **초등학교**: 느린 속도 (0.9), 높은 음높이 (1.2) - 친근한 느낌
- **중학교**: 약간 느린 속도 (0.95), 약간 높은 음높이 (1.1)
- **고등학교/대학교**: 보통 속도 (1.0), 보통 음높이 (1.0)

## 기술적 세부사항

### Puter.js API 사용법

```javascript
// 기본 사용
window.puter.ai.txt2speech("안녕하세요. 스마트튜터 음성 테스트입니다.")
  .then((audio) => {
    audio.play();
  });

// 옵션 지정
window.puter.ai.txt2speech("Hello, how are you?", {
  engine: "neural",
  language: "en-US",
  voice: "Joanna"
})
  .then((audio) => {
    audio.play();
  });
```

### 에러 처리

usePuterTTS 훅에서 다음 에러를 자동으로 처리합니다:

1. **Puter.js 미로드**: 자동 재시도 (100ms 간격)
2. **3,000자 초과**: 자동 잘라내기 + 경고 로그
3. **음성 재생 실패**: 상세 에러 로깅
4. **브라우저 호환성**: isReady 상태로 확인

### 성능 최적화

1. **비동기 로딩**: Puter.js 스크립트를 `async`로 로드하여 페이지 로딩 속도에 영향 없음
2. **자동 정리**: 음성 재생 완료 시 자동으로 리소스 정리
3. **상태 관리**: React 훅으로 효율적인 상태 관리

## 테스트 방법

### 1. 브라우저에서 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접속
http://localhost:3000/tutor/english
```

### 2. 확인 사항

1. **Puter.js 로드 확인**: 브라우저 콘솔에서 `✅ Puter.js TTS ready` 메시지 확인
2. **음성 재생**: 튜터 응답이 자동으로 음성으로 재생되는지 확인
3. **엔진 전환**: 설정에서 Browser/Puter 엔진 전환 테스트
4. **품질 비교**: Neural vs Generative 품질 차이 확인
5. **한국어 테스트**: 한국어 문장이 자연스럽게 발음되는지 확인

### 3. 콘솔 로그 확인

```
✅ Puter.js TTS ready
🎤 Puter.js TTS: {engine: 'neural', language: 'ko-KR', textLength: 42}
🎤 Puter.js TTS finished
```

## 문제 해결

### Puter.js가 로드되지 않음

**증상**: `Puter.js not loaded yet` 에러

**해결**:
1. 인터넷 연결 확인
2. 브라우저 새로고침 (Cmd+Shift+R / Ctrl+Shift+R)
3. 브라우저 콘솔에서 네트워크 에러 확인
4. 방화벽/광고 차단기 확인

### 음성이 재생되지 않음

**증상**: TTS 버튼을 눌러도 음성이 나오지 않음

**해결**:
1. 브라우저 음소거 해제
2. 시스템 볼륨 확인
3. 설정에서 "Auto-play tutor responses" 활성화 확인
4. 첫 메시지 전송 후 재시도 (브라우저 autoplay 정책)

### 음성이 잘림

**증상**: 긴 문장에서 음성이 중간에 끊김

**원인**: 3,000자 제한

**해결**:
- 훅에서 자동으로 3,000자로 잘라내므로 별도 처리 불필요
- 콘솔에서 경고 메시지 확인

## 향후 개선 사항

1. **음성 커스터마이징**:
   - 특정 voice 선택 기능 추가
   - 감정 표현 (emotion) 옵션 추가

2. **캐싱**:
   - 반복되는 응답 음성 캐싱으로 성능 개선

3. **오프라인 지원**:
   - 대체 TTS 엔진 자동 전환 (Puter 실패 시 Browser TTS로 폴백)

4. **음성 속도 미세 조정**:
   - Puter.js가 속도 조절 지원 시 추가 구현

## 참고 자료

- [Puter.js 공식 문서](https://docs.puter.com/AI/txt2speech/)
- [Puter.js TTS 튜토리얼](https://developer.puter.com/tutorials/free-unlimited-text-to-speech-api/)
- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 관련 파일

- [app/layout.tsx](../app/layout.tsx) - Puter.js 스크립트 로드
- [hooks/usePuterTTS.ts](../hooks/usePuterTTS.ts) - Puter TTS 훅
- [hooks/useSpeechSynthesis.ts](../hooks/useSpeechSynthesis.ts) - Browser TTS 훅
- [components/voice/VoiceSettings.tsx](../components/voice/VoiceSettings.tsx) - 음성 설정 UI
- [components/tutor-pages/SimpleChatInterface.tsx](../components/tutor-pages/SimpleChatInterface.tsx) - TTS 통합
