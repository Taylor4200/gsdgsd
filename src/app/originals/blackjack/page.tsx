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
  Spade
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

interface BlackjackSession {
  serverSeed: string
  hashedServerSeed: string
  clientSeed: string
  nonce: number
}

interface GameResult {
  playerHand: Card[]
  dealerHand: Card[]
  playerScore: number
  dealerScore: number
  won: boolean
  betAmount: number
  payout: number
  timestamp: Date
  gameType: 'hit' | 'stand' | 'double' | 'split' | 'insurance'
}

const EdgeBlackjack: React.FC = () => {
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
    dealerHand: Card[]
    deck: Card[]
    gameState: 'betting' | 'playing' | 'dealer' | 'complete' | 'insurance'
    splitHands?: Card[][]
    currentHandIndex?: number
    betAmounts?: number[]
    insuranceBet?: number
    canDouble?: boolean
    canSplit?: boolean
    canInsurance?: boolean
    handStates?: ('playing' | 'complete' | 'bust')[]
  }>({
    playerHand: [],
    dealerHand: [],
    deck: [],
    gameState: 'betting'
  })
  const [won, setWon] = useState<boolean | null>(null)
  const [isBlackjackWin, setIsBlackjackWin] = useState(false)
  const [actualPayout, setActualPayout] = useState(0)
  const [showFairnessModal, setShowFairnessModal] = useState(false)
  const [showSeedsModal, setShowSeedsModal] = useState(false)
  const [hashedServerSeed, setHashedServerSeed] = useState<string>('')
  const [customClientSeed, setCustomClientSeed] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  
  // Animation state
  const [isDealing, setIsDealing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  
  // Hotkeys state
  const [hotkeysEnabled, setHotkeysEnabled] = useState(true)
  const [showHotkeysModal, setShowHotkeysModal] = useState(false)
  
  // Session state
  const [session, setSession] = useState<BlackjackSession>({
    serverSeed: '',
    hashedServerSeed: '',
    clientSeed: '',
    nonce: 0
  })

  // Game history
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])

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

      if (currentGame.gameState !== 'playing') return

      switch (event.code) {
        case 'KeyH':
          event.preventDefault()
          handleHit()
          break
        case 'KeyS':
          event.preventDefault()
          handleStand()
          break
        case 'KeyD':
          event.preventDefault()
          handleDouble()
          break
        case 'KeyR':
          event.preventDefault()
          handleSplit()
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
  }, [hotkeysEnabled, currentGame])

  // Initialize session
  const initializeSession = async () => {
    const serverSeed = generateServerSeed()
    const clientSeed = generateClientSeed()
    const hash = await getHashedServerSeed(serverSeed)
    
    setSession({
      serverSeed,
      hashedServerSeed: hash,
      clientSeed,
      nonce: 0
    })
    setHashedServerSeed(hash)
  }

  // Remove old seed generation functions - now using RGS system

  // Get hashed server seed
  const getHashedServerSeed = async (seed: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(seed)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

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

  // Get next card from deck using provably fair system
  const getNextCard = (deck: Card[], cardIndex: number): Card => {
    const seed = session.serverSeed + session.clientSeed + session.nonce + cardIndex
    const seedBytes = new TextEncoder().encode(seed)
    let hash = 0
    for (let j = 0; j < seedBytes.length; j++) {
      const char = seedBytes[j]
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    const randomIndex = Math.abs(hash) % deck.length
    return deck[randomIndex]
  }

  // Calculate hand value
  const calculateHandValue = (hand: Card[]): number => {
    let value = 0
    let aces = 0
    
    for (const card of hand) {
      if (card.value === 1) {
        aces++
        value += 11
      } else if (card.value >= 10) {
        value += 10
      } else {
        value += card.value
      }
    }
    
    // Adjust aces from 11 to 1 if needed
    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }
    
    return value
  }

  // Calculate hand value display (shows both values for soft hands)
  const calculateHandValueDisplay = (hand: Card[]): string => {
    // Use the actual playing value (which handles Ace logic correctly)
    const actualValue = calculateHandValue(hand)
    
    // Only show both values for simple two-card soft hands
    if (hand.length === 2) {
      let value = 0
      let aces = 0
      
      // Count aces and calculate base value
      for (const card of hand) {
        if (card.value === 1) {
          aces++
          value += 11
        } else if (card.value >= 10) {
          value += 10
        } else {
          value += card.value
        }
      }
      
      // If we have exactly one ace and the soft value is 21 or less
      if (aces === 1 && value <= 21) {
        const hardValue = value - 10
        if (hardValue !== value) {
          return `${hardValue}, ${value}`
        }
      }
    }
    
    // For all other cases, return the actual playing value
    return actualValue.toString()
  }

  // Check if hand is blackjack
  const isBlackjack = (hand: Card[]): boolean => {
    return hand.length === 2 && calculateHandValue(hand) === 21
  }

  // Check if hand is bust
  const isBust = (hand: Card[]): boolean => {
    return calculateHandValue(hand) > 21
  }

  // Check if hand is soft (contains an ace counted as 11)
  const isSoft = (hand: Card[]): boolean => {
    let value = 0
    let aces = 0
    
    for (const card of hand) {
      if (card.value === 1) {
        aces++
        value += 11
      } else if (card.value >= 10) {
        value += 10
      } else {
        value += card.value
      }
    }
    
    return aces > 0 && value <= 21
  }

  // Check if cards can be split (same rank)
  const canSplitCards = (hand: Card[]): boolean => {
    if (hand.length !== 2) return false
    return hand[0].value === hand[1].value
  }

  // Check if dealer shows ace (for insurance)
  const dealerShowsAce = (): boolean => {
    return currentGame.dealerHand.length > 0 && currentGame.dealerHand[0].value === 1
  }

  // Update available actions based on current game state
  const updateAvailableActions = () => {
    const hand = currentGame.playerHand
    const handValue = calculateHandValue(hand)
    const canDouble = hand.length === 2 && !currentGame.splitHands && handValue < 21
    const canSplit = canSplitCards(hand) && !currentGame.splitHands && handValue < 21
    const canInsurance = dealerShowsAce() && currentGame.gameState === 'playing'

    // Auto-stand if player reaches 21
    if (handValue === 21 && currentGame.gameState === 'playing') {
      setCurrentGame(prev => ({
        ...prev,
        gameState: 'dealer',
        canDouble: false,
        canSplit: false,
        canInsurance: false
      }))
      handleStand()
      return
    }

    setCurrentGame(prev => ({
      ...prev,
      canDouble,
      canSplit,
      canInsurance
    }))
  }

  // Place bet and start game
  const placeBet = async () => {
    if (isPlaying || currentGame.gameState !== 'betting') return
    
    if (betAmount <= 0) {
      alert('Please enter a valid bet amount')
      return
    }

    if (user && user.balance < betAmount) {
      alert(`Insufficient ${selectedCurrency} balance`)
      return
    }

    setIsPlaying(true)
    setIsDealing(true)

    // Increment nonce for this game
    const newNonce = session.nonce + 1
    setSession(prev => ({ ...prev, nonce: newNonce }))

    // Create new deck and deal initial cards using provably fair system
    const deck = createDeck()
    const playerHand = [getNextCard(deck, 0), getNextCard(deck, 1)]
    const dealerHand = [getNextCard(deck, 2), getNextCard(deck, 3)]

    setCurrentGame({
      playerHand,
      dealerHand,
      deck,
      gameState: 'playing',
      canDouble: true,
      canSplit: canSplitCards(playerHand),
      canInsurance: false // Will be set correctly below
    })

    // Check for immediate blackjack
    const playerBlackjack = isBlackjack(playerHand)
    const dealerBlackjack = isBlackjack(dealerHand)

    // Check for insurance opportunity first (when dealer shows Ace)
    const dealerShowsAce = dealerHand[0].value === 1
    
    if (dealerShowsAce) {
      // Always offer insurance when dealer shows Ace, regardless of actual blackjack
      setCurrentGame({
        playerHand,
        dealerHand,
        deck,
        gameState: 'insurance',
        canDouble: true,
        canSplit: canSplitCards(playerHand),
        canInsurance: true
      })
      setIsDealing(false)
    } else if (playerBlackjack) {
      // Player blackjack - dealer still needs to reveal cards
      setCurrentGame(prev => ({
        ...prev,
        gameState: 'dealer'
      }))
      await playDealerHand()
    } else {
      // Normal game - no insurance needed
      setCurrentGame({
        playerHand,
        dealerHand,
        deck,
        gameState: 'playing',
        canDouble: true,
        canSplit: canSplitCards(playerHand),
        canInsurance: false
      })
      setIsDealing(false)
    }
  }

  // Handle hit action
  const handleHit = async () => {
    if (currentGame.gameState !== 'playing' || isDealing) return

    const newDeck = [...currentGame.deck]
    const cardIndex = currentGame.playerHand.length + (currentGame.dealerHand.length - 2) + 4 // Account for initial cards
    const newPlayerHand = [...currentGame.playerHand, getNextCard(newDeck, cardIndex)]

    const updatedGame = {
      ...currentGame,
      playerHand: newPlayerHand,
      deck: newDeck
    }

    setCurrentGame(updatedGame)

    if (isBust(newPlayerHand)) {
      // Player busted - reveal dealer cards but don't let dealer play
      const finalGame = {
        ...updatedGame,
        gameState: 'complete' as const
      }
      setCurrentGame(finalGame)
      await handleGameEnd('bust', finalGame)
    } else {
      // Check if player reached 21 and auto-stand
      updateAvailableActions()
    }
  }

  // Handle stand action
  const handleStand = async () => {
    if (currentGame.gameState !== 'playing' || isDealing) return

    setCurrentGame({
      ...currentGame,
      gameState: 'dealer'
    })

    await playDealerHand()
  }

  // Handle double action
  const handleDouble = async () => {
    if (currentGame.gameState !== 'playing' || isDealing) return
    if (currentGame.playerHand.length !== 2) return

    // Double the bet
    const newBetAmount = betAmount * 2
    if (user && user.balance < newBetAmount) {
      alert(`Insufficient ${selectedCurrency} balance for double`)
      return
    }

    setBetAmount(newBetAmount)

    // Deal one more card using provably fair system
    const newDeck = [...currentGame.deck]
    const cardIndex = 4 // Third card for player
    const newPlayerHand = [...currentGame.playerHand, getNextCard(newDeck, cardIndex)]

    setCurrentGame({
      ...currentGame,
      playerHand: newPlayerHand,
      deck: newDeck,
      gameState: 'dealer'
    })

    // Check if player busted after double
    if (isBust(newPlayerHand)) {
      await handleGameEnd('bust')
    } else {
      // Check if player reached 21 and auto-stand
      updateAvailableActions()
    }
  }

  // Handle split action
  const handleSplit = async () => {
    if (currentGame.gameState !== 'playing' || isDealing) return
    if (!currentGame.canSplit) return

    // Check if user has enough balance for split
    if (user && user.balance < betAmount) {
      alert(`Insufficient ${selectedCurrency} balance for split`)
      return
    }

    // Create two hands from the split
    const hand1 = [currentGame.playerHand[0]]
    const hand2 = [currentGame.playerHand[1]]

    // Deal one card to each hand
    const newDeck = [...currentGame.deck]
    hand1.push(getNextCard(newDeck, 4))
    hand2.push(getNextCard(newDeck, 5))

    setCurrentGame({
      ...currentGame,
      playerHand: hand1,
      dealerHand: currentGame.dealerHand,
      deck: newDeck,
      splitHands: [hand1, hand2],
      currentHandIndex: 0,
      betAmounts: [betAmount, betAmount],
      handStates: ['playing', 'playing'],
      gameState: 'playing',
      canDouble: true,
      canSplit: false,
      canInsurance: false
    })
  }

  // Handle insurance action
  const handleInsurance = async () => {
    if (currentGame.gameState !== 'insurance' || isDealing) return
    if (!currentGame.canInsurance) return

    const insuranceAmount = betAmount * 0.5

    // Check if dealer has blackjack
    const dealerBlackjack = isBlackjack(currentGame.dealerHand)
    
    if (dealerBlackjack) {
      // Insurance wins - player gets 2x insurance bet
      const result: GameResult = {
        playerHand: currentGame.playerHand,
        dealerHand: currentGame.dealerHand,
        playerScore: calculateHandValue(currentGame.playerHand),
        dealerScore: calculateHandValue(currentGame.dealerHand),
        won: true,
        betAmount: insuranceAmount,
        payout: insuranceAmount * 2,
        timestamp: new Date(),
        gameType: 'insurance'
      }
      await finishGame(result)
    } else {
      // Insurance loses - continue with normal game
      setCurrentGame(prev => ({
        ...prev,
        gameState: 'playing',
        insuranceBet: insuranceAmount,
        canInsurance: false
      }))
      setIsDealing(false)
    }
  }

  // Handle decline insurance action
  const handleDeclineInsurance = async () => {
    if (currentGame.gameState !== 'insurance' || isDealing) return
    
    // Check if dealer has blackjack after declining insurance
    const dealerBlackjack = isBlackjack(currentGame.dealerHand)
    
    if (dealerBlackjack) {
      // Dealer blackjack - immediate loss
      await handleGameEnd('dealer_blackjack')
    } else {
      // Continue with normal game
      setCurrentGame(prev => ({
        ...prev,
        gameState: 'playing',
        canInsurance: false
      }))
      setIsDealing(false)
    }
  }

  // Handle split hand hit
  const handleSplitHit = async (handIndex: number) => {
    if (currentGame.gameState !== 'playing' || isDealing || !currentGame.splitHands) return
    
    const newDeck = [...currentGame.deck]
    const cardIndex = currentGame.splitHands.reduce((total, hand) => total + hand.length, 0) + 4 // Account for initial cards
    const newSplitHands = [...currentGame.splitHands]
    newSplitHands[handIndex] = [...newSplitHands[handIndex], getNextCard(newDeck, cardIndex)]

    setCurrentGame({
      ...currentGame,
      splitHands: newSplitHands,
      deck: newDeck
    })

    // Check if hand busted
    const handValue = calculateHandValue(newSplitHands[handIndex])
    if (handValue > 21) {
      const newHandStates = [...(currentGame.handStates || [])]
      newHandStates[handIndex] = 'bust'
      setCurrentGame(prev => ({
        ...prev,
        handStates: newHandStates
      }))
    } else if (handValue === 21) {
      // Auto-stand on 21
      const newHandStates = [...(currentGame.handStates || [])]
      newHandStates[handIndex] = 'complete'
      setCurrentGame(prev => ({
        ...prev,
        handStates: newHandStates
      }))
    }

    // Check if all hands are complete
    checkSplitGameComplete()
  }

  // Handle split hand stand
  const handleSplitStand = async (handIndex: number) => {
    if (currentGame.gameState !== 'playing' || isDealing || !currentGame.splitHands) return
    
    const newHandStates = [...(currentGame.handStates || [])]
    newHandStates[handIndex] = 'complete'
    
    setCurrentGame(prev => ({
      ...prev,
      handStates: newHandStates
    }))

    // Check if all hands are complete
    checkSplitGameComplete()
  }

  // Handle split hand double
  const handleSplitDouble = async (handIndex: number) => {
    if (currentGame.gameState !== 'playing' || isDealing || !currentGame.splitHands) return
    if (currentGame.splitHands[handIndex].length !== 2) return

    // Check if user has enough balance for double
    if (user && user.balance < betAmount) {
      alert(`Insufficient ${selectedCurrency} balance for double`)
      return
    }

    const newDeck = [...currentGame.deck]
    const cardIndex = currentGame.splitHands.reduce((total, hand) => total + hand.length, 0) + 4
    const newSplitHands = [...currentGame.splitHands]
    newSplitHands[handIndex] = [...newSplitHands[handIndex], getNextCard(newDeck, cardIndex)]

    // Double the bet for this hand
    const newBetAmounts = [...(currentGame.betAmounts || [])]
    newBetAmounts[handIndex] = newBetAmounts[handIndex] * 2

    setCurrentGame({
      ...currentGame,
      splitHands: newSplitHands,
      deck: newDeck,
      betAmounts: newBetAmounts
    })

    // Check if hand busted or reached 21
    const handValue = calculateHandValue(newSplitHands[handIndex])
    const newHandStates = [...(currentGame.handStates || [])]
    if (handValue > 21) {
      newHandStates[handIndex] = 'bust'
    } else {
      newHandStates[handIndex] = 'complete'
    }
    
    setCurrentGame(prev => ({
      ...prev,
      handStates: newHandStates
    }))

    // Check if all hands are complete
    checkSplitGameComplete()
  }

  // Check if all split hands are complete and start dealer turn
  const checkSplitGameComplete = () => {
    if (!currentGame.splitHands || !currentGame.handStates) return
    
    const allComplete = currentGame.handStates.every(state => state === 'complete' || state === 'bust')
    if (allComplete) {
      setCurrentGame(prev => ({
        ...prev,
        gameState: 'dealer'
      }))
      playDealerHand()
    }
  }

  // Play dealer hand with suspenseful animation
  const playDealerHand = async () => {
    let newDealerHand = [...currentGame.dealerHand]
    let newDeck = [...currentGame.deck]
    let cardIndex = 4 // Start after initial cards

    // First, flip the dealer's hole card with suspense
    await new Promise(resolve => setTimeout(resolve, 500)) // 0.5 second pause

    // Dealer hits on soft 17 (must hit on soft 17)
    while (calculateHandValue(newDealerHand) < 17 || 
           (calculateHandValue(newDealerHand) === 17 && isSoft(newDealerHand))) {
      
      // Add suspenseful delay before each hit
      await new Promise(resolve => setTimeout(resolve, 500)) // 0.5 second pause
      
      // Deal the card
      newDealerHand.push(getNextCard(newDeck, cardIndex))
      cardIndex++
      
      // Update the game state to show the new card
      setCurrentGame({
        ...currentGame,
        dealerHand: newDealerHand,
        deck: newDeck,
        gameState: 'dealer'
      })
      
      // Check if dealer busted after this card
      if (isBust(newDealerHand)) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Final pause before result
        const finalGame = {
          ...currentGame,
          dealerHand: newDealerHand,
          deck: newDeck,
          gameState: 'complete' as const
        }
        setCurrentGame(finalGame)
        await handleGameEnd('dealer_bust', finalGame)
        return
      }
    }

    // Final pause before showing the result
    await new Promise(resolve => setTimeout(resolve, 500))

    setCurrentGame({
      ...currentGame,
      dealerHand: newDealerHand,
      deck: newDeck,
      gameState: 'complete'
    })

    await handleGameEnd() // Let handleGameEnd determine the outcome
  }

  // Handle game end
  const handleGameEnd = async (outcome?: 'blackjack' | 'dealer_blackjack' | 'push' | 'bust' | 'dealer_bust' | 'win' | 'loss', gameState?: typeof currentGame) => {
    // Use provided game state or current game state
    const finalGameState = gameState || currentGame
    const playerScore = calculateHandValue(finalGameState.playerHand)
    const dealerScore = calculateHandValue(finalGameState.dealerHand)

    let won = false
    let payout = 0
    let gameType: GameResult['gameType'] = 'stand'

    // Determine outcome if not provided
    if (!outcome) {
      if (isBlackjack(finalGameState.playerHand)) {
        outcome = 'blackjack'
      } else if (isBust(finalGameState.playerHand)) {
        outcome = 'bust'
      } else if (isBust(finalGameState.dealerHand)) {
        outcome = 'dealer_bust'
      } else if (playerScore > dealerScore) {
        outcome = 'win'
      } else if (playerScore < dealerScore) {
        outcome = 'loss'
      } else {
        outcome = 'push'
      }
    }

    // Calculate payout based on outcome
    switch (outcome) {
      case 'blackjack':
        won = true
        payout = betAmount * 2.5 // Blackjack pays 3:2 (2.5x total)
        gameType = 'stand'
        break
      case 'dealer_blackjack':
        won = false
        payout = 0
        gameType = 'stand'
        break
      case 'bust':
        won = false
        payout = 0
        gameType = 'hit'
        break
      case 'dealer_bust':
        won = true
        payout = betAmount * 2
        gameType = 'stand'
        break
      case 'win':
        won = true
        payout = betAmount * 2
        gameType = 'stand'
        break
      case 'loss':
        won = false
        payout = 0
        gameType = 'stand'
        break
      case 'push':
        won = false
        payout = betAmount // Return original bet
        gameType = 'stand'
        break
    }

    const result: GameResult = {
      playerHand: finalGameState.playerHand,
      dealerHand: finalGameState.dealerHand,
      playerScore,
      dealerScore,
      won,
      betAmount,
      payout,
      timestamp: new Date(),
      gameType
    }

    await finishGame(result, outcome)
  }

  // Finish game
  const finishGame = async (result: GameResult, outcome?: string) => {
    setWon(result.won)
    setIsBlackjackWin(outcome === 'blackjack')
    setActualPayout(result.payout)
    setShowResult(true)
    setIsDealing(false)

    // Add to game history
    setGameHistory(prev => [result, ...prev.slice(0, 19)]) // Keep last 20 games
    
    // Add to global stats store
    addRoll({
      result: result.won ? 1 : 0,
      won: result.won,
      target: 0,
      direction: 'over',
      betAmount: result.betAmount,
      payout: result.payout,
      timestamp: result.timestamp,
      gameType: 'Blackjack'
    })

    // Reset game after delay
    setTimeout(() => {
      setCurrentGame({
        playerHand: [],
        dealerHand: [],
        deck: [],
        gameState: 'betting'
      })
      setWon(null)
      setIsBlackjackWin(false)
      setActualPayout(0)
      setShowResult(false)
      setIsPlaying(false)
    }, 3000)
  }

  // Generate random client seed
  const generateRandomSeed = () => {
    const randomSeed = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    setCustomClientSeed(randomSeed)
  }

  // Handle changing seeds
  const handleChangeSeeds = async () => {
    const newClientSeed = customClientSeed || generateClientSeed()
    const newServerSeed = generateServerSeed()
    const hash = await getHashedServerSeed(newServerSeed)
    
    setSession({
      serverSeed: newServerSeed,
      hashedServerSeed: hash,
      clientSeed: newClientSeed,
      nonce: 0
    })
    setHashedServerSeed(hash)
    setCustomClientSeed('')
  }

  // Rotate seeds
  const rotateSeeds = async () => {
    const newServerSeed = generateServerSeed()
    const newClientSeed = generateClientSeed()
    const hash = await getHashedServerSeed(newServerSeed)
    
    setSession({
      serverSeed: newServerSeed,
      hashedServerSeed: hash,
      clientSeed: newClientSeed,
      nonce: 0
    })
    setHashedServerSeed(hash)
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Calculate potential win
  // Calculate potential win based on current hand
  const getPotentialWin = () => {
    if (currentGame.gameState === 'betting') return betAmount * 2 // Default 1:1
    
    const playerScore = calculateHandValue(currentGame.playerHand)
    const dealerScore = calculateHandValue(currentGame.dealerHand)
    
    if (isBlackjack(currentGame.playerHand)) {
      return betAmount * 2.5 // Blackjack pays 3:2 (2.5x total)
    } else if (isBust(currentGame.playerHand)) {
      return 0 // Bust = no win
    } else if (playerScore === dealerScore) {
      return betAmount // Push = return original bet
    } else if (playerScore > dealerScore) {
      return betAmount * 2 // Normal win = 1:1
    } else {
      return 0 // Loss = no win
    }
  }

  // Render card component
  const renderCard = (card: Card, hidden: boolean = false) => {
    const getSuitIcon = (suit: Card['suit']) => {
      switch (suit) {
        case 'hearts': return <Heart className="h-4 w-4" />
        case 'diamonds': return <Diamond className="h-4 w-4" />
        case 'clubs': return <Club className="h-4 w-4" />
        case 'spades': return <Spade className="h-4 w-4" />
      }
    }

    const getSuitColor = (suit: Card['suit']) => {
      return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black'
    }

    if (hidden) {
      return (
        <div className="w-16 h-24 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-lg border-2 border-[#00d4ff]/80 flex items-center justify-center">
          <div className="text-white font-bold text-lg">?</div>
        </div>
      )
    }

    return (
      <div className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center p-2">
        <div className={`text-sm font-bold ${getSuitColor(card.suit)}`}>
          {card.display}
        </div>
        <div className={`${getSuitColor(card.suit)}`}>
          {getSuitIcon(card.suit)}
        </div>
      </div>
    )
  }

  // Render hand
  const renderHand = (hand: Card[], title: string, hideSecond: boolean = false) => {
    const value = calculateHandValue(hand)
    
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="flex justify-center space-x-2 mb-2">
          {hand.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {renderCard(card, hideSecond && index === 1)}
            </motion.div>
          ))}
        </div>
        <div className="text-lg font-bold text-[#00d4ff]">
          {hideSecond ? calculateHandValueDisplay([hand[0]]) : calculateHandValueDisplay(hand)}
        </div>
      </div>
    )
  }

  // Render split hands side by side with individual controls
  const renderSplitHands = () => {
    if (!currentGame.splitHands) return null

    return (
      <div className="grid grid-cols-2 gap-6">
        {currentGame.splitHands.map((hand, index) => {
          const handValue = calculateHandValue(hand)
          const isBusted = handValue > 21
          const isComplete = currentGame.handStates?.[index] === 'complete'
          const canPlay = !isBusted && !isComplete && currentGame.gameState === 'playing'
          
          return (
            <div key={index} className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                Hand {index + 1}
              </h3>
              <div className="flex justify-center space-x-2 mb-2">
                {hand.map((card, cardIndex) => (
                  <motion.div
                    key={cardIndex}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: cardIndex * 0.1 }}
                  >
                    {renderCard(card)}
                  </motion.div>
                ))}
              </div>
              <div className={`text-lg font-bold ${isBusted ? 'text-red-400' : 'text-[#00d4ff]'}`}>
                {calculateHandValueDisplay(hand)}
              </div>
              
              {/* Individual hand controls */}
              {canPlay && (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleSplitHit(index)}
                      disabled={isDealing}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 text-sm"
                    >
                      Hit
                    </Button>
                    <Button
                      onClick={() => handleSplitStand(index)}
                      disabled={isDealing}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 text-sm"
                    >
                      Stand
                    </Button>
                  </div>
                  {hand.length === 2 && (
                    <Button
                      onClick={() => handleSplitDouble(index)}
                      disabled={isDealing}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 text-sm"
                    >
                      Double
                    </Button>
                  )}
                </div>
              )}
              
              {/* Hand status */}
              {isBusted && (
                <div className="mt-2 text-red-400 text-sm font-bold">BUST</div>
              )}
              {isComplete && (
                <div className="mt-2 text-gray-400 text-sm">Complete</div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

    return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419]">
        {isDesktop ? (
          /* Desktop Layout */
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left - Game Area */}
              <div className="lg:col-span-2">
                <div className="bg-[#1a2c38] rounded-lg p-6 min-h-[600px] flex flex-col justify-center">
                  {currentGame.gameState === 'betting' ? (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🃏</div>
                      <h2 className="text-2xl font-bold text-white mb-2">Welcome to Blackjack</h2>
                      <p className="text-gray-400 mb-6">Place your bet and click "Deal Cards" to start</p>
                      <div className="text-sm text-gray-500">
                        <p>• Beat the dealer to 21</p>
                        <p>• Blackjack pays 3:2</p>
                        <p>• Dealer hits on soft 17</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Dealer Hand */}
                      {renderHand(
                        currentGame.dealerHand,
                        'Dealer',
                        currentGame.gameState === 'playing' || currentGame.gameState === 'insurance'
                      )}

                      {/* Game Result */}
                      {showResult && won !== null && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`text-center p-4 rounded-lg border-2 ${
                            won ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                          }`}
                        >
                          <div className={`text-2xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                            {won ? (isBlackjackWin ? 'BLACKJACK!' : 'YOU WIN!') : 'DEALER WINS'}
                          </div>
                          {won && (
                            <div className="text-lg mt-2">
                              +{formatCurrency(actualPayout - betAmount)} {selectedCurrency}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Player Hand */}
                      {currentGame.splitHands ? renderSplitHands() : renderHand(currentGame.playerHand, 'Your Hand')}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar - Betting Controls */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <img src="/Logo11.png" alt="Edge Casino" className="h-8 w-8" />
                  <div>
                    <h1 className="text-xl font-bold text-white">Blackjack</h1>
                    <p className="text-sm text-gray-400">Beat the dealer to 21</p>
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
                      {formatCurrency(getPotentialWin() - betAmount)} {selectedCurrency}
                    </span>
                  </div>
                </div>

                {/* Game Actions */}
                {currentGame.gameState === 'betting' && (
                  <Button
                    onClick={placeBet}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Dealing...
                      </>
                    ) : (
                      'Deal Cards'
                    )}
                  </Button>
                )}

                {currentGame.gameState === 'insurance' && (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <div className="text-lg font-bold text-yellow-400 mb-2">Insurance Offered</div>
                      <div className="text-sm text-gray-400">
                        Dealer shows an Ace. Would you like insurance?
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Insurance pays 2:1 if dealer has blackjack
                      </div>
                    </div>
                    <Button
                      onClick={handleInsurance}
                      disabled={isDealing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                      Take Insurance (${(betAmount * 0.5).toFixed(2)})
                    </Button>
                    <Button
                      onClick={handleDeclineInsurance}
                      disabled={isDealing}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                    >
                      Decline Insurance
                    </Button>
                  </div>
                )}

                {currentGame.gameState === 'playing' && (
                  <div className="space-y-3">
                    <Button
                      onClick={handleHit}
                      disabled={isDealing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                      Hit
                    </Button>
                    <Button
                      onClick={handleStand}
                      disabled={isDealing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                    >
                      Stand
                    </Button>
                    {currentGame.canDouble && (
                      <Button
                        onClick={handleDouble}
                        disabled={isDealing}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
                      >
                        Double
                      </Button>
                    )}
                    {currentGame.canSplit && (
                      <Button
                        onClick={handleSplit}
                        disabled={isDealing}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
                      >
                        Split
                      </Button>
                    )}
                    {currentGame.canInsurance && (
                      <Button
                        onClick={handleInsurance}
                        disabled={isDealing}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3"
                      >
                        Insurance
                      </Button>
                    )}
                  </div>
                )}

                {/* Game History */}
                {gameHistory.length > 0 && (
                  <div className="bg-[#1a2c38] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Game History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-[#374151]">
                            <th className="text-left py-2">Result</th>
                            <th className="text-left py-2">Player Cards</th>
                            <th className="text-left py-2">Dealer Cards</th>
                            <th className="text-left py-2">Bet</th>
                            <th className="text-left py-2">Payout</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameHistory.slice(0, 10).map((game, index) => (
                            <tr key={index} className="border-b border-[#374151]/50">
                              <td className={`py-2 font-bold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                                {game.won ? 'WIN' : 'LOSS'}
                              </td>
                              <td className="py-2 text-gray-300">
                                <div className="flex flex-wrap gap-1">
                                  {game.playerHand.map((card, cardIndex) => (
                                    <div key={cardIndex} className="text-xs bg-gray-700 px-1 rounded">
                                      {card.display}{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                                    </div>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500">({game.playerScore})</div>
                              </td>
                              <td className="py-2 text-gray-300">
                                <div className="flex flex-wrap gap-1">
                                  {game.dealerHand.map((card, cardIndex) => (
                                    <div key={cardIndex} className="text-xs bg-gray-700 px-1 rounded">
                                      {card.display}{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                                    </div>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-500">({game.dealerScore})</div>
                              </td>
                              <td className="py-2 text-gray-300">
                                {formatCurrency(game.betAmount)} {selectedCurrency}
                              </td>
                              <td className="py-2 text-gray-300">
                                {formatCurrency(game.payout)} {selectedCurrency}
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
                  <h1 className="text-xl font-bold text-white">Blackjack</h1>
                </motion.div>
            </div>

            {/* Main Game Container */}
            <div className="px-4 space-y-4 pb-16">
              {/* Game Area */}
              <div className="bg-[#1a2c38] rounded-lg p-4 min-h-[400px] flex flex-col justify-center">
                {currentGame.gameState === 'betting' ? (
                  <div className="text-center">
                    <div className="text-4xl mb-4">🃏</div>
                    <h2 className="text-xl font-bold text-white mb-2">Welcome to Blackjack</h2>
                    <p className="text-gray-400 text-sm">Place your bet and start playing</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Dealer Hand */}
                    {renderHand(
                      currentGame.dealerHand,
                      'Dealer',
                      currentGame.gameState === 'playing' || currentGame.gameState === 'insurance'
                    )}

                    {/* Game Result */}
                    {showResult && won !== null && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-center p-3 rounded-lg border-2 ${
                          won ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className={`text-xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                          {won ? (isBlackjackWin ? 'BLACKJACK!' : 'YOU WIN!') : 'DEALER WINS'}
                        </div>
                      </motion.div>
                    )}

                                         {/* Player Hand */}
                     {currentGame.splitHands ? renderSplitHands() : renderHand(currentGame.playerHand, 'Your Hand')}
                  </div>
                )}
              </div>

              {/* Bet Amount */}
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Bet Amount</span>
                  <span className="text-sm text-gray-400">{selectedCurrency}0.00</span>
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
                    className="bg-[#2d3748] hover:bg-[#374151] text-white px-3 h-12"
                  >
                    ½
                  </Button>
                  <Button
                    onClick={() => setBetAmount(prev => prev * 2)}
                    className="bg-[#2d3748] hover:bg-[#374151] text-white px-3 h-12"
                  >
                    2×
                  </Button>
                </div>

                {/* Quick Bet Buttons */}
                <div className="grid grid-cols-5 gap-2">
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
              </div>

              {/* Game Actions */}
              {currentGame.gameState === 'betting' && (
                <Button
                  onClick={placeBet}
                  disabled={isPlaying}
                  className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Dealing...
                    </>
                  ) : (
                    'Deal Cards'
                  )}
                </Button>
              )}

              {currentGame.gameState === 'insurance' && (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="text-lg font-bold text-yellow-400 mb-2">Insurance Offered</div>
                    <div className="text-sm text-gray-400">
                      Dealer shows an Ace. Would you like insurance?
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Insurance pays 2:1 if dealer has blackjack
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleInsurance}
                      disabled={isDealing}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                      Take Insurance
                    </Button>
                    <Button
                      onClick={handleDeclineInsurance}
                      disabled={isDealing}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              )}

              {currentGame.gameState === 'playing' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleHit}
                    disabled={isDealing}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                  >
                    Hit
                  </Button>
                  <Button
                    onClick={handleStand}
                    disabled={isDealing}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                  >
                    Stand
                  </Button>
                  {currentGame.canDouble && (
                    <Button
                      onClick={handleDouble}
                      disabled={isDealing}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
                    >
                      Double
                    </Button>
                  )}
                  {currentGame.canSplit && (
                    <Button
                      onClick={handleSplit}
                      disabled={isDealing}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
                    >
                      Split
                    </Button>
                  )}
                  {currentGame.canInsurance && (
                    <Button
                      onClick={handleInsurance}
                      disabled={isDealing}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3"
                    >
                      Insurance
                    </Button>
                  )}
                </div>
              )}

              {/* Recent Games */}
              <div className="flex justify-center space-x-1 mb-2">
                {gameHistory.slice(0, 10).map((game, index) => (
                  <span
                    key={index}
                    className={`inline-block w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${
                      game.won ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {game.won ? 'W' : 'L'}
                  </span>
                ))}
                {gameHistory.length === 0 && (
                  <span className="text-gray-500 text-sm">No recent games</span>
                )}
              </div>
            </div>
          </div>
        )}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1a2c38] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">House Edge</div>
                    <div className="text-sm text-red-400 font-semibold">
                      {(HOUSE_EDGE * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-[#1a2c38] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Game Type</div>
                    <div className="text-sm text-white font-semibold">
                      Blackjack
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
                    • https://provablyfair.me
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CasinoLayout>
  )
}

export default EdgeBlackjack
