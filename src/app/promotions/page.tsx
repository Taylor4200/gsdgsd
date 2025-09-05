'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Gift, Clock, Star, Users } from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PromotionsPage() {
  const promotions = [
    {
      id: '1',
      title: 'Welcome Bonus',
      description: 'Get 100% match on your first deposit up to $1,000',
      type: 'New Player',
      timeLeft: 'Permanent',
      color: 'from-green-600 to-blue-600'
    },
    {
      id: '2',
      title: 'Daily Reload',
      description: '25% bonus on deposits every day',
      type: 'Daily',
      timeLeft: '23h 45m',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: '3',
      title: 'Weekend Warrior',
      description: '50% bonus on weekend deposits',
      type: 'Weekend',
      timeLeft: '2d 14h',
      color: 'from-orange-600 to-red-600'
    }
  ]

  return (
    <CasinoLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Gift className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white">Promotions</h1>
          </div>
          <p className="text-gray-400">Exclusive bonuses and rewards</p>
        </div>

        <div className="space-y-6">
          {promotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" className="overflow-hidden border-[#2d3748]">
                <div className={`h-2 bg-gradient-to-r ${promo.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{promo.title}</h3>
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                          {promo.type}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4">{promo.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{promo.timeLeft}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6">
                      <Button variant="default" className="bg-[#00d4ff] text-black">
                        Claim Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </CasinoLayout>
  )
}
