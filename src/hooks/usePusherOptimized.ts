'use client'

import { useEffect, useRef, useState } from 'react'
import { pusherClient, CHANNELS, EVENTS } from '@/lib/pusher'

// Global connection manager to prevent multiple connections
class PusherConnectionManager {
  private static instance: PusherConnectionManager
  private connections: Map<string, any> = new Map()
  private subscribers: Map<string, Set<(event: string, data: any) => void>> = new Map()
  private isConnected = false

  static getInstance(): PusherConnectionManager {
    if (!PusherConnectionManager.instance) {
      PusherConnectionManager.instance = new PusherConnectionManager()
    }
    return PusherConnectionManager.instance
  }

  subscribe(channel: string, callback: (event: string, data: any) => void) {
    // Add callback to subscribers
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
    }
    this.subscribers.get(channel)!.add(callback)

    // Subscribe to channel if not already subscribed
    if (!this.connections.has(channel)) {
      const channelRef = pusherClient.subscribe(channel)
      this.connections.set(channel, channelRef)
      
      // Bind to events
      Object.values(EVENTS).forEach(event => {
        channelRef.bind(event, (data: any) => {
          // Notify all subscribers
          this.subscribers.get(channel)?.forEach(cb => cb(event, data))
        })
      })
    }

    return () => this.unsubscribe(channel, callback)
  }

  unsubscribe(channel: string, callback: (event: string, data: any) => void) {
    const subscribers = this.subscribers.get(channel)
    if (subscribers) {
      subscribers.delete(callback)
      
      // If no more subscribers, unsubscribe from channel
      if (subscribers.size === 0) {
        pusherClient.unsubscribe(channel)
        this.connections.delete(channel)
        this.subscribers.delete(channel)
      }
    }
  }

  getConnectionState() {
    return pusherClient.connection.state
  }

  isConnectedToPusher() {
    return pusherClient.connection.state === 'connected'
  }
}

// Hook to use the connection manager
export const usePusherConnection = (channel: string, events: string[], onMessage?: (event: string, data: any) => void) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  const manager = PusherConnectionManager.getInstance()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn('Pusher key not found, WebSocket functionality disabled')
      return
    }

    // Subscribe to channel
    unsubscribeRef.current = manager.subscribe(channel, (event, data) => {
      if (events.includes(event)) {
        onMessage?.(event, data)
      }
    })

    // Connection state handlers
    pusherClient.connection.bind('connected', () => {
      setIsConnected(true)
      setConnectionState('connected')
    })

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false)
      setConnectionState('disconnected')
    })

    pusherClient.connection.bind('error', (error: any) => {
      setConnectionState('error')
      console.error('Pusher connection error:', error)
    })

    pusherClient.connection.bind('state_change', (states: any) => {
      setConnectionState(states.current)
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [channel, events.join(',')])

  const sendMessage = (event: string, data: any) => {
    if (manager.isConnectedToPusher()) {
      const channelRef = manager.connections.get(channel)
      if (channelRef) {
        channelRef.trigger(`client-${event}`, data)
      }
    }
  }

  return {
    isConnected,
    connectionState,
    sendMessage,
  }
}

// Specific hooks for different features - now using single connection manager
export const useChatWebSocket = (onMessage?: (event: string, data: any) => void) => {
  return usePusherConnection(
    CHANNELS.CHAT,
    [EVENTS.CHAT_MESSAGE, EVENTS.CHAT_PRESENCE],
    onMessage,
  )
}

export const useLiveFeedWebSocket = (onMessage?: (event: string, data: any) => void) => {
  return usePusherConnection(
    CHANNELS.LIVE_FEED,
    [EVENTS.LIVE_FEED_EVENT],
    onMessage,
  )
}

export const useGameSessionWebSocket = (onMessage?: (event: string, data: any) => void) => {
  return usePusherConnection(
    CHANNELS.GAME_SESSIONS,
    [EVENTS.GAME_SESSION],
    onMessage,
  )
}
