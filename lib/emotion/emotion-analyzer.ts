// lib/emotion/emotion-analyzer.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  EmotionAnalysis,
  EmotionAnalysisRequest,
  EmotionCategory,
  EmotionResponseStrategy,
  VoiceToneAnalysis,
} from '@/types/emotion';
import { EMOTION_RESPONSE_TEMPLATES } from '@/types/emotion';

/**
 * Gemini API를 활용한 감정 분석 엔진
 */
export class EmotionAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is required for emotion analysis');
    }

    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * 텍스트 및 음성 톤 기반 감정 분석
   */
  async analyzeEmotion(request: EmotionAnalysisRequest): Promise<EmotionAnalysis> {
    const prompt = this.buildAnalysisPrompt(request);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON 응답 파싱
      const emotionData = this.parseEmotionResponse(text);

      return {
        ...emotionData,
        timestamp: new Date(),
        source: request.voiceTone ? 'combined' : 'text',
      };
    } catch (error: any) {
      // 구체적인 에러 로깅
      if (error.status === 403) {
        console.error('🔐 Emotion analysis: API Key authentication failed');
      } else if (error.status === 429) {
        console.error('⏱️ Emotion analysis: Rate limit exceeded');
      } else {
        console.error('❌ Emotion analysis error:', error);
      }

      // 폴백: 중립 감정 반환
      return {
        ...this.getFallbackEmotion(),
        timestamp: new Date(),
        source: 'text',
      };
    }
  }

  /**
   * Gemini API용 감정 분석 프롬프트 생성
   */
  private buildAnalysisPrompt(request: EmotionAnalysisRequest): string {
    const { text, conversationContext, voiceTone, learningContext } = request;

    let prompt = `You are an empathetic AI tutor analyzing student emotions during a learning session.

**Student's Message**: "${text}"
`;

    if (conversationContext && conversationContext.length > 0) {
      prompt += `\n**Recent Conversation**:
${conversationContext.slice(-3).map((msg, i) => `${i + 1}. ${msg}`).join('\n')}
`;
    }

    if (voiceTone) {
      prompt += `\n**Voice Analysis**:
- Speech Rate: ${voiceTone.speechRate ? `${voiceTone.speechRate} wpm` : 'N/A'}
- Volume: ${voiceTone.volume ? `${voiceTone.volume} dB` : 'N/A'}
- Energy: ${voiceTone.energy ? voiceTone.energy.toFixed(2) : 'N/A'}
- Pitch Variability: ${voiceTone.variability ? voiceTone.variability.toFixed(2) : 'N/A'}
`;
    }

    if (learningContext) {
      prompt += `\n**Learning Context**:
- Subject: ${learningContext.subject === 'math' ? 'Mathematics' : 'English'}
- Difficulty: ${learningContext.difficulty}
- Recent Performance: ${learningContext.recentPerformance || 'Unknown'}
`;
    }

    prompt += `
**Task**: Analyze the student's emotional state based on:
1. The content and tone of their message
2. Voice characteristics (if provided)
3. Learning context and recent performance
4. Conversation history

**Emotion Categories**: happy, excited, confident, neutral, confused, frustrated, anxious, bored, tired

**Output Format** (JSON only, no extra text):
{
  "primary": "emotion_category",
  "intensity": 0.0-1.0,
  "secondary": ["emotion_category"],
  "scores": {
    "happy": 0.0-1.0,
    "excited": 0.0-1.0,
    "confident": 0.0-1.0,
    "neutral": 0.0-1.0,
    "confused": 0.0-1.0,
    "frustrated": 0.0-1.0,
    "anxious": 0.0-1.0,
    "bored": 0.0-1.0,
    "tired": 0.0-1.0
  },
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of emotional state analysis"
}

**Analysis Guidelines**:
- High speech rate + high energy = excited/happy
- Low speech rate + low energy = tired/bored
- Uncertainty words ("I don't know", "maybe") = confused/anxious
- Negative words ("difficult", "can't") = frustrated
- Question marks + hesitation = confused
- Exclamation marks + positive words = excited/happy
- Monotone voice = bored/neutral

Return ONLY the JSON, no markdown formatting.`;

    return prompt;
  }

  /**
   * Gemini API 응답 파싱
   */
  private parseEmotionResponse(responseText: string): Omit<EmotionAnalysis, 'timestamp' | 'source'> {
    try {
      // JSON 블록 추출 (```json...``` 제거)
      let jsonText = responseText.trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const parsed = JSON.parse(jsonText);

      return {
        primary: parsed.primary as EmotionCategory,
        intensity: Math.max(0, Math.min(1, parsed.intensity)),
        secondary: parsed.secondary?.slice(0, 2) || [],
        scores: parsed.scores || {},
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
      };
    } catch (error) {
      console.error('Failed to parse emotion response:', error);
      return this.getFallbackEmotion();
    }
  }

  /**
   * 폴백 감정 (에러 시)
   */
  private getFallbackEmotion(): Omit<EmotionAnalysis, 'timestamp' | 'source'> {
    return {
      primary: 'neutral',
      intensity: 0.5,
      secondary: [],
      scores: { neutral: 1.0 },
      confidence: 0.3,
    };
  }

  /**
   * 감정 기반 응답 전략 생성
   */
  getResponseStrategy(emotion: EmotionAnalysis): EmotionResponseStrategy {
    const baseStrategy = EMOTION_RESPONSE_TEMPLATES[emotion.primary];

    // 감정 강도에 따라 전략 조정
    const adjustedStrategy: EmotionResponseStrategy = { ...baseStrategy };

    if (emotion.intensity > 0.7) {
      // 강한 감정일 때
      if (['frustrated', 'anxious', 'tired'].includes(emotion.primary)) {
        adjustedStrategy.suggestBreak = true;
        adjustedStrategy.explanationDetail = 'detailed';
      } else if (['excited', 'happy'].includes(emotion.primary)) {
        adjustedStrategy.adjustDifficulty = 'harder';
      }
    } else if (emotion.intensity < 0.3) {
      // 약한 감정일 때
      adjustedStrategy.includeEncouragement = true;
    }

    return adjustedStrategy;
  }

  /**
   * 감정 기반 격려 메시지 생성
   */
  getEncouragementMessage(emotion: EmotionCategory): string {
    const messages: Record<EmotionCategory, string[]> = {
      happy: [
        '좋아요! 이 기세를 이어가봐요! 🎉',
        '정말 잘하고 있어요! 계속해요! 😊',
        '완벽해요! 이대로만 가면 돼요! ✨',
      ],
      excited: [
        '열정이 대단해요! 멋져요! 🔥',
        '이 에너지 정말 좋아요! 🌟',
        '의욕이 넘치네요! 최고예요! 💪',
      ],
      confident: [
        '자신감 있는 모습 멋져요! 👍',
        '이 자신감 그대로 유지해요! 💪',
        '정말 잘 알고 있네요! 👏',
      ],
      neutral: [
        '차근차근 함께 풀어가요 📚',
        '잘 집중하고 있어요 ✍️',
        '좋아요, 계속 진행해봐요 📖',
      ],
      confused: [
        '괜찮아요, 천천히 이해해봐요 🤗',
        '어려울 수 있어요. 함께 다시 살펴볼까요? 💭',
        '좋은 질문이에요! 같이 풀어봐요 🔍',
      ],
      frustrated: [
        '힘들 수 있어요. 잠깐 쉬었다 해도 돼요 🌈',
        '어려운 부분이네요. 다른 방법으로 설명해볼게요 💡',
        '괜찮아요, 천천히 가도 돼요. 함께 해요 🤝',
      ],
      anxious: [
        '걱정하지 마세요. 천천히 해도 돼요 🌟',
        '불안하실 수 있어요. 편하게 질문해요 💙',
        '괜찮아요. 실수해도 괜찮으니 편하게 해요 🌸',
      ],
      bored: [
        '조금 더 재미있는 문제로 가볼까요? 🎯',
        '다른 방식으로 해볼까요? 🎨',
        '새로운 도전을 해봐요! 🚀',
      ],
      tired: [
        '피곤해 보여요. 잠깐 쉬었다 할까요? ☕',
        '무리하지 마세요. 휴식이 필요해 보여요 🛋️',
        '오늘은 여기까지 하고 내일 다시 해도 좋아요 😴',
      ],
    };

    const emotionMessages = messages[emotion];
    return emotionMessages[Math.floor(Math.random() * emotionMessages.length)];
  }
}

/**
 * 싱글톤 인스턴스
 */
let emotionAnalyzerInstance: EmotionAnalyzer | null = null;

export function getEmotionAnalyzer(): EmotionAnalyzer {
  if (!emotionAnalyzerInstance) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    emotionAnalyzerInstance = new EmotionAnalyzer(apiKey);
  }
  return emotionAnalyzerInstance;
}
