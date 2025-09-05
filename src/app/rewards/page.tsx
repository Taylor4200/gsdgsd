'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Gift, 
  Star, 
  Award, 
  Clock, 
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Crown,
  Zap,
  Sparkles
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'

const RewardsPage = () => {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState('available')

  const rewardStats = {
    totalClaimed: 1850.00,
    available: 450.00,
    pending: 200.00,
    thisMonth: 650.00,
    totalRewards: 2300.00
  }

  const availableRewards = [
    {
      id: '1',
      title: 'Daily Login Bonus',
      description: '7-day login streak reward',
      amount: 100,
      type: 'bonus',
      expiresIn: '2 hours',
      icon: Gift,
      color: 'text-green-400'
    },
    {
      id: '2',
      title: 'Challenge Completion',
      description: 'Weekly challenge reward',
      amount: 250,
      type: 'challenge',
      expiresIn: '1 day',
      icon: Award,
      color: 'text-blue-400'
    },
    {
      id: '3',
      title: 'VIP Bonus',
      description: 'Silver VIP monthly bonus',
      amount: 100,
      type: 'vip',
      expiresIn: '3 days',
      icon: Crown,
      color: 'text-purple-400'
    }
  ]

  const claimedRewards = [
    {
      id: 'c1',
      title: 'Welcome Bonus',
      description: 'New player welcome bonus',
      amount: 500,
      type: 'welcome',
      claimedAt: new Date(Date.now() - 86400000),
      icon: Gift,
      color: 'text-green-400'
    },
    {
      id: 'c2',
      title: 'Referral Bonus',
      description: 'Friend referral reward',
      amount: 150,
      type: 'referral',
      claimedAt: new Date(Date.now() - 172800000),
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      id: 'c3',
      title: 'Daily Challenge',
      description: 'Daily challenge completion',
      amount: 75,
      type: 'challenge',
      claimedAt: new Date(Date.now() - 259200000),
      icon: Award,
      color: 'text-blue-400'
    },
    {
      id: 'c4',
      title: 'VIP Bonus',
      description: 'Bronze VIP monthly bonus',
      amount: 200,
      type: 'vip',
      claimedAt: new Date(Date.now() - 345600000),
      icon: Crown,
      color: 'text-purple-400'
    }
  ]

  const pendingRewards = [
    {
      id: 'p1',
      title: 'Weekly Challenge',
      description: 'Complete 15 daily challenges',
      amount: 300,
      type: 'challenge',
      progress: 12,
      maxProgress: 15,
      expiresIn: '2 days',
      icon: Award,
      color: 'text-blue-400'
    },
    {
      id: 'p2',
      title: 'VIP Upgrade',
      description: 'Reach Gold VIP status',
      amount: 500,
      type: 'vip',
      progress: 0,
      maxProgress: 1,
      expiresIn: '7 days',
      icon: Crown,
      color: 'text-yellow-400'
    }
  ]

  const rewardHistory = [
    {
      id: 'h1',
      title: 'Daily Login',
      amount: 50,
      date: new Date(Date.now() - 86400000),
      type: 'claimed'
    },
    {
      id: 'h2',
      title: 'Challenge Reward',
      amount: 100,
      date: new Date(Date.now() - 172800000),
      type: 'claimed'
    },
    {
      id: 'h3',
      title: 'VIP Bonus',
      amount: 200,
      date: new Date(Date.now() - 259200000),
      type: 'claimed'
    },
    {
      id: 'h4',
      title: 'Referral Bonus',
      amount: 150,
      date: new Date(Date.now() - 345600000),
      type: 'claimed'
    }
  ]

  const claimReward = (rewardId: string) => {
    console.log('Claiming reward:', rewardId)
    // Here you would integrate with your backend to claim the reward
  }

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'bonus':
        return 'bg-green-500'
      case 'challenge':
        return 'bg-blue-500'
      case 'vip':
        return 'bg-purple-500'
      case 'referral':
        return 'bg-yellow-500'
      case 'welcome':
        return 'bg-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getProgressColor = (progress: number, maxProgress: number) => {
    const percentage = (progress / maxProgress) * 100
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <CasinoLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Gift className="h-8 w-8 text-[#00d4ff]" />
              <h1 className="text-3xl font-bold text-white">Rewards Center</h1>
            </div>
            <p className="text-gray-400">Claim your rewards and track your earnings</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Gift className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(rewardStats.available, 'USD')}</div>
                <div className="text-sm text-gray-400">Available</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(rewardStats.pending, 'USD')}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(rewardStats.totalClaimed, 'USD')}</div>
                <div className="text-sm text-gray-400">Claimed</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(rewardStats.thisMonth, 'USD')}</div>
                <div className="text-sm text-gray-400">This Month</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(rewardStats.totalRewards, 'USD')}</div>
                <div className="text-sm text-gray-400">Total</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#1a2c38] rounded-lg p-1 mb-6">
            {[
              { id: 'available', label: 'Available', icon: Gift },
              { id: 'pending', label: 'Pending', icon: Clock },
              { id: 'claimed', label: 'Claimed', icon: CheckCircle },
              { id: 'history', label: 'History', icon: Calendar }
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

          {/* Available Rewards */}
          {activeTab === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card variant="glass" className="border-[#2d3748] h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <reward.icon className={`h-6 w-6 ${reward.color}`} />
                          <div>
                            <h3 className="text-lg font-bold text-white">{reward.title}</h3>
                            <p className="text-sm text-gray-400">{reward.description}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getRewardTypeColor(reward.type)}`} />
                      </div>

                      <div className="mb-4">
                        <div className="text-2xl font-bold text-[#00d4ff] mb-2">
                          {formatCurrency(reward.amount, 'USD')}
                        </div>
                        <div className="text-xs text-orange-400">
                          Expires in {reward.expiresIn}
                        </div>
                      </div>

                      <Button
                        variant="default"
                        className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                        onClick={() => claimReward(reward.id)}
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Claim Reward
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pending Rewards */}
          {activeTab === 'pending' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card variant="glass" className="border-[#2d3748] h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <reward.icon className={`h-6 w-6 ${reward.color}`} />
                          <div>
                            <h3 className="text-lg font-bold text-white">{reward.title}</h3>
                            <p className="text-sm text-gray-400">{reward.description}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getRewardTypeColor(reward.type)}`} />
                      </div>

                      <div className="mb-4">
                        <div className="text-2xl font-bold text-[#00d4ff] mb-2">
                          {formatCurrency(reward.amount, 'USD')}
                        </div>
                        <div className="text-xs text-orange-400 mb-2">
                          Expires in {reward.expiresIn}
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{reward.progress}/{reward.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(reward.progress, reward.maxProgress)}`}
                            style={{ width: `${(reward.progress / reward.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-[#2d3748]"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        In Progress
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Claimed Rewards */}
          {activeTab === 'claimed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimedRewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card variant="glass" className="border-[#2d3748] h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <reward.icon className={`h-6 w-6 ${reward.color}`} />
                          <div>
                            <h3 className="text-lg font-bold text-white">{reward.title}</h3>
                            <p className="text-sm text-gray-400">{reward.description}</p>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>

                      <div className="mb-4">
                        <div className="text-2xl font-bold text-[#00d4ff] mb-2">
                          {formatCurrency(reward.amount, 'USD')}
                        </div>
                        <div className="text-xs text-gray-400">
                          Claimed {reward.claimedAt.toLocaleDateString()}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-[#2d3748]"
                        disabled
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Claimed
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Reward History */}
          {activeTab === 'history' && (
            <Card variant="glass" className="border-[#2d3748]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Reward History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rewardHistory.map((reward) => (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                          <Gift className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{reward.title}</div>
                          <div className="text-xs text-gray-400">
                            {reward.date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#00d4ff]">
                          {formatCurrency(reward.amount, 'USD')}
                        </div>
                        <div className="text-xs text-green-400">Claimed</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CasinoLayout>
  )
}

export default RewardsPage
