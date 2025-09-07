'use client'

import { useEffect } from 'react'
import { pusherClient } from '@/lib/pusher'

// Hook to ensure proper cleanup when user leaves page
export const usePusherCleanup = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Disconnect Pusher when user leaves page
      pusherClient.disconnect()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Disconnect when tab becomes hidden
        pusherClient.disconnect()
      } else {
        // Reconnect when tab becomes visible
        pusherClient.connect()
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
