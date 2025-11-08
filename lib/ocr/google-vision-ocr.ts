/**
 * Google Cloud Vision OCR
 *
 * Fallback OCR for general text recognition
 * Accuracy: 98% (general text), 70-80% (math equations)
 *
 * API Documentation: https://cloud.google.com/vision/docs/ocr
 */

export interface GoogleVisionOCRResult {
  text: string;
  confidence: number;
  error?: string;
}

/**
 * Perform OCR on image using Google Cloud Vision API
 *
 * @param imageBase64 - Base64 encoded image (without data:image/... prefix)
 * @returns Recognized text
 */
export async function googleVisionOCR(imageBase64: string): Promise<GoogleVisionOCRResult> {
  try {
    // Get API key - check multiple sources for client-side compatibility
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY ||
                   (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_GOOGLE_VISION_API_KEY);

    console.log('[Google Vision OCR] API key check:', apiKey ? `✅ Found (${apiKey.substring(0, 10)}...)` : '❌ Not found');

    if (!apiKey) {
      throw new Error('Google Vision API key not configured');
    }

    console.log('[Google Vision OCR] Starting OCR request...');

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION', // Optimized for handwriting and documents
                  maxResults: 1,
                },
              ],
              imageContext: {
                // Prioritize English/numbers for math, Korean as last resort
                languageHints: ['en-t-i0-handwrit', 'en'], // Removed 'ko' to prevent Korean misrecognition
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Google Vision OCR] API error:', response.status, errorData);
      throw new Error(`Google Vision API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('[Google Vision OCR] Response received:', data.responses?.[0]?.textAnnotations?.length || 0, 'annotations');

    const textAnnotations = data.responses?.[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      console.warn('[Google Vision OCR] No text detected in image');
      return {
        text: '',
        confidence: 0,
      };
    }

    // First annotation contains full text
    let fullText = textAnnotations[0].description || '';
    console.log(`[Google Vision OCR] Raw result: "${fullText}" (${fullText.length} chars)`);

    // Log all individual annotations for debugging fractions
    if (textAnnotations.length > 1) {
      console.log(`[Google Vision OCR] Found ${textAnnotations.length} individual text blocks:`);
      textAnnotations.slice(1).forEach((annotation: any, idx: number) => {
        const bounds = annotation.boundingPoly?.vertices;
        const y = bounds?.[0]?.y || 0;
        console.log(`  [${idx + 1}] "${annotation.description}" at Y=${y}`);
      });
    }

    // Special handling for fractions: detect vertical structure
    if (textAnnotations.length >= 3) {
      // Get individual text blocks with their Y coordinates
      const blocks = textAnnotations.slice(1).map((ann: any) => ({
        text: ann.description || '',
        y: ann.boundingPoly?.vertices?.[0]?.y || 0,
        x: ann.boundingPoly?.vertices?.[0]?.x || 0,
      }));

      // Sort by Y coordinate (top to bottom)
      blocks.sort((a: any, b: any) => a.y - b.y);

      // Check if we have vertical alignment (likely a fraction)
      // If top block and bottom block have significant Y difference
      if (blocks.length >= 2) {
        const topBlock = blocks[0];
        const bottomBlock = blocks[blocks.length - 1];
        const yDiff = bottomBlock.y - topBlock.y;

        // If Y difference > 30px, likely a fraction
        if (yDiff > 30) {
          // Extract only digit blocks
          const digitBlocks = blocks.filter((b: any) => /^\d+$/.test(b.text.trim()));

          if (digitBlocks.length >= 2) {
            // Construct fraction: numerator/denominator
            const numerator = digitBlocks[0].text.trim();
            const denominator = digitBlocks[digitBlocks.length - 1].text.trim();
            const fractionText = `${numerator}/${denominator}`;

            console.log(`[Google Vision OCR] 🎯 Fraction detected! "${numerator}" over "${denominator}" → "${fractionText}"`);

            return {
              text: fractionText,
              confidence: 0.85,
            };
          }
        }
      }
    }

    // Post-processing: Clean up text for math context
    // Remove Korean characters that might be misrecognized numbers/symbols
    const originalText = fullText;
    fullText = fullText
      .replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '') // Remove Korean characters
      .replace(/[^\d+\-*/()=.\s\/]/g, '') // Keep only math symbols, numbers, spaces
      .trim();

    if (fullText !== originalText) {
      console.log(`[Google Vision OCR] Filtered to math symbols: "${originalText}" → "${fullText}"`);
    }

    // If filtering removed everything, return original
    if (!fullText || fullText.length === 0) {
      console.warn('[Google Vision OCR] Filtering removed all text, returning original');
      fullText = originalText;
    }

    console.log(`[Google Vision OCR] ✅ Success! Final text: "${fullText}" (${fullText.length} chars)`);

    return {
      text: fullText,
      confidence: 0.8, // Google doesn't provide confidence for text detection
    };

  } catch (error) {
    console.error('Google Vision OCR error:', error);
    throw error;
  }
}

/**
 * Check if Google Vision API is available (key configured)
 */
export function isGoogleVisionAvailable(): boolean {
  // Check both process.env and direct env variable for client-side compatibility
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY ||
                 (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_GOOGLE_VISION_API_KEY);

  const available = !!apiKey;
  console.log(`[Google Vision] API availability check: ${available ? '✅ Available' : '❌ Not available'}`);

  return available;
}
