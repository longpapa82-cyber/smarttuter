'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { SUBJECT_OPTIONS, type Subject } from '@/types/user';

interface SubjectStepProps {
  onNext: (subjects: Subject[]) => void;
}

export default function SubjectStep({ onNext }: SubjectStepProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const toggleSubject = (subject: Subject) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleNext = () => {
    if (selectedSubjects.length === 0) {
      alert('최소 1개 이상의 과목을 선택해주세요.');
      return;
    }
    onNext(selectedSubjects);
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
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-3 text-gray-900">
          어떤 과목을
          <br />
          집중하고 싶으신가요?
        </h2>
        <p className="text-lg text-gray-600">
          복수 선택 가능합니다
        </p>
      </motion.div>

      {/* Subject Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mb-12">
        {SUBJECT_OPTIONS.map((option, index) => {
          const isSelected = selectedSubjects.includes(option.value);

          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSubject(option.value)}
              className={`
                relative p-8 rounded-3xl transition-all text-left h-64 flex flex-col justify-between overflow-hidden
                ${
                  isSelected
                    ? `bg-gradient-to-br ${option.color} text-white shadow-2xl`
                    : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-purple-300 hover:shadow-lg'
                }
              `}
            >
              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}

              <div>
                <div className="text-6xl mb-4">{option.emoji}</div>
                <h3 className="text-3xl font-bold mb-2">{option.label}</h3>
                <p className={isSelected ? 'text-white/90' : 'text-gray-600'}>
                  {option.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-lg font-semibold">
                {isSelected ? (
                  <>
                    <span>선택됨</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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

      {/* Next Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        disabled={selectedSubjects.length === 0}
        className={`
          px-12 py-4 text-lg font-bold rounded-full shadow-xl transition-all
          ${
            selectedSubjects.length > 0
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white hover:shadow-2xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        다음 →
      </motion.button>
    </motion.div>
  );
}
