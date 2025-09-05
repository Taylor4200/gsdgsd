'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Trophy,
  Users,
  Shield,
  CheckCircle,
  Zap,
  Gift,
  TrendingUp,
  Play,
  Crown,
  Gamepad2,
  DollarSign,
  FileText,
  Star,
  Mail,
  Phone,
  Lock,
  X,
  Sparkles,
  Target,
  Award,
  Coins,
  Flame,
  Rocket,
  Diamond,
  Heart
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const LandingPage: React.FC = () => {
  const { setSignupModal } = useUIStore()
  const [email, setEmail] = useState('')
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsEmailSubmitted(true)
      setTimeout(() => setIsEmailSubmitted(false), 3000)
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const slideInLeft = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8 }
  }

  const slideInRight = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8 }
  }

  const bounceIn = {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, type: "spring", bounce: 0.4 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f1419] to-[#1a1f2e] text-white overflow-hidden">

      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-[#00d4ff]/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-40 right-20 w-40 h-40 bg-[#00d4ff]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: 180,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-1/4 w-48 h-48 bg-[#00d4ff]/20 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Content */}
            <motion.div {...slideInLeft} className="text-center lg:text-left">
              <motion.div
                {...bounceIn}
                className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20"
              >
                <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium">🎉 FREE to Play, REAL to Win</span>
              </motion.div>

              <motion.h1
                {...fadeInUp}
                className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent"
                style={{fontFamily: 'Orbitron'}}
              >
                EDGE
                <br />
                <span className="text-4xl md:text-6xl">ORIGINALS</span>
              </motion.h1>

              <motion.p
                {...fadeInUp}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
              >
                The future of social gaming.
                <span className="text-cyan-400 font-semibold"> Play for FREE</span>,
                compete for <span className="text-yellow-400 font-semibold">$100K prizes</span>.
              </motion.p>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button
                  size="xl"
                  onClick={() => setSignupModal(true)}
                  className="btn-neon px-12 py-6 text-xl font-bold"
                >
                  <Rocket className="w-8 h-8 mr-3" />
                  Start FREE Gaming Now
                </Button>

                <Button
                  size="xl"
                  variant="outline"
                  onClick={() => window.location.href = '/casino'}
                  className="border-2 border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 px-12 py-6 rounded-2xl backdrop-blur-sm text-xl"
                >
                  <Target className="w-8 h-8 mr-3" />
                  See Games
                </Button>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Licensed & Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00d4ff]" />
                  <span>50K+ Players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span>$5M+ Paid</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Card */}
            <motion.div {...slideInRight} className="relative">
              <div className="relative">
                <motion.div
                  animate={{
                    rotateY: [0, 5, 0, -5, 0],
                    rotateX: [0, 2, 0, -2, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-gradient-to-br from-[#1a2c38] via-[#0f1419] to-[#1a2c38] rounded-3xl p-8 border-2 border-[#00d4ff]/40 shadow-2xl shadow-[#00d4ff]/20"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full mx-auto mb-6 flex items-center justify-center"
                    >
                      <Crown className="w-10 h-10 text-black" />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-4 text-white">Weekly Sweepstakes</h3>
                    <div className="text-6xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text mb-4">
                      $100K
                    </div>
                    <p className="text-gray-300 mb-6">Earn tickets with every game you play</p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/30">
                        <div className="text-yellow-400 text-sm font-semibold">1st Place</div>
                        <div className="text-lg font-bold text-white">$50K</div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm rounded-xl p-3 border border-gray-400/30">
                        <div className="text-gray-400 text-sm font-semibold">2nd Place</div>
                        <div className="text-lg font-bold text-white">$25K</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-3 border border-orange-500/30">
                        <div className="text-orange-400 text-sm font-semibold">3rd Place</div>
                        <div className="text-lg font-bold text-white">$15K</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSignupModal(true)}
                      className="w-full bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-bold py-3 rounded-xl shadow-lg shadow-[#00d4ff]/25"
                    >
                      Enter Sweepstakes
                    </Button>
                  </div>
                </motion.div>

                {/* Floating Prize Elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 shadow-lg"
                >
                  <Coins className="w-6 h-6 text-white" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -3, 0, 3, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full p-3 shadow-lg"
                >
                  <Diamond className="w-6 h-6 text-black" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default LandingPage