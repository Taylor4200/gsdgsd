'use client'

import React from 'react'
import { SocialModal } from './SocialModal'
import Leaderboards from '@/components/social/Leaderboards'

interface LeaderboardsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LeaderboardsModal: React.FC<LeaderboardsModalProps> = ({ isOpen, onClose }) => {
  return (
    <SocialModal
      isOpen={isOpen}
      onClose={onClose}
      title="Leaderboards"
    >
      <div className="space-y-4">
        <p className="text-gray-400 text-sm">
          Compete with other players and climb the rankings
        </p>
        <Leaderboards />
      </div>
    </SocialModal>
  )
}
