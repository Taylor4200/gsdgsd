'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dice1, 
  Bomb, 
  Zap, 
  Target, 
  Circle, 
  Square, 
  Triangle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { useLiveFeedWebSocket } from '@/hooks/usePusher'

interface LiveBet {
  id: string
  user_id: string
  username: string
  game_id: string
  game_name: string
  bet_amount: number
  win_amount: number
  multiplier: number
  result: 'win' | 'loss'
  currency: 'SC' | 'GC'
  created_at: string
  is_featured: boolean
}

interface LiveFeedProps {
  className?: string
}

const LiveFeed: React.FC<LiveFeedProps> = ({ className = '' }) => {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState<'my_bets' | 'all_bets' | 'high_rollers'>('all_bets')
  const [bets, setBets] = useState<LiveBet[]>([])
  const [loading, setLoading] = useState(true)

  // Pusher connection for live feed
  const { isConnected, connectionState, sendMessage } = useLiveFeedWebSocket((event, data) => {
    if (event === 'live-feed-event' && data) {
      // Add new event to the top of the list
      const newBet: LiveBet = {
        id: data.id || Date.now().toString(),
        user_id: data.user_id,
        username: data.username,
        game_id: data.game_id,
        game_name: data.game_name,
        bet_amount: data.bet_amount,
        win_amount: data.win_amount,
        multiplier: data.multiplier,
        result: data.win_amount > 0 ? 'win' : 'loss',
        currency: 'SC' as const,
        created_at: data.created_at || new Date().toISOString(),
        is_featured: data.is_featured
      }
      
      setBets(prev => [newBet, ...prev.slice(0, 9)]) // Keep last 10 bets
    }
  })

  // Fetch initial data and setup polling as fallback
  const fetchBets = async () => {
    try {
      let url = '/api/live-feed?limit=50'

      if (activeTab === 'my_bets' && user?.id) {
        url += `&user_id=${user.id}`
      } else if (activeTab === 'high_rollers') {
        url += '&featured=true'
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.events) {
        // Transform events to bets format
        const transformedBets = data.events.map((event: any) => ({
          id: event.id,
          user_id: event.user_id,
          username: event.username,
          game_id: event.game_id,
          game_name: event.game_name,
          bet_amount: event.bet_amount,
          win_amount: event.win_amount,
          multiplier: event.multiplier,
          result: event.win_amount > 0 ? 'win' : 'loss',
          currency: 'SC' as const,
          created_at: event.created_at,
          is_featured: event.is_featured
        }))

        setBets(transformedBets)
      }
    } catch (error) {
      console.error('Error fetching live bets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBets()

    // Fallback polling every 30 seconds if WebSocket is not connected
    const interval = setInterval(() => {
      if (!isConnected) {
        fetchBets()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [activeTab, isConnected])

  // Get game icon
  const getGameIcon = (gameId: string) => {
    switch (gameId) {
      case 'dice':
        return <Dice1 className="h-3 w-3" />
      case 'minesweeper':
        return <Bomb className="h-3 w-3" />
      case 'limbo':
        return <Zap className="h-3 w-3" />
      case 'plinko':
        return <Target className="h-3 w-3" />
      case 'blackjack':
        return <Circle className="h-3 w-3" />
      case 'baccarat':
        return <Square className="h-3 w-3" />
      case 'roulette':
        return <Triangle className="h-3 w-3" />
      default:
        return <Dice1 className="h-3 w-3" />
    }
  }

  // Get currency icon
  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'SC':
        return 'S'
      case 'GC':
        return 'G'
      case 'BTC':
        return 'B'
      case 'ETH':
        return 'E'
      default:
        return 'S'
    }
  }

  // Format username - data already processed for ghost mode
  const formatUsername = (username: string) => {
    return username // Username is already "Hidden" if user has ghost mode enabled
  }

  const tabs = [
    { id: 'my_bets', label: 'My Bets' },
    { id: 'all_bets', label: 'All Bets' },
    { id: 'high_rollers', label: 'High Rollers' }
  ]

  return (
    <div className={`bg-[#0f1419] border-t border-[#1a2c38] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a2c38]">
        <div className="flex items-center space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#00d4ff] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a2c38]'
              }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-1 text-green-400">
              <Wifi className="h-3 w-3" />
              <span className="text-xs">Live</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-400">
              <WifiOff className="h-3 w-3" />
              <span className="text-xs">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Feed Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a2c38]/30">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Game
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Bet Amount
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Multiplier
                </th>
                <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Payout
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2c38]">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00d4ff]"></div>
                        <span className="text-gray-400 text-sm">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : bets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400 text-sm">
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  bets
                    .filter(bet => {
                      if (activeTab === 'my_bets') {
                        return bet.user_id === user?.id
                      } else if (activeTab === 'all_bets') {
                        return bet.user_id !== user?.id
                      } else if (activeTab === 'high_rollers') {
                        return bet.is_featured && bet.user_id !== user?.id
                      }
                      return true
                    })
                    .map((bet, index) => (
                    <motion.tr
                      key={bet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`hover:bg-[#1a2c38]/20 transition-colors ${
                        bet.is_featured ? 'bg-[#00d4ff]/5' : ''
                      }`}
                    >
                      {/* Game */}
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="text-[#00d4ff]">
                            {getGameIcon(bet.game_id)}
                          </div>
                          <span className="text-white text-sm">
                            {bet.game_name}
                          </span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="p-3">
                        <span className="text-gray-300 text-sm">
                          {formatUsername(bet.username)}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="p-3">
                        <span className="text-gray-400 text-sm">
                          {formatTime(new Date(bet.created_at))}
                        </span>
                      </td>

                      {/* Bet Amount */}
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-white text-sm">
                            {formatCurrency(bet.bet_amount)}
                          </span>
                          <span className="text-xs bg-[#1a2c38] px-1.5 py-0.5 rounded text-gray-300">
                            {getCurrencyIcon(bet.currency)}
                          </span>
                        </div>
                      </td>

                      {/* Multiplier */}
                      <td className="p-3">
                        <span className={`text-sm ${
                          bet.multiplier > 1 ? 'text-[#00d4ff]' : 'text-red-400'
                        }`}>
                          {bet.multiplier.toFixed(2)}x
                        </span>
                      </td>

                      {/* Payout */}
                      <td className="p-3">
                        <span className={`text-sm ${
                          bet.result === 'win' ? 'text-[#00d4ff]' : 'text-red-400'
                        }`}>
                          {bet.result === 'win' ? '+' : '-'}
                          {formatCurrency(Math.abs(bet.win_amount - bet.bet_amount))}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LiveFeed
