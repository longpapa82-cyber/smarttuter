'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { smartOCR } from '@/lib/ocr/smart-ocr';

interface EnglishImageUploadProps {
  onTextRecognized: (text: string, metadata?: { confidence: number; contentType: string }) => void;
  onClose?: () => void;
}

export default function EnglishImageUpload({ onTextRecognized, onClose }: EnglishImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [ocrEngine, setOcrEngine] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processImage(file);
    } else {
      setError('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImage(file);
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
      // Use Smart OCR with automatic fallback
      setProgress(20);
      console.log('🚀 Starting Smart OCR for English content...');

      const result = await smartOCR(file);

      console.log(`✅ OCR complete via ${result.engine} (confidence: ${Math.round(result.confidence * 100)}%)`);

      setProgress(80);
      setOcrEngine(result.engine);
      setConfidence(result.confidence);

      // Use text for English content
      const recognizedContent = result.text || '';

      setProgress(100);
      setRecognizedText(recognizedContent);

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

  const handleSendToTutor = () => {
    console.log('📤 [EnglishImageUpload] handleSendToTutor called');
    console.log('📝 recognizedText:', recognizedText);
    console.log('🎯 confidence:', confidence);

    if (!recognizedText || recognizedText.trim() === '') {
      console.error('❌ No recognized text to send');
      setError('인식된 텍스트가 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      console.log('✅ Calling onTextRecognized callback...');
      onTextRecognized(recognizedText, {
        confidence: confidence,
        contentType: 'english',
      });
      console.log('✅ OCR content sent successfully');

      // Reset state and close modal
      handleReset();
      if (onClose) {
        onClose(); // ✅ Close the upload panel
      }
    } catch (err) {
      console.error('❌ Error sending to tutor:', err);
      setError('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleReset = () => {
    setRecognizedText('');
    setPreviewUrl('');
    setProgress(0);
    setError('');
    setOcrEngine('');
    setConfidence(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">이미지에서 텍스트 인식</h3>
            <p className="text-sm text-gray-500">영어 문제, 지문, 단어를 사진으로 찍어보세요</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Upload Area */}
      {!previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 text-center cursor-pointer
            transition-all duration-300
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                이미지를 드래그하거나 클릭하세요
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG 형식 지원 | 최대 10MB
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preview & Processing */}
      {previewUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain"
            />
            {!isProcessing && !recognizedText && (
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-900">텍스트 인식 중...</span>
                <span className="text-sm text-blue-700">{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">인식 실패</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                다시 시도
              </button>
            </motion.div>
          )}

          {/* Result */}
          {recognizedText && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Success Banner */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">텍스트 인식 완료</p>
                  {ocrEngine && (
                    <div className="flex items-center gap-2 mt-1">
                      {ocrEngine === 'gemini-vision' && <Sparkles className="w-4 h-4 text-indigo-500" />}
                      {ocrEngine === 'mathpix' && <Sparkles className="w-4 h-4 text-purple-500" />}
                      {ocrEngine === 'google-vision' && <Zap className="w-4 h-4 text-blue-500" />}
                      {ocrEngine === 'pix2text' && <Zap className="w-4 h-4 text-orange-500" />}
                      <span className="text-xs text-gray-600">
                        {ocrEngine === 'gemini-vision' ? 'Gemini Vision AI (프리미엄)' :
                         ocrEngine === 'mathpix' ? 'Mathpix (프리미엄)' :
                         ocrEngine === 'google-vision' ? 'Google Vision' :
                         ocrEngine === 'pix2text' ? 'Pix2Text' :
                         'Tesseract (무료)'}
                      </span>
                      {confidence > 0 && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs text-green-700">
                            신뢰도: {Math.round(confidence * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Recognized Text */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500 mb-2">인식된 텍스트:</p>
                <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {recognizedText}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  다시 찍기
                </button>
                <button
                  onClick={handleSendToTutor}
                  disabled={!recognizedText || recognizedText.trim() === ''}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    recognizedText && recognizedText.trim() !== ''
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  튜터에게 질문하기 →
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
