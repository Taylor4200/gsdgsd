'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gamepad2,
  Dice1,
  Zap,
  Trophy,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'

interface BetHistoryScrollProps {
  isOpen: boolean
  onClose: () => void
}

interface Bet {
  id: string
  game: string
  gameType: 'slot' | 'dice' | 'crash' | 'plinko' | 'wheel' | 'limbo' | 'blackjack' | 'roulette'
  time: Date
  betAmount: number
  multiplier: number
  payout: number
  won: boolean
  gameId?: string
  roundId?: string
  username?: string
  isHidden?: boolean
}

const BetHistoryScroll: React.FC<BetHistoryScrollProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState<'my-bets' | 'all-bets' | 'high-rollers' | 'race-leaderboard'>('my-bets')
  const [ghostMode, setGhostMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Mock data - in real app this would come from API with pagination
  const [bets, setBets] = useState<Bet[]>([
    {
      id: '1',
      game: 'Dice',
      gameType: 'dice',
      time: new Date(Date.now() - 1000 * 60 * 5),
      betAmount: 0.50,
      multiplier: 2.00,
      payout: 1.00,
      won: true,
      gameId: 'dice_001',
      roundId: 'round_123',
      username: 'Player1'
    },
    {
      id: '2',
      game: 'Dice',
      gameType: 'dice',
      time: new Date(Date.now() - 1000 * 60 * 10),
      betAmount: 0.25,
      multiplier: 0.00,
      payout: 0.00,
      won: false,
      gameId: 'dice_002',
      roundId: 'round_124',
      username: 'Player2'
    },
    {
      id: '3',
      game: 'Crash',
      gameType: 'crash',
      time: new Date(Date.now() - 1000 * 60 * 15),
      betAmount: 1.00,
      multiplier: 1.85,
      payout: 1.85,
      won: true,
      gameId: 'crash_001',
      roundId: 'round_125',
      username: 'Player3'
    },
    {
      id: '4',
      game: 'Plinko',
      gameType: 'plinko',
      time: new Date(Date.now() - 1000 * 60 * 20),
      betAmount: 0.10,
      multiplier: 5.00,
      payout: 0.50,
      won: true,
      gameId: 'plinko_001',
      roundId: 'round_126',
      username: 'Player4'
    },
    {
      id: '5',
      game: 'Wheel',
      gameType: 'wheel',
      time: new Date(Date.now() - 1000 * 60 * 25),
      betAmount: 0.75,
      multiplier: 0.00,
      payout: 0.00,
      won: false,
      gameId: 'wheel_001',
      roundId: 'round_127',
      username: 'Player5'
    },
    // Add more mock data for scrolling
    ...Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 6}`,
      game: ['Dice', 'Crash', 'Plinko', 'Wheel', 'Slots'][i % 5],
      gameType: ['dice', 'crash', 'plinko', 'wheel', 'slots'][i % 5] as any,
      time: new Date(Date.now() - 1000 * 60 * (i + 30)),
      betAmount: Math.random() * 10 + 0.01,
      multiplier: Math.random() * 10,
      payout: Math.random() * 20,
      won: Math.random() > 0.5,
      gameId: `game_${i + 6}`,
      roundId: `round_${i + 128}`,
      username: `Player${i + 6}`
    }))
  ])

  const gameTypes = [
    { value: 'all', label: 'All Games', icon: Gamepad2 },
    { value: 'dice', label: 'Dice', icon: Dice1 },
    { value: 'crash', label: 'Crash', icon: TrendingUp },
    { value: 'plinko', label: 'Plinko', icon: Zap },
    { value: 'wheel', label: 'Wheel', icon: Trophy },
    { value: 'slots', label: 'Slots', icon: Gamepad2 }
  ]

  const getGameIcon = (gameType: string) => {
    const game = gameTypes.find(g => g.value === gameType)
    return game ? game.icon : Gamepad2
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bet.username && bet.username.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesGame = gameFilter === 'all' || bet.gameType === gameFilter
    const matchesTab = activeTab === 'my-bets' ? bet.username === user?.username : true
    return matchesSearch && matchesGame && matchesTab
  })

  const loadMoreBets = async () => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add more mock data
    const newBets = Array.from({ length: 20 }, (_, i) => ({
      id: `${bets.length + i + 1}`,
      game: ['Dice', 'Crash', 'Plinko', 'Wheel', 'Slots'][Math.floor(Math.random() * 5)],
      gameType: ['dice', 'crash', 'plinko', 'wheel', 'slots'][Math.floor(Math.random() * 5)] as any,
      time: new Date(Date.now() - 1000 * 60 * (bets.length + i + 100)),
      betAmount: Math.random() * 10 + 0.01,
      multiplier: Math.random() * 10,
      payout: Math.random() * 20,
      won: Math.random() > 0.5,
      gameId: `game_${bets.length + i + 1}`,
      roundId: `round_${bets.length + i + 200}`,
      username: `Player${bets.length + i + 1}`
    }))
    
    setBets(prev => [...prev, ...newBets])
    setIsLoading(false)
    
    // Stop loading more after 200 bets
    if (bets.length + newBets.length > 200) {
      setHasMore(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreBets()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="bg-[#1a2c38] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#2d3748] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-white">Dice Edge Originals</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">9,900.00x</span>
                <Trophy className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 border-gray-400 hover:bg-gray-400 hover:text-black"
              >
                {isExpanded ? 'Hidden' : 'Show'}
                {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                ×
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#2d3748] px-4 border-b border-[#374151]">
            <div className="flex space-x-6">
              {[
                { id: 'my-bets', label: 'My Bets', active: true },
                { id: 'all-bets', label: 'All Bets', active: false },
                { id: 'high-rollers', label: 'High Rollers', active: false },
                { id: 'race-leaderboard', label: 'Race Leaderboard', active: false, badge: true }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-[#00d4ff] text-[#00d4ff]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-[#374151]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGhostMode(!ghostMode)}
                  className={`text-sm ${ghostMode ? 'bg-[#00d4ff] text-black' : 'text-gray-400'}`}
                >
                  {ghostMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  Ghost Mode {ghostMode ? 'On' : 'Off'}
                </Button>
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="bg-[#2d3748] border border-[#374151] text-white rounded px-3 py-1 text-sm"
                >
                  {gameTypes.map((game) => (
                    <option key={game.value} value={game.value}>
                      {game.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 bg-[#2d3748] border-[#374151] text-white w-48"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Bet List */}
          <div 
            className="overflow-y-auto max-h-[60vh]"
            onScroll={handleScroll}
          >
            <div className="p-4">
              <div className="space-y-2">
                {filteredBets.map((bet) => {
                  const GameIcon = getGameIcon(bet.gameType)
                  return (
                    <motion.div
                      key={bet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-[#2d3748] rounded-lg hover:bg-[#374151] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <GameIcon className="h-5 w-5 text-[#00d4ff]" />
                        <div>
                          <div className="text-white font-medium">{bet.game}</div>
                          <div className="text-xs text-gray-400">
                            {ghostMode || bet.isHidden ? 'Hidden' : bet.username}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-white text-sm">{formatTime(bet.time)}</div>
                          <div className="text-xs text-gray-400">
                            {bet.time.toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">{formatCurrency(bet.betAmount)}</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-medium ${bet.won ? 'text-green-400' : 'text-red-400'}`}>
                            {bet.multiplier.toFixed(2)}x
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`font-medium ${bet.won ? 'text-green-400' : 'text-red-400'}`}>
                            {bet.won ? '+' : ''}{formatCurrency(bet.payout)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-6 w-6 text-[#00d4ff] animate-spin" />
                    <span className="ml-2 text-gray-400">Loading more bets...</span>
                  </div>
                )}
                
                {/* End of results */}
                {!hasMore && filteredBets.length > 0 && (
                  <div className="text-center py-4 text-gray-400">
                    No more bets to load
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BetHistoryScroll
