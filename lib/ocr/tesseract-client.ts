/**
 * lib/ocr/tesseract-client.ts
 * 클라이언트 사이드 OCR (Tesseract.js)
 * - 완전 무료 (오픈소스)
 * - 브라우저에서 실행 (서버 부담 없음)
 * - API 키 불필요
 */

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  lines: string[];
}

/**
 * 영어 텍스트 인식 (클라이언트 사이드)
 * @param imageFile - 인식할 이미지 파일
 * @returns OCR 결과
 */
export async function recognizeEnglishText(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    // Tesseract.js Worker 생성 (한글+영어 다국어 지원)
    // 한국 학생들의 영어 시험지는 문제 번호나 지문 설명이 한글로 되어 있는 경우가 많음
    const worker = await Tesseract.createWorker('kor+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    // OCR 실행
    const { data } = await worker.recognize(imageFile);

    // Worker 종료
    await worker.terminate();

    // 결과 포맷팅
    const dataAny = data as any;
    return {
      text: data.text.trim(),
      confidence: data.confidence,
      words: (dataAny.words || []).map((w: any) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      })),
      lines: (dataAny.lines || []).map((l: any) => l.text.trim()).filter((l: string) => l.length > 0),
    };
  } catch (error) {
    console.error('❌ Tesseract.js OCR 실패:', error);
    throw new Error('텍스트 인식에 실패했습니다. 다시 시도해주세요.');
  }
}

/**
 * 이미지 URL에서 텍스트 인식
 * @param imageUrl - 이미지 URL
 * @returns OCR 결과
 */
export async function recognizeFromUrl(
  imageUrl: string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    // 한글+영어 다국어 지원
    const worker = await Tesseract.createWorker('kor+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const { data } = await worker.recognize(imageUrl);

    await worker.terminate();

    const dataAny = data as any;
    return {
      text: data.text.trim(),
      confidence: data.confidence,
      words: (dataAny.words || []).map((w: any) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      })),
      lines: (dataAny.lines || []).map((l: any) => l.text.trim()).filter((l: string) => l.length > 0),
    };
  } catch (error) {
    console.error('❌ Tesseract.js OCR 실패:', error);
    throw new Error('텍스트 인식에 실패했습니다. 다시 시도해주세요.');
  }
}

/**
 * 영어 콘텐츠 타입 분류
 * @param text - OCR로 인식된 텍스트
 * @returns 콘텐츠 타입 (reading, vocabulary, grammar, general)
 */
export function classifyEnglishContent(text: string): {
  type: 'reading' | 'vocabulary' | 'grammar' | 'general';
  confidence: number;
} {
  const lowerText = text.toLowerCase();

  // 독해 문제 패턴
  const readingPatterns = [
    /according to the passage/i,
    /the main idea/i,
    /the author suggests/i,
    /which of the following/i,
    /what does the passage/i,
    /read the following/i,
  ];

  // 어휘 문제 패턴
  const vocabularyPatterns = [
    /synonym/i,
    /antonym/i,
    /definition/i,
    /meaning of/i,
    /vocabulary/i,
    /word means/i,
  ];

  // 문법 문제 패턴
  const grammarPatterns = [
    /correct form/i,
    /choose the correct/i,
    /fill in the blank/i,
    /verb tense/i,
    /preposition/i,
    /grammar/i,
  ];

  // 패턴 매칭
  const readingScore = readingPatterns.filter((p) => p.test(text)).length;
  const vocabularyScore = vocabularyPatterns.filter((p) => p.test(text)).length;
  const grammarScore = grammarPatterns.filter((p) => p.test(text)).length;

  // 가장 높은 점수의 타입 반환
  const maxScore = Math.max(readingScore, vocabularyScore, grammarScore);

  if (maxScore === 0) {
    return { type: 'general', confidence: 0.5 };
  }

  if (readingScore === maxScore) {
    return { type: 'reading', confidence: 0.7 + readingScore * 0.1 };
  }

  if (vocabularyScore === maxScore) {
    return { type: 'vocabulary', confidence: 0.7 + vocabularyScore * 0.1 };
  }

  return { type: 'grammar', confidence: 0.7 + grammarScore * 0.1 };
}

/**
 * 파일을 Base64로 변환
 * @param file - 변환할 파일
 * @returns Base64 문자열
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Data URL에서 Base64 부분만 추출
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 압축 (성능 최적화)
 * @param file - 원본 이미지 파일
 * @param maxWidth - 최대 너비
 * @param maxHeight - 최대 높이
 * @returns 압축된 이미지 Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // 비율 유지하며 크기 조정
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 압축 실패'));
          }
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
