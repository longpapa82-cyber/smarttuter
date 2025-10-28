"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Sparkles, Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  currentImage: string | null;
  disabled?: boolean;
  gradeLevel: 'elementary' | 'middle' | 'high' | 'university';
  onRecognitionComplete?: (result: any) => void;
  enableCamera?: boolean;
  autoRecognize?: boolean;
}

interface RecognitionStatus {
  isRecognizing: boolean;
  result?: any;
  error?: string;
}

export function ImageUploadWithRecognition({
  onImageSelect,
  onImageRemove,
  currentImage,
  disabled = false,
  gradeLevel,
  onRecognitionComplete,
  enableCamera = true,
  autoRecognize = true,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [recognition, setRecognition] = useState<RecognitionStatus>({
    isRecognizing: false,
  });
  const [showCameraOptions, setShowCameraOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const recognizeImage = async (imageBase64: string, handwritten: boolean = false) => {
    setRecognition({ isRecognizing: true });

    try {
      const response = await fetch('/api/vision/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          gradeLevel,
          handwritten,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRecognition({
          isRecognizing: false,
          result: result.problem,
        });
        onRecognitionComplete?.(result.problem);
      } else {
        setRecognition({
          isRecognizing: false,
          error: result.error || '문제를 인식할 수 없습니다.',
        });
      }
    } catch (error: any) {
      console.error('Recognition error:', error);
      setRecognition({
        isRecognizing: false,
        error: '이미지 인식 중 오류가 발생했습니다.',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        onImageSelect(file, preview);

        // Auto-recognize if enabled
        if (autoRecognize) {
          await recognizeImage(preview, false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        onImageSelect(file, preview);

        // Auto-recognize
        if (autoRecognize) {
          await recognizeImage(preview, false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      if (enableCamera) {
        setShowCameraOptions(true);
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  const handleFileUpload = () => {
    setShowCameraOptions(false);
    fileInputRef.current?.click();
  };

  const handleCameraCapture = () => {
    setShowCameraOptions(false);
    cameraInputRef.current?.click();
  };

  const handleRemove = () => {
    onImageRemove();
    setRecognition({ isRecognizing: false });
  };

  const handleManualRecognize = async (handwritten: boolean = false) => {
    if (currentImage) {
      await recognizeImage(currentImage, handwritten);
    }
  };

  return (
    <div className="relative">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {enableCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      )}

      <AnimatePresence mode="wait">
        {currentImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            {/* Image preview */}
            <div className="relative rounded-lg overflow-hidden border-2 border-primary-200 bg-white">
              <img
                src={currentImage}
                alt="Uploaded math problem"
                className="w-full h-auto max-h-64 object-contain"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recognition status */}
            {recognition.isRecognizing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-900">문제를 인식하고 있습니다...</p>
                  <p className="text-xs text-blue-600">AI가 이미지를 분석 중입니다</p>
                </div>
              </motion.div>
            )}

            {/* Recognition result */}
            {recognition.result && !recognition.isRecognizing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 mb-2">문제 인식 완료!</p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">문제:</span>
                        <p className="text-gray-900 mt-1">{recognition.result.text}</p>
                      </div>

                      {recognition.result.equation && (
                        <div>
                          <span className="font-semibold text-gray-700">수식:</span>
                          <p className="text-gray-900 mt-1 font-mono bg-white px-2 py-1 rounded border">
                            {recognition.result.equation}
                          </p>
                        </div>
                      )}

                      {recognition.result.topic && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {recognition.result.topic}
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            {recognition.result.difficulty === 'easy' ? '쉬움' :
                             recognition.result.difficulty === 'hard' ? '어려움' : '보통'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recognition error */}
            {recognition.error && !recognition.isRecognizing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">인식 실패</p>
                  <p className="text-xs text-red-600 mt-1">{recognition.error}</p>
                </div>
              </motion.div>
            )}

            {/* Manual recognition buttons */}
            {!recognition.isRecognizing && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleManualRecognize(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  {recognition.result ? '다시 인식' : '인쇄된 문제 인식'}
                </button>
                <button
                  onClick={() => handleManualRecognize(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  손글씨 인식
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Upload area */}
            <motion.div
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200
                ${
                  isDragging
                    ? "border-primary-500 bg-primary-50 scale-[1.02]"
                    : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-primary-100 rounded-full">
                  {isDragging ? (
                    <Upload className="w-8 h-8 text-primary-600 animate-bounce" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    {isDragging ? "여기에 이미지를 놓으세요" : "수학 문제 이미지 업로드"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    클릭하거나 드래그 & 드롭
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>AI가 자동으로 문제를 인식합니다</span>
                </div>
                <p className="text-xs text-gray-400">
                  PNG, JPG, JPEG, HEIC up to 10MB
                </p>
              </div>
            </motion.div>

            {/* Camera options modal */}
            <AnimatePresence>
              {showCameraOptions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setShowCameraOptions(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      이미지 선택 방법
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleCameraCapture}
                        className="w-full flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-left"
                      >
                        <div className="p-2 bg-primary-600 rounded-lg">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">카메라로 촬영</p>
                          <p className="text-xs text-gray-600">문제를 직접 찍어보세요</p>
                        </div>
                      </button>

                      <button
                        onClick={handleFileUpload}
                        className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <div className="p-2 bg-gray-600 rounded-lg">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">갤러리에서 선택</p>
                          <p className="text-xs text-gray-600">저장된 이미지 업로드</p>
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowCameraOptions(false)}
                      className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      취소
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
