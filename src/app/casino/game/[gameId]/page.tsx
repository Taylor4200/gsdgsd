'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Settings, Fullscreen, Minimize, RotateCcw, Info, Users, Zap, Star, Crown, Play, Gift, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { games } from '@/lib/gameData'
import { Game } from '@/lib/gameData'
import CasinoLayout from '@/components/layout/CasinoLayout'
import MobileGameView from '@/components/ui/MobileGameView'
import Link from 'next/link'

const GamePage: React.FC = () => {
  const params = useParams()
  const gameId = params.gameId as string
  const [game, setGame] = useState<Game | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRealPlay, setIsRealPlay] = useState(false)
  const [freeSpins, setFreeSpins] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const foundGame = games.find(g => g.id === gameId)
    setGame(foundGame || null)
  }, [gameId])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (iframeRef.current && iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen()
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const togglePlayMode = () => {
    setIsRealPlay(!isRealPlay)
  }

  if (!game) {
    return (
      <CasinoLayout>
        <div className="min-h-screen bg-[#0f1419] text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
            <p className="text-gray-400 mb-6">The game you're looking for doesn't exist.</p>
            <Link href="/casino">
              <Button variant="default" className="bg-[#00d4ff] text-black">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Casino
              </Button>
            </Link>
          </div>
        </div>
      </CasinoLayout>
    )
  }

  // Use mobile view on mobile devices
  if (isMobile) {
    return (
      <MobileGameView 
        game={game} 
        onBack={() => window.history.back()} 
      />
    )
  }

  const GameContent = () => (
    <div className="min-h-screen bg-[#0f1419] text-white flex justify-start" style={{ paddingTop: '3vh' }}>
      <div className="mx-auto px-4 md:px-0" style={{ width: '95%', maxWidth: '1400px' }}>
        {/* Game Header */}
        <div className="bg-[#1a2c38] border-b border-[#2d3748] p-3 md:p-4 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link href="/casino">
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#00d4ff] rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-base md:text-lg">🎮</span>
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-white">{game.name}</h1>
                  <p className="text-gray-400 text-xs md:text-sm">{game.provider}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-4">
              {/* Game Stats - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-300">
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
                    <Users className="h-4 w-4 text-blue-400" />
                    <span>{game.players.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Play Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Mode:</span>
                <div className="flex bg-[#2d3748] rounded-lg p-1">
                  <button
                    onClick={togglePlayMode}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      !isRealPlay 
                        ? 'bg-[#00d4ff] text-black' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Fun Play
                  </button>
                  <button
                    onClick={togglePlayMode}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      isRealPlay 
                        ? 'bg-[#00d4ff] text-black' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Real Play
                  </button>
                </div>
              </div>

              {/* Free Spins */}
              <div className="flex items-center space-x-2 group relative">
                <Gift className="h-4 w-4 text-yellow-400 cursor-help" />
                <span className="text-sm text-gray-300">{freeSpins}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                  <div className="text-center">
                    <div className="font-semibold mb-1">How to Earn Free Spins</div>
                    <div className="text-gray-300">
                      • Play games to earn points<br/>
                      • Complete daily challenges<br/>
                      • Win tournaments<br/>
                      • Refer friends
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                </div>
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
                  onClick={toggleFullscreen}
                  className="text-gray-300 hover:text-white"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Iframe Container */}
        <div className="relative bg-black border border-[#2d3748] overflow-hidden" style={{ height: 'calc(85vh - 200px)' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading {game.name}...</p>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={`https://demo-games.softswiss.com/game/${game.id}?language=en&currency=USD&mode=${isRealPlay ? 'real' : 'demo'}`}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            allowFullScreen
            title={game.name}
          />

          {/* Game Info Panel Overlay */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 right-4 w-80 bg-[#1a2c38]/95 backdrop-blur-sm border border-[#2d3748] rounded-lg shadow-2xl z-20"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Game Information</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowInfo(false)}
                      className="text-gray-300 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-400">Provider:</div>
                      <div className="text-white">{game.provider}</div>
                      <div className="text-gray-400">Category:</div>
                      <div className="text-white">{game.category}</div>
                      {game.rtp && (
                        <>
                          <div className="text-gray-400">RTP:</div>
                          <div className="text-green-400">{game.rtp}%</div>
                        </>
                      )}
                      {game.volatility && (
                        <>
                          <div className="text-gray-400">Volatility:</div>
                          <div className="text-yellow-400">{game.volatility}</div>
                        </>
                      )}
                      {game.minBet && (
                        <>
                          <div className="text-gray-400">Min Bet:</div>
                          <div className="text-white">${game.minBet}</div>
                        </>
                      )}
                      {game.maxBet && (
                        <>
                          <div className="text-gray-400">Max Bet:</div>
                          <div className="text-white">${game.maxBet}</div>
                        </>
                      )}
                      {game.jackpot && (
                        <>
                          <div className="text-gray-400">Jackpot:</div>
                          <div className="text-yellow-400">${game.jackpot.toLocaleString()}</div>
                        </>
                      )}
                    </div>
                    {game.tags && game.tags.length > 0 && (
                      <div>
                        <div className="text-gray-400 mb-2">Tags:</div>
                        <div className="flex flex-wrap gap-1">
                          {game.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-[#00d4ff]/20 text-[#00d4ff] text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game Footer */}
        <div className="bg-[#1a2c38] border-t border-[#2d3748] p-3 md:p-4 rounded-b-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
              <div className="text-white text-sm">
                <span className="text-gray-400">Game:</span> {game.name}
              </div>
              <div className="text-white text-sm">
                <span className="text-gray-400">Provider:</span> {game.provider}
              </div>
              <div className="text-white text-sm">
                <span className="text-gray-400">Mode:</span> 
                <span className={isRealPlay ? 'text-green-400' : 'text-blue-400'}>
                  {isRealPlay ? 'Real Play' : 'Fun Play'}
                </span>
              </div>
              {game.recentWin && (
                <div className="text-green-400 text-sm">
                  <span className="text-gray-400">Recent Win:</span> ${game.recentWin.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <CasinoLayout>
      <GameContent />
    </CasinoLayout>
  )
}

export default GamePage
