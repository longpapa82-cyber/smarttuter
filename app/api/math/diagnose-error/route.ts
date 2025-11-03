import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import {
  ErrorDiagnosisInput,
  generateErrorDiagnosisPrompt,
  parseErrorDiagnosis,
} from '@/lib/math/error-diagnosis';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body: ErrorDiagnosisInput = await request.json();

    // Validate input
    if (!body.problem || !body.studentAnswer || !body.correctAnswer || !body.schoolLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: problem, studentAnswer, correctAnswer, schoolLevel' },
        { status: 400 }
      );
    }

    // Generate diagnosis prompt
    const prompt = generateErrorDiagnosisPrompt(body);

    // Call Gemini API
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the response
    const diagnosis = parseErrorDiagnosis(text);

    return NextResponse.json({
      success: true,
      diagnosis,
      rawResponse: text,
    });
  } catch (error) {
    console.error('Error diagnosing student error:', error);

    return NextResponse.json(
      {
        error: 'Failed to diagnose error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
