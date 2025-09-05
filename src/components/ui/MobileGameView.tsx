'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Game } from '@/lib/gameData'

interface MobileGameViewProps {
  game: Game
  onBack: () => void
}

const MobileGameView: React.FC<MobileGameViewProps> = ({ game, onBack }) => {
  const [showGameInfo, setShowGameInfo] = useState(false)

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Mobile Game Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#1a2c38] border-b border-[#2d3748] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">{game.name}</h1>
              <p className="text-gray-400 text-xs">{game.provider}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGameInfo(!showGameInfo)}
            className="text-gray-300 hover:text-white"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Game Info Dropdown */}
      <AnimatePresence>
        {showGameInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-4 right-4 z-20 bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-xl"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Game Information</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGameInfo(false)}
                  className="text-gray-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Provider:</span>
                  <span className="text-white">{game.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white capitalize">{game.category}</span>
                </div>
                {game.rtp && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">RTP:</span>
                    <span className="text-green-400">{game.rtp}%</span>
                  </div>
                )}
                {game.volatility && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volatility:</span>
                    <span className="text-yellow-400">{game.volatility}</span>
                  </div>
                )}
                {game.minBet && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Bet:</span>
                    <span className="text-white">${game.minBet}</span>
                  </div>
                )}
                {game.maxBet && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Bet:</span>
                    <span className="text-white">${game.maxBet}</span>
                  </div>
                )}
                {game.jackpot && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jackpot:</span>
                    <span className="text-yellow-400">${game.jackpot.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game HTML Content */}
      <div className="pt-16 h-screen">
        {/* Game Display Area - Full Screen */}
        <div className="h-full bg-[#2d3748] flex flex-col">
          {/* Game Content - Takes up most of the screen */}
          <div className="flex-1 flex items-center justify-center p-4">
            {game.category === 'slots' ? (
              <div className="text-center w-full">
                <div className="text-9xl mb-6">🎰</div>
                <div className="text-white text-3xl font-bold mb-4">{game.name}</div>
                <div className="text-gray-400 text-lg mb-6">Slot Game</div>
                <div className="text-[#00d4ff] text-xl">HTML Game Content</div>
              </div>
            ) : game.category === 'blackjack' || game.category === 'baccarat' || game.category === 'poker' ? (
              <div className="text-center w-full">
                <div className="text-9xl mb-6">🃏</div>
                <div className="text-white text-3xl font-bold mb-4">{game.name}</div>
                <div className="text-gray-400 text-lg mb-6">Table Game</div>
                <div className="text-[#00d4ff] text-xl">HTML Game Content</div>
              </div>
            ) : game.category === 'roulette' ? (
              <div className="text-center w-full">
                <div className="text-9xl mb-6">🎰</div>
                <div className="text-white text-3xl font-bold mb-4">{game.name}</div>
                <div className="text-gray-400 text-lg mb-6">Roulette</div>
                <div className="text-[#00d4ff] text-xl">HTML Game Content</div>
              </div>
            ) : (
              <div className="text-center w-full">
                <div className="text-9xl mb-6">🎮</div>
                <div className="text-white text-3xl font-bold mb-4">{game.name}</div>
                <div className="text-gray-400 text-lg mb-6">Casino Game</div>
                <div className="text-[#00d4ff] text-xl">HTML Game Content</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileGameView
