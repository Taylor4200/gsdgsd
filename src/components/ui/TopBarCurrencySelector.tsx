'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CurrencyDollarIcon, CurrencyDollarIcon as Coins, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'

interface TopBarCurrencySelectorProps {
  selectedCurrency: 'GC' | 'SC'
  onCurrencyChange: (currency: 'GC' | 'SC') => void
  className?: string
}

const TopBarCurrencySelector: React.FC<TopBarCurrencySelectorProps> = ({ 
  selectedCurrency, 
  onCurrencyChange, 
  className = '' 
}) => {
  const { user } = useUserStore()
  const [isOpen, setIsOpen] = useState(false)

  const getBalance = () => {
    if (!user) return 0
    return selectedCurrency === 'SC' ? (user.balance || 0) : (user.gcBalance || 0)
  }

  const getBalanceDisplay = () => {
    const balance = getBalance()
    if (selectedCurrency === 'SC') {
      return formatCurrency(balance)
    } else {
      return `${(balance || 0).toLocaleString()} GC`
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 md:space-x-2 text-white hover:bg-white/10 px-2 md:px-3 py-2 rounded-lg"
      >
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="flex items-center space-x-1">
            {selectedCurrency === 'SC' ? (
              <CurrencyDollarIcon className="h-3 w-3 md:h-4 md:w-4 text-[#00d4ff]" />
            ) : (
              <Coins className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
            )}
            <span className="text-xs md:text-sm font-medium">{getBalanceDisplay()}</span>
          </div>
          {isOpen ? (
            <ChevronUpIcon className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-3 w-3 text-gray-400" />
          )}
        </div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-40 md:w-48 bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-xl z-50"
          >
            <div className="p-2 space-y-1">
              {/* SC Option */}
              <button
                onClick={() => {
                  onCurrencyChange('SC')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-2 md:px-3 py-2 rounded text-xs md:text-sm transition-colors ${
                  selectedCurrency === 'SC' 
                    ? 'bg-[#00d4ff]/20 text-[#00d4ff]' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-3 w-3 md:h-4 md:w-4 text-[#00d4ff]" />
                  <span className="hidden sm:block">Sweeps Coins</span>
                  <span className="sm:hidden">SC</span>
                </div>
                <span className="text-xs">
                  {user ? formatCurrency(user.balance || 0) : '0.00'}
                </span>
              </button>

              {/* GC Option */}
              <button
                onClick={() => {
                  onCurrencyChange('GC')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-2 md:px-3 py-2 rounded text-xs md:text-sm transition-colors ${
                  selectedCurrency === 'GC' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Coins className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                  <span className="hidden sm:block">Gold Coins</span>
                  <span className="sm:hidden">GC</span>
                </div>
                <span className="text-xs">
                  {user ? `${(user.gcBalance || 0).toLocaleString()} GC` : '0 GC'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TopBarCurrencySelector
