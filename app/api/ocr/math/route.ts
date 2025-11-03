import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  let ocrText = '';
  try {
    const requestData = await req.json();
    ocrText = requestData.ocrText || '';
    const imageBase64 = requestData.imageBase64;

    if (!ocrText && !imageBase64) {
      return NextResponse.json(
        { error: 'OCR 텍스트 또는 이미지가 필요합니다.' },
        { status: 400 }
      );
    }

    // Gemini 2.0 Flash 모델 사용 (무료)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    let mathText = '';

    // Strategy 1: If we have image, use Gemini Vision to extract math directly
    if (imageBase64) {
      const prompt = `
이 이미지에 있는 수학 문제나 수식을 정확하게 텍스트로 변환해주세요.

변환 규칙:
1. 수식은 명확하게 표기 (예: x^2 + 2x + 1)
2. 분수는 a/b 형식 또는 (분자)/(분모) 형식
3. 제곱근은 √ 또는 sqrt() 사용
4. 적분은 ∫ 또는 integral() 사용
5. 미분은 d/dx 또는 derivative() 사용
6. 그리스 문자는 α, β, γ, θ 등 유니코드 사용
7. 특수 기호: ≤, ≥, ≠, ±, ∞ 등 유니코드 사용

출력 형식:
- 문제 번호가 있으면 포함
- 수식은 한 줄씩 구분
- 불필요한 설명 없이 문제만 추출

예시:
입력 이미지: "1. x² + 2x + 1 = 0을 풀어라"
출력: "1. x² + 2x + 1 = 0을 풀어라"

입력 이미지: "∫(2x + 3)dx를 구하시오"
출력: "∫(2x + 3)dx를 구하시오"
`;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      mathText = result.response.text().trim();
    }

    // Strategy 2: If only OCR text, enhance it for math notation
    else if (ocrText) {
      const prompt = `
다음은 수학 문제를 OCR로 인식한 텍스트입니다. 이를 수학 표기법에 맞게 정리해주세요.

OCR 텍스트:
${ocrText}

변환 규칙:
1. "x2" → "x²", "x3" → "x³" (지수 표기)
2. "x/y" → "(x)/(y)" (분수 명확화)
3. "sqrt(x)" → "√x" (제곱근)
4. 불필요한 공백 제거
5. 수식 기호 정리: <=, >=, !=, +-, inf 등을 ≤, ≥, ≠, ±, ∞로 변환
6. 문제 번호 유지 (1., 2., etc.)

출력은 정리된 텍스트만 제공하고, 추가 설명은 하지 마세요.
`;

      const result = await model.generateContent(prompt);
      mathText = result.response.text().trim();
    }

    // Clean up the result
    mathText = cleanMathText(mathText);

    return NextResponse.json({
      mathText,
      originalOcrText: ocrText,
      success: true,
    });

  } catch (error) {
    console.error('수식 변환 오류:', error);
    return NextResponse.json(
      { error: '수식 변환에 실패했습니다.', mathText: ocrText || '' },
      { status: 500 }
    );
  }
}

function cleanMathText(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Common OCR fixes
  cleaned = cleaned.replace(/\bl\b/g, '1'); // lowercase L → 1
  cleaned = cleaned.replace(/\bO\b/g, '0'); // uppercase O → 0
  cleaned = cleaned.replace(/\[/g, '(').replace(/]/g, ')'); // brackets → parentheses

  return cleaned;
}
