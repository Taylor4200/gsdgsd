'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Users, Zap, Star, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Game } from '@/lib/gameData'
import Link from 'next/link'

interface GameCardProps {
  game: Game
  variant?: 'default' | 'featured' | 'compact'
  onClick?: () => void
  onPlay?: (game: Game) => void
}

const GameCard: React.FC<GameCardProps> = ({ game, variant = 'default', onClick, onPlay }) => {
  const [imageError, setImageError] = useState(false)

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crash': return 'from-red-500/20 to-orange-500/20'
      case 'slots': return 'from-purple-500/20 to-pink-500/20'
      case 'dice': return 'from-blue-500/20 to-cyan-500/20'
      case 'roulette': return 'from-green-500/20 to-emerald-500/20'
      case 'blackjack': return 'from-yellow-500/20 to-orange-500/20'
      default: return 'from-gray-500/20 to-gray-600/20'
    }
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-[3/2] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-[#00d4ff]/50 transition-all duration-300">
          {/* Background Image */}
          {game.image && !imageError && (
            <img 
              src={game.image} 
              alt={game.name}
              className="absolute inset-0 w-full h-full object-fill"
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Fallback gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(game.category)} ${game.image && !imageError ? 'opacity-0' : ''}`} />
          
          {/* Game-specific visual elements - only show if no image or image failed */}
          {(!game.image || imageError) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white/80 mb-2">IMAGE</div>
                <div className="text-lg font-bold text-white/60">COMING SOON</div>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {game.isExclusive && (
              <span className="bg-[#00d4ff] text-black text-xs px-2 py-1 rounded-full font-bold">
                EXCLUSIVE
              </span>
            )}
            {game.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                NEW
              </span>
            )}
            {game.isHot && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                HOT
              </span>
            )}
          </div>

                          {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href={game.provider === 'EDGE ORIGINALS' ? `/originals/${game.id}` : `/casino/game/${game.id}`}>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-[#00d4ff] text-black"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      PLAY
                    </Button>
                  </Link>
                </div>

          {/* Player Count */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Users className="h-3 w-3 mr-1 text-green-400" />
            {formatNumber(game.players || 0)}
          </div>
                </div>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-[#00d4ff]/50 transition-all duration-300">
          {/* Background Image */}
          {game.image && !imageError && (
            <img 
              src={game.image} 
              alt={game.name}
              className="absolute inset-0 w-full h-full object-fill"
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Fallback gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(game.category)} ${game.image && !imageError ? 'opacity-0' : ''}`} />
          
          {/* Game-specific visual elements - only show if no image or image failed */}
          {(!game.image || imageError) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-white/80 mb-2">IMAGE</div>
                <div className="text-2xl font-bold text-white/60">COMING SOON</div>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex gap-2">
            {game.isHot && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                HOT
              </div>
            )}
            {game.isNew && (
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Star className="h-3 w-3 mr-1" />
                NEW
              </div>
            )}
            {game.isExclusive && (
              <div className="bg-[#00d4ff] text-black text-xs px-2 py-1 rounded-full flex items-center">
                <Crown className="h-3 w-3 mr-1" />
                EXCLUSIVE
              </div>
            )}
          </div>

                          {/* Play Button Overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link href={game.provider === 'EDGE ORIGINALS' ? `/originals/${game.id}` : `/casino/game/${game.id}`}>
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="bg-[#00d4ff] text-black"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      PLAY NOW
                    </Button>
                  </Link>
                </div>

          {/* Recent Win Badge */}
          {game.recentWin && (
            <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
              ${formatNumber(game.recentWin)}
            </div>
          )}

          {/* Player Count */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Users className="h-3 w-3 mr-1 text-green-400" />
            {formatNumber(game.players || 0)}
          </div>

          {/* Game Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-lg font-bold text-white mb-1">{game.name}</h3>
            <p className="text-sm text-gray-300 mb-2">{game.provider}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[3/2] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-[#00d4ff]/50 transition-all duration-300">
        {/* Background Image */}
        {game.image && !imageError && (
          <img 
            src={game.image} 
            alt={game.name}
            className="absolute inset-0 w-full h-full object-fill"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Fallback gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(game.category)} ${game.image && !imageError ? 'opacity-0' : ''}`} />
        
        {/* Game-specific visual elements - only show if no image or image failed */}
        {(!game.image || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white/80 mb-2">IMAGE</div>
              <div className="text-xl font-bold text-white/60">COMING SOON</div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {game.isExclusive && (
            <span className="bg-[#00d4ff] text-black text-xs px-2 py-1 rounded-full font-bold">
              EXCLUSIVE
            </span>
          )}
          {game.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              NEW
            </span>
          )}
          {game.isHot && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              HOT
            </span>
          )}
        </div>

                      {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link href={game.provider === 'EDGE ORIGINALS' ? `/originals/${game.id}` : `/casino/game/${game.id}`}>
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="bg-[#00d4ff] text-black"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    PLAY
                  </Button>
                </Link>
              </div>

        {/* Player Count */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
          <Users className="h-3 w-3 mr-1 text-green-400" />
          {formatNumber(game.players || 0)}
        </div>
      </div>
    </motion.div>
  )
}

export default GameCard
