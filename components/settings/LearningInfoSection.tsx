'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Edit3 } from 'lucide-react';
import { getUserProfile } from '@/lib/user/user-profile';
import { GRADE_LEVEL_OPTIONS, SUBJECT_OPTIONS } from '@/types/user';
import GradeLevelChangeModal from './GradeLevelChangeModal';

export default function LearningInfoSection() {
  const profile = getUserProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <p className="text-gray-600">프로필 정보를 불러올 수 없습니다.</p>
      </motion.div>
    );
  }

  const gradeOption = GRADE_LEVEL_OPTIONS.find(
    opt => opt.value === profile.gradeLevel
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">학습 정보</h2>
              <p className="text-sm text-gray-600">현재 학년 및 선호 과목</p>
            </div>
          </div>
        </div>

        {/* 현재 학년 표시 (Read-only) */}
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">{gradeOption?.emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-700">현재 학년</p>
                <p className="text-lg font-semibold text-gray-900">
                  {gradeOption?.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {gradeOption?.description}
                </p>
                {profile.gradeLevelSetAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    설정일: {new Date(profile.gradeLevelSetAt).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            </div>

            {/* 변경 버튼 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              변경하기
            </button>
          </div>

          {/* 선호 과목 표시 (Read-only) */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-2">선호 과목</p>
            <div className="flex gap-2 flex-wrap">
              {profile.preferredSubjects.map((subject) => {
                const option = SUBJECT_OPTIONS.find(o => o.value === subject);
                return (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    {option?.emoji} {option?.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 학년 변경 모달 */}
      <GradeLevelChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentGrade={profile.gradeLevel}
      />
    </>
  );
}
