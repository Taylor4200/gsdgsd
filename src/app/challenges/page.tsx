'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Play,
  Gift,
  Zap,
  DollarSign,
  Crown
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'

const ChallengesPage = () => {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState('daily')

  const challengeStats = {
    completed: 24,
    inProgress: 3,
    totalRewards: 1250.00,
    thisWeek: 350.00,
    streak: 7
  }

  const dailyChallenges = [
    {
      id: '1',
      title: 'Daily Login',
      description: 'Log in to your account today',
      reward: 50,
      progress: 1,
      maxProgress: 1,
      status: 'completed',
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      id: '2',
      title: 'Win Streak',
      description: 'Win 3 games in a row',
      reward: 100,
      progress: 2,
      maxProgress: 3,
      status: 'in-progress',
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    {
      id: '3',
      title: 'High Roller',
      description: 'Place a bet of $100 or more',
      reward: 200,
      progress: 0,
      maxProgress: 1,
      status: 'locked',
      icon: DollarSign,
      color: 'text-yellow-400'
    },
    {
      id: '4',
      title: 'Slot Master',
      description: 'Play 10 slot games',
      reward: 75,
      progress: 7,
      maxProgress: 10,
      status: 'in-progress',
      icon: Play,
      color: 'text-purple-400'
    }
  ]

  const weeklyChallenges = [
    {
      id: 'w1',
      title: 'Weekly Warrior',
      description: 'Complete 20 daily challenges',
      reward: 500,
      progress: 15,
      maxProgress: 20,
      status: 'in-progress',
      icon: Trophy,
      color: 'text-yellow-500',
      timeLeft: '3 days left'
    },
    {
      id: 'w2',
      title: 'Big Spender',
      description: 'Wager $10,000 this week',
      reward: 1000,
      progress: 6500,
      maxProgress: 10000,
      status: 'in-progress',
      icon: TrendingUp,
      color: 'text-green-500',
      timeLeft: '3 days left'
    },
    {
      id: 'w3',
      title: 'Lucky Streak',
      description: 'Win 50 games this week',
      reward: 750,
      progress: 32,
      maxProgress: 50,
      status: 'in-progress',
      icon: Star,
      color: 'text-purple-500',
      timeLeft: '3 days left'
    }
  ]

  const specialChallenges = [
    {
      id: 's1',
      title: 'Jackpot Hunter',
      description: 'Hit a jackpot of $10,000 or more',
      reward: 5000,
      progress: 0,
      maxProgress: 1,
      status: 'locked',
      icon: Gift,
      color: 'text-red-500',
      timeLeft: 'Limited time'
    },
    {
      id: 's2',
      title: 'VIP Challenge',
      description: 'Reach VIP Platinum status',
      reward: 2500,
      progress: 0,
      maxProgress: 1,
      status: 'locked',
      icon: Crown,
      color: 'text-purple-500',
      timeLeft: 'Ongoing'
    }
  ]

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in-progress':
        return 'bg-blue-500'
      case 'locked':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-400" />
      case 'locked':
        return <XCircle className="h-5 w-5 text-gray-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const claimReward = (challengeId: string) => {
    console.log('Claiming reward for challenge:', challengeId)
    // Here you would integrate with your backend to claim the reward
  }

  return (
    <CasinoLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="h-8 w-8 text-[#00d4ff]" />
              <h1 className="text-3xl font-bold text-white">Challenges</h1>
            </div>
            <p className="text-gray-400">Complete challenges and earn rewards</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{challengeStats.completed}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{challengeStats.inProgress}</div>
                <div className="text-sm text-gray-400">In Progress</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(challengeStats.totalRewards, 'USD')}</div>
                <div className="text-sm text-gray-400">Total Rewards</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(challengeStats.thisWeek, 'USD')}</div>
                <div className="text-sm text-gray-400">This Week</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{challengeStats.streak}</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#1a2c38] rounded-lg p-1 mb-6">
            {[
              { id: 'daily', label: 'Daily', icon: Calendar },
              { id: 'weekly', label: 'Weekly', icon: Trophy },
              { id: 'special', label: 'Special', icon: Star }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 ${
                  activeTab === tab.id
                    ? 'bg-[#00d4ff] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Challenge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'daily' && dailyChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card variant="glass" className="border-[#2d3748] h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <challenge.icon className={`h-6 w-6 ${challenge.color}`} />
                        <div>
                          <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      {getStatusIcon(challenge.status)}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{challenge.progress}/{challenge.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(challenge.status)}`}
                          style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00d4ff]">{formatCurrency(challenge.reward, 'USD')}</div>
                        <div className="text-xs text-gray-400">Reward</div>
                      </div>
                      <Button
                        variant={challenge.status === 'completed' ? "default" : "outline"}
                        size="sm"
                        disabled={challenge.status !== 'completed'}
                        onClick={() => claimReward(challenge.id)}
                        className={
                          challenge.status === 'completed'
                            ? 'bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90'
                            : 'border-[#2d3748]'
                        }
                      >
                        {challenge.status === 'completed' ? 'Claim' : 'Locked'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {activeTab === 'weekly' && weeklyChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card variant="glass" className="border-[#2d3748] h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <challenge.icon className={`h-6 w-6 ${challenge.color}`} />
                        <div>
                          <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      {getStatusIcon(challenge.status)}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{challenge.progress}/{challenge.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(challenge.status)}`}
                          style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-orange-400 mt-1">{challenge.timeLeft}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00d4ff]">{formatCurrency(challenge.reward, 'USD')}</div>
                        <div className="text-xs text-gray-400">Reward</div>
                      </div>
                      <Button
                        variant={challenge.status === 'completed' ? "default" : "outline"}
                        size="sm"
                        disabled={challenge.status !== 'completed'}
                        onClick={() => claimReward(challenge.id)}
                        className={
                          challenge.status === 'completed'
                            ? 'bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90'
                            : 'border-[#2d3748]'
                        }
                      >
                        {challenge.status === 'completed' ? 'Claim' : 'In Progress'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {activeTab === 'special' && specialChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card variant="glass" className="border-[#2d3748] h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <challenge.icon className={`h-6 w-6 ${challenge.color}`} />
                        <div>
                          <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                      </div>
                      {getStatusIcon(challenge.status)}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{challenge.progress}/{challenge.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(challenge.status)}`}
                          style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-orange-400 mt-1">{challenge.timeLeft}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00d4ff]">{formatCurrency(challenge.reward, 'USD')}</div>
                        <div className="text-xs text-gray-400">Reward</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="border-[#2d3748]"
                      >
                        Locked
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </CasinoLayout>
  )
}

export default ChallengesPage
