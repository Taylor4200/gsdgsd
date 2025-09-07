'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import GameCard from '@/components/ui/GameCard'
import { games, getGamesByCategory, searchGames, getFeaturedGames, getOriginalsGames, getHotGames } from '@/lib/gameData'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import DailyBonusClaim from './DailyBonusClaim'
import RakebackClaim from './RakebackClaim'
import RewardsSection from './RewardsSection'

interface Raffle {
  id: string
  title: string
  total_prize: number
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
  const router = useRouter()

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

  const gameTabs = [
    { id: 'lobby', name: 'Lobby', count: games.length },
    { id: 'originals', name: 'Originals', count: getOriginalsGames().length },
    { id: 'slots', name: 'Slots', count: getGamesByCategory('slots').length },
    { id: 'live', name: 'Live Casino', count: getGamesByCategory('live').length },
    { id: 'table', name: 'Table Games', count: getGamesByCategory('table').length },
  ]

  // Define game sections for Lobby tab (like Shuffle)
  const gameSections = [
    {
      id: 'featured',
      name: 'Featured Games',
      games: getFeaturedGames().slice(0, 8),
      icon: '⭐'
    },
    {
      id: 'originals',
      name: 'Originals',
      games: getOriginalsGames().slice(0, 8),
      icon: '🎮'
    },
    {
      id: 'slots',
      name: 'Slots',
      games: getGamesByCategory('slots').slice(0, 8),
      icon: '🎰'
    },
    {
      id: 'live',
      name: 'Live Casino',
      games: getGamesByCategory('live').slice(0, 8),
      icon: '📺'
    },
    {
      id: 'table',
      name: 'Table Games',
      games: getGamesByCategory('table').slice(0, 8),
      icon: '🃏'
    },
    {
      id: 'popular',
      name: 'Popular Games',
      games: getHotGames().slice(0, 8),
      icon: '🔥'
    },
    {
      id: 'new',
      name: 'Latest Releases',
      games: games.filter(g => g.isNew).slice(0, 8),
      icon: '🆕'
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
      default:
        return getFeaturedGames()
    }
  }

  const currentGames = getGamesForTab().slice(0, 18) // Show 18 games (3 rows of 6)

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Header - Side by Side Layout */}
      <div className="bg-gradient-to-r from-[#1a2c38] to-[#2d3748] py-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Monthly Sweepstakes - Left Side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-6"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2c38] via-[#0f1419] to-[#1a2c38] p-2 md:p-3 border border-[#00d4ff]/40 shadow-lg shadow-[#00d4ff]/20 h-[280px] md:min-h-[320px] md:max-h-[400px] flex flex-col">
                {/* Enhanced animated background elements */}
                <div className="absolute inset-0">
                  {/* Primary gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/10 via-transparent to-[#00d4ff]/10" />

                  {/* Animated orbs */}
                  <div className="absolute top-6 right-8 w-40 h-40 bg-[#00d4ff]/15 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-8 left-6 w-32 h-32 bg-[#00d4ff]/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#00d4ff]/25 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}} />

                  {/* Geometric patterns */}
                  <div className="absolute top-4 left-4 w-16 h-16 border-2 border-[#00d4ff]/30 rounded-lg rotate-45 animate-spin" style={{animationDuration: '8s'}} />
                  <div className="absolute bottom-6 right-12 w-12 h-12 bg-[#00d4ff]/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />

                </div>

        <div className="relative z-10 flex flex-col h-full">
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="text-center mb-3">
                      <h2 className="text-lg font-bold text-white mb-1">
                        {raffle ? raffle.title : '100K SC Weekly Raffle'}
                      </h2>
                      <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                        Earn tickets with every wager and compete for massive prizes!
                      </p>

                      {/* Prize breakdown for mobile */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {raffle && raffle.raffle_prizes.slice(0, 3).map((prize, index) => (
                          <div key={prize.place} className={`bg-gradient-to-br ${
                            index === 0 ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' :
                            index === 1 ? 'from-gray-400/20 to-gray-500/20 border-gray-400/30' :
                            'from-orange-500/20 to-orange-600/20 border-orange-500/30'
                          } backdrop-blur-sm rounded-lg p-2 border flex flex-col items-center justify-center text-center min-h-[50px]`}>
                            <div className={`text-xs font-semibold mb-0.5 ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-400'
                            }`}>
                              {prize.place}{prize.place === 1 ? 'st' : prize.place === 2 ? 'nd' : prize.place === 3 ? 'rd' : 'th'} Place
                            </div>
                            <div className="text-sm font-bold text-white">
                              {prize.amount >= 1000 ? `${(prize.amount / 1000).toFixed(0)}K SC` : `${prize.amount} SC`}
                            </div>
                          </div>
                        ))}
                        {(!raffle || raffle.raffle_prizes.length < 3) && (
                          <>
                            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-2 border border-yellow-500/30 flex flex-col items-center justify-center text-center min-h-[50px]">
                              <div className="text-yellow-400 text-xs font-semibold mb-0.5">1st Place</div>
                              <div className="text-sm font-bold text-white">50K SC</div>
                            </div>
                            <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm rounded-lg p-2 border border-gray-400/30 flex flex-col items-center justify-center text-center min-h-[50px]">
                              <div className="text-gray-400 text-xs font-semibold mb-0.5">2nd Place</div>
                              <div className="text-sm font-bold text-white">25K SC</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-lg p-2 border border-orange-500/30 flex flex-col items-center justify-center text-center min-h-[50px]">
                              <div className="text-orange-400 text-xs font-semibold mb-0.5">3rd Place</div>
                              <div className="text-sm font-bold text-white">15K SC</div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Mobile Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-[#00d4ff]/20">
                          <div className="text-[#00d4ff] text-xs font-semibold mb-0.5">Time Left</div>
                          <div className="text-sm font-bold text-white">{timeLeft || '4d 21h 26m 30s'}</div>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-[#00d4ff]/20">
                          <div className="text-[#00d4ff] text-xs font-semibold mb-0.5">Your Tickets</div>
                          <div className="text-sm font-bold text-white">0</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="default" 
                        className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-bold py-2 text-sm shadow-lg shadow-[#00d4ff]/25"
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
                            {raffle ? raffle.title : '100,000 SC Weekly Raffle'}
                          </h2>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Earn tickets with every wager and compete for massive prizes! Join thousands of players in our biggest weekly event.
                          </p>
                        </div>

                        {/* Prize breakdown */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {raffle && raffle.raffle_prizes.slice(0, 4).map((prize, index) => (
                            <div key={prize.place} className={`bg-gradient-to-br ${
                              index === 0 ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' :
                              index === 1 ? 'from-gray-400/20 to-gray-500/20 border-gray-400/30' :
                              index === 2 ? 'from-orange-500/20 to-orange-600/20 border-orange-500/30' :
                              'from-purple-500/20 to-purple-600/20 border-purple-500/30'
                            } backdrop-blur-sm rounded-lg p-3 border flex flex-col items-center justify-center text-center min-h-[60px]`}>
                              <div className={`text-xs font-semibold mb-1 ${
                                index === 0 ? 'text-yellow-400' :
                                index === 1 ? 'text-gray-400' :
                                index === 2 ? 'text-orange-400' :
                                'text-purple-400'
                              }`}>
                                {prize.place}{prize.place === 1 ? 'st' : prize.place === 2 ? 'nd' : prize.place === 3 ? 'rd' : 'th'} Place
                              </div>
                              <div className="text-lg font-bold text-white">
                                {prize.amount.toLocaleString()} SC
                              </div>
                            </div>
                          ))}
                          {(!raffle || raffle.raffle_prizes.length < 4) && (
                            <>
                              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                                <div className="text-yellow-400 text-xs font-semibold mb-1">1st Place</div>
                                <div className="text-lg font-bold text-white">50,000 SC</div>
                              </div>
                              <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm rounded-lg p-3 border border-gray-400/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                                <div className="text-gray-400 text-xs font-semibold mb-1">2nd Place</div>
                                <div className="text-lg font-bold text-white">25,000 SC</div>
                              </div>
                              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-lg p-3 border border-orange-500/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                                <div className="text-orange-400 text-xs font-semibold mb-1">3rd Place</div>
                                <div className="text-lg font-bold text-white">15,000 SC</div>
                              </div>
                              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                                <div className="text-purple-400 text-xs font-semibold mb-1">+ More Prizes</div>
                                <div className="text-lg font-bold text-white">10,000 SC</div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex justify-center mt-9">
                          <Button
                            variant="default"
                            className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold px-10 py-4 text-xl shadow-lg shadow-[#00d4ff]/30 transform hover:scale-105 transition-all duration-200"
                            onClick={handleEnterRaffle}
                            disabled={!raffle}
                          >
                            Enter Weekly Raffle
                          </Button>
                        </div>
                      </div>

                      {/* Right side - Stats */}
                      <div className="col-span-5">
                        <div className="space-y-3">
                          {/* Time remaining */}
                          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-[#00d4ff]/20">
                            <div className="text-[#00d4ff] text-xs font-semibold mb-1">
                              Time Remaining
                            </div>
                            <div className="text-lg font-bold text-white mb-1">{timeLeft || '4d 21h 26m 30s'}</div>
                            <div className="text-xs text-gray-400">
                              {raffle ? `Raffle ends ${new Date(raffle.end_date).toLocaleDateString()}` : 'Raffle ends Sunday at 11:59 PM EST'}
                            </div>
                          </div>

                          {/* Your stats */}
                          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-[#00d4ff]/20">
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
                          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-[#00d4ff]/20">
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
        
                {/* Floating elements animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
                      className="absolute w-2 h-2 bg-[#00d4ff]/40 rounded-full"
              style={{
                        left: `${10 + i * 12}%`,
                        top: `${20 + i * 8}%`,
              }}
              animate={{
                        y: [0, -15, 0],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.5, 1],
              }}
              transition={{
                        duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

                {/* Prize highlight */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
                  <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-1.5 py-0.5 md:px-3 md:py-1 rounded-full font-bold text-xs shadow-lg max-w-fit"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="md:hidden">🏆 {raffle ? `${raffle.total_prize >= 1000 ? (raffle.total_prize / 1000).toFixed(0) + 'K' : raffle.total_prize} SC` : '100K SC'}</span>
                    <span className="hidden md:inline">🏆 {raffle ? `${raffle.total_prize >= 1000 ? (raffle.total_prize / 1000).toFixed(0) + 'K' : raffle.total_prize} SC Prize Pool` : '100K SC Prize Pool'}</span>
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
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a2c38] via-[#0f1419] to-[#1a2c38] p-2 md:p-3 border border-[#00d4ff]/40 shadow-lg shadow-[#00d4ff]/20 h-[280px] md:min-h-[320px] md:max-h-[400px] flex flex-col">
                <RewardsSection />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Recent Wins - Fixed Title with Scrolling Content */}
      <div className="bg-gradient-to-r from-[#1a2c38] to-[#2d3748]">
        <div className="container mx-auto px-3">
          <div className="relative overflow-hidden rounded-lg bg-black/20 border border-[#00d4ff]/20 h-[40px]">
            {/* Fixed title at top left */}
            <div className="absolute top-1 left-3 z-10 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="text-white font-semibold text-sm">Recent Wins</div>
            </div>
            
            {/* Scrolling content */}
            <div className="absolute inset-0 flex items-center animate-scroll space-x-4 px-3">
              {/* Auto-scrolling wins from database */}
              {recentWins.length > 0 ? (
                recentWins.map((win, index) => {
                  const gameIcon = win.game_name.toLowerCase().includes('dice') ? '🎲' :
                                 win.game_name.toLowerCase().includes('blackjack') ? '🃏' :
                                 win.game_name.toLowerCase().includes('limbo') ? '🎯' :
                                 win.game_name.toLowerCase().includes('minesweeper') ? '💎' :
                                 win.game_name.toLowerCase().includes('plinko') ? '🎯' :
                                 win.game_name.toLowerCase().includes('baccarat') ? '🃏' : '🎰'
                  
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
                        {gameIcon}
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
                    🎰
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
      <div className="container mx-auto px-4 py-6">
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
                className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-1.5 rounded-full shadow-lg transition-all duration-200 sm:hidden"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            )}
            
            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scrollTabs('right')}
                className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-1.5 rounded-full shadow-lg transition-all duration-200 sm:hidden"
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
                    "px-3 py-3 md:px-4 text-sm font-medium transition-all duration-200 border-b-2 relative flex-shrink-0 min-w-fit",
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
                      <span className="text-lg">{section.icon}</span>
                      <h3 className="text-xl font-bold text-white">{section.name}</h3>
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default CasinoHome
