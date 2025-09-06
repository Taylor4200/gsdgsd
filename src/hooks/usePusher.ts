'use client'

import { useEffect, useRef, useState } from 'react'
import { pusherClient, CHANNELS, EVENTS } from '@/lib/pusher'

interface UsePusherOptions {
  channel: string
  events: string[]
  onMessage?: (event: string, data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

export const usePusher = ({
  channel,
  events,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UsePusherOptions) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  const channelRef = useRef<any>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn('Pusher key not found, WebSocket functionality disabled')
      return
    }

    try {
      // Subscribe to channel
      channelRef.current = pusherClient.subscribe(channel)
      
      // Bind to events
      events.forEach(event => {
        channelRef.current.bind(event, (data: any) => {
          onMessage?.(event, data)
        })
      })

      // Connection state handlers
      pusherClient.connection.bind('connected', () => {
        setIsConnected(true)
        setConnectionState('connected')
        reconnectAttempts.current = 0
        onConnect?.()
      })

      pusherClient.connection.bind('disconnected', () => {
        setIsConnected(false)
        setConnectionState('disconnected')
        onDisconnect?.()
      })

      pusherClient.connection.bind('error', (error: any) => {
        setConnectionState('error')
        onError?.(error)
      })

      pusherClient.connection.bind('state_change', (states: any) => {
        setConnectionState(states.current)
      })

    } catch (error) {
      console.error('Pusher connection error:', error)
      onError?.(error)
    }

    return () => {
      if (channelRef.current) {
        pusherClient.unsubscribe(channel)
        channelRef.current = null
      }
    }
  }, [channel, events.join(',')])

  const sendMessage = (event: string, data: any) => {
    if (channelRef.current && isConnected) {
      channelRef.current.trigger(`client-${event}`, data)
    }
  }

  return {
    isConnected,
    connectionState,
    sendMessage,
  }
}

// Specific hooks for different features
export const useChatWebSocket = (onMessage?: (event: string, data: any) => void) => {
  return usePusher({
    channel: CHANNELS.CHAT,
    events: [EVENTS.CHAT_MESSAGE, EVENTS.CHAT_PRESENCE],
    onMessage,
  })
}

export const useLiveFeedWebSocket = (onMessage?: (event: string, data: any) => void) => {
  return usePusher({
    channel: CHANNELS.LIVE_FEED,
    events: [EVENTS.LIVE_FEED_EVENT],
    onMessage,
  })
}

export const useGameSessionWebSocket = (onMessage?: (event: string, data: any) => void) => {
  return usePusher({
    channel: CHANNELS.GAME_SESSIONS,
    events: [EVENTS.GAME_SESSION],
    onMessage,
  })
}
