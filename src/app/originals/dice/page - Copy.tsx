'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dice1, 
  Shield, 
  Target, 
  Zap, 
  TrendingUp,
  RotateCcw,
  Info,
  Settings,
  Copy,
  Check,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  Timer,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Repeat,
  Keyboard
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import CurrencySelector from '@/components/ui/CurrencySelector'
import { useUserStore } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'
import { formatCurrency } from '@/lib/utils'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { 
  generateServerSeed, 
  generateClientSeed, 
  generateDiceRoll, 
  getHashedServerSeed,
  formatDiceResult 
} from '@/lib/diceUtils'

interface DiceSession {
  serverSeed: string
  hashedServerSeed: string
  clientSeed: string
  nonce: number
}

interface RollHistory {
  result: number
  won: boolean
  target: number
  direction: 'under' | 'over'
  betAmount: number
  payout: number
  timestamp: Date
}

const EdgeDice: React.FC = () => {
  const { user, selectedCurrency, setSelectedCurrency } = useUserStore()
  const { setLiveStatsModal } = useUIStore()
  const [betAmount, setBetAmount] = useState<number>(0.01)
  const [target, setTarget] = useState<number>(50)
  const [direction, setDirection] = useState<'under' | 'over'>('under')
  const [isRolling, setIsRolling] = useState(false)
  const [currentResult, setCurrentResult] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [showFairnessModal, setShowFairnessModal] = useState(false)
  const [showSeedsModal, setShowSeedsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [customClientSeed, setCustomClientSeed] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  
  // Game modes
  const [gameMode, setGameMode] = useState<'manual' | 'auto' | 'turbo'>('manual')
  const [autoSettings, setAutoSettings] = useState({
    enabled: false,
    betCount: 10,
    stopOnWin: false,
    stopOnLoss: false,
    winAmount: 100,
    lossAmount: 50
  })
  
  // Ticker animation state
  const [isTicking, setIsTicking] = useState(false)
  const [tickerValues, setTickerValues] = useState<number[]>([])
  const [finalResult, setFinalResult] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [tickerPosition, setTickerPosition] = useState<number>(0)
  
  // Hotkeys state
  const [hotkeysEnabled, setHotkeysEnabled] = useState(true)
  const [showHotkeysModal, setShowHotkeysModal] = useState(false)
  
  // Turbo mode state
  const [turboSpeed, setTurboSpeed] = useState<'fast' | 'ultra' | 'instant'>('fast')
  
  // Slider state for smooth dragging
  const [isDragging, setIsDragging] = useState(false)
  
  // Session state
  const [session, setSession] = useState<DiceSession>({
    serverSeed: '',
    hashedServerSeed: '',
    clientSeed: '',
    nonce: 0
  })

  // Roll history
  const [rollHistory, setRollHistory] = useState<RollHistory[]>([])

  const quickBets = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.50, 5.00, 10.00, 25.00]

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Hotkeys effect
  useEffect(() => {
    if (!hotkeysEnabled) return

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // Don't trigger hotkeys when typing in inputs
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          if (!isRolling && !isTicking) {
            placeBet()
          }
          break
        case 'KeyR':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            rotateSeeds()
          }
          break
        case 'KeyT':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setGameMode(prev => prev === 'turbo' ? 'manual' : 'turbo')
          }
          break
        case 'KeyH':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setShowHotkeysModal(true)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [hotkeysEnabled, isRolling, isTicking])

  // Adjust target when direction changes to ensure valid range
  useEffect(() => {
    if (direction === 'over' && target < 2) {
      setTarget(2)
    }
  }, [direction, target])

  const initializeSession = async () => {
    const serverSeed = generateServerSeed()
    const clientSeed = generateClientSeed()
    const hashedServerSeed = await getHashedServerSeed(serverSeed)
    
    setSession({
      serverSeed,
      hashedServerSeed,
      clientSeed,
      nonce: 0
    })
  }

  const calculateMultiplier = () => {
    // For "Roll Over X", win chance is (100 - X)%
    // For "Roll Under X", win chance is X%
    const winChance = direction === 'under' ? target : (100 - target)
    
    // With 1% house edge, multiplier = (100 - houseEdge) / winChance
    // This gives us the correct multiplier that accounts for the house edge
    const houseEdge = 1 // 1%
    const multiplier = (100 - houseEdge) / winChance
    
    // Use more precision for smaller win chances
    if (winChance <= 5) {
      return Math.round(multiplier * 1000000) / 1000000
    } else if (winChance <= 20) {
      return Math.round(multiplier * 100000) / 100000
    } else {
      return Math.round(multiplier * 10000) / 10000
    }
  }

    // Ticker animation function
  const runTickerAnimation = async (finalValue: number) => {
    setIsTicking(true)
    setShowResult(false)
    setTickerValues([])
    setTickerPosition(0)
    
    // Skip animation for instant turbo mode
    if (gameMode === 'turbo' && turboSpeed === 'instant') {
      setFinalResult(finalValue)
      setShowResult(true)
      setIsTicking(false)
      return
    }
    
    const duration = gameMode === 'turbo' ? 
      (turboSpeed === 'ultra' ? 1 : turboSpeed === 'fast' ? 200 : 0) : 500
    
    const steps = 50
    const stepDuration = duration / steps
    
    for (let i = 0; i < steps; i++) {
      // Generate random values that get closer to final value
      const progress = i / steps
      const randomValue = Math.random() * 100
      const weightedValue = randomValue * (1 - progress) + finalValue * progress
      
      // Show only one number at a time for more suspense
      setTickerValues([Math.round(weightedValue)])
      setTickerPosition(progress * 100)
      
      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }
    
    // Show final result
    setFinalResult(finalValue)
    setShowResult(true)
    setIsTicking(false)
  }

  const placeBet = async () => {
    if (betAmount <= 0 || !user) return

    // Check if user has enough balance for the selected currency
    const userBalance = selectedCurrency === 'SC' ? user.balance : user.gcBalance
    if (betAmount > userBalance) {
      alert(`Insufficient ${selectedCurrency} balance`)
      return
    }

    setIsRolling(true)
    
    // Increment nonce for this roll
    const newNonce = session.nonce + 1
    
    // Generate the roll using provably fair system
    const rollResult = await generateDiceRoll({
      serverSeed: session.serverSeed,
      clientSeed: customClientSeed || session.clientSeed,
      nonce: newNonce
    })
    
         // Convert to 0-100 range for display
     const result = Math.round(rollResult.result)
     const won = direction === 'under' ? result < target : result > target
     const payout = won ? betAmount * calculateMultiplier() : 0

    // Update session with new nonce
    setSession(prev => ({ ...prev, nonce: newNonce }))
    
    // Add to roll history
    const newRoll: RollHistory = {
      result,
      won,
      target,
      direction,
      betAmount,
      payout,
      timestamp: new Date()
    }
    
    setRollHistory(prev => [newRoll, ...prev.slice(0, 19)]) // Keep last 20 rolls
    
    // Run ticker animation first
    await runTickerAnimation(result)
    
    // Then show the final result
    setCurrentResult(result)
    setWon(won)
    setIsRolling(false)
  }

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const rotateSeeds = async () => {
    const newServerSeed = generateServerSeed()
    const newClientSeed = customClientSeed || generateClientSeed()
    const newHashedServerSeed = await getHashedServerSeed(newServerSeed)
    
    setSession({
      serverSeed: newServerSeed,
      hashedServerSeed: newHashedServerSeed,
      clientSeed: newClientSeed,
      nonce: 0
    })
    
    setCustomClientSeed('')
  }

  const generateRandomSeed = () => {
    setCustomClientSeed(generateClientSeed())
  }

  const handleChangeSeeds = () => {
    if (customClientSeed.trim()) {
      setShowConfirmModal(true)
    } else {
      rotateSeeds()
      setShowSeedsModal(false)
    }
  }

  const confirmChangeSeeds = () => {
    rotateSeeds()
    setShowSeedsModal(false)
    setShowConfirmModal(false)
  }

  const multiplier = calculateMultiplier()
  const potentialWin = betAmount * multiplier

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419] text-white">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center py-4 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-3 mb-2"
            >
              <Dice1 className="h-6 w-6 text-[#00d4ff]" />
              <h1 className="text-2xl font-bold text-white">Dice</h1>
            </motion.div>
          </div>

          {/* Main Game Container */}
          <div className="px-4 space-y-4">
            {/* Recent Rolls */}
            <div className="flex justify-center space-x-1 mb-4">
              {rollHistory.slice(0, 10).map((roll, index) => (
                <span
                  key={index}
                  className={`inline-block w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                    roll.won ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {roll.result}
                </span>
              ))}
              {rollHistory.length === 0 && (
                <span className="text-gray-500 text-sm">No recent rolls</span>
              )}
            </div>

            {/* Target Slider - Stake Style */}
            <div className="bg-[#1a2c38] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Target</span>
                <span className="text-lg font-bold text-white">{target}</span>
              </div>
              
              {/* Visual Slider */}
              <div className="relative mb-4">
                <div className="h-10 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg relative overflow-hidden">
                  {/* Win/Loss regions */}
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-300`}
                    style={{ 
                      width: `${target}%`,
                      backgroundColor: direction === 'under' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                    }}
                  />
                  
                  {/* Slider handle */}
                  <div 
                    className="absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-lg transform -translate-y-1/2 border-2 border-gray-300"
                    style={{ left: `${target}%`, marginLeft: '-12px' }}
                  />
                  
                  {/* Current result marker */}
                  {currentResult !== null && !isTicking && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute top-1/2 w-4 h-4 rounded-full shadow-lg transform -translate-y-1/2 ${
                        won ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{ left: `${currentResult}%`, marginLeft: '-8px' }}
                    />
                  )}
                </div>
                
                {/* Slider input */}
                <input
                  type="range"
                  min={direction === 'over' ? 2 : 1}
                  max="98"
                  step="1"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value))}
                  className="w-full h-10 bg-transparent absolute top-0 left-0 opacity-0 cursor-pointer"
                />
                
                {/* Scale markers */}
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>

              {/* Direction Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={direction === 'under' ? "default" : "outline"}
                  onClick={() => setDirection('under')}
                  className={`${direction === 'under' ? 'bg-green-500 hover:bg-green-600' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`}
                >
                  Roll Under {target}
                </Button>
                <Button
                  variant={direction === 'over' ? "default" : "outline"}
                  onClick={() => setDirection('over')}
                  className={`${direction === 'over' ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}
                >
                  Roll Over {target}
                </Button>
              </div>
            </div>

            {/* Game Stats - Stake Style */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Multiplier</div>
                <div className="text-lg font-bold text-white">
                  {multiplier < 2 ? multiplier.toFixed(4) : 
                   multiplier < 10 ? multiplier.toFixed(3) : 
                   multiplier < 100 ? multiplier.toFixed(2) : 
                   multiplier.toFixed(1)}x
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Roll {direction === 'under' ? 'Under' : 'Over'}</div>
                <div className="text-lg font-bold text-white">{target}</div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Win Chance</div>
                <div className="text-lg font-bold text-green-400">
                  {(direction === 'under' ? target : (100 - target)).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Bet Amount - Stake Style */}
            <div className="bg-[#1a2c38] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Bet Amount</span>
                <span className="text-sm text-gray-400">{selectedCurrency}0.00</span>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  min="0.01"
                  step="0.01"
                  className="flex-1 bg-[#2d3748] border-[#374151] text-white text-center text-lg font-semibold h-12"
                  placeholder="0.00"
                />
                <Button
                  onClick={() => setBetAmount(prev => prev / 2)}
                  className="bg-[#2d3748] hover:bg-[#374151] text-white px-4 h-12"
                >
                  ½
                </Button>
                <Button
                  onClick={() => setBetAmount(prev => prev * 2)}
                  className="bg-[#2d3748] hover:bg-[#374151] text-white px-4 h-12"
                >
                  2×
                </Button>
              </div>

              {/* Quick Bet Buttons */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[0.01, 0.10, 1.00, 10.00, 100.00].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    className={`text-xs h-8 ${betAmount === amount ? "bg-[#00d4ff] text-black border-[#00d4ff]" : "border-[#374151] text-gray-300"}`}
                  >
                    {amount >= 1 ? amount.toFixed(0) : amount.toFixed(2)}
                  </Button>
                ))}
              </div>

              {/* Profit on Win */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Profit on Win</span>
                <span className="text-green-400 font-semibold">
                  {formatCurrency(potentialWin - betAmount)} {selectedCurrency}
                </span>
              </div>
            </div>

            {/* Game Mode Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={gameMode === 'manual' ? "default" : "outline"}
                onClick={() => setGameMode('manual')}
                className={`${gameMode === 'manual' ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300'}`}
              >
                Manual
              </Button>
              <Button
                variant={gameMode === 'auto' ? "default" : "outline"}
                onClick={() => setGameMode('auto')}
                className={`${gameMode === 'auto' ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300'}`}
              >
                Auto
              </Button>
            </div>

            {/* Roll Button */}
            <Button
              onClick={placeBet}
              disabled={isRolling || betAmount <= 0}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-4 rounded-lg"
            >
              {isRolling ? (
                <div className="flex items-center">
                  <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                  Rolling...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Bet</span>
                </div>
              )}
            </Button>

            {/* Result Display */}
            {(isTicking || showResult) && (
              <div className="bg-[#1a2c38] rounded-lg p-6 text-center">
                <div className="text-sm text-gray-400 mb-3">
                  {isTicking ? 'Rolling...' : 'Result'}
                </div>
                <div className="text-4xl font-bold mb-3">
                  {isTicking ? (
                    <div className="flex justify-center">
                      {tickerValues.map((value, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="text-4xl bg-gradient-to-b from-[#00d4ff] to-[#0099cc] px-4 py-2 rounded-xl border-2 border-[#00d4ff]/50"
                        >
                          {value}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                      className={`text-6xl px-6 py-4 rounded-2xl border-4 ${
                        won ? 'bg-gradient-to-b from-green-500 to-green-600 text-white border-green-400' : 'bg-gradient-to-b from-red-500 to-red-600 text-white border-red-400'
                      }`}
                    >
                      {finalResult}
                    </motion.div>
                  )}
                </div>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-xl font-bold px-6 py-2 rounded-xl ${
                      won ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                    }`}
                  >
                    {won ? '🎉 WIN! 🎉' : '❌ LOSS ❌'}
                    {won && (
                      <div className="text-sm mt-1">
                        +{formatCurrency(potentialWin - betAmount)} {selectedCurrency}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Fairness Button */}
            <Button
              variant="outline"
              onClick={() => setShowFairnessModal(true)}
              className="w-full border-[#374151] text-gray-300 hover:bg-[#374151]"
            >
              <Shield className="h-4 w-4 mr-2" />
              Fairness
            </Button>
          </div>
        </div>
        {/* Fairness Modal */}
        {showFairnessModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#1a2c38] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Shield className="h-6 w-6 mr-2" />
                  Fairness
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFairnessModal(false)}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Solving the Trust Issue with Online Gambling</h3>
                  <p className="text-gray-300 mb-3">
                    The underlying concept of provable fairness is that players have the ability to prove and verify that their results are fair and unmanipulated. This is achieved through the use of a <strong>commitment scheme</strong>, along with cryptographic hashing.
                  </p>
                  <p className="text-gray-300 mb-3">
                    The commitment scheme is used to ensure that the player has an influence on all results generated. Cryptographic hashing is used to ensure that the casino also remains honest to this commitment scheme. Both concepts combined creates a trust-less environment when gambling online.
                  </p>
                  <p className="text-gray-300 mb-3">This is simplified in the following representation:</p>
                  <div className="bg-[#2d3748] rounded-lg p-4 text-center">
                    <code className="text-[#00d4ff] text-lg">
                      fair result = operators input (hashed) + players input
                    </code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#00d4ff] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">1</div>
                      <div>
                        <p className="text-white font-medium">Server generates a secret seed</p>
                        <p className="text-gray-400 text-sm">The server creates a random seed that remains hidden until after the bet</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#00d4ff] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">2</div>
                      <div>
                        <p className="text-white font-medium">Player provides client seed</p>
                        <p className="text-gray-400 text-sm">You can set your own seed or use a random one</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#00d4ff] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">3</div>
                      <div>
                        <p className="text-white font-medium">Result is calculated</p>
                        <p className="text-gray-400 text-sm">Server seed + client seed + nonce = provably fair result</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-[#00d4ff] rounded-full flex items-center justify-center text-black text-sm font-bold mt-0.5">4</div>
                      <div>
                        <p className="text-white font-medium">Server seed is revealed</p>
                        <p className="text-gray-400 text-sm">After the bet, you can verify the result was fair</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">3rd Party Verification</h3>
                  <p className="text-gray-300 mb-3">
                    All Edge Originals played on Edge can be verified both here and via 3rd party websites who have also open sourced the verification procedure. You can find them via a google search, or simply check out some of these that have been put together by our community:
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="https://provablyfair.me" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
                    >
                      • https://provablyfair.me
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Crypto Gambling Foundation</h3>
                  <p className="text-gray-300 mb-3">
                    Edge is a verified operator on the Crypto Gambling Foundation network. This foundation aims to uphold the highest standard of provably fair gambling and we are proud to be a part of their network. You can find further information and insights about provable fairness and the power it has in this industry, check out the Crypto Gambling Foundation via their website: 
                  </p>
                  <a 
                    href="https://cryptogambling.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
                  >
                    cryptogambling.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Seeds Modal */}
         {showSeedsModal && (
           <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
             <div className="bg-[#1a2c38] rounded-lg p-6 max-w-md w-full mx-4">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-white">Change Seeds</h2>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setShowSeedsModal(false)}
                   className="text-white border-white hover:bg-white hover:text-black"
                 >
                   ×
                 </Button>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-sm text-gray-400">New Client Seed *</label>
                   <div className="flex items-center space-x-2 mt-1">
                     <Input
                       value={customClientSeed}
                       onChange={(e) => setCustomClientSeed(e.target.value)}
                       className="bg-[#2d3748] border-[#374151] text-white flex-1"
                       placeholder="Enter new client seed"
                     />
                     <Button
                       variant="outline"
                       onClick={generateRandomSeed}
                       className="text-[#00d4ff] border-[#00d4ff] hover:bg-[#00d4ff] hover:text-black"
                     >
                       Random
                     </Button>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">
                     Leave empty to use a random seed
                   </p>
                 </div>
                 
                 <div className="flex space-x-3">
                   <Button
                     onClick={handleChangeSeeds}
                     className="flex-1 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                   >
                     Change Seeds
                   </Button>
                   <Button
                     variant="outline"
                     onClick={() => setShowSeedsModal(false)}
                     className="flex-1"
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Confirmation Modal */}
         {showConfirmModal && (
           <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
             <div className="bg-[#1a2c38] rounded-lg p-6 max-w-md w-full mx-4">
               <div className="text-center">
                 <h2 className="text-2xl font-bold text-white mb-4">Confirm Seed Change</h2>
                 <p className="text-gray-300 mb-6">
                   Are you sure you want to change your client seed to "{customClientSeed}"? 
                   This will reset your current session and nonce.
                 </p>
                 <div className="flex space-x-3">
                   <Button
                     onClick={confirmChangeSeeds}
                     className="flex-1 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                   >
                     Yes, Change Seeds
                   </Button>
                   <Button
                     variant="outline"
                     onClick={() => setShowConfirmModal(false)}
                     className="flex-1"
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Hotkeys Modal */}
         {showHotkeysModal && (
           <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
             <div className="bg-[#1a2c38] rounded-lg p-6 max-w-md w-full mx-4">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-white flex items-center">
                   <Keyboard className="h-6 w-6 mr-2" />
                   Hotkeys
                 </h2>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setShowHotkeysModal(false)}
                   className="text-white border-white hover:bg-white hover:text-black"
                 >
                   ×
                 </Button>
               </div>
               
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#2d3748] rounded-lg p-3">
                     <div className="text-[#00d4ff] font-semibold">Space</div>
                     <div className="text-gray-300 text-sm">Roll Dice</div>
                   </div>
                   <div className="bg-[#2d3748] rounded-lg p-3">
                     <div className="text-[#00d4ff] font-semibold">Ctrl+R</div>
                     <div className="text-gray-300 text-sm">Rotate Seeds</div>
                   </div>
                   <div className="bg-[#2d3748] rounded-lg p-3">
                     <div className="text-[#00d4ff] font-semibold">Ctrl+T</div>
                     <div className="text-gray-300 text-sm">Toggle Turbo</div>
                   </div>
                   <div className="bg-[#2d3748] rounded-lg p-3">
                     <div className="text-[#00d4ff] font-semibold">Ctrl+H</div>
                     <div className="text-gray-300 text-sm">Show Hotkeys</div>
                   </div>
                 </div>
                 
                 <div className="text-sm text-gray-400">
                   <p className="mb-2">Hotkeys are disabled when typing in input fields.</p>
                   <p>You can toggle hotkeys on/off in the Hotkeys panel.</p>
                 </div>
               </div>
             </div>
           </div>
         )}
      </div>
    </CasinoLayout>
  )
}

export default EdgeDice
