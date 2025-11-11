/**
 * Gemini Vision OCR - Advanced Image Understanding
 *
 * Uses Google Gemini Vision API to analyze images and extract:
 * - Text content (Korean, English, Math symbols)
 * - Diagrams and visual elements descriptions
 * - Mathematical formulas and equations
 * - Tables and structured data
 * - Geometric shapes and their relationships
 *
 * This goes beyond traditional OCR by understanding visual context.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { vertexAIClient } from '@/lib/ai/vertex-client';
import { HANDWRITING_PROMPT } from './gemini-vision-handwriting-prompt';
import { postProcessOCR, getCorrectionSummary, type PostProcessResult } from './ocr-postprocessor';

export interface GeminiVisionResult {
  success: boolean;
  text: string;
  diagramDescription?: string;
  formulas?: string[];
  tables?: string[];
  visualElements?: string[];
  confidence: number;
  error?: string;
  corrections?: number; // Number of post-processing corrections applied
  correctionSummary?: string; // Summary of corrections
}

/**
 * Analyze image using Gemini Vision API
 *
 * @param imageBase64 - Base64 encoded image data
 * @param isHandwriting - True for handwritten math recognition (uses specialized prompt)
 * @returns Comprehensive analysis including text, diagrams, and visual elements
 */
export async function geminiVisionOCR(imageBase64: string, isHandwriting = false): Promise<GeminiVisionResult> {
  try {
    console.log('[Gemini Vision] Starting advanced image analysis...');

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    // Check if Vertex AI is enabled for unlimited OCR
    const isVertexAIEnabled = process.env.ENABLE_VERTEX_AI === 'true';

    if (isVertexAIEnabled) {
      console.log('[Gemini Vision] Using Vertex AI (unlimited quota)');
      return await geminiVisionOCRVertexAI(base64Data, isHandwriting);
    }

    // Fallback to regular Gemini API (free tier with rate limits)
    console.log('[Gemini Vision] Using Gemini API (free tier)');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Prepare image data for Gemini
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg', // Gemini supports jpeg, png, webp
      },
    };

    // Choose prompt based on input type
    const prompt = isHandwriting ? HANDWRITING_PROMPT : `🎯 당신의 임무: 이 이미지에서 **도형/다이어그램을 절대 놓치지 말고** 모든 시각적 요소를 찾아내세요!

🔍 **1단계: 먼저 이미지 전체를 스캔하여 도형이 있는지 확인하세요**
- 문제 안에 작은 삼각형, 사각형, 원 등이 숨어있지 않나요?
- 그래프, 좌표계, 수직선은 없나요?
- 점들이 레이블(A, B, C 등)과 함께 표시되어 있나요?
- 변에 길이나 각도가 표시되어 있나요?

📋 **분석 순서** (반드시 이 순서로 진행):

**STEP 1: 도형/다이어그램 찾기** (⭐⭐⭐ 가장 중요!)
이미지를 매우 세밀하게 스캔하여:
- 삼각형, 사각형, 원, 다각형 등 모든 기하학적 도형
- 그래프, 좌표계, 함수 그래프
- 수직선, 선분, 각도 표시
- 점 레이블 (A, B, C, P, Q 등)
- 변의 길이 표시 (숫자 + 단위)
- 각도 표시 (°, 호 등)

⚠️ **중요**: 도형이 문제 텍스트 중간에 작게 삽입되어 있을 수 있습니다!
텍스트만 보지 말고, 이미지의 모든 영역을 꼼꼼히 살펴보세요!

**STEP 2: 텍스트 추출**
- 모든 한글, 영어, 숫자, 수학 기호
- 문제 번호, 제목, 본문, 선택지

**STEP 3: 수학 공식**
- 수식을 LaTeX 형식으로 변환

**STEP 4: 표/테이블**
- 표 구조가 있다면 마크다운 형식

**STEP 5: 기타 시각적 요소**
- 화살표, 강조선, 밑줄 등

📤 **응답 형식** (반드시 이 형식 사용):

## 다이어그램
[이미지를 스캔한 결과, 발견한 모든 도형을 자세히 설명]
[예시: "삼각형 ABC가 있으며, 점 A는 위쪽, 점 B는 왼쪽 하단, 점 C는 오른쪽 하단에 위치. 변 AB의 길이는 5cm로 표시되어 있음. 각 C에 직각 표시가 있음."]

⚠️ 도형이 정말로 없다면 "이미지 전체를 스캔했으나 도형/다이어그램이 발견되지 않음"이라고 명시하세요.
⚠️ 절대로 성급하게 "없음"이라고 답하지 마세요! 작은 도형도 찾아내야 합니다!

## 텍스트
[추출된 모든 텍스트]

## 수식
[LaTeX 형식의 수학 공식들]

## 표
[마크다운 테이블]

## 시각적 요소
[기타 시각 정보]

💡 팁: 수학 문제 이미지의 90%에는 도형이 포함되어 있습니다. 반드시 찾아내세요!`;

    // Call Gemini Vision API (using Gemini 2.5 Flash - stable with generous free tier)
    // Free tier: 10 RPM, 250 RPD, 250K tokens/min
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result_response = await model.generateContent([
      prompt,
      imagePart,
    ]);

    // Extract text from response
    const result = result_response.response.text();
    console.log('[Gemini Vision] Raw result length:', result.length);

    // Parse the structured response
    const parsed = parseGeminiVisionResponse(result);

    // Apply post-processing corrections to text
    const postProcessResult = postProcessOCR(
      parsed.text,
      0.95, // Base confidence
      result // Use full response as context
    );

    // Apply post-processing to formulas as well
    const correctedFormulas = parsed.formulas?.map(formula =>
      postProcessOCR(formula, 0.95, result).corrected
    );

    const correctionSummary = getCorrectionSummary(postProcessResult);

    console.log('[Gemini Vision] ✅ Analysis complete');
    console.log(`  - Text: ${postProcessResult.corrected.length} chars`);
    console.log(`  - Diagrams: ${parsed.diagramDescription ? 'Yes' : 'No'}`);
    console.log(`  - Formulas: ${parsed.formulas?.length || 0}`);
    console.log(`  - Tables: ${parsed.tables?.length || 0}`);
    console.log(`  - Visual elements: ${parsed.visualElements?.length || 0}`);
    console.log(`  - Post-processing: ${correctionSummary}`);

    return {
      success: true,
      text: postProcessResult.corrected,
      diagramDescription: parsed.diagramDescription,
      formulas: correctedFormulas,
      tables: parsed.tables,
      visualElements: parsed.visualElements,
      confidence: postProcessResult.confidence,
      corrections: postProcessResult.corrections.length,
      correctionSummary,
    };

  } catch (error: any) {
    console.error('[Gemini Vision] Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message || 'Gemini Vision analysis failed',
    };
  }
}

/**
 * Parse Gemini's structured response
 */
function parseGeminiVisionResponse(response: string): {
  text: string;
  diagramDescription?: string;
  formulas?: string[];
  tables?: string[];
  visualElements?: string[];
} {
  const sections = {
    text: '',
    diagramDescription: undefined as string | undefined,
    formulas: [] as string[],
    tables: [] as string[],
    visualElements: [] as string[],
  };

  // Split by markdown headers
  const lines = response.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    // Detect section headers
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        saveSection(sections, currentSection, currentContent.join('\n').trim());
      }

      // Start new section
      currentSection = line.replace('## ', '').trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection && currentContent.length > 0) {
    saveSection(sections, currentSection, currentContent.join('\n').trim());
  }

  return sections;
}

/**
 * Save parsed section content
 */
function saveSection(
  sections: any,
  sectionName: string,
  content: string
) {
  if (!content || content === '없음' || content.toLowerCase() === 'none') {
    return;
  }

  const normalized = sectionName.toLowerCase();

  if (normalized.includes('텍스트') || normalized.includes('text')) {
    sections.text = content;
  } else if (normalized.includes('다이어그램') || normalized.includes('diagram') || normalized.includes('그래프') || normalized.includes('graph')) {
    sections.diagramDescription = content;
  } else if (normalized.includes('수식') || normalized.includes('formula') || normalized.includes('equation')) {
    // Split multiple formulas
    sections.formulas = content.split('\n').filter(line => line.trim().length > 0);
  } else if (normalized.includes('표') || normalized.includes('table')) {
    sections.tables = [content];
  } else if (normalized.includes('시각') || normalized.includes('visual')) {
    sections.visualElements = content.split('\n').filter(line => line.trim().length > 0);
  }
}

/**
 * Check if Gemini Vision API is available
 */
export function isGeminiVisionAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Get Gemini Vision API status
 */
export function getGeminiVisionStatus(): {
  available: boolean;
  model: string;
  features: string[];
} {
  return {
    available: isGeminiVisionAvailable(),
    model: 'gemini-2.5-flash',
    features: [
      'Text extraction (Korean, English, Math)',
      'Diagram and graph understanding',
      'Visual element description',
      'Mathematical formula recognition',
      'Table structure extraction',
      'Geometric relationship analysis',
    ],
  };
}

/**
 * Gemini Vision OCR using Vertex AI (unlimited quota)
 */
async function geminiVisionOCRVertexAI(imageBase64: string, isHandwriting = false): Promise<GeminiVisionResult> {
  try {
    // Choose prompt based on input type
    const prompt = isHandwriting ? HANDWRITING_PROMPT : `🎯 당신의 임무: 이 이미지에서 **도형/다이어그램을 절대 놓치지 말고** 모든 시각적 요소를 찾아내세요!

🔍 **1단계: 먼저 이미지 전체를 스캔하여 도형이 있는지 확인하세요**
- 문제 안에 작은 삼각형, 사각형, 원 등이 숨어있지 않나요?
- 그래프, 좌표계, 수직선은 없나요?
- 점들이 레이블(A, B, C 등)과 함께 표시되어 있나요?
- 변에 길이나 각도가 표시되어 있나요?

📋 **분석 순서** (반드시 이 순서로 진행):

**STEP 1: 도형/다이어그램 찾기** (⭐⭐⭐ 가장 중요!)
이미지를 매우 세밀하게 스캔하여:
- 삼각형, 사각형, 원, 다각형 등 모든 기하학적 도형
- 그래프, 좌표계, 함수 그래프
- 수직선, 선분, 각도 표시
- 점 레이블 (A, B, C, P, Q 등)
- 변의 길이 표시 (숫자 + 단위)
- 각도 표시 (°, 호 등)

⚠️ **중요**: 도형이 문제 텍스트 중간에 작게 삽입되어 있을 수 있습니다!
텍스트만 보지 말고, 이미지의 모든 영역을 꼼꼼히 살펴보세요!

**STEP 2: 텍스트 추출**
- 모든 한글, 영어, 숫자, 수학 기호
- 문제 번호, 제목, 본문, 선택지

**STEP 3: 수학 공식**
- 수식을 LaTeX 형식으로 변환

**STEP 4: 표/테이블**
- 표 구조가 있다면 마크다운 형식

**STEP 5: 기타 시각적 요소**
- 화살표, 강조선, 밑줄 등

📤 **응답 형식** (반드시 이 형식 사용):

## 다이어그램
[이미지를 스캔한 결과, 발견한 모든 도형을 자세히 설명]
[예시: "삼각형 ABC가 있으며, 점 A는 위쪽, 점 B는 왼쪽 하단, 점 C는 오른쪽 하단에 위치. 변 AB의 길이는 5cm로 표시되어 있음. 각 C에 직각 표시가 있음."]

⚠️ 도형이 정말로 없다면 "이미지 전체를 스캔했으나 도형/다이어그램이 발견되지 않음"이라고 명시하세요.
⚠️ 절대로 성급하게 "없음"이라고 답하지 마세요! 작은 도형도 찾아내야 합니다!

## 텍스트
[추출된 모든 텍스트]

## 수식
[LaTeX 형식의 수학 공식들]

## 표
[마크다운 테이블]

## 시각적 요소
[기타 시각 정보]

💡 팁: 수학 문제 이미지의 90%에는 도형이 포함되어 있습니다. 반드시 찾아내세요!`;

    // Use Vertex AI's image analysis with very low temperature for accurate diagram detection
    const result = await vertexAIClient.analyzeImage(
      imageBase64,
      prompt,
      'flash', // Use flash tier for cost efficiency
      {
        temperature: 0.1, // Very low for precise visual analysis
        maxTokens: 2048,
      }
    );

    console.log('[Gemini Vision] Raw result length:', result.length);

    // Parse the structured response
    const parsed = parseGeminiVisionResponse(result);

    // Apply post-processing corrections to text
    const postProcessResult = postProcessOCR(
      parsed.text,
      0.95, // Base confidence
      result // Use full response as context
    );

    // Apply post-processing to formulas as well
    const correctedFormulas = parsed.formulas?.map(formula =>
      postProcessOCR(formula, 0.95, result).corrected
    );

    const correctionSummary = getCorrectionSummary(postProcessResult);

    console.log('[Gemini Vision] ✅ Analysis complete');
    console.log(`  - Text: ${postProcessResult.corrected.length} chars`);
    console.log(`  - Diagrams: ${parsed.diagramDescription ? 'Yes' : 'No'}`);
    console.log(`  - Formulas: ${parsed.formulas?.length || 0}`);
    console.log(`  - Tables: ${parsed.tables?.length || 0}`);
    console.log(`  - Visual elements: ${parsed.visualElements?.length || 0}`);
    console.log(`  - Post-processing: ${correctionSummary}`);

    return {
      success: true,
      text: postProcessResult.corrected,
      diagramDescription: parsed.diagramDescription,
      formulas: correctedFormulas,
      tables: parsed.tables,
      visualElements: parsed.visualElements,
      confidence: postProcessResult.confidence,
      corrections: postProcessResult.corrections.length,
      correctionSummary,
    };

  } catch (error: any) {
    console.error('[Gemini Vision Vertex AI] Error:', error);

    // Return error result
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message || 'Vertex AI Vision analysis failed',
    };
  }
}
