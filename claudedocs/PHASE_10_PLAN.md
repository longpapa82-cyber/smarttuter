# Phase 10: 실시간 음성 튜터 시스템

## 🎯 목표
학생들이 음성으로 실시간 대화하며 학습할 수 있는 AI 튜터 시스템 구현

## 📊 리서치 결과

### 세계 최고 수준 음성 튜터 분석
1. **Loora** - 실시간 피드백, 발음 교정
2. **Speak** - 즉각적인 음성 피드백
3. **ELSA Speak** - 발음 분석 및 교정
4. **Khanmigo** - 답을 주지 않고 가이드하는 방식 (Socratic method)
5. **ChatGPT Voice** - 자연스러운 대화 흐름

### 핵심 인사이트
- **즉각적인 피드백**: 발음, 문법, 개념 이해도를 실시간으로 평가
- **Socratic 접근**: 답을 직접 주지 않고 질문으로 유도 (특히 수학)
- **자연스러운 대화**: 인간과 대화하는 느낌
- **개인화**: 학생 수준에 맞는 난이도 조절

## 🏗️ 시스템 아키텍처

### 기술 스택 선택

#### Option 1: MCP Voice Mode (현재 설치됨) ✅ **추천**
```typescript
// 장점:
- 이미 설치되어 있음 (mcp__voice-mode__converse)
- STT/TTS 통합
- 간단한 구현
- 빠른 응답 시간

// 구현:
import { mcp__voice_mode__converse } from '@/mcp-tools';

const response = await mcp__voice_mode__converse({
  message: tutorResponse,
  wait_for_response: true,
  listen_duration_max: 60,
});
```

#### Option 2: Custom Speech Pipeline
```typescript
// Speech-to-Text → Claude API → Text-to-Speech
// 복잡하지만 완전한 커스터마이징 가능
```

**선택**: Option 1 (MCP Voice Mode) - 빠른 구현과 안정성

## 📐 설계

### 1. 데이터 모델

```typescript
// /lib/voice-tutor/types.ts

export type TutorSubject = 'english' | 'math';
export type SessionStatus = 'active' | 'paused' | 'completed';

export interface VoiceTutorSession {
  id: string;
  userId: string;
  subject: TutorSubject;
  gradeLevel: GradeLevel;

  // Session data
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  duration: number;              // seconds

  // Conversation
  messages: TutorMessage[];
  currentTopic?: string;
  currentProblem?: string;

  // English specific
  pronunciationScores?: PronunciationFeedback[];
  grammarCorrections?: GrammarCorrection[];

  // Math specific
  problemsSolved?: number;
  conceptsCovered?: string[];
  hintsGiven?: number;

  // Analytics
  speakingTime: number;          // seconds
  listeningTime: number;         // seconds
  interactionCount: number;
  comprehensionScore?: number;   // 0-100

  // Rewards
  xpEarned: number;
  badgesEarned: string[];
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  audioUrl?: string;             // for playback
  timestamp: Date;

  // Metadata
  confidence?: number;           // STT confidence
  duration?: number;             // seconds

  // Feedback
  feedback?: MessageFeedback;
}

export interface MessageFeedback {
  type: 'pronunciation' | 'grammar' | 'concept' | 'encouragement';
  score?: number;                // 0-100
  suggestions?: string[];
  corrections?: string;
}

// English Tutor Specific
export interface PronunciationFeedback {
  word: string;
  expected: string;              // IPA phonetic
  actual: string;                // IPA phonetic
  score: number;                 // 0-100
  suggestions: string[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  rule: string;
  explanation: string;
}

// Math Tutor Specific
export interface MathProblem {
  id: string;
  question: string;
  difficulty: DifficultyLevel;
  topic: string;
  hints: string[];
  solution: string;
  explanation: string;
}
```

### 2. 튜터 엔진

```typescript
// /lib/voice-tutor/engine.ts

export class VoiceTutorEngine {
  private subject: TutorSubject;
  private gradeLevel: GradeLevel;
  private session: VoiceTutorSession;

  constructor(subject: TutorSubject, gradeLevel: GradeLevel) {
    this.subject = subject;
    this.gradeLevel = gradeLevel;
  }

  // Main conversation loop
  async converse(userMessage: string): Promise<string> {
    // 1. Analyze user input
    const analysis = await this.analyzeInput(userMessage);

    // 2. Generate appropriate response
    const response = await this.generateResponse(analysis);

    // 3. Provide feedback
    const feedback = await this.generateFeedback(analysis);

    // 4. Update session
    this.updateSession(userMessage, response, feedback);

    return response;
  }

  private async analyzeInput(message: string) {
    if (this.subject === 'english') {
      return this.analyzeEnglish(message);
    } else {
      return this.analyzeMath(message);
    }
  }

  // English Analysis
  private async analyzeEnglish(message: string) {
    const prompt = `
