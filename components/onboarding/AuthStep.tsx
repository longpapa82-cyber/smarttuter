'use client';

import { motion } from 'framer-motion';

interface AuthStepProps {
  onGoogleAuth: () => void;
  onGithubAuth: () => void;
  onSkip: () => void;
}

export default function AuthStep({ onGoogleAuth, onGithubAuth, onSkip }: AuthStepProps) {
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
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-4xl font-bold mb-3 text-gray-900">
          진행상황을
          <br />
          안전하게 저장하세요
        </h2>
        <p className="text-lg text-gray-600">
          소셜 로그인으로 여러 기기에서 학습을 이어갈 수 있습니다
        </p>
      </motion.div>

      {/* Auth Buttons */}
      <div className="w-full max-w-md space-y-4 mb-8">
        {/* Google Login */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoogleAuth}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-lg font-semibold text-gray-700">Google로 계속하기</span>
        </motion.button>

        {/* GitHub Login */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGithubAuth}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 border-2 border-gray-900 rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl text-white"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-lg font-semibold">GitHub로 계속하기</span>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 w-full max-w-md mb-8">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-sm text-gray-500">또는</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSkip}
        className="px-8 py-3 text-gray-600 hover:text-gray-900 font-medium border-2 border-gray-300 rounded-full hover:border-gray-400 transition-all"
      >
        건너뛰기 (게스트로 계속)
      </motion.button>

      {/* Info Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-gray-500 mt-6 text-center max-w-md"
      >
        게스트 모드로 계속하시면 이 기기에만 학습 데이터가 저장됩니다.
        <br />
        나중에 프로필에서 계정을 연결할 수 있습니다.
      </motion.p>
    </motion.div>
  );
}
