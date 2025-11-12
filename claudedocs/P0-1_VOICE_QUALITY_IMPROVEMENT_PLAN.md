# P0-1: 음성 품질 개선 계획
## Kokoro TTS 통합 상세 계획

**작성일**: 2025년 11월 12일
**우선순위**: P0 (최우선)
**예상 소요**: 1-2일
**목표**: Web Speech API → Kokoro TTS로 전환하여 자연스러운 음성 제공

---

## 🎯 문제 분석

### 현재 상황
**사용자 피드백**: "이상한 목소리로 나오는 문제"

**현재 TTS 시스템**:
```yaml
우선순위 1: usePuterTTS
  - Puter.js AI TTS (neural/generative 엔진)
  - 사용 불가 시 Web Speech API로 fallback

우선순위 2: useSpeechSynthesis
  - 브라우저 Web Speech API만 사용
  - 음질: 낮음 (로봇 같은 목소리)
  - 한국어: 지원하지만 부자연스러움
```

**파일 구조**:
- `/hooks/usePuterTTS.ts` - Puter.js TTS 훅
- `/hooks/useSpeechSynthesis.ts` - Web Speech API 훅
- `/components/tutor-pages/SimpleChatInterface.tsx` - 메인 채팅 UI

**문제의 근본 원인**:
1. **Puter.js 의존성**: Puter.js가 로드되지 않으면 Web Speech API로 fallback
2. **Web Speech API 품질**: 로봇 같은 목소리, 부자연스러운 억양
3. **일관성 부족**: 엔진에 따라 음질 편차가 큼

---

## 🌟 해결 방안: Kokoro TTS

### Kokoro란?
```yaml
개요:
  - 오픈소스 로컬 TTS 엔진
  - ElevenLabs 수준의 자연스러움
  - 82M 파라미터 (경량)
  - MIT 라이선스 (상업적 사용 가능)

장점:
  - 100% 무료, 사용량 제한 없음
  - 매우 자연스러운 음질
  - 감정 표현 가능
  - 한국어/영어 모두 지원
  - 빠른 응답 속도 (저사양에서도 실행 가능)

단점:
  - 로컬 서버 설정 필요
  - 초기 설치 복잡도

GitHub: https://github.com/hexgrad/kokoro
Demo: https://huggingface.co/spaces/hexgrad/Kokoro-82M
```

---

## 📋 구현 계획

### Phase 1: Kokoro 설치 및 테스트 (1-2시간)

#### 1.1 Kokoro 설치
```bash
# Option A: Python 패키지로 설치
pip install kokoro-onnx

# Option B: Docker로 실행 (권장)
docker pull ghcr.io/hexgrad/kokoro:latest
docker run -p 8080:8080 ghcr.io/hexgrad/kokoro:latest
```

#### 1.2 로컬 TTS 서버 구성
```yaml
구성 방법:
  Option A: Python FastAPI 서버
    - /api/tts endpoint 생성
    - Kokoro로 음성 생성
    - WAV/MP3 반환

  Option B: Next.js API Route
    - /api/kokoro-tts/route.ts 생성
    - Child process로 Kokoro 실행
    - Audio stream 반환

  Option C: Vercel Serverless Function ⭐ 추천
    - Edge Function으로 배포
    - WASM 컴파일된 Kokoro 사용
    - 전 세계 CDN 배포
```

#### 1.3 간단한 테스트
```typescript
// 테스트 스크립트: scripts/test-kokoro.ts
async function testKokoro() {
  const response = await fetch('http://localhost:8080/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: '안녕하세요. 저는 AI 튜터입니다.',
      language: 'ko-KR',
      voice: 'korean-female-1',
    }),
  });

  const audioBlob = await response.blob();
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
}
```

---

### Phase 2: Kokoro 훅 생성 (2-3시간)

