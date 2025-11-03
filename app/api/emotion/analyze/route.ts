// app/api/emotion/analyze/route.ts
// 서버 사이드 감정 분석 API 엔드포인트

import { NextRequest, NextResponse } from 'next/server';
import { EmotionAnalyzer } from '@/lib/emotion/emotion-analyzer';
import type { EmotionAnalysisRequest } from '@/types/emotion';

/**
 * 감정 분석 API
 * POST /api/emotion/analyze
 *
 * 보안: API 키를 서버에서만 사용하여 클라이언트 노출 방지
 */
export async function POST(req: NextRequest) {
  try {
    // API 키 검증
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY environment variable not configured');
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'Emotion analysis service is not configured'
        },
        { status: 500 }
      );
    }

    // 요청 본문 파싱
    const body: EmotionAnalysisRequest = await req.json();

    // 입력 검증
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Text field is required'
        },
        { status: 400 }
      );
    }

    // 감정 분석 수행
    const analyzer = new EmotionAnalyzer(apiKey);
    const result = await analyzer.analyzeEmotion(body);

    console.log('✅ Emotion analysis completed:', {
      primary: result.primary,
      intensity: result.intensity,
      confidence: result.confidence,
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Emotion analysis error:', error);

    // 구체적인 에러 처리
    if (error.status === 403) {
      return NextResponse.json(
        {
          error: 'API authentication failed',
          message: 'Unable to authenticate with emotion analysis service'
        },
        { status: 403 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        },
        { status: 429 }
      );
    }

    // 일반 에러
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error.message || 'Failed to analyze emotion'
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  return NextResponse.json({
    status: 'ok',
    configured: !!apiKey,
    timestamp: new Date().toISOString(),
  });
}
