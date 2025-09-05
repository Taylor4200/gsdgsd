'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Gamepad2,
  Dice1,
  Zap,
  Trophy,
  Users,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'

interface MyBetsModalProps {
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
  provablyFair?: {
    serverSeed: string
    clientSeed: string
    nonce: number
  }
}

const MyBetsModal: React.FC<MyBetsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState<'my-bets' | 'all-bets' | 'high-rollers' | 'race-leaderboard'>('my-bets')
  const [ghostMode, setGhostMode] = useState(false)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'time' | 'amount' | 'payout'>('time')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data - in real app this would come from API
  const [bets, setBets] = useState<Bet[]>([
    {
      id: '1',
      game: 'Dice',
      gameType: 'dice',
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      betAmount: 0.50,
      multiplier: 2.00,
      payout: 1.00,
      won: true,
      gameId: 'dice_001',
      roundId: 'round_123',
      provablyFair: {
        serverSeed: 'abc123...',
        clientSeed: 'user_seed',
        nonce: 1
      }
    },
    {
      id: '2',
      game: 'Dice',
      gameType: 'dice',
      time: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      betAmount: 0.25,
      multiplier: 0.00,
      payout: 0.00,
      won: false,
      gameId: 'dice_002',
      roundId: 'round_124'
    },
    {
      id: '3',
      game: 'Crash',
      gameType: 'crash',
      time: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      betAmount: 1.00,
      multiplier: 1.85,
      payout: 1.85,
      won: true,
      gameId: 'crash_001',
      roundId: 'round_125'
    },
    {
      id: '4',
      game: 'Plinko',
      gameType: 'plinko',
      time: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      betAmount: 0.10,
      multiplier: 5.00,
      payout: 0.50,
      won: true,
      gameId: 'plinko_001',
      roundId: 'round_126'
    },
    {
      id: '5',
      game: 'Wheel',
      gameType: 'wheel',
      time: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      betAmount: 0.75,
      multiplier: 0.00,
      payout: 0.00,
      won: false,
      gameId: 'wheel_001',
      roundId: 'round_127'
    }
  ])

  const gameTypes = [
    { value: 'all', label: 'All Games', icon: Gamepad2 },
    { value: 'dice', label: 'Dice', icon: Dice1 },
    { value: 'crash', label: 'Crash', icon: TrendingUp },
    { value: 'plinko', label: 'Plinko', icon: Zap },
    { value: 'wheel', label: 'Wheel', icon: Trophy },
    { value: 'slots', label: 'Slots', icon: Gamepad2 }
  ]

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
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
    const matchesSearch = bet.game.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGame = gameFilter === 'all' || bet.gameType === gameFilter
    return matchesSearch && matchesGame
  })

  const sortedBets = [...filteredBets].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'time':
        comparison = a.time.getTime() - b.time.getTime()
        break
      case 'amount':
        comparison = a.betAmount - b.betAmount
        break
      case 'payout':
        comparison = a.payout - b.payout
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const totalPages = Math.ceil(sortedBets.length / entriesPerPage)
  const paginatedBets = sortedBets.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  const totalWagered = bets.reduce((sum, bet) => sum + bet.betAmount, 0)
  const totalPayout = bets.reduce((sum, bet) => sum + bet.payout, 0)
  const totalProfit = totalPayout - totalWagered
  const winRate = bets.length > 0 ? (bets.filter(bet => bet.won).length / bets.length) * 100 : 0

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
          className="bg-[#1a2c38] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#2d3748] p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-white">My Bets</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGhostMode(!ghostMode)}
                  className={`text-sm ${ghostMode ? 'bg-[#00d4ff] text-black' : 'text-gray-400'}`}
                >
                  {ghostMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  Ghost Mode {ghostMode ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="bg-[#1a2c38] border border-[#374151] text-white rounded px-3 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#2d3748] px-6 border-b border-[#374151]">
            <div className="flex space-x-8">
              {[
                { id: 'my-bets', label: 'My Bets', active: true },
                { id: 'all-bets', label: 'All Bets', active: false },
                { id: 'high-rollers', label: 'High Rollers', active: false },
                { id: 'race-leaderboard', label: 'Race Leaderboard', active: false, badge: true }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
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

          {/* Filters */}
          <div className="p-6 border-b border-[#374151]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search bets..."
                  className="pl-10 bg-[#2d3748] border-[#374151] text-white"
                />
              </div>

              {/* Game Filter */}
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="bg-[#2d3748] border border-[#374151] text-white rounded px-3 py-2"
              >
                {gameTypes.map((game) => (
                  <option key={game.value} value={game.value}>
                    {game.label}
                  </option>
                ))}
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#2d3748] border border-[#374151] text-white rounded px-3 py-2"
              >
                {dateFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-')
                  setSortBy(newSortBy as any)
                  setSortOrder(newSortOrder as any)
                }}
                className="bg-[#2d3748] border border-[#374151] text-white rounded px-3 py-2"
              >
                <option value="time-desc">Time (Newest)</option>
                <option value="time-asc">Time (Oldest)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="payout-desc">Payout (High to Low)</option>
                <option value="payout-asc">Payout (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="p-6 border-b border-[#374151]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Total Wagered</div>
                <div className="text-lg font-bold text-white">{formatCurrency(totalWagered)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Total Payout</div>
                <div className="text-lg font-bold text-white">{formatCurrency(totalPayout)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Profit/Loss</div>
                <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Win Rate</div>
                <div className="text-lg font-bold text-green-400">{winRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Bets Table */}
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full">
              <thead className="bg-[#2d3748] sticky top-0">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Game</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Time</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Bet Amount</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Multiplier</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Payout</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBets.map((bet) => {
                  const GameIcon = getGameIcon(bet.gameType)
                  return (
                    <tr key={bet.id} className="border-b border-[#374151] hover:bg-[#2d3748]/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <GameIcon className="h-5 w-5 text-[#00d4ff]" />
                          <div>
                            <div className="text-white font-medium">{bet.game}</div>
                            {bet.gameId && (
                              <div className="text-xs text-gray-400">#{bet.gameId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm">{formatTime(bet.time)}</div>
                        <div className="text-xs text-gray-400">
                          {bet.time.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-white font-medium">{formatCurrency(bet.betAmount)}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`font-medium ${bet.won ? 'text-green-400' : 'text-red-400'}`}>
                          {bet.multiplier.toFixed(2)}x
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`font-medium ${bet.won ? 'text-green-400' : 'text-red-400'}`}>
                          {bet.won ? '+' : ''}{formatCurrency(bet.payout)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-[#374151]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, sortedBets.length)} of {sortedBets.length} bets
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Previous
                </Button>
                <span className="text-white text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MyBetsModal
