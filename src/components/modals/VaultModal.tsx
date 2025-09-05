'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Unlock, 
  Plus, 
  Minus, 
  Eye, 
  EyeOff,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { formatCurrency, formatTime } from '@/lib/utils'

interface VaultModalProps {
  isOpen: boolean
  onClose: () => void
}

interface VaultTransaction {
  id: string
  type: 'deposit' | 'withdraw'
  amount: number
  timestamp: Date
  status: 'completed' | 'pending'
}

const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview')
  const [amount, setAmount] = useState('')
  const [showBalance, setShowBalance] = useState(true)
  const [vaultBalance] = useState(2500.75) // Mock vault balance

  const vaultTransactions: VaultTransaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 500,
      timestamp: new Date(Date.now() - 3600000),
      status: 'completed'
    },
    {
      id: '2',
      type: 'withdraw',
      amount: 250,
      timestamp: new Date(Date.now() - 7200000),
      status: 'completed'
    },
    {
      id: '3',
      type: 'deposit',
      amount: 1000,
      timestamp: new Date(Date.now() - 86400000),
      status: 'completed'
    }
  ]

  const handleDeposit = () => {
    // Handle vault deposit logic
    console.log('Depositing to vault:', amount)
    setAmount('')
    setActiveTab('overview')
  }

  const handleWithdraw = () => {
    // Handle vault withdrawal logic
    console.log('Withdrawing from vault:', amount)
    setAmount('')
    setActiveTab('overview')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Vault"
      description="Store your funds safely with enhanced security"
      size="lg"
      variant="glass"
    >
      <div className="space-y-6">
        {/* Vault Overview */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Your Secure Vault</h3>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl font-bold text-blue-400">
              {showBalance ? formatCurrency(vaultBalance) : '****'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="h-6 w-6"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-gray-400 text-sm">
            Your funds are protected with military-grade encryption
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#1a2c38] rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'deposit', label: 'Deposit', icon: Plus },
            { id: 'withdraw', label: 'Withdraw', icon: Minus }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 ${
                activeTab === tab.id 
                  ? 'bg-[#00d4ff] text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="glass" className="border-[#2d3748] p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-green-400" />
                  <div>
                    <h4 className="font-bold text-white">Bank-Level Security</h4>
                    <p className="text-sm text-gray-400">256-bit encryption</p>
                  </div>
                </div>
              </Card>
              
              <Card variant="glass" className="border-[#2d3748] p-4">
                <div className="flex items-center space-x-3">
                  <Lock className="h-8 w-8 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-white">Cold Storage</h4>
                    <p className="text-sm text-gray-400">Offline protection</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card variant="glass" className="border-[#2d3748]">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vaultTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium capitalize">
                            {transaction.type} to Vault
                          </div>
                          <div className="text-xs text-gray-400 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(transaction.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-green-400">
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <Card variant="glass" className="border-[#2d3748] p-6">
              <h4 className="text-lg font-bold text-white mb-4">Deposit to Vault</h4>
              <p className="text-gray-400 text-sm mb-6">
                Move funds from your main balance to the secure vault for safekeeping.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="text-white font-bold">
                    {user ? formatCurrency(user.balance) : '$0.00'}
                  </span>
                </div>
                
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-center text-xl"
                />
                
                <div className="grid grid-cols-4 gap-2">
                  {['25', '50', '100', 'Max'].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (preset === 'Max') {
                          setAmount(user?.balance.toString() || '0')
                        } else {
                          setAmount(preset)
                        }
                      }}
                      className="border-[#2d3748]"
                    >
                      {preset === 'Max' ? preset : `$${preset}`}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit to Vault
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <Card variant="glass" className="border-[#2d3748] p-6">
              <h4 className="text-lg font-bold text-white mb-4">Withdraw from Vault</h4>
              <p className="text-gray-400 text-sm mb-6">
                Move funds from your secure vault back to your main balance.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-gray-400">Vault Balance:</span>
                  <span className="text-white font-bold">
                    {formatCurrency(vaultBalance)}
                  </span>
                </div>
                
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-center text-xl"
                />
                
                <div className="grid grid-cols-4 gap-2">
                  {['25', '50', '100', 'Max'].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (preset === 'Max') {
                          setAmount(vaultBalance.toString())
                        } else {
                          setAmount(preset)
                        }
                      }}
                      className="border-[#2d3748]"
                    >
                      {preset === 'Max' ? preset : `$${preset}`}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleWithdraw}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw from Vault
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default VaultModal
