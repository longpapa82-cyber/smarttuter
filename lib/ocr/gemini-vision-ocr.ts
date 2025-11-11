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

    // Initialize Gemini client
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
    const prompt = isHandwriting ? HANDWRITING_PROMPT : `당신은 수학 교육 전문가입니다. 이 이미지를 분석하여 다음 정보를 추출해주세요:

1. **텍스트 내용**: 이미지에 있는 모든 텍스트를 정확하게 추출 (한글, 영어, 숫자, 수학 기호)

2. **다이어그램/그래프 설명**:
   - 도형, 그래프, 좌표계가 있다면 자세히 설명
   - 기하학적 관계 (위치, 거리, 각도)
   - 점, 선, 도형의 레이블과 좌표

3. **수학 공식**:
   - 모든 수학 수식을 LaTeX 형식으로 변환
   - 예: "x² + y² = 25"

4. **표/테이블**:
   - 표 구조가 있다면 마크다운 형식으로 변환

5. **시각적 요소**:
   - 화살표, 각도 표시, 측정값
   - 중요한 시각적 정보

응답 형식:
## 텍스트
[추출된 모든 텍스트]

## 다이어그램
[다이어그램/그래프에 대한 자세한 설명]

## 수식
[LaTeX 형식의 수학 공식들]

## 표
[마크다운 테이블]

## 시각적 요소
[기타 중요한 시각 정보]

이미지에 해당 항목이 없으면 "없음"이라고 표시하세요.`;

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
