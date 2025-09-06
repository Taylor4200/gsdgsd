'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, TrendingUp, X } from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'

interface LiveEvent {
  id: string
  event_type: 'win' | 'big_win' | 'jackpot' | 'achievement'
  username: string
  game_name: string
  bet_amount: number
  win_amount: number
  multiplier: number
  is_featured: boolean
  created_at: string
}

const BottomLiveFeed: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Fetch live feed events
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/live-feed?limit=5&featured=true')
      const data = await response.json()
      if (data.events) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error fetching live feed events:', error)
    }
  }

  useEffect(() => {
    fetchEvents()
    
    // Poll for new events every 3 seconds
    const interval = setInterval(fetchEvents, 3000)
    return () => clearInterval(interval)
  }, [])

  const getEventIcon = (type: LiveEvent['event_type']) => {
    switch (type) {
      case 'win':
        return <Trophy className="h-3 w-3 text-neon-yellow" />
      case 'big_win':
        return <Trophy className="h-3 w-3 text-neon-yellow" />
      case 'jackpot':
        return <Zap className="h-3 w-3 text-neon-blue" />
      case 'achievement':
        return <TrendingUp className="h-3 w-3 text-neon-green" />
      default:
        return <Trophy className="h-3 w-3 text-white" />
    }
  }

  const getEventText = (event: LiveEvent) => {
    switch (event.event_type) {
      case 'win':
        return (
          <span className="text-xs">
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' won '}
            <span className="font-bold text-neon-yellow">{formatCurrency(event.win_amount)}</span>
            {' on '}
            <span className="text-neon-purple">{event.game_name}</span>
            {event.multiplier > 1 && (
              <span className="text-neon-green ml-1">({event.multiplier}x)</span>
            )}
          </span>
        )
      case 'big_win':
        return (
          <span className="text-xs">
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' BIG WIN! '}
            <span className="font-bold text-neon-yellow">{formatCurrency(event.win_amount)}</span>
            {' on '}
            <span className="text-neon-purple">{event.game_name}</span>
          </span>
        )
      case 'jackpot':
        return (
          <span className="text-xs">
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' JACKPOT! '}
            <span className="font-bold text-neon-yellow">{formatCurrency(event.win_amount)}</span>
            {' on '}
            <span className="text-neon-purple">{event.game_name}</span>
          </span>
        )
      case 'achievement':
        return (
          <span className="text-xs">
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' achievement on '}
            <span className="text-neon-purple">{event.game_name}</span>
          </span>
        )
      default:
        return null
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto"
    >
      <div className="bg-black/90 backdrop-blur-sm border border-neon-blue/30 rounded-lg p-3 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-xs font-bold text-neon-green">LIVE WINS</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-400 hover:text-white transition-colors text-xs"
            >
              {isCollapsed ? '▼' : '▲'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {getEventText(event)}
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {formatTime(new Date(event.created_at))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {events.length === 0 && (
              <div className="text-center py-2 text-gray-400 text-xs">
                No recent wins
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default BottomLiveFeed
