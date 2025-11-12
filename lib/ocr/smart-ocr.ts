/**
 * Smart OCR v3 - Advanced Intelligent OCR with Vision AI
 *
 * Priority order (best → fallback):
 * 1. Gemini Vision (BEST for diagrams + text, FREE) - NEW! Understands visual context
 * 2. Tesseract.js (Korean+English, 90%+ accuracy for Korean text) - FREE
 * 3. Pix2Text (95%+ for Chinese, limited Korean) - FREE
 * 4. Google Vision (70-80% math) - Free tier
 * 5. Mathpix (99% accuracy for math) - Premium
 *
 * Features:
 * - Diagram and graph understanding (Gemini Vision)
 * - Visual element description and analysis
 * - Automatic engine selection based on availability
 * - Optimized for Korean + English + Math mixed text
 * - LaTeX formula extraction
 * - Table structure extraction
 * - High accuracy for Korean documents
 */

import { geminiVisionOCR, isGeminiVisionAvailable, type GeminiVisionResult } from './gemini-vision-ocr-client';
import { pix2textOCR, isPix2TextAvailable, type Pix2TextResult } from './pix2text-ocr-client';
import { mathpixOCR, isMathpixAvailable, latexToPlainText } from './mathpix-ocr';
import { googleVisionOCR, isGoogleVisionAvailable } from './google-vision-ocr';
import { postProcessOCR, getCorrectionSummary } from './ocr-postprocessor';
import Tesseract from 'tesseract.js';

export interface SmartOCRv2Result {
  text: string;
  latex?: string;
  tables?: string[];
  confidence: number;
  engine: 'gemini-vision' | 'pix2text' | 'mathpix' | 'google-vision' | 'tesseract';
  fallbackUsed: boolean;
  hasImages?: boolean;
  hasTables?: boolean;
  diagramDescription?: string;
  visualElements?: string[];
  processingTime?: number;
  corrections?: number; // Number of post-processing corrections applied
  correctionSummary?: string; // Summary of corrections
}

/**
 * Perform OCR using the best available engine (v3 with Gemini Vision priority)
 *
 * @param imageFile - Image file to perform OCR on
 * @returns Enhanced OCR result with text, LaTeX, tables, diagrams, and metadata
 */
