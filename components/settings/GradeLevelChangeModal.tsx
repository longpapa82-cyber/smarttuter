'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { GRADE_LEVEL_OPTIONS, type GradeLevel } from '@/types/user';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentGrade: GradeLevel;
}

export default function GradeLevelChangeModal({ isOpen, onClose, currentGrade }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canChange, setCanChange] = useState(true);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null);

  // 변경 가능 여부 확인
  useEffect(() => {
    if (isOpen) {
      checkEligibility();
    }
  }, [isOpen]);

  const checkEligibility = async () => {
    try {
      const res = await fetch('/api/user/grade-level/change-eligibility');
      const data = await res.json();

      setCanChange(data.canChange);
      setNextAvailableAt(data.nextAvailableAt || null);

      if (!data.canChange && data.reason === 'rate_limited') {
        setError(`24시간 내 1회만 변경 가능합니다. 다음 변경 가능 시각: ${new Date(data.nextAvailableAt).toLocaleString('ko-KR')}`);
      }
    } catch (err) {
      console.error('변경 가능 여부 확인 실패:', err);
    }
  };

  const handleSelectGrade = (grade: GradeLevel) => {
    if (grade === currentGrade) {
      setError('현재 학년과 동일합니다.');
      return;
    }
    setSelectedGrade(grade);
    setError('');
  };

  const handleProceed = () => {
    if (!selectedGrade) {
      setError('새 학년을 선택해주세요.');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedGrade) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/grade-level/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newGradeLevel: selectedGrade,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '학년 변경에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      // 성공
      window.location.reload(); // 프로필 재로딩
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedGrade(null);
    setError('');
  };

  const handleClose = () => {
    if (!isLoading) {
      handleCancel();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!showConfirm ? (
                // Step 1: 학년 선택
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">학년 변경</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        새로운 학년을 선택해주세요
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Warning */}
                  <div className="p-6 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">학년을 변경하면:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>추천 콘텐츠가 새 학년에 맞게 재설정됩니다</li>
                          <li>학습 통계와 성취 기록은 모두 유지됩니다</li>
                          <li>24시간 내 1회만 변경할 수 있습니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Current Grade */}
                  <div className="p-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">현재 학년</p>
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <span>{GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.emoji}</span>
                      <span>{GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.label}</span>
                    </div>
                  </div>

                  {/* Grade Selection */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">새 학년 선택</p>

                    {!canChange && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {GRADE_LEVEL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSelectGrade(option.value)}
                          disabled={!canChange || option.value === currentGrade}
                          className={`
                            p-4 rounded-xl border-2 transition-all text-left
                            ${selectedGrade === option.value
                              ? 'border-primary-600 bg-primary-50'
                              : option.value === currentGrade
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : !canChange
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{option.emoji}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {option.label}
                                {option.value === currentGrade && (
                                  <span className="ml-2 text-xs text-gray-500">(현재)</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">{option.description}</div>
                            </div>
                            {selectedGrade === option.value && (
                              <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {error && canChange && (
                      <p className="mt-4 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleProceed}
                      disabled={!selectedGrade || !canChange || isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </>
              ) : (
                // Step 2: 확인
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">변경 확인</h2>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Confirmation */}
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-amber-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      정말 학년을 변경하시겠습니까?
                    </h3>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">현재 학년</span>
                        <span className="font-semibold text-gray-900">
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.emoji}{' '}
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === currentGrade)?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-center my-2">
                        <span className="text-2xl">→</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">새 학년</span>
                        <span className="font-semibold text-primary-600">
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === selectedGrade)?.emoji}{' '}
                          {GRADE_LEVEL_OPTIONS.find(o => o.value === selectedGrade)?.label}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-600">
                      이 작업은 되돌릴 수 없으며, 24시간 동안 다시 변경할 수 없습니다.
                    </p>

                    {error && (
                      <p className="mt-4 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          변경 중...
                        </>
                      ) : (
                        '변경하기'
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
