/**
 * Gemini Vision OCR - Client-side implementation
 *
 * Calls API route /api/ocr/gemini-vision
 */

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
 * Analyze image using Gemini Vision (client-side: calls API)
 * @param imageBase64 - Base64 encoded image
 * @param isHandwriting - True for handwritten math recognition
 */
export async function geminiVisionOCR(imageBase64: string, isHandwriting = false): Promise<GeminiVisionResult> {
  try {
    const mode = isHandwriting ? 'handwriting' : 'photo';
    console.log(`[Gemini Vision Client] Calling API route for ${mode}...`);

    const response = await fetch('/api/ocr/gemini-vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        isHandwriting
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as GeminiVisionResult;

    console.log('[Gemini Vision Client] ✅ Success!');
    console.log(`  - Text: ${result.text?.length || 0} chars`);
    console.log(`  - Diagram: ${result.diagramDescription ? 'Yes' : 'No'}`);
    console.log(`  - Formulas: ${result.formulas?.length || 0}`);

    return result;

  } catch (error: any) {
    console.error('[Gemini Vision Client] Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Check if Gemini Vision is available (client: always true, API handles it)
 */
export function isGeminiVisionAvailable(): boolean {
  return true;
}