#### 2.1 새로운 훅 생성
```typescript
// /hooks/useKokoroTTS.ts
import { useState, useCallback, useRef } from 'react';

interface UseKokoroTTSProps {
  language?: 'ko-KR' | 'en-US';
  voice?: string;
  rate?: number;
  pitch?: number;
}

export function useKokoroTTS({
  language = 'ko-KR',
  voice = 'korean-female-1',
  rate = 1.0,
  pitch = 1.0,
}: UseKokoroTTSProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text || text.length === 0) return;

    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsLoading(true);
      setError(null);

      // Call Kokoro TTS API
      const response = await fetch('/api/kokoro-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
          voice,
          rate,
          pitch,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audioRef.current = audio;

      audio.onloadeddata = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = (event) => {
        console.error('Audio playback error:', event);
        setError('Failed to play audio');
        setIsSpeaking(false);
        setIsLoading(false);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Kokoro TTS error:', errorMessage);
      setError(errorMessage);
      setIsSpeaking(false);
      setIsLoading(false);
    }
  }, [language, voice, rate, pitch]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isLoading,
    error,
  };
}
```

#### 2.2 Kokoro API Route 생성
```typescript
// /app/api/kokoro-tts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { text, language, voice, rate, pitch } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Create temporary file for output
    const tempDir = path.join(process.cwd(), '.tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputFile = path.join(tempDir, `tts-${Date.now()}.wav`);

    // Call Kokoro TTS
    // Option A: Python script
    const command = `python3 scripts/kokoro-tts.py "${text}" "${outputFile}" --language ${language} --voice ${voice}`;

    await execAsync(command);

    // Read audio file
    const audioBuffer = fs.readFileSync(outputFile);

    // Clean up temp file
    fs.unlinkSync(outputFile);

    // Return audio
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Kokoro TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
```

#### 2.3 Python 스크립트 생성
```python
# /scripts/kokoro-tts.py
import argparse
from kokoro_onnx import Kokoro

def generate_speech(text, output_file, language='ko-KR', voice='korean-female-1'):
    """Generate speech using Kokoro TTS"""

    # Initialize Kokoro
    kokoro = Kokoro()

    # Generate audio
    audio = kokoro.create(
        text=text,
        voice=voice,
        lang=language,
    )

    # Save to file
    audio.export(output_file, format='wav')
    print(f"✅ Audio saved to {output_file}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Kokoro TTS Generator')
    parser.add_argument('text', type=str, help='Text to convert to speech')
    parser.add_argument('output', type=str, help='Output file path')
    parser.add_argument('--language', type=str, default='ko-KR')
    parser.add_argument('--voice', type=str, default='korean-female-1')

    args = parser.parse_args()

    generate_speech(args.text, args.output, args.language, args.voice)
```

---

### Phase 3: SimpleChatInterface 통합 (2-3시간)

#### 3.1 TTS 엔진 선택 로직 추가
```typescript
// /components/tutor-pages/SimpleChatInterface.tsx

// Add Kokoro TTS hook
import { useKokoroTTS } from '@/hooks/useKokoroTTS';

// ...

export default function SimpleChatInterface({ subject, gradeLevel }: SimpleChatInterfaceProps) {
  // ...

  // Voice settings state
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsConfig>(() => {
    const baseSettings = { ...getSubjectDefaultSettings(subject) };
    // ... grade level optimization
    return baseSettings;
  });

  // TTS 엔진 설정 추가
  const [ttsEngine, setTtsEngine] = useState<'kokoro' | 'puter' | 'webspeech'>('kokoro');

  // Initialize all TTS hooks
  const kokoroTTS = useKokoroTTS({
    language: voiceSettings.voiceLanguage as 'ko-KR' | 'en-US',
    rate: voiceSettings.voiceSpeed,
    pitch: voiceSettings.voicePitch,
  });

  const puterTTS = usePuterTTS({
    language: voiceSettings.voiceLanguage,
    engine: 'neural',
  });

  const webSpeechTTS = useSpeechSynthesis({
    lang: voiceSettings.voiceLanguage,
    rate: voiceSettings.voiceSpeed,
    pitch: voiceSettings.voicePitch,
    volume: voiceSettings.voiceVolume,
  });

  // Select TTS based on engine preference with fallback
  const selectedTTS = useMemo(() => {
    if (ttsEngine === 'kokoro' && !kokoroTTS.error) {
      return kokoroTTS;
    } else if (ttsEngine === 'puter' && puterTTS.isReady) {
      return puterTTS;
    } else {
      return webSpeechTTS;
    }
  }, [ttsEngine, kokoroTTS, puterTTS, webSpeechTTS]);

  // ...
}
```

