'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { ArrowLeft, Volume2, VolumeX, Settings, Fullscreen, Minimize, RotateCcw, Info, Users, Zap, Star, Crown, Play, Gift, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { games } from '@/lib/gameData'
import { Game } from '@/lib/gameData'
import CasinoLayout from '@/components/layout/CasinoLayout'
import MobileGameView from '@/components/ui/MobileGameView'
import GamePopout from '@/components/ui/GamePopout'
import GameInfoPanel from '@/components/ui/GameInfoPanel'
import Link from 'next/link'
import { useUserStore } from '@/store/userStore'

const GamePage: React.FC = () => {
  const params = useParams()
  const gameId = params.gameId as string
  const { selectedCurrency, setSelectedCurrency } = useUserStore()
  const [game, setGame] = useState<Game | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRealPlay, setIsRealPlay] = useState(selectedCurrency === 'SC')
  const [freeSpins, setFreeSpins] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isPopoutOpen, setIsPopoutOpen] = useState(false)
  const [popoutPosition, setPopoutPosition] = useState({ x: 100, y: 100 })
  const [isTheatreMode, setIsTheatreMode] = useState(false)
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

  // Sync game currency with top bar currency
  useEffect(() => {
    setIsRealPlay(selectedCurrency === 'SC')
  }, [selectedCurrency])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleTheatreMode = () => {
    setIsTheatreMode(!isTheatreMode)
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
            <h1 className="text-2xl font-bold font-mono tracking-wider mb-4">Game Not Found</h1>
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

  // Use proper layout for all devices - like Stake/Roobet
  const GameContent = () => (
    <div className="min-h-screen bg-[#0f1419] text-white flex justify-start" style={{ paddingTop: isMobile ? '1vh' : '3vh' }}>
      <div className={`mx-auto transition-all duration-300 px-4 md:px-6 ${isTheatreMode ? 'w-full max-w-none' : 'w-[95%] max-w-[1400px]'}`}>
        {/* Game Iframe Container */}
        <div className={`relative bg-black border border-[#2d3748] overflow-hidden transition-all duration-300 ${isTheatreMode ? 'rounded-none' : 'rounded-t-lg'}`} style={{ 
          height: isTheatreMode 
            ? (isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 180px)')
            : (isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 260px)')
        }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading {game.name}...</p>
                <p className="text-gray-400 text-sm mt-2">Powered by EDGE Originals</p>
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


        </div>

        {/* Clean Game Footer - Stake Style */}
        <div className="bg-[#1a2c38] border-t border-[#2d3748] p-2 md:p-4 rounded-b-lg sticky bottom-0 z-10">
          <div className="flex items-center justify-between">
            {/* Left Side - Game Info */}
            <div className="flex flex-wrap items-center gap-2 md:gap-6 text-xs md:text-sm">
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedCurrency} 
                  onChange={(e) => {
                    const newCurrency = e.target.value as 'GC' | 'SC'
                    setSelectedCurrency(newCurrency)
                    setIsRealPlay(newCurrency === 'SC')
                  }}
                  className={`bg-transparent text-sm border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-green-400 ${selectedCurrency === 'SC' ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  <option value="GC" className="bg-[#1a2c38] text-yellow-400">GC</option>
                  <option value="SC" className="bg-[#1a2c38] text-green-400">SC</option>
                </select>
              </div>
              <div className="text-white text-sm hidden sm:block">
                <span className="text-gray-400">Game:</span> {game.name}
              </div>
              <div className="text-white text-sm hidden sm:block">
                <span className="text-gray-400">Provider:</span>
                <button
                  onClick={() => window.location.href = `/casino/provider/${game.provider.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-white hover:text-gray-300 transition-colors cursor-pointer ml-1"
                >
                  {game.provider}
                </button>
              </div>
              {game.recentWin && (
                <div className="text-green-400 text-sm hidden sm:block">
                  <span className="text-gray-400">Recent Win:</span> ${game.recentWin.toLocaleString()}
                </div>
              )}
            </div>

            {/* Center - Stake-style Edge Branding */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center space-x-3">
                <img src="/Logo11.png" alt="Edge Logo" className="h-8 w-8 object-contain opacity-15 grayscale" />
                <span className="text-xl font-bold text-white opacity-10">EDGE</span>
              </div>
            </div>

            {/* Right Side - Fullscreen, Theatre Mode and Popout Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheatreMode}
                className={`text-gray-300 hover:text-white ${isTheatreMode ? 'bg-green-500/20 text-green-400' : ''}`}
                title={isTheatreMode ? 'Exit Theatre Mode' : 'Enter Theatre Mode'}
              >
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className={`w-3 h-3 border border-current transition-all duration-200 ${isTheatreMode ? 'bg-current' : ''}`}></div>
                </div>
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
                onClick={() => setIsPopoutOpen(true)}
                className="text-gray-300 hover:text-white"
                title="Popout Game"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Game Info Panel - Big Wins & Description - Hidden on mobile */}
        {!isMobile && game && <GameInfoPanel game={game} />}

        {/* Recommended Games Section - Hidden on mobile */}
        {!isMobile && (
          <div className="mt-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <span>🚀</span>
              <span>Recommended</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {/* Mock recommended games */}
            {[
              { name: 'Gates of Olympus', provider: 'Pragmatic Play', players: 1037, image: '/RoyalHunt.avif' },
              { name: 'Sweet Bonanza', provider: 'Pragmatic Play', players: 1112, image: '/Sweet1000.avif' },
              { name: 'Sugar Rush', provider: 'Pragmatic Play', players: 892, image: '/Sugar1000.avif' },
              { name: 'The Dog House', provider: 'Pragmatic Play', players: 654, image: '/RoyalHunt.avif' },
            ].map((recGame, index) => (
              <div key={index} className="flex-shrink-0 w-48 bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="relative">
                  <img src={recGame.image} alt={recGame.name} className="w-full h-32 object-cover" />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {recGame.players} playing
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm mb-1">{recGame.name}</h3>
                  <p className="text-gray-400 text-xs">{recGame.provider}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* More from Provider Section - Hidden on mobile */}
        {!isMobile && (
          <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <span>🎯</span>
              <span>More from {game.provider}</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => window.location.href = `/casino/provider/${game.provider.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                View All
              </button>
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {/* Mock provider games */}
            {[
              { name: 'Gates of Olympus 1000', provider: 'Pragmatic Play', players: 1037, image: '/RoyalHunt.avif' },
              { name: 'Sweet Bonanza Xmas', provider: 'Pragmatic Play', players: 756, image: '/SweetXmas.avif' },
              { name: 'Sugar Rush 1000', provider: 'Pragmatic Play', players: 892, image: '/Sugar1000.avif' },
              { name: 'Wild Wild Riches', provider: 'Pragmatic Play', players: 423, image: '/RoyalHunt.avif' },
              { name: 'The Dog House Megaways', provider: 'Pragmatic Play', players: 654, image: '/RoyalHunt.avif' },
            ].map((providerGame, index) => (
              <div key={index} className="flex-shrink-0 w-48 bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="relative">
                  <img src={providerGame.image} alt={providerGame.name} className="w-full h-32 object-cover" />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {providerGame.players} playing
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm mb-1">{providerGame.name}</h3>
                  <p className="text-gray-400 text-xs">{providerGame.provider}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  )

  return (
    <CasinoLayout theatreMode={isTheatreMode}>
      <GameContent />
      
      {/* Game Popout Component */}
      {game && (
        <GamePopout
          game={game}
          isOpen={isPopoutOpen}
          onClose={() => setIsPopoutOpen(false)}
          onMinimize={() => setIsPopoutOpen(false)}
          position={popoutPosition}
          onPositionChange={setPopoutPosition}
        />
      )}
    </CasinoLayout>
  )
}

export default GamePage
