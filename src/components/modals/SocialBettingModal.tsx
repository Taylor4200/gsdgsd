'use client'

import React from 'react'
import { SocialModal } from './SocialModal'
import SocialBetting from '@/components/social/SocialBetting'

interface SocialBettingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SocialBettingModal: React.FC<SocialBettingModalProps> = ({ isOpen, onClose }) => {
  return (
    <SocialModal
      isOpen={isOpen}
      onClose={onClose}
      title="Social Betting"
    >
      <div className="space-y-4">
        <p className="text-gray-400 text-sm">
          Watch your friends play and cheer them on
        </p>
        <SocialBetting />
      </div>
    </SocialModal>
  )
}
