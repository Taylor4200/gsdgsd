'use client'

import { useEffect, useRef, useState } from 'react'

// Efficient WebSocket client that connects to shared server
export const useEfficientWebSocket = (url: string, enabled: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map())

  const connect = () => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      wsRef.current = new WebSocket(url)
      
      wsRef.current.onopen = () => {
        setIsConnected(true)
        setConnectionState('connected')
        console.log('🔗 Connected to shared WebSocket')
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000) // 30 seconds
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'pong') {
            return // Heartbeat response
          }

          // Call registered handlers
          messageHandlers.current.forEach((handler, eventType) => {
            if (eventType === message.type || eventType === 'all') {
              handler(message)
            }
          })
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        setConnectionState('disconnected')
        console.log('🔌 Disconnected from WebSocket')
        
        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }

        // Reconnect after 3 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...')
            connect()
          }, 3000)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionState('error')
      }

    } catch (error) {
      console.error('Error creating WebSocket:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  const onMessage = (eventType: string, handler: (data: any) => void) => {
    messageHandlers.current.set(eventType, handler)
    
    return () => {
      messageHandlers.current.delete(eventType)
    }
  }

  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled])

  return {
    isConnected,
    connectionState,
    sendMessage,
    onMessage,
    connect,
    disconnect
  }
}

// Specific hook for instant chat
export const useInstantChat = (userId?: string, username?: string) => {
  const ws = useEfficientWebSocket('ws://localhost:3001', !!userId)
  const [messages, setMessages] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])

  // Authenticate when connected
  useEffect(() => {
    if (ws.isConnected && userId && username) {
      ws.sendMessage({
        type: 'auth',
        userId,
        username
      })
    }
  }, [ws.isConnected, userId, username])

  // Handle incoming messages
  useEffect(() => {
    const unsubscribe = ws.onMessage('chat_message', (data) => {
      setMessages(prev => [data.data, ...prev.slice(0, 49)]) // Keep last 50 messages
    })

    return unsubscribe
  }, [ws])

  // Handle user join/leave events
  useEffect(() => {
    const unsubscribe = ws.onMessage('user_joined', (data) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.userId === data.userId)
        if (!exists) {
          return [...prev, { userId: data.userId, username: data.username }]
        }
        return prev
      })
    })

    const unsubscribe2 = ws.onMessage('user_left', (data) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId))
    })

    return () => {
      unsubscribe()
      unsubscribe2()
    }
  }, [ws])

  const sendChatMessage = (content: string, messageType: string = 'message') => {
    ws.sendMessage({
      type: 'chat_message',
      content,
      messageType
    })
  }

  return {
    ...ws,
    messages,
    onlineUsers,
    sendChatMessage
  }
}
