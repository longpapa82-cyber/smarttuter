'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRADE_LEVEL_OPTIONS, SUBJECT_OPTIONS, type GradeLevel, type Subject } from '@/types/user';
import { createUserProfile, saveUserProfile } from '@/lib/user/user-profile';

/**
 * 빠른 온보딩 페이지 (2단계)
 * - Step 1: 학교급 선택
 * - Step 2: 과목 선택
 * - 게스트 모드로 즉시 시작
 */
export default function QuickOnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0); // 0: 학교급, 1: 과목
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  // Check if user already has a profile - redirect to dashboard if yes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasProfile = localStorage.getItem('aipark_user_profile');
      if (hasProfile) {
        console.log('✅ User already has profile, redirecting to dashboard');
        router.replace('/dashboard');
      }
    }
  }, [router]);

  // Step 1: 학교급 선택
  const handleGradeLevel = (level: GradeLevel) => {
    setGradeLevel(level);
    setTimeout(() => {
      setCurrentStep(1);
    }, 300);
  };

  // Step 2: 과목 선택 후 완료
  const handleSubject = async (selectedSubject: Subject) => {
    setSubject(selectedSubject);

    // 인증된 사용자 프로필 생성
    const userProfile = createUserProfile({
      nickname: session?.user?.name || '사용자',
      email: session?.user?.email || undefined,
      gradeLevel: gradeLevel!,
      preferredSubjects: [selectedSubject],
      provider: session?.user ? 'credentials' : 'guest',
    });

    // localStorage에 저장
    saveUserProfile(userProfile);

    // 게스트 모드 쿠키 설정 (로그인하지 않은 경우)
    if (!session?.user) {
      document.cookie = 'aipark_guest_mode=true; path=/; max-age=31536000; SameSite=Lax';
      console.log('✅ Guest mode cookie set');
    }

    // 서버에 프로필 저장 (로그인 사용자만)
    if (session?.user) {
      try {
        // gradeLevel에서 gradeDetail 자동 생성
        const gradeDetailMap: Record<GradeLevel, string> = {
          elementary: '초등학교 6학년',
          middle: '중학교 3학년',
          high: '고등학교 3학년',
          university: '대학교 4학년',
        };

        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gradeLevel: gradeLevel,
            gradeDetail: gradeDetailMap[gradeLevel!],
            preferredSubjects: [selectedSubject],
          }),
        });

        if (!response.ok) {
          console.error('서버 프로필 저장 실패:', await response.text());
          // 저장 실패 시에도 계속 진행 (localStorage 프로필 사용)
        } else {
          console.log('✅ 서버 프로필 저장 성공');

          // 프로필 저장 확인 (재시도 로직)
          let retries = 0;
          const maxRetries = 3;
          while (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const checkResponse = await fetch('/api/user/profile');
            if (checkResponse.ok) {
              const { user } = await checkResponse.json();
              if (user?.gradeLevel && user?.gradeDetail) {
                console.log('✅ 프로필 확인 완료');
                break;
              }
            }
            retries++;
          }
        }
      } catch (error) {
        console.error('프로필 저장 API 오류:', error);
      }
    }

    // 선택한 과목의 대시보드로 이동
    // 'social-studies' → 'social' URL로 변환
    const dashboardPath = selectedSubject === 'social-studies' ? 'social' : selectedSubject;
    router.push(`/dashboard/${dashboardPath}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[0, 1].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  currentStep > step
                    ? 'w-16 bg-gradient-to-r from-purple-600 to-pink-600'
                    : 'w-12 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            {currentStep + 1}/2 단계 완료
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <GradeLevelQuickStep key="grade" onSelect={handleGradeLevel} />
          )}

          {currentStep === 1 && (
            <SubjectQuickStep key="subject" onSelect={handleSubject} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Step 1: 학교급 선택 (빠른 버전)
 */
function GradeLevelQuickStep({ onSelect }: { onSelect: (level: GradeLevel) => void }) {
  const [selectedLevel, setSelectedLevel] = useState<GradeLevel | null>(null);

  const handleSelect = (level: GradeLevel) => {
    setSelectedLevel(level);
    setTimeout(() => {
      onSelect(level);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-[600px] px-6"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-3 text-gray-900">
          어떤 학습자이신가요?
        </h2>
        <p className="text-lg text-gray-600">
          학습 수준에 맞는 콘텐츠를 제공해드립니다
        </p>
      </motion.div>

      {/* Grade Level Options - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {GRADE_LEVEL_OPTIONS.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option.value)}
            className={`
              p-8 rounded-2xl border-2 transition-all text-left
              ${
                selectedLevel === option.value
                  ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{option.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {option.label}
                  </h3>
                  {selectedLevel === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-1">{option.description}</p>
                <p className="text-xs text-gray-500">{option.ageRange}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Step 2: 과목 선택 (빠른 버전 - 단일 선택)
 */
function SubjectQuickStep({ onSelect }: { onSelect: (subject: Subject) => void }) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setTimeout(() => {
      onSelect(subject);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-[600px] px-6"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-3 text-gray-900">
          어떤 과목을 시작할까요?
        </h2>
        <p className="text-lg text-gray-600">
          지금 바로 학습을 시작해보세요
        </p>
      </motion.div>

      {/* Subject Options - 1x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {SUBJECT_OPTIONS.map((option, index) => {
          const isSelected = selectedSubject === option.value;

          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.15 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option.value)}
              className={`
                relative p-10 rounded-3xl transition-all text-left h-80 flex flex-col justify-between overflow-hidden
                ${
                  isSelected
                    ? `bg-gradient-to-br ${option.color} text-white shadow-2xl`
                    : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-purple-300 hover:shadow-xl'
                }
              `}
            >
              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}

              <div>
                <div className="text-7xl mb-6">{option.emoji}</div>
                <h3 className="text-4xl font-bold mb-3">{option.label}</h3>
                <p className={`text-lg ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                  {option.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xl font-semibold">
                {isSelected ? (
                  <>
                    <span>시작하기</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                ) : (
                  <span>선택하기</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
