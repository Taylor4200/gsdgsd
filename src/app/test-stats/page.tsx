'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ChatService } from '@/lib/chatService'

export default function StatsTestPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const chatService = ChatService.getInstance()
      const userStats = await chatService.getUserStats('test-user-123')
      console.log('Stats result:', userStats)
      setStats(userStats)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load stats')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Stats Test Page</h1>
        
        <div className="bg-[#1a2c38] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test User Stats Loading</h2>
          <Button
            onClick={testStats}
            disabled={isLoading}
            className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
          >
            {isLoading ? 'Loading...' : 'Test Stats'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-900 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {stats && (
          <div className="bg-[#1a2c38] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Loaded Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#2d3748] rounded-lg p-4">
                <div className="text-2xl font-bold text-white">${stats.totalWagered?.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Wagered</div>
              </div>
              <div className="bg-[#2d3748] rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{stats.totalBets?.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Bets</div>
              </div>
              <div className="bg-[#2d3748] rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{stats.totalWins?.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
              <div className="bg-[#2d3748] rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{stats.totalLosses?.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Losses</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              <pre className="bg-[#2d3748] p-4 rounded overflow-auto">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
