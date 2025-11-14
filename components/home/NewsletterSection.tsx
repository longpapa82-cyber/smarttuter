'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Send, CheckCircle, Sparkles, Gift, Bell } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setMessage('구독이 완료되었습니다! 곧 이메일을 확인해주세요.');
      setEmail('');
    }, 1500);
  };

  return (
    <section
      id="newsletter"
      className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
      aria-labelledby="newsletter-heading"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600" aria-hidden="true" />

      {/* Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-30" aria-hidden="true">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              aria-hidden="true"
            >
              <Mail className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <h2
              id="newsletter-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6"
            >
              AI Park 소식을
              <br />
              가장 먼저 받아보세요
            </h2>

            {/* Description */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              새로운 기능, 학습 팁, 특별 이벤트 소식을
              <br className="hidden sm:block" />
              이메일로 받아보세요
            </p>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12"
            >
              <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Gift className="w-6 h-6 text-white flex-shrink-0" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  독점 학습 콘텐츠
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Bell className="w-6 h-6 text-white flex-shrink-0" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  신기능 우선 체험
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Sparkles className="w-6 h-6 text-white flex-shrink-0" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  특별 이벤트 안내
                </span>
              </div>
            </motion.div>

            {/* Email Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto"
              aria-label="뉴스레터 구독"
            >
              {status !== 'success' ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 주소를 입력하세요"
                    className="flex-1 px-6 py-4 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                    disabled={status === 'loading'}
                    aria-label="이메일 주소"
                    aria-required="true"
                    aria-invalid={status === 'error'}
                    aria-describedby={status === 'error' ? 'email-error' : undefined}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={status === 'loading'}
                    className="px-8 py-4 bg-white text-primary-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={status === 'loading' ? '구독 처리 중' : '뉴스레터 구독하기'}
                  >
                    {status === 'loading' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        구독 중...
                      </>
                    ) : (
                      <>
                        구독하기
                        <Send className="w-5 h-5" aria-hidden="true" />
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" aria-hidden="true" />
                    <span className="text-xl font-bold text-gray-900">구독 완료!</span>
                  </div>
                  <p className="text-gray-600">
                    환영합니다! 곧 이메일을 확인해주세요.
                  </p>
                </motion.div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <motion.p
                  id="email-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-yellow-200"
                  role="alert"
                >
                  {message}
                </motion.p>
              )}

              {/* Privacy Notice */}
              {status !== 'success' && (
                <p className="mt-4 text-sm text-white/70">
                  구독하시면{' '}
                  <a href="/privacy" className="underline hover:text-white transition-colors">
                    개인정보처리방침
                  </a>
                  에 동의하는 것으로 간주됩니다
                  <br className="hidden sm:block" />
                  언제든지 구독을 취소하실 수 있습니다
                </p>
              )}
            </motion.form>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  10,000+
                </div>
                <div className="text-sm sm:text-base text-white/80">구독자</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  Weekly
                </div>
                <div className="text-sm sm:text-base text-white/80">학습 팁</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  Exclusive
                </div>
                <div className="text-sm sm:text-base text-white/80">특별 혜택</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
