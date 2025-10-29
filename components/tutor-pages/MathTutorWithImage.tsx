'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/gamification/store';
import { motion } from 'framer-motion';
import { ImageUploadWithRecognition } from '@/components/chat/ImageUploadWithRecognition';
import { Camera, MessageSquare, ArrowLeft } from 'lucide-react';
import VoiceTutorInterface from '@/components/voice-tutor/VoiceTutorInterface';

export default function MathTutorWithImage() {
  const { profile, initializeProfile } = useUserStore();
  const [mode, setMode] = useState<'select' | 'image' | 'voice'>('select');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [recognizedProblem, setRecognizedProblem] = useState<any>(null);

  // Auto-initialize profile if it doesn't exist
  useEffect(() => {
    if (!profile) {
      initializeProfile('Student', 'middle');
    }
  }, [profile, initializeProfile]);

  // Mode selection screen
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🔢 Math Tutor
            </h1>
            <p className="text-lg text-gray-600">
              학습 방법을 선택해주세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image mode */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setMode('image')}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  이미지로 질문하기
                </h2>

                <p className="text-gray-600 mb-4">
                  수학 문제를 촬영하거나 업로드하여<br />
                  AI가 문제를 분석하고 설명해드려요
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
                  시작하기
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </motion.button>

            {/* Voice mode */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setMode('voice')}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  대화로 질문하기
                </h2>

                <p className="text-gray-600 mb-4">
                  궁금한 수학 개념이나 문제를<br />
                  자유롭게 대화하며 학습해요
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                  시작하기
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Image mode
  if (mode === 'image') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setMode('select')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>

          <ImageUploadWithRecognition
            onImageUpload={(image, file) => {
              setCurrentImage(image);
              setCurrentFile(file);
            }}
            onProblemRecognized={(problem) => {
              setRecognizedProblem(problem);
            }}
          />
        </div>
      </div>
    );
  }

  // Voice mode
  if (mode === 'voice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setMode('select')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>

          <VoiceTutorInterface
            subject="math"
            userId={profile?.id || 'user-default'}
            gradeLevel={profile?.gradeLevel as any || 'middle'}
          />
        </div>
      </div>
    );
  }

  return null;
}
