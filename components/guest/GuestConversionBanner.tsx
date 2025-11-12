'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, UserPlus } from 'lucide-react';
import {
  getGuestProfile,
  shouldPromptSignup,
  getGuestProfileAge,
} from '@/lib/user/guest-profile';

export function GuestConversionBanner() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [profileAge, setProfileAge] = useState(0);

  useEffect(() => {
    const profile = getGuestProfile();
    if (!profile) return;

    const dismissed = sessionStorage.getItem('guest_banner_dismissed');
    if (dismissed === 'true') return;

    if (shouldPromptSignup()) {
      setIsVisible(true);
      setSessionCount(profile.sessionCount);
      setProfileAge(getGuestProfileAge());
    }
  }, []);

  const handleSignup = () => {
    router.push('/login?signup=true');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('guest_banner_dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-0 right-0 z-40 px-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      학습 기록을 저장하고 계속 공부하세요! 🎓
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                      {sessionCount}회 학습하셨네요! 회원가입하시면 학습 기록이 영구 보관됩니다.
                      {profileAge > 0 && (
                        <span className="block mt-1">
                          게스트 체험 {profileAge}일째 (최대 7일)
                        </span>
                      )}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSignup}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                      >
                        <UserPlus className="w-4 h-4" />
                        무료 회원가입
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                      >
                        나중에
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
