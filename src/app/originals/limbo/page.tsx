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
import { useUserStore } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'
import { useGameStatsStore } from '@/store/gameStatsStore'
import { useGlobalNonceStore } from '@/store/gameStore'
import { formatCurrency } from '@/lib/utils'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { recordGameWin, recordGameLoss } from '@/lib/gameSessionManager'
import {
  generateServerSeed,
  generateClientSeed,
  generateLimboResult,
  getHashedServerSeed,
  calculateLimboWinChance,
  HOUSE_EDGE
} from '@/lib/rgsUtils'

interface LimboSession {
  serverSeed: string
  hashedServerSeed: string
  clientSeed: string
  nonce: number
}

interface LimboResult {
  multiplier: number
  won: boolean
  targetMultiplier: number
  betAmount: number
  payout: number
  timestamp: Date
}

const EdgeLimbo: React.FC = () => {
  const { user } = useUserStore()
  const { setLiveStatsModal } = useUIStore()
  const { addRoll } = useGameStatsStore()
  const { 
    globalNonce, 
    serverSeed, 
    clientSeed, 
    hashedServerSeed,
    incrementNonce,
    setServerSeed,
    setClientSeed,
    setHashedServerSeed,
    resetSession: resetGlobalSession
  } = useGlobalNonceStore()

  // Screen size detection
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Game state
  const [betAmount, setBetAmount] = useState<number>(0.01)
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0)
  const [isRolling, setIsRolling] = useState(false)
  const [currentResult, setCurrentResult] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [showFairnessModal, setShowFairnessModal] = useState(false)
  const [showSeedsModal, setShowSeedsModal] = useState(false)
  const [showAutoModal, setShowAutoModal] = useState(false)
  const [localHashedServerSeed, setLocalHashedServerSeed] = useState<string>('')
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
    targetMultiplier: 2.0
  })

  // Ticker animation state
  const [isTicking, setIsTicking] = useState(false)
  const [tickerValues, setTickerValues] = useState<number[]>([])
  const [finalResult, setFinalResult] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [tickerPosition, setTickerPosition] = useState<number>(0)

  // Session management - now using global nonce
  // Remove old session state - using global store instead
  
  // Use ref to track current nonce for immediate access
  const currentNonceRef = useRef(0)
  const isRollingRef = useRef(false)

  // History
  const [history, setHistory] = useState<LimboResult[]>([])
  const [maxHistory] = useState(50)

  // Quick bet amounts
  const quickBetAmounts = [0.01, 0.10, 1.00, 10.00, 100.00]

  // Quick multiplier presets
  const multiplierPresets = [
    { label: '2x', value: 2.0, color: 'text-green-400' },
    { label: '5x', value: 5.0, color: 'text-blue-400' },
    { label: '10x', value: 10.0, color: 'text-purple-400' },
    { label: '50x', value: 50.0, color: 'text-yellow-400' },
    { label: '100x', value: 100.0, color: 'text-orange-400' },
    { label: '1000x', value: 1000.0, color: 'text-red-400' },
    { label: '10000x', value: 10000.0, color: 'text-pink-400' }
  ]

  // Calculate win chance and payout using RGS system
  const winChance = calculateLimboWinChance(targetMultiplier)
  const potentialPayout = betAmount * targetMultiplier
  const potentialWin = potentialPayout

  // Initialize session
  useEffect(() => {
    initializeSession()
  }, [])

  // Update hashed server seed when session changes
  useEffect(() => {
    const updateHashedServerSeed = async () => {
      if (serverSeed) {
        const hash = await getHashedServerSeed(serverSeed)
        setLocalHashedServerSeed(hash)
      } else {
        setLocalHashedServerSeed('')
      }
    }
    updateHashedServerSeed()
  }, [serverSeed])

  const initializeSession = async () => {
    // Initialize global session if not already set
    if (!serverSeed) {
      const newServerSeed = generateServerSeed()
      const newClientSeed = generateClientSeed()
      const newHashedServerSeed = await getHashedServerSeed(newServerSeed)
      
      setServerSeed(newServerSeed)
      setClientSeed(newClientSeed)
      setHashedServerSeed(newHashedServerSeed)
      setLocalHashedServerSeed(newHashedServerSeed)
    } else {
      setLocalHashedServerSeed(hashedServerSeed)
    }
    
    // Reset the nonce ref to match global nonce
    currentNonceRef.current = globalNonce
  }

  // Handle bet amount changes
  const handleBetAmountChange = (amount: number) => {
    if (amount < 0.01) amount = 0.01
    if (amount > 10000) amount = 10000
    setBetAmount(amount)
  }

  // Handle multiplier changes
  const handleMultiplierChange = (multiplier: number) => {
    if (multiplier < 1.01) multiplier = 1.01
    if (multiplier > 1000000) multiplier = 1000000
    setTargetMultiplier(multiplier)
  }

  // Ticker animation function
  const runTickerAnimation = async (finalValue: number) => {
    setIsTicking(true)
    setShowResult(false)
    setTickerValues([])
    setTickerPosition(0)
    
    // Consistent fast speed like Stake/Roobet
    const duration = 800 // Fixed duration regardless of final value
    const steps = 80 // More steps for smoother counting
    const stepDuration = duration / steps
    
    // Start from 1.00 and count up at consistent speed
    let currentValue = 1.00
    const increment = (finalValue - 1.00) / steps
    
    for (let i = 0; i < steps; i++) {
      currentValue = 1.00 + (increment * i)
      
      setTickerValues([currentValue])
      setTickerPosition((i / steps) * 100)

      await new Promise(resolve => setTimeout(resolve, stepDuration))
    }
    
    // Show final result
    setFinalResult(finalValue)
    setShowResult(true)
    setIsTicking(false)
  }

  // Roll the limbo
  const rollLimbo = useCallback(async () => {
    // Prevent multiple simultaneous calls using ref for immediate check
    if (isRollingRef.current) {
      console.log('Roll already in progress, ignoring duplicate call')
      return
    }

    if (!user || betAmount <= 0) return

    // Check if user has enough balance
    if (user.balance < betAmount) {
      alert('Insufficient balance')
      return
    }

    isRollingRef.current = true
    setIsRolling(true)
    
    try {
      // Clear previous result immediately to prevent overlap
      setCurrentResult(null)
      setWon(null)
      setIsTicking(false) // Ensure rolling state is reset

      // Get current session state and increment nonce IMMEDIATELY
      // Use the ref to ensure we get the most current nonce
      const newNonce = currentNonceRef.current + 1
      currentNonceRef.current = newNonce
      incrementNonce() // Increment global nonce to keep it in sync
      
      // Add timestamp to ensure uniqueness even if refs are somehow duplicated
      const uniqueNonce = newNonce + Date.now() % 1000
    
    console.log('Rolling with unique nonce:', uniqueNonce, 'Base nonce:', newNonce, 'Server seed:', serverSeed.slice(0, 8), 'Client seed:', (customClientSeed || clientSeed).slice(0, 8))

    // Generate result using RGS system
    const rgsResult = await generateLimboResult({
      serverSeed: serverSeed,
      clientSeed: customClientSeed || clientSeed,
      nonce: uniqueNonce,
      gameType: 'limbo'
    })
    
    console.log('RGS Result:', rgsResult.result, 'Hash:', rgsResult.hash.slice(0, 8))

    const result = rgsResult.result
    const won = result >= targetMultiplier
    const payout = won ? betAmount * targetMultiplier : 0

    // Update session with new nonce - no longer needed, using global nonce
    // setSession(prev => ({
    //   ...prev,
    //   nonce: newNonce
    // }))

    // Add to history
    const newResult: LimboResult = {
      multiplier: result,
      won,
      targetMultiplier,
      betAmount,
      payout,
      timestamp: new Date()
    }

    setHistory(prev => {
      const newHistory = [newResult, ...prev]
      return newHistory.slice(0, maxHistory)
    })

    // Update game stats
    addRoll({
      result: result,
      won,
      target: targetMultiplier,
      direction: 'over',
      betAmount,
      payout,
      timestamp: new Date(),
      gameType: 'limbo'
    })

    // Record game session for live feed and raffle tracking
    try {
      if (won && payout > 0) {
        await recordGameWin(
          user.id,
          'limbo',
          'Limbo',
          betAmount,
          payout,
          targetMultiplier,
          {
            result: result,
            targetMultiplier: targetMultiplier,
            crashPoint: result,
            nonce: uniqueNonce
          }
        )
      } else {
        await recordGameLoss(
          user.id,
          'limbo',
          'Limbo',
          betAmount,
          targetMultiplier,
          {
            result: result,
            targetMultiplier: targetMultiplier,
            crashPoint: result,
            nonce: uniqueNonce
          }
        )
      }
    } catch (error) {
      console.error('Error recording game session:', error)
    }

    // Run ticker animation
    await runTickerAnimation(result)

      // Show final result
      setCurrentResult(result)
      setWon(won)
      setIsRolling(false)
      isRollingRef.current = false // Reset the ref to allow next roll
    } catch (error) {
      console.error('Error in rollLimbo:', error)
      setIsRolling(false)
      isRollingRef.current = false // Reset the ref even on error
    }
  }, [user, betAmount, targetMultiplier, addRoll, customClientSeed])

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // Reset session
  const resetSession = async () => {
    await initializeSession()
    setHistory([])
  }

  return (
    <CasinoLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <img src="/Logo11.png" alt="Edge Casino" className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-white">Edge Limbo</h1>
          </div>
          <p className="text-gray-400 text-lg">
            
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Betting Panel */}
          <div className="space-y-6">
            {/* Target Multiplier Slider */}
            <div className="bg-[#1a2c38] rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-2">Target Multiplier</div>
                <div className="text-3xl font-bold text-[#00d4ff]">
                  {targetMultiplier.toFixed(2)}x
                </div>
              </div>

                             {/* Slider */}
               <div className="relative mb-4">
                 <div className="w-full h-3 bg-[#2d3748] rounded-full relative">
                   {/* Slider track with gradient */}
                                       <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: `${Math.min(Math.log10(targetMultiplier) / Math.log10(1000), 1) * 100}%` }}
                    ></div>
                   
                   {/* Current result indicator */}
                   {currentResult !== null && !isTicking && (
                     <motion.div
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{
                         duration: 0.6,
                         ease: "easeOut",
                         scale: { times: [0, 0.6, 1] }
                       }}
                       className={`absolute top-1/2 w-5 h-5 rounded-full shadow-xl transform -translate-y-1/2 border-2 border-white ${
                         won ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
                       }`}
                                               style={{ 
                          left: `${Math.min(Math.log10(currentResult) / Math.log10(1000), 1) * 100}%`, 
                          marginLeft: '-10px' 
                        }}
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
                   min="1.01"
                   max="1000"
                   step="0.01"
                   value={targetMultiplier}
                   onChange={(e) => handleMultiplierChange(parseFloat(e.target.value))}
                   className="w-full h-12 bg-transparent absolute top-0 left-0 opacity-0 cursor-pointer"
                 />

                 {/* Scale markers */}
                 <div className="flex justify-between text-sm text-gray-400 mt-3">
                   <span>1x</span>
                   <span>10x</span>
                   <span>100x</span>
                   <span>1000x</span>
                 </div>
               </div>

               {/* Multiplier Presets */}
               <div className="grid grid-cols-4 gap-2">
                 {multiplierPresets.slice(0, 4).map((preset) => (
                   <Button
                     key={preset.value}
                     variant="outline"
                     size="sm"
                     onClick={() => setTargetMultiplier(preset.value)}
                     className={`${targetMultiplier === preset.value ? 'bg-[#00d4ff] text-black' : ''}`}
                   >
                     <span className={preset.color}>{preset.label}</span>
                   </Button>
                 ))}
               </div>

               {/* Roll Button */}
               <Button
                 onClick={rollLimbo}
                 disabled={isRolling || !user || betAmount <= 0}
                 size="lg"
                 className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black font-bold px-8 py-4 text-lg h-16 w-full mt-4"
               >
                 {isRolling ? (
                   <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                 ) : (
                   <Play className="h-5 w-5 mr-2" />
                 )}
                 Roll Limbo
               </Button>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-2">Multiplier</div>
                <div className="text-xl font-bold text-white">
                  {targetMultiplier < 2 ? targetMultiplier.toFixed(4) :
                   targetMultiplier < 10 ? targetMultiplier.toFixed(3) :
                   targetMultiplier < 100 ? targetMultiplier.toFixed(2) :
                   targetMultiplier.toFixed(1)}x
                </div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-2">Target</div>
                <div className="text-xl font-bold text-white">{targetMultiplier.toFixed(2)}x</div>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-2">Win Chance</div>
                <div className="text-xl font-bold text-green-400">
                  {(winChance * 100).toFixed(4)}%
                </div>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="bg-[#1a2c38] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg text-gray-400">Bet Amount</span>
                <span className="text-lg text-gray-400">SC0.00</span>
              </div>

              <div className="flex items-center space-x-3 mb-3">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => handleBetAmountChange(parseFloat(e.target.value) || 0)}
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
                {quickBetAmounts.map((amount) => (
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
                  {formatCurrency(potentialWin - betAmount)} SC
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

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="p-6 border-[#2d3748]">
              {/* Game Display */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">Target Multiplier</h2>
                  <div className="text-6xl font-bold text-[#00d4ff] mb-2">
                    {targetMultiplier.toFixed(2)}x
                  </div>
                  <div className="text-gray-400">
                    Win Chance: {(winChance * 100).toFixed(4)}%
                  </div>
                </div>

                                 {/* Result Display Container - Fixed Height */}
                 <div className="mb-6 h-32 flex items-center justify-center">
                   <AnimatePresence mode="wait">
                     {currentResult !== null && !isTicking && (
                       <motion.div
                         key="result"
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         transition={{ duration: 0.2 }}
                         className="text-center"
                       >
                         <div className="text-4xl font-bold mb-2">
                           <span className={won ? 'text-green-400' : 'text-red-400'}>
                             {currentResult.toFixed(2)}x
                           </span>
                         </div>
                         <div className={`text-lg font-semibold ${won ? 'text-green-400' : 'text-red-400'}`}>
                           {won ? 'WIN!' : 'LOSE'}
                         </div>
                         {won && (
                           <div className="text-green-400 text-xl font-bold">
                             +{formatCurrency(potentialPayout)}
                           </div>
                         )}
                       </motion.div>
                     )}
                     
                     {isTicking && (
                       <motion.div
                         key="rolling"
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         transition={{ duration: 0.2 }}
                         className="text-center"
                       >
                         <div className="text-4xl font-bold text-[#00d4ff] mb-2">
                           <motion.span
                             animate={{ opacity: [0.5, 1, 0.5] }}
                             transition={{ duration: 0.5, repeat: Infinity }}
                             className="inline-block"
                           >
                             {tickerValues[0]?.toFixed(2)}x
                           </motion.span>
                         </div>
                         <div className="text-lg font-semibold text-[#00d4ff]">
                           Rolling...
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>

                {/* Custom Multiplier Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Multiplier
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={targetMultiplier}
                      onChange={(e) => handleMultiplierChange(parseFloat(e.target.value) || 1.01)}
                      min="1.01"
                      max="1000000"
                      step="0.01"
                      className="flex-1"
                      placeholder="Enter multiplier"
                    />
                    <span className="text-gray-400">x</span>
                  </div>
                </div>

                {/* Multiplier Presets */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Quick Multipliers</h3>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {multiplierPresets.map((preset) => (
                      <Button
                        key={preset.value}
                        variant="outline"
                        size="sm"
                        onClick={() => setTargetMultiplier(preset.value)}
                        className={`${targetMultiplier === preset.value ? 'bg-[#00d4ff] text-black' : ''}`}
                      >
                        <span className={preset.color}>{preset.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* History */}
        <div className="mt-8">
          <Card variant="glass" className="p-6 border-[#2d3748]">
            <CardHeader>
              <CardTitle className="text-white">Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {history.slice(0, 16).map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-center text-sm font-bold ${
                      result.won 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {result.multiplier.toFixed(2)}x
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                      {customClientSeed || clientSeed}
                    </div>
                  </div>

                  <div className="bg-[#1a2c38] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Server Seed (Hashed)</div>
                    <div className="text-sm text-orange-400 font-mono break-all">
                      {localHashedServerSeed || 'Not available'}
                    </div>
                  </div>

                  <div className="bg-[#1a2c38] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Nonce</div>
                    <div className="text-sm text-green-400 font-mono">
                      {globalNonce}
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a2c38] rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">House Edge</div>
                  <div className="text-sm text-red-400 font-mono">
                    {(HOUSE_EDGE * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-[#2d3748] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-[#00d4ff]" />
                  How Provably Fair Works
                </h3>
                <div className="text-gray-300 space-y-3">
                  <p>
                    The underlying concept of provable fairness is that players have the ability to prove and verify that their results are fair and unmanipulated. This is achieved through the use of a <strong>commitment scheme</strong>, along with cryptographic hashing.
                  </p>
                  <p>
                    The commitment scheme is used to ensure that the player has an influence on all results generated. Cryptographic hashing is used to ensure that the casino also remains honest to this commitment scheme. Both concepts combined creates a trust-less environment when gambling online.
                  </p>
                  <p>This is simplified in the following representation:</p>
                  <div className="bg-[#1a2c38] rounded-lg p-3 font-mono text-sm">
                    <div className="text-[#00d4ff]">Server Seed + Client Seed + Nonce = Result</div>
                    <div className="text-gray-400 mt-1">SHA-256 Hash → Random Number → Game Result</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CasinoLayout>
  )
}

export default EdgeLimbo
