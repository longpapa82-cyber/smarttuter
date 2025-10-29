'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/gamification/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploadWithRecognition } from '@/components/chat/ImageUploadWithRecognition';
import { Camera, MessageSquare, Sparkles, ArrowLeft } from 'lucide-react';
import VoiceTutorInterface from '@/components/voice-tutor/VoiceTutorInterface';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  );
}

export default function MathTutorWithImage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<ReturnType<typeof useUserStore.getState>['profile']>(null);
  const [mode, setMode] = useState<'select' | 'image' | 'voice'>('select');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [recognizedProblem, setRecognizedProblem] = useState<any>(null);

  // Wait for client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Wait for Zustand automatic hydration (skipHydration is removed)
  useEffect(() => {
    if (!isMounted) return;

    // Zustand hydrates automatically, just subscribe to changes
    const unsubscribe = useUserStore.subscribe((state) => {
      setProfile(state.profile);
    });

    // Get initial profile value after automatic hydration
    setProfile(useUserStore.getState().profile);

    // Set hydration flag immediately
    setIsHydrated(true);

    return () => unsubscribe();
  }, [isMounted]);

  // Redirect to onboarding if no profile after hydration
  useEffect(() => {
    if (isHydrated && !profile) {
      router.push('/onboarding');
    }
  }, [isHydrated, profile, router]);

  // Always show loading spinner until fully mounted and hydrated
  if (!isMounted || !isHydrated || !profile) {
    return <LoadingSpinner />;
  }

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
                  문제를 사진으로 찍거나 이미지를 업로드하면 AI가 자동으로 인식하여 설명해드립니다
                </p>

                <div className="flex items-center gap-2 justify-center text-sm text-purple-600">
                  <Sparkles className="w-4 h-4" />
                  <span>Photomath 스타일 자동 인식</span>
                </div>

                <div className="mt-6 space-y-2 text-sm text-gray-500 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>손글씨 문제 인식</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>인쇄된 문제 인식</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>단계별 풀이 제공</span>
                  </div>
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
                  음성으로 대화하기
                </h2>

                <p className="text-gray-600 mb-4">
                  실시간 음성 대화로 개념을 묻고, 문제 풀이를 함께 진행합니다
                </p>

                <div className="flex items-center gap-2 justify-center text-sm text-teal-600">
                  <Sparkles className="w-4 h-4" />
                  <span>실시간 음성 튜터링</span>
                </div>

                <div className="mt-6 space-y-2 text-sm text-gray-500 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>개념 설명 요청</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>문제 풀이 힌트</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>대화형 학습</span>
                  </div>
                </div>
              </div>
            </motion.button>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push('/dashboard')}
            className="mt-8 mx-auto flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대시보드로 돌아가기</span>
          </motion.button>
        </div>
      </div>
    );
  }

  // Image recognition mode
  if (mode === 'image') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                setMode('select');
                setCurrentImage(null);
                setCurrentFile(null);
                setRecognizedProblem(null);
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>뒤로가기</span>
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              📸 이미지로 질문하기
            </h1>

            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
            <ImageUploadWithRecognition
              currentImage={currentImage}
              onImageSelect={(file, preview) => {
                setCurrentFile(file);
                setCurrentImage(preview);
              }}
              onImageRemove={() => {
                setCurrentImage(null);
                setCurrentFile(null);
                setRecognizedProblem(null);
              }}
              gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
              onRecognitionComplete={(result) => {
                setRecognizedProblem(result);
              }}
              enableCamera={true}
              autoRecognize={true}
            />

            {/* Ask tutor button */}
            {recognizedProblem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <button
                  onClick={() => {
                    // TODO: Send to tutor with recognized problem context
                    alert('곧 구현될 기능입니다: 인식된 문제를 튜터에게 전달합니다');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>튜터에게 이 문제 물어보기</span>
                </button>

                <p className="text-center text-sm text-gray-500 mt-3">
                  인식된 문제를 바탕으로 AI 튜터가 설명해드립니다
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Usage tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              촬영 팁
            </h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• 문제가 화면 중앙에 오도록 촬영해주세요</li>
              <li>• 조명이 밝은 곳에서 촬영하면 인식률이 높아집니다</li>
              <li>• 글자가 선명하게 보이도록 초점을 맞춰주세요</li>
              <li>• 손글씨는 &quot;손글씨 인식&quot; 버튼을 사용하면 더 정확합니다</li>
            </ul>
          </motion.div>
        </div>
      </div>
    );
  }

  // Voice mode - use existing VoiceTutorInterface
  if (mode === 'voice') {
    return (
      <VoiceTutorInterface
        subject="math"
        userId={`user-${profile.username}`}
        gradeLevel={profile.gradeLevel as 'elementary' | 'middle' | 'high' | 'university'}
      />
    );
  }

  return <LoadingSpinner />;
}
