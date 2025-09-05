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
  const { setAuthModal } = useUIStore()
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">

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
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl"
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
          className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
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
          className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"
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
                <span className="text-sm font-medium">ðŸŽ‰ FREE to Play, REAL to Win</span>
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
                  onClick={() => setAuthModal(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-2xl shadow-cyan-500/25 transform hover:scale-105 transition-all duration-200"
                >
                  <Rocket className="w-6 h-6 mr-2" />
                  Start FREE Now
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl backdrop-blur-sm"
                >
                  <Target className="w-6 h-6 mr-2" />
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
                  <Users className="w-4 h-4 text-cyan-400" />
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
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center"
                    >
                      <Crown className="w-10 h-10 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-4 text-white">Weekly Sweepstakes</h3>
                    <div className="text-6xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text mb-4">
                      $100K
                    </div>
                    <p className="text-gray-300 mb-6">Earn tickets with every game you play</p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/30 rounded-xl p-3">
                        <div className="text-2xl font-bold text-cyan-400">1st</div>
                        <div className="text-sm text-gray-400">$50,000</div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3">
                        <div className="text-2xl font-bold text-cyan-400">2nd</div>
                        <div className="text-sm text-gray-400">$25,000</div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3">
                        <div className="text-2xl font-bold text-cyan-400">3rd</div>
                        <div className="text-sm text-gray-400">$15,000</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setAuthModal(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl"
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
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-3 shadow-lg"
                >
                  <Diamond className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Card Layout */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              {...bounceIn}
              className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-cyan-400/30"
            >
              <span className="text-cyan-300 font-semibold">âœ¨ Why Choose EDGE ORIGINALS</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              The Ultimate FREE Gaming Experience
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join millions of players in the most exciting sweepstakes gaming platform ever created
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Flame className="w-12 h-12" />,
                title: "100% FREE to Play",
                description: "No credit card required. No subscriptions. Just pure gaming excitement.",
                gradient: "from-red-500 to-orange-500",
                bgGradient: "from-red-500/10 to-orange-500/10"
              },
              {
                icon: <Trophy className="w-12 h-12" />,
                title: "$100K Weekly Jackpots",
                description: "Earn raffle tickets with every game and compete for massive cash prizes.",
                gradient: "from-yellow-500 to-orange-500",
                bgGradient: "from-yellow-500/10 to-orange-500/10"
              },
              {
                icon: <Target className="w-12 h-12" />,
                title: "Skill-Based Gaming",
                description: "Master strategy games like MINES and HILO for better winning chances.",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-500/10 to-cyan-500/10"
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "Social Competition",
                description: "Climb leaderboards, share achievements, and compete with friends.",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-500/10 to-pink-500/10"
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: "Provably Fair",
                description: "Every game result is mathematically verified and cryptographically secure.",
                gradient: "from-green-500 to-teal-500",
                bgGradient: "from-green-500/10 to-teal-500/10"
              },
              {
                icon: <Rocket className="w-12 h-12" />,
                title: "Instant Wins",
                description: "Win instantly in games or save entries for progressive jackpot drawings.",
                gradient: "from-indigo-500 to-purple-500",
                bgGradient: "from-indigo-500/10 to-purple-500/10"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                className={`relative group bg-gradient-to-br ${feature.bgGradient} backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-white/10`}
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Games Showcase - Horizontal Scrolling */}
      <section className="py-20 px-4 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              {...bounceIn}
              className="inline-block bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-pink-400/30"
            >
              <span className="text-pink-300 font-semibold">ðŸŽ® 8 Original Games</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
              Play FREE, Win BIG
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every game earns you sweepstakes entries. No purchase necessary, just pure gaming fun.
            </p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                name: "DICE",
                players: "2,068",
                desc: "FREE dice rolls â€¢ Earn entries instantly",
                icon: "ðŸŽ²",
                color: "from-red-500 to-pink-500",
                bgColor: "bg-red-500/20"
              },
              {
                name: "CRASH",
                players: "1,547",
                desc: "Timing strategy â€¢ Cash out multiplier",
                icon: "ðŸ“ˆ",
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-500/20"
              },
              {
                name: "PLINKO",
                players: "892",
                desc: "Physics precision â€¢ High payout zones",
                icon: "âš½",
                color: "from-green-500 to-teal-500",
                bgColor: "bg-green-500/20"
              },
              {
                name: "MINES",
                players: "634",
                desc: "Risk strategy â€¢ Skill-based mining",
                icon: "ðŸ’Ž",
                color: "from-purple-500 to-indigo-500",
                bgColor: "bg-purple-500/20"
              },
              {
                name: "KENO",
                players: "1,047",
                desc: "Number selection â€¢ Pattern strategy",
                icon: "ðŸ”¢",
                color: "from-yellow-500 to-orange-500",
                bgColor: "bg-yellow-500/20"
              },
              {
                name: "WHEEL",
                players: "445",
                desc: "FREE spins â€¢ Instant big wins",
                icon: "ðŸŽ¡",
                color: "from-pink-500 to-rose-500",
                bgColor: "bg-pink-500/20"
              },
              {
                name: "HILO",
                players: "321",
                desc: "Card prediction â€¢ Memory strategy",
                icon: "ðŸƒ",
                color: "from-indigo-500 to-purple-500",
                bgColor: "bg-indigo-500/20"
              },
              {
                name: "LIMBO",
                players: "567",
                desc: "Target beating â€¢ Precision game",
                icon: "ðŸŽ¯",
                color: "from-cyan-500 to-blue-500",
                bgColor: "bg-cyan-500/20"
              }
            ].map((game, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                className={`relative group ${game.bgColor} backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer`}
              >
                <div className="text-center">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                    className="text-4xl mb-4"
                  >
                    {game.icon}
                  </motion.div>

                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">
                    {game.name}
                  </h3>

                  <div className="text-sm text-gray-400 mb-2">{game.players} playing now</div>

                  <p className="text-sm text-gray-300 leading-relaxed">
                    {game.desc}
                  </p>

                  <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats & Winners - Modern Dashboard Style */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              {...bounceIn}
              className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-cyan-400/30"
            >
              <span className="text-cyan-300 font-semibold">ðŸ“Š Real Results, Real Winners</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              Join the Winning Community
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our players are winning right now. Every win is real, every prize is paid.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Stats Cards */}
            <motion.div
              {...slideInLeft}
              className="lg:col-span-1"
            >
              <div className="space-y-6">
                {[
                  { number: "$5M+", label: "Total Prizes Paid", icon: <DollarSign className="w-6 h-6" />, color: "from-green-500 to-teal-500" },
                  { number: "50K+", label: "Active Players", icon: <Users className="w-6 h-6" />, color: "from-blue-500 to-cyan-500" },
                  { number: "8", label: "Original Games", icon: <Gamepad2 className="w-6 h-6" />, color: "from-purple-500 to-pink-500" },
                  { number: "$100K", label: "Weekly Raffle", icon: <Trophy className="w-6 h-6" />, color: "from-yellow-500 to-orange-500" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    {...fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                        <div className="text-gray-400 text-sm">{stat.label}</div>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <div className="text-white">
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Winners Feed */}
            <motion.div
              {...slideInRight}
              className="lg:col-span-2"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Recent Big Wins
                </h3>

                <div className="space-y-4">
                  {[
                    { player: "Alex_R", amount: "$2,500", game: "Weekly Raffle", time: "2 hours ago", avatar: "A" },
                    { player: "Sarah_K", amount: "$1,200", game: "PLINKO", time: "4 hours ago", avatar: "S" },
                    { player: "Mike_T", amount: "$850", game: "MINES", time: "6 hours ago", avatar: "M" },
                    { player: "Emma_L", amount: "$675", game: "KENO", time: "8 hours ago", avatar: "E" },
                    { player: "Jake_W", amount: "$1,800", game: "WHEEL", time: "12 hours ago", avatar: "J" }
                  ].map((winner, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                          {winner.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{winner.player}</div>
                          <div className="text-sm text-gray-400">{winner.game} â€¢ {winner.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                          {winner.amount}
                        </div>
                        <div className="text-xs text-gray-400">WINNING</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 text-center"
                >
                  <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-black/20 px-4 py-2 rounded-full">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>Updated live every minute</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Dramatic */}
      <section className="py-20 px-4 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
        {/* Dramatic background effects */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0"
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              {...bounceIn}
              className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-full px-8 py-3 mb-8 border border-cyan-400/30"
            >
              <span className="text-cyan-300 font-semibold text-lg">ðŸš€ Ready to Start Winning?</span>
            </motion.div>

            <motion.h2
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent"
            >
              JOIN THE
              <br />
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                REVOLUTION
              </span>
            </motion.h2>

            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              <span className="text-cyan-400 font-semibold">Play FREE</span> right now and start earning
              <span className="text-yellow-400 font-semibold"> real sweepstakes entries</span>.
              No credit card required. Your next big win could be just one game away.
            </motion.p>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            >
              <Button
                size="xl"
                onClick={() => setAuthModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-12 py-6 rounded-2xl shadow-2xl shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 text-xl"
              >
                <Rocket className="w-8 h-8 mr-3" />
                Start FREE Gaming Now
              </Button>

              <Button
                size="xl"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 rounded-2xl backdrop-blur-sm text-xl"
              >
                <Target className="w-8 h-8 mr-3" />
                See All Games
              </Button>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <Shield className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">100% FREE</h3>
                <p className="text-gray-400 text-sm">No purchase necessary</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">$100K Weekly</h3>
                <p className="text-gray-400 text-sm">Massive cash prizes</p>
              </div>

              <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <Heart className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Real Winners</h3>
                <p className="text-gray-400 text-sm">Every day, real prizes</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-black border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">EDGE ORIGINALS</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The future of social gaming with crypto-inspired sweepstakes,
                pack draws, loot boxes, and real-time gameplay.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-lg">ðŸ“˜</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-lg">ðŸ¦</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-lg">ðŸ’¬</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg">Games</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">DICE</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">CRASH</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">PLINKO</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">MINES</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">KENO</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">WHEEL</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/legal/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="/legal/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/legal/disclaimers" className="hover:text-cyan-400 transition-colors">Disclaimers</a></li>
                <li><a href="/legal/responsible-gaming" className="hover:text-cyan-400 transition-colors">Responsible Gaming</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/support" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>support@edgeoriginals.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>1-800-EDGE-GAME</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">
                &copy; 2024 EDGE ORIGINALS. All rights reserved. Must be 18+ to play. Play responsibly.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Licensed & Regulated
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Provably Fair
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  No Purchase Required
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4 text-center">
              This is a sweepstakes platform. No purchase necessary to enter or win.
              Odds of winning depend on number of eligible entries. See official rules for details.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
