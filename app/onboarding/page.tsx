"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Calculator, MessageCircle, ArrowRight, ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProfileFromOnboarding } from "@/lib/user-profile";
import type { GradeLevel as GradeLevelType, GradeLevelDetail } from "@/types/tutor";

type GradeLevel = GradeLevelType | null;
type Subject = "math" | "english" | null;

interface OnboardingData {
  username: string;
  gradeLevel: GradeLevel;
  gradeDetail: string | null;
  step: number;
}

const gradeLevels = [
  {
    id: "elementary" as const,
    name: "초등학교",
    icon: "🎒",
    description: "기초부터 탄탄하게",
    color: "from-yellow-400 to-orange-400",
    details: [
      { value: "3-4", label: "3-4학년", description: "기초 개념 다지기" },
      { value: "5-6", label: "5-6학년", description: "심화 학습 준비" }
    ]
  },
  {
    id: "middle" as const,
    name: "중학교",
    icon: "📚",
    description: "개념을 확실하게",
    color: "from-green-400 to-teal-400",
    details: [
      { value: "1", label: "1학년", description: "중등 기초 확립" },
      { value: "2", label: "2학년", description: "개념 심화" },
      { value: "3", label: "3학년", description: "고등 준비" }
    ]
  },
  {
    id: "high" as const,
    name: "고등학교",
    icon: "🎓",
    description: "심화 학습으로",
    color: "from-blue-400 to-indigo-400",
    details: [
      { value: "1", label: "1학년", description: "고등 기초 다지기" },
      { value: "2", label: "2학년", description: "심화 개념 학습" },
      { value: "3", label: "3학년", description: "수능 대비" }
    ]
  },
  {
    id: "university" as const,
    name: "대학교",
    icon: "🏛️",
    description: "전문 지식까지",
    color: "from-purple-400 to-pink-400",
    details: [
      { value: "1", label: "1학년", description: "전공 기초" },
      { value: "2", label: "2학년", description: "전공 심화" },
      { value: "3", label: "3학년", description: "전문 과정" },
      { value: "4", label: "4학년 이상", description: "연구 및 응용" }
    ]
  },
];

