export interface VIPTier {
  id: string
  name: string
  level: number
  minXP: number
  color: string
  icon: string
  benefits: VIPBenefit[]
  instantRakeback: string
  weeklyRakeback: string
  monthlyRakeback: string
  gcBonus: string
  personalManager: boolean
  prioritySupport: boolean
}

export interface VIPBenefit {
  id: string
  type: 'rakeback' | 'bonus' | 'cashback' | 'exclusive' | 'support' | 'withdrawal' | 'gift' | 'daily' | 'weekly' | 'monthly' | 'gc'
  title: string
  description: string
  value?: string
  icon: string
}

export interface VIPProgress {
  currentTier: VIPTier
  nextTier?: VIPTier
  currentXP: number
  xpToNextTier: number
  progressPercentage: number
  monthlyRakeback: number
  lifetimeRakeback: number
}

export interface VIPReward {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'instant' | 'spin_wheel'
  title: string
  description: string
  amount: number
  currency: 'coins' | 'sweepstakes_coins'
  claimed: boolean
  availableAt: Date
  expiresAt?: Date
}
