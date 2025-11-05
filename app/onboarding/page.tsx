'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import ExperienceStep from '@/components/onboarding/ExperienceStep';
import GradeLevelStep from '@/components/onboarding/GradeLevelStep';
import SubjectStep from '@/components/onboarding/SubjectStep';
import NicknameStep from '@/components/onboarding/NicknameStep';
import AuthStep from '@/components/onboarding/AuthStep';
import {
  getOnboardingProgress,
  saveOnboardingProgress,
  advanceOnboardingStep,
  revertOnboardingStep,
  completeOnboarding,
} from '@/lib/user/user-profile';
import type { GradeLevel, Subject } from '@/types/user';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0-5 (6 steps)
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [nickname, setNickname] = useState('');
  const [redirecting, setRedirecting] = useState(true);

  // 자동 리다이렉트: 빠른 온보딩으로 이동
  useEffect(() => {
    setRedirecting(true);
    router.replace('/onboarding/quick');
  }, [router]);

  // 리다이렉트 중일 때는 빈 화면 표시
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  // 진행 상황 불러오기
  useEffect(() => {
    const progress = getOnboardingProgress();
    if (progress) {
      setCurrentStep(progress.currentStep);
      if (progress.data.gradeLevel) setGradeLevel(progress.data.gradeLevel);
      if (progress.data.preferredSubjects) setSubjects(progress.data.preferredSubjects);
      if (progress.data.nickname) setNickname(progress.data.nickname);
    }
  }, []);

  const handleNextStep = () => {
    advanceOnboardingStep();
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    revertOnboardingStep();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Step 0 → 1: Welcome → Experience
  const handleWelcome = () => {
    handleNextStep();
  };

  // Step 1: Experience - Skip to Step 2
  const handleSkipExperience = () => {
    handleNextStep();
  };

  // Step 2 → 3: Grade Level → Subject
  const handleGradeLevel = (level: GradeLevel) => {
    setGradeLevel(level);
    advanceOnboardingStep({ gradeLevel: level });
    setCurrentStep((prev) => prev + 1);
  };

  // Step 3 → 4: Subject → Nickname
  const handleSubject = (selectedSubjects: Subject[]) => {
    setSubjects(selectedSubjects);
    advanceOnboardingStep({ preferredSubjects: selectedSubjects });
    setCurrentStep((prev) => prev + 1);
  };

  // Step 4 → 5: Nickname → Auth
  const handleNickname = (nick: string) => {
    setNickname(nick);
    advanceOnboardingStep({ nickname: nick });
    setCurrentStep((prev) => prev + 1);
  };

  // Step 5: Auth - Complete
  const handleGoogleAuth = async () => {
    // TODO: Google OAuth 통합
    alert('Google 로그인 기능은 추후 구현됩니다.');
  };

  const handleGithubAuth = async () => {
    // TODO: GitHub OAuth 통합
    alert('GitHub 로그인 기능은 추후 구현됩니다.');
  };

  const handleSkipAuth = () => {
    // 게스트 모드로 완료
    completeOnboarding();

    // Set guest mode cookie (1 year expiry)
    // This allows guest users to access dashboard and tutor without authentication
    document.cookie = 'aipark_guest_mode=true; path=/; max-age=31536000; SameSite=Lax';

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Progress Bar */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all ${
                    currentStep > step
                      ? 'w-12 bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'w-8 bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              {currentStep}/5 단계 완료
            </div>
          </div>
        )}

        {/* Back Button (Step 2 이상) */}
        {currentStep >= 2 && (
          <button
            onClick={handlePrevStep}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 0 && (
            <WelcomeStep key={`step-${currentStep}`} onNext={handleWelcome} />
          )}

          {currentStep === 1 && (
            <ExperienceStep
              key={`step-${currentStep}`}
              onNext={handleNextStep}
              onSkip={handleSkipExperience}
            />
          )}

          {currentStep === 2 && (
            <GradeLevelStep key={`step-${currentStep}`} onNext={handleGradeLevel} />
          )}

          {currentStep === 3 && (
            <SubjectStep key={`step-${currentStep}`} onNext={handleSubject} />
          )}

          {currentStep === 4 && (
            <NicknameStep key={`step-${currentStep}`} onNext={handleNickname} />
          )}

          {currentStep === 5 && (
            <AuthStep
              key={`step-${currentStep}`}
              onGoogleAuth={handleGoogleAuth}
              onGithubAuth={handleGithubAuth}
              onSkip={handleSkipAuth}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
