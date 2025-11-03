'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { validateNickname } from '@/lib/user/user-profile';

interface NicknameStepProps {
  onNext: (nickname: string) => void;
}

export default function NicknameStep({ onNext }: NicknameStepProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);

    // 실시간 유효성 검사
    if (value.length > 0) {
      const validation = validateNickname(value);
      if (!validation.isValid && validation.error) {
        setError(validation.error);
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateNickname(nickname);
    if (!validation.isValid) {
      setError(validation.error || '유효하지 않은 닉네임입니다.');
      return;
    }

    onNext(nickname.trim());
  };

  const isValid = nickname.length >= 2 && error === '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-[600px] px-6"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-6">🎭</div>
          <h2 className="text-4xl font-bold mb-3 text-gray-900">
            학습 진행상황을 저장하려면
            <br />
            닉네임을 설정해주세요!
          </h2>
          <p className="text-lg text-gray-600">
            나중에 프로필에서 변경 가능합니다
          </p>
        </motion.div>

        {/* Input Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div
            className={`
              relative p-6 rounded-2xl transition-all
              ${
                isFocused
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400'
                  : 'bg-gray-50 border-2 border-gray-200'
              }
            `}
          >
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="예: 학습왕, StudyKing, 수학천재"
              maxLength={20}
              className="w-full bg-transparent text-2xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
            />

            {/* Character Count */}
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className={error ? 'text-red-500' : 'text-gray-500'}>
                {error || '2-20자, 한글/영문/숫자/언더스코어 사용 가능'}
              </span>
              <span className="text-gray-400">
                {nickname.length}/20
              </span>
            </div>
          </div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            <span className="text-sm text-gray-600">추천:</span>
            {['학습왕', 'StudyKing', '수학천재', 'English_Master'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setNickname(suggestion);
                  setError('');
                }}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={isValid ? { scale: 1.05 } : {}}
          whileTap={isValid ? { scale: 0.95 } : {}}
          type="submit"
          disabled={!isValid}
          className={`
            w-full px-12 py-4 text-lg font-bold rounded-full shadow-xl transition-all
            ${
              isValid
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white hover:shadow-2xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          시작하기 →
        </motion.button>
      </form>
    </motion.div>
  );
}
