'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PrivacyNoticeProps {
  onDismiss: () => void
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-[#1a2c38] border border-[#00d4ff]/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-[#00d4ff] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-white font-medium mb-2">Live Feed Privacy</h4>
              <p className="text-sm text-gray-300 mb-3">
                Your betting activity may appear in the live feed. You can enable <strong>Ghost Mode</strong> in Settings to hide your activity from other players.
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Navigate to settings page
                    window.location.href = '/settings'
                  }}
                  className="text-xs border-[#00d4ff]/50 text-[#00d4ff] hover:bg-[#00d4ff]/10"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Settings
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PrivacyNotice
