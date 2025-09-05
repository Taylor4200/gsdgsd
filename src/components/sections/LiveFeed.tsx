'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Gift, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatTime } from '@/lib/utils'

interface LiveEvent {
  id: string
  type: 'win' | 'jackpot' | 'pack_open' | 'achievement'
  username: string
  avatar?: string
  amount?: number
  game?: string
  item?: string
  timestamp: Date
}

const LiveFeed: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([
    {
      id: '1',
      type: 'win',
      username: 'CryptoKing92',
      amount: 15670,
      game: 'Neon Crash',
      timestamp: new Date(Date.now() - 30000)
    },
    {
      id: '2',
      type: 'pack_open',
      username: 'NeonHunter',
      item: 'Legendary Avatar',
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: '3',
      type: 'jackpot',
      username: 'QuantumPlayer',
      amount: 45890,
      game: 'Cyber Slots',
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: '4',
      type: 'achievement',
      username: 'StarGazer',
      item: 'High Roller Badge',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '5',
      type: 'win',
      username: 'DiamondHands',
      amount: 8920,
      game: 'Quantum Dice',
      timestamp: new Date(Date.now() - 300000)
    }
  ])

  // Simulate real-time events
  useEffect(() => {
    const interval = setInterval(() => {
      const eventTypes: LiveEvent['type'][] = ['win', 'pack_open', 'jackpot', 'achievement']
      const usernames = ['CryptoMaster', 'NeonWarrior', 'QuantumLord', 'StarCrusher', 'DiamondAce', 'CosmicGamer']
      const games = ['Neon Crash', 'Cyber Slots', 'Quantum Dice', 'Holographic Roulette']
      const items = ['Rare Avatar', 'Epic Badge', 'Legendary Title', 'Mythic Frame']

      const newEvent: LiveEvent = {
        id: Date.now().toString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        username: usernames[Math.floor(Math.random() * usernames.length)],
        timestamp: new Date()
      }

      if (newEvent.type === 'win' || newEvent.type === 'jackpot') {
        newEvent.amount = Math.floor(Math.random() * 50000) + 1000
        newEvent.game = games[Math.floor(Math.random() * games.length)]
      } else if (newEvent.type === 'pack_open' || newEvent.type === 'achievement') {
        newEvent.item = items[Math.floor(Math.random() * items.length)]
      }

      setEvents(prev => [newEvent, ...prev].slice(0, 10))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getEventIcon = (type: LiveEvent['type']) => {
    switch (type) {
      case 'win':
        return <Trophy className="h-4 w-4 text-neon-yellow" />
      case 'jackpot':
        return <Zap className="h-4 w-4 text-neon-blue" />
      case 'pack_open':
        return <Gift className="h-4 w-4 text-neon-purple" />
      case 'achievement':
        return <TrendingUp className="h-4 w-4 text-neon-green" />
      default:
        return <Trophy className="h-4 w-4 text-white" />
    }
  }

  const getEventText = (event: LiveEvent) => {
    switch (event.type) {
      case 'win':
        return (
          <span>
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' won '}
            <span className="font-bold text-neon-yellow">{formatCurrency(event.amount!)}</span>
            {' on '}
            <span className="text-neon-purple">{event.game}</span>
          </span>
        )
      case 'jackpot':
        return (
          <span>
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' hit the jackpot! '}
            <span className="font-bold text-neon-yellow">{formatCurrency(event.amount!)}</span>
            {' on '}
            <span className="text-neon-purple">{event.game}</span>
          </span>
        )
      case 'pack_open':
        return (
          <span>
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' found '}
            <span className="font-bold text-neon-purple">{event.item}</span>
            {' in a pack draw'}
          </span>
        )
      case 'achievement':
        return (
          <span>
            <span className="font-semibold text-neon-blue">{event.username}</span>
            {' earned '}
            <span className="font-bold text-neon-green">{event.item}</span>
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
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {getEventText(event)}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 ml-4 flex-shrink-0">
                      {formatTime(event.timestamp)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default LiveFeed
