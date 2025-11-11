'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getUserProfile, updateUserProfile, validateNickname } from '@/lib/user/user-profile';
import { GRADE_LEVEL_OPTIONS, SUBJECT_OPTIONS, type GradeLevel, type Subject } from '@/types/user';

export default function EditableProfileSection() {
  const profile = getUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(profile?.gradeLevel || null);
  const [subjects, setSubjects] = useState<Subject[]>(profile?.preferredSubjects || []);
  const [learningGoals, setLearningGoals] = useState(profile?.learningGoals || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <p className="text-gray-600">프로필을 불러올 수 없습니다.</p>
      </div>
    );
  }

  const handleSave = () => {
    // 유효성 검사
    const validation = validateNickname(nickname);
    if (!validation.isValid) {
      setError(validation.error || '유효하지 않은 닉네임입니다.');
      return;
    }

    if (subjects.length === 0) {
      setError('최소 1개 이상의 과목을 선택해주세요.');
      return;
    }

    // 업데이트 (gradeLevel 제외 - Settings에서만 변경 가능)
    updateUserProfile({
      nickname,
      preferredSubjects: subjects,
      learningGoals: learningGoals || undefined,
    });

    setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    setError('');
    setIsEditing(false);

    // 3초 후 성공 메시지 제거
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancel = () => {
    // 원래 값으로 복원
    setNickname(profile.nickname);
    setGradeLevel(profile.gradeLevel);
    setSubjects(profile.preferredSubjects);
    setLearningGoals(profile.learningGoals || '');
    setError('');
    setIsEditing(false);
  };

  const toggleSubject = (subject: Subject) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">학습 정보</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            편집
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm"
        >
          {success}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            닉네임
          </label>
          {isEditing ? (
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900 font-semibold">{profile.nickname}</p>
          )}
        </div>

        {/* Grade Level - Read-only with Settings link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            학교급
          </label>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {GRADE_LEVEL_OPTIONS.find((o) => o.value === profile.gradeLevel)?.emoji}
              </span>
              <div>
                <p className="text-gray-900 font-semibold">
                  {GRADE_LEVEL_OPTIONS.find((o) => o.value === profile.gradeLevel)?.label}
                </p>
                {profile.gradeLevelSetAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    설정일: {new Date(profile.gradeLevelSetAt).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <span>학년 변경</span>
              <span>→</span>
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <span>ℹ️</span>
            <span>학년 변경은 24시간에 1회만 가능합니다</span>
          </p>
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            선호 과목
          </label>
          {isEditing ? (
            <div className="flex gap-3">
              {SUBJECT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleSubject(option.value)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    subjects.includes(option.value)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {profile.preferredSubjects.map((subject) => {
                const option = SUBJECT_OPTIONS.find((o) => o.value === subject);
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
          )}
        </div>

        {/* Learning Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            학습 목표 (선택)
          </label>
          {isEditing ? (
            <textarea
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="예: 영어 회화 실력 향상, 수학 성적 올리기"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">
              {profile.learningGoals || '학습 목표가 설정되지 않았습니다.'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
