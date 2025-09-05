'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Minus,
  Wallet,
  Coins,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'
import SkillTestingModal from './SkillTestingModal'
import VaultModal from './VaultModal'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'win' | 'bet' | 'bonus' | 'promotion'
  amount: number
  currency: 'GC' | 'SC'
  status: 'pending' | 'completed' | 'failed'
  description: string
  time: Date
  balanceAfter: number
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore()
  const [showBalances, setShowBalances] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history' | 'packages'>('overview')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState<'GC' | 'SC'>('SC')
  const [showSkillTesting, setShowSkillTesting] = useState(false)
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    amount: number
    currency: 'GC' | 'SC'
  } | null>(null)
  const [showVault, setShowVault] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [customCurrency, setCustomCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'CAD'>('USD')
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.38
  })

  // Fetch real-time exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const data = await response.json()
        setExchangeRates({
          USD: 1,
          EUR: data.rates.EUR,
          GBP: data.rates.GBP,
          CAD: data.rates.CAD
        })
      } catch (error) {
        console.log('Using fallback exchange rates')
        // Fallback rates if API fails
        setExchangeRates({
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          CAD: 1.38
        })
      }
    }

    fetchExchangeRates()
  }, [])

  // Purchase packages with GC and "free" SC
  const purchasePackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: 10,
      gcAmount: 10000,
      scAmount: 10.25,
      popular: false
    },
    {
      id: 'bronze',
      name: 'Bronze Pack',
      price: 25,
      gcAmount: 25000,
      scAmount: 25.75,
      popular: false
    },
    {
      id: 'silver',
      name: 'Silver Pack',
      price: 50,
      gcAmount: 50000,
      scAmount: 51.50,
      popular: true
    },
    {
      id: 'gold',
      name: 'Gold Pack',
      price: 100,
      gcAmount: 100000,
      scAmount: 102.50,
      popular: false
    },
    {
      id: 'platinum',
      name: 'Platinum Pack',
      price: 250,
      gcAmount: 250000,
      scAmount: 256.25,
      popular: false
    },
    {
      id: 'diamond',
      name: 'Diamond Pack',
      price: 500,
      gcAmount: 500000,
      scAmount: 512.50,
      popular: false
    }
  ]
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'win',
      amount: 2400.00,
      currency: 'SC',
      status: 'completed',
      description: 'Win on Sweet Bonanza',
      time: new Date(Date.now() - 1000 * 60 * 6),
      balanceAfter: 7400.00
    },
    {
      id: '2',
      type: 'bet',
      amount: -100.00,
      currency: 'SC',
      status: 'completed',
      description: 'Bet on Sweet Bonanza',
      time: new Date(Date.now() - 1000 * 60 * 11),
      balanceAfter: 5000.00
    },
    {
      id: '3',
      type: 'deposit',
      amount: 500.00,
      currency: 'SC',
      status: 'completed',
      description: 'Deposit via Credit Card',
      time: new Date(Date.now() - 1000 * 60 * 60),
      balanceAfter: 5100.00
    },
    {
      id: '4',
      type: 'bonus',
      amount: 1000.00,
      currency: 'GC',
      status: 'completed',
      description: 'Welcome Bonus',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      balanceAfter: 1000.00
    }
  ])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'bet':
        return <TrendingDown className="h-4 w-4 text-red-400" />
      case 'deposit':
        return <Plus className="h-4 w-4 text-blue-400" />
      case 'withdrawal':
        return <Minus className="h-4 w-4 text-orange-400" />
      case 'bonus':
      case 'promotion':
        return <Coins className="h-4 w-4 text-yellow-400" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount)
    if (amount > 0) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount,
        currency: selectedCurrency,
        status: 'completed',
        description: `Deposit ${selectedCurrency}`,
        time: new Date(),
        balanceAfter: (user?.balance || 0) + amount
      }
      setTransactions(prev => [newTransaction, ...prev])
      setDepositAmount('')
    }
  }

  // Check if skill testing is required for user's country
  const requiresSkillTesting = (country: string) => {
    const skillTestingCountries = [
      'Canada',
      'Australia',
      'United Kingdom',
      'Germany',
      'Austria',
      'Switzerland',
      'Netherlands',
      'Belgium',
      'Ireland',
      'Denmark',
      'Sweden',
      'Norway',
      'Finland'
    ]
    return skillTestingCountries.includes(country)
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (amount > 0 && amount <= (user?.balance || 0)) {
      // Check if skill testing is required
      if (user?.country && requiresSkillTesting(user.country) && selectedCurrency === 'SC') {
        setPendingWithdrawal({ amount, currency: selectedCurrency })
        setShowSkillTesting(true)
      } else {
        // Proceed with withdrawal directly
        processWithdrawal(amount, selectedCurrency)
      }
    }
  }

  const processWithdrawal = (amount: number, currency: 'GC' | 'SC') => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount: -amount,
      currency,
      status: 'pending',
      description: `Withdrawal ${currency}`,
      time: new Date(),
      balanceAfter: (user?.balance || 0) - amount
    }
    setTransactions(prev => [newTransaction, ...prev])
    setWithdrawAmount('')
    setPendingWithdrawal(null)
  }

  const handleSkillTestSuccess = () => {
    if (pendingWithdrawal) {
      processWithdrawal(pendingWithdrawal.amount, pendingWithdrawal.currency)
    }
    setShowSkillTesting(false)
  }

  const handleSkillTestClose = () => {
    setShowSkillTesting(false)
    setPendingWithdrawal(null)
  }

  const handleCustomPurchase = () => {
    const amount = parseFloat(customAmount)
    if (amount > 0) {
      // Calculate conversion rates based on USD equivalent
      const usdEquivalent = amount / exchangeRates[customCurrency]
      const gcAmount = usdEquivalent * 1000 // $1 USD = 1000 GC
      const scAmount = usdEquivalent * 1.025 // $1 USD = 1.025 SC
      
      // Create two transactions - one for GC and one for SC
      const gcTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: gcAmount,
        currency: 'GC',
        status: 'completed',
        description: `Custom Purchase: ${getCurrencySymbol(customCurrency)}${amount} ${customCurrency} (${gcAmount.toLocaleString()} GC)`,
        time: new Date(),
        balanceAfter: (user?.gcBalance || 0) + gcAmount
      }
      
      const scTransaction: Transaction = {
        id: (Date.now() + 1).toString(),
        type: 'deposit',
        amount: scAmount,
        currency: 'SC',
        status: 'completed',
        description: `Custom Purchase: ${getCurrencySymbol(customCurrency)}${amount} ${customCurrency} (${scAmount} SC)`,
        time: new Date(),
        balanceAfter: (user?.balance || 0) + scAmount
      }
      
      setTransactions(prev => [gcTransaction, scTransaction, ...prev])
      setCustomAmount('')
    }
  }

  const calculateCustomAmount = (inputAmount: string) => {
    const amount = parseFloat(inputAmount) || 0
    // Convert to USD equivalent first
    const usdEquivalent = amount / exchangeRates[customCurrency]
    const gcAmount = Math.floor(usdEquivalent * 1000) // $1 USD = 1000 GC
    const scAmount = (usdEquivalent * 1.025).toFixed(2) // $1 USD = 1.025 SC
    return { gcAmount, scAmount, usdEquivalent }
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$'
      case 'EUR': return '€'
      case 'GBP': return '£'
      case 'CAD': return 'C$'
      default: return '$'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="bg-[#1a2c38] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#2d3748] p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Wallet</h2>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="text-gray-400 border-gray-400 hover:bg-gray-400 hover:text-black"
              >
                {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-white border-white hover:bg-white hover:text-black"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="p-6 border-b border-[#374151]">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#2d3748] border-[#374151]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Balance</div>
                    <div className="text-2xl font-bold text-[#00d4ff]">
                      {showBalances ? formatCurrency(user?.balance || 0) : '••••••'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Sweeps Coins (SC)</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#2d3748] border-[#374151]">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">SC Balance</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {showBalances ? `${user?.gcBalance || 0} GC` : '••••••'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Gold Coins (GC)</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-b border-[#374151]">
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => setActiveTab('packages')}
                className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90 text-lg font-semibold py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Buy Packages
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('withdraw')}
                className="border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-black text-lg font-semibold py-3"
              >
                <Minus className="h-5 w-5 mr-2" />
                Redeem SC
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab('history')}
                className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black text-lg font-semibold py-3"
              >
                <Clock className="h-5 w-5 mr-2" />
                History
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('history')}
                    className="text-[#00d4ff] hover:text-[#00d4ff]/80"
                  >
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3 pb-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-[#2d3748] rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-xs text-gray-400">{formatTime(transaction.time)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)} {transaction.currency}
                        </div>
                        <div className={`text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                         {activeTab === 'packages' && (
               <div className="p-6">
                 <h3 className="text-lg font-semibold text-white mb-4">Purchase Packages</h3>
                 
                 {/* Top Global Disclaimer */}
                 <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                   <div className="flex items-start space-x-2">
                     <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                     <div className="text-sm text-blue-400">
                       <strong>Important:</strong> Gold Coins (GC) are for entertainment only and cannot be redeemed for prizes. 
                       Sweeps Coins (SC) can be redeemed for prizes once you meet the minimum requirements. 
                       All purchases include both GC and free SC as part of our sweepstakes model.
                     </div>
                   </div>
                 </div>

                 {/* All Packages Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                   {purchasePackages.map((pkg) => (
                     <Card key={pkg.id} className="bg-[#2d3748] border-[#374151] hover:border-[#00d4ff]/50 transition-colors">
                       <CardContent className="p-4">
                         <div className="text-center">
                           <div className="h-6 mb-2">
                             {pkg.popular && (
                               <div className="bg-[#00d4ff] text-black text-xs font-bold px-2 py-1 rounded-full inline-block">
                                 MOST POPULAR
                               </div>
                             )}
                           </div>
                           <h4 className="text-lg font-bold text-white mb-2">{pkg.name}</h4>
                           <div className="text-2xl font-bold text-[#00d4ff] mb-4">${pkg.price}</div>
                           
                           <div className="space-y-3 mb-4">
                             <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                               <span className="text-sm text-gray-300">Gold Coins:</span>
                               <span className="text-sm font-bold text-purple-400">{pkg.gcAmount.toLocaleString()} GC</span>
                             </div>
                             <div className="flex items-center justify-between p-2 bg-[#00d4ff]/10 rounded-lg border border-[#00d4ff]/20">
                               <span className="text-sm text-gray-300">FREE Sweeps Coins:</span>
                               <span className="text-sm font-bold text-[#00d4ff]">{pkg.scAmount} SC</span>
                             </div>
                           </div>
                           
                           <Button
                             onClick={() => {
                               // Simulate purchase
                               const newTransaction: Transaction = {
                                 id: Date.now().toString(),
                                 type: 'deposit',
                                 amount: pkg.scAmount,
                                 currency: 'SC',
                                 status: 'completed',
                                 description: `Package Purchase: ${pkg.name}`,
                                 time: new Date(),
                                 balanceAfter: (user?.balance || 0) + pkg.scAmount
                               }
                               setTransactions(prev => [newTransaction, ...prev])
                             }}
                             className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                           >
                             Purchase Package
                           </Button>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>

                                   {/* Custom Package */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Custom Amount</h4>
                    <Card className="bg-[#2d3748] border-[#374151] hover:border-[#00d4ff]/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-gray-400 mb-2 block">Currency</label>
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                variant={customCurrency === 'USD' ? 'default' : 'outline'}
                                onClick={() => setCustomCurrency('USD')}
                                className={customCurrency === 'USD' ? 'bg-[#00d4ff] text-black' : ''}
                              >
                                USD ($)
                              </Button>
                              <Button
                                variant={customCurrency === 'EUR' ? 'default' : 'outline'}
                                onClick={() => setCustomCurrency('EUR')}
                                className={customCurrency === 'EUR' ? 'bg-[#00d4ff] text-black' : ''}
                              >
                                EUR (€)
                              </Button>
                              <Button
                                variant={customCurrency === 'GBP' ? 'default' : 'outline'}
                                onClick={() => setCustomCurrency('GBP')}
                                className={customCurrency === 'GBP' ? 'bg-[#00d4ff] text-black' : ''}
                              >
                                GBP (£)
                              </Button>
                              <Button
                                variant={customCurrency === 'CAD' ? 'default' : 'outline'}
                                onClick={() => setCustomCurrency('CAD')}
                                className={customCurrency === 'CAD' ? 'bg-[#00d4ff] text-black' : ''}
                              >
                                CAD (C$)
                              </Button>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm text-gray-400 mb-2 block">Amount in {customCurrency}</label>
                            <Input
                              type="number"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              placeholder={`Enter amount in ${customCurrency}`}
                              className="bg-[#2d3748] border-[#374151] text-white"
                            />
                          </div>

                          {customAmount && parseFloat(customAmount) > 0 && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                              <div className="text-center">
                                <div className="text-sm text-green-400 mb-2">You will receive:</div>
                                <div className="text-lg font-bold text-white mb-2">
                                  {calculateCustomAmount(customAmount).gcAmount.toLocaleString()} Gold Coins (GC)
                                </div>
                                <div className="text-sm text-[#00d4ff] font-medium">
                                  + FREE {calculateCustomAmount(customAmount).scAmount} Sweeps Coins (SC)
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                  ({getCurrencySymbol(customCurrency)}{parseFloat(customAmount).toFixed(2)} {customCurrency} = ${calculateCustomAmount(customAmount).usdEquivalent.toFixed(2)} USD)
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={handleCustomPurchase}
                            disabled={!customAmount || parseFloat(customAmount) <= 0}
                            className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                          >
                            Purchase Custom Amount
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

            {activeTab === 'deposit' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Deposit Funds</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Currency</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={selectedCurrency === 'SC' ? 'default' : 'outline'}
                        onClick={() => setSelectedCurrency('SC')}
                        className={selectedCurrency === 'SC' ? 'bg-[#00d4ff] text-black' : ''}
                      >
                        Sweeps Coins (SC)
                      </Button>
                      <Button
                        variant={selectedCurrency === 'GC' ? 'default' : 'outline'}
                        onClick={() => setSelectedCurrency('GC')}
                        className={selectedCurrency === 'GC' ? 'bg-[#00d4ff] text-black' : ''}
                      >
                        Gold Coins (GC)
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-[#2d3748] border-[#374151] text-white"
                    />
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-400">
                        <strong>Important:</strong> GC (Gold Coins) are for entertainment only and cannot be redeemed for prizes. 
                        SC (Sweeps Coins) can be redeemed for prizes once you meet the minimum requirements.
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                  >
                    Deposit {selectedCurrency}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Redeem Sweeps Coins</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount to Redeem</label>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-[#2d3748] border-[#374151] text-white"
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-400">
                        <strong>Note:</strong> Only Sweeps Coins (SC) can be redeemed for prizes. Gold Coins (GC) are for entertainment only.
                        Minimum redemption amount: $10 SC
                      </div>
                    </div>
                  </div>

                  {user?.country && requiresSkillTesting(user.country) && selectedCurrency === 'SC' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-yellow-400">
                          <strong>Skill Testing Required:</strong> As a {user.country} resident, you must pass a skill-testing question
                          to comply with local gaming regulations before redeeming prizes.
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10 || parseFloat(withdrawAmount) > (user?.balance || 0)}
                    className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                  >
                    Redeem SC
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
                
                <div className="space-y-3 pb-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-[#2d3748] rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-xs text-gray-400">{formatTime(transaction.time)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)} {transaction.currency}
                        </div>
                        <div className={`text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

                     {/* Footer */}
                       <div className="p-6 border-t border-[#374151] text-center">
              <Button
                variant="outline"
                onClick={() => setShowVault(true)}
                className="text-[#00d4ff] border-[#00d4ff] hover:bg-[#00d4ff] hover:text-black"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Open Vault
              </Button>
            </div>
        </motion.div>
      </motion.div>

             {/* Skill Testing Modal */}
       <SkillTestingModal
         isOpen={showSkillTesting}
         onClose={handleSkillTestClose}
         onSuccess={handleSkillTestSuccess}
         userCountry={user?.country || ''}
       />

       {/* Vault Modal */}
       <VaultModal
         isOpen={showVault}
         onClose={() => setShowVault(false)}
       />
     </AnimatePresence>
  )
}

export default WalletModal
