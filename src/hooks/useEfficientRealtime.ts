'use client'

import { useEffect, useRef, useState } from 'react'

// Production-ready polling with smart optimization
export const useEfficientRealtime = (
  endpoint: string,
  interval: number = 5000, // 5 seconds
  enabled: boolean = true
) => {
  const [data, setData] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCount = useRef(0)
  const maxRetries = 3

  const fetchData = async () => {
    if (!enabled) return

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      
      const response = await fetch(endpoint, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'Nexus-Casino-Client'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const newData = await response.json()
      setData(newData)
      setIsConnected(true)
      setError(null)
      retryCount.current = 0 // Reset retry count on success
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        retryCount.current++
        if (retryCount.current >= maxRetries) {
          setError(`Connection failed after ${maxRetries} retries`)
          setIsConnected(false)
        } else {
          // Exponential backoff for retries
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount.current), 10000)
          setTimeout(() => {
            if (enabled) fetchData()
          }, backoffDelay)
        }
      }
    }
  }

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    fetchData()

    // Set up polling with adaptive interval
    const adaptiveInterval = Math.max(interval, 1000) // Minimum 1 second
    intervalRef.current = setInterval(fetchData, adaptiveInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [endpoint, interval, enabled])

  return {
    data,
    isConnected,
    error,
    refetch: fetchData
  }
}

// Specific hooks for different features
export const useEfficientChat = (enabled: boolean = true) => {
  return useEfficientRealtime('/api/chat/latest', 3000, enabled) // 3s for chat
}

export const useEfficientLiveFeed = (enabled: boolean = true) => {
  return useEfficientRealtime('/api/live-feed/latest', 2000, enabled) // 2s for live feed
}

export const useEfficientGameUpdates = (gameId: string, enabled: boolean = true) => {
  return useEfficientRealtime(`/api/games/${gameId}/updates`, 1000, enabled) // 1s for active games
}
