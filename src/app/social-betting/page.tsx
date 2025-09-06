'use client'

import React from 'react'
import SocialBetting from '@/components/social/SocialBetting'
import { Card, CardContent } from '@/components/ui/Card'

export default function SocialBettingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a2c38] to-[#0a0f1c] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Social Betting</h1>
          <p className="text-gray-400">Watch your friends play and cheer them on</p>
        </div>
        
        <Card className="bg-[#1a2c38]/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <SocialBetting />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
