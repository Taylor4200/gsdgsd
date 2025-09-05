'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Star, 
  Video, 
  Crown, 
  Zap,
  Play,
  Eye,
  Heart,
  Clock,
  DollarSign,
  Gamepad2,
  Dice1,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import GameCard from '@/components/ui/GameCard'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { formatCurrency } from '@/lib/utils'
import { getLiveGames } from '@/lib/gameData'
import type { Game } from '@/lib/gameData'

const LivePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const categories = [
    { id: 'all', name: 'All Games', icon: Gamepad2 },
    { id: 'roulette', name: 'Roulette', icon: Target },
    { id: 'blackjack', name: 'Blackjack', icon: Crown },
    { id: 'baccarat', name: 'Baccarat', icon: Dice1 },
    { id: 'poker', name: 'Poker', icon: Star },
    { id: 'game-show', name: 'Game Shows', icon: Video }
  ]

  // Get live games from centralized data
  const liveGames = getLiveGames()

  const filteredGames = liveGames.filter(game => 
    selectedCategory === 'all' || game.type === selectedCategory
  )

  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.players - a.players
      case 'min-bet':
        return (a.minBet || 0) - (b.minBet || 0)
      case 'max-bet':
        return (b.maxBet || 0) - (a.maxBet || 0)
      default:
        return 0
    }
  })

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'roulette':
        return <Target className="h-4 w-4" />
      case 'blackjack':
        return <Crown className="h-4 w-4" />
      case 'baccarat':
        return <Dice1 className="h-4 w-4" />
      case 'poker':
        return <Star className="h-4 w-4" />
      case 'game-show':
        return <Video className="h-4 w-4" />
      default:
        return <Gamepad2 className="h-4 w-4" />
    }
  }

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419] text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-3 mb-4"
            >
              <TrendingUp className="h-8 w-8 text-[#00d4ff]" />
              <h1 className="text-4xl font-bold text-white">Live Casino</h1>
              <Zap className="h-6 w-6 text-yellow-400" />
            </motion.div>
            <p className="text-gray-400 text-lg">Experience the thrill of live dealer games with real-time action</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card variant="glass" className="p-4 border-[#2d3748]">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-[#00d4ff]" />
                <div>
                  <div className="text-sm text-gray-400">Live Tables</div>
                  <div className="text-lg font-bold text-white">{liveGames.length}</div>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" className="p-4 border-[#2d3748]">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Active Players</div>
                  <div className="text-lg font-bold text-white">
                    {liveGames.reduce((sum, game) => sum + game.players, 0)}
                  </div>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" className="p-4 border-[#2d3748]">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-gray-400">Hot Games</div>
                  <div className="text-lg font-bold text-white">
                    {liveGames.filter(game => game.isHot).length}
                  </div>
                </div>
              </div>
            </Card>
            
            <Card variant="glass" className="p-4 border-[#2d3748]">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Avg Wait</div>
                  <div className="text-lg font-bold text-white">&lt;30s</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 ${
                  selectedCategory === category.id 
                    ? 'bg-[#00d4ff] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-400">
              Showing {sortedGames.length} live games
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#1a2c38] border border-[#2d3748] text-white rounded px-3 py-1 text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="min-bet">Lowest Min Bet</option>
                <option value="max-bet">Highest Max Bet</option>
              </select>
            </div>
          </div>

          {/* Live Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGames.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <GameCard 
                  game={game} 
                  variant="compact"
                />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {sortedGames.length === 0 && (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Live Games Available</h3>
              <p className="text-gray-400">Check back later for live dealer games</p>
            </div>
          )}
        </div>
      </div>
    </CasinoLayout>
  )
}

export default LivePage
