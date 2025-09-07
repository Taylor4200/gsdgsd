'use client'

import { useEffect, useRef, useState } from 'react'

// Ultra-efficient polling for Vercel (no WebSocket needed!)
export const useVercelChat = (userId?: string, username?: string) => {
  const [messages, setMessages] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageId = useRef<string | null>(null)

  const fetchMessages = async () => {
    try {
      const url = lastMessageId.current 
        ? `/api/chat/latest?since=${lastMessageId.current}`
        : '/api/chat/latest'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success && data.messages) {
        if (data.messages.length > 0) {
          setMessages(prev => {
            const newMessages = data.messages.filter((msg: any) => 
              !prev.find(existing => existing.id === msg.id)
            )
            return [...newMessages, ...prev].slice(0, 50) // Keep last 50
          })
          lastMessageId.current = data.messages[0].id
        }
        setIsConnected(true)
        setError(null)
      }
    } catch (err) {
      setError('Connection error')
      setIsConnected(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (!userId || !username) return false

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          content,
          messageType: 'message'
        })
      })

      const result = await response.json()
      return result.success
    } catch (err) {
      console.error('Error sending message:', err)
      return false
    }
  }

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    fetchMessages()

    // Poll every 2 seconds for responsive feel
    intervalRef.current = setInterval(fetchMessages, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userId])

  return {
    messages,
    onlineUsers,
    isConnected,
    error,
    sendMessage
  }
}
