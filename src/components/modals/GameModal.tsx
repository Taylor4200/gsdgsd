'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, Settings, Fullscreen, Minimize, RotateCcw, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Game } from '@/lib/gameData'

interface GameModalProps {
  game: Game | null
  isOpen: boolean
  onClose: () => void
}

const GameModal: React.FC<GameModalProps> = ({ game, isOpen, onClose }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Reset states when game changes
  useEffect(() => {
    if (game) {
      setIsLoading(true)
      setShowInfo(false)
    }
  }, [game])

  const handleClose = () => {
    onClose()
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  if (!game) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 bg-[#1a2c38] border-b border-[#2d3748]">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#00d4ff] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">🎮</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{game.name}</h2>
                  <p className="text-gray-400 text-sm">{game.provider}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Game Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-300">
                {game.rtp && (
                  <div className="flex items-center space-x-1">
                    <span className="text-green-400">RTP:</span>
                    <span>{game.rtp}%</span>
                  </div>
                )}
                {game.volatility && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">Volatility:</span>
                    <span>{game.volatility}</span>
                  </div>
                )}
                {game.players && (
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-400">Players:</span>
                    <span>{game.players.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-gray-300 hover:text-white"
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-gray-300 hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-gray-300 hover:text-white"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-gray-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Game Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#1a2c38] border-b border-[#2d3748] overflow-hidden"
              >
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-white font-semibold mb-2">Game Details</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>Provider: {game.provider}</div>
                        <div>Category: {game.category}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Game Stats</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        {game.rtp && <div>RTP: {game.rtp}%</div>}
                        {game.volatility && <div>Volatility: {game.volatility}</div>}
                        {game.minBet && <div>Min Bet: ${game.minBet}</div>}
                        {game.maxBet && <div>Max Bet: ${game.maxBet}</div>}
                        {game.jackpot && <div>Jackpot: ${game.jackpot.toLocaleString()}</div>}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {game.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#00d4ff]/20 text-[#00d4ff] text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Iframe Container */}
          <div className="flex-1 relative bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading {game.name}...</p>
                </div>
              </div>
            )}
            
            <iframe
              src={`https://demo-games.softswiss.com/game/${game.id}?language=en&currency=USD&mode=demo`}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              allowFullScreen
              title={game.name}
            />
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#1a2c38] border-t border-[#2d3748] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-white text-sm">
                  <span className="text-gray-400">Game:</span> {game.name}
                </div>
                <div className="text-white text-sm">
                  <span className="text-gray-400">Provider:</span> {game.provider}
                </div>
                {game.recentWin && (
                  <div className="text-green-400 text-sm">
                    <span className="text-gray-400">Recent Win:</span> ${game.recentWin.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2d3748] text-gray-300 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Game
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                >
                  Play for Real
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GameModal
