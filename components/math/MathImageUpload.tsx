'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Loader2, Check, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';

interface MathImageUploadProps {
  onTextRecognized: (text: string) => void;
  onClose: () => void;
}

export default function MathImageUpload({ onTextRecognized, onClose }: MathImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processImage(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processImage(files[0]);
    }
  };

  const processImage = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setError('');
    setIsProcessing(true);
    setProgress(0);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Step 1: OCR with Tesseract.js
      setProgress(10);
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(10 + Math.floor(m.progress * 60)); // 10-70%
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      setProgress(75);

      // Step 2: Convert to math-friendly format using Gemini
      const convertedText = await convertToMathFormat(data.text, file);

      setProgress(100);
      setRecognizedText(convertedText);

      // Small delay to show 100% completion
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);

    } catch (err) {
      console.error('OCR 처리 중 오류:', err);
      setError('텍스트 인식에 실패했습니다. 다시 시도해주세요.');
      setIsProcessing(false);
    }
  };

  const convertToMathFormat = async (ocrText: string, imageFile: File): Promise<string> => {
    try {
      // Convert image to base64
      const base64 = await fileToBase64(imageFile);

      // Call API to convert with Gemini
      const response = await fetch('/api/ocr/math', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrText,
          imageBase64: base64,
        }),
      });

      if (!response.ok) {
        throw new Error('수식 변환 실패');
      }

      const result = await response.json();
      return result.mathText || ocrText;

    } catch (err) {
      console.error('수식 변환 오류:', err);
      // Fallback to original OCR text
      return ocrText;
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendToTutor = () => {
    if (recognizedText) {
      onTextRecognized(recognizedText);
      onClose();
    }
  };

  const handleRetry = () => {
    setRecognizedText('');
    setPreviewUrl(null);
    setError('');
    setProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">수학 문제 업로드</h2>
              <p className="text-sm text-gray-500">사진을 찍거나 업로드하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          {!previewUrl && !isProcessing && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-all duration-200
                ${isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {isDragging ? '여기에 놓으세요' : '이미지 업로드'}
                  </p>
                  <p className="text-sm text-gray-500">
                    클릭하거나 드래그 앤 드롭 (PNG, JPG, JPEG)
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    최대 파일 크기: 10MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="space-y-6">
              {/* Preview Image */}
              {previewUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-64 object-contain bg-gray-50"
                  />
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">텍스트 인식 중...</span>
                  <span className="text-orange-600 font-bold">{progress}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>무료 OCR 처리 중... (Tesseract.js)</span>
                </div>
              </div>
            </div>
          )}

          {/* Result State */}
          {!isProcessing && recognizedText && previewUrl && (
            <div className="space-y-6">
              {/* Preview Image */}
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-48 object-contain bg-gray-50"
                />
              </div>

              {/* Recognized Text */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">인식 완료!</span>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">인식된 텍스트:</p>
                  <p className="text-gray-900 whitespace-pre-wrap font-mono text-sm">
                    {recognizedText}
                  </p>
                </div>

                <p className="text-xs text-green-600">
                  💡 튜터에게 전송하면 이 문제에 대한 풀이와 설명을 받을 수 있어요!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  다시 촬영하기
                </button>
                <button
                  onClick={handleSendToTutor}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  튜터에게 전송하기
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">오류 발생</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Tips */}
          {!previewUrl && !isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">📸 촬영 팁</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 밝은 곳에서 촬영하세요</li>
                <li>• 문제가 화면 중앙에 오도록 배치하세요</li>
                <li>• 흔들림 없이 선명하게 촬영하세요</li>
                <li>• 손글씨보다 인쇄된 문제가 인식률이 높아요</li>
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
