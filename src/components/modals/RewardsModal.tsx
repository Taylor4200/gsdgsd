'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock, 
  Gift,
  Info,
  CheckCircle,
  Target,
  Star,
  Crown,
  Zap,
  Award,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { formatCurrency, formatTime } from '@/lib/utils'

interface RewardsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DailyReward {
  day: number
  reward: string
  amount: number
  claimed: boolean
  available: boolean
  isToday: boolean
  isFuture: boolean
}

interface RakebackPeriod {
  id: string
  period: string
  wagered: number
  rakeback: number
  rate: number
  claimed: boolean
  claimableAt: Date
}

const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState<'daily' | 'rakeback' | 'rewards' | 'info'>('daily')

  // Mock daily login rewards (7-day cycle)
  const dailyRewards: DailyReward[] = [
    { day: 1, reward: 'Free Spins', amount: 10, claimed: true, available: false, isToday: false, isFuture: false },
    { day: 2, reward: 'Bonus Coins', amount: 50, claimed: true, available: false, isToday: false, isFuture: false },
    { day: 3, reward: 'Free Spins', amount: 15, claimed: true, available: false, isToday: false, isFuture: false },
    { day: 4, reward: 'Bonus Coins', amount: 75, claimed: false, available: true, isToday: true, isFuture: false },
    { day: 5, reward: 'Free Spins', amount: 20, claimed: false, available: false, isToday: false, isFuture: true },
    { day: 6, reward: 'Bonus Coins', amount: 100, claimed: false, available: false, isToday: false, isFuture: true },
    { day: 7, reward: 'Spin Wheel', amount: 1, claimed: false, available: false, isToday: false, isFuture: true }
  ]

  // Mock rakeback data
  const currentRakeback = {
    instant: 12.50,
    weekly: 156.75,
    monthly: 642.30,
    lifetime: 2847.65,
    rate: 8, // 8% for Silver VIP
    nextClaim: new Date(Date.now() + 3600000) // 1 hour from now
  }

  const rakebackHistory: RakebackPeriod[] = [
    {
      id: '1',
      period: 'Today',
      wagered: 318.75,
      rakeback: 25.50,
      rate: 8,
      claimed: false,
      claimableAt: new Date(Date.now() + 3600000)
    },
    {
      id: '2',
      period: 'Yesterday',
      wagered: 425.00,
      rakeback: 34.00,
      rate: 8,
      claimed: true,
      claimableAt: new Date(Date.now() - 86400000)
    },
    {
      id: '3',
      period: 'Dec 15, 2024',
      wagered: 567.25,
      rakeback: 45.38,
      rate: 8,
      claimed: true,
      claimableAt: new Date(Date.now() - 172800000)
    },
    {
      id: '4',
      period: 'Dec 14, 2024',
      wagered: 234.50,
      rakeback: 18.76,
      rate: 8,
      claimed: true,
      claimableAt: new Date(Date.now() - 259200000)
    }
  ]

  const handleClaimDaily = (day: number) => {
    console.log('Claiming daily reward for day:', day)
  }

  const handleClaimRakeback = (periodId: string) => {
    console.log('Claiming rakeback for period:', periodId)
  }

  const handleSpinWheel = () => {
    console.log('Spinning the wheel!')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rewards Center"
      description="Claim your daily rewards and track your rakeback"
      size="lg"
      variant="glass"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Current VIP Status */}
        <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Silver VIP</h3>
          <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">{currentRakeback.rate}% Rakeback</div>
          <p className="text-gray-400 text-sm">Level 2 • Enhanced rewards unlocked</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap space-x-1 bg-[#1a2c38] rounded-lg p-1">
          {[
            { id: 'daily', label: 'Daily Login', icon: Calendar },
            { id: 'rakeback', label: 'Rakeback', icon: TrendingUp },
            { id: 'rewards', label: 'Rewards', icon: Gift },
            { id: 'info', label: 'How it Works', icon: Info }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-0 text-xs sm:text-sm ${
                activeTab === tab.id 
                  ? 'bg-[#00d4ff] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* Daily Login Calendar */}
            <Card variant="glass" className="border-[#2d3748]">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <Calendar className="h-5 w-5 mr-2" />
                  Daily Login Bonus Calendar
                </CardTitle>
                <p className="text-gray-400 text-sm">Login daily to unlock better rewards. Day 7 offers a free spin wheel!</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                  {dailyRewards.map((reward) => (
                    <motion.div
                      key={reward.day}
                      whileHover={{ scale: reward.available ? 1.05 : 1 }}
                      className={`relative p-2 sm:p-3 rounded-lg border-2 text-center ${
                        reward.claimed 
                          ? 'bg-green-500/20 border-green-500/50' 
                          : reward.available
                            ? 'bg-[#00d4ff]/20 border-[#00d4ff]/50 cursor-pointer'
                            : reward.isFuture
                              ? 'bg-gray-600/20 border-gray-600/50'
                              : 'bg-gray-700/20 border-gray-700/50'
                      }`}
                      onClick={() => reward.available && handleClaimDaily(reward.day)}
                    >
                      {reward.claimed && (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 absolute -top-1 -right-1" />
                      )}
                      {reward.available && (
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-[#00d4ff] absolute -top-1 -right-1 animate-pulse" />
                      )}
                      <div className="text-sm sm:text-lg font-bold text-white mb-1">Day {reward.day}</div>
                      <div className="text-xs text-gray-400 mb-1 hidden sm:block">{reward.reward}</div>
                      <div className="text-xs sm:text-sm font-bold text-[#00d4ff]">
                        {reward.reward === 'Spin Wheel' ? '🎰' : `+${reward.amount}`}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Current Day Info */}
                <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <h4 className="font-bold text-white">Today's Reward Available!</h4>
                      <p className="text-gray-400 text-sm">Day 4: {dailyRewards[3].reward} +{dailyRewards[3].amount}</p>
                    </div>
                    <Button 
                      onClick={() => handleClaimDaily(4)}
                      className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/80 w-full sm:w-auto"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Claim Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spin Wheel Preview */}
            <Card variant="glass" className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                    <div>
                      <h4 className="font-bold text-white">Day 7 Spin Wheel</h4>
                      <p className="text-sm text-gray-400">
                        Unlock the spin wheel on day 7 for massive rewards!
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-sm text-gray-400">Available in</div>
                    <div className="text-lg font-bold text-yellow-400">3 days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'rakeback' && (
          <div className="space-y-6">
            {/* Rakeback Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card variant="glass" className="border-[#2d3748] p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl font-bold text-green-400 mb-1">
                  {formatCurrency(currentRakeback.instant)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Instant</div>
              </Card>
              
              <Card variant="glass" className="border-[#2d3748] p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-400 mb-1">
                  ???
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Weekly</div>
              </Card>
              
              <Card variant="glass" className="border-[#2d3748] p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl font-bold text-purple-400 mb-1">
                  ???
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Monthly</div>
              </Card>
              
              <Card variant="glass" className="border-[#2d3748] p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl font-bold text-yellow-400 mb-1">
                  {formatCurrency(currentRakeback.lifetime)}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Lifetime</div>
              </Card>
            </div>

            {/* Claimable Rakeback */}
            <Card variant="glass" className="border-green-500/30 bg-green-500/5">
              <CardHeader className="p-4">
                <CardTitle className="text-green-400 flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Available to Claim
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {formatCurrency(currentRakeback.instant)}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Instant rakeback available now
                    </p>
                  </div>
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Claim Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rakeback History */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Recent Rakeback</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {rakebackHistory.map((period, index) => (
                  <motion.div
                    key={period.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="glass" className="border-[#2d3748]">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              period.claimed ? 'bg-green-400' : 'bg-yellow-400'
                            }`} />
                            <div>
                              <div className="font-medium text-white">{period.period}</div>
                              <div className="text-sm text-gray-400">
                                {formatCurrency(period.wagered)} wagered • {period.rate}% rate
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="text-right">
                              <div className="font-bold text-green-400">
                                {formatCurrency(period.rakeback)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatTime(period.claimableAt)}
                              </div>
                            </div>
                            
                            {period.claimed ? (
                              <div className="flex items-center text-green-400">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="text-sm">Claimed</span>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleClaimRakeback(period.id)}
                                disabled={period.claimableAt > new Date()}
                                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                              >
                                Claim
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Weekly & Monthly Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card variant="glass" className="border-blue-500/30 bg-blue-500/5">
                <CardHeader className="p-4">
                  <CardTitle className="text-blue-400 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Weekly Rakeback
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    ???
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Available every Sunday at 00:00 UTC
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 w-full"
                    disabled
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Available in 2 days
                  </Button>
                </CardContent>
              </Card>

              <Card variant="glass" className="border-purple-500/30 bg-purple-500/5">
                <CardHeader className="p-4">
                  <CardTitle className="text-purple-400 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Monthly Rakeback
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    ???
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Available on the 1st of each month
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 w-full"
                    disabled
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Available in 15 days
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* VIP Upgrade Prompt */}
            <Card variant="glass" className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                    <div>
                      <h4 className="font-bold text-white">Unlock Monthly Rakeback</h4>
                      <p className="text-sm text-gray-400">
                        Reach Gold VIP (50k XP) to unlock monthly rakeback rewards
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 w-full sm:w-auto">
                    Upgrade VIP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-4">
            <Card variant="glass" className="border-[#2d3748] p-4 sm:p-6">
              <h4 className="text-lg font-bold text-white mb-4">How Rewards Work</h4>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium text-white mb-1">Daily Login Rewards</h5>
                    <p className="text-sm">Login daily to claim increasing rewards. Day 7 offers a free spin wheel with massive prizes!</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium text-white mb-1">Instant Rakeback</h5>
                    <p className="text-sm">Claim your rakeback instantly after each gaming session. No waiting required!</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium text-white mb-1">Weekly & Monthly</h5>
                    <p className="text-sm">Weekly rewards every Sunday, monthly rewards on the 1st. Gold VIP+ unlocks monthly rewards.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="border-[#2d3748] p-4 sm:p-6">
              <h4 className="text-lg font-bold text-white mb-4">VIP Rakeback Rates</h4>
              <div className="space-y-3">
                {[
                  { tier: 'Bronze', instant: 'Small', weekly: '❌', monthly: '❌', color: 'text-orange-400' },
                  { tier: 'Silver', instant: 'Small', weekly: 'Small', monthly: '❌', color: 'text-gray-400' },
                  { tier: 'Gold', instant: 'Medium', weekly: 'Medium', monthly: 'Small', color: 'text-yellow-400' },
                  { tier: 'Platinum', instant: 'Medium', weekly: 'Medium', monthly: 'Medium', color: 'text-blue-400' },
                  { tier: 'Diamond', instant: 'High', weekly: 'High', monthly: 'Medium/High', color: 'text-purple-400' },
                  { tier: 'Elite', instant: 'Very High', weekly: 'High', monthly: 'High', color: 'text-pink-400' },
                  { tier: 'Legend', instant: 'Very High', weekly: 'Very High', monthly: 'Very High', color: 'text-red-400' }
                ].map((tier) => (
                  <div key={tier.tier} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-black/20 rounded-lg space-y-1 sm:space-y-0">
                    <span className={`font-medium ${tier.color}`}>{tier.tier}</span>
                    <div className="flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-4 text-sm">
                      <span className="text-gray-400">Instant: <span className="text-white">{tier.instant}</span></span>
                      <span className="text-gray-400">Weekly: <span className="text-white">{tier.weekly}</span></span>
                      <span className="text-gray-400">Monthly: <span className="text-white">{tier.monthly}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RewardsModal
