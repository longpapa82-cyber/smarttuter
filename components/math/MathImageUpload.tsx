'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Loader2, Check, AlertCircle, Sparkles, Zap, Pen } from 'lucide-react';
import { smartOCR, getAvailableEngines, hasPremiumOCR } from '@/lib/ocr/smart-ocr';
import MathHandwritingCanvas from './MathHandwritingCanvas';
import { MathRenderer, containsMath } from '@/components/chat/MathRenderer';
import { formatOCRSections } from '@/lib/ocr/latex-formatter';

interface MathImageUploadProps {
  onTextRecognized: (text: string) => void;
  onClose: () => void;
}

type TabType = 'photo' | 'handwriting';

export default function MathImageUpload({ onTextRecognized, onClose }: MathImageUploadProps) {
  const [activeTab, setActiveTab] = useState<TabType>('photo');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrEngine, setOcrEngine] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);

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
      // IMPROVED: Use Smart OCR with automatic fallback
      setProgress(20);
      console.log('🚀 Starting Smart OCR...');

      const result = await smartOCR(file);

      console.log(`✅ OCR complete via ${result.engine} (confidence: ${Math.round(result.confidence * 100)}%)`);

      setProgress(80);
      setOcrEngine(result.engine);
      setConfidence(result.confidence);

      // Format OCR results with proper LaTeX rendering support
      const formattedText = formatOCRSections({
        text: result.text,
        latex: result.latex,
        tables: result.tables,
      });

      setProgress(100);
      setRecognizedText(formattedText);

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-4 md:p-6 pt-8"
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
              {activeTab === 'photo' ? (
                <Camera className="w-5 h-5 text-white" />
              ) : (
                <Pen className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">수학 문제 입력</h2>
              <p className="text-sm text-gray-500">
                {activeTab === 'photo' ? '사진을 찍거나 업로드하세요' : '화면에 수식을 그려주세요'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative ${
              activeTab === 'photo'
                ? 'text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            사진 업로드
            {activeTab === 'photo' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('handwriting')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative ${
              activeTab === 'handwriting'
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Pen className="w-4 h-4" />
            필기 입력
            {activeTab === 'handwriting' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          {/* Handwriting Mode */}
          {activeTab === 'handwriting' && (
            <MathHandwritingCanvas onTextRecognized={onTextRecognized} onClose={onClose} />
          )}

          {/* Photo Upload Mode */}
          {activeTab === 'photo' && (
            <>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  <span>스마트 OCR 처리 중...</span>
                </div>
              </div>
            </div>
          )}

          {/* Result State */}
          {!isProcessing && recognizedText && previewUrl && (
            <div className="space-y-6">
              {/* Preview Image */}
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-48 object-contain bg-gray-50"
                />
              </div>

              {/* Recognized Text */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">인식 완료!</span>
                  </div>
                  {ocrEngine && (
                    <div className="flex items-center gap-2">
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
                        <span className="text-xs font-semibold text-green-600">
                          {Math.round(confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">인식된 내용:</p>
                  {containsMath(recognizedText) ? (
                    <div className="text-sm bg-gray-50 p-3 rounded-lg text-gray-900">
                      <MathRenderer content={recognizedText} />
                    </div>
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap font-mono text-sm">
                      {recognizedText}
                    </p>
                  )}
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
          </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