export async function smartOCRv2(imageFile: File): Promise<SmartOCRv2Result> {
  const startTime = Date.now();
  console.log('🔍 Starting Smart OCR v3 (Vision AI Enhanced)...');

  // Convert image to base64
  const base64 = await fileToBase64(imageFile);

  // ============================================================================
  // Priority 1: Gemini Vision (BEST for diagrams + text, FREE)
  // ============================================================================
  const geminiAvailable = isGeminiVisionAvailable();
  console.log(`[Smart OCR] Gemini Vision available: ${geminiAvailable}`);

  if (geminiAvailable) {
    try {
      console.log('👁️ Trying Gemini Vision (Priority 1 - FREE, BEST for diagrams + text)...');
      console.log(`[Smart OCR] Base64 length: ${base64.length}`);
      const result = await geminiVisionOCR(base64);
      console.log(`[Smart OCR] Gemini Vision result:`, result);

      if (result.success && result.confidence > 0.7) {
        const processingTime = Date.now() - startTime;
        console.log(`✅ Gemini Vision successful: ${result.confidence} (${processingTime}ms)`);
        console.log(`   - Text: ${result.text.substring(0, 100)}...`);
        console.log(`   - Diagram: ${result.diagramDescription ? 'Yes' : 'No'}`);
        console.log(`   - Formulas: ${result.formulas?.length || 0}`);
        console.log(`   - Tables: ${result.tables?.length || 0}`);
        console.log(`   - Visual elements: ${result.visualElements?.length || 0}`);

        // Combine all content for comprehensive context
        let fullText = result.text;

        if (result.diagramDescription) {
          fullText += '\n\n[다이어그램 설명]\n' + result.diagramDescription;
        }

        let latex = '';
        if (result.formulas && result.formulas.length > 0) {
          latex = result.formulas.join('\n');
          // Don't add formulas to fullText - they will be displayed separately via latex field
        }

        return {
          text: fullText,
          latex: latex || undefined,
          tables: result.tables,
          confidence: result.confidence,
          engine: 'gemini-vision',
          fallbackUsed: false,
          hasImages: !!result.diagramDescription,
          hasTables: (result.tables?.length || 0) > 0,
          diagramDescription: result.diagramDescription,
          visualElements: result.visualElements,
          processingTime,
          corrections: result.corrections,
          correctionSummary: result.correctionSummary,
        };
      } else {
        console.log(`⚠️ Gemini Vision low confidence: ${result.confidence} - trying fallback`);
      }
    } catch (error) {
      console.warn('❌ Gemini Vision failed:', error);
    }
  } else {
    console.log('⏭️ Gemini Vision not available, skipping...');
  }

  // ============================================================================
  // Priority 2: Tesseract.js (FREE, BEST for Korean text)
  // ============================================================================
  try {
    console.log('🚀 Trying Tesseract OCR (Priority 2 - FREE, BEST for Korean)...');
    const result = await tesseractOCR(imageFile);

    if (result.confidence > 0.7) {
      const processingTime = Date.now() - startTime;

      // Apply post-processing to Tesseract result
      const postProcessResult = postProcessOCR(result.text, result.confidence);
      const correctionSummary = getCorrectionSummary(postProcessResult);

      console.log(`✅ Tesseract OCR successful: ${postProcessResult.confidence} (${processingTime}ms)`);
      console.log(`  - Post-processing: ${correctionSummary}`);

      return {
        text: postProcessResult.corrected,
        confidence: postProcessResult.confidence,
        engine: 'tesseract',
        fallbackUsed: false,
        processingTime,
        corrections: postProcessResult.corrections.length,
        correctionSummary,
      };
    } else {
      console.log(`⚠️ Tesseract low confidence: ${result.confidence} - trying fallback`);
    }
  } catch (error) {
    console.warn('❌ Tesseract OCR failed:', error);
  }

  // ============================================================================
  // Priority 3: Pix2Text (FREE, for Chinese/complex documents)
  // ============================================================================
  if (isPix2TextAvailable()) {
    try {
      console.log('📊 Trying Pix2Text OCR (Priority 2 - for Chinese/complex docs)...');
      const result = await pix2textOCR(base64);

      if (result.success && result.confidence > 0.7) {
        const processingTime = Date.now() - startTime;

        // Apply post-processing
        const postProcessResult = postProcessOCR(result.text, result.confidence);
        const correctionSummary = getCorrectionSummary(postProcessResult);

        console.log(`✅ Pix2Text OCR successful: ${postProcessResult.confidence} (${processingTime}ms)`);
        console.log(`   - Text: ${postProcessResult.corrected.substring(0, 100)}...`);
        console.log(`   - LaTeX: ${result.latex ? 'Yes' : 'No'}`);
        console.log(`   - Tables: ${result.tables?.length || 0}`);
        console.log(`   - Post-processing: ${correctionSummary}`);

        return {
          text: postProcessResult.corrected,
          latex: result.latex,
          tables: result.tables,
          confidence: postProcessResult.confidence,
          engine: 'pix2text',
          fallbackUsed: false,
          hasImages: true, // Pix2Text handles images
          hasTables: (result.tables?.length || 0) > 0,
          processingTime,
          corrections: postProcessResult.corrections.length,
          correctionSummary,
        };
      } else {
        console.log(`⚠️ Pix2Text low confidence: ${result.confidence} - trying fallback`);
      }
    } catch (error) {
      console.warn('❌ Pix2Text OCR failed:', error);
    }
  } else {
    console.log('⏭️ Pix2Text not available, skipping...');
  }

  // ============================================================================
  // Priority 4: Mathpix (best for pure math, but requires API key)
  // ============================================================================
  if (isMathpixAvailable()) {
    try {
      console.log('📊 Trying Mathpix OCR (Priority 2 - Premium)...');
      const result = await mathpixOCR(base64);

      if (result.confidence > 0.7) {
        const processingTime = Date.now() - startTime;

        // Apply post-processing
        const text = result.text || latexToPlainText(result.latex);
        const postProcessResult = postProcessOCR(text, result.confidence);
        const correctionSummary = getCorrectionSummary(postProcessResult);

        console.log(`✅ Mathpix OCR successful: ${postProcessResult.confidence} (${processingTime}ms)`);
        console.log(`   - Post-processing: ${correctionSummary}`);

        return {
          text: postProcessResult.corrected,
          latex: result.latex,
          confidence: postProcessResult.confidence,
          engine: 'mathpix',
          fallbackUsed: true,
          processingTime,
          corrections: postProcessResult.corrections.length,
          correctionSummary,
        };
      } else {
        console.log(`⚠️ Mathpix low confidence: ${result.confidence} - trying fallback`);
      }
    } catch (error) {
      console.warn('❌ Mathpix OCR failed:', error);
    }
  } else {
    console.log('⏭️ Mathpix not available, skipping...');
  }

  // ============================================================================
  // Priority 5: Google Vision (good for general text, free tier)
  // ============================================================================
  if (isGoogleVisionAvailable()) {
    try {
      console.log('📊 Trying Google Vision OCR (Priority 3 - Free tier)...');
      const result = await googleVisionOCR(base64);

      if (result.text && result.text.length > 0) {
        const processingTime = Date.now() - startTime;

        // Apply post-processing
        const postProcessResult = postProcessOCR(result.text, result.confidence);
        const correctionSummary = getCorrectionSummary(postProcessResult);

        console.log(`✅ Google Vision OCR successful (${processingTime}ms)`);
        console.log(`   - Post-processing: ${correctionSummary}`);

        return {
          text: postProcessResult.corrected,
          confidence: postProcessResult.confidence,
          engine: 'google-vision',
          fallbackUsed: true,
          processingTime,
          corrections: postProcessResult.corrections.length,
          correctionSummary,
        };
      }
    } catch (error) {
      console.warn('❌ Google Vision OCR failed:', error);
    }
  } else {
    console.log('⏭️ Google Vision not available, skipping...');
  }

  // ============================================================================
  // All engines failed - return error
  // ============================================================================
  console.error('❌ All OCR engines failed');
  throw new Error('OCR failed: All engines unavailable or returned low confidence');
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Tesseract OCR (free fallback)
 */
async function tesseractOCR(imageFile: File): Promise<{ text: string; confidence: number }> {
  console.log('[Tesseract] Starting OCR with Korean + English support...');

  const worker = await Tesseract.createWorker('kor+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  try {
    // Set parameters for better accuracy
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // Uniform text block
      preserve_interword_spaces: '1',
    });

    const { data } = await worker.recognize(imageFile);
    console.log(`[Tesseract] ✅ Recognition complete: ${data.text.length} chars`);

    return {
      text: data.text,
      confidence: data.confidence / 100, // Convert 0-100 to 0-1
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Get status of all OCR engines
 */
export function getOCREngineStatus(): {
  geminiVision: boolean;
  pix2text: boolean;
  mathpix: boolean;
  googleVision: boolean;
  tesseract: boolean;
} {
  return {
    geminiVision: isGeminiVisionAvailable(),
    pix2text: isPix2TextAvailable(),
    mathpix: isMathpixAvailable(),
    googleVision: isGoogleVisionAvailable(),
    tesseract: true, // Always available (client-side)
  };
}

/**
 * Get recommended OCR engine based on content type
 */
export function getRecommendedEngine(options: {
  hasDiagrams?: boolean;
  hasTables?: boolean;
  hasComplexMath?: boolean;
  preferSpeed?: boolean;
}): 'gemini-vision' | 'pix2text' | 'mathpix' | 'google-vision' | 'tesseract' {
  const status = getOCREngineStatus();

  // If has diagrams or tables, ALWAYS prefer Gemini Vision (best for visual understanding)
  if ((options.hasDiagrams || options.hasTables) && status.geminiVision) {
    return 'gemini-vision';
  }

  // If complex math and Mathpix available, use it
  if (options.hasComplexMath && status.mathpix) {
    return 'mathpix';
  }

  // Default priority
  if (status.geminiVision) return 'gemini-vision';
  if (status.pix2text) return 'pix2text';
  if (status.mathpix) return 'mathpix';
  if (status.googleVision) return 'google-vision';
  return 'tesseract';
}

// ============================================================================
// Backward Compatibility Exports
// ============================================================================

/**
 * Alias for smartOCRv2() for backward compatibility
 * @deprecated Use smartOCRv2() instead
 */
export const smartOCR = smartOCRv2;

/**
 * Get available OCR engines (backward compatibility)
 * @returns Array of available engine names
 */
export function getAvailableEngines(): string[] {
  const status = getOCREngineStatus();
  const available: string[] = [];

  if (status.geminiVision) available.push('gemini-vision');
  if (status.pix2text) available.push('pix2text');
  if (status.mathpix) available.push('mathpix');
  if (status.googleVision) available.push('google-vision');
  available.push('tesseract'); // Always available

  return available;
}

/**
 * Check if premium OCR is available (backward compatibility)
 * @returns True if Mathpix or Pix2Text is available
 */
export function hasPremiumOCR(): boolean {
  const status = getOCREngineStatus();
  return status.geminiVision || status.pix2text || status.mathpix;
}
