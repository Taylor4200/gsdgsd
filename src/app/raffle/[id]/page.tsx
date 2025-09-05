'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Ticket, Users, Gift, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatNumber, formatCurrency } from '@/lib/utils'
import CasinoLayout from '@/components/layout/CasinoLayout'

interface RaffleData {
  id: string
  title: string
  prize: number
  timeLeft: string
  tickets: number
  totalTickets: number
  participants: number
  waysToEnter: Array<{
    id: string
    title: string
    description: string
    ticketsPerAmount: number
    amount: number
    icon: string
  }>
  prizes: Array<{
    place: number
    amount: number
    percentage: number
  }>
}

const WeeklyRaffle: React.FC = () => {
  const [raffleData, setRaffleData] = useState<RaffleData>({
    id: 'weeklyraffle0901',
    title: '$100,000 Weekly Raffle',
    prize: 100000,
    timeLeft: '4d 21h 26m',
    tickets: 0,
    totalTickets: 15420,
    participants: 2341,
    waysToEnter: [
      {
        id: 'general',
        title: 'Play Now',
        description: 'Earn 1 ticket(s) for every $1000 USD wagered site-wide.',
        ticketsPerAmount: 1,
        amount: 1000,
        icon: '🎫'
      },
      {
        id: 'waves-poseidon',
        title: 'Play Now',
        description: 'Earn 2 ticket(s) for every $1000 USD wagered on Waves of Poseidon.',
        ticketsPerAmount: 2,
        amount: 1000,
        icon: '💎'
      }
    ],
    prizes: [
      { place: 1, amount: 10000, percentage: 10 },
      { place: 2, amount: 7500, percentage: 7.5 },
      { place: 3, amount: 5000, percentage: 5 },
      { place: 4, amount: 2500, percentage: 2.5 },
      { place: 5, amount: 1000, percentage: 1 }
    ]
  })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      // Update countdown logic here
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const RaffleContent = () => (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-24 h-24 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
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
              <span className="text-yellow-400 drop-shadow-lg">{formatCurrency(raffleData.prize)}</span>
              <br />
              <span className="text-white drop-shadow-lg">Weekly Raffle</span>
            </h1>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-yellow-400 mr-3" />
                  <span className="text-lg text-gray-300 font-semibold">Raffle Ends In</span>
                </div>
                <div className="text-3xl font-bold text-white">{raffleData.timeLeft}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-4">
                  <Ticket className="h-8 w-8 text-yellow-400 mr-3" />
                  <span className="text-lg text-gray-300 font-semibold">Your Tickets</span>
                </div>
                <div className="text-3xl font-bold text-white">{raffleData.tickets}</div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-12 text-lg text-gray-300">
              <div className="flex items-center bg-black/30 px-6 py-3 rounded-full">
                <Users className="h-5 w-5 mr-2 text-yellow-400" />
                {formatNumber(raffleData.participants)} participants
              </div>
              <div className="flex items-center bg-black/30 px-6 py-3 rounded-full">
                <Ticket className="h-5 w-5 mr-2 text-yellow-400" />
                {formatNumber(raffleData.totalTickets)} total tickets
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
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50">
            <p className="text-gray-300 text-xl leading-relaxed text-center">
              Once the raffle begins, your ticket count will automatically increase with every qualified wager until the raffle has ended. At the end of the countdown, all tickets are entered into a pool and 100 winners are drawn at random, to split {formatCurrency(raffleData.prize)}. Earn as many tickets as possible to improve your chances to win! If you win, your funds will automatically be added to your EDGE balance.
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
            {raffleData.waysToEnter.map((way, index) => (
              <motion.div
                key={way.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-10 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start space-x-6">
                  <div className="text-6xl">{way.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-300 mb-3">{way.title}</h3>
                    <p className="text-white text-xl font-bold leading-relaxed">{way.description}</p>
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
            {raffleData.prizes.map((prize, index) => (
              <motion.div
                key={prize.place}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-2xl p-8 border border-gray-700/50 flex items-center justify-between hover:border-yellow-500/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
                    index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' :
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
                  <div className="text-3xl font-bold text-yellow-400">{formatCurrency(prize.amount)}</div>
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
