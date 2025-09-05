'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, Play } from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function FavoritesPage() {
  return (
    <CasinoLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-white">Favorites</h1>
          </div>
          <p className="text-gray-400">Your favorite games in one place</p>
        </div>

        <div className="text-center py-20">
          <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Favorites Yet</h3>
          <p className="text-gray-400 mb-6">
            Start playing games and add them to your favorites by clicking the heart icon.
          </p>
          <Button variant="default" className="bg-[#00d4ff] text-black">
            <Play className="h-4 w-4 mr-2" />
            Browse Games
          </Button>
        </div>
      </div>
    </CasinoLayout>
  )
}
