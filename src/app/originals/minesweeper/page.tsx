/**
 * Minesweeper Game Component
 * 
 * A provably fair Minesweeper implementation with large board support,
 * virtualized rendering, and casino-style UI matching the existing games.
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flag, 
  Bomb, 
  Shield, 
  RotateCcw, 
  Settings,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { useGameStatsStore } from '@/store/gameStatsStore'
import { useGlobalNonceStore } from '@/store/gameStore'
import { generateMinePositions } from '@/lib/minesweeper/provablyFair'
import { formatCurrency } from '@/lib/utils'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { recordGameWin, recordGameLoss } from '@/lib/gameSessionManager'
import { verifyGameResult, type VerificationResult } from '@/lib/minesweeper/provablyFair'

interface Cell {
  x: number
  y: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
}

interface GameState {
  board: Cell[][]
  gameStatus: 'waiting' | 'playing' | 'won' | 'lost' | 'cashed_out'
  minesLeft: number
  startTime: number
  endTime?: number
  clearedTiles: number
}

interface GameConfig {
  boardWidth: number
  boardHeight: number
  mineCount: number
  stake: number
}

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  verificationResult: VerificationResult | null
  serverSeed: string
  clientSeed: string
  nonce: number
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  verificationResult,
  serverSeed,
  clientSeed,
  nonce
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1a2c38] rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2d3748]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#00d4ff]" />
              Provably Fair Verification
            </h2>
            <Button variant="ghost" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Verification Status */}
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                {verificationResult?.match ? (
                  <CheckCircle className="h-8 w-8 text-green-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-400" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {verificationResult?.match ? 'Verification Passed' : 'Verification Failed'}
                  </h3>
                  <p className="text-gray-400">
                    {verificationResult?.match 
                      ? 'The game result is cryptographically verified and fair'
                      : 'The game result could not be verified'
                    }
                  </p>
                </div>
              </div>
            </Card>

            {/* Seeds Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="glass" className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Server Seed</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs text-white break-all bg-black/20 p-2 rounded">
                    {serverSeed}
                  </code>
                </CardContent>
              </Card>

              <Card variant="glass" className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Client Seed</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs text-white break-all bg-black/20 p-2 rounded">
                    {clientSeed}
                  </code>
                </CardContent>
              </Card>
            </div>

            {/* Nonce */}
            <Card variant="glass" className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Nonce</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-lg text-white font-mono">
                  {nonce}
                </code>
              </CardContent>
            </Card>

            {/* Hash Comparison */}
            {verificationResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="glass" className="p-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Computed Hash</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs text-white break-all bg-black/20 p-2 rounded">
                      {verificationResult.computedHash}
                    </code>
                  </CardContent>
                </Card>

                <Card variant="glass" className="p-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Provided Hash</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs text-white break-all bg-black/20 p-2 rounded">
                      {verificationResult.providedHash}
                    </code>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Mine Positions */}
            {verificationResult && (
              <Card variant="glass" className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Computed Mine Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                    {verificationResult.computedMines.map((mine, index) => (
                      <div
                        key={index}
                        className="bg-red-500/20 text-red-400 text-xs p-1 rounded text-center"
                      >
                        {mine.x},{mine.y}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const EdgeMinesweeper: React.FC = () => {
  const { user, updateBalance } = useUserStore()
  const { addRoll } = useGameStatsStore()
  const { globalNonce, serverSeed, clientSeed, hashedServerSeed, incrementNonce } = useGlobalNonceStore()

  // Game state - Initialize with empty 5x5 board
  const [gameState, setGameState] = useState<GameState>(() => {
    const board: Cell[][] = []
    for (let y = 0; y < 5; y++) {
      const row: Cell[] = []
      for (let x = 0; x < 5; x++) {
        row.push({
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false
        })
      }
      board.push(row)
    }
    return {
      board,
      gameStatus: 'waiting',
      minesLeft: 0,
      startTime: 0,
      clearedTiles: 0
    }
  })

  // Game configuration - Fixed 5x5 board like Stake
  const [config, setConfig] = useState<GameConfig>({
    boardWidth: 5,
    boardHeight: 5,
    mineCount: 3,
    stake: 1.0
  })
  
  // Custom configuration inputs
  const [customMines, setCustomMines] = useState(3)

  // UI state
  const [betAmount, setBetAmount] = useState(0.01)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [canCashOut, setCanCashOut] = useState(false)
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0)
  const [gameEnded, setGameEnded] = useState(false)
  const [gameMode, setGameMode] = useState<'manual' | 'auto'>('manual')
  const [autoRolls, setAutoRolls] = useState(10)
  const [autoStopOnWin, setAutoStopOnWin] = useState(false)
  const [autoStopOnLoss, setAutoStopOnLoss] = useState(false)
  const [selectedTiles, setSelectedTiles] = useState<Array<{x: number, y: number, timestamp: number}>>([])
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)

  // Game result data
  const [gameResult, setGameResult] = useState<any>(null)
  const [minePositions, setMinePositions] = useState<Array<{x: number, y: number}>>([])
  const [gameHistory, setGameHistory] = useState<Array<{result: string, multiplier: number, minesFound: number, totalMines: number}>>([])

  // Initialize client seed if not set
  useEffect(() => {
    if (!clientSeed) {
      // Generate a new client seed if none exists
      const newClientSeed = Math.random().toString(36).substring(2, 15)
      // Note: In a real implementation, you'd call a setter from the global store
      // For now, we'll use the global clientSeed when it's available
    }
  }, [clientSeed])

  // Generate empty board
  const generateEmptyBoard = useCallback((width: number, height: number): Cell[][] => {
    const board: Cell[][] = []
    for (let y = 0; y < height; y++) {
      const row: Cell[] = []
      for (let x = 0; x < width; x++) {
        row.push({
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false
        })
      }
      board.push(row)
    }
    return board
  }, [])

  // Start new game - Simplified like Stake
  const startNewGame = useCallback(async () => {
    if (!user || betAmount > user.balance) {
      return
    }

    setIsPlaying(true)
    setGameEnded(false)
    
    try {
      // Generate mine positions using RGS
      const minePositions = await generateMinePositions(
        serverSeed || 'default',
        clientSeed || 'default', 
        globalNonce,
        5, 5, customMines
      )
      
      // Create new board with mines
      const board = generateEmptyBoard(5, 5)
      
      // Place mines on board
      minePositions.forEach(({ x, y }) => {
        if (board[y] && board[y][x]) {
          board[y][x].isMine = true
        }
      })

      // No need to calculate neighbor mines - just simple click to reveal

      setGameState(prev => ({
        ...prev,
        board,
        minesLeft: customMines,
        gameStatus: 'playing',
        startTime: Date.now(),
        clearedTiles: 0
      }))

      // Update user balance
      updateBalance(user.balance - betAmount, 'coins')
      
      // Increment nonce for next game
      incrementNonce()

    } catch (error) {
      console.error('Error starting game:', error)
      setIsPlaying(false)
    }
  }, [user, betAmount, serverSeed, clientSeed, globalNonce, customMines, updateBalance, generateEmptyBoard, incrementNonce])

  // Reset game function
  const resetGame = useCallback(() => {
    setGameEnded(false)
    setSelectedTiles([])
    setGameState(prev => ({
      ...prev,
      board: generateEmptyBoard(5, 5),
      gameStatus: 'waiting',
      minesLeft: 0,
      startTime: 0,
      clearedTiles: 0
    }))
    setIsPlaying(false)
    setCanCashOut(false)
    setCurrentMultiplier(1.0)
  }, [generateEmptyBoard])

  // Cash out function
  const cashOut = useCallback(() => {
    if (gameState.gameStatus !== 'playing' || !canCashOut) return

    const totalSafeTiles = config.boardWidth * config.boardHeight - customMines
    const clearedPercentage = gameState.clearedTiles / totalSafeTiles
    const multiplier = 1 + (clearedPercentage * 5) // Progressive multiplier
    const payout = betAmount * multiplier

    if (user) {
      updateBalance(user.balance + payout, 'coins')
    }

    // Add to game history
    addRoll({
      result: multiplier,
      won: true,
      target: customMines,
      direction: 'under' as const,
      betAmount,
      payout,
      timestamp: new Date(),
      gameType: 'minesweeper'
    })

    // Add to local game history
    setGameHistory(prev => [{
      result: 'won',
      multiplier,
      minesFound: customMines,
      totalMines: customMines
    }, ...prev.slice(0, 19)]) // Keep last 20 games

    // Increment nonce for next game
    incrementNonce()

    setGameState(prev => ({
      ...prev,
      gameStatus: 'cashed_out'
    }))

    setIsPlaying(false)
    setCanCashOut(false)
  }, [gameState, canCashOut, config, betAmount, user, updateBalance, addRoll, incrementNonce])

  // Reveal cell
  const revealCell = useCallback((x: number, y: number) => {
    // Prevent any clicks if game has ended
    if (gameEnded || gameState.gameStatus !== 'playing') return

    setGameState(prev => {
      // Double check game status inside the state update
      if (prev.gameStatus !== 'playing') return prev
      
      const newBoard = prev.board.map(row => [...row])
      const cell = newBoard[y][x]

      if (cell.isRevealed || cell.isFlagged) return prev

      cell.isRevealed = true

      // Check if mine - GAME OVER IMMEDIATELY
      if (cell.isMine) {
        // Set game ended immediately to prevent further clicks
        setGameEnded(true)
        setIsPlaying(false)
        setCanCashOut(false)
        
        // Game over - reveal all mines and stop the game
        newBoard.forEach(row => {
          row.forEach(cell => {
            if (cell.isMine) {
              cell.isRevealed = true
            }
          })
        })
        
        return {
          ...prev,
          gameStatus: 'lost',
          endTime: Date.now(),
          board: newBoard
        }
      }

      // Count cleared tiles
      const clearedTiles = newBoard.flat().filter(cell => cell.isRevealed && !cell.isMine).length
      const totalSafeTiles = config.boardWidth * config.boardHeight - customMines

      // Update multiplier based on cleared tiles
      const multiplier = 1 + (clearedTiles / totalSafeTiles) * 5
      setCurrentMultiplier(multiplier)

      // Enable cash-out after revealing at least one tile
      if (clearedTiles > 0) {
        setCanCashOut(true)
      }

      // Check win condition
      if (clearedTiles === totalSafeTiles) {
        return {
          ...prev,
          gameStatus: 'won',
          endTime: Date.now(),
          clearedTiles,
          board: newBoard
        }
      }

      return {
        ...prev,
        clearedTiles,
        board: newBoard
      }
    })
  }, [gameEnded, gameState.gameStatus, config.boardWidth, config.boardHeight, customMines])

  // Toggle flag
  const toggleFlag = useCallback((x: number, y: number) => {
    if (gameEnded || gameState.gameStatus !== 'playing') return

    setGameState(prev => {
      const newBoard = prev.board.map(row => [...row])
      const cell = newBoard[y][x]

      if (cell.isRevealed) return prev

      cell.isFlagged = !cell.isFlagged
      const minesLeft = prev.minesLeft + (cell.isFlagged ? -1 : 1)

      return {
        ...prev,
        board: newBoard,
        minesLeft
      }
    })
  }, [gameEnded, gameState.gameStatus])

  // Auto mode tile selection
  const toggleTileSelection = useCallback((x: number, y: number) => {
    if (gameMode !== 'auto' || gameState.gameStatus !== 'waiting') return
    
    const maxSafeTiles = config.boardWidth * config.boardHeight - customMines
    
    setSelectedTiles(prev => {
      const isSelected = prev.some(tile => tile.x === x && tile.y === y)
      if (isSelected) {
        return prev.filter(tile => !(tile.x === x && tile.y === y))
      } else {
        // Only allow selection if we haven't reached the max safe tiles
        if (prev.length >= maxSafeTiles) return prev
        return [...prev, { x, y, timestamp: Date.now() }]
      }
    })
  }, [gameMode, gameState.gameStatus, customMines])

  // Calculate potential multiplier for selected tiles
  const calculatePotentialMultiplier = useCallback(() => {
    if (selectedTiles.length === 0) return 1.0
    const totalSafeTiles = config.boardWidth * config.boardHeight - customMines
    return 1 + (selectedTiles.length / totalSafeTiles) * 5
  }, [selectedTiles.length, customMines])

  // Start auto play with selected tiles
  const startAutoPlay = useCallback(async () => {
    if (selectedTiles.length === 0 || !user || betAmount > user.balance) return
    
    setIsAutoPlaying(true)
    setIsPlaying(true)
    setGameEnded(false)
    
    try {
      // Generate mine positions using RGS
      const minePositions = await generateMinePositions(
        serverSeed || 'default',
        clientSeed || 'default', 
        globalNonce,
        5, 5, customMines
      )
      
      // Create new board with mines
      const board = generateEmptyBoard(5, 5)
      
      // Place mines on board
      minePositions.forEach(({ x, y }) => {
        if (board[y] && board[y][x]) {
          board[y][x].isMine = true
        }
      })

      setGameState(prev => ({
        ...prev,
        board,
        minesLeft: customMines,
        gameStatus: 'playing',
        startTime: Date.now(),
        clearedTiles: 0
      }))

      // Update user balance
      updateBalance(user.balance - betAmount, 'coins')
      
      // Increment nonce for next game
      incrementNonce()

      // Auto-reveal selected tiles with delay
      for (let i = 0; i < selectedTiles.length; i++) {
        const tile = selectedTiles[i]
        await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay between reveals
        
        setGameState(prev => {
          if (prev.gameStatus !== 'playing') return prev
          
          const newBoard = prev.board.map(row => [...row])
          const cell = newBoard[tile.y][tile.x]
          
          if (cell.isRevealed) return prev
          
          cell.isRevealed = true
          
          // Check if mine - GAME OVER
          if (cell.isMine) {
            setGameEnded(true)
            setIsPlaying(false)
            setIsAutoPlaying(false)
            setCanCashOut(false)
            
            // Reveal all mines
            newBoard.forEach(row => {
              row.forEach(cell => {
                if (cell.isMine) {
                  cell.isRevealed = true
                }
              })
            })
            
            return {
              ...prev,
              gameStatus: 'lost',
              endTime: Date.now(),
              board: newBoard
            }
          }
          
          // Count cleared tiles
          const clearedTiles = newBoard.flat().filter(cell => cell.isRevealed && !cell.isMine).length
          const totalSafeTiles = config.boardWidth * config.boardHeight - customMines
          
          // Update multiplier
          const multiplier = 1 + (clearedTiles / totalSafeTiles) * 5
          setCurrentMultiplier(multiplier)
          
          // Enable cash-out after first tile
          if (clearedTiles > 0) {
            setCanCashOut(true)
          }
          
          // Check win condition
          if (clearedTiles === totalSafeTiles) {
            setIsAutoPlaying(false)
            return {
              ...prev,
              gameStatus: 'won',
              endTime: Date.now(),
              clearedTiles,
              board: newBoard
            }
          }
          
          return {
            ...prev,
            clearedTiles,
            board: newBoard
          }
        })
      }
      
      setIsAutoPlaying(false)
      
    } catch (error) {
      console.error('Error in auto play:', error)
      setIsPlaying(false)
      setIsAutoPlaying(false)
    }
  }, [selectedTiles, user, betAmount, serverSeed, clientSeed, globalNonce, customMines, updateBalance, generateEmptyBoard, incrementNonce])

  // Adjust selected tiles when mine count changes
  useEffect(() => {
    if (gameMode === 'auto' && gameState.gameStatus === 'waiting') {
      const maxSafeTiles = config.boardWidth * config.boardHeight - customMines
      
      if (selectedTiles.length > maxSafeTiles) {
        // Remove the most recently selected tiles (sort by timestamp descending, keep the oldest)
        setSelectedTiles(prev => {
          const sorted = [...prev].sort((a, b) => a.timestamp - b.timestamp)
          return sorted.slice(0, maxSafeTiles)
        })
      }
    }
  }, [customMines, gameMode, gameState.gameStatus, selectedTiles.length])
  useEffect(() => {
    if (gameState.gameStatus === 'lost') {
      setGameHistory(prev => [{
        result: 'lost',
        multiplier: 0,
        minesFound: gameState.clearedTiles,
        totalMines: customMines
      }, ...prev.slice(0, 19)]) // Keep last 20 games
    }
  }, [gameState.gameStatus, gameState.clearedTiles, customMines])

  // End game and reveal server seed
  const endGame = useCallback(async () => {
    if (!gameResult) return

    try {
      const response = await fetch('/api/minesweeper/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: gameResult.roundId,
          playerId: user?.id
        })
      })

      const reveal = await response.json()
      // Server seed is now managed by the global store

      // Calculate payout
      const totalSafeTiles = config.boardWidth * config.boardHeight - customMines
      const payoutMultiplier = gameState.gameStatus === 'won' ? 2.0 : (gameState.clearedTiles / totalSafeTiles) * 1.5
      const payout = betAmount * payoutMultiplier

      if (user) {
        updateBalance(user.balance + payout, 'coins')
      }

      // Add to game history
      addRoll({
        result: payoutMultiplier,
        won: true,
        target: customMines,
        direction: 'under' as const,
        betAmount,
        payout,
        timestamp: new Date(),
        gameType: 'minesweeper'
      })

      // Record game session for live feed and raffle tracking
      try {
        if (user) {
          if (gameState.gameStatus === 'won' && payout > 0) {
            await recordGameWin(
              user.id,
              'minesweeper',
              'Minesweeper',
              betAmount,
              payout,
              payoutMultiplier,
              {
                minesFound: gameState.clearedTiles,
                totalMines: customMines,
                boardSize: `${config.boardWidth}x${config.boardHeight}`,
                roundId: gameResult.roundId
              }
            )
          } else if (gameState.gameStatus === 'lost') {
            await recordGameLoss(
              user.id,
              'minesweeper',
              'Minesweeper',
              betAmount,
              0,
              {
                minesFound: gameState.clearedTiles,
                totalMines: customMines,
                boardSize: `${config.boardWidth}x${config.boardHeight}`,
                roundId: gameResult.roundId
              }
            )
          }
        }
      } catch (error) {
        console.error('Error recording game session:', error)
      }

      // Add to local game history
      setGameHistory(prev => [{
        result: 'won',
        multiplier: payoutMultiplier,
        minesFound: gameState.clearedTiles,
        totalMines: customMines
      }, ...prev.slice(0, 19)]) // Keep last 20 games

      // Increment nonce for next game
      incrementNonce()

    } catch (error) {
      console.error('Error ending game:', error)
    }

    setIsPlaying(false)
  }, [gameResult, user, config, gameState, betAmount, updateBalance, addRoll, incrementNonce])

  // Verify game result
  const verifyGame = useCallback(async () => {
    if (!serverSeed || !gameResult) return

    const result = await verifyGameResult(
      serverSeed,
      clientSeed,
      globalNonce,
      config.boardWidth,
      config.boardHeight,
      config.mineCount,
      gameResult.resultHash
    )

    setVerificationResult(result)
    setShowVerification(true)
  }, [serverSeed, gameResult, clientSeed, globalNonce, config])

  // Handle game end
  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      endGame()
    }
  }, [gameState.gameStatus, endGame])

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419]">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center space-x-3 mb-4">
            <img src="/Logo11.png" alt="Edge Casino" className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-white">Edge Mines</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Click tiles on a 5×5 board. Green tiles are safe, red tiles are mines!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-4">
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
                  2x
                </Button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-3">
                {[0.01, 0.10, 1, 10, 100].map(amount => (
                  <Button
                    key={amount}
                    variant={betAmount === amount ? "default" : "outline"}
                    onClick={() => setBetAmount(amount)}
                    className={`h-10 text-sm ${betAmount === amount ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300 hover:bg-[#374151]'}`}
                  >
                    {amount}
                  </Button>
                ))}
              </div>

              <div className="text-sm text-gray-400">
                Profit on Win: ${(betAmount * currentMultiplier - betAmount).toFixed(2)} SC
              </div>
            </div>

            {/* Game Settings */}
            <div className="bg-[#1a2c38] rounded-lg p-3">
              <div className="text-lg text-gray-400 mb-3">Game Settings</div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Number of Mines</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={customMines}
                      onChange={(e) => setCustomMines(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                      min="1"
                      max="24"
                      className="flex-1 bg-[#2d3748] border-[#374151] text-white text-center"
                    />
                    <Button
                      onClick={() => setCustomMines(Math.max(1, customMines - 1))}
                      className="bg-[#2d3748] hover:bg-[#374151] text-white px-3"
                    >
                      -
                    </Button>
                    <Button
                      onClick={() => setCustomMines(Math.min(24, customMines + 1))}
                      className="bg-[#2d3748] hover:bg-[#374151] text-white px-3"
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div>Mines: {customMines}</div>
                    <div>Safe Tiles: {25 - customMines}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fairness Button */}
            <Button
              variant="outline"
              onClick={() => setShowVerification(true)}
              className="w-full border-[#374151] text-gray-300 hover:bg-[#374151] h-12 text-lg"
            >
              <Shield className="h-5 w-5 mr-2" />
              Fairness
            </Button>

            {/* Game Mode */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant={gameMode === 'manual' ? "default" : "outline"}
                onClick={() => setGameMode('manual')}
                className={`${gameMode === 'manual' ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300'} h-12 text-lg`}
              >
                Manual
              </Button>
              <Button
                variant={gameMode === 'auto' ? "default" : "outline"}
                onClick={() => setGameMode('auto')}
                className={`${gameMode === 'auto' ? 'bg-[#00d4ff] text-black' : 'border-[#374151] text-gray-300'} h-12 text-lg`}
              >
                Auto
              </Button>
            </div>

            {/* Bet Button */}
            <Button
              onClick={gameMode === 'auto' ? startAutoPlay : startNewGame}
              disabled={!user || betAmount > (user.balance || 0) || (gameMode === 'auto' && selectedTiles.length === 0)}
              className="w-full bg-green-500 hover:bg-green-600 text-white h-14 text-xl font-bold"
            >
              {gameMode === 'auto' && gameState.gameStatus === 'waiting' 
                ? selectedTiles.length === 0 
                  ? 'Select Tiles First' 
                  : `Auto Play (${selectedTiles.length} tiles)`
                : gameState.gameStatus === 'lost' ? 'New Game' : 
                 gameState.gameStatus === 'won' ? 'New Game' :
                 gameState.gameStatus === 'cashed_out' ? 'New Game' :
                 isPlaying ? 'Game Active' : 'Bet'}
            </Button>

            {/* Cash Out Button */}
            {canCashOut && gameState.gameStatus === 'playing' && (
              <Button
                onClick={cashOut}
                variant="secondary"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black h-12 text-lg font-bold"
              >
                Cash Out ({currentMultiplier.toFixed(2)}x)
              </Button>
            )}

            {/* Reset Game Button */}
            {(gameState.gameStatus === 'won' || gameState.gameStatus === 'lost' || gameState.gameStatus === 'cashed_out') && (
              <Button
                onClick={resetGame}
                variant="outline"
                className="w-full border-[#374151] text-gray-300 hover:bg-[#374151] h-12 text-lg"
              >
                New Game
              </Button>
            )}

            {/* Auto Mode Info */}
            {gameMode === 'auto' && gameState.gameStatus === 'waiting' && (
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <div className="text-lg text-gray-400 mb-3">Auto Mode</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Selected Tiles:</span>
                    <span className="text-white">{selectedTiles.length} / {config.boardWidth * config.boardHeight - customMines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential Multiplier:</span>
                    <span className="text-green-400 font-bold">{calculatePotentialMultiplier().toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential Win:</span>
                    <span className="text-green-400 font-bold">${(betAmount * calculatePotentialMultiplier()).toFixed(2)} SC</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Click tiles to select them, then click "Auto Play" to reveal them automatically
                  </div>
                  {selectedTiles.length >= (config.boardWidth * config.boardHeight - customMines) && (
                    <div className="text-xs text-yellow-400 mt-1">
                      ⚠️ Maximum safe tiles selected
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Game Stats */}
            {gameState.gameStatus !== 'waiting' && (
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <div className="text-lg text-gray-400 mb-3">Game Stats</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${
                      gameState.gameStatus === 'won' ? 'text-green-400' :
                      gameState.gameStatus === 'lost' ? 'text-red-400' :
                      'text-blue-400'
                    }`}>
                      {gameState.gameStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mines Left:</span>
                    <span className="text-white">{gameState.minesLeft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cleared:</span>
                    <span className="text-white">{gameState.clearedTiles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Multiplier:</span>
                    <span className="text-green-400 font-bold">{currentMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white">
                      {gameState.endTime 
                        ? Math.floor((gameState.endTime - gameState.startTime) / 1000)
                        : Math.floor((Date.now() - gameState.startTime) / 1000)
                      }s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-1">
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Mines Board</h2>
              </div>

              {/* Game Status */}
              <div className="mb-4 text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  gameState.gameStatus === 'waiting' ? 'bg-gray-600 text-gray-300' :
                  gameState.gameStatus === 'playing' ? 'bg-green-600 text-white' :
                  gameState.gameStatus === 'won' ? 'bg-green-500 text-white' :
                  gameState.gameStatus === 'lost' ? 'bg-red-500 text-white' :
                  gameState.gameStatus === 'cashed_out' ? 'bg-yellow-500 text-black' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {gameState.gameStatus === 'waiting' ? 'Ready to Play' :
                   gameState.gameStatus === 'playing' ? 'Game Active' :
                   gameState.gameStatus === 'won' ? 'You Won!' :
                   gameState.gameStatus === 'lost' ? 'Game Over - Click New Game' :
                   gameState.gameStatus === 'cashed_out' ? 'Cashed Out!' :
                   'Ready to Play'}
                </div>
              </div>

              {/* Game Board */}
              <div className="bg-black/20 rounded-lg p-6 overflow-auto max-h-[700px]">
                <div 
                  className="grid gap-2 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(5, 1fr)`,
                    width: 'fit-content'
                  }}
                >
                    {gameState.board.flat().map((cell, index) => (
                      <motion.button
                        key={`${cell.x}-${cell.y}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (gameMode === 'auto' && gameState.gameStatus === 'waiting') {
                            toggleTileSelection(cell.x, cell.y)
                          } else {
                            revealCell(cell.x, cell.y)
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          if (gameMode === 'auto' && gameState.gameStatus === 'waiting') {
                            toggleTileSelection(cell.x, cell.y)
                          } else {
                            toggleFlag(cell.x, cell.y)
                          }
                        }}
                        className={`
                          w-16 h-16 rounded-lg text-lg font-bold transition-all duration-200 cursor-pointer
                          ${cell.isRevealed 
                            ? cell.isMine 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-600 text-white'
                            : cell.isFlagged
                              ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                              : gameMode === 'auto' && gameState.gameStatus === 'waiting' && selectedTiles.some(tile => tile.x === cell.x && tile.y === cell.y)
                                ? 'bg-blue-500 text-white border-2 border-blue-300'
                                : gameMode === 'auto' && gameState.gameStatus === 'waiting' && selectedTiles.length >= (config.boardWidth * config.boardHeight - customMines)
                                  ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                                  : gameMode === 'auto' && gameState.gameStatus === 'waiting'
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-lg cursor-pointer'
                                    : gameState.gameStatus === 'playing'
                                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-lg'
                                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }
                        `}
                        disabled={gameMode === 'manual' && gameState.gameStatus !== 'playing'}
                      >
                        {cell.isFlagged ? (
                          <Flag className="h-6 w-6 mx-auto" />
                        ) : cell.isRevealed && cell.isMine ? (
                          <Bomb className="h-6 w-6 mx-auto" />
                        ) : cell.isRevealed ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                        ) : gameMode === 'auto' && gameState.gameStatus === 'waiting' ? (
                          <div className="w-2 h-2 bg-blue-300 rounded-full mx-auto opacity-50"></div>
                        ) : (
                          ''
                        )}
                      </motion.button>
                    ))}
                </div>
              </div>

              {/* Game Instructions */}
              <div className="mt-4 text-sm text-gray-400">
                {gameMode === 'auto' && gameState.gameStatus === 'waiting' ? (
                  <>
                    <p>• Click tiles to select them (blue highlight)</p>
                    <p>• Max {config.boardWidth * config.boardHeight - customMines} tiles (safe tiles only)</p>
                    <p>• Selected tiles will be revealed automatically</p>
                    <p>• Click "Auto Play" to start revealing</p>
                    <p>• Avoid selecting mines!</p>
                  </>
                ) : (
                  <>
                    <p>• Click tiles to reveal them</p>
                    <p>• Green tiles are safe</p>
                    <p>• Red tiles with bombs are mines</p>
                    <p>• Right click to flag/unflag mines</p>
                    <p>• Clear all safe tiles to win</p>
                    <p>• Avoid hitting mines!</p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Game History */}
          <div className="lg:col-span-1 space-y-4">
            {/* Recent Games */}
            <div className="bg-[#1a2c38] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Games</h3>
              <div className="flex flex-wrap gap-2">
                {gameHistory.slice(0, 20).map((game, index) => (
                  <span
                    key={index}
                    className={`inline-block w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center ${
                      game.result === 'won' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {game.multiplier.toFixed(1)}x
                  </span>
                ))}
                {gameHistory.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent games</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Modal */}
        <VerificationModal
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
          verificationResult={verificationResult}
                serverSeed={serverSeed}
      clientSeed={clientSeed}
      nonce={globalNonce}
        />
      </div>
    </CasinoLayout>
  )
}

export default EdgeMinesweeper
