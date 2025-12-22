// Service Worker Registration
// Handles SW lifecycle and updates

export async function registerServiceWorker() {
  // ⚠️ SERVICE WORKER TEMPORARILY DISABLED
  // Reason: Conflicts with authentication bypass - Service Worker tries to cache 401 responses
  console.log('⚠️ Service Worker disabled (authentication bypass mode)')
  return null

  /* ORIGINAL CODE (COMMENTED OUT)
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('✅ Service Worker registered:', registration.scope)

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW available, prompt user to refresh
            console.log('🔄 New Service Worker available')
            notifyUpdate()
          }
        })
      }
    })

    // Check for updates every hour
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

    return registration
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error)
    return null
  }
  */
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister()
  })
}

// Notify user about SW update
function notifyUpdate() {
  if (typeof window === 'undefined') return

  // Custom event for app to handle
  const event = new CustomEvent('sw-update-available')
  window.dispatchEvent(event)
}

// Request background sync
export async function requestBackgroundSync(tag: string) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Type assertion for sync API (experimental feature)
    if ('sync' in registration) {
      const sync = (registration as any).sync
      await sync.register(tag)
      return true
    }

    return false
  } catch (error) {
    console.error('Background sync request failed:', error)
    return false
  }
}

// Check if app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

// Get network status
export function useNetworkStatus() {
  if (typeof window === 'undefined') {
    return { online: true, saveData: false }
  }

  return {
    online: navigator.onLine,
    saveData: (navigator as any).connection?.saveData || false,
  }
}
