'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Gift, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
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

const LiveFeed: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch live feed events
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/live-feed?limit=20')
      const data = await response.json()
      if (data.events) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error fetching live feed events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    
    // Poll for new events every 5 seconds
    const interval = setInterval(fetchEvents, 5000)
    return () => clearInterval(interval)
  }, [])


  const getEventIcon = (type: LiveEvent['event_type']) => {
    switch (type) {
      case 'win':
        return <Trophy className="h-4 w-4 text-neon-yellow" />
      case 'big_win':
        return <Trophy className="h-4 w-4 text-neon-yellow" />
      case 'jackpot':
        return <Zap className="h-4 w-4 text-neon-blue" />
      case 'achievement':
        return <TrendingUp className="h-4 w-4 text-neon-green" />
      default:
        return <Trophy className="h-4 w-4 text-white" />
    }
  }

  const getEventText = (event: LiveEvent) => {
    switch (event.event_type) {
      case 'win':
        return (
          <span>
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
          <span>
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' hit a BIG WIN! '}
            <span className="font-bold text-neon-yellow">{formatCurrency(event.win_amount)}</span>
            {' on '}
            <span className="text-neon-purple">{event.game_name}</span>
            <span className="text-neon-green ml-1">({event.multiplier}x)</span>
          </span>
        )
      case 'jackpot':
        return (
          <span>
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' hit the JACKPOT! '}
            <span className="font-bold text-neon-yellow">{formatCurrency(event.win_amount)}</span>
            {' on '}
            <span className="text-neon-purple">{event.game_name}</span>
          </span>
        )
      case 'achievement':
        return (
          <span>
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' earned an achievement on '}
            <span className="text-neon-purple">{event.game_name}</span>
          </span>
        )
      default:
        return null
    }
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-futuristic mb-4">
            <span className="neon-text-green">LIVE</span>{' '}
            <span className="text-white">FEED</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Watch real-time wins, pack openings, and achievements from players around the world
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <div className="flex items-center text-sm text-neon-green">
                <div className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
                LIVE
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
                  <span className="ml-3 text-gray-400">Loading live events...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No recent activity</p>
                  <p className="text-sm">Play games to see live events here!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getEventIcon(event.event_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {getEventText(event)}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 ml-4 flex-shrink-0">
                      {formatTime(new Date(event.created_at))}
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default LiveFeed
