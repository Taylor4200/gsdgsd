'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Gift, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'
import { formatCurrency, formatNumber } from '@/lib/utils'

const HeroSection: React.FC = () => {
  const { setAuthModal } = useUIStore()
  const { isAuthenticated } = useUserStore()
  const [jackpot, setJackpot] = useState(1234567.89)
  const [onlineUsers, setOnlineUsers] = useState(8432)
  const [totalWins, setTotalWins] = useState(15672341)

  // Animate jackpot counter
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.random() * 100)
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 10) - 5)
      setTotalWins(prev => prev + Math.floor(Math.random() * 1000))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-pink/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-6xl mx-auto"
        >
          {/* Main Headline */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold font-futuristic mb-4">
              <span className="neon-text-blue">NEXUS</span>
              <br />
              <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue bg-clip-text text-transparent">
                CASINO
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience the future of social gaming with crypto-inspired sweepstakes, 
              pack draws, and real-time multiplayer action.
            </p>
          </motion.div>

          {/* Jackpot Display */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="glass p-8 rounded-2xl max-w-2xl mx-auto border-2 border-neon-yellow/30">
              <div className="text-sm text-gray-400 mb-2">MEGA JACKPOT</div>
              <div className="text-5xl md:text-6xl font-bold font-futuristic jackpot-pulse text-neon-yellow">
                {formatCurrency(jackpot)}
              </div>
              <div className="text-sm text-gray-400 mt-2">Next draw in 2h 34m</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="neon"
                    size="xl"
                    className="text-lg px-8 py-4"
                    onClick={() => setAuthModal(true)}
                    icon={<Play className="h-6 w-6" />}
                  >
                    PLAY NOW
                  </Button>
                  <Button
                    variant="gradient"
                    size="xl"
                    className="text-lg px-8 py-4"
                    onClick={() => setAuthModal(true)}
                    icon={<Gift className="h-6 w-6" />}
                  >
                    CLAIM BONUS
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="neon"
                    size="xl"
                    className="text-lg px-8 py-4"
                    icon={<Play className="h-6 w-6" />}
                  >
                    CONTINUE PLAYING
                  </Button>
                  <Button
                    variant="gradient"
                    size="xl"
                    className="text-lg px-8 py-4"
                    icon={<Gift className="h-6 w-6" />}
                  >
                    OPEN PACK DRAW
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass p-6 rounded-xl text-center">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-neon-blue mr-2" />
                </div>
                <div className="text-3xl font-bold text-neon-blue mb-1">
                  {formatNumber(onlineUsers)}
                </div>
                <div className="text-sm text-gray-400">Players Online</div>
              </div>

              <div className="glass p-6 rounded-xl text-center">
                <div className="flex items-center justify-center mb-3">
                  <TrendingUp className="h-8 w-8 text-neon-green mr-2" />
                </div>
                <div className="text-3xl font-bold text-neon-green mb-1">
                  {formatCurrency(totalWins)}
                </div>
                <div className="text-sm text-gray-400">Total Wins Paid</div>
              </div>

              <div className="glass p-6 rounded-xl text-center">
                <div className="flex items-center justify-center mb-3">
                  <Gift className="h-8 w-8 text-neon-purple mr-2" />
                </div>
                <div className="text-3xl font-bold text-neon-purple mb-1">
                  2,847
                </div>
                <div className="text-sm text-gray-400">Packs Opened Today</div>
              </div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            variants={itemVariants}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-neon-blue rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-neon-blue rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
