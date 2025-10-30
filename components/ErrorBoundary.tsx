'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                앗! 문제가 발생했습니다
              </h1>

              <p className="text-gray-600 mb-4">
                일시적인 오류가 발생했습니다.<br />
                아래 방법으로 해결할 수 있습니다.
              </p>

              <div className="w-full bg-blue-50 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-3 text-sm">
                  💡 해결 방법
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>페이지 새로고침 버튼을 클릭해주세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>브라우저 캐시를 삭제하고 다시 시도해주세요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>문제가 계속되면 홈 버튼으로 돌아가주세요</span>
                  </li>
                </ul>
              </div>

              {this.state.error && (
                <details className="w-full mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    기술적 세부 정보
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  새로고침
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  홈으로
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
