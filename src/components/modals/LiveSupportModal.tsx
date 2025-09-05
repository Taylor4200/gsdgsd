'use client'

import React, { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'

interface LiveSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

const LiveSupportModal: React.FC<LiveSupportModalProps> = ({ isOpen, onClose }) => {
  const { showLiveSupportWidget } = useUserStore()

  // When this modal opens, it should trigger the live support widget
  useEffect(() => {
    if (isOpen) {
      showLiveSupportWidget()
      onClose() // Close this modal and show the widget instead
    }
  }, [isOpen, showLiveSupportWidget, onClose])

  // This modal doesn't render anything since we're using the widget
  return null
}

export default LiveSupportModal
