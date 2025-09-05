'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Target,
  Zap,
  TrendingUp,
  RotateCcw,
  Shuffle,
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
import { useGameStatsStore } from '@/store/gameStatsStore'
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
  const { addRoll } = useGameStatsStore()

  // Screen size detection
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024) // lg breakpoint
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  const [betAmount, setBetAmount] = useState<number>(0.01)
  const [target, setTarget] = useState<number>(50)
  const [direction, setDirection] = useState<'under' | 'over'>('under')
  const [isRolling, setIsRolling] = useState(false)
  const [currentResult, setCurrentResult] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [showFairnessModal, setShowFairnessModal] = useState(false)
  const [showSeedsModal, setShowSeedsModal] = useState(false)
  const [showAutoModal, setShowAutoModal] = useState(false)
  const [hashedServerSeed, setHashedServerSeed] = useState<string>('')
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
    lossAmount: 50,
    turboEnabled: false,
    turboSpeed: 'fast' as 'fast' | 'ultra' | 'instant'
  })
  const [autoProgress, setAutoProgress] = useState({
    isRunning: false,
    currentBet: 0,
    totalBets: 0,
    totalProfit: 0,
    totalLoss: 0
  })

  // Use ref to track running state for immediate access in loop
  const isRunningRef = useRef(false)
  
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

  // Update hashed server seed when session changes
  useEffect(() => {
    const updateHashedServerSeed = async () => {
      if (session.serverSeed) {
        const hash = await getHashedServerSeed(session.serverSeed)
        setHashedServerSeed(hash)
      } else {
        setHashedServerSeed('')
      }
    }
    updateHashedServerSeed()
  }, [session.serverSeed])

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
  const runTickerAnimation = async (finalValue: number, turboSpeedParam?: 'fast' | 'ultra' | 'instant') => {
    setIsTicking(true)
    setShowResult(false)
    setTickerValues([])
    setTickerPosition(0)
    
    // Skip animation for instant turbo mode
    if ((gameMode === 'turbo' && turboSpeed === 'instant') || turboSpeedParam === 'instant') {
      setFinalResult(finalValue)
      setShowResult(true)
      setIsTicking(false)
      return
    }
    
    const duration = turboSpeedParam ?
      (turboSpeedParam === 'ultra' ? 0.5 : turboSpeedParam === 'fast' ? 200 : 0) :
      (gameMode === 'turbo' ? (turboSpeed === 'ultra' ? 0.5 : turboSpeed === 'fast' ? 200 : 0) : (isDesktop ? 500 : 300))

    const steps = isDesktop ? 50 : 30
    const stepDuration = duration / steps
    
    for (let i = 0; i < steps; i++) {
      // Generate completely random values (0-99) for the entire animation
      const randomValue = Math.floor(Math.random() * 100)

      // Show only one number at a time for more suspense
      setTickerValues([randomValue])
      setTickerPosition((i / steps) * 100)

      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }
    
    // Show final result
    setFinalResult(finalValue)
    setShowResult(true)
    setIsTicking(false)
  }

  const placeBet = async () => {
    if (gameMode === 'auto') {
      await runAutoBets()
    } else {
      await placeManualBet()
    }
  }

  const placeManualBet = async () => {
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

    // Add to local roll history for display
    setRollHistory(prev => [newRoll, ...prev.slice(0, 19)]) // Keep last 20 rolls
    
    // Add to global stats store
    addRoll({
      ...newRoll,
      gameType: 'Dice'
    })

    // Run ticker animation first
    await runTickerAnimation(result, turboSpeed === 'fast' ? undefined : turboSpeed)

    // Then show the final result
    setCurrentResult(result)
    setWon(won)
    setIsRolling(false)
  }

  const runAutoBets = async () => {
    if (!autoSettings.enabled || autoProgress.isRunning) return

    // Update both state and ref
    setAutoProgress(prev => ({
      ...prev,
      isRunning: true,
      currentBet: 0,
      totalBets: 0,
      totalProfit: 0,
      totalLoss: 0
    }))
    isRunningRef.current = true

    // Get starting nonce and increment it for each bet
    let currentNonce = session.nonce

    for (let i = 0; i < autoSettings.betCount; i++) {
      // Check if user clicked stop (using ref for immediate access)
      if (!isRunningRef.current) {
        break
      }

      // Check stop conditions
      if (autoSettings.stopOnWin && autoProgress.totalProfit >= autoSettings.winAmount) {
        break
      }
      if (autoSettings.stopOnLoss && autoProgress.totalLoss >= autoSettings.lossAmount) {
        break
      }

      // Place individual bet with unique nonce
      currentNonce += 1 // Increment nonce for this bet
      const result = await placeSingleBet(currentNonce, autoSettings.turboEnabled)

      // Update progress
      setAutoProgress(prev => ({
        ...prev,
        currentBet: i + 1,
        totalBets: i + 1,
        totalProfit: prev.totalProfit + (result.won ? result.payout - betAmount : 0),
        totalLoss: prev.totalLoss + (result.won ? 0 : betAmount)
      }))

      // Add delay between bets (except for last bet) - respect turbo settings
      if (i < autoSettings.betCount - 1) {
        const delay = autoSettings.turboEnabled ?
          (autoSettings.turboSpeed === 'instant' ? 0 :
           autoSettings.turboSpeed === 'ultra' ? 5 : 100) : 1000;
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Update session with final nonce
    setSession(prev => ({ ...prev, nonce: currentNonce }))

    // Update both state and ref
    setAutoProgress(prev => ({ ...prev, isRunning: false }))
    isRunningRef.current = false
  }

  const placeSingleBet = async (nonce?: number, turboMode?: boolean) => {
    if (betAmount <= 0 || !user) return { won: false, payout: 0 }

    // Check if user has enough balance for the selected currency
    const userBalance = selectedCurrency === 'SC' ? user.balance : user.gcBalance
    if (betAmount > userBalance) {
      return { won: false, payout: 0 }
    }

    // Use provided nonce or increment current session nonce
    const rollNonce = nonce !== undefined ? nonce : session.nonce + 1

    // Generate the roll using provably fair system
    const rollResult = await generateDiceRoll({
      serverSeed: session.serverSeed,
      clientSeed: customClientSeed || session.clientSeed,
      nonce: rollNonce
    })

    // Convert to 0-100 range for display
    const result = Math.round(rollResult.result)
    const won = direction === 'under' ? result < target : result > target
    const payout = won ? betAmount * calculateMultiplier() : 0

    // Only update session nonce if not using provided nonce (for auto betting)
    if (nonce === undefined) {
      setSession(prev => ({ ...prev, nonce: rollNonce }))
    }

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

    // Add to local roll history for display
    setRollHistory(prev => [newRoll, ...prev.slice(0, 19)]) // Keep last 20 rolls
    
    // Add to global stats store
    addRoll({
      ...newRoll,
      gameType: 'Dice'
    })

    // Run ticker animation first
    await runTickerAnimation(result, turboMode ? autoSettings.turboSpeed : undefined)

    // Then show the final result
    setCurrentResult(result)
    setWon(won)

    return { won, payout, result }
  }

  const getAutoButtonText = () => {
    let text = `${autoSettings.betCount} bets`

    if (autoSettings.stopOnWin && autoSettings.stopOnLoss) {
      text += ` (+$${autoSettings.winAmount}/-$${autoSettings.lossAmount})`
    } else if (autoSettings.stopOnWin) {
      text += ` (+$${autoSettings.winAmount})`
    } else if (autoSettings.stopOnLoss) {
      text += ` (-$${autoSettings.lossAmount})`
    }

    return `Start Auto ${text}`
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
        {isDesktop ? (
          /* Desktop Layout */
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-3 mb-2"
              >
                <img src="/Logo11.png" alt="Edge Casino" className="h-8 w-8" />
                <h1 className="text-3xl font-bold text-white">Dice</h1>
              </motion.div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              {/* Left Panel - Controls */}
              <div className="col-span-5 space-y-4">
                {/* Target Slider */}
                <div className="bg-[#1a2c38] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg text-gray-400">Target</span>
                    <span className="text-2xl font-bold text-white">{target}</span>
                  </div>

                  {/* Visual Slider */}
                  <div className="relative mb-6">
                    <div className="h-12 bg-gray-600 rounded-lg relative overflow-hidden transition-all duration-300 hover:bg-gray-500">
                      {/* Win region */}
                      <div
                        className={`absolute top-0 h-full transition-all duration-500 ease-out transform hover:scale-105 ${
                          direction === 'under' ? 'left-0 bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/30' : 'right-0 bg-gradient-to-l from-green-400 to-green-600 shadow-lg shadow-green-500/30'
                        }`}
                        style={{
                          width: `${target}%`,
                          ...(direction === 'over' && { left: `${100 - target}%` })
                        }}
                      />
                      {/* Loss region */}
                      <div
                        className={`absolute top-0 h-full transition-all duration-500 ease-out transform hover:scale-105 ${
                          direction === 'under' ? 'right-0 bg-gradient-to-l from-red-400 to-red-600 shadow-lg shadow-red-500/30' : 'left-0 bg-gradient-to-r from-red-400 to-red-600 shadow-lg shadow-red-500/30'
                        }`}
                        style={{
                          width: `${100 - target}%`,
                          ...(direction === 'over' && { left: '0%' })
                        }}
                      />

                      {/* Slider handle */}
                      <div
                        className="absolute top-1/2 w-8 h-8 bg-white rounded-full shadow-xl transform -translate-y-1/2 border-2 border-gray-300 transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl cursor-pointer"
                        style={{ left: `${target}%`, marginLeft: '-16px' }}
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-200 animate-pulse opacity-50"></div>
                      </div>

                      {/* Current result marker */}
                      {currentResult !== null && !isTicking && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0, rotate: -180 }}
                          animate={{
                            opacity: 1,
                            scale: [0, 1.2, 1],
                            rotate: 0
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            scale: { times: [0, 0.6, 1] }
                          }}
                          className={`absolute top-1/2 w-5 h-5 rounded-full shadow-xl transform -translate-y-1/2 border-2 border-white ${
                            won ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
                          }`}
                          style={{ left: `${currentResult}%`, marginLeft: '-10px' }}
                        >
                          <div className={`absolute inset-0 rounded-full animate-ping ${
                            won ? 'bg-green-300' : 'bg-red-300'
                          } opacity-30`}></div>
                        </motion.div>
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
                      className="w-full h-12 bg-transparent absolute top-0 left-0 opacity-0 cursor-pointer"
                    />

                    {/* Scale markers */}
                    <div className="flex justify-between text-sm text-gray-400 mt-3">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Direction Toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={direction === 'under' ? "default" : "outline"}
                      onClick={() => setDirection('under')}
                      className={`${direction === 'under' ? 'bg-green-500 hover:bg-green-600' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'} h-12 text-lg`}
                    >
                      Roll Under {target}
                    </Button>
                    <Button
                      variant={direction === 'over' ? "default" : "outline"}
                      onClick={() => setDirection('over')}
                      className={`${direction === 'over' ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'} h-12 text-lg`}
                    >
                      Roll Over {target}
                    </Button>
                  </div>
                </div>

                {/* Game Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400 mb-2">Multiplier</div>
                    <div className="text-xl font-bold text-white">
                      {multiplier < 2 ? multiplier.toFixed(4) :
                       multiplier < 10 ? multiplier.toFixed(3) :
                       multiplier < 100 ? multiplier.toFixed(2) :
                       multiplier.toFixed(1)}x
                    </div>
                  </div>
                  <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400 mb-2">Roll {direction === 'under' ? 'Under' : 'Over'}</div>
                    <div className="text-xl font-bold text-white">{target}</div>
                  </div>
                  <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400 mb-2">Win Chance</div>
                    <div className="text-xl font-bold text-green-400">
                      {(direction === 'under' ? target : (100 - target)).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Turbo Toggle */}
                <div className="bg-[#1a2c38] rounded-lg p-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Turbo</span>
                    <button
                      onClick={() => {
                        if (turboSpeed === 'fast') {
                          setTurboSpeed('ultra');
                        } else if (turboSpeed === 'ultra') {
                          setTurboSpeed('instant');
                        } else if (turboSpeed === 'instant') {
                          setTurboSpeed('fast');
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        turboSpeed === 'fast' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' :
                        turboSpeed === 'ultra' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                        'bg-red-500 text-white hover:bg-red-600'
                      }`}
                      title="Click to cycle turbo speeds (Ctrl+T to disable)"
                    >
                      {turboSpeed === 'fast' ? 'Off' :
                       turboSpeed === 'ultra' ? 'Ultra' :
                       'Instant'}
                    </button>
                  </div>
                </div>

                {/* Bet Amount */}
                <div className="bg-[#1a2c38] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg text-gray-400">Bet Amount</span>
                    <span className="text-lg text-gray-400">{selectedCurrency}0.00</span>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                      min="0.01"
                      step="0.01"
                      className="flex-1 bg-[#2d3748] border-[#374151] text-white text-center text-xl font-semibold h-14"
                      placeholder="0.00"
                    />
                    <Button
                      onClick={() => setBetAmount(prev => prev / 2)}
                      className="bg-[#2d3748] hover:bg-[#374151] text-white px-4 h-14"
                    >
                      ½
                    </Button>
                    <Button
                      onClick={() => setBetAmount(prev => prev * 2)}
                      className="bg-[#2d3748] hover:bg-[#374151] text-white px-4 h-14"
                    >
                      2×
                    </Button>
                  </div>

                  {/* Quick Bet Buttons */}
                  <div className="grid grid-cols-5 gap-3 mb-2">
                    {[0.01, 0.10, 1.00, 10.00, 100.00].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(amount)}
                        className={`text-sm h-10 ${betAmount === amount ? "bg-[#00d4ff] text-black border-[#00d4ff]" : "border-[#374151] text-gray-300"}`}
                      >
                        {amount >= 1 ? amount.toFixed(0) : amount.toFixed(2)}
                      </Button>
                    ))}
                  </div>

                  {/* Profit on Win */}
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-gray-400">Profit on Win</span>
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(potentialWin - betAmount)} {selectedCurrency}
                    </span>
                  </div>
                </div>

                {/* Game Mode Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={gameMode === 'manual' ? "default" : "outline"}
                    onClick={() => setGameMode('manual')}
                    className={`${gameMode === 'manual' ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300'} h-12 text-lg`}
                  >
                    Manual
                  </Button>
                  <Button
                    variant={gameMode === 'auto' ? "default" : "outline"}
                    onClick={() => {
                      setGameMode('auto')
                      setShowAutoModal(true)
                    }}
                    className={`${gameMode === 'auto' ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300'} h-12 text-lg`}
                  >
                    Auto
                  </Button>
                </div>

                {/* Auto Progress Display - Mobile Only */}
                {gameMode === 'auto' && autoProgress.isRunning && !isDesktop && (
                  <div className="bg-[#2d3748] rounded-lg p-3 mt-2">
                    <div className="text-center mb-2">
                      <div className="text-[#00d4ff] font-semibold">Auto Bet Progress</div>
                      <div className="text-sm text-gray-400">
                        Bet {autoProgress.currentBet} / {autoSettings.betCount}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Profit: +{formatCurrency(autoProgress.totalProfit)}</span>
                      <span className="text-red-400">Loss: -{formatCurrency(autoProgress.totalLoss)}</span>
                    </div>
                  </div>
                )}

                {/* Roll Button */}
                <Button
                                  onClick={autoProgress.isRunning ? () => {
                                    setAutoProgress(prev => ({ ...prev, isRunning: false }))
                                    isRunningRef.current = false
                                  } : placeBet}
                disabled={(!autoProgress.isRunning && (isRolling || betAmount <= 0)) || (autoProgress.isRunning && !autoSettings.enabled)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-lg sm:text-xl font-semibold py-3 sm:py-4 rounded-lg min-h-[56px] flex items-center justify-center"
                >
                  {autoProgress.isRunning ? (
                    <div className="flex items-center">
                      <Pause className="h-6 w-6 mr-3" />
                      Stop Auto ({autoProgress.currentBet}/{autoSettings.betCount})
                    </div>
                  ) : isRolling ? (
                    <div className="flex items-center">
                      <RotateCcw className="h-6 w-6 mr-3 animate-spin" />
                      Rolling...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-center leading-tight">{gameMode === 'auto' ? getAutoButtonText() : 'Bet'}</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Right Panel - Results and History */}
              <div className="col-span-7 space-y-6">
                {/* Recent Rolls */}
                <div className="bg-[#1a2c38] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Rolls</h3>
                  <div className="flex flex-wrap gap-2">
                    {rollHistory.slice(0, 20).map((roll, index) => (
                      <span
                        key={index}
                        className={`inline-block w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center ${
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
                </div>

                {/* Result Display */}
                {(isTicking || showResult) && (
                  <div className="bg-[#1a2c38] rounded-lg p-3 sm:p-4 overflow-visible min-h-[140px] sm:min-h-[160px] flex flex-col">
                    {isTicking ? (
                      <div className="text-sm sm:text-lg text-gray-400 mb-2 sm:mb-4 text-center hidden sm:block">
                        Rolling...
                      </div>
                    ) : (
                      <div className="text-sm sm:text-lg text-gray-400 mb-2 sm:mb-4 text-center hidden sm:block">
                        Result
                      </div>
                    )}
                    <div className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-center">
                      {isTicking ? (
                        <div className="flex justify-center items-center flex-wrap gap-1 sm:gap-2 overflow-x-auto px-2">
                          {tickerValues.map((value, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="text-2xl sm:text-4xl bg-gradient-to-b from-[#00d4ff] to-[#0099cc] px-2 sm:px-4 py-1 sm:py-2 rounded-lg border-2 border-[#00d4ff]/50 flex-shrink-0"
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
                          className={`text-7xl px-8 py-6 rounded-2xl border-4 ${
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
                        className={`text-2xl font-bold px-8 py-3 rounded-xl ${
                          won ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                        }`}
                      >
                        {won ? '🎉 WIN! 🎉' : '❌ LOSS ❌'}
                        {won && (
                          <div className="text-lg mt-2">
                            +{formatCurrency(potentialWin - betAmount)} {selectedCurrency}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Roll History Table */}
                {rollHistory.length > 0 && (
                  <div className="bg-[#1a2c38] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Roll History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-[#374151]">
                            <th className="text-left py-2">Result</th>
                            <th className="text-left py-2">Target</th>
                            <th className="text-left py-2">Bet</th>
                            <th className="text-left py-2">Payout</th>
                            <th className="text-left py-2">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rollHistory.slice(0, 10).map((roll, index) => (
                            <tr key={index} className="border-b border-[#374151]/50">
                              <td className={`py-2 font-bold ${roll.won ? 'text-green-400' : 'text-red-400'}`}>
                                {roll.result}
                              </td>
                              <td className="py-2 text-gray-300">
                                {roll.direction} {roll.target}
                              </td>
                              <td className="py-2 text-gray-300">
                                {formatCurrency(roll.betAmount)} {selectedCurrency}
                              </td>
                              <td className="py-2 text-gray-300">
                                {roll.won ? formatCurrency(roll.payout) : '0.00'} {selectedCurrency}
                              </td>
                              <td className="py-2 text-gray-400 text-xs">
                                {roll.timestamp.toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Fairness Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowFairnessModal(true)}
                  className="w-full border-[#374151] text-gray-300 hover:bg-[#374151] h-12 text-lg"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Fairness
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Mobile Layout */
          <div className="max-w-md mx-auto min-h-screen">
            {/* Header */}
            <div className="text-center py-2 px-4 sticky top-0 bg-[#0f1419] z-10">
                              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center space-x-3 mb-1"
                >
                  <img src="/Logo11.png" alt="Edge Casino" className="h-5 w-5" />
                  <h1 className="text-xl font-bold text-white">Dice</h1>
                </motion.div>
            </div>

            {/* Main Game Container */}
            <div className="px-4 space-y-2 pb-16">
              {/* Recent Rolls */}
              <div className="flex justify-center space-x-1 mb-2">
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
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Target</span>
                  <span className="text-base font-bold text-white">{target}</span>
                </div>

                {/* Visual Slider */}
                <div className="relative mb-3">
                  <div className="h-10 bg-gray-600 rounded-lg relative overflow-hidden transition-all duration-300 hover:bg-gray-500">
                    {/* Win region */}
                    <div
                      className={`absolute top-0 h-full transition-all duration-500 ease-out transform hover:scale-105 ${
                        direction === 'under' ? 'left-0 bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/30' : 'right-0 bg-gradient-to-l from-green-400 to-green-600 shadow-lg shadow-green-500/30'
                      }`}
                      style={{
                        width: `${target}%`,
                        ...(direction === 'over' && { left: `${100 - target}%` })
                      }}
                    />
                    {/* Loss region */}
                    <div
                      className={`absolute top-0 h-full transition-all duration-500 ease-out transform hover:scale-105 ${
                        direction === 'under' ? 'right-0 bg-gradient-to-l from-red-400 to-red-600 shadow-lg shadow-red-500/30' : 'left-0 bg-gradient-to-r from-red-400 to-red-600 shadow-lg shadow-red-500/30'
                      }`}
                      style={{
                        width: `${100 - target}%`,
                        ...(direction === 'over' && { left: '0%' })
                      }}
                    />

                    {/* Slider handle */}
                    <div
                      className="absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-xl transform -translate-y-1/2 border-2 border-gray-300 transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl cursor-pointer"
                      style={{ left: `${target}%`, marginLeft: '-12px' }}
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-200 animate-pulse opacity-50"></div>
                    </div>

                    {/* Current result marker */}
                    {currentResult !== null && !isTicking && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{
                          opacity: 1,
                          scale: [0, 1.2, 1],
                          rotate: 0
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          scale: { times: [0, 0.6, 1] }
                        }}
                        className={`absolute top-1/2 w-4 h-4 rounded-full shadow-xl transform -translate-y-1/2 border-2 border-white ${
                          won ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
                        }`}
                        style={{ left: `${currentResult}%`, marginLeft: '-8px' }}
                      >
                        <div className={`absolute inset-0 rounded-full animate-ping ${
                          won ? 'bg-green-300' : 'bg-red-300'
                        } opacity-30`}></div>
                      </motion.div>
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
                    className={`h-8 text-xs ${direction === 'under' ? 'bg-green-500 hover:bg-green-600' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`}
                  >
                    Under {target}
                  </Button>
                  <Button
                    variant={direction === 'over' ? "default" : "outline"}
                    onClick={() => setDirection('over')}
                    className={`h-8 text-xs ${direction === 'over' ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}
                  >
                    Over {target}
                  </Button>
                </div>
                              </div>

              {/* Live Ticker Animation - Moved up for mobile visibility */}
              {(isTicking || showResult) && (
                <div className="bg-[#1a2c38] rounded-lg p-2 mb-2 border border-[#00d4ff]/30 relative overflow-hidden" style={{ height: '120px' }}>
                  <div className="absolute inset-0 flex flex-col justify-center">
                    <div className="text-xs text-gray-500 mb-2 text-center">
                      {''}
                    </div>
                    <div className="flex flex-col space-y-9 flex-1">
                      <div className="text-xl font-bold h-8">
                        {isTicking ? (
                          <div className="flex justify-center items-center min-h-[60px] relative py-8">
                            <motion.div
                              className="flex justify-center items-center space-x-1"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {tickerValues.map((value, index) => (
                                <motion.div
                                  key={index}
                                  initial={{
                                    opacity: 0,
                                    scale: 0.3,
                                    rotateY: -90,
                                    y: 20
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                    rotateY: 0,
                                    y: 0
                                  }}
                                  transition={{
                                    duration: 0.4,
                                    delay: index * 0.08,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15
                                  }}
                                  whileHover={{
                                    scale: 1.1,
                                    rotateY: 10,
                                    transition: { duration: 0.2 }
                                  }}
                                  className="text-lg bg-gradient-to-br from-[#00d4ff] via-[#0099cc] to-[#0077aa] px-3 py-2 rounded-lg border-2 border-[#00d4ff]/80 font-bold shadow-lg shadow-[#00d4ff]/30 relative overflow-hidden"
                                >
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      delay: index * 0.2,
                                      ease: "easeInOut"
                                    }}
                                  />
                                  <span className="relative z-10 text-white drop-shadow-lg">
                                    {value}
                                  </span>
                                </motion.div>
                              ))}
                            </motion.div>
                            {/* Spinning ring effect */}
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-[#00d4ff]/30"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                              style={{
                                width: '80px',
                                height: '80px',
                                margin: 'auto'
                              }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-full border border-[#00d4ff]/60"
                              animate={{ rotate: -360 }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                              style={{
                                width: '60px',
                                height: '60px',
                                margin: 'auto'
                              }}
                            />
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                            className={`text-3xl py-3 rounded-lg border-2 font-bold w-full text-center ${
                              won ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30' : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-lg shadow-red-500/30'
                            }`}
                          >
                            {finalResult}
                          </motion.div>
                        )}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: showResult ? 1 : 0, y: showResult ? 0 : 8 }}
                        transition={{ delay: 0.15 }}
                        className={`text-lg font-bold py-0 rounded-lg border-2 w-full text-center min-h-[32px] flex flex-col justify-center ${
                          won ? 'bg-green-500/20 text-green-400 border-green-500/60 shadow-md' : 'bg-red-500/20 text-red-400 border-red-500/60 shadow-md'
                        }`}
                      >
                        <div className={`text-center ${won ? '' : 'mt-2.5'}`}>
                          {won ? 'WIN!' : 'LOSS'}
                        </div>
                        <div className={`text-xs mt-0.5 text-center ${won ? '' : 'invisible'}`}>
                          {won ? `+${formatCurrency(potentialWin - betAmount)} ${selectedCurrency}` : '+$0.00 USD'}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Stats - Stake Style */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1a2c38] rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-0.5">Multiplier</div>
                  <div className="text-sm font-bold text-white">
                    {multiplier < 2 ? multiplier.toFixed(4) :
                     multiplier < 10 ? multiplier.toFixed(3) :
                     multiplier < 100 ? multiplier.toFixed(2) :
                     multiplier.toFixed(1)}x
                  </div>
                </div>
                <div className="bg-[#1a2c38] rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-0.5">Roll {direction === 'under' ? 'Under' : 'Over'}</div>
                  <div className="text-sm font-bold text-white">{target}</div>
                </div>
                <div className="bg-[#1a2c38] rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-0.5">Win Chance</div>
                  <div className="text-sm font-bold text-green-400">
                    {(direction === 'under' ? target : (100 - target)).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Turbo Toggle */}
              <div className="bg-[#1a2c38] rounded-lg p-1.5 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Turbo</span>
                  <button
                    onClick={() => {
                      if (turboSpeed === 'fast') {
                        setTurboSpeed('ultra');
                      } else if (turboSpeed === 'ultra') {
                        setTurboSpeed('instant');
                      } else if (turboSpeed === 'instant') {
                        setTurboSpeed('fast');
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                      turboSpeed === 'fast' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' :
                      turboSpeed === 'ultra' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                      'bg-red-500 text-white hover:bg-red-600'
                    }`}
                    title="Click to cycle turbo speeds (Ctrl+T to disable)"
                  >
                    {turboSpeed === 'fast' ? 'Off' :
                     turboSpeed === 'ultra' ? 'Ultra' :
                     'Inst'}
                  </button>
                </div>
              </div>

              {/* Bet Amount - Stake Style */}
              <div className="bg-[#1a2c38] rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Bet Amount</span>
                  <span className="text-xs text-gray-400">{selectedCurrency}0.00</span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
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
                <div className="grid grid-cols-5 gap-2 mb-2">
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
                  onClick={() => {
                    setGameMode('auto')
                    setShowAutoModal(true)
                  }}
                  className={`${gameMode === 'auto' ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300'}`}
                >
                  Auto
                </Button>
              </div>

              {/* Roll Button */}
                              <Button
                  onClick={autoProgress.isRunning ? () => {
                    setAutoProgress(prev => ({ ...prev, isRunning: false }))
                    isRunningRef.current = false
                  } : placeBet}
                  disabled={(!autoProgress.isRunning && (isRolling || betAmount <= 0)) || (autoProgress.isRunning && !autoSettings.enabled)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-sm sm:text-lg font-semibold py-2 sm:py-3 rounded-lg min-h-[44px] flex items-center justify-center"
                >
                  {autoProgress.isRunning ? (
                    <div className="flex items-center">
                      <Pause className="h-5 w-5 mr-2" />
                      {isDesktop ? 'Stop Auto' : `Stop Auto (${autoProgress.currentBet}/${autoSettings.betCount})`}
                    </div>
                  ) : isRolling ? (
                    <div className="flex items-center">
                      <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                      Rolling...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="text-center leading-tight">{gameMode === 'auto' ? getAutoButtonText() : 'Bet'}</span>
                    </div>
                  )}
                </Button>


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
        )}

        {/* Modals - Shared between desktop and mobile */}
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
                {/* Active Seeds & Nonce Display */}
                <div className="bg-[#2d3748] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-[#00d4ff]" />
                    Active Seeds & Nonce
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#1a2c38] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Client Seed</div>
                      <div className="text-sm text-[#00d4ff] font-mono break-all">
                        {session.clientSeed}
                      </div>
                    </div>

                    <div className="bg-[#1a2c38] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Server Seed (Hashed)</div>
                      <div className="text-sm text-orange-400 font-mono break-all">
                        {hashedServerSeed || 'Not available'}
                      </div>
                    </div>

                    <div className="bg-[#1a2c38] rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Nonce</div>
                      <div className="text-sm text-green-400 font-mono">
                        {session.nonce}
                      </div>
                    </div>
                  </div>

                  {/* Seed Rotation Section */}
                  <div className="border-t border-[#374151] pt-4">
                    <h4 className="text-md font-semibold text-white mb-3">Rotate Client Seed</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">New Client Seed (Optional)</label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={customClientSeed}
                            onChange={(e) => setCustomClientSeed(e.target.value)}
                            className="bg-[#1a2c38] border-[#374151] text-white flex-1 text-sm"
                            placeholder="Enter custom seed or leave empty for random"
                          />
                          <Button
                            variant="outline"
                            onClick={generateRandomSeed}
                            className="text-[#00d4ff] border-[#00d4ff] hover:bg-[#00d4ff] hover:text-black px-3 py-2"
                          >
                            <Shuffle className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to generate a random seed
                        </p>
                      </div>

                      <Button
                        onClick={handleChangeSeeds}
                        className="w-full bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90 font-semibold"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Rotate Seeds
                      </Button>
                    </div>
                  </div>
                </div>

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
                      â€¢ https://provablyfair.me
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

        {/* Auto Settings Modal */}
        {showAutoModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2c38] rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Settings className="h-6 w-6 mr-2" />
                  Auto Bet Settings
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAutoModal(false)}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                {/* Number of Bets */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Number of Bets</label>
                  <Input
                    type="number"
                    value={autoSettings.betCount}
                    onChange={(e) => setAutoSettings(prev => ({ ...prev, betCount: parseInt(e.target.value) || 10 }))}
                    min="1"
                    max="1000"
                    className="bg-[#2d3748] border-[#374151] text-white"
                  />
                </div>

                {/* Stop on Profit */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Stop on Profit</label>
                    <input
                      type="checkbox"
                      checked={autoSettings.stopOnWin}
                      onChange={(e) => setAutoSettings(prev => ({ ...prev, stopOnWin: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>
                  {autoSettings.stopOnWin && (
                    <Input
                      type="number"
                      value={autoSettings.winAmount}
                      onChange={(e) => setAutoSettings(prev => ({ ...prev, winAmount: parseFloat(e.target.value) || 100 }))}
                      min="0"
                      step="0.01"
                      placeholder="Profit amount to stop"
                      className="bg-[#2d3748] border-[#374151] text-white"
                    />
                  )}
                </div>

                {/* Stop on Loss */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Stop on Loss</label>
                    <input
                      type="checkbox"
                      checked={autoSettings.stopOnLoss}
                      onChange={(e) => setAutoSettings(prev => ({ ...prev, stopOnLoss: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>
                  {autoSettings.stopOnLoss && (
                    <Input
                      type="number"
                      value={autoSettings.lossAmount}
                      onChange={(e) => setAutoSettings(prev => ({ ...prev, lossAmount: parseFloat(e.target.value) || 50 }))}
                      min="0"
                      step="0.01"
                      placeholder="Loss amount to stop"
                      className="bg-[#2d3748] border-[#374151] text-white"
                    />
                  )}
                </div>

                {/* Turbo Mode */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">Enable Turbo</label>
                    <input
                      type="checkbox"
                      checked={autoSettings.turboEnabled}
                      onChange={(e) => setAutoSettings(prev => ({ ...prev, turboEnabled: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>
                  {autoSettings.turboEnabled && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 block">Turbo Speed</label>
                      <select
                        value={autoSettings.turboSpeed}
                        onChange={(e) => setAutoSettings(prev => ({ ...prev, turboSpeed: e.target.value as 'fast' | 'ultra' | 'instant' }))}
                        className="w-full bg-[#2d3748] border-[#374151] text-white text-sm rounded px-3 py-2"
                      >
                        <option value="fast">Fast (200ms)</option>
                        <option value="ultra">Ultra (1ms)</option>
                        <option value="instant">Instant (0ms)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowAutoModal(false)
                      setAutoSettings(prev => ({ ...prev, enabled: true }))
                    }}
                    className="flex-1 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                  >
                    {getAutoButtonText()}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAutoModal(false)}
                    className="flex-1 border-[#374151] text-gray-300 hover:bg-[#374151]"
                  >
                    Cancel
                  </Button>
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
