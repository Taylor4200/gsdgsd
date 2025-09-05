'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ban, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface BanModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    userId: string
    username: string
  }
  onBan: (duration: string, reason: string) => void
}

const BanModal: React.FC<BanModalProps> = ({ isOpen, onClose, targetUser, onBan }) => {
  const [selectedDuration, setSelectedDuration] = useState('1hour')
  const [customDuration, setCustomDuration] = useState('')
  const [reason, setReason] = useState('')
  const [isBanning, setIsBanning] = useState(false)

  const durationOptions = [
    { value: '1hour', label: '1 Hour', hours: 1 },
    { value: '6hours', label: '6 Hours', hours: 6 },
    { value: '1day', label: '1 Day', hours: 24 },
    { value: '3days', label: '3 Days', hours: 72 },
    { value: '1week', label: '1 Week', hours: 168 },
    { value: '1month', label: '1 Month', hours: 720 },
    { value: 'permanent', label: 'Permanent', hours: 0 },
    { value: 'custom', label: 'Custom', hours: 0 }
  ]

  const handleBan = async () => {
    if (!reason.trim()) return
    
    setIsBanning(true)
    
    let duration = selectedDuration
    if (selectedDuration === 'custom') {
      duration = customDuration
    }
    
    await onBan(duration, reason.trim())
    setIsBanning(false)
  }

  const getDurationText = () => {
    if (selectedDuration === 'custom') {
      return customDuration || 'Custom duration'
    }
    const option = durationOptions.find(opt => opt.value === selectedDuration)
    return option?.label || 'Select duration'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a2c38] border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Ban className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Timeout User</h3>
                  <p className="text-sm text-gray-400">Timeout {targetUser.username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Clock className="h-4 w-4 inline mr-2" />
                Timeout Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={cn(
                      "p-3 text-sm rounded-lg border transition-colors",
                      selectedDuration === option.value
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Duration Input */}
              {selectedDuration === 'custom' && (
                <div className="mt-3">
                  <Input
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="e.g., 2hours, 5days, 1week"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Examples: 2hours, 5days, 1week, 2months
                  </p>
                </div>
              )}
            </div>

            {/* Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Reason for Timeout
              </label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for timeout..."
                className="bg-gray-800 border-gray-600 text-white"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/200 characters
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Timeout Summary</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p><span className="text-gray-300">User:</span> {targetUser.username}</p>
                <p><span className="text-gray-300">Duration:</span> {getDurationText()}</p>
                <p><span className="text-gray-300">Reason:</span> {reason || 'No reason provided'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 text-gray-400 hover:text-white"
                disabled={isBanning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBan}
                disabled={!reason.trim() || isBanning || (selectedDuration === 'custom' && !customDuration.trim())}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              >
                {isBanning ? 'Timing out...' : 'Timeout User'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default BanModal
