/**
 * Gemini Vision OCR API Route
 *
 * Server-side only endpoint for Gemini Vision image analysis
 * Supports both photo uploads and handwriting recognition
 */

import { NextRequest, NextResponse } from 'next/server';
import { geminiVisionOCR } from '@/lib/ocr/gemini-vision-ocr';

export const runtime = 'nodejs'; // Force Node.js runtime (not Edge)
export const dynamic = 'force-dynamic'; // Disable caching

/**
 * POST /api/ocr/gemini-vision
 *
 * Request body:
 * {
 *   "image": "base64_string" // with or without data:image/... prefix
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "text": "extracted text",
 *   "diagramDescription": "visual element descriptions",
 *   "formulas": ["latex1", "latex2"],
 *   "tables": ["table content"],
 *   "visualElements": ["element1", "element2"],
 *   "confidence": 0.95
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, isHandwriting } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid image data',
          text: '',
          confidence: 0,
        },
        { status: 400 }
      );
    }

    const mode = isHandwriting ? 'handwriting' : 'photo';
    console.log(`[Gemini Vision API] Starting ${mode} analysis...`);
    const startTime = Date.now();

    // Call Gemini Vision OCR with optional handwriting flag (server-side only)
    const result = await geminiVisionOCR(image, isHandwriting);

    const duration = Date.now() - startTime;
    console.log(`[Gemini Vision API] ✅ ${mode} complete in ${duration}ms`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Gemini Vision API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gemini Vision analysis failed',
        text: '',
        confidence: 0,
      },
      { status: 500 }
    );
  }
}