#### 3.2 설정 UI 추가
```typescript
// Voice Settings에 TTS 엔진 선택 추가
<VoiceSettings
  settings={voiceSettings}
  onChange={setVoiceSettings}
  onTTSEngineChange={setTtsEngine} // 새로운 prop
  currentTTSEngine={ttsEngine}
  availableEngines={[
    { id: 'kokoro', name: 'Kokoro (최고 품질)', available: !kokoroTTS.error },
    { id: 'puter', name: 'Puter AI', available: puterTTS.isReady },
    { id: 'webspeech', name: '브라우저 기본', available: true },
  ]}
/>
```

---

### Phase 4: 테스트 및 최적화 (2-3시간)

#### 4.1 음성 품질 비교 테스트
```yaml
테스트 케이스:
  - 한국어 문장: "안녕하세요. 수학 문제를 풀어보겠습니다."
  - 영어 문장: "Hello, let's practice English conversation."
  - 긴 문장: 300자 이상 튜터 답변
  - 수식 포함: "x의 제곱 더하기 y의 제곱은 25입니다."

평가 기준:
  - 자연스러움: 1-10점
  - 발음 정확도: 1-10점
  - 감정 표현: 1-10점
  - 응답 속도: 측정 (초)
```

#### 4.2 성능 최적화
```yaml
최적화 항목:
  - 오디오 캐싱: 동일 텍스트 재사용
  - 스트리밍: 긴 텍스트 청크 단위 생성
  - 압축: WAV → MP3 변환 (크기 50% 감소)
  - 프리로딩: 자주 사용하는 문구 미리 생성
```

---

## 🚀 배포 전략

### Option A: 로컬 서버 (개발 환경)
```yaml
설정:
  - Kokoro Python 서버 로컬 실행
  - Next.js API가 localhost:8080 호출
  - 개발 중 빠른 테스트 가능

명령어:
  - python scripts/run-kokoro-server.py
  - npm run dev
```

### Option B: Vercel Edge Function (프로덕션) ⭐ 권장
```yaml
설정:
  - Kokoro WASM 빌드
  - Edge Function으로 배포
  - 전 세계 CDN 배포

장점:
  - 무제한 확장성
  - 낮은 지연시간
  - Vercel 무료 티어 사용 가능
```

### Option C: 하이브리드
```yaml
전략:
  - 프로덕션: Google Cloud TTS (고품질, 유료)
  - 개발: Kokoro (무료, 로컬)
  - Fallback: Web Speech API

환경 변수:
  - TTS_ENGINE=kokoro (local)
  - TTS_ENGINE=google (production)
```

---

## 📊 예상 결과

### 음성 품질 개선
```yaml
현재 (Web Speech API):
  - 자연스러움: 4/10
  - 사용자 만족도: 30%
  - 이탈률: 40%

목표 (Kokoro):
  - 자연스러움: 9/10
  - 사용자 만족도: 85%
  - 이탈률: 15%
```

### 성능 지표
```yaml
응답 시간:
  - 짧은 문장 (< 50자): 0.5초
  - 중간 문장 (50-200자): 1-2초
  - 긴 문장 (200+자): 2-4초

비용:
  - Kokoro (로컬): $0
  - Google TTS: ~$100/월 (100만자 기준)
  - Web Speech API: $0
```

---

## 🎯 다음 단계

### 즉시 시작
1. ✅ 현재 TTS 시스템 분석 완료
2. ⏳ Kokoro 설치 및 테스트
3. ⏳ useKokoroTTS 훅 생성
4. ⏳ API Route 구현

### 후속 작업
- [ ] A/B 테스트 (Kokoro vs Web Speech)
- [ ] 사용자 피드백 수집
- [ ] 음성 캐싱 최적화
- [ ] 다양한 목소리 옵션 추가

---

**다음 문서**: `P0-1_KOKORO_IMPLEMENTATION.md` (구현 시작 후 작성)
