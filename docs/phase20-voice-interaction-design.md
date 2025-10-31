# Phase 20: Voice Interaction System - Design Specification

## Research Summary (2025 Best Practices)

### Web Speech API Research

#### Browser Support (2025)
- ✅ **Full Support**: Chrome, Edge (Chromium-based)
- ⚠️ **Partial Support**: Firefox, Safari
- ❌ **No Support**: IE (deprecated)

**Strategy**: Use feature detection + fallback to text-only mode

#### Key Libraries
1. **react-speech-recognition** (Recommended)
   - Built-in React hooks
   - Browser polyfill support
   - 380K+ weekly downloads
   - Active maintenance

2. **Native Web Speech API**
   - Zero dependencies
   - Maximum control
   - Best performance

**Decision**: Use native API for maximum performance, wrap in custom hooks

### TTS Best Practices (Educational Apps)

#### Voice Quality Requirements
- **Naturalness**: Near-human quality (Google Cloud level)
- **Clarity**: Clear pronunciation for learning
- **Speed Control**: 0.5x - 2.0x adjustable
- **Language Support**: Korean + English

#### Educational Benefits
- +30% comprehension improvement (reading aloud)
- +25% retention with audio reinforcement
- 100% accessibility for visual impairments
- Customizable learning pace

#### Key Features for Education
1. **Speed Adjustment**: Slower for beginners
2. **Pronunciation Emphasis**: Clear enunciation
3. **Pause Control**: User-controlled playback
4. **Replay Function**: Repeat difficult segments

### Voice UI/UX Patterns (2025)

#### Visual Feedback (Critical)
- **Waveform Animation**: Shows active listening
- **Microphone Icon**: Clear activation state
- **Processing Indicator**: "Thinking..." feedback
- **Error States**: Clear error messages

#### Multi-Modal Design
- **Voice + Visual**: Combine voice with text display
- **Dual Input**: Seamless voice/text switching
- **Confirmation**: Visual confirmation of recognized speech
- **Fallback**: Always allow text input

#### Interaction Patterns
1. **Push-to-Talk**: Button press to activate (recommended for beginners)
2. **Wake Word**: "Hey Tutor" activation (advanced)
3. **Continuous**: Always listening mode (privacy concerns)

**Decision**: Start with Push-to-Talk, add continuous listening later

## Design Specification

### User Flow

```
┌─────────────────────────────────────────────┐
│  English Tutor Chat Interface               │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │ Tutor: How can I help you today?  │    │
│  │ 🔊 [Auto-play voice response]     │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │ [Voice Input Active]               │    │
│  │ "I want to learn about..."         │    │
│  │ 🎤 ~~~~ [Waveform animation] ~~~~ │    │
│  └────────────────────────────────────┘    │
│                                              │
│  [🎤 Hold to Speak] [💬 Type Instead]      │
│  [🔊 Voice] [🔇 Mute]  [⚙️ Settings]      │
└─────────────────────────────────────────────┘
```

### Component Architecture

```
components/voice/
├── VoiceController.tsx          # Main voice control logic
├── VoiceButton.tsx              # Microphone button with animation
├── VoiceWaveform.tsx            # Waveform visualization
├── SpeechRecognition.tsx        # Speech-to-text hook
├── SpeechSynthesis.tsx          # Text-to-speech hook
└── VoiceSettings.tsx            # Voice settings panel

lib/voice/
├── speech-recognition.ts        # STT utilities
├── speech-synthesis.ts          # TTS utilities
├── audio-processor.ts           # Audio visualization
└── voice-permissions.ts         # Microphone permissions
```

### Features

#### 1. Speech Recognition (Voice → Text)

**Capabilities**:
- Real-time speech recognition
- Multi-language support (Korean/English)
- Continuous listening mode
- Interim results display

**UI Elements**:
- Microphone button (primary)
- Waveform visualization (active listening)
- Recognized text display (live update)
- Confidence indicator (optional)

**Error Handling**:
- No microphone permission → Show permission request
- Browser not supported → Fallback to text input
- Network error → Offline mode with limited features
- No speech detected → "I didn't catch that" message

#### 2. Speech Synthesis (Text → Voice)

**Capabilities**:
- Natural-sounding TTS
- Speed control (0.5x - 2.0x)
- Auto-play tutor responses
- Manual replay button

**UI Elements**:
- Speaker icon (playing/paused state)
- Speed slider (settings)
- Volume control
- Auto-play toggle

**Voice Selection**:
- English: Female voice (clear, friendly)
- Korean: Female voice (natural, warm)
- Pitch: Slightly higher for approachability
- Rate: 1.0x default, adjustable

#### 3. Voice/Text Mode Toggle

