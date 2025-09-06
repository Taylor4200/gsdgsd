'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Award, 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Target,
  CheckCircle,
  Lock,
  Gift,
  TrendingUp,
  Users,
  MessageCircle,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { UserAchievement, AchievementDefinition } from '@/types/social'
import { formatTime } from '@/lib/utils'

interface AchievementsListProps {
  onAchievementClick?: (achievement: UserAchievement) => void
}

const AchievementsList: React.FC<AchievementsListProps> = ({ onAchievementClick }) => {
  const { socialAchievements } = useUserStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All', icon: Award },
    { id: 'gaming', name: 'Gaming', icon: Target },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'vip', name: 'VIP', icon: Crown },
    { id: 'special', name: 'Special', icon: Star }
  ]

  const rarities = [
    { id: 'all', name: 'All', color: 'text-gray-400' },
    { id: 'common', name: 'Common', color: 'text-gray-300' },
    { id: 'rare', name: 'Rare', color: 'text-blue-400' },
    { id: 'epic', name: 'Epic', color: 'text-purple-400' },
    { id: 'legendary', name: 'Legendary', color: 'text-yellow-400' }
  ]

  const filteredAchievements = socialAchievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.achievement_rarity === selectedCategory
    const rarityMatch = selectedRarity === 'all' || achievement.achievement_rarity === selectedRarity
    return categoryMatch && rarityMatch
  })

  const achievementsByCategory = filteredAchievements.reduce((acc, achievement) => {
    const category = achievement.achievement_rarity
    if (!acc[category]) acc[category] = []
    acc[category].push(achievement)
    return acc
  }, {} as Record<string, UserAchievement[]>)

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Target className="h-4 w-4" />
      case 'rare': return <Star className="h-4 w-4" />
      case 'epic': return <Crown className="h-4 w-4" />
      case 'legendary': return <Trophy className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20'
      case 'rare': return 'bg-blue-500/20'
      case 'epic': return 'bg-purple-500/20'
      case 'legendary': return 'bg-yellow-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-[#00d4ff]" />
            Achievements ({socialAchievements.length})
          </h3>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Category</label>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  size="sm"
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center ${
                    selectedCategory === category.id 
                      ? 'bg-[#00d4ff] text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <category.icon className="h-4 w-4 mr-1" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Rarity</label>
            <div className="flex space-x-2">
              {rarities.map((rarity) => (
                <Button
                  key={rarity.id}
                  size="sm"
                  variant={selectedRarity === rarity.id ? "default" : "ghost"}
                  onClick={() => setSelectedRarity(rarity.id)}
                  className={`flex items-center ${
                    selectedRarity === rarity.id 
                      ? 'bg-[#00d4ff] text-black' 
                      : `${rarity.color} hover:text-white`
                  }`}
                >
                  {rarity.id !== 'all' && getRarityIcon(rarity.id)}
                  <span className="ml-1">{rarity.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(achievementsByCategory).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No achievements found</p>
            <p className="text-sm">Complete tasks to unlock achievements!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(achievementsByCategory).map(([rarity, achievements]) => (
              <div key={rarity}>
                <div className="flex items-center space-x-2 mb-4">
                  {getRarityIcon(rarity)}
                  <h4 className={`text-lg font-medium capitalize ${getRarityColor(rarity)}`}>
                    {rarity} Achievements ({achievements.length})
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onClick={() => onAchievementClick?.(achievement)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface AchievementCardProps {
  achievement: UserAchievement
  onClick?: () => void
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const progressPercentage = (achievement.progress / achievement.max_progress) * 100
  const isCompleted = achievement.is_completed

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Target className="h-6 w-6" />
      case 'rare': return <Star className="h-6 w-6" />
      case 'epic': return <Crown className="h-6 w-6" />
      case 'legendary': return <Trophy className="h-6 w-6" />
      default: return <Award className="h-6 w-6" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20'
      case 'rare': return 'bg-blue-500/20'
      case 'epic': return 'bg-purple-500/20'
      case 'legendary': return 'bg-yellow-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isCompleted 
            ? `${getRarityBgColor(achievement.achievement_rarity)} border-2 border-[#00d4ff]/50` 
            : 'bg-[#1a2c38] border-[#2d3748] hover:border-[#00d4ff]/30'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${getRarityBgColor(achievement.achievement_rarity)}`}>
              <div className={getRarityColor(achievement.achievement_rarity)}>
                {getRarityIcon(achievement.achievement_rarity)}
              </div>
            </div>
            
            {isCompleted && (
              <div className="flex items-center space-x-1 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-xs font-medium">Unlocked</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm">
              {achievement.achievement_name}
            </h4>
            
            <p className="text-xs text-gray-400 line-clamp-2">
              {achievement.achievement_description}
            </p>

            {/* Progress */}
            {!isCompleted && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.max_progress}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-[#00d4ff] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Unlocked Date */}
            {isCompleted && (
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>Unlocked {formatTime(achievement.unlocked_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AchievementsList
