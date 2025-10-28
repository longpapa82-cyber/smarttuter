import Anthropic from '@anthropic-ai/sdk';

export interface MathProblemRecognition {
  success: boolean;
  problem?: {
    text: string;
    equation?: string;
    topic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    steps?: string[];
  };
  error?: string;
  confidence: number;
}

export class VisionService {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Analyze a math problem image using Claude Vision API
   * @param imageBase64 - Base64 encoded image data
   * @param gradeLevel - Student's grade level for appropriate explanation
   * @returns Recognized math problem with analysis
   */
  async recognizeMathProblem(
    imageBase64: string,
    gradeLevel: 'elementary' | 'middle' | 'high' | 'university'
  ): Promise<MathProblemRecognition> {
    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const gradeLevelContext = {
        elementary: '초등학생 수준의 수학 문제로, 간단하고 이해하기 쉽게 설명해주세요.',
        middle: '중학생 수준의 수학 문제로, 기본 개념과 함께 설명해주세요.',
        high: '고등학생 수준의 수학 문제로, 심화 개념을 포함하여 설명해주세요.',
        university: '대학생 수준의 수학 문제로, 전문적이고 깊이 있게 설명해주세요.',
      };

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: `당신은 수학 문제를 분석하는 AI 튜터입니다. 이미지에서 수학 문제를 인식하고 분석해주세요.

학생 수준: ${gradeLevelContext[gradeLevel]}

다음 형식의 JSON으로 응답해주세요:
{
  "text": "인식된 문제 전체 텍스트",
  "equation": "주요 수식 (있다면)",
  "topic": "문제의 주제/단원 (예: 이차방정식, 삼각함수, 미적분 등)",
  "difficulty": "easy|medium|hard",
  "steps": ["풀이 단계 1", "풀이 단계 2", ...]
}

문제를 명확하게 읽을 수 없다면, "text" 필드에 "이미지가 불명확하여 문제를 인식할 수 없습니다"라고 표시해주세요.`,
              },
            ],
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude Vision API');
      }

      // Parse JSON response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response from Claude Vision API');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Check if problem was recognized
      if (parsed.text.includes('불명확') || parsed.text.includes('인식할 수 없')) {
        return {
          success: false,
          error: '이미지가 불명확하여 문제를 인식할 수 없습니다. 더 선명한 이미지를 업로드해주세요.',
          confidence: 0,
        };
      }

      return {
        success: true,
        problem: {
          text: parsed.text || '',
          equation: parsed.equation,
          topic: parsed.topic,
          difficulty: parsed.difficulty || 'medium',
          steps: parsed.steps || [],
        },
        confidence: 0.85, // Claude Vision is highly accurate
      };
    } catch (error: any) {
      console.error('Vision recognition error:', error);

      // Check for API credit/authentication errors
      if (error?.status === 401 || error?.message?.includes('authentication') || error?.message?.includes('API key')) {
        return {
          success: false,
          error: '⚠️ API 인증 오류: 관리자에게 문의하여 API 키를 확인해주세요.',
          confidence: 0,
        };
      }

      if (error?.status === 429 || error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
        return {
          success: false,
          error: '💳 Claude API 크레딧이 부족합니다. 관리자에게 크레딧 충전을 요청해주세요.',
          confidence: 0,
        };
      }

      return {
        success: false,
        error: error?.message || '이미지 인식 중 오류가 발생했습니다. 다시 시도해주세요.',
        confidence: 0,
      };
    }
  }

  /**
   * Recognize handwritten math problem
   * Optimized for handwriting recognition with specific instructions
   */
  async recognizeHandwrittenMath(
    imageBase64: string,
    gradeLevel: 'elementary' | 'middle' | 'high' | 'university'
  ): Promise<MathProblemRecognition> {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: `이미지의 손글씨 수학 문제를 정확히 읽어주세요.

학생 수준: ${gradeLevel}학교

다음 형식의 JSON으로 응답해주세요:
{
  "text": "인식된 문제 (손글씨를 정자로 변환)",
  "equation": "주요 수식",
  "topic": "주제",
  "difficulty": "easy|medium|hard",
  "steps": ["풀이 힌트"]
}

손글씨가 읽기 어렵다면, 가장 가능성 높은 해석을 제공하고 불확실한 부분을 명시해주세요.`,
              },
            ],
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude Vision API');
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        problem: {
          text: parsed.text || '',
          equation: parsed.equation,
          topic: parsed.topic,
          difficulty: parsed.difficulty || 'medium',
          steps: parsed.steps || [],
        },
        confidence: 0.75, // Slightly lower confidence for handwriting
      };
    } catch (error: any) {
      console.error('Handwriting recognition error:', error);

      // Check for API credit/authentication errors
      if (error?.status === 401 || error?.message?.includes('authentication') || error?.message?.includes('API key')) {
        return {
          success: false,
          error: '⚠️ API 인증 오류: 관리자에게 문의하여 API 키를 확인해주세요.',
          confidence: 0,
        };
      }

      if (error?.status === 429 || error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
        return {
          success: false,
          error: '💳 Claude API 크레딧이 부족합니다. 관리자에게 크레딧 충전을 요청해주세요.',
          confidence: 0,
        };
      }

      return {
        success: false,
        error: error?.message || '손글씨 인식 중 오류가 발생했습니다.',
        confidence: 0,
      };
    }
  }

  /**
   * Quick verification if image contains math content
   * Fast pre-check before full recognition
   */
  async verifyMathContent(imageBase64: string): Promise<boolean> {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: '이 이미지에 수학 문제나 수식이 포함되어 있나요? "예" 또는 "아니오"로만 답해주세요.',
              },
            ],
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        return false;
      }

      return textContent.text.toLowerCase().includes('예');
    } catch (error) {
      console.error('Math content verification error:', error);
      return false; // Default to false on error
    }
  }
}

// Singleton instance for server-side usage
let visionServiceInstance: VisionService | null = null;

export function getVisionService(): VisionService {
  if (!visionServiceInstance) {
    visionServiceInstance = new VisionService();
  }
  return visionServiceInstance;
}
