'use client'

import { useEffect, useState } from 'react'
import { registerServiceWorker } from '@/lib/service-worker/register'
import { X, RefreshCw } from 'lucide-react'

export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Register service worker
    registerServiceWorker()

    // Listen for SW update events
    const handleUpdate = () => {
      setShowUpdatePrompt(true)
    }

    window.addEventListener('sw-update-available', handleUpdate)

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial online status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <>
      {children}

      {/* Update Available Prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Update Available
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  A new version of AI Park is available. Refresh to update.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Refresh Now
                  </button>
                  <button
                    onClick={() => setShowUpdatePrompt(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowUpdatePrompt(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
            ⚠️ You&apos;re offline. Some features may be limited.
          </div>
        </div>
      )}
    </>
  )
}