You are an English tutor analyzing a student's spoken message.

Student level: ${this.gradeLevel}
Message: "${message}"

Analyze:
1. Grammar correctness
2. Vocabulary level
3. Sentence structure
4. Common errors

Return JSON:
{
  "grammarScore": 0-100,
  "vocabularyLevel": "elementary|intermediate|advanced",
  "errors": [{ "type": "grammar|vocabulary|structure", "text": "", "correction": "" }],
  "strengths": []
}
    `;

    // Call Claude API
    const response = await this.callClaude(prompt);
    return JSON.parse(response);
  }

  // Math Analysis
  private async analyzeMath(message: string) {
    const prompt = `
You are a math tutor analyzing a student's response.

Student level: ${this.gradeLevel}
Current problem: ${this.session.currentProblem}
Student answer: "${message}"

Analyze:
1. Is the answer correct?
2. Understanding of concept
3. Common misconceptions
4. Next guidance step

Use Socratic method - guide, don't give answers.

Return JSON:
{
  "isCorrect": boolean,
  "understanding": "none|partial|full",
  "misconceptions": [],
  "nextHint": "",
  "encouragement": ""
}
    `;

    const response = await this.callClaude(prompt);
    return JSON.parse(response);
  }

  private async callClaude(prompt: string): Promise<string> {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].type === 'text'
      ? response.content[0].text
      : '';
  }
}
```

### 3. English Tutor 전용 기능

```typescript
// /lib/voice-tutor/english-tutor.ts

export class EnglishVoiceTutor extends VoiceTutorEngine {
  private conversationStarters = {
    elementary: [
      "Hello! What's your favorite color?",
      "Can you tell me about your family?",
      "What did you do today?",
    ],
    middle: [
      "What are your hobbies?",
      "Can you describe your best friend?",
      "What's your favorite book or movie?",
    ],
    high: [
      "What are your plans for the future?",
      "Can you explain a recent news event?",
      "Discuss a topic you're passionate about.",
    ],
    university: [
      "Let's discuss current global issues.",
      "Can you present an argument for or against...?",
      "Analyze this complex topic...",
    ],
  };

  async startConversation(): Promise<string> {
    const starters = this.conversationStarters[this.gradeLevel];
    const starter = starters[Math.floor(Math.random() * starters.length)];

    return `Hi! I'm your English speaking tutor. ${starter}`;
  }

  async analyzePronunciation(audioData: string): Promise<PronunciationFeedback[]> {
    // 실제로는 Google Speech-to-Text나 Azure Speech API 사용
    // 여기서는 시뮬레이션
    return [];
  }

  async correctGrammar(message: string): Promise<GrammarCorrection[]> {
    const prompt = `
Analyze grammar in this sentence and provide corrections:

"${message}"

Return JSON array of corrections:
[{
  "original": "text with error",
  "corrected": "corrected text",
  "rule": "grammar rule name",
  "explanation": "why this is the correction"
}]
    `;

    const response = await this.callClaude(prompt);
    return JSON.parse(response);
  }
}
```

### 4. Math Tutor 전용 기능

```typescript
// /lib/voice-tutor/math-tutor.ts

export class MathVoiceTutor extends VoiceTutorEngine {
  private currentProblem: MathProblem | null = null;
  private hintsUsed: number = 0;

  async generateProblem(topic?: string): Promise<MathProblem> {
    const prompt = `
Generate a math problem for ${this.gradeLevel} student.
${topic ? `Topic: ${topic}` : ''}

Requirements:
- Appropriate difficulty
- Step-by-step solution
- 3 progressive hints
- Clear explanation

Return JSON:
{
  "question": "",
  "difficulty": 1-5,
  "topic": "",
  "hints": ["hint1", "hint2", "hint3"],
  "solution": "",
  "explanation": ""
}
    `;

    const response = await this.callClaude(prompt);
    this.currentProblem = JSON.parse(response);
    return this.currentProblem;
  }

  async giveHint(): Promise<string> {
    if (!this.currentProblem) return "Let me give you a problem first!";

    if (this.hintsUsed >= this.currentProblem.hints.length) {
      return "You've used all hints. Let's work through the solution together.";
    }

    const hint = this.currentProblem.hints[this.hintsUsed];
    this.hintsUsed++;

    return `Hint ${this.hintsUsed}: ${hint}`;
  }

