'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Trophy, Zap } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface Stat {
  icon: React.ReactNode
  label: string
  value: string
  change?: string
  color: string
}

const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Online Now',
      value: '8,432',
      change: '+12%',
      color: 'text-neon-blue'
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'Total Wagered',
      value: '$2.4M',
      change: '+8.2%',
      color: 'text-neon-green'
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      label: 'Biggest Win',
      value: '$127,834',
      change: 'New Record!',
      color: 'text-neon-yellow'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: 'Games Played',
      value: '45.2K',
      change: '+15.3%',
      color: 'text-neon-purple'
    }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => {
          if (stat.label === 'Online Now') {
            const currentValue = parseInt(stat.value.replace(',', ''))
            const change = Math.floor(Math.random() * 20) - 10
            const newValue = Math.max(1000, currentValue + change)
            return {
              ...stat,
              value: formatNumber(newValue)
            }
          }
          return stat
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-8 border-y border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-4 rounded-lg text-center hover:bg-white/10 transition-all duration-300"
            >
              <div className={`flex items-center justify-center mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold font-futuristic mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 mb-1">
                {stat.label}
              </div>
              {stat.change && (
                <div className="text-xs text-green-400">
                  {stat.change}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default StatsSection
