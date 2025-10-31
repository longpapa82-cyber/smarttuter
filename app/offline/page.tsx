import { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Offline - SmartTuter',
  description: 'You are currently offline',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Offline Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          It looks like you&apos;re not connected to the internet. Some features may be
          limited until you reconnect.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {/* Retry Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          {/* Home Button */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Cached Content Notice */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 Some previously visited pages may still be available while
            offline
          </p>
        </div>
      </div>
    </div>
  )
}
