'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import GameCard from '@/components/ui/GameCard'
import { games, getGamesByCategory, searchGames, getFeaturedGames, getOriginalsGames, getHotGames } from '@/lib/gameData'

const CasinoHome: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('featured') // Default to featured games
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'continue', name: 'Continue Playing', count: 0 },
    { id: 'featured', name: 'Featured Games', count: getFeaturedGames().length },
    { id: 'originals', name: 'Originals', count: getOriginalsGames().length },
    { id: 'popular', name: 'Popular', count: getHotGames().length },
    { id: 'all', name: 'All Games', count: games.length },
  ]

  const filteredGames = activeFilter === 'all' 
    ? games 
    : activeFilter === 'featured'
    ? getFeaturedGames()
    : activeFilter === 'originals'
    ? getOriginalsGames()
    : activeFilter === 'popular'
    ? getHotGames()
    : activeFilter === 'continue'
    ? [] // Continue playing would show recently played games
    : getGamesByCategory(activeFilter)

  const searchedGames = searchTerm 
    ? searchGames(searchTerm)
    : filteredGames

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2c38] to-[#2d3748] py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
      {/* Weekly Raffle Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2c38] via-[#0f1419] to-[#1a2c38] p-6 md:p-10 border-2 border-[#00d4ff]/40 shadow-2xl shadow-[#00d4ff]/20">
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

        <div className="relative z-10">
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-white mb-3">
                        $100K Weekly Raffle
                      </h2>
                      <p className="text-gray-300 text-base mb-6 leading-relaxed">
                        Earn tickets with every wager and compete for massive prizes! Join thousands of players in our biggest weekly event.
                      </p>

                      {/* Prize breakdown for mobile */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                          <div className="text-yellow-400 text-xs font-semibold mb-1">1st Place</div>
                          <div className="text-lg font-bold text-white">$50K</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm rounded-xl p-3 border border-gray-400/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                          <div className="text-gray-400 text-xs font-semibold mb-1">2nd Place</div>
                          <div className="text-lg font-bold text-white">$25K</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-3 border border-orange-500/30 flex flex-col items-center justify-center text-center min-h-[60px]">
                          <div className="text-orange-400 text-xs font-semibold mb-1">3rd Place</div>
                          <div className="text-lg font-bold text-white">$15K</div>
                        </div>
                      </div>
                      
                      {/* Mobile Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-[#00d4ff]/20">
                          <div className="text-[#00d4ff] text-xs font-semibold mb-1">Time Left</div>
                          <div className="text-xl font-bold text-white">4d 21h</div>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-[#00d4ff]/20">
                          <div className="text-[#00d4ff] text-xs font-semibold mb-1">Your Tickets</div>
                          <div className="text-xl font-bold text-white">0</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="default" 
                        className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-bold py-3 text-lg shadow-lg shadow-[#00d4ff]/25"
                        onClick={() => window.location.href = '/raffle/weeklyraffle0901'}
                      >
                        Enter Raffle
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-12 gap-8 items-center">
                      {/* Left side - Main content */}
                      <div className="col-span-7">
                        <div className="mb-6">
                          <h2 className="text-4xl font-bold text-white mb-3">
                            $100,000 Weekly Raffle
                          </h2>
                          <p className="text-gray-300 text-lg leading-relaxed">
                            Earn tickets with every wager and compete for massive prizes! Join thousands of players in our biggest weekly event.
                          </p>
                        </div>

                        {/* Prize breakdown */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 flex flex-col items-center justify-center text-center min-h-[80px]">
                            <div className="text-yellow-400 text-sm font-semibold mb-2">1st Place</div>
                            <div className="text-2xl font-bold text-white">$50,000</div>
                          </div>
                          <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm rounded-xl p-4 border border-gray-400/30 flex flex-col items-center justify-center text-center min-h-[80px]">
                            <div className="text-gray-400 text-sm font-semibold mb-2">2nd Place</div>
                            <div className="text-2xl font-bold text-white">$25,000</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30 flex flex-col items-center justify-center text-center min-h-[80px]">
                            <div className="text-orange-400 text-sm font-semibold mb-2">3rd Place</div>
                            <div className="text-2xl font-bold text-white">$15,000</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 flex flex-col items-center justify-center text-center min-h-[80px]">
                            <div className="text-purple-400 text-sm font-semibold mb-2">+ More Prizes</div>
                            <div className="text-2xl font-bold text-white">$10,000</div>
                          </div>
                        </div>

                        <Button
                          variant="default"
                          className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold px-10 py-4 text-xl shadow-lg shadow-[#00d4ff]/30 transform hover:scale-105 transition-all duration-200"
                          onClick={() => window.location.href = '/raffle/weeklyraffle0901'}
                        >
                          Enter Weekly Raffle
                        </Button>
                      </div>

                      {/* Right side - Stats */}
                      <div className="col-span-5">
                        <div className="space-y-4">
                          {/* Time remaining */}
                          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/20">
                            <div className="text-[#00d4ff] text-sm font-semibold mb-3">
                              Time Remaining
                            </div>
                            <div className="text-4xl font-bold text-white mb-2">4d 21h 26m</div>
                            <div className="text-sm text-gray-400">Raffle ends Sunday at 11:59 PM EST</div>
                          </div>

                          {/* Your stats */}
                          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/20">
                            <div className="text-[#00d4ff] text-sm font-semibold mb-3">Your Stats</div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300">Your Tickets:</span>
                                <span className="text-[#00d4ff] font-bold text-xl">0</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300">Your Rank:</span>
                                <span className="text-white font-bold">Not entered</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300">Total Participants:</span>
                                <span className="text-[#00d4ff] font-bold">2,341</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/20">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-300">Your Progress</span>
                              <span className="text-[#00d4ff]">0/100 tickets</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                              <div className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] h-3 rounded-full transition-all duration-500" style={{width: '0%'}}></div>
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
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-0.5 md:px-3 md:py-1 rounded-full font-bold text-xs shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🏆 $100K Prize Pool
                  </motion.div>
              </div>
            </div>
          </motion.div>
          </motion.div>
          </div>
        </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeFilter === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(category.id)}
              className={activeFilter === category.id 
                ? "bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90" 
                : "border-[#4a5568] text-gray-300 hover:border-[#00d4ff] hover:text-white"
              }
            >
              {category.name}
              <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-full text-xs">
                {category.count}
              </span>
            </Button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {searchedGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GameCard 
                game={game} 
                variant="compact"
              />
                             </motion.div>
                           ))}
                         </div>

        {searchedGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games found matching your search.</p>
                     </div>
                   )}
      </div>
    </div>
  )
}

export default CasinoHome
