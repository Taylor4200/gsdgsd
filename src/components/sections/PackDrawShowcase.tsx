'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Gift, Sparkles, Star, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency, getRarityColor, getRarityGradient } from '@/lib/utils'

interface PackDraw {
  id: string
  name: string
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  description: string
  items: number
  topPrize: number
  image: string
  isLimited?: boolean
  timeLeft?: string
}

const PackDrawShowcase: React.FC = () => {
  const packs: PackDraw[] = [
    {
      id: '1',
      name: 'Neon Genesis Pack',
      price: 10,
      rarity: 'epic',
      description: 'Cyberpunk-themed rewards with neon aesthetics',
      items: 5,
      topPrize: 5000,
      image: '/images/packs/neon-genesis.jpg',
      isLimited: true,
      timeLeft: '2d 14h'
    },
    {
      id: '2',
      name: 'Quantum Treasure',
      price: 25,
      rarity: 'legendary',
      description: 'High-tech rewards from the quantum realm',
      items: 7,
      topPrize: 15000,
      image: '/images/packs/quantum-treasure.jpg'
    },
    {
      id: '3',
      name: 'Cosmic Mystery',
      price: 50,
      rarity: 'mythic',
      description: 'Rare cosmic artifacts and massive rewards',
      items: 10,
      topPrize: 50000,
      image: '/images/packs/cosmic-mystery.jpg',
      isLimited: true,
      timeLeft: '6h 23m'
    }
  ]

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="h-4 w-4" />
      case 'mythic':
        return <Sparkles className="h-4 w-4" />
      case 'epic':
        return <Star className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
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
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-pink/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-futuristic mb-4">
            <span className="neon-text-purple">PACK</span>{' '}
            <span className="text-white">DRAWS</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Open mystery packs filled with coins, bonuses, and exclusive rewards. 
            Each pack contains guaranteed prizes with chances for legendary items!
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {packs.map((pack) => (
            <motion.div
              key={pack.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="group perspective-1000"
            >
              <Card 
                variant="glass" 
                hover 
                className={`h-full overflow-hidden border-2 border-gradient-to-r ${getRarityGradient(pack.rarity)} relative`}
              >
                {/* Limited Badge */}
                {pack.isLimited && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      LIMITED
                    </div>
                  </div>
                )}

                {/* Time Left Badge */}
                {pack.timeLeft && (
                  <div className="absolute top-4 left-4 z-20">
                    <div className="glass text-white text-xs px-2 py-1 rounded-full">
                      {pack.timeLeft}
                    </div>
                  </div>
                )}

                <div className="relative">
                  {/* Pack Image/Animation */}
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(pack.rarity)} opacity-20`} />
                    
                    {/* Animated Pack Visual */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className={`w-32 h-40 bg-gradient-to-b ${getRarityGradient(pack.rarity)} rounded-lg shadow-2xl flex items-center justify-center`}
                      >
                        <div className="text-white text-4xl">
                          {getRarityIcon(pack.rarity)}
                        </div>
                      </motion.div>
                    </div>

                    {/* Sparkle Effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">{pack.name}</h3>
                        <div 
                          className={`flex items-center text-sm px-2 py-1 rounded-full`}
                          style={{ 
                            backgroundColor: getRarityColor(pack.rarity) + '20',
                            color: getRarityColor(pack.rarity)
                          }}
                        >
                          {getRarityIcon(pack.rarity)}
                          <span className="ml-1 capitalize">{pack.rarity}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">{pack.description}</p>
                    </div>

                    {/* Pack Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Price</span>
                        <span className="text-lg font-bold text-neon-blue">
                          {formatCurrency(pack.price, 'coins')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Items</span>
                        <span className="text-sm font-bold text-white">
                          {pack.items} guaranteed
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Top Prize</span>
                        <span className="text-sm font-bold text-neon-yellow">
                          {formatCurrency(pack.topPrize, 'coins')}
                        </span>
                      </div>
                    </div>

                    {/* Open Button */}
                    <Button 
                      variant="gradient" 
                      className="w-full"
                      icon={<Gift className="h-4 w-4" />}
                    >
                      OPEN PACK
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="px-8">
            View All Pack Draws
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default PackDrawShowcase
