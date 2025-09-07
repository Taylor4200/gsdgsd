'use client'

import { useEffect, useRef, useState } from 'react'
import { pusherClient, CHANNELS, EVENTS } from '@/lib/pusher'

// Ultra-efficient Pusher usage - only for critical real-time events
export const useCriticalPusher = () => {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<any>(null)
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map())

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn('Pusher key not found')
      return
    }

    // Only subscribe to critical events (not chat)
    channelRef.current = pusherClient.subscribe('critical-events')
    
    // Bind only to critical events
    channelRef.current.bind(EVENTS.CRITICAL_ALERT, (data: any) => {
      messageHandlers.current.get('critical_alert')?.(data)
    })

    pusherClient.connection.bind('connected', () => {
      setIsConnected(true)
    })

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false)
    })

    return () => {
      if (channelRef.current) {
        pusherClient.unsubscribe('critical-events')
      }
    }
  }, [])

  const onCriticalEvent = (handler: (data: any) => void) => {
    messageHandlers.current.set('critical_alert', handler)
    return () => messageHandlers.current.delete('critical_alert')
  }

  return {
    isConnected,
    onCriticalEvent
  }
}

// Use this for:
// - Jackpot alerts
// - System announcements  
// - Critical game events
// - NOT for regular chat (use polling instead)
