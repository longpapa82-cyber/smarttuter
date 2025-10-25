import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold gradient-text mb-4">404</div>
          <div className="text-6xl mb-4">🤔</div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          URL을 다시 확인해주세요.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-semibold hover:shadow-xl transition-all"
          >
            <Home className="w-5 h-5 mr-2" />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-primary-500 transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            이전 페이지
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">도움이 필요하신가요?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/tutor/math" className="text-primary-600 hover:underline">
              수학 튜터
            </Link>
            <Link href="/tutor/english" className="text-accent-600 hover:underline">
              영어 튜터
            </Link>
            <Link href="/report" className="text-secondary-600 hover:underline">
              학습 리포트
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
