'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Calendar, DollarSign, TrendingUp, Lock, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { Game, games } from '@/lib/gameData'
import UserProfileModal from '@/components/chat/UserProfileModal'
import { useUserStore } from '@/store/userStore'

interface BigWin {
  id: string
  rank: number
  username: string
  date: string
  bet: number
  multiplier: number
  payout: number
  isHidden: boolean
}

interface GameInfoPanelProps {
  game: Game
}

const GameInfoPanel: React.FC<GameInfoPanelProps> = ({ game }) => {
  const [activeTab, setActiveTab] = useState<'bigWins' | 'luckyWins' | 'description'>('bigWins')
  const [bigWins, setBigWins] = useState<BigWin[]>([])
  const [luckyWins, setLuckyWins] = useState<BigWin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAllWins, setShowAllWins] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const { user } = useUserStore()

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockBigWins: BigWin[] = [
      {
        id: '1',
        rank: 1,
        username: 'vietnamdong',
        date: '2024-01-15',
        bet: 2108748.50,
        multiplier: 14.0,
        payout: 29611040.00,
        isHidden: false
      },
      {
        id: '2',
        rank: 2,
        username: 'vietnamdong',
        date: '2024-01-12',
        bet: 1245014.25,
        multiplier: 15.0,
        payout: 18640360.00,
        isHidden: false
      },
      {
        id: '3',
        rank: 3,
        username: 'vietnamdong',
        date: '2024-01-10',
        bet: 1383349.75,
        multiplier: 13.0,
        payout: 17826400.00,
        isHidden: false
      }
    ]

    const mockLuckyWins: BigWin[] = [
      {
        id: '1',
        rank: 1,
        username: 'vietnamdong',
        date: '2024-01-14',
        bet: 50.00,
        multiplier: 500.0,
        payout: 25000.00,
        isHidden: false
      },
      {
        id: '2',
        rank: 2,
        username: 'vietnamdong',
        date: '2024-01-13',
        bet: 25.00,
        multiplier: 1000.0,
        payout: 25000.00,
        isHidden: false
      },
      {
        id: '3',
        rank: 3,
        username: 'vietnamdong',
        date: '2024-01-11',
        bet: 100.00,
        multiplier: 250.0,
        payout: 25000.00,
        isHidden: false
      }
    ]

    setBigWins(mockBigWins)
    setLuckyWins(mockLuckyWins)
    setIsLoading(false)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-400" />
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />
      case 3:
        return <Trophy className="h-4 w-4 text-amber-600" />
      default:
        return <span className="text-gray-400 font-bold">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 border-yellow-500/40'
      case 2:
        return 'bg-gray-500/20 border-gray-500/40'
      case 3:
        return 'bg-amber-500/20 border-amber-500/40'
      default:
        return 'bg-gray-600/20 border-gray-600/40'
    }
  }

  const renderWinsTable = (wins: BigWin[]) => {
    const displayWins = showAllWins ? wins : wins.slice(0, 3)
    
    return (
      <div className="space-y-2">
        {displayWins.map((win) => (
          <motion.div
            key={win.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between p-3 rounded-lg border ${getRankColor(win.rank)} hover:bg-gray-800/30 transition-colors`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(win.rank)}`}>
                {getRankIcon(win.rank)}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setSelectedUser({
                      id: 'vietnamdong-id',
                      username: 'vietnamdong',
                      level: 1,
                      is_vip: false,
                      is_mod: false
                    })
                    setShowUserProfile(true)
                  }}
                  className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {win.username}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-gray-400">
                <Calendar className="h-3 w-3 inline mr-1" />
                {formatDate(win.date)}
              </div>
              <div className="text-gray-300">
                <DollarSign className="h-3 w-3 inline mr-1" />
                {formatCurrency(win.bet)}
              </div>
              <div className="text-green-400 font-semibold">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {win.multiplier}x
              </div>
              <div className="text-white font-bold">
                {formatCurrency(win.payout)}
              </div>
            </div>
          </motion.div>
        ))}
        
        {wins.length > 3 && (
          <button
            onClick={() => setShowAllWins(!showAllWins)}
            className="w-full py-2 text-gray-400 hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <span>{showAllWins ? 'Show Less' : `Show All ${wins.length} Wins`}</span>
            {showAllWins ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
    )
  }

  const renderDescription = () => (
    <div className="space-y-4">
      <div className="prose prose-invert max-w-none">
        <h3 className="text-lg font-semibold text-white mb-3">About {game.name}</h3>
        <p className="text-gray-300 leading-relaxed">
          Experience the thrill of {game.name} on Edge Casino, where cutting-edge gaming meets cryptocurrency innovation! 
          Enjoy our extensive library of {games.length}+ exciting games, including premium titles from{' '}
          <button 
            onClick={() => window.location.href = `/casino/provider/${game.provider.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            {game.provider}
          </button>
          {' '}like {game.name}. Play all kinds of {game.category} games with Bitcoin, Ethereum, and other cryptocurrencies, 
          or try {game.name} for free in Fun Mode with the largest online gambling community.
        </p>
        <p className="text-gray-300 leading-relaxed">
          With {game.rtp ? `${game.rtp}% RTP` : 'competitive RTP'}, {game.volatility ? `${game.volatility} volatility` : 'balanced gameplay'}, 
          and the potential for massive wins, {game.name} delivers an unforgettable gaming experience. 
          Join thousands of players and discover why Edge Casino is the fastest-growing crypto casino platform.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-green-400 font-bold text-lg">{game.rtp || '96.5'}%</div>
          <div className="text-gray-400 text-sm">RTP</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-yellow-400 font-bold text-lg">{game.volatility || 'Medium'}</div>
          <div className="text-gray-400 text-sm">Volatility</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-blue-400 font-bold text-lg">{game.category}</div>
          <div className="text-gray-400 text-sm">Category</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <button 
            onClick={() => window.location.href = `/casino/provider/${game.provider.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-purple-400 font-bold text-lg hover:text-purple-300 transition-colors cursor-pointer"
          >
            {game.provider}
          </button>
          <div className="text-gray-400 text-sm">Provider</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[#1a2c38] border-t border-[#2d3748] rounded-b-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2d3748]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{game.name} {game.provider}</h2>
          
          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-1">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-white text-sm">25,000.00x</span>
            <button 
              onClick={() => {
                setSelectedUser({
                  id: 'vietnamdong-id',
                  username: 'vietnamdong',
                  level: 1,
                  is_vip: false,
                  is_mod: false
                })
                setShowUserProfile(true)
              }}
              className="text-blue-400 text-sm hover:text-blue-300 transition-colors cursor-pointer"
            >
              vietnamdong
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2d3748]">
        {[
          { id: 'bigWins', label: 'Big Wins', icon: Trophy },
          { id: 'luckyWins', label: 'Lucky Wins', icon: Star },
          { id: 'description', label: 'Description', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-[#00d4ff] bg-gray-800/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/20'
            }`}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'bigWins' && (
            <motion.div
              key="bigWins"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-800/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                renderWinsTable(bigWins)
              )}
            </motion.div>
          )}

          {activeTab === 'luckyWins' && (
            <motion.div
              key="luckyWins"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-800/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                renderWinsTable(luckyWins)
              )}
            </motion.div>
          )}

          {activeTab === 'description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderDescription()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showUserProfile && selectedUser && user && (
          <UserProfileModal
            isOpen={showUserProfile}
            user={selectedUser}
            currentUser={user}
            chatService={null}
            onClose={() => {
              setShowUserProfile(false)
              setSelectedUser(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameInfoPanel
