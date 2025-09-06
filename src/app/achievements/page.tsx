'use client'

import React from 'react'
import AchievementsList from '@/components/social/AchievementsList'
import { Card, CardContent } from '@/components/ui/Card'

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a2c38] to-[#0a0f1c] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-gray-400">Unlock achievements and earn rewards for your gaming milestones</p>
        </div>
        
        <Card className="bg-[#1a2c38]/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <AchievementsList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
