'use client'

import React from 'react'
import { SocialModal } from './SocialModal'
import AchievementsList from '@/components/social/AchievementsList'

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  return (
    <SocialModal
      isOpen={isOpen}
      onClose={onClose}
      title="Achievements"
    >
      <div className="space-y-4">
        <p className="text-gray-400 text-sm">
          Unlock achievements and earn rewards for your gaming milestones
        </p>
        <AchievementsList />
      </div>
    </SocialModal>
  )
}
