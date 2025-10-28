import { NextRequest, NextResponse } from 'next/server';
import { getVisionService } from '@/lib/image-recognition/vision-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, gradeLevel, handwritten = false } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    if (!gradeLevel || !['elementary', 'middle', 'high', 'university'].includes(gradeLevel)) {
      return NextResponse.json(
        { error: 'Valid grade level is required' },
        { status: 400 }
      );
    }

    const visionService = getVisionService();

    // Use appropriate recognition method
    const result = handwritten
      ? await visionService.recognizeHandwrittenMath(imageBase64, gradeLevel)
      : await visionService.recognizeMathProblem(imageBase64, gradeLevel);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Vision API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to recognize image',
        confidence: 0,
      },
      { status: 500 }
    );
  }
}

// Quick verification endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageBase64 = searchParams.get('image');

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    const visionService = getVisionService();
    const hasMathContent = await visionService.verifyMathContent(imageBase64);

    return NextResponse.json({ hasMathContent });
  } catch (error: any) {
    console.error('Vision verification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify image' },
      { status: 500 }
    );
  }
}
