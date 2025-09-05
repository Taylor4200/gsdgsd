'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'

interface EmailVerificationReminderProps {
  isOpen: boolean
  onClose: () => void
  onResendEmail?: () => void
}

const EmailVerificationReminder: React.FC<EmailVerificationReminderProps> = ({ 
  isOpen, 
  onClose, 
  onResendEmail 
}) => {
  const { user } = useUserStore()
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    if (!onResendEmail) return
    
    setIsResending(true)
    try {
      await onResendEmail()
    } finally {
      setIsResending(false)
    }
  }

  if (!isOpen || user?.emailConfirmed) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-md bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Verify Your Email</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <Mail className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Welcome to the Casino! 🎰
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    To unlock all features and ensure your account security, please verify your email address.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">What happens next?</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Check your email for a verification link</li>
                    <li>• Click the link to verify your account</li>
                    <li>• Unlock full access to all games and features</li>
                    <li>• Enable withdrawals and real money features</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">Limited Access Mode</h4>
                  <p className="text-sm text-gray-300">
                    You can still browse games and play with demo coins, but some features are restricted until verification.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    variant="outline"
                    className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    {isResending ? 'Sending...' : 'Resend Email'}
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold"
                  >
                    Continue Browsing
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  You can verify your email later from your account settings.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default EmailVerificationReminder
