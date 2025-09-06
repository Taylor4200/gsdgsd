'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Target,
  Calendar,
  Users,
  Award,
  Zap,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { LeaderboardEntry } from '@/types/social'
import { formatTime, formatCurrency } from '@/lib/utils'

interface LeaderboardsProps {
  onUserClick?: (userId: string) => void
}

const Leaderboards: React.FC<LeaderboardsProps> = ({ onUserClick }) => {
  const { leaderboards } = useUserStore()
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('daily')
  const [activeMetric, setActiveMetric] = useState<'total_wagered' | 'total_won' | 'games_played' | 'win_rate' | 'biggest_win'>('total_wagered')

  const periods = [
    { id: 'daily', name: 'Daily', icon: Calendar },
    { id: 'weekly', name: 'Weekly', icon: Calendar },
    { id: 'monthly', name: 'Monthly', icon: Calendar },
    { id: 'all_time', name: 'All Time', icon: Trophy }
  ]

  const metrics = [
    { id: 'total_wagered', name: 'Total Wagered', icon: DollarSign },
    { id: 'total_won', name: 'Total Won', icon: TrendingUp },
    { id: 'games_played', name: 'Games Played', icon: Target },
    { id: 'win_rate', name: 'Win Rate', icon: BarChart3 },
    { id: 'biggest_win', name: 'Biggest Win', icon: Zap }
  ]

  const filteredLeaderboard = leaderboards.filter(
    entry => entry.period === activePeriod && entry.metric === activeMetric
  ).sort((a, b) => b.value - a.value)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-400" />
      case 2: return <Medal className="h-5 w-5 text-gray-300" />
      case 3: return <Medal className="h-5 w-5 text-orange-400" />
      default: return <span className="text-sm font-bold text-gray-400">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-gray-300'
      case 3: return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'total_wagered':
      case 'total_won':
      case 'biggest_win':
        return formatCurrency(value)
      case 'win_rate':
        return `${value.toFixed(1)}%`
      case 'games_played':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-[#00d4ff]" />
            Leaderboards
          </h3>
        </div>

        {/* Period Tabs */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-400 mb-2 block">Time Period</label>
          <div className="flex space-x-2">
            {periods.map((period) => (
              <Button
                key={period.id}
                size="sm"
                variant={activePeriod === period.id ? "default" : "ghost"}
                onClick={() => setActivePeriod(period.id as any)}
                className={`flex items-center ${
                  activePeriod === period.id 
                    ? 'bg-[#00d4ff] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <period.icon className="h-4 w-4 mr-1" />
                {period.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Metric Tabs */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Metric</label>
          <div className="flex space-x-2 flex-wrap">
            {metrics.map((metric) => (
              <Button
                key={metric.id}
                size="sm"
                variant={activeMetric === metric.id ? "default" : "ghost"}
                onClick={() => setActiveMetric(metric.id as any)}
                className={`flex items-center ${
                  activeMetric === metric.id 
                    ? 'bg-[#00d4ff] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <metric.icon className="h-4 w-4 mr-1" />
                {metric.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredLeaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No data available</p>
            <p className="text-sm">Check back later for leaderboard updates!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Top 3 Podium */}
            {filteredLeaderboard.slice(0, 3).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Top Performers</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredLeaderboard.slice(0, 3).map((entry, index) => (
                    <PodiumCard
                      key={entry.id}
                      entry={entry}
                      rank={index + 1}
                      onClick={() => onUserClick?.(entry.user_id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Full Leaderboard</h4>
              <div className="space-y-1">
                {filteredLeaderboard.map((entry, index) => (
                  <LeaderboardEntryCard
                    key={entry.id}
                    entry={entry}
                    rank={index + 1}
                    onClick={() => onUserClick?.(entry.user_id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PodiumCardProps {
  entry: LeaderboardEntry
  rank: number
  onClick?: () => void
}

const PodiumCard: React.FC<PodiumCardProps> = ({ entry, rank, onClick }) => {
  const profile = entry.user_profile
  if (!profile) return null

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600'
      case 2: return 'from-gray-300 to-gray-500'
      case 3: return 'from-orange-400 to-orange-600'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6" />
      case 2: return <Medal className="h-6 w-6" />
      case 3: return <Medal className="h-6 w-6" />
      default: return <Award className="h-6 w-6" />
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative"
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 bg-gradient-to-b ${getRankColor(rank)} border-2 border-white/20`}
        onClick={onClick}
      >
        <CardContent className="p-4 text-center">
          {/* Rank Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-b ${getRankColor(rank)} flex items-center justify-center border-2 border-white/20`}>
              <span className="text-white font-bold text-sm">#{rank}</span>
            </div>
          </div>

          {/* Avatar */}
          <div className="mt-4 mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <h4 className="text-white font-medium text-sm truncate">
              {profile.username}
            </h4>
            <p className="text-white/80 text-xs">
              Level {profile.level}
            </p>
            <p className="text-white font-bold text-lg">
              {formatValue(entry.value, entry.metric)}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface LeaderboardEntryCardProps {
  entry: LeaderboardEntry
  rank: number
  onClick?: () => void
}

const LeaderboardEntryCard: React.FC<LeaderboardEntryCardProps> = ({ entry, rank, onClick }) => {
  const profile = entry.user_profile
  if (!profile) return null

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-4 w-4 text-yellow-400" />
      case 2: return <Medal className="h-4 w-4 text-gray-300" />
      case 3: return <Medal className="h-4 w-4 text-orange-400" />
      default: return <span className="text-sm font-bold text-gray-400">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-gray-300'
      case 3: return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'total_wagered':
      case 'total_won':
      case 'biggest_win':
        return formatCurrency(value)
      case 'win_rate':
        return `${value.toFixed(1)}%`
      case 'games_played':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
    >
      <Card 
        className="cursor-pointer transition-all duration-200 bg-[#1a2c38] border-[#2d3748] hover:border-[#00d4ff]/50"
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Rank */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                rank <= 3 ? 'bg-gradient-to-b from-[#00d4ff] to-[#0099cc]' : 'bg-gray-600'
              }`}>
                {getRankIcon(rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium truncate">
                    {profile.username}
                  </h4>
                  {profile.vip_tier && (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>Level {profile.level}</span>
                  <span>•</span>
                  <span>{profile.is_online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>

            {/* Value */}
            <div className="text-right">
              <div className={`text-lg font-bold ${getRankColor(rank)}`}>
                {formatValue(entry.value, entry.metric)}
              </div>
              <div className="text-xs text-gray-400">
                {entry.metric.replace('_', ' ')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Leaderboards