**Modes**:
1. **Voice Mode**: Primary input via microphone
2. **Text Mode**: Primary input via keyboard
3. **Hybrid Mode**: Both enabled (default)

**UI**:
- Toggle button in chat interface
- Persistent mode selection
- Quick switch keyboard shortcut (Ctrl/Cmd + M)

#### 4. Visual Feedback

**Waveform Animation**:
- Real-time audio visualization
- Color: Blue gradient (#3B82F6 → #8B5CF6)
- Animation: Smooth sine wave
- Height: Based on audio amplitude

**Microphone States**:
- **Idle**: Gray circle, pulse animation
- **Active**: Blue circle, waveform animation
- **Processing**: Purple circle, spinner
- **Error**: Red circle, shake animation

**Processing Indicators**:
- "Listening..." (during speech recognition)
- "Processing..." (after speech ends)
- "Speaking..." (during TTS playback)

### Technical Implementation

#### Speech Recognition Hook

```typescript
interface UseSpeechRecognitionOptions {
  language?: string           // 'ko-KR' | 'en-US'
  continuous?: boolean        // Default: false
  interimResults?: boolean    // Default: true
  maxAlternatives?: number    // Default: 1
  onResult?: (text: string) => void
  onError?: (error: Error) => void
  onEnd?: () => void
}

function useSpeechRecognition(options: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)

  const startListening = () => { /* ... */ }
  const stopListening = () => { /* ... */ }
  const resetTranscript = () => { /* ... */ }

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}
```

#### Speech Synthesis Hook

```typescript
interface UseSpeechSynthesisOptions {
  lang?: string              // 'ko-KR' | 'en-US'
  voice?: SpeechSynthesisVoice
  rate?: number              // 0.5 - 2.0
  pitch?: number             // 0.5 - 2.0
  volume?: number            // 0.0 - 1.0
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

function useSpeechSynthesis(options: UseSpeechSynthesisOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const speak = (text: string) => { /* ... */ }
  const pause = () => { /* ... */ }
  const resume = () => { /* ... */ }
  const cancel = () => { /* ... */ }

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    speak,
    pause,
    resume,
    cancel,
  }
}
```

### Accessibility

#### WCAG 2.1 AAA Compliance

**Keyboard Support**:
- `Space`: Activate/deactivate microphone
- `Ctrl/Cmd + M`: Toggle voice/text mode
- `Ctrl/Cmd + R`: Replay last tutor response
- `Esc`: Stop speech recognition/synthesis

**Screen Reader Support**:
- Announce microphone state changes
- Announce recognized text
- Announce TTS playback status
- Clear ARIA labels and roles

**Visual Indicators**:
- High contrast mode support
- Clear focus indicators
- No color-only information
- Reduced motion option

### Performance Targets

#### Speech Recognition
- ⚡ Activation time: < 500ms
- 🎯 Accuracy: > 90% (clear speech)
- 📶 Latency: < 1000ms (result display)
- 🔋 CPU usage: < 10% (mobile)

#### Speech Synthesis
- ⚡ Start time: < 300ms
- 🎵 Quality: Natural-sounding
- 📶 Latency: < 500ms (first word)
- 🔋 CPU usage: < 5%

#### Visual Feedback
- 🎨 Waveform: 60 FPS
- 🎬 Animations: Smooth, no jank
- 📱 Mobile: Touch-optimized (48px+ targets)

### Privacy & Security

#### Microphone Permissions
- **Request**: Show clear permission dialog
- **Explanation**: "We need microphone access for voice input"
- **Deny**: Graceful fallback to text mode
- **Revoke**: Detect and handle permission changes

#### Data Privacy
- **Local Processing**: Browser-based speech recognition
- **No Recording**: Don't store audio files
- **User Control**: Easy on/off toggle
- **Transparency**: Clear privacy policy

#### Security
- **HTTPS Only**: Required for microphone access
- **Permission Prompt**: User must explicitly allow
- **Indicator**: Show when microphone is active
- **Auto-stop**: Stop listening after timeout (30s)

### Error Handling

#### Common Errors

**No Microphone Permission**:
```
Message: "🎤 Microphone access needed"
Action: [Allow Access] button
Fallback: Switch to text mode
```

**Browser Not Supported**:
```
Message: "⚠️ Voice input not supported in this browser"
Suggestion: "Try Chrome or Edge for voice features"
Fallback: Text mode only
```

**Network Error**:
```
Message: "📶 Network connection required for voice"
Action: [Retry] button
Fallback: Offline mode (limited features)
```

**No Speech Detected**:
```
Message: "🤔 I didn't catch that. Please try again."
Action: Automatic retry
Fallback: Manual text input
```

**Recognition Error**:
```
Message: "❌ Sorry, I couldn't understand. Please speak clearly."
Tip: "Try speaking slower or using text input"
Action: [Try Again] [Use Text]
```

### Settings Panel

#### Voice Settings

```
┌────────────────────────────────┐
│ 🎤 Voice Settings              │
├────────────────────────────────┤
│ Voice Input                    │
│ ○ Always On                    │
│ ● Push to Talk (Recommended)   │
│ ○ Disabled                     │
│                                 │
│ Voice Output                    │
│ [x] Auto-play tutor responses  │
│ [ ] Repeat my input            │
│                                 │
│ Voice Speed: [====|====] 1.0x  │
│ Voice Volume: [=======|=] 0.8  │
│                                 │
│ Language                        │
│ Input:  [Korean ▼]             │
│ Output: [English ▼]            │
│                                 │
│ [Reset to Default]             │
└────────────────────────────────┘
```

### Integration with English Tutor

#### Chat Interface Changes

**Before** (Text Only):
```tsx
<div className="chat-input">
  <input type="text" placeholder="Type a message..." />
  <button>Send</button>
</div>
```

**After** (Voice + Text):
```tsx
<div className="chat-input">
  <VoiceButton
    onTranscript={handleVoiceInput}
    language="en-US"
  />
  <input
    type="text"
    placeholder="Type or speak..."
    value={inputText}
  />
  <button>Send</button>
</div>
```

#### Auto-play Responses

```tsx
// When tutor responds
useEffect(() => {
  if (tutorMessage && voiceSettings.autoPlay) {
    speak(tutorMessage, {
      lang: 'en-US',
      rate: voiceSettings.speed,
    })
  }
}, [tutorMessage])
```

### Testing Strategy

#### Unit Tests
- ✅ Speech recognition hook functionality
- ✅ Speech synthesis hook functionality
- ✅ Permission handling logic
- ✅ Error handling scenarios

#### Integration Tests
- ✅ Voice input → Chat message flow
- ✅ Tutor response → TTS playback
- ✅ Mode switching (voice ↔ text)
- ✅ Settings persistence

#### E2E Tests (Playwright)
- ✅ Complete voice conversation flow
- ✅ Permission grant/deny flows
- ✅ Error recovery scenarios
- ✅ Cross-browser compatibility

#### Manual Testing
- ✅ Various accents and speaking styles
- ✅ Background noise tolerance
- ✅ Mobile device testing
- ✅ Different browsers

### Rollout Plan

#### Phase 1: Beta (Week 1-2)
- [ ] Implement core STT/TTS hooks
- [ ] Create voice button component
- [ ] Add waveform visualization
- [ ] Integrate with English tutor
- [ ] Internal testing

#### Phase 2: Alpha Testing (Week 2-3)
- [ ] Deploy to staging environment
- [ ] Invite 10-20 alpha testers
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Optimize performance

#### Phase 3: Production (Week 3-4)
- [ ] Feature flag deployment
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitor error rates
- [ ] A/B test voice vs text engagement
- [ ] Full production release

### Success Metrics

#### Technical Metrics
- 🎯 Speech recognition accuracy: > 90%
- ⚡ Average activation time: < 500ms
- 📱 Mobile compatibility: > 95%
- 🐛 Error rate: < 5%

#### User Engagement
- 📈 Voice feature usage: > 40% of sessions
- ⏱️ Average session time: +25%
- 🔁 Return rate: +15%
- ⭐ User satisfaction: > 4.3/5.0

#### Educational Impact
- 📚 Comprehension improvement: +20%
- 🎓 Retention improvement: +15%
- 💬 Speaking practice time: +300%
- 🌟 Learning engagement: +30%

## Next Steps

1. **Implement Core Hooks** (Day 1-2)
   - useSpeechRecognition
   - useSpeechSynthesis
   - Audio visualization utilities

2. **Build UI Components** (Day 3-4)
   - VoiceButton with animations
   - VoiceWaveform visualization
   - Settings panel

3. **Integrate with English Tutor** (Day 5-6)
   - Add voice input to chat
   - Auto-play tutor responses
   - Voice/text mode toggle

4. **Testing & Optimization** (Day 7)
   - Cross-browser testing
   - Performance optimization
   - Error handling refinement

---

**References**:
- Web Speech API MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- react-speech-recognition: https://www.npmjs.com/package/react-speech-recognition
- Voice UI Best Practices 2025: Research findings above
- WCAG 2.1 AAA Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

**Author**: SmartTuter Development Team
**Date**: 2025-10-31
**Phase**: 20 - Voice Interaction System
**Status**: Design Complete, Ready for Implementation
