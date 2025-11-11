'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { captureClientError } from '@/lib/error-tracking/client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error in Custom Error Tracker
    captureClientError(error, {
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Oops! Something went wrong
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-2 text-center">
              We&apos;re sorry, but something unexpected happened.
            </p>

            {/* Error Digest */}
            {error.digest && (
              <p className="text-sm text-gray-500 mb-6 text-center font-mono">
                Error ID: {error.digest}
              </p>
            )}

            {/* Error Message (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 font-semibold mb-1">
                  Development Info:
                </p>
                <p className="text-sm text-red-700 break-words">
                  {error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* Try Again Button */}
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              {/* Go Home Button */}
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go to Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800 text-center">
                💡 This error has been automatically reported. Our team will
                investigate it.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
