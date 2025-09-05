'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Star, 
  TrendingUp, 
  Filter,
  Search,
  Users,
  Crown,
  Zap
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import GameCard from '@/components/ui/GameCard'
import { formatNumber } from '@/lib/utils'
import { games, getGameCounts, searchGames } from '@/lib/gameData'
import type { Game } from '@/lib/gameData'

export default function CasinoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Games', count: 0 },
    { id: 'slots', name: 'Slots', count: 0 },
    { id: 'table', name: 'Table Games', count: 0 },
    { id: 'live', name: 'Live Casino', count: 0 },
    { id: 'new', name: 'New Games', count: 0 },
    { id: 'originals', name: 'Originals', count: 0 }
  ]

  // Get game counts from centralized data
  const gameCounts = getGameCounts()

  // Update categories with real counts
  const updatedCategories = categories.map(cat => ({
    ...cat,
    count: gameCounts[cat.id as keyof typeof gameCounts] || 0
  }))

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryDisplayName = (categoryId: string) => {
    switch (categoryId) {
      case 'slots': return 'Slots'
      case 'table': return 'Table Games'
      case 'live': return 'Live Casino'
      case 'new': return 'New Games'
      case 'originals': return 'Originals'
      default: return 'Games'
    }
  }

  return (
    <CasinoLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Casino Games</h1>
          <p className="text-gray-400">Thousands of games from top providers</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="bg-[#1a2c38] border-[#2d3748]"
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {updatedCategories.map((category) => (
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
                {category.name}
                <span className="ml-2 text-xs opacity-70">
                  ({formatNumber(category.count)})
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <GameCard 
                  game={game} 
                  variant="compact"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'No games found matching your search.' : `${getCategoryDisplayName(selectedCategory)} games coming soon!`}
            </div>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Games
          </Button>
        </div>
      </div>
    </CasinoLayout>
  )
}
