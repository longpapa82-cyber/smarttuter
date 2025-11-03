'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function AuthSetupPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            로그인으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            OAuth 설정 가이드
          </h1>
          <p className="text-gray-600">
            Google, Kakao 소셜 로그인을 설정하는 방법을 안내합니다
          </p>
        </div>

        {/* Google OAuth Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Google OAuth</h2>
              <p className="text-sm text-gray-600">Google Cloud Console 설정</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-blue-900 mb-2">1. Google Cloud Console 접속</h3>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                console.cloud.google.com/apis/credentials
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-blue-900 mb-2">2. 프로젝트 생성 및 OAuth 2.0 클라이언트 ID 생성</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>새 프로젝트 생성 (또는 기존 프로젝트 선택)</li>
                <li>&quot;사용자 인증 정보 만들기&quot; → &quot;OAuth 클라이언트 ID&quot; 선택</li>
                <li>애플리케이션 유형: &quot;웹 애플리케이션&quot; 선택</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-blue-900 mb-2">3. 승인된 리디렉션 URI 추가</h3>
              <div className="space-y-2 mt-2">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">개발 환경:</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-gray-800">http://localhost:3000/api/auth/callback/google</code>
                    <button
                      onClick={() => copyToClipboard('http://localhost:3000/api/auth/callback/google', 'google-dev')}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copiedField === 'google-dev' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">프로덕션 환경:</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-gray-800">https://your-domain.com/api/auth/callback/google</code>
                    <button
                      onClick={() => copyToClipboard('https://your-domain.com/api/auth/callback/google', 'google-prod')}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copiedField === 'google-prod' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-green-900 mb-2">4. 환경 변수 설정</h3>
              <p className="text-sm text-gray-700 mb-2">.env.local 파일에 추가:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div>GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</div>
                <div>GOOGLE_CLIENT_SECRET=your-client-secret</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Kakao OAuth Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                <path d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5 8.5-3.8 8.5-8.5-3.8-8.5-8.5-8.5zm3.7 10.2H8.3v-1.4h7.4v1.4zm0-2.8H8.3V9.5h7.4v1.4z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kakao OAuth</h2>
              <p className="text-sm text-gray-600">Kakao Developers 설정</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-yellow-900 mb-2">1. Kakao Developers 접속</h3>
              <a
                href="https://developers.kakao.com/console/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-yellow-700 hover:text-yellow-800 transition-colors"
              >
                developers.kakao.com/console/app
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>

            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-yellow-900 mb-2">2. 애플리케이션 생성 및 설정</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>&quot;애플리케이션 추가하기&quot; 클릭</li>
                <li>앱 이름: &quot;AI Park&quot; (또는 원하는 이름)</li>
                <li>사업자명: 개인 개발자 이름 입력</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-yellow-900 mb-2">3. Redirect URI 설정</h3>
              <p className="text-sm text-gray-700 mb-2">
                앱 설정 → 카카오 로그인 → Redirect URI 등록
              </p>
              <div className="space-y-2 mt-2">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">개발 환경:</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-gray-800">http://localhost:3000/api/auth/callback/kakao</code>
                    <button
                      onClick={() => copyToClipboard('http://localhost:3000/api/auth/callback/kakao', 'kakao-dev')}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copiedField === 'kakao-dev' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">프로덕션 환경:</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-gray-800">https://your-domain.com/api/auth/callback/kakao</code>
                    <button
                      onClick={() => copyToClipboard('https://your-domain.com/api/auth/callback/kakao', 'kakao-prod')}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {copiedField === 'kakao-prod' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-yellow-900 mb-2">4. 동의 항목 설정</h3>
              <p className="text-sm text-gray-700 mb-2">
                카카오 로그인 → 동의 항목에서 다음 항목 설정:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>닉네임: 필수 동의</li>
                <li>카카오계정(이메일): 필수 동의</li>
                <li>프로필 사진: 선택 동의</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-xl">
              <h3 className="font-semibold text-green-900 mb-2">5. 환경 변수 설정</h3>
              <p className="text-sm text-gray-700 mb-2">.env.local 파일에 추가:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div>KAKAO_CLIENT_ID=your-rest-api-key</div>
                <div>KAKAO_CLIENT_SECRET=your-client-secret</div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 REST API 키는 앱 설정 → 앱 키에서 확인할 수 있습니다
              </p>
            </div>
          </div>
        </motion.div>

        {/* Testing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">🧪 테스트하기</h2>
          <div className="space-y-3">
            <p className="text-white/90">설정을 완료한 후 다음 단계로 테스트하세요:</p>
            <ol className="list-decimal list-inside space-y-2 text-white/90">
              <li>.env.local 파일에 클라이언트 ID와 Secret 추가</li>
              <li>개발 서버 재시작 (npm run dev)</li>
              <li>로그인 페이지에서 소셜 로그인 버튼 클릭</li>
              <li>OAuth 인증 플로우 확인</li>
            </ol>
            <div className="flex space-x-4 mt-6">
              <Link
                href="/login"
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                로그인 페이지로
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors backdrop-blur-sm"
              >
                회원가입 페이지로
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>🔒 OAuth 설정은 사용자 인증을 안전하게 처리하기 위한 필수 과정입니다</p>
          <p className="mt-1">
            문제가 발생하면{' '}
            <a
              href="https://next-auth.js.org/providers/google"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              NextAuth 공식 문서
            </a>
            를 참고하세요
          </p>
        </div>
      </div>
    </div>
  );
}
