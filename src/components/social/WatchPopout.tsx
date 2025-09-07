'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Eye, 
  EyeOff,
  Volume2,
  VolumeX,
  Settings,
  Crown,
  Gamepad2,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { WatchSession, GameSession } from '@/types/social'
import { formatCurrency, formatTime } from '@/lib/utils'

interface WatchPopoutProps {
  session: WatchSession
  onClose: () => void
  onMinimize: () => void
}

const WatchPopout: React.FC<WatchPopoutProps> = ({ session, onClose, onMinimize }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [gameData, setGameData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const watchedProfile = session.watched_profile
  const gameSession = session.game_session

  useEffect(() => {
    // Simulate loading game data
    const timer = setTimeout(() => {
      setIsLoading(false)
      // In real implementation, this would fetch live game data
      setGameData({
        currentBet: gameSession?.bet_amount || 0,
        currentMultiplier: gameSession?.multiplier || 1,
        isPlaying: true,
        lastResult: gameSession?.result || 'loss'
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [gameSession])

  const handleMinimize = () => {
    setIsMinimized(true)
    onMinimize()
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-[#1a2c38] border border-[#00d4ff] rounded-lg p-3 shadow-2xl cursor-pointer"
          onClick={handleMaximize}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {watchedProfile?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-white text-sm font-medium">{watchedProfile?.username}</div>
              <div className="text-gray-400 text-xs">Watching...</div>
            </div>
            <Eye className="h-4 w-4 text-[#00d4ff]" />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-4 right-4 w-96 h-[600px] bg-[#0f1419] border border-[#1a2332] rounded-lg shadow-2xl z-[9999] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1a2332] bg-[#1a2c38]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {watchedProfile?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white text-sm font-medium flex items-center space-x-1">
              <span>{watchedProfile?.username}</span>
              {watchedProfile?.vip_tier && <Crown className="h-3 w-3 text-yellow-400" />}
            </div>
            <div className="text-gray-400 text-xs">Live Game</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMinimize}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 h-full overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-white text-lg font-medium">Loading Game...</div>
              <div className="text-gray-400 text-sm">Connecting to {watchedProfile?.username}'s game</div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Game Status */}
            <Card className="bg-[#1a2c38] border-[#2d3748]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Gamepad2 className="h-5 w-5 text-[#00d4ff]" />
                    <span className="text-white font-medium">{gameSession?.game_name || 'Dice'}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs">Current Bet</div>
                    <div className="text-white font-medium">{formatCurrency(gameData?.currentBet || 0)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Multiplier</div>
                    <div className="text-white font-medium">{gameData?.currentMultiplier}x</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Visualization */}
            <Card className="bg-[#1a2c38] border-[#2d3748]">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-white text-lg font-medium mb-2">Game View</div>
                  <div className="w-full h-32 bg-gradient-to-br from-[#00d4ff]/20 to-[#0099cc]/20 rounded-lg flex items-center justify-center border border-[#00d4ff]/30">
                    <div className="text-center">
                      <div className="text-[#00d4ff] text-2xl font-bold mb-1">
                        {gameData?.currentMultiplier || 1}x
                      </div>
                      <div className="text-gray-400 text-sm">
                        {gameData?.isPlaying ? 'Rolling...' : 'Waiting...'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="bg-[#1a2c38] border-[#2d3748]">
              <CardContent className="p-4">
                <div className="text-white text-sm font-medium mb-3">Recent Results</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Game</span>
                    <span className={`font-medium ${
                      gameData?.lastResult === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {gameData?.lastResult === 'win' ? 'Win' : 'Loss'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Session Started</span>
                    <span className="text-white">{formatTime(session.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat/Interaction */}
            <Card className="bg-[#1a2c38] border-[#2d3748]">
              <CardContent className="p-4">
                <div className="text-white text-sm font-medium mb-3">Quick Actions</div>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Follow Same Bet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-gray-400 border-gray-600 hover:text-white hover:border-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#1a2332] bg-[#1a2c38]">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>Watching {watchedProfile?.username}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WatchPopout
