'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { createGuestProfile } from '@/lib/user/guest-profile';

const GRADE_LEVELS = [
  { id: 'elementary', label: '초등학생', icon: '🎒', grades: ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'] },
  { id: 'middle', label: '중학생', icon: '📚', grades: ['1학년', '2학년', '3학년'] },
  { id: 'high', label: '고등학생', icon: '🎓', grades: ['1학년', '2학년', '3학년'] },
  { id: 'university', label: '대학생', icon: '🏛️', grades: ['대학생'] },
];

const SUBJECTS = [
  { id: 'english', label: '영어', icon: '🇬🇧', color: 'from-blue-500 to-cyan-500', description: '실시간 음성 대화' },
  { id: 'math', label: '수학', icon: '🔢', color: 'from-purple-500 to-pink-500', description: 'OCR 문제 풀이' },
  { id: 'science', label: '과학', icon: '🔬', color: 'from-green-500 to-emerald-500', description: '실험·개념 학습' },
  { id: 'social', label: '사회', icon: '🌍', color: 'from-orange-500 to-red-500', description: '역사·지리·경제' },
];

export default function QuickOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSchoolType, setSelectedSchoolType] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const handleSchoolTypeSelect = (schoolType: string) => {
    setSelectedSchoolType(schoolType);
    setSelectedGrade('');
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
  };

  const handleContinue = () => {
    if (step === 1 && selectedSchoolType && selectedGrade) {
      setStep(2);
    }
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);

    const schoolTypeMap: Record<string, string> = {
      elementary: '초등학교',
      middle: '중학교',
      high: '고등학교',
      university: '대학교',
    };

    const gradeLevel = selectedGrade === '대학생'
      ? '대학교'
      : `${schoolTypeMap[selectedSchoolType]} ${selectedGrade}`;

    createGuestProfile(gradeLevel, [subjectId]);

    setTimeout(() => {
      router.push(`/tutor/${subjectId}`);
    }, 300);
  };

  const getSchoolTypeData = () => {
    return GRADE_LEVELS.find((s) => s.id === selectedSchoolType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Park에 오신 것을 환영합니다! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {step === 1 ? '학년을 선택하고 바로 시작하세요' : '학습할 과목을 선택하세요'}
          </p>
        </div>

        <div className="flex items-center justify-center mb-8 gap-2">
          <div className={`w-3 h-3 rounded-full transition-colors \${step === 1 ? 'bg-blue-500' : 'bg-green-500'}`} />
          <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600" />
          <div className={`w-3 h-3 rounded-full transition-colors \${step === 2 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                학교급 선택
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {GRADE_LEVELS.map((schoolType) => (
                <motion.button
                  key={schoolType.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSchoolTypeSelect(schoolType.id)}
                  className={`p-4 rounded-xl border-2 transition-all \${
                    selectedSchoolType === schoolType.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{schoolType.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {schoolType.label}
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedSchoolType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  학년 선택
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {getSchoolTypeData()?.grades.map((grade) => (
                    <motion.button
                      key={grade}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGradeSelect(grade)}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all \${
                        selectedGrade === grade
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {grade}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: selectedGrade ? 1.02 : 1 }}
              whileTap={{ scale: selectedGrade ? 0.98 : 1 }}
              onClick={handleContinue}
              disabled={!selectedGrade}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all \${
                selectedGrade
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음 단계
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                과목 선택
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {SUBJECTS.map((subject) => (
                <motion.button
                  key={subject.id}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubjectSelect(subject.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all overflow-hidden group \${
                    selectedSubject === subject.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br \${subject.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                  <div className="relative flex items-start gap-4">
                    <div className="text-4xl">{subject.icon}</div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {subject.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subject.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              이전 단계
            </button>
          </motion.div>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          게스트로 시작하시면 7일간 체험 가능합니다 ✨<br />
          학습 기록을 저장하려면 회원가입이 필요합니다
        </p>
      </motion.div>
    </div>
  );
}
