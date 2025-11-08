'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Trash2, Sparkles, Loader2, Check } from 'lucide-react';
import { smartOCR } from '@/lib/ocr/smart-ocr';

interface MathHandwritingCanvasProps {
  onTextRecognized: (text: string) => void;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export default function MathHandwritingCanvas({
  onTextRecognized,
  onClose,
}: MathHandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [ocrEngine, setOcrEngine] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [nativeAPISupported, setNativeAPISupported] = useState(false);

  const strokeColor = '#000000';
  const strokeWidth = 6; // Increased to 6 for better fraction recognition

  // Check for Browser Native Handwriting API support
  useEffect(() => {
    const checkNativeSupport = async () => {
      if ('createHandwritingRecognizer' in navigator) {
        try {
          const recognizer = await (navigator as any).createHandwritingRecognizer?.({
            languages: ['en', 'ko'],
          });
          if (recognizer) {
            setNativeAPISupported(true);
            console.log('✅ Browser Native Handwriting API is supported (100% FREE!)');
          }
        } catch (error) {
          console.log('⚠️ Browser Native API not available, will use Google Vision fallback');
          setNativeAPISupported(false);
        }
      } else {
        console.log('⚠️ Browser does not support Native Handwriting API, will use Google Vision fallback');
        setNativeAPISupported(false);
      }
    };

    checkNativeSupport();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      redrawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke.points, stroke.color, stroke.width);
    });

    // Draw current stroke
    if (currentStroke.length > 0) {
      drawStroke(ctx, currentStroke, strokeColor, strokeWidth);
    }
  };

  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ) => {
    if (points.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  };

  const getPointerPosition = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointerPosition(e);
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPointerPosition(e);
    setCurrentStroke((prev) => [...prev, point]);
    redrawCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    setIsDrawing(false);

    if (currentStroke.length > 0) {
      setStrokes((prev) => [
        ...prev,
        {
          points: currentStroke,
          color: strokeColor,
          width: strokeWidth,
        },
      ]);
      setCurrentStroke([]);
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    setRecognizedText('');
    setError('');
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setRecognizedText('');
    setError('');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  /**
   * Preprocess canvas image for optimal OCR recognition
   * Applies: Otsu's binarization, padding, white background, high resolution
   */
  const preprocessCanvasForOCR = (): HTMLCanvasElement => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas) throw new Error('Canvas not found');

    const padding = 40; // Add padding to prevent edge cropping
    const scale = 2; // Increase resolution 2x for better clarity

    // Create high-resolution canvas with padding
    const processedCanvas = document.createElement('canvas');
    processedCanvas.width = (sourceCanvas.width + padding * 2) * scale;
    processedCanvas.height = (sourceCanvas.height + padding * 2) * scale;
    const ctx = processedCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');

    // Step 1: Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, processedCanvas.width, processedCanvas.height);

    // Step 2: Draw scaled content with padding
    ctx.drawImage(
      sourceCanvas,
      padding * scale,
      padding * scale,
      sourceCanvas.width * scale,
      sourceCanvas.height * scale
    );

    // Step 3: Convert to grayscale
    const imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const data = imageData.data;

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
    }

    // Step 4: Apply Otsu's Binarization
    // Calculate histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      histogram[data[i]]++;
    }

    // Calculate total pixels
    const total = processedCanvas.width * processedCanvas.height;

    // Calculate Otsu's threshold
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
    }

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVariance = 0;
    let threshold = 0;

    for (let t = 0; t < 256; t++) {
      wB += histogram[t];
      if (wB === 0) continue;

      wF = total - wB;
      if (wF === 0) break;

      sumB += t * histogram[t];

      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;

      const variance = wB * wF * (mB - mF) * (mB - mF);

      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = t;
      }
    }

    // Apply threshold to create binary image
    for (let i = 0; i < data.length; i += 4) {
      const value = data[i] > threshold ? 255 : 0;
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
    }

    ctx.putImageData(imageData, 0, 0);

    console.log(`✨ Advanced preprocessing: Otsu's binarization (threshold: ${threshold}), 2x resolution, ${padding}px padding`);
    return processedCanvas;
  };

  const canvasToBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // Use preprocessed canvas instead of raw canvas
        const processedCanvas = preprocessCanvasForOCR();

        processedCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleRecognize = async () => {
    if (strokes.length === 0) {
      setError('먼저 수식을 그려주세요.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('🚀 Starting Hybrid Handwriting Recognition...');

      // 💰 STRATEGY 1: Try Browser Native API first (100% FREE!)
      if (nativeAPISupported) {
        try {
          console.log('🆓 Attempting Browser Native API (FREE)...');
          const result = await recognizeWithNativeAPI();

          if (result && result.text && result.text.trim().length > 0) {
            console.log(`✅ Native API Success: "${result.text}"`);
            setOcrEngine('browser-native');
            setConfidence(0.75); // Native API doesn't provide confidence
            setRecognizedText(result.text);
            return; // Success! Exit early
          } else {
            console.log('⚠️ Native API returned empty result, falling back...');
          }
        } catch (nativeError) {
          console.warn('⚠️ Native API failed:', nativeError);
        }
      }

      // 💵 STRATEGY 2: Fallback to Smart OCR (Google Vision)
      console.log('📸 Falling back to Google Vision API...');
      const blob = await canvasToBlob();
      const file = new File([blob], 'handwriting.png', { type: 'image/png' });

      const result = await smartOCR(file);

      console.log(`✅ OCR complete via ${result.engine} (confidence: ${Math.round(result.confidence * 100)}%)`);

      setOcrEngine(result.engine);
      setConfidence(result.confidence);

      // Prefer LaTeX if available
      const displayText = result.latex || result.text;

      if (!displayText || displayText.trim().length === 0) {
        throw new Error('수식을 인식하지 못했습니다. 다시 그려주세요.');
      }

      setRecognizedText(displayText);
    } catch (err) {
      console.error('필기 인식 오류:', err);
      setError(err instanceof Error ? err.message : '필기 인식에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Browser Native Handwriting Recognition
  const recognizeWithNativeAPI = async (): Promise<{ text: string } | null> => {
    try {
      const recognizer = await (navigator as any).createHandwritingRecognizer({
        languages: ['en', 'ko'],
      });

      if (!recognizer) {
        throw new Error('Failed to create recognizer');
      }

      const drawing = recognizer.startDrawing({
        recognitionType: 'text',
        inputType: 'touch',
        alternatives: 3,
      });

      // Convert our strokes to Native API format
      strokes.forEach((stroke) => {
        const points = stroke.points.map((p) => ({
          x: p.x,
          y: p.y,
          t: Date.now(), // Native API expects timestamps
        }));

        drawing.strokes.push({ points });
      });

      const predictions = await recognizer.getPrediction();

      recognizer.finish();

      if (predictions && predictions.length > 0 && predictions[0].textAlternatives) {
        const bestText = predictions[0].textAlternatives[0];
        return { text: bestText || '' };
      }

      return null;
    } catch (error) {
      console.error('Native API error:', error);
      return null;
    }
  };

  const handleSendToTutor = () => {
    if (recognizedText) {
      onTextRecognized(recognizedText);
      onClose();
    }
  };

  return (
    <div className="space-y-6">
            {/* Canvas Area */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                <canvas
                  ref={canvasRef}
                  className="w-full h-64 bg-white rounded-lg cursor-crosshair touch-none"
                  style={{ touchAction: 'none' }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={strokes.length === 0 || isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    실행취소
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={strokes.length === 0 || isProcessing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    전체 삭제
                  </button>
                </div>

                <button
                  onClick={handleRecognize}
                  disabled={strokes.length === 0 || isProcessing}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      인식 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      인식하기
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Result State */}
            {recognizedText && !error && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">인식 완료!</span>
                  </div>
                  {ocrEngine && (
                    <div className="flex items-center gap-2">
                      {ocrEngine === 'browser-native' && <span className="text-green-500">🆓</span>}
                      {ocrEngine === 'mathpix' && <Sparkles className="w-4 h-4 text-purple-500" />}
                      <span className="text-xs text-gray-600">
                        {ocrEngine === 'browser-native'
                          ? 'Browser Native API (100% 무료!)'
                          : ocrEngine === 'mathpix'
                          ? 'Mathpix (프리미엄)'
                          : ocrEngine === 'google-vision'
                          ? 'Google Vision'
                          : 'Tesseract (무료)'}
                      </span>
                      {confidence > 0 && (
                        <span className="text-xs font-semibold text-green-600">
                          {Math.round(confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                  <p className="text-base font-semibold text-gray-600 mb-3">인식된 수식:</p>
                  <p className="text-gray-900 whitespace-pre-wrap font-mono text-2xl font-bold leading-relaxed break-all">
                    {recognizedText}
                  </p>
                </div>

                <button
                  onClick={handleSendToTutor}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
                >
                  튜터에게 전송하기
                </button>

                <p className="text-xs text-green-600 text-center">
                  💡 튜터에게 전송하면 이 수식에 대한 풀이와 설명을 받을 수 있어요!
                </p>
              </div>
            )}

            {/* Help Text */}
            {strokes.length === 0 && !isProcessing && !recognizedText && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-900">💡 필기 인식 팁</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>크고 명확하게 써주세요</li>
                  <li>수식을 천천히 정확하게 그려주세요</li>
                  <li>분수는 가로줄을 명확히 그어주세요</li>
                  <li>인식이 잘 안 되면 &quot;전체 삭제&quot; 후 다시 그려주세요</li>
                </ul>
              </div>
            )}
    </div>
  );
}
