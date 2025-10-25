"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Calculator, MessageCircle, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type GradeLevel = "elementary" | "middle" | "high" | "university" | null;
type Subject = "math" | "english" | null;

const gradeLevels = [
  {
    id: "elementary" as const,
    name: "초등학교",
    icon: "🎒",
    description: "기초부터 탄탄하게",
    color: "from-yellow-400 to-orange-400",
  },
  {
    id: "middle" as const,
    name: "중학교",
    icon: "📚",
    description: "개념을 확실하게",
    color: "from-green-400 to-teal-400",
  },
  {
    id: "high" as const,
    name: "고등학교",
    icon: "🎓",
    description: "심화 학습으로",
    color: "from-blue-400 to-indigo-400",
  },
  {
    id: "university" as const,
    name: "대학교",
    icon: "🏛️",
    description: "전문 지식까지",
    color: "from-purple-400 to-pink-400",
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
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(null);

  const handleNext = () => {
    if (step === 1 && selectedGrade) {
      setStep(2);
    } else if (step === 2 && selectedSubject) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStart = () => {
    // Store selections in localStorage or state management
    localStorage.setItem("userGrade", selectedGrade || "");
    localStorage.setItem("userSubject", selectedSubject || "");

    // Navigate to appropriate tutor page
    if (selectedSubject === "math") {
      router.push("/tutor/math");
    } else if (selectedSubject === "english") {
      router.push("/tutor/english");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: step === i ? 1.2 : 1,
                    backgroundColor: step >= i ? "#6366f1" : "#e5e7eb",
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                >
                  {i}
                </motion.div>
                {i < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      step > i ? "bg-primary-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center" style={{ color: '#4B5563' }}>
            {step === 1 && "학교급 선택"}
            {step === 2 && "과목 선택"}
            {step === 3 && "준비 완료"}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Grade Level Selection */}
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
                  <GraduationCap className="w-16 h-16 mx-auto text-primary-500" />
                </motion.div>
                <h1 className="text-4xl font-bold gradient-text">학교급을 선택해주세요</h1>
                <p className="text-xl" style={{ color: '#4B5563' }}>
                  현재 학년에 맞는 맞춤형 학습을 제공합니다
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {gradeLevels.map((grade, index) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => setSelectedGrade(grade.id)}
                      className={`w-full p-8 rounded-2xl border-2 transition-all text-left ${
                        selectedGrade === grade.id
                          ? "border-primary-500 bg-primary-50 shadow-xl scale-105"
                          : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg"
                      }`}
                    >
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grade.color} flex items-center justify-center text-3xl`}>
                        {grade.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-gray-900">{grade.name}</h3>
                        <p className="text-gray-700">{grade.description}</p>
                      </div>
                      {selectedGrade === grade.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white"
                        >
                          ✓
                        </motion.div>
                      )}
                    </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Subject Selection */}
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
                  <BookOpen className="w-16 h-16 mx-auto text-secondary-500" />
                </motion.div>
                <h1 className="text-4xl font-bold gradient-text">과목을 선택해주세요</h1>
                <p className="text-xl" style={{ color: '#4B5563' }}>
                  {gradeLevels.find((g) => g.id === selectedGrade)?.name}에 맞는 학습을 시작합니다
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {subjects.map((subject, index) => {
                  const Icon = subject.icon;
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setSelectedSubject(subject.id)}
                        className={`w-full p-8 rounded-2xl border-2 transition-all text-left ${
                          selectedSubject === subject.id
                            ? "border-secondary-500 bg-secondary-50 shadow-xl scale-105"
                            : "border-gray-200 bg-white hover:border-secondary-300 hover:shadow-lg"
                        }`}
                      >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-white`}>
                            <Icon className="w-8 h-8" />
                          </div>
                          {selectedSubject === subject.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white"
                            >
                              ✓
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2 text-gray-900">{subject.name}</h3>
                          <p className="text-gray-700 mb-4">{subject.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {subject.features.map((feature) => (
                              <span
                                key={feature}
                                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm"
                                style={{ color: '#111827' }}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
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
                <h1 className="text-5xl font-bold gradient-text">준비 완료!</h1>
                <p className="text-2xl" style={{ color: '#4B5563' }}>
                  이제 AI 튜터와 함께 학습을 시작할 준비가 되었습니다
                </p>
              </div>

              <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-gray-900">선택한 정보</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">학교급</span>
                    <span className="font-bold text-gray-900">
                      {gradeLevels.find((g) => g.id === selectedGrade)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">과목</span>
                    <span className="font-bold text-gray-900">
                      {subjects.find((s) => s.id === selectedSubject)?.name}
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
                  className="px-12 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center space-x-2"
                >
                  <span>학습 시작하기</span>
                  <Sparkles className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 3 && (
          <div className="flex justify-between mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center space-x-2 ${
                  step === 1
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-white border-2 border-gray-300 hover:border-primary-500"
                }`}
                style={{ color: step === 1 ? '#6B7280' : '#374151' }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>이전</span>
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={handleNext}
                disabled={(step === 1 && !selectedGrade) || (step === 2 && !selectedSubject)}
                className={`px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center space-x-2 ${
                (step === 1 && !selectedGrade) || (step === 2 && !selectedSubject)
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-xl"
              }`}
                style={{ color: ((step === 1 && !selectedGrade) || (step === 2 && !selectedSubject)) ? '#6B7280' : 'white' }}
              >
                <span>다음</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