  async checkAnswer(studentAnswer: string): Promise<{
    isCorrect: boolean;
    feedback: string;
    nextStep: string;
  }> {
    const prompt = `
Math problem: ${this.currentProblem?.question}
Correct solution: ${this.currentProblem?.solution}
Student answer: "${studentAnswer}"

Is the student correct? Provide encouraging feedback and guide them.
Use Socratic method - don't give the answer directly.

Return JSON:
{
  "isCorrect": boolean,
  "feedback": "encouraging feedback",
  "nextStep": "what should student do next"
}
    `;

    const response = await this.callClaude(prompt);
    return JSON.parse(response);
  }
}
```

## 🎨 UI 컴포넌트

### 1. Voice Tutor Interface

```typescript
// /components/voice-tutor/VoiceTutorInterface.tsx

export default function VoiceTutorInterface({ subject }: { subject: TutorSubject }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [session, setSession] = useState<VoiceTutorSession | null>(null);

  const handleVoiceInput = async () => {
    setIsListening(true);

    // Use MCP Voice Mode
    const response = await mcp__voice_mode__converse({
      message: "Ready to listen...",
      wait_for_response: true,
      listen_duration_max: 60,
      vad_aggressiveness: 2,
    });

    setIsListening(false);

    // Process response
    if (response.transcript) {
      await processUserMessage(response.transcript);
    }
  };

  const processUserMessage = async (transcript: string) => {
    // Add user message
    const userMessage: TutorMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: transcript,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Get tutor response
    const tutorResponse = await getTutorResponse(transcript);

    // Speak response
    setIsSpeaking(true);
    await mcp__voice_mode__converse({
      message: tutorResponse.content,
      wait_for_response: false,
      voice: 'alloy', // friendly voice
    });
    setIsSpeaking(false);

    // Add tutor message
    setMessages(prev => [...prev, tutorResponse]);
  };

  return (
    <div className="voice-tutor-interface">
      {/* Visualization */}
      <AudioVisualizer isActive={isListening || isSpeaking} />

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Controls */}
      <div className="controls">
        <button onClick={handleVoiceInput} disabled={isListening || isSpeaking}>
          {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '🎤 Speak'}
        </button>
      </div>

      {/* Session Stats */}
      <SessionStats session={session} />
    </div>
  );
}
```

### 2. Audio Visualizer

```typescript
// /components/voice-tutor/AudioVisualizer.tsx

export function AudioVisualizer({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <div className="flex items-center justify-center h-full text-6xl">
          {isActive ? '🎤' : '🎯'}
        </div>
      </motion.div>
    </div>
  );
}
```

## 📊 학습 분석 연동

### Phase 7 (Gamification) 연동
- 음성 세션 완료 → XP 획득
- 발음 완벽 → 배지 획득
- 연속 학습 → 스트릭 증가

### Phase 8 (Adaptive Learning) 연동
- 세션 데이터 → 약점 분석
- 난이도 자동 조절
- 개인화된 문제 추천

### Phase 9 (Interactive Learning) 연동
- 대화 내용 → 플래시카드 자동 생성
- 틀린 문제 → 퀴즈 생성
- 학습 노트 자동 작성

## 🎯 구현 순서

### Step 1: 기본 음성 인터페이스 (2시간)
- VoiceTutorInterface 컴포넌트
- MCP Voice Mode 연동
- 기본 대화 흐름

### Step 2: English Tutor (2시간)
- 대화 시작
- 문법 교정
- 피드백 시스템

### Step 3: Math Tutor (2시간)
- 문제 생성
- Socratic 가이드
- 힌트 시스템

### Step 4: 세션 관리 및 분석 (1.5시간)
- 세션 저장
- 통계 계산
- Phase 7/8/9 연동

### Step 5: UI 개선 및 테스트 (1시간)
- 애니메이션
- 에러 처리
- 전체 테스트

**총 예상 시간**: 8.5시간

## 🎁 기대 효과

1. **실시간 피드백**: 즉각적인 발음, 문법 교정
2. **Socratic Learning**: 스스로 생각하게 만드는 수학 학습
3. **자연스러운 대화**: 실제 튜터와 대화하는 경험
4. **개인화**: 학생 수준에 맞는 자동 난이도 조절
5. **통합 학습**: Phase 7/8/9와 완벽한 연동

## 📈 성공 지표

- 평균 세션 시간: 15분 이상
- 학생 만족도: 4.5/5 이상
- 발음 향상도: 세션당 +5% 이상
- 문제 해결률: 70% 이상
