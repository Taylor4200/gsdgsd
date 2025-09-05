'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import GameCard from '@/components/ui/GameCard'
import { getFeaturedGames } from '@/lib/gameData'

const FeaturedGames: React.FC = () => {
  const featuredGames = getFeaturedGames()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-futuristic mb-4">
            <span className="neon-text-blue">FEATURED</span>{' '}
            <span className="text-white">GAMES</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience our most popular games with cutting-edge graphics and massive jackpots
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredGames.map((game) => (
            <motion.div
              key={game.id}
              variants={itemVariants}
            >
              <GameCard 
                game={game} 
                variant="featured"
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="px-8">
            View All Games
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedGames



