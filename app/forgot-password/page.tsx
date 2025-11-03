'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setResetLink('');

    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // In development, show the reset link
        if (data.resetLink) {
          setResetLink(data.resetLink);
        }
      } else {
        setError(data.error || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError('비밀번호 재설정 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            로그인으로 돌아가기
          </Link>

          <div className="mt-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <span className="text-2xl font-bold gradient-text">AI Park</span>
            </Link>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            비밀번호를 잊으셨나요?
          </h1>
          <p className="mt-2 text-gray-600">
            가입하신 이메일을 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {success ? (
            /* Success Message */
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                이메일을 확인해주세요!
              </h3>
              <p className="text-gray-600 mb-6">
                <strong>{email}</strong>로<br />
                비밀번호 재설정 링크를 보내드렸습니다.
              </p>

              {resetLink && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800 font-semibold mb-2">
                    🔧 개발 모드: 재설정 링크
                  </p>
                  <Link
                    href={resetLink}
                    className="text-sm text-blue-600 hover:text-blue-700 underline break-all"
                  >
                    {resetLink}
                  </Link>
                  <p className="text-xs text-yellow-700 mt-2">
                    실제 배포 시에는 이메일로 전송됩니다
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  이메일을 받지 못하셨나요?<br />
                  스팸 메일함을 확인해보세요.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  다른 이메일로 다시 시도
                </button>
              </div>
            </div>
          ) : (
            /* Email Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3"
                >
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-gray-900"
                    placeholder="example@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-xl font-medium hover:from-primary-600 hover:to-secondary-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>전송 중...</span>
                  </>
                ) : (
                  <span>재설정 링크 받기</span>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{' '}
                  <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                    회원가입
                  </Link>
                </p>
              </div>
            </form>
          )}
        </motion.div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 보안을 위해 가입 여부와 관계없이<br />
            동일한 메시지를 표시합니다
          </p>
        </div>
      </motion.div>
    </div>
  );
}
