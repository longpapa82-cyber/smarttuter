/**
 * Mathpix OCR
 *
 * Industry-leading OCR for STEM content (math equations, chemistry, tables)
 * Accuracy: 99%+ for mathematical expressions
 *
 * API Documentation: https://docs.mathpix.com/#text-from-image
 */

export interface MathpixOCRResult {
  text: string;
  latex: string;
  confidence: number;
  error?: string;
}

/**
 * Perform OCR on image using Mathpix API
 *
 * @param imageBase64 - Base64 encoded image (without data:image/... prefix)
 * @returns Recognized text in LaTeX format
 */
export async function mathpixOCR(imageBase64: string): Promise<MathpixOCRResult> {
  try {
    // Check if API keys are configured
    if (!process.env.NEXT_PUBLIC_MATHPIX_APP_ID || !process.env.NEXT_PUBLIC_MATHPIX_APP_KEY) {
      throw new Error('Mathpix API keys not configured');
    }

    const response = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app_id': process.env.NEXT_PUBLIC_MATHPIX_APP_ID,
        'app_key': process.env.NEXT_PUBLIC_MATHPIX_APP_KEY,
      },
      body: JSON.stringify({
        src: `data:image/jpeg;base64,${imageBase64}`,
        formats: ['text', 'latex_simplified'],
        ocr: ['math', 'text'],
        // Enable Korean language support
        languages: ['en', 'ko'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mathpix API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();

    return {
      text: data.text || '',
      latex: data.latex_simplified || data.latex || '',
      confidence: data.confidence || 0,
    };

  } catch (error) {
    console.error('Mathpix OCR error:', error);
    throw error;
  }
}

/**
 * Convert LaTeX to human-readable math format
 *
 * @param latex - LaTeX string from Mathpix
 * @returns Plain text math expression
 */
export function latexToPlainText(latex: string): string {
  if (!latex) return '';

  // Basic LaTeX to plain text conversion
  let text = latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')  // \frac{a}{b} -> (a)/(b)
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')              // \sqrt{x} -> sqrt(x)
    .replace(/\^(\{[^}]+\}|\d+)/g, '^$1')                   // Keep exponents
    .replace(/\_(\{[^}]+\}|\d+)/g, '_$1')                   // Keep subscripts
    .replace(/\\times/g, '×')                               // \times -> ×
    .replace(/\\div/g, '÷')                                 // \div -> ÷
    .replace(/\\cdot/g, '·')                                // \cdot -> ·
    .replace(/\\pm/g, '±')                                  // \pm -> ±
    .replace(/\\infty/g, '∞')                               // \infty -> ∞
    .replace(/\\left|\\right/g, '')                         // Remove \left \right
    .replace(/[{}]/g, '');                                  // Remove braces

  return text.trim();
}

/**
 * Check if Mathpix API is available (keys configured)
 */
export function isMathpixAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_MATHPIX_APP_ID &&
    process.env.NEXT_PUBLIC_MATHPIX_APP_KEY
  );
}
