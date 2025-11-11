/**
 * Pix2Text OCR - Client-side implementation
 *
 * Calls API route /api/ocr/pix2text
 */

export interface Pix2TextResult {
  success: boolean;
  text: string;
  latex?: string;
  tables?: string[];
  raw?: string;
  confidence: number;
  error?: string;
}

/**
 * Perform OCR using Pix2Text (client-side: calls API)
 */
export async function pix2textOCR(imageBase64: string): Promise<Pix2TextResult> {
  try {
    console.log('[Pix2Text Client] Calling API route...');

    const response = await fetch('/api/ocr/pix2text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as Pix2TextResult;

    console.log('[Pix2Text Client] ✅ Success!');
    return result;

  } catch (error: any) {
    console.error('[Pix2Text Client] Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Check if Pix2Text is available (client: always true, API handles it)
 */
export function isPix2TextAvailable(): boolean {
  return true;
}

/**
 * Get Pix2Text version (client: not available)
 */
export async function getPix2TextVersion(): Promise<string> {
  return 'client-side';
}
