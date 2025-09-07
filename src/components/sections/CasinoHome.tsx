'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Users, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import GameCard from '@/components/ui/GameCard'
import GamePopout from '@/components/ui/GamePopout'
import { games, getGamesByCategory, searchGames, getFeaturedGames, getOriginalsGames, getHotGames } from '@/lib/gameData'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import RewardsSection from './RewardsSection'

interface Raffle {
  id: string
  title: string
  total_prize_pool: number
  max_tickets?: number
  tickets_sold?: number
  end_date: string
  status: string
  raffle_prizes: Array<{
    place: number
    amount: number
  }>
}

interface RecentWin {
  id: string
  game_name: string
  username: string
  amount: number
  currency: 'SC' | 'GC'
  created_at: string
}

const CasinoHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lobby')
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [recentWins, setRecentWins] = useState<RecentWin[]>([])
  const [recentlyPlayedGames, setRecentlyPlayedGames] = useState<any[]>([])
  const [isPopoutOpen, setIsPopoutOpen] = useState(false)
  const [popoutGame, setPopoutGame] = useState<any>(null)
  const [popoutPosition, setPopoutPosition] = useState({ x: 100, y: 100 })
  const router = useRouter()

  const handlePopoutGame = (game: any) => {
    trackRecentlyPlayed(game.id)
    setPopoutGame(game)
    setIsPopoutOpen(true)
  }

  // Track recently played games
  const trackRecentlyPlayed = (gameId: string) => {
    try {
      const stored = localStorage.getItem('recentlyPlayedGames')
      let recentGames = stored ? JSON.parse(stored) : []
      
      // Remove if already exists to avoid duplicates
      recentGames = recentGames.filter((id: string) => id !== gameId)
      
      // Add to beginning and limit to 20
      recentGames = [gameId, ...recentGames].slice(0, 20)
      
      localStorage.setItem('recentlyPlayedGames', JSON.stringify(recentGames))
      
      // Update state
      const validGames = recentGames
        .filter((id: string) => games.find(g => g.id === id))
        .map((id: string) => games.find(g => g.id === id))
        .filter(Boolean)
      
      setRecentlyPlayedGames(validGames)
    } catch (error) {
      console.error('Error tracking recently played game:', error)
    }
  }

  // Scroll functions for tabs
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount
      
      tabsRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
      setScrollPosition(newPosition)
    }
  }

  const checkScrollButtons = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current
      const needsScrolling = scrollWidth > clientWidth
      const isWideScreen = window.innerWidth > 600
      
      setCanScrollLeft(scrollLeft > 0 && !isWideScreen)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth && !isWideScreen)
      
      // Hide arrows if content doesn't need scrolling OR if screen is wide
      if (!needsScrolling || isWideScreen) {
        setCanScrollLeft(false)
        setCanScrollRight(false)
      }
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const tabsElement = tabsRef.current
    if (tabsElement) {
      tabsElement.addEventListener('scroll', checkScrollButtons)
      
      // Add resize listener to check when screen size changes
      const handleResize = () => {
        setTimeout(checkScrollButtons, 100) // Small delay to ensure layout is updated
      }
      window.addEventListener('resize', handleResize)
      
      return () => {
        tabsElement.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // Load recently played games from localStorage
  useEffect(() => {
    const loadRecentlyPlayed = () => {
      try {
        const stored = localStorage.getItem('recentlyPlayedGames')
        if (stored) {
          const recentGames = JSON.parse(stored)
          // Filter out games that might not exist anymore and limit to last 20
          const validGames = recentGames
            .filter((gameId: string) => games.find(g => g.id === gameId))
            .slice(0, 20)
            .map((gameId: string) => games.find(g => g.id === gameId))
            .filter(Boolean)
          
          setRecentlyPlayedGames(validGames)
        }
      } catch (error) {
        console.error('Error loading recently played games:', error)
      }
    }

    loadRecentlyPlayed()
  }, [])

  const gameTabs = [
    { id: 'lobby', name: 'Lobby', count: games.length },
    { id: 'originals', name: 'Originals', count: getOriginalsGames().length },
    { id: 'slots', name: 'Slots', count: getGamesByCategory('slots').length },
    { id: 'live', name: 'Live Casino', count: getGamesByCategory('live').length },
    { id: 'table', name: 'Table Games', count: getGamesByCategory('table').length },
    { id: 'recent', name: 'Recently Played', count: recentlyPlayedGames.length },
  ]

  // Define game sections for Lobby tab (like Shuffle)
  const gameSections = [
    // Recently Played section - only show if user has recent games
    ...(recentlyPlayedGames.length > 0 ? [{
      id: 'recently-played',
      name: 'Recently Played',
      games: recentlyPlayedGames.slice(0, 8),
    }] : []),
    {
      id: 'featured',
      name: 'Featured Games',
      games: getFeaturedGames().slice(0, 8),
    },
    {
      id: 'originals',
      name: 'Originals',
      games: getOriginalsGames().slice(0, 8),
    },
    {
      id: 'slots',
      name: 'Slots',
      games: getGamesByCategory('slots').slice(0, 8),
    },
    {
      id: 'live',
      name: 'Live Casino',
      games: getGamesByCategory('live').slice(0, 8),
    },
    {
      id: 'table',
      name: 'Table Games',
      games: getGamesByCategory('table').slice(0, 8),
    },
    {
      id: 'popular',
      name: 'Popular Games',
      games: getHotGames().slice(0, 8),
    },
    {
      id: 'new',
      name: 'Latest Releases',
      games: games.filter(g => g.isNew).slice(0, 8),
    }
  ]

  // Fetch active raffle and recent wins
  useEffect(() => {
    fetchActiveRaffle()
    fetchRecentWins()
  }, [])

  // Update countdown timer
  useEffect(() => {
    if (raffle) {
      const timer = setInterval(updateCountdown, 1000)
      updateCountdown() // Initial call
      return () => clearInterval(timer)
    }
  }, [raffle])

  const fetchActiveRaffle = async () => {
    try {
      const response = await fetch('/api/raffles?status=active')
      const data = await response.json()
      
      if (data.raffles && data.raffles.length > 0) {
        // Get the newest active raffle
        const newestRaffle = data.raffles[0]
        setRaffle(newestRaffle)
      }
    } catch (error) {
      console.error('Error fetching raffle:', error)
    }
  }

  const fetchRecentWins = async () => {
    try {
      const response = await fetch('/api/live-feed?min_amount_sc=100&min_amount_gc=1000000&limit=10')
      const data = await response.json()
      
      if (data.wins && data.wins.length > 0) {
        setRecentWins(data.wins)
      }
    } catch (error) {
      console.error('Error fetching recent wins:', error)
    }
  }

  const updateCountdown = () => {
    if (!raffle) return

    const now = new Date().getTime()
    const endTime = new Date(raffle.end_date).getTime()
    const timeDiff = endTime - now

    if (timeDiff > 0) {
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds.toString().padStart(2, '0')}s`)
    } else {
      setTimeLeft('Ended')
    }
  }

  const handleEnterRaffle = () => {
    if (raffle) {
      router.push(`/raffle/${raffle.id}`)
    }
  }

  // Get games based on active tab
  const getGamesForTab = () => {
    switch (activeTab) {
      case 'lobby':
        return [] // Lobby shows multiple sections, not a single grid
      case 'originals':
        return getOriginalsGames()
      case 'slots':
        return getGamesByCategory('slots')
      case 'live':
        return getGamesByCategory('live')
      case 'table':
        return getGamesByCategory('table')
      case 'recent':
        return recentlyPlayedGames
      default:
        return getFeaturedGames()
    }
  }

  const currentGames = getGamesForTab().slice(0, 18) // Show 18 games (3 rows of 6)

  return (
    <>
      <style jsx>{`
        @keyframes ringPulse {
          0%, 100% {
            --tw-ring-opacity: 0.8;
            --tw-ring-width: 2px;
          }
          50% {
            --tw-ring-opacity: 1;
            --tw-ring-width: 3px;
          }
        }
      `}</style>
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Header - Side by Side Layout */}
      <div className="bg-gradient-to-r from-[#1a2c38] to-[#2d3748] py-6 relative">
        {/* Animated Background Effects - Behind Monthly Sweepstakes, Rewards Center, and Recent Wins */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {/* Primary gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/15 via-transparent to-[#00d4ff]/15" />

          {/* Animated orbs - scaled up for background */}
          <div className="absolute top-20 right-20 w-80 h-80 bg-[#00d4ff]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#00d4ff]/25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#00d4ff]/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />

          {/* Additional animated orbs for better coverage */}
          <div className="absolute top-40 left-40 w-60 h-60 bg-[#00d4ff]/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}} />
          <div className="absolute bottom-40 right-40 w-72 h-72 bg-[#00d4ff]/18 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />

          {/* Geometric patterns - scaled up */}
          <div className="absolute top-16 left-16 w-32 h-32 border-2 border-[#00d4ff]/40 rounded-lg rotate-45 animate-spin" style={{animationDuration: '8s'}} />
          <div className="absolute bottom-16 right-24 w-24 h-24 bg-[#00d4ff]/25 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
          
          {/* Additional geometric patterns */}
          <div className="absolute top-1/3 right-1/3 w-20 h-20 border border-[#00d4ff]/30 rounded-full animate-spin" style={{animationDuration: '12s', animationDelay: '2s'}} />
          <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-[#00d4ff]/20 rounded-lg rotate-12 animate-pulse" style={{animationDelay: '1.5s'}} />
        </div>
        <div className="container mx-auto px-4 relative z-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-2"
          >
            {/* Monthly Sweepstakes - Left Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-6"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2c38] via-[#0f1419] to-[#1a2c38] p-0.5 md:p-3 border border-[#00d4ff]/40 shadow-lg shadow-[#00d4ff]/20 h-[120px] md:h-[320px] flex flex-col ring-2 ring-[#00d4ff]/60 ring-opacity-80" style={{animation: 'ringPulse 3s ease-in-out infinite'}}>

        <div className="flex flex-col h-full">
                  {/* Mobile Layout */}
                  <div className="md:hidden h-full overflow-hidden">
                    <div className="h-full flex flex-col justify-center text-center px-1">
                      <h2 className="text-xs font-bold text-white mb-0 truncate">
                        {raffle ? raffle.title : 'Weekly Raffle'}
                      </h2>
                      <p className="text-gray-300 text-xs mb-1 leading-tight line-clamp-1">
                        {(raffle as any)?.description || 'Earn tickets with every wager and compete for massive prizes!'}
                      </p>

                      {/* Prize breakdown for mobile - Dynamic from raffle data */}
                      <div className="grid grid-cols-3 gap-1 mb-1">
                        {raffle && raffle.raffle_prizes ? (
                          raffle.raffle_prizes.slice(0, 3).map((prize, index) => (
                            <div key={prize.place} className={`bg-gradient-to-br ${index === 0 ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' : index === 1 ? 'from-gray-400/20 to-gray-500/20 border-gray-400/30' : 'from-orange-500/20 to-orange-600/20 border-orange-500/30'} rounded-lg p-1 border flex flex-col items-center justify-center text-center min-h-[20px] overflow-hidden`}>
                              <div className={`text-xs font-semibold mb-0 truncate ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`}>
                                {prize.place}
                            </div>
                              <div className="text-xs font-bold text-white truncate">{prize.amount} SC</div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-1 border border-yellow-500/30 flex flex-col items-center justify-center text-center min-h-[20px] overflow-hidden">
                              <div className="text-yellow-400 text-xs font-semibold mb-0 truncate">1st</div>
                              <div className="text-xs font-bold text-white truncate">-- SC</div>
                            </div>
                            <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-lg p-1 border border-gray-400/30 flex flex-col items-center justify-center text-center min-h-[20px] overflow-hidden">
                              <div className="text-gray-400 text-xs font-semibold mb-0 truncate">2nd</div>
                              <div className="text-xs font-bold text-white truncate">-- SC</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-1 border border-orange-500/30 flex flex-col items-center justify-center text-center min-h-[20px] overflow-hidden">
                              <div className="text-orange-400 text-xs font-semibold mb-0 truncate">3rd</div>
                              <div className="text-xs font-bold text-white truncate">-- SC</div>
                            </div>
                          </>
                        )}
                      </div>
                      
                        {/* Prize Distribution Summary */}
                        <div className="bg-black/20 rounded-lg p-1 mb-1 border border-[#00d4ff]/20">
                          <div className="text-center">
                            <div className="text-[#00d4ff] text-xs font-semibold">
                              {raffle && raffle.raffle_prizes && raffle.raffle_prizes.length > 0 ? (
                                <>
                                  {raffle.raffle_prizes.reduce((sum, prize) => sum + prize.amount, 0).toLocaleString()} SC to {raffle.raffle_prizes.length} winners
                                </>
                              ) : (
                                '-- SC distributed to -- players'
                              )}
                            </div>
                          </div>
                        </div>
                      
                      <Button 
                        variant="default" 
                        className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-bold py-1 text-xs shadow-lg shadow-[#00d4ff]/25 h-6"
                        onClick={handleEnterRaffle}
                        disabled={!raffle}
                      >
                        Enter Raffle
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-12 gap-6 items-start">
                      {/* Left side - Main content */}
                      <div className="col-span-7">
                        <div className="mb-4">
                          <h2 className="text-2xl font-bold text-white mb-2">
                            {raffle ? raffle.title : 'Weekly Raffle'}
                          </h2>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {(raffle as any)?.description || 'Earn tickets with every wager and compete for massive prizes! Join thousands of players in our biggest weekly event.'}
                          </p>
                        </div>

                        {/* Prize breakdown */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {raffle && raffle.raffle_prizes.slice(0, 3).map((prize, index) => (
                            <div key={prize.place} className={`bg-gradient-to-br ${
                              index === 0 ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' :
                              index === 1 ? 'from-gray-400/20 to-gray-500/20 border-gray-400/30' :
                              'from-orange-500/20 to-orange-600/20 border-orange-500/30'
                            } rounded-lg p-3 border flex flex-col items-center justify-center text-center min-h-[60px]`}>
                              <div className={`text-xs font-semibold mb-1 ${
                                index === 0 ? 'text-yellow-400' :
                                index === 1 ? 'text-gray-400' :
                                'text-orange-400'
                              }`}>
                                {prize.place}{prize.place === 1 ? 'st' : prize.place === 2 ? 'nd' : prize.place === 3 ? 'rd' : 'th'} Place
                              </div>
                              <div className="text-lg font-bold text-white">
                                {prize.amount.toLocaleString()} SC
                              </div>
                            </div>
                          ))}
                          {(!raffle || raffle.raffle_prizes.length < 3) && (
                            <>
                              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-3 border border-yellow-500/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                                <div className="text-yellow-400 text-xs font-semibold mb-1">1st Place</div>
                                <div className="text-lg font-bold text-white">50,000 SC</div>
                              </div>
                              <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-lg p-3 border border-gray-400/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                                <div className="text-gray-400 text-xs font-semibold mb-1">2nd Place</div>
                                <div className="text-lg font-bold text-white">25,000 SC</div>
                              </div>
                              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-3 border border-orange-500/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                                <div className="text-orange-400 text-xs font-semibold mb-1">3rd Place</div>
                                <div className="text-lg font-bold text-white">15,000 SC</div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Enter Raffle Button - Moved up for better visibility */}
                        <div className="flex justify-center mb-4">
                          <Button
                            variant="default"
                            className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold px-10 py-4 text-xl shadow-lg shadow-[#00d4ff]/30 transform hover:scale-105 transition-all duration-200"
                            onClick={handleEnterRaffle}
                            disabled={!raffle}
                          >
                            Enter Weekly Raffle
                          </Button>
                        </div>

                        {/* Prize Distribution Summary */}
                        <div className="bg-black/20 rounded-lg p-3 mb-4 border border-[#00d4ff]/20">
                          <div className="text-center">
                            <div className="text-[#00d4ff] text-sm font-semibold">
                              {raffle && raffle.raffle_prizes && raffle.raffle_prizes.length > 0 ? (
                                <>
                                  {raffle.raffle_prizes.reduce((sum, prize) => sum + prize.amount, 0).toLocaleString()} SC to {raffle.raffle_prizes.length} winners
                                </>
                              ) : (
                                '-- SC distributed to -- players'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Stats */}
                      <div className="col-span-5">
                        <div className="space-y-3">
                          {/* Time remaining */}
                          <div className="bg-black/30rounded-lg p-3 border border-[#00d4ff]/20">
                            <div className="text-[#00d4ff] text-xs font-semibold mb-1">
                              Time Remaining
                            </div>
                            <div className="text-lg font-bold text-white mb-1">{timeLeft || '4d 21h 26m 30s'}</div>
                            <div className="text-xs text-gray-400">
                              {raffle ? `Raffle ends ${new Date(raffle.end_date).toLocaleDateString()}` : 'Raffle ends Sunday at 11:59 PM EST'}
                            </div>
                          </div>

                          {/* Your stats */}
                          <div className="bg-black/30rounded-lg p-3 border border-[#00d4ff]/20">
                            <div className="text-[#00d4ff] text-xs font-semibold mb-2">Your Stats</div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-xs">Your Tickets:</span>
                                <span className="text-[#00d4ff] font-bold text-sm">0</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-xs">Your Rank:</span>
                                <span className="text-white font-bold text-xs">Not entered</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-xs">Total Participants:</span>
                                <span className="text-[#00d4ff] font-bold text-xs">2,341</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="bg-black/30rounded-lg p-3 border border-[#00d4ff]/20">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-300">Your Progress</span>
                              <span className="text-[#00d4ff]">0/100 tickets</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                              <div className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] h-2 rounded-full transition-all duration-500" style={{width: '0%'}}></div>
                            </div>
                            <div className="text-xs text-gray-400">Earn 100 tickets to unlock bonus entry</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

        </div>

                {/* Prize highlight */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-1">
                            <motion.div
                    className="hidden md:block bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full font-bold text-xs shadow-lg max-w-fit"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🏆 {raffle && raffle.raffle_prizes ? `${(() => {
                      const total = raffle.raffle_prizes.reduce((sum, prize) => sum + prize.amount, 0);
                      return total >= 1000 ? (total / 1000).toFixed(total % 1000 === 0 ? 0 : 2).replace(/\.?0+$/, '') + 'K' : total;
                    })()} SC Prize Pool` : '100K SC Prize Pool'}
                  </motion.div>
              </div>
            </div>
            </motion.div>

            {/* Rewards Section - Right Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-6"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2c38] via-[#0f1419] to-[#1a2c38] p-0.5 md:p-3 border border-[#00d4ff]/40 shadow-lg shadow-[#00d4ff]/20 h-[220px] md:h-[320px] flex flex-col ring-2 ring-[#00d4ff]/60 ring-opacity-80" style={{animation: 'ringPulse 3s ease-in-out infinite'}}>
              <RewardsSection />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Recent Wins - Fixed Title with Scrolling Content */}
      <div className="bg-gradient-to-r from-[#1a2c38] to-[#2d3748] relative -mt-2">
        {/* Animated Background Effects - Behind Recent Wins */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {/* Primary gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/15 via-transparent to-[#00d4ff]/15" />

          {/* Animated orbs - scaled for Recent Wins section */}
          <div className="absolute top-10 right-10 w-40 h-40 bg-[#00d4ff]/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#00d4ff]/25 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#00d4ff]/30 rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}} />

          {/* Geometric patterns */}
          <div className="absolute top-8 left-8 w-16 h-16 border border-[#00d4ff]/40 rounded-lg rotate-45 animate-spin" style={{animationDuration: '8s'}} />
          <div className="absolute bottom-8 right-12 w-12 h-12 bg-[#00d4ff]/25 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
        </div>
        <div className="container mx-auto px-3 relative z-1">
          <div className="relative overflow-hidden rounded-lg bg-black/20 border border-[#00d4ff]/20 h-[40px] ring-2 ring-[#00d4ff]/50 ring-opacity-70" style={{animation: 'ringPulse 3s ease-in-out infinite'}}>
            {/* Fixed title at top left */}
            <div className="absolute top-1 left-3 z-1 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="text-white font-semibold text-sm">Recent Wins</div>
            </div>
            
            {/* Scrolling content */}
            <div className="absolute inset-0 flex items-center animate-scroll space-x-4 px-3">
              {/* Auto-scrolling wins from database */}
              {recentWins.length > 0 ? (
                recentWins.map((win, index) => {
                  // No emoji needed
                  
                  const iconColors = [
                    'from-yellow-400 to-orange-400',
                    'from-purple-400 to-pink-400', 
                    'from-blue-400 to-cyan-400',
                    'from-green-400 to-emerald-400',
                    'from-red-400 to-pink-400'
                  ]
                  
                  const amount = win.currency === 'SC' ? 
                    `${win.amount >= 1000 ? (win.amount / 1000).toFixed(1) + 'K' : win.amount} SC` :
                    `${win.amount >= 1000000 ? (win.amount / 1000000).toFixed(1) + 'M' : (win.amount / 1000).toFixed(0) + 'K'} GC`
                  
                  return (
                    <div key={win.id} className="flex-shrink-0 flex items-center space-x-2 bg-black/30 rounded-lg p-1.5 border border-[#00d4ff]/10 hover:border-[#00d4ff]/30 transition-all duration-200 cursor-pointer">
                      <div className={`w-6 h-6 bg-gradient-to-r ${iconColors[index % iconColors.length]} rounded-full flex items-center justify-center text-black font-bold text-xs`}>
                        {win.game_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-xs">{win.game_name}</div>
                        <div className="text-gray-300 text-xs">{win.username}</div>
                      </div>
                      <div className="text-green-400 font-bold text-xs">{amount}</div>
                    </div>
                  )
                })
              ) : (
                // Fallback if no data
                <div className="flex-shrink-0 flex items-center space-x-2 bg-black/30 rounded-lg p-1.5 border border-[#00d4ff]/10">
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
                    L
                  </div>
                  <div>
                    <div className="text-white font-semibold text-xs">Loading...</div>
                    <div className="text-gray-300 text-xs">Recent Wins</div>
                  </div>
                  <div className="text-green-400 font-bold text-xs">--</div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

      {/* Game Tabs and Games Section */}
      <div className="container mx-auto px-4 py-6 relative z-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Game Category Tabs */}
          <div className="relative mb-6 border-b border-[#2d3748]">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scrollTabs('left')}
                className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-1 bg-black/80 hover:bg-black/90 text-white p-1.5 rounded-full shadow-lg transition-all duration-200 sm:hidden"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            )}
            
            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollTabs('right')}
                className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-1 bg-black/80 hover:bg-black/90 text-white p-1.5 rounded-full shadow-lg transition-all duration-200 sm:hidden"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
            
            {/* Tabs Container */}
            <div 
              ref={tabsRef}
              className="flex items-center space-x-1 overflow-x-auto scrollbar-hide px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
            {gameTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                    "px-3 py-3 md:px-4 text-sm font-medium transition-all duration-200 border-b-2 relative flex-shrink-0 min-w-fit font-mono tracking-wide",
                  activeTab === tab.id
                    ? "text-[#00d4ff] border-[#00d4ff]"
                    : "text-gray-400 border-transparent hover:text-white hover:border-gray-500"
                )}
              >
                  <span className="whitespace-nowrap">
                {tab.name}
                    <span className="ml-1 md:ml-2 text-xs text-gray-500">
                  ({tab.count})
                    </span>
                </span>
              </button>
            ))}
            </div>
          </div>
          
          {/* Lobby View - Multiple Sections */}
          {activeTab === 'lobby' ? (
            <div className="space-y-8">
              {gameSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="space-y-4"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-white font-mono tracking-wider">{section.name}</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/casino?category=${section.id}`)}
                      className="border-[#4a5568] text-gray-300 hover:border-[#00d4ff] hover:text-white"
                    >
                      View All
                    </Button>
                  </div>
                  
                  {/* Games Grid for this section */}
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {section.games.map((game, gameIndex) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gameIndex * 0.03 }}
                        className="group"
                      >
                        <GameCard 
                          game={game} 
                          variant="compact"
                          onPopout={handlePopoutGame}
                          onClick={() => {
                            trackRecentlyPlayed(game.id)
                            router.push(`/casino/game/${game.id}`)
                          }}
                          onPlay={(game) => {
                            trackRecentlyPlayed(game.id)
                            router.push(`/casino/game/${game.id}`)
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Individual Category View - Single Grid */
            <div>
              {/* Special case for Recently Played with no games */}
              {activeTab === 'recent' && recentlyPlayedGames.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-4">No recently played games</div>
                  <p className="text-gray-500 mb-6">Start playing games to see them here!</p>
                  <Button
                    variant="default"
                    onClick={() => setActiveTab('lobby')}
                    className="bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-bold"
                  >
                    Browse Games
                  </Button>
                </div>
              ) : (
                <>
                  {/* Games Grid - Compact for better visibility */}
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {currentGames.map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group"
                      >
                        <GameCard 
                          game={game} 
                          variant="compact"
                          onPopout={handlePopoutGame}
                          onClick={() => {
                            trackRecentlyPlayed(game.id)
                            router.push(`/casino/game/${game.id}`)
                          }}
                          onPlay={(game) => {
                            trackRecentlyPlayed(game.id)
                            router.push(`/casino/game/${game.id}`)
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* View All Button */}
                  <div className="text-center mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/casino')}
                      className="border-[#4a5568] text-gray-300 hover:border-[#00d4ff] hover:text-white"
                    >
                      View All Games
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
        
        {/* Game Popout Component */}
        {popoutGame && (
          <GamePopout
            game={popoutGame}
            isOpen={isPopoutOpen}
            onClose={() => setIsPopoutOpen(false)}
            onMinimize={() => setIsPopoutOpen(false)}
            position={popoutPosition}
            onPositionChange={setPopoutPosition}
          />
        )}
      </div>
    </div>
    </>
  )
}

export default CasinoHome
