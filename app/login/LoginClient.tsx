'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Clear guest mode cookie when entering login page
    // Users on login page are choosing to authenticate properly
    document.cookie = 'aipark_guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // Check for signup success
    if (searchParams.get('signup') === 'success') {
      setSuccessMessage('회원가입이 완료되었습니다! 로그인해주세요.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (result?.ok) {
        // callbackUrl 확인
        const callbackUrl = searchParams.get('callbackUrl');

        // callbackUrl이 명시적으로 지정된 경우 해당 URL로 이동
        if (callbackUrl && callbackUrl !== '/dashboard') {
          router.push(callbackUrl);
          router.refresh();
          return;
        }

        // 서버에서 프로필 확인
        try {
          // 짧은 대기 후 프로필 확인 (세션 업데이트 시간 고려)
          await new Promise(resolve => setTimeout(resolve, 300));

          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const { user } = await response.json();

            // 프로필이 완성되어 있으면 대시보드로, 아니면 온보딩으로
            const hasCompleteProfile = user?.gradeLevel && user?.gradeDetail;
            const redirectUrl = hasCompleteProfile ? '/dashboard' : '/onboarding/quick';

            router.push(redirectUrl);
            router.refresh();
          } else {
            // API 실패 시 온보딩으로 이동
            router.push('/onboarding/quick');
            router.refresh();
          }
        } catch (error) {
          console.error('프로필 확인 실패:', error);
          // 에러 발생 시 온보딩으로 이동
          router.push('/onboarding/quick');
          router.refresh();
        }
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(true);
    try {
      // callbackUrl 확인 (OAuth도 동일한 로직 적용)
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      await signIn(provider, { callbackUrl });
    } catch (err) {
      setError(`${provider} 로그인 중 오류가 발생했습니다.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              로그인
            </h1>
            <p className="text-gray-600">AI Park에 오신 것을 환영합니다</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
            >
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  enterKeyHint="next"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-gray-900"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  enterKeyHint="done"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">로그인 상태 유지</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                비밀번호 찾기
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>로그인 중...</span>
                </>
              ) : (
                <span>로그인</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-gray-700 font-medium">Google로 계속하기</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn('kakao')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#000000"
                  d="M12 3C6.477 3 2 6.253 2 10.253c0 2.625 1.705 4.926 4.276 6.304-.175.643-.656 2.443-.756 2.826-.118.463.17.457.358.332.136-.09 2.183-1.444 3.164-2.09.543.073 1.1.111 1.663.111 5.523 0 10-3.253 10-7.253S17.523 3 12 3z"
                />
              </svg>
              <span className="text-gray-900 font-medium">카카오로 계속하기</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-white font-medium">GitHub으로 계속하기</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              아직 회원이 아니신가요?{' '}
              <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
