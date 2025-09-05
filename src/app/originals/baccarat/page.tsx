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
  Keyboard,
  Heart,
  Diamond,
  Club,
  Spade,
  Users,
  UserCheck,
  Scale
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'
import { useGameStatsStore } from '@/store/gameStatsStore'
import { formatCurrency } from '@/lib/utils'
import CasinoLayout from '@/components/layout/CasinoLayout'
import {
  generateServerSeed,
  generateClientSeed,
  getHashedServerSeed,
  HOUSE_EDGE
} from '@/lib/rgsUtils'

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: number // 1-13 (1=Ace, 11=Jack, 12=Queen, 13=King)
  display: string // 'A', '2', '3', ..., '10', 'J', 'Q', 'K'
}

interface BaccaratSession {
  serverSeed: string
  hashedServerSeed: string
  clientSeed: string
  nonce: number
}

interface GameResult {
  playerHand: Card[]
  bankerHand: Card[]
  playerScore: number
  bankerScore: number
  winner: 'player' | 'banker' | 'tie'
  betType: 'player' | 'banker' | 'tie'
  betAmount: number
  payout: number
  timestamp: Date
}

type BetType = 'player' | 'banker' | 'tie'

const EdgeBaccarat: React.FC = () => {
  const { user, selectedCurrency } = useUserStore()
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentGame, setCurrentGame] = useState<{
    playerHand: Card[]
    bankerHand: Card[]
    deck: Card[]
    gameState: 'betting' | 'dealing' | 'complete'
    betType: BetType | null
    betAmount: number
    playerScore?: number
    bankerScore?: number
  } | null>(null)

  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [session, setSession] = useState<BaccaratSession>({
    serverSeed: '',
    hashedServerSeed: '',
    clientSeed: '',
    nonce: 0
  })

  const [showFairness, setShowFairness] = useState(false)
  const [copiedSeed, setCopiedSeed] = useState<'server' | 'client' | null>(null)

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const newServerSeed = generateServerSeed()
      const newClientSeed = generateClientSeed()
      const hashedServerSeed = await getHashedServerSeed(newServerSeed)

      setSession({
        serverSeed: newServerSeed,
        hashedServerSeed,
        clientSeed: newClientSeed,
        nonce: 0
      })
    }
    
    initSession()
  }, [])

  // Create a deck of cards
  const createDeck = (): Card[] => {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
    const deck: Card[] = []
    
    for (const suit of suits) {
      for (let value = 1; value <= 13; value++) {
        let display = ''
        if (value === 1) display = 'A'
        else if (value === 11) display = 'J'
        else if (value === 12) display = 'Q'
        else if (value === 13) display = 'K'
        else display = value.toString()
        
        deck.push({ suit, value, display })
      }
    }
    
    return shuffleDeck(deck)
  }

  // Shuffle deck using RGS system
  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck]
    const seed = session.serverSeed + session.clientSeed + session.nonce
    
    // Use RGS system for provably fair shuffle
    let currentSeed = seed
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Generate a random index using the seed
      const seedBytes = new TextEncoder().encode(currentSeed)
      // Create a simple hash-like function since crypto.subtle.digestSync doesn't exist
      let hash = 0
      for (let j = 0; j < seedBytes.length; j++) {
        const char = seedBytes[j]
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      const j = Math.abs(hash) % (i + 1)
      
      // Swap cards
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      
      // Update seed for next iteration
      currentSeed = hash.toString() + currentSeed
    }
    
    return shuffled
  }

  // Calculate Baccarat score (0-9)
  const calculateBaccaratScore = (hand: Card[]): number => {
    let total = 0
    for (const card of hand) {
      let value = card.value
      if (value >= 10) value = 0 // Face cards and 10s are worth 0
      total += value
    }
    return total % 10
  }

  // Deal initial cards
  const dealInitialCards = (deck: Card[]): { playerHand: Card[], bankerHand: Card[], remainingDeck: Card[] } => {
    const playerHand: Card[] = []
    const bankerHand: Card[] = []
    let remainingDeck = [...deck]

    // Deal 2 cards to each
    for (let i = 0; i < 2; i++) {
      playerHand.push(remainingDeck.pop()!)
      bankerHand.push(remainingDeck.pop()!)
    }

    return { playerHand, bankerHand, remainingDeck }
  }


  // Calculate payout based on bet type and result
  const calculatePayout = (betType: BetType, winner: 'player' | 'banker' | 'tie', betAmount: number): number => {
    if (betType === 'tie' && winner === 'tie') {
      return betAmount * 8 // Tie pays 8:1
    } else if (betType === 'banker' && winner === 'banker') {
      return betAmount * 1.95 // Banker pays 1.95:1 (5% commission)
    } else if (betType === 'player' && winner === 'player') {
      return betAmount * 2 // Player pays 1:1
    }
    return 0 // Loss
  }

  // Start new game
  const startNewGame = useCallback(async (betType: BetType) => {
    if (!user || betAmount <= 0) return

    setIsPlaying(true)
    const deck = createDeck()
    
    setCurrentGame({
      playerHand: [],
      bankerHand: [],
      deck,
      gameState: 'betting',
      betType,
      betAmount
    })

    // Start dealing animation
    setCurrentGame(prev => prev ? {
      ...prev,
      playerHand: [],
      bankerHand: [],
      deck,
      gameState: 'dealing',
      playerScore: undefined,
      bankerScore: undefined
    } : null)

    // Deal cards progressively with delays
    const dealCards = async () => {
      const { playerHand, bankerHand, remainingDeck } = dealInitialCards(deck)
      
      // Deal first card to player
      setCurrentGame(prev => prev ? {
        ...prev,
        playerHand: [playerHand[0]],
        bankerHand: [],
        playerScore: calculateBaccaratScore([playerHand[0]]),
        bankerScore: undefined
      } : null)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Deal first card to banker
      setCurrentGame(prev => prev ? {
        ...prev,
        bankerHand: [bankerHand[0]],
        bankerScore: calculateBaccaratScore([bankerHand[0]])
      } : null)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Deal second card to player
      setCurrentGame(prev => prev ? {
        ...prev,
        playerHand: [playerHand[0], playerHand[1]],
        playerScore: calculateBaccaratScore([playerHand[0], playerHand[1]])
      } : null)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Deal second card to banker
      setCurrentGame(prev => prev ? {
        ...prev,
        bankerHand: [bankerHand[0], bankerHand[1]],
        bankerScore: calculateBaccaratScore([bankerHand[0], bankerHand[1]])
      } : null)
      
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Calculate initial scores
      const playerScore = calculateBaccaratScore(playerHand)
      const bankerScore = calculateBaccaratScore(bankerHand)
      
      let finalPlayerHand = [...playerHand]
      let finalBankerHand = [...bankerHand]
      let finalDeck = [...remainingDeck]
      
      // Determine if player gets third card
      let playerThird = false
      if (playerScore <= 5) {
        playerThird = true
        finalPlayerHand.push(finalDeck.pop()!)
        
        // Deal third card to player
        await new Promise(resolve => setTimeout(resolve, 300))
        setCurrentGame(prev => prev ? {
          ...prev,
          playerHand: finalPlayerHand,
          playerScore: calculateBaccaratScore(finalPlayerHand)
        } : null)
      }
      
      // Determine if banker gets third card
      let bankerThird = false
      if (!playerThird) {
        // No player third card
        if (bankerScore <= 5) {
          bankerThird = true
          finalBankerHand.push(finalDeck.pop()!)
        }
      } else {
        // Player gets third card - use proper Baccarat rules
        const playerThirdCard = finalPlayerHand[2]
        const playerThirdValue = playerThirdCard.value >= 10 ? 0 : playerThirdCard.value

        if (bankerScore <= 2) {
          bankerThird = true
        } else if (bankerScore === 3) {
          bankerThird = playerThirdValue !== 8
        } else if (bankerScore === 4) {
          bankerThird = playerThirdValue >= 2 && playerThirdValue <= 7
        } else if (bankerScore === 5) {
          bankerThird = playerThirdValue >= 4 && playerThirdValue <= 7
        } else if (bankerScore === 6) {
          bankerThird = playerThirdValue >= 6 && playerThirdValue <= 7
        }

        if (bankerThird) {
          finalBankerHand.push(finalDeck.pop()!)
        }
      }
      
      // Deal third card to banker if needed
      if (bankerThird) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setCurrentGame(prev => prev ? {
          ...prev,
          bankerHand: finalBankerHand,
          bankerScore: calculateBaccaratScore(finalBankerHand)
        } : null)
      }
      
      // Calculate final scores
      const finalPlayerScore = calculateBaccaratScore(finalPlayerHand)
      const finalBankerScore = calculateBaccaratScore(finalBankerHand)
      
      // Determine winner
      let winner: 'player' | 'banker' | 'tie'
      if (finalPlayerScore > finalBankerScore) {
        winner = 'player'
      } else if (finalBankerScore > finalPlayerScore) {
        winner = 'banker'
      } else {
        winner = 'tie'
      }
      
      // Calculate payout
      const payout = calculatePayout(betType, winner, betAmount)
      
      // Wait for cards to settle before showing result
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCurrentGame(prev => prev ? {
        ...prev,
        gameState: 'complete'
      } : null)

      // Add to history
      const result: GameResult = {
        playerHand: finalPlayerHand,
        bankerHand: finalBankerHand,
        playerScore: finalPlayerScore,
        bankerScore: finalBankerScore,
        winner,
        betType,
        betAmount,
        payout,
        timestamp: new Date()
      }

      setGameHistory(prev => [result, ...prev.slice(0, 9)])

      // Update balance
      if (payout > 0) {
        // Win
        user.balance += payout
      } else {
        // Loss
        user.balance -= betAmount
      }

      // Add to game stats
      const resultValue = winner === 'player' ? 1 : winner === 'banker' ? 2 : 3
      const targetValue = betType === 'player' ? 1 : betType === 'banker' ? 2 : 3
      addRoll({
        result: resultValue,
        won: payout > 0,
        target: targetValue,
        direction: 'under', // Default value since baccarat doesn't use direction
        betAmount,
        payout,
        timestamp: new Date(),
        gameType: 'baccarat'
      })

      // Increment nonce for next game
      setSession(prev => ({ ...prev, nonce: prev.nonce + 1 }))

      setIsPlaying(false)
    }
    
    dealCards()
  }, [user, betAmount, session, addRoll])

  // Copy seed to clipboard
  const copyToClipboard = async (text: string, type: 'server' | 'client') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSeed(type)
      setTimeout(() => setCopiedSeed(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Reset game
  const resetGame = () => {
    setCurrentGame(null)
    setIsPlaying(false)
  }

  // Get suit icon
  const getSuitIcon = (suit: Card['suit']) => {
    switch (suit) {
      case 'hearts': return <Heart className="h-4 w-4 text-red-500" />
      case 'diamonds': return <Diamond className="h-4 w-4 text-red-500" />
      case 'clubs': return <Club className="h-4 w-4 text-black" />
      case 'spades': return <Spade className="h-4 w-4 text-black" />
    }
  }

  // Get suit color
  const getSuitColor = (suit: Card['suit']) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black'
  }

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419]">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center space-x-3 mb-4">
            <img src="/Logo11.png" alt="Edge Casino" className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-white">Edge Baccarat</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Bet on Player, Banker, or Tie. Closest to 9 wins!
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Betting Controls */}
            <div className="lg:col-span-1 space-y-4">
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
                    {formatCurrency(betAmount * 1.95 - betAmount)} {selectedCurrency}
                  </span>
                </div>
              </div>

              {/* Betting Options */}
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <div className="text-lg text-gray-400 mb-3">Bet On</div>
                <div className="space-y-2">
                  <Button
                    onClick={() => startNewGame('player')}
                    disabled={isPlaying || !user || betAmount <= 0 || currentGame?.gameState === 'dealing' || currentGame?.gameState === 'complete'}
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    Player (1:1)
                  </Button>
                  <Button
                    onClick={() => startNewGame('banker')}
                    disabled={isPlaying || !user || betAmount <= 0 || currentGame?.gameState === 'dealing' || currentGame?.gameState === 'complete'}
                    className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Banker (1.95:1)
                  </Button>
                  <Button
                    onClick={() => startNewGame('tie')}
                    disabled={isPlaying || !user || betAmount <= 0 || currentGame?.gameState === 'dealing' || currentGame?.gameState === 'complete'}
                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Scale className="h-5 w-5 mr-2" />
                    Tie (8:1)
                  </Button>
                </div>
              </div>

              {/* Fairness */}
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <Button
                  onClick={() => setShowFairness(!showFairness)}
                  className="w-full h-12 text-lg bg-[#00d4ff] text-black hover:bg-[#00b8e6]"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Fairness
                </Button>
              </div>

              {/* Game Stats */}
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <div className="text-lg text-gray-400 mb-3">Game Stats</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Games Played:</span>
                    <span className="text-white">{gameHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-green-400">
                      {gameHistory.length > 0 
                        ? `${((gameHistory.filter(g => g.payout > 0).length / gameHistory.length) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Wagered:</span>
                    <span className="text-white">
                      ${gameHistory.reduce((sum, g) => sum + g.betAmount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a2c38] rounded-lg p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Baccarat Table</h2>
                  <p className="text-gray-400">Bet on Player, Banker, or Tie</p>
                </div>

                {/* Game Board */}
                <div className="bg-green-800 rounded-lg p-6 mb-6">
                  {/* Player Area */}
                  <div className="mb-8">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-white">Player</h3>
                      {currentGame && currentGame.playerScore !== undefined && (
                        <div className="text-lg text-blue-400">
                          Score: {currentGame.playerScore}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center space-x-2">
                      {currentGame?.playerHand.map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.3 }}
                          className="bg-white rounded-lg p-3 w-16 h-24 flex flex-col justify-between items-center shadow-lg"
                        >
                          <div className={`text-lg font-bold ${getSuitColor(card.suit)}`}>
                            {card.display}
                          </div>
                          <div className="text-xs">
                            {getSuitIcon(card.suit)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Banker Area */}
                  <div>
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-white">Banker</h3>
                      {currentGame && currentGame.bankerScore !== undefined && (
                        <div className="text-lg text-red-400">
                          Score: {currentGame.bankerScore}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center space-x-2">
                      {currentGame?.bankerHand.map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.3 }}
                          className="bg-white rounded-lg p-3 w-16 h-24 flex flex-col justify-between items-center shadow-lg"
                        >
                          <div className={`text-lg font-bold ${getSuitColor(card.suit)}`}>
                            {card.display}
                          </div>
                          <div className="text-xs">
                            {getSuitIcon(card.suit)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Game Result */}
                {currentGame?.gameState === 'complete' && gameHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-white mb-2">
                      {gameHistory[0]?.winner === 'player' && 'Player Wins!'}
                      {gameHistory[0]?.winner === 'banker' && 'Banker Wins!'}
                      {gameHistory[0]?.winner === 'tie' && 'Tie!'}
                    </div>
                    {gameHistory[0]?.payout > 0 && (
                      <div className="text-xl text-green-400 font-bold">
                        +${gameHistory[0].payout.toFixed(2)} SC
                      </div>
                    )}
                    <Button
                      onClick={resetGame}
                      className="mt-4 bg-[#00d4ff] text-black hover:bg-[#00b8e6]"
                    >
                      New Game
                    </Button>
                  </motion.div>
                )}

                {/* Dealing State */}
                {currentGame?.gameState === 'dealing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="text-xl text-gray-400 mb-4">
                      Cards are being dealt...
                    </div>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Game History */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#1a2c38] rounded-lg p-6">
                <div className="text-lg text-gray-400 mb-4">Recent Games</div>
                <div className="space-y-2">
                  {gameHistory.slice(0, 10).map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          game.winner === 'player' ? 'bg-blue-500' :
                          game.winner === 'banker' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <span className="text-white text-sm capitalize">{game.betType}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {game.playerScore} - {game.bankerScore}
                        </div>
                        <div className={`text-xs ${
                          game.payout > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {game.payout > 0 ? `+$${game.payout.toFixed(2)}` : `-$${game.betAmount.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fairness Modal */}
        <AnimatePresence>
          {showFairness && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowFairness(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1a2c38] rounded-lg p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Provably Fair</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFairness(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Server Seed (Hashed)</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={session.hashedServerSeed}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(session.hashedServerSeed, 'server')}
                      >
                        {copiedSeed === 'server' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Client Seed</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={session.clientSeed}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(session.clientSeed, 'client')}
                      >
                        {copiedSeed === 'client' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Nonce</label>
                    <Input
                      value={session.nonce}
                      readOnly
                      className="text-xs font-mono"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>• Server seed is hashed before the game starts</p>
                    <p>• You can verify results using the seeds</p>
                    <p>• Each game increments the nonce</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CasinoLayout>
  )
}

export default EdgeBaccarat
