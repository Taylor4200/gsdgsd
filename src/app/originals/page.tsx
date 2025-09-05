'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Play, 
  Users,
  Star,
  Zap,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import GameCard from '@/components/ui/GameCard'
import { formatNumber } from '@/lib/utils'
import { getOriginalsGames } from '@/lib/gameData'
import type { Game } from '@/lib/gameData'

export default function OriginalsPage() {
  // Get originals games from centralized data
  const games = getOriginalsGames()

  // Calculate stats from the games data
  const totalPlayers = games.reduce((sum, game) => sum + game.players, 0)
  const totalGames = games.length
  const avgRTP = games.reduce((sum, game) => sum + game.rtp, 0) / games.length

  return (
    <CasinoLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="h-8 w-8 text-[#00d4ff]" />
            <h1 className="text-3xl font-bold text-white">Edge Originals</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Exclusive games designed and built by our team. Provably fair, lightning fast, and uniquely ours.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="glass" className="p-4 border-[#2d3748]">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm text-gray-400">Total Players</div>
                <div className="text-lg font-bold text-white">{formatNumber(totalPlayers)}</div>
              </div>
            </div>
          </Card>
          
          <Card variant="glass" className="p-4 border-[#2d3748]">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-sm text-gray-400">Original Games</div>
                <div className="text-lg font-bold text-white">{totalGames}</div>
              </div>
            </div>
          </Card>
          
          <Card variant="glass" className="p-4 border-[#2d3748]">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Total Bets</div>
                <div className="text-lg font-bold text-white">2.1M</div>
              </div>
            </div>
          </Card>
          
          <Card variant="glass" className="p-4 border-[#2d3748]">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">Avg RTP</div>
                <div className="text-lg font-bold text-white">{avgRTP.toFixed(1)}%</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Featured Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 p-8 mb-8"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Provably Fair Gaming
                </h2>
                <p className="text-white/80 text-lg mb-4">
                  Every game is cryptographically verifiable. You can verify the fairness of every bet.
                </p>
                <Button variant="default" className="bg-white text-black hover:bg-gray-100">
                  Learn More About Fairness
                </Button>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm mb-1">House Edge</div>
                <div className="text-4xl font-bold text-white">1%</div>
                <div className="text-white/80 text-sm">Industry Leading</div>
              </div>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute right-4 top-4 opacity-20">
            <Crown className="h-24 w-24 text-white" />
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GameCard 
                game={game} 
                variant="compact"
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-8">
          <Crown className="h-12 w-12 text-[#00d4ff] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">More Originals Coming Soon</h3>
          <p className="text-gray-400 mb-4">
            We're constantly developing new and innovative games exclusively for our platform.
          </p>
          <Button variant="outline" size="lg">
            Suggest a Game
          </Button>
        </div>
      </div>
    </CasinoLayout>
  )
}
