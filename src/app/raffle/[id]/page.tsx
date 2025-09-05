'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Ticket, Users, Gift, TrendingUp, Star, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatNumber, formatCurrency } from '@/lib/utils'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { useUserStore } from '@/store/userStore'

interface RaffleData {
  id: string
  title: string
  description: string
  total_prize: number
  start_date: string
  end_date: string
  status: string
  raffle_prizes: Array<{
    id: string
    place: number
    amount: number
    percentage: number
  }>
  raffle_game_multipliers: Array<{
    id: string
    game_id: string
    game_name: string
    multiplier: number
    wager_requirement: number
    tickets_per_wager: number
  }>
}

interface UserTickets {
  raffle_id: string
  user_id: string
  tickets_earned: number
  total_wagered: number
}

const WeeklyRaffle: React.FC = () => {
  const { user } = useUserStore()
  const [raffleData, setRaffleData] = useState<RaffleData | null>(null)
  const [userTickets, setUserTickets] = useState<UserTickets | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get raffle ID from URL
  const raffleId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''

  useEffect(() => {
    if (raffleId) {
      fetchRaffleData()
    }
  }, [raffleId])

  useEffect(() => {
    if (raffleData && user) {
      fetchUserTickets()
    }
  }, [raffleData, user])

  useEffect(() => {
    if (raffleData) {
      const timer = setInterval(updateCountdown, 1000)
      updateCountdown() // Initial call
      return () => clearInterval(timer)
    }
  }, [raffleData])

  const fetchRaffleData = async () => {
    try {
      // Try to fetch by ID first (UUID)
      let response = await fetch(`/api/raffles?id=${raffleId}`)
      let data = await response.json()
      
      if (response.ok && data.raffle) {
        setRaffleData(data.raffle)
      } else {
        // If not found by ID, try to fetch all active raffles and find by title/slug
        response = await fetch('/api/raffles?status=active')
        data = await response.json()
        
        if (data.raffles && data.raffles.length > 0) {
          // For now, just use the first active raffle
          // In the future, you could implement slug matching
          setRaffleData(data.raffles[0])
        } else {
          setError('No active raffles found')
        }
      }
    } catch (error) {
      console.error('Error fetching raffle:', error)
      setError('Failed to load raffle')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTickets = async () => {
    if (!user || !raffleData) return

    try {
      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffle_id: raffleData.id,
          user_id: user.id
        })
      })
      const data = await response.json()
      
      if (response.ok) {
        setUserTickets(data.tickets)
      }
    } catch (error) {
      console.error('Error fetching user tickets:', error)
    }
  }

  const updateCountdown = () => {
    if (!raffleData) return

    const now = new Date().getTime()
    const endTime = new Date(raffleData.end_date).getTime()
    const timeDiff = endTime - now

    if (timeDiff <= 0) {
      setTimeLeft('Ended')
      return
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

    setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds.toString().padStart(2, '0')}s`)
  }

  const getGameIcon = (gameId: string) => {
    const icons: { [key: string]: string } = {
      'general': '🎫',
      'blackjack': '🃏',
      'baccarat': '🎰',
      'dice': '🎲',
      'limbo': '📈',
      'minesweeper': '💣',
      'plinko': '🎯'
    }
    return icons[gameId] || '🎮'
  }

  if (loading) {
    return (
      <CasinoLayout>
        <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
          <div className="text-white text-xl">Loading raffle...</div>
        </div>
      </CasinoLayout>
    )
  }

  if (error || !raffleData) {
    return (
      <CasinoLayout>
        <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
          <div className="text-red-400 text-xl">{error || 'Raffle not found'}</div>
        </div>
      </CasinoLayout>
    )
  }

  const RaffleContent = () => (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#1a2c38] via-[#2a3f5f] to-[#1a2c38] py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + i * 8}%`,
              }}
              animate={{
                y: [0, -20, 0],
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

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <span className="text-blue-400 drop-shadow-lg">{formatCurrency(raffleData.total_prize)}</span>
              <br />
              <span className="text-white drop-shadow-lg">{raffleData.title}</span>
            </h1>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-blue-400 mr-3" />
                  <span className="text-lg text-gray-300 font-semibold">Raffle Ends In</span>
                </div>
                <div className="text-3xl font-bold text-white">{timeLeft}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-4">
                  <Ticket className="h-8 w-8 text-blue-400 mr-3" />
                  <span className="text-lg text-gray-300 font-semibold">Your Tickets</span>
                </div>
                <div className="text-3xl font-bold text-white">{userTickets?.tickets_earned || 0}</div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-12 text-lg text-gray-300">
              <div className="flex items-center bg-black/30 px-6 py-3 rounded-full">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                {raffleData.status} raffle
              </div>
              <div className="flex items-center bg-black/30 px-6 py-3 rounded-full">
                <Gift className="h-5 w-5 mr-2 text-blue-400" />
                {raffleData.raffle_prizes.length} prizes
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white mb-8 text-center">About the Raffle</h2>
          <div className="bg-gradient-to-br from-[#1a2c38]/50 to-[#2a3f5f]/50 rounded-2xl p-8 border border-gray-700/50">
            <p className="text-gray-300 text-xl leading-relaxed text-center">
              {raffleData.description || `Once the raffle begins, your ticket count will automatically increase with every qualified wager until the raffle has ended. At the end of the countdown, all tickets are entered into a pool and winners are drawn at random, to split ${formatCurrency(raffleData.total_prize)}. Earn as many tickets as possible to improve your chances to win! If you win, your funds will automatically be added to your balance.`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Ways to Enter */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white mb-16 text-center">Ways to Enter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {raffleData.raffle_game_multipliers.map((multiplier, index) => (
              <motion.div
                key={multiplier.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-br from-[#1a2c38]/80 to-[#2a3f5f]/80 rounded-2xl p-10 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start space-x-6">
                  <div className="text-6xl">{getGameIcon(multiplier.game_id)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-300 mb-3">{multiplier.game_name}</h3>
                    <p className="text-white text-xl font-bold leading-relaxed">
                      Earn {multiplier.tickets_per_wager} ticket(s) for every ${multiplier.wager_requirement.toLocaleString()} USD wagered on {multiplier.game_name}.
                      {multiplier.multiplier > 1 && (
                        <span className="text-blue-400 ml-2">
                          <Zap className="h-5 w-5 inline mr-1" />
                          {multiplier.multiplier}x Multiplier!
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Raffle Prizes */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-white mb-6 text-center">Raffle Prizes</h2>
          <p className="text-gray-300 text-xl text-center mb-16">Here's the breakdown. Good Luck!</p>
          
          <div className="space-y-6">
            {raffleData.raffle_prizes.map((prize, index) => (
              <motion.div
                key={prize.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-gradient-to-r from-[#1a2c38]/80 to-[#2a3f5f]/80 rounded-2xl p-8 border border-gray-700/50 flex items-center justify-between hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                    index === 0 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' :
                    index === 1 ? 'bg-gray-400 text-black shadow-lg shadow-gray-400/50' :
                    index === 2 ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/50' :
                    'bg-gray-600 text-white shadow-lg shadow-gray-600/50'
                  }`}>
                    {prize.place}
                  </div>
                  <div>
                    <div className="text-white font-bold text-xl">{prize.place === 1 ? '1st Place' : prize.place === 2 ? '2nd Place' : prize.place === 3 ? '3rd Place' : `${prize.place}th Place`}</div>
                    <div className="text-gray-400 text-lg">{prize.percentage}% of total prize pool</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">{formatCurrency(prize.amount)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )

  return (
    <CasinoLayout>
      <RaffleContent />
    </CasinoLayout>
  )
}

export default WeeklyRaffle
