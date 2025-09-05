'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { formatCurrency, formatTime } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { Transaction, TransactionType, TransactionStatus } from '@/types'
import WalletModal from '@/components/modals/WalletModal'

interface BalanceDropdownProps {
  isOpen: boolean
  onToggle: () => void
}

const BalanceDropdown: React.FC<BalanceDropdownProps> = ({ isOpen, onToggle }) => {
  const { user } = useUserStore()
  const [showBalance, setShowBalance] = useState(true)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      userId: 'user-1',
      type: TransactionType.WIN,
      amount: 2450.00,
      currency: 'coins',
      status: TransactionStatus.COMPLETED,
      gameId: 'sweet-bonanza',
      description: 'Win on Sweet Bonanza',
      timestamp: new Date(Date.now() - 300000),
      balanceAfter: 7450.00
    },
    {
      id: '2',
      userId: 'user-1',
      type: TransactionType.BET,
      amount: -100.00,
      currency: 'coins',
      status: TransactionStatus.COMPLETED,
      gameId: 'sweet-bonanza',
      description: 'Bet on Sweet Bonanza',
      timestamp: new Date(Date.now() - 600000),
      balanceAfter: 5000.00
    },
    {
      id: '3',
      userId: 'user-1',
      type: TransactionType.DEPOSIT,
      amount: 500.00,
      currency: 'coins',
      status: TransactionStatus.COMPLETED,
      description: 'Deposit via Credit Card',
      timestamp: new Date(Date.now() - 3600000),
      balanceAfter: 5100.00
    },
    {
      id: '4',
      userId: 'user-1',
      type: TransactionType.BONUS,
      amount: 250.00,
      currency: 'coins',
      status: TransactionStatus.COMPLETED,
      description: 'Daily Login Bonus',
      timestamp: new Date(Date.now() - 7200000),
      balanceAfter: 4600.00
    },
    {
      id: '5',
      userId: 'user-1',
      type: TransactionType.WITHDRAWAL,
      amount: -1000.00,
      currency: 'coins',
      status: TransactionStatus.PENDING,
      description: 'Withdrawal to Bank Account',
      timestamp: new Date(Date.now() - 10800000),
      balanceAfter: 4350.00
    }
  ])

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])

  const getTransactionIcon = (type: TransactionType, amount: number) => {
    if (amount > 0) {
      switch (type) {
        case TransactionType.WIN:
          return <TrendingUp className="h-4 w-4 text-green-500" />
        case TransactionType.DEPOSIT:
          return <Plus className="h-4 w-4 text-blue-500" />
        case TransactionType.BONUS:
          return <Plus className="h-4 w-4 text-purple-500" />
        default:
          return <Plus className="h-4 w-4 text-green-500" />
      }
    } else {
      switch (type) {
        case TransactionType.BET:
          return <Minus className="h-4 w-4 text-orange-500" />
        case TransactionType.WITHDRAWAL:
          return <TrendingDown className="h-4 w-4 text-red-500" />
        default:
          return <Minus className="h-4 w-4 text-red-500" />
      }
    }
  }

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'text-green-400'
      case TransactionStatus.PENDING:
        return 'text-yellow-400'
      case TransactionStatus.FAILED:
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (!user) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={onToggle} />
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Balance Display */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={onToggle}
          className="flex items-center space-x-2 bg-[#1a2c38] rounded-lg px-3 py-2 border border-[#2d3748] cursor-pointer hover:bg-[#2d3748] transition-colors"
        >
          <div className="text-right">
            <div className="text-xs text-gray-400">Balance</div>
            <div className="text-sm font-bold text-[#00d4ff]">
              {showBalance ? formatCurrency(user.balance, 'USD') : '****'}
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <Card variant="glass" className="border-[#2d3748] shadow-xl">
                {/* Header */}
                <div className="p-4 border-b border-[#2d3748]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Wallet</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-6 w-6"
                      >
                        {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Balance Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#2d3748] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Balance</div>
                      <div className="text-lg font-bold text-[#00d4ff]">
                        {showBalance ? formatCurrency(user.balance, 'USD') : '****'}
                      </div>
                    </div>
                    <div className="bg-[#2d3748] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">SC Balance</div>
                      <div className="text-lg font-bold text-purple-400">
                        {showBalance ? formatCurrency(user.sweepstakesCoins, 'sweepstakes_coins') : '****'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-[#00d4ff] text-black"
                      onClick={() => setShowWalletModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Deposit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-[#2d3748]"
                      onClick={() => setShowWalletModal(true)}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Withdraw
                    </Button>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">Recent Transactions</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#00d4ff] hover:text-[#00d4ff]/80"
                    >
                      View All
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.type, transaction.amount)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">
                              {transaction.description}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(transaction.timestamp)}</span>
                              <span className={`font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${
                            transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}
                            {formatCurrency(Math.abs(transaction.amount), 'USD')}
                          </div>
                          <div className="text-xs text-gray-500">
                            Balance: {formatCurrency(transaction.balanceAfter, 'USD')}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[#2d3748] text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#00d4ff] hover:text-[#00d4ff]/80 text-xs"
                    onClick={() => setShowWalletModal(true)}
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    Open Wallet
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
             </div>

       {/* Wallet Modal */}
       <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
     </>
  )
}

export default BalanceDropdown