'use client'

import React from 'react'
import { SocialModal } from './SocialModal'
import FriendsList from '@/components/social/FriendsList'

interface FriendsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose }) => {
  return (
    <SocialModal
      isOpen={isOpen}
      onClose={onClose}
      title="Friends"
    >
      <div className="space-y-4">
        <p className="text-gray-400 text-sm">
          Connect with other players and build your social network
        </p>
        <FriendsList />
      </div>
    </SocialModal>
  )
}