const subjects = [
  {
    id: "math" as const,
    name: "수학",
    icon: Calculator,
    description: "문제 풀이부터 개념까지",
    color: "from-primary-500 to-secondary-500",
    features: ["단계별 풀이", "개념 설명", "유사 문제 추천"],
  },
  {
    id: "english" as const,
    name: "영어",
    icon: MessageCircle,
    description: "실시간 음성 대화 학습",
    color: "from-accent-500 to-primary-500",
    features: ["음성 대화", "발음 교정", "문법 설명"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(null);
  const [selectedGradeDetail, setSelectedGradeDetail] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(null);

  // Auto-save progress to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedData = localStorage.getItem('onboarding_progress');
    if (savedData) {
      try {
        const data: OnboardingData = JSON.parse(savedData);
        setUsername(data.username || "");
        setSelectedGrade(data.gradeLevel || null);
        setSelectedGradeDetail(data.gradeDetail || null);
        setStep(data.step || 1);
      } catch (e) {
        console.error('Failed to load onboarding progress:', e);
      }
    }
  }, []);

  // Save progress on changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const data: OnboardingData = {
      username,
      gradeLevel: selectedGrade,
      gradeDetail: selectedGradeDetail,
      step
    };

    localStorage.setItem('onboarding_progress', JSON.stringify(data));
  }, [username, selectedGrade, selectedGradeDetail, step]);

  const handleNext = () => {
    if (step === 1 && username) {
      setStep(2);
    } else if (step === 2 && selectedGrade && selectedGradeDetail) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStart = async () => {
    if (!username || !selectedGrade || !selectedGradeDetail) return;

    const userId = `user-${Date.now()}`;
    try {
      const gradeLevelDetail: GradeLevelDetail = {};

      if (selectedGrade === 'elementary') {
        gradeLevelDetail.elementary = selectedGradeDetail as '1-2' | '3-4' | '5-6';
      } else if (selectedGrade === 'middle') {
        gradeLevelDetail.middle = selectedGradeDetail as '1' | '2' | '3';
      } else if (selectedGrade === 'high') {
        gradeLevelDetail.high = selectedGradeDetail as '1' | '2' | '3';
      } else if (selectedGrade === 'university') {
        gradeLevelDetail.university = {
          year: parseInt(selectedGradeDetail),
          major: undefined
        };
      }

      await createProfileFromOnboarding(
        userId,
        selectedGrade,
        gradeLevelDetail,
        ['math', 'english'],
        []
      );

      // Store onboarding data in localStorage for dashboard to initialize
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_data', JSON.stringify({
          username,
          gradeLevel: selectedGrade,
          gradeDetail: selectedGradeDetail,
          userId,
          timestamp: Date.now()
        }));

        // Clear progress data after completion
        localStorage.removeItem('onboarding_progress');
      }

      // Navigate to dashboard (dashboard will initialize all stores)
      router.push("/dashboard");
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
  };

  const currentGradeLevel = gradeLevels.find(g => g.id === selectedGrade);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Progress Bar */}
        <div className="mb-12" role="progressbar" aria-valuenow={Math.round((step / 3) * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: step === i ? 1.2 : 1,
                    backgroundColor: step >= i ? "#6366f1" : "#e5e7eb",
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold"
                  aria-label={`Step ${i}`}
                  aria-current={step === i ? "step" : undefined}
                >
                  {i}
                </motion.div>
                {i < 3 && (
                  <div
                    className={`w-12 md:w-16 h-1 mx-2 transition-colors ${
                      step > i ? "bg-primary-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <p className="text-sm md:text-base font-medium" style={{ color: '#4B5563' }}>
              {step === 1 && "이름 입력"}
              {step === 2 && "학교급 및 학년 선택"}
              {step === 3 && "준비 완료"}
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {Math.round((step / 3) * 100)}% 완료
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Username Input */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Sparkles className="w-16 h-16 mx-auto text-primary-500" />
                </motion.div>
                <h1 className="text-4xl font-bold gradient-text">환영합니다!</h1>
                <p className="text-xl" style={{ color: '#4B5563' }}>
                  당신의 이름을 알려주세요
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <label htmlFor="username-input" className="sr-only">
                  이름 입력
                </label>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg text-gray-900 placeholder:text-gray-400 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  autoFocus
                  aria-label="사용자 이름 입력"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && username) {
                      handleNext();
                    }
                  }}
                />
                {username && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-green-600 flex items-center gap-2"
                  >
                    <span className="text-green-500">✓</span>
                    이름이 입력되었습니다
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Grade Level Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <GraduationCap className="w-16 h-16 mx-auto text-primary-500" />
                </motion.div>
                <h1 className="text-4xl font-bold gradient-text">학교급을 선택해주세요</h1>
                <p className="text-xl" style={{ color: '#4B5563' }}>
                  현재 학년에 맞는 맞춤형 학습을 제공합니다
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                {gradeLevels.map((grade, index) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        setSelectedGrade(grade.id);
                        setSelectedGradeDetail(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedGrade(grade.id);
                          setSelectedGradeDetail(null);
                        }
                      }}
                      className={`w-full p-6 md:p-8 rounded-2xl border-2 transition-all text-left focus:outline-none focus:ring-4 focus:ring-primary-200 ${
                        selectedGrade === grade.id
                          ? "border-primary-500 bg-primary-50 shadow-xl scale-105"
                          : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg active:scale-95"
                      }`}
                      aria-pressed={selectedGrade === grade.id}
                      aria-label={`${grade.name} 선택`}
                    >
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${grade.color} flex items-center justify-center text-2xl md:text-3xl flex-shrink-0`}>
                        {grade.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-gray-900">{grade.name}</h3>
                        <p className="text-sm md:text-base text-gray-700">{grade.description}</p>
                      </div>
                      {selectedGrade === grade.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 md:w-8 md:h-8 bg-primary-500 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          aria-hidden="true"
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {selectedGrade && currentGradeLevel && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-md mx-auto">
                  <label className="block text-lg font-semibold text-gray-900 mb-3">세부 학년 선택</label>
                  <div className="relative">
                    <select
                      value={selectedGradeDetail || ""}
                      onChange={(e) => setSelectedGradeDetail(e.target.value)}
                      className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">학년을 선택하세요</option>
                      {currentGradeLevel.details.map((detail) => (
                        <option key={detail.value} value={detail.value}>
                          {detail.label} - {detail.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedGradeDetail && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-green-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {currentGradeLevel.details.find(d => d.value === selectedGradeDetail)?.label} 선택됨
                    </motion.p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Ready to Start */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
              >
                <Sparkles className="w-24 h-24 mx-auto text-accent-500" />
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold gradient-text">준비 완료!</h1>
                <p className="text-lg md:text-2xl px-4" style={{ color: '#4B5563' }}>
                  이제 AI 튜터와 함께 학습을 시작할 준비가 되었습니다
                </p>
              </div>

              <div className="max-w-md mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-gray-900">선택한 정보</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">이름</span>
                    <span className="font-bold text-gray-900">{username}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">학교급</span>
                    <span className="font-bold text-gray-900">
                      {gradeLevels.find((g) => g.id === selectedGrade)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">학년</span>
                    <span className="font-bold text-gray-900">
                      {currentGradeLevel?.details.find((d) => d.value === selectedGradeDetail)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={handleStart}
                  className="px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-bold text-lg md:text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-primary-300"
                  aria-label="학습 시작하기"
                >
                  <span>학습 시작하기</span>
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 3 && (
          <nav className="flex justify-between mt-12" aria-label="온보딩 진행 네비게이션">
            <motion.div
              whileHover={{ scale: step === 1 ? 1 : 1.05 }}
              whileTap={{ scale: step === 1 ? 1 : 0.95 }}
            >
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`px-6 md:px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-primary-200 ${
                  step === 1
                    ? "bg-gray-200 cursor-not-allowed opacity-50"
                    : "bg-white border-2 border-gray-300 hover:border-primary-500 active:scale-95"
                }`}
                style={{ color: step === 1 ? '#6B7280' : '#374151' }}
                aria-label="이전 단계"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">이전</span>
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: ((step === 1 && !username) || (step === 2 && (!selectedGrade || !selectedGradeDetail))) ? 1 : 1.05 }}
              whileTap={{ scale: ((step === 1 && !username) || (step === 2 && (!selectedGrade || !selectedGradeDetail))) ? 1 : 0.95 }}
            >
              <button
                onClick={handleNext}
                disabled={(step === 1 && !username) || (step === 2 && (!selectedGrade || !selectedGradeDetail))}
                className={`px-6 md:px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-primary-200 ${
                (step === 1 && !username) || (step === 2 && (!selectedGrade || !selectedGradeDetail))
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-xl active:scale-95"
              }`}
                style={{ color: ((step === 1 && !username) || (step === 2 && (!selectedGrade || !selectedGradeDetail))) ? '#6B7280' : 'white' }}
                aria-label="다음 단계"
              >
                <span className="hidden sm:inline">다음</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </motion.div>
          </nav>
        )}
      </div>
    </div>
  );
}
