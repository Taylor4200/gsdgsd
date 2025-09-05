'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Zap,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trophy,
  Users,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { useGameStatsStore, GameStats } from '@/store/gameStatsStore'
import { formatCurrency } from '@/lib/utils'

interface LiveStatsModalProps {
  isOpen: boolean
  onClose: () => void
  gameType?: string
}

const LiveStatsModal: React.FC<LiveStatsModalProps> = ({ 
  isOpen, 
  onClose, 
  gameType = 'All' 
}) => {
  const { user } = useUserStore()
  const { globalStats, getStatsForGame, getSessionTime, resetStats } = useGameStatsStore()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedGame, setSelectedGame] = useState(gameType)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [isClient, setIsClient] = useState(false)
  
  const modalRef = useRef<HTMLDivElement>(null)

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get real stats based on selected game
  const stats: GameStats = selectedGame === 'All' ? globalStats : getStatsForGame(selectedGame)
  const sessionTime = getSessionTime()

  const gameOptions = ['All', 'Dice', 'Slots', 'Blackjack', 'Roulette', 'Crash', 'Plinko']

  const handleDrag = (event: any, info: PanInfo) => {
    setPosition({
      x: position.x + info.delta.x,
      y: position.y + info.delta.y
    })
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const refreshStats = () => {
    setLastRefresh(new Date())
    resetStats() // Actually reset the stats when refresh is clicked
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatLastRefresh = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  if (!isOpen || !isClient) return null

  return (
         <motion.div
       ref={modalRef}
       initial={{ opacity: 0, scale: 0.8 }}
       animate={{ opacity: 1, scale: 1 }}
       exit={{ opacity: 0, scale: 0.8 }}
       style={{
         position: 'fixed',
         top: '50%',
         left: '50%',
         transform: `translate(${position.x}px, ${position.y}px)`,
         zIndex: 1000,
         cursor: isDragging ? 'grabbing' : 'default'
       }}
       drag={!isMinimized}
       dragMomentum={false}
       dragElastic={0}
       onDrag={handleDrag}
       onDragStart={handleDragStart}
       onDragEnd={handleDragEnd}
       dragConstraints={false}
     >
      <Card className="w-80 bg-[#1a2c38] border-[#2d3748] shadow-2xl">
                 {/* Header - Draggable */}
         <div 
           className="bg-[#2d3748] p-3 rounded-t-lg cursor-grab active:cursor-grabbing"
         >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-[#00d4ff]" />
              <h3 className="text-white font-semibold">Live Stats</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshStats}
                className="text-gray-400 hover:text-[#00d4ff] p-1"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-[#00d4ff] p-1"
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-red-400 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <CardContent className="p-4 space-y-4">
            {/* Game Filter */}
            <div className="flex items-center justify-between">
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-[#2d3748] text-white text-sm rounded px-2 py-1 border border-[#374151] focus:border-[#00d4ff] outline-none"
              >
                {gameOptions.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
                             <span className="text-xs text-gray-400">
                 Last: {formatLastRefresh(lastRefresh)}
               </span>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#2d3748] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Profit</span>
                  <DollarSign className="h-3 w-3 text-green-400" />
                </div>
                <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
                </div>
              </div>
              
              <div className="bg-[#2d3748] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Wagered</span>
                  <Target className="h-3 w-3 text-blue-400" />
                </div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(stats.totalWagered)}
                </div>
              </div>
            </div>

            {/* Win/Loss Stats */}
            <div className="bg-[#2d3748] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Win Rate</span>
                <span className="text-sm font-semibold text-green-400">{stats.winRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">Wins: {stats.wins}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400">Losses: {stats.losses}</span>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Biggest Win:</span>
                <span className="text-green-400 font-semibold">{formatCurrency(stats.biggestWin)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Biggest Loss:</span>
                <span className="text-red-400 font-semibold">{formatCurrency(stats.biggestLoss)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Average Bet:</span>
                <span className="text-white font-semibold">{formatCurrency(stats.averageBet)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Bets:</span>
                <span className="text-white font-semibold">{stats.totalBets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Session Time:</span>
                <span className="text-white font-semibold">{formatTime(sessionTime)}</span>
              </div>
            </div>

            {/* $100k Race Section */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">$100k Race</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-300">
                Wager to enter the race!
              </div>
            </div>

                         {/* Quick Actions */}
             <div className="flex space-x-2">
               <Button
                 variant="outline"
                 size="sm"
                 className="flex-1 text-[#00d4ff] border-[#00d4ff] hover:bg-[#00d4ff] hover:text-black"
               >
                 <TrendingUp className="h-3 w-3 mr-1" />
                 Export
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 className="flex-1 text-[#00d4ff] border-[#00d4ff] hover:bg-[#00d4ff] hover:text-black"
               >
                 <Users className="h-3 w-3 mr-1" />
                 Share
               </Button>
             </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}

export default LiveStatsModal
