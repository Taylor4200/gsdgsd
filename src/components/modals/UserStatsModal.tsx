'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, Wallet, Eye, ChevronDown, Star, DollarSign, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface UserStats {
  username: string
  joinedDate: string
  totalBets: number
  wins: number
  losses: number
  wagered: number
  isVIP?: boolean
}

interface UserStatsModalProps {
  isOpen: boolean
  onClose: () => void
  userStats: UserStats
}

const UserStatsModal: React.FC<UserStatsModalProps> = ({ isOpen, onClose, userStats }) => {
  const [typeFilter, setTypeFilter] = useState('All')
  const [currencyFilter, setCurrencyFilter] = useState('All')

  const stats = [
    {
      label: 'Total Bets',
      value: formatNumber(userStats.totalBets),
      color: 'text-blue-400'
    },
    {
      label: 'Number of Wins',
      value: formatNumber(userStats.wins),
      color: 'text-green-400'
    },
    {
      label: 'Number of Losses',
      value: formatNumber(userStats.losses),
      color: 'text-red-400'
    },
    {
      label: 'Wagered',
      value: formatCurrency(userStats.wagered, 'USD'),
      color: 'text-yellow-400',
      icon: <DollarSign className="h-4 w-4 text-green-400" />
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
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
              <div className="flex items-center justify-between p-4 border-b border-[#2d3748]">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-[#00d4ff]" />
                  <h2 className="text-lg font-semibold text-white">Statistics</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-[#2d3748]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{userStats.username}</h3>
                  {userStats.isVIP && (
                    <Star className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <p className="text-gray-400 text-sm">Joined on {userStats.joinedDate}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 p-4 border-b border-[#2d3748]">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Tip</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-gray-600 text-gray-400 hover:bg-gray-600/10"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ignore</span>
                </Button>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-[#2d3748]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                    <div className="relative">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer"
                      >
                        <option value="All">All</option>
                        <option value="Wins">Wins</option>
                        <option value="Losses">Losses</option>
                        <option value="Bets">Bets</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
                    <div className="relative">
                      <select
                        value={currencyFilter}
                        onChange={(e) => setCurrencyFilter(e.target.value)}
                        className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer"
                      >
                        <option value="All">All</option>
                        <option value="USD">USD</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-[#2d3748] rounded-lg p-4 text-center"
                    >
                      <div className={`text-2xl font-bold ${stat.color} flex items-center justify-center space-x-1`}>
                        {stat.value}
                        {stat.icon && stat.icon}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 flex items-center justify-center space-x-1">
                        {stat.label}
                        {stat.label === 'Wagered' && <Info className="h-3 w-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default UserStatsModal
