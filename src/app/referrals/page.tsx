'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Gift, 
  Copy, 
  Share2, 
  TrendingUp, 
  Award,
  UserPlus,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'

const ReferralsPage = () => {
  const { user } = useUserStore()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const referralCode = `NEXUS${user?.id.slice(-4)}`
  const referralLink = `https://nexuscasino.com/ref/${referralCode}`

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 2450.00,
    thisMonth: 450.00,
    pendingReferrals: 3
  }

  const referralHistory = [
    {
      id: '1',
      username: 'Player123',
      date: new Date(Date.now() - 86400000),
      status: 'active',
      earnings: 150.00,
      tier: 'silver'
    },
    {
      id: '2',
      username: 'Gambler456',
      date: new Date(Date.now() - 172800000),
      status: 'active',
      earnings: 200.00,
      tier: 'gold'
    },
    {
      id: '3',
      username: 'Lucky789',
      date: new Date(Date.now() - 259200000),
      status: 'pending',
      earnings: 0,
      tier: 'bronze'
    },
    {
      id: '4',
      username: 'Winner101',
      date: new Date(Date.now() - 345600000),
      status: 'active',
      earnings: 300.00,
      tier: 'platinum'
    }
  ]

  const referralRewards = [
    {
      tier: 'Bronze',
      requirement: '1 referral',
      reward: '$50 bonus',
      color: 'text-amber-500'
    },
    {
      tier: 'Silver',
      requirement: '5 referrals',
      reward: '$250 bonus',
      color: 'text-gray-400'
    },
    {
      tier: 'Gold',
      requirement: '10 referrals',
      reward: '$500 bonus',
      color: 'text-yellow-500'
    },
    {
      tier: 'Platinum',
      requirement: '25 referrals',
      reward: '$1000 bonus',
      color: 'text-purple-400'
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Nexus Casino',
        text: `Join me at Nexus Casino and get exclusive bonuses! Use my referral code: ${referralCode}`,
        url: referralLink
      })
    } else {
      copyToClipboard()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-amber-500'
      case 'silver':
        return 'text-gray-400'
      case 'gold':
        return 'text-yellow-500'
      case 'platinum':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <CasinoLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-8 w-8 text-[#00d4ff]" />
              <h1 className="text-3xl font-bold text-white">Referral Program</h1>
            </div>
            <p className="text-gray-400">Invite friends and earn rewards together</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-[#00d4ff] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
                <div className="text-sm text-gray-400">Total Referrals</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <UserPlus className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{referralStats.activeReferrals}</div>
                <div className="text-sm text-gray-400">Active Referrals</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(referralStats.totalEarnings, 'USD')}</div>
                <div className="text-sm text-gray-400">Total Earnings</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatCurrency(referralStats.thisMonth, 'USD')}</div>
                <div className="text-sm text-gray-400">This Month</div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-[#2d3748]">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{referralStats.pendingReferrals}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Referral Link Card */}
            <div className="lg:col-span-1">
              <Card variant="glass" className="border-[#2d3748]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Your Referral Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-black/20 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Referral Code</div>
                    <div className="text-lg font-mono text-white">{referralCode}</div>
                  </div>

                  <div className="p-3 bg-black/20 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Referral Link</div>
                    <div className="text-sm text-gray-300 break-all">{referralLink}</div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      onClick={copyToClipboard}
                      className="flex-1 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={shareReferral}
                      className="border-[#2d3748]"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-r from-[#00d4ff]/10 to-purple-600/10 rounded-lg border border-[#00d4ff]/30">
                    <div className="text-2xl font-bold text-[#00d4ff] mb-2">40% Commission</div>
                    <div className="text-sm text-gray-400">Earn 40% of your referrals' losses</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral History */}
            <div className="lg:col-span-2">
              <Card variant="glass" className="border-[#2d3748]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Referral History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralHistory.map((referral) => (
                      <motion.div
                        key={referral.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{referral.username}</div>
                            <div className="text-xs text-gray-400">
                              Joined {referral.date.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getStatusColor(referral.status)}`}>
                              {referral.status === 'active' ? (
                                <span className="flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {referral.earnings > 0 ? `Earned ${formatCurrency(referral.earnings, 'USD')}` : 'No earnings yet'}
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${getTierColor(referral.tier)}`}>
                            <Star className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rewards Tiers */}
          <div className="mt-8">
            <Card variant="glass" className="border-[#2d3748]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Referral Rewards Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {referralRewards.map((reward, index) => (
                    <motion.div
                      key={reward.tier}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-black/20 rounded-lg border border-[#2d3748] hover:border-[#00d4ff]/50 transition-colors"
                    >
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${reward.color} mb-2`}>{reward.tier}</div>
                        <div className="text-sm text-gray-400 mb-2">{reward.requirement}</div>
                        <div className="text-lg font-bold text-white">{reward.reward}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CasinoLayout>
  )
}

export default ReferralsPage
