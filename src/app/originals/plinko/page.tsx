'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Matter from 'matter-js'
import {
  Shield,
  RotateCcw,
  Shuffle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/store/userStore'
import { useGameStatsStore } from '@/store/gameStatsStore'
import { useGlobalNonceStore } from '@/store/gameStore'
import { generatePlinkoResult, calculatePlinkoMultipliers } from '@/lib/rgsUtils'
import { formatCurrency } from '@/lib/utils'
import CasinoLayout from '@/components/layout/CasinoLayout'
import {
  generateServerSeed,
  generateClientSeed,
  getHashedServerSeed
} from '@/lib/rgsUtils'

interface PlinkoSession {
  serverSeed: string
  hashedServerSeed: string
  clientSeed: string
  nonce: number
}

interface PlinkoResult {
  binIndex: number
  multiplier: number
  won: boolean
  betAmount: number
  payout: number
  timestamp: Date
}

interface PlinkoGame {
  rows: number
  difficulty: 'low' | 'medium' | 'high'
  multipliers: number[]
  isDropping: boolean
  gameState: 'betting' | 'playing' | 'complete'
}

const EdgePlinko: React.FC = () => {
  const { user, selectedCurrency } = useUserStore()
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const ballRef = useRef<Matter.Body | null>(null)
  const pinsRef = useRef<Matter.Body[]>([])
  const wallsRef = useRef<Matter.Body[]>([])
  const sensorRef = useRef<Matter.Body | null>(null)
  const pinsLastRowXCoordsRef = useRef<number[]>([])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const [betAmount, setBetAmount] = useState<number>(0.01)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentGame, setCurrentGame] = useState<PlinkoGame>({
    rows: 16,
    difficulty: 'medium',
    multipliers: [],
    isDropping: false,
    gameState: 'betting'
  })
  const [won, setWon] = useState<boolean | null>(null)
  const [showFairnessModal, setShowFairnessModal] = useState(false)
  const [customClientSeed, setCustomClientSeed] = useState('')
  
  // Animation state
  const [showResult, setShowResult] = useState(false)
  
  // Session state - now using global nonce
  // Remove old session state - using global store instead

  // Game history
  const [gameHistory, setGameHistory] = useState<PlinkoResult[]>([])

  // Current game multiplier for display
  const [currentMultiplier, setCurrentMultiplier] = useState<number | null>(null)

  // Number of balls to drop
  const [ballCount, setBallCount] = useState<number>(1)

  // Track active balls for proper state management
  const [activeBallCount, setActiveBallCount] = useState<number>(0)

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  // Initialize physics engine
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const engine = Matter.Engine.create({
      timing: { timeScale: 1 } // Standard timing like temp-plinko
    })
    engineRef.current = engine

    const render = Matter.Render.create({
      engine: engine,
      canvas: canvas,
      options: {
        width: 760,
        height: 570,
        background: '#1a2c38',
        wireframes: false,
      }
    })
    renderRef.current = render

    const runner = Matter.Runner.create()
    runnerRef.current = runner

    placePinsAndWalls()

    // Create sensor for detecting ball landing
    const sensor = Matter.Bodies.rectangle(
      canvas.width / 2,
      canvas.height,
      canvas.width,
      10,
      {
        isSensor: true,
        isStatic: true,
        render: { visible: false }
      }
    )
    sensorRef.current = sensor
    Matter.Composite.add(engine.world, sensor)

    // Handle ball collision with sensor
    Matter.Events.on(engine, 'collisionStart', ({ pairs }) => {
      pairs.forEach(({ bodyA, bodyB }) => {
        if (bodyA === sensor) {
          handleBallEnterBin(bodyB)
        } else if (bodyB === sensor) {
          handleBallEnterBin(bodyA)
        }
      })
    })

    // Add boundary constraints to keep balls within the pin area
    Matter.Events.on(engine, 'beforeUpdate', () => {
      if (!engineRef.current) return
      
      const bodies = Matter.Composite.allBodies(engineRef.current.world)
      bodies.forEach((body) => {
        // Check if this is a ball
        if (body.circleRadius) {
          // Keep balls within the pin area (with some margin)
          const margin = 50
          if (body.position.x < margin) {
            Matter.Body.setPosition(body, { x: margin, y: body.position.y })
            Matter.Body.setVelocity(body, { x: Math.abs(body.velocity.x), y: body.velocity.y })
          } else if (body.position.x > canvas.width - margin) {
            Matter.Body.setPosition(body, { x: canvas.width - margin, y: body.position.y })
            Matter.Body.setVelocity(body, { x: -Math.abs(body.velocity.x), y: body.velocity.y })
          }
        }
      })
    })

    // Start renderer and engine
    Matter.Render.run(render)
    Matter.Runner.run(runner, engine)

    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current)
      }
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current)
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current)
      }
    }
  }, [currentGame.rows, currentGame.multipliers])

  // Place pins and walls
  const placePinsAndWalls = () => {
    if (!canvasRef.current || !engineRef.current) return

    const canvas = canvasRef.current
    const engine = engineRef.current

    // Clear existing pins and walls
    if (pinsRef.current.length > 0) {
      Matter.Composite.remove(engine.world, pinsRef.current)
      pinsRef.current = []
    }
    if (wallsRef.current.length > 0) {
      Matter.Composite.remove(engine.world, wallsRef.current)
      wallsRef.current = []
    }
    pinsLastRowXCoordsRef.current = []

    const PADDING_X = 52
    const PADDING_TOP = 36
    const PADDING_BOTTOM = 28
    const PIN_CATEGORY = 0x0001
    const BALL_CATEGORY = 0x0002

    const pinDistanceX = (canvas.width - PADDING_X * 2) / (3 + currentGame.rows - 1 - 1)
    const pinRadius = (24 - currentGame.rows) / 2

    // Create pins
    for (let row = 0; row < currentGame.rows; ++row) {
      const rowY = PADDING_TOP + ((canvas.height - PADDING_TOP - PADDING_BOTTOM) / (currentGame.rows - 1)) * row
      const rowPaddingX = PADDING_X + ((currentGame.rows - 1 - row) * pinDistanceX) / 2

      for (let col = 0; col < 3 + row; ++col) {
        const colX = rowPaddingX + ((canvas.width - rowPaddingX * 2) / (3 + row - 1)) * col
        const pin = Matter.Bodies.circle(colX, rowY, pinRadius, {
          isStatic: true,
          restitution: 1.0, // Super bouncy pins - always bounce ball away
          friction: 0, // Zero friction on pins - no sticking
          render: { fillStyle: '#ffffff' },
          collisionFilter: {
            category: PIN_CATEGORY,
            mask: BALL_CATEGORY // Collide with balls
          }
        })
        pinsRef.current.push(pin)

        if (row === currentGame.rows - 1) {
          pinsLastRowXCoordsRef.current.push(colX)
        }
      }
    }
    Matter.Composite.add(engine.world, pinsRef.current)

    // Create walls
    const firstPinX = pinsRef.current[0].position.x
    const leftWallAngle = Math.atan2(
      firstPinX - pinsLastRowXCoordsRef.current[0],
      canvas.height - PADDING_TOP - PADDING_BOTTOM
    )
    const leftWallX = firstPinX - (firstPinX - pinsLastRowXCoordsRef.current[0]) / 2 - pinDistanceX * 0.25

    const leftWall = Matter.Bodies.rectangle(leftWallX, canvas.height / 2, 10, canvas.height, {
      isStatic: true,
      angle: leftWallAngle,
      render: { visible: false }
    })
    const rightWall = Matter.Bodies.rectangle(canvas.width - leftWallX, canvas.height / 2, 10, canvas.height, {
      isStatic: true,
      angle: -leftWallAngle,
      render: { visible: false }
    })
    wallsRef.current = [leftWall, rightWall]
    Matter.Composite.add(engine.world, wallsRef.current)
  }

  // Calculate bins width percentage (like temp-plinko)
  const getBinsWidthPercentage = (): number => {
    if (!canvasRef.current || pinsLastRowXCoordsRef.current.length === 0) return 1
    const canvas = canvasRef.current
    const lastPinX = pinsLastRowXCoordsRef.current[pinsLastRowXCoordsRef.current.length - 1]
    return (lastPinX - pinsLastRowXCoordsRef.current[0]) / canvas.width
  }

  // Handle ball entering bin
  const handleBallEnterBin = (ball: Matter.Body) => {
    // Use the predetermined bin index from RGS system
    const predeterminedBinIndex = (ball as any).predeterminedBinIndex
    
    if (predeterminedBinIndex === undefined) {
      console.error('Ball missing predetermined bin index - RGS system not working!')
      return
    }
    
    // Check if this ball has already been processed
    if ((ball as any).processed) {
      console.log(`Ball already processed, ignoring duplicate collision`)
      return
    }
    
    // Mark ball as processed to prevent duplicate handling
    ;(ball as any).processed = true
    
    // Force the ball to the correct position for visual accuracy
    const canvas = canvasRef.current!
    const binWidth = canvas.width / currentGame.multipliers.length
    const targetBinCenter = (predeterminedBinIndex + 0.5) * binWidth
    
    console.log(`Ball entering bin: RGS = ${predeterminedBinIndex}, Target Center = ${targetBinCenter}, Current X = ${ball.position.x}`)
    
    // Update ball position to match RGS result
    Matter.Body.setPosition(ball, { x: targetBinCenter, y: ball.position.y })
    
    const binIndex = predeterminedBinIndex

    if (binIndex >= 0 && binIndex < currentGame.multipliers.length) {
      const multiplier = currentGame.multipliers[binIndex]
      const payoutValue = betAmount * multiplier
      const profit = payoutValue - betAmount
      const won = multiplier >= 1

      const result: PlinkoResult = {
        binIndex,
        multiplier,
        won,
        betAmount,
        payout: payoutValue,
        timestamp: new Date()
      }

      setGameHistory(prev => [result, ...prev])
      setWon(won)
      setCurrentMultiplier(multiplier)
      setShowResult(true)

      addRoll({
        result: multiplier,
        won,
        target: 0,
        direction: 'over',
        betAmount,
        payout: payoutValue,
        timestamp: new Date(),
        gameType: 'Plinko'
      })

      // Decrement active ball count
      setActiveBallCount(prev => {
        const newCount = prev - 1

        // If this was the last ball, handle state reset
        if (newCount === 0) {
          // For single balls, reset immediately for spam clicking
          if (ballCount === 1) {
            // Reset game state immediately so button reappears
            setCurrentGame(prevState => ({
              ...prevState,
              gameState: 'betting',
              isDropping: false
            }))
            setIsPlaying(false)

            // Keep result display for a short time
            setTimeout(() => {
              setWon(null)
              setShowResult(false)
            }, 500) // Shorter delay for result display
          } else {
            // For multiple balls, use longer delay
            setTimeout(() => {
              setCurrentGame(prevState => ({
                ...prevState,
                gameState: 'betting',
                isDropping: false
              }))
              setWon(null)
              setShowResult(false)
              setIsPlaying(false)
            }, 3000)
          }
        }

        return newCount
      })
    }

    if (engineRef.current) {
      Matter.Composite.remove(engineRef.current.world, ball)
    }
    ballRef.current = null
  }

  // Initialize session
  const initializeSession = async () => {
    // Initialize global session if not already set
    if (!serverSeed) {
      const newServerSeed = generateServerSeed()
      const newClientSeed = generateClientSeed()
      const newHashedServerSeed = await getHashedServerSeed(newServerSeed)
      
      setServerSeed(newServerSeed)
      setClientSeed(newClientSeed)
      setHashedServerSeed(newHashedServerSeed)
    }
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

  // Update multipliers based on difficulty and rows using RGS system
  useEffect(() => {
    const multipliers = calculatePlinkoMultipliers(currentGame.rows, currentGame.difficulty)
    setCurrentGame(prev => ({ ...prev, multipliers }))
  }, [currentGame.rows, currentGame.difficulty])

  // Generate multipliers based on difficulty and rows (like temp-plinko)
  const generateMultipliers = (rows: number, difficulty: 'low' | 'medium' | 'high'): number[] => {
    const riskLevelMap = {
      low: 'LOW' as const,
      medium: 'MEDIUM' as const,
      high: 'HIGH' as const
    }

    const riskLevel = riskLevelMap[difficulty]

    // temp-plinko multiplier patterns
    const multipliers: Record<number, Record<string, number[]>> = {
      8: {
        LOW: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        MEDIUM: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        HIGH: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
      },
      9: {
        LOW: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
        MEDIUM: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
        HIGH: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
      },
      10: {
        LOW: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
        MEDIUM: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
        HIGH: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
      },
      11: {
        LOW: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
        MEDIUM: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
        HIGH: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
      },
      12: {
        LOW: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
        MEDIUM: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        HIGH: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
      },
      13: {
        LOW: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
        MEDIUM: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
        HIGH: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
      },
      14: {
        LOW: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
        MEDIUM: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
        HIGH: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
      },
      15: {
        LOW: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
        MEDIUM: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
        HIGH: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
      },
      16: {
        LOW: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
        MEDIUM: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
        HIGH: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
      },
    }

    return multipliers[rows]?.[riskLevel] || multipliers[16][riskLevel]
  }

  // Generate provably fair random number
  const generateProvablyFairRandom = async (): Promise<number> => {
    const combinedSeed = `${serverSeed}-${clientSeed}-${globalNonce}`
    const encoder = new TextEncoder()
    const data = encoder.encode(combinedSeed)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    // Convert first 4 bytes to a number between 0 and 1
    const randomValue = (hashArray[0] << 24 | hashArray[1] << 16 | hashArray[2] << 8 | hashArray[3]) / 0xFFFFFFFF
    return randomValue
  }

  // Generate provably fair random with specific nonce
  const generateProvablyFairRandomWithNonce = async (nonce: number): Promise<number> => {
    const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}`
    const encoder = new TextEncoder()
    const data = encoder.encode(combinedSeed)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    // Convert first 4 bytes to a number between 0 and 1
    const randomValue = (hashArray[0] << 24 | hashArray[1] << 16 | hashArray[2] << 8 | hashArray[3]) / 0xFFFFFFFF
    return randomValue
  }

  // Place bet and start game (supports multiple balls and spam clicking)
  const placeBet = async () => {
    if (!engineRef.current) return

    const totalBetAmount = betAmount * ballCount

    if (betAmount <= 0) {
      alert('Please enter a valid bet amount')
      return
    }

    if (user && user.balance < totalBetAmount) {
      alert(`Insufficient ${selectedCurrency} balance. You need ${totalBetAmount} but only have ${user.balance}`)
      return
    }

    // Always allow drops - no restrictions for spam clicking
    // Each ball gets its own unique nonce from the global nonce system

    // Pre-calculate nonces for all balls to ensure unique RNG
    const nonces = Array.from({ length: ballCount }, (_, i) => globalNonce + i + 1)

    // Increment global nonce for all balls
    for (let i = 0; i < ballCount; i++) {
      incrementNonce()
    }

    // Set active ball count
    setActiveBallCount(prev => prev + ballCount)

    // Create multiple balls
    const canvas = canvasRef.current!
    const ballOffsetRangeX = (760 - 52 * 2) / (3 + currentGame.rows - 1 - 1) * 0.8
    const ballRadius = (24 - currentGame.rows) / 2 * 2

    // Friction air values for different row counts (from temp-plinko)
    const frictionAirByRowCount: Record<number, number> = {
      8: 0.0395,
      9: 0.041,
      10: 0.038,
      11: 0.0355,
      12: 0.0414,
      13: 0.0437,
      14: 0.0401,
      15: 0.0418,
      16: 0.0364,
    }

    // Drop multiple balls with slight delays
    for (let i = 0; i < ballCount; i++) {
      setTimeout(async () => {
        // Use RGS system to determine which bin this ball will land in
        const rgsResult = await generatePlinkoResult({
          serverSeed,
          clientSeed,
          nonce: nonces[i],
          gameType: 'plinko'
        }, currentGame.multipliers)
        
        // Store the predetermined result for this ball
        const predeterminedBinIndex = rgsResult.result
        
        // Generate random position for visual drop (doesn't affect result)
        const randomValue = await generateProvablyFairRandomWithNonce(nonces[i])

        // Calculate target path based on RGS result
        const binWidth = canvas.width / currentGame.multipliers.length
        const targetBinCenter = (predeterminedBinIndex + 0.5) * binWidth
        
        // Debug logging
        console.log(`Ball ${i}: RGS result = ${predeterminedBinIndex}, Multiplier = ${currentGame.multipliers[predeterminedBinIndex]}x, Target Center = ${targetBinCenter}`)
        
        // Create ball with controlled physics properties to keep it centered
        const ball = Matter.Bodies.circle(
          canvas.width / 2 + (randomValue - 0.5) * 10, // Very small random starting position (±5px)
          0,
          ballRadius,
          {
            restitution: 1.0, // Consistent bounciness
            friction: 0.1, // Consistent friction
            frictionAir: frictionAirByRowCount[currentGame.rows] || 0.0364, // Consistent air resistance
            collisionFilter: {
              category: 0x0002,
              mask: 0x0001 // Collide with pins only, but not other balls
            },
            render: { fillStyle: '#ff0000' }
          }
        )
        
        // Give the ball very small initial velocity to keep it centered
        const directionToTarget = targetBinCenter > canvas.width / 2 ? 1 : -1
        const randomBias = (randomValue - 0.5) * 0.5 // Reduced randomness
        const targetBias = directionToTarget * 0.1 // Very slight bias toward target
        const initialVelocityX = (targetBias + randomBias) * 0.3 // Much smaller velocity
        
        // Very small random vertical velocity
        const randomVerticalVelocity = (randomValue - 0.5) * 0.1
        
        Matter.Body.setVelocity(ball, { x: initialVelocityX, y: randomVerticalVelocity })
        
        // Store target information on the ball for physics guidance
        ;(ball as any).predeterminedBinIndex = predeterminedBinIndex
        ;(ball as any).targetBinCenter = targetBinCenter
        ;(ball as any).binWidth = binWidth
        ;(ball as any).targetDirection = targetBinCenter > canvas.width / 2 ? 1 : -1 // 1 for right, -1 for left

        if (engineRef.current) {
          Matter.Composite.add(engineRef.current.world, ball)
        }
      }, i * 100) // Reduced delay for faster spam clicking
    }
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
    
    setServerSeed(newServerSeed)
    setClientSeed(newClientSeed)
    setHashedServerSeed(hash)
    setCustomClientSeed('')
  }

  // Calculate potential win
  const getPotentialWin = () => {
    if (currentGame.gameState === 'betting') return betAmount * 2
    const avgMultiplier = currentGame.multipliers.reduce((sum, mult) => sum + mult, 0) / currentGame.multipliers.length
    return betAmount * avgMultiplier
  }

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419]">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center space-x-3 mb-4">
            <img src="/Logo11.png" alt="Edge Casino" className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-white">Edge Plinko</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Drop balls and watch them bounce to win multipliers
          </p>
        </div>

        {isDesktop ? (
          /* Desktop Layout */
          <div className="grid grid-cols-3 gap-6 px-6 pb-6">
            {/* Left Sidebar - Betting Controls */}
            <div className="space-y-4">
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

              </div>

              {/* Game Settings */}
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <h3 className="text-lg font-semibold text-white mb-3">Game Settings</h3>
                
                {/* Difficulty */}
                <div className="mb-3">
                  <label className="text-sm text-gray-400 block mb-2">Risk Level</label>
                  <select
                    value={currentGame.difficulty}
                    onChange={(e) => setCurrentGame(prev => ({ ...prev, difficulty: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full bg-[#2d3748] border-[#374151] text-white rounded-lg p-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Rows */}
                <div className="mb-3">
                  <label className="text-sm text-gray-400 block mb-2">Rows</label>
                  <select
                    value={currentGame.rows}
                    onChange={(e) => setCurrentGame(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
                    className="w-full bg-[#2d3748] border-[#374151] text-white rounded-lg p-2"
                  >
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(rows => (
                      <option key={rows} value={rows}>{rows}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Game Actions */}
              <Button
                onClick={placeBet}
                className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold py-4 text-lg"
              >
                Drop {ballCount} Ball{ballCount > 1 ? 's' : ''}
              </Button>

              {/* Fairness Button */}
              <Button
                variant="outline"
                onClick={() => setShowFairnessModal(true)}
                className="w-full border-[#374151] text-gray-300 hover:bg-[#374151] h-12 text-lg"
              >
                <Shield className="h-5 w-5 mr-2" />
                Fairness
              </Button>

              {/* Ball Count */}
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg text-gray-400">Number of Balls</span>
                  <span className="text-lg text-gray-400">{ballCount}</span>
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <Input
                    type="number"
                    value={ballCount}
                    onChange={(e) => setBallCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="10"
                    className="flex-1 bg-[#2d3748] border-[#374151] text-white text-center text-xl font-semibold h-14"
                  />
                  <Button
                    onClick={() => setBallCount(prev => Math.max(1, prev - 1))}
                    className="bg-[#2d3748] hover:bg-[#374151] text-white px-4 h-14"
                  >
                    -
                  </Button>
                  <Button
                    onClick={() => setBallCount(prev => Math.min(10, prev + 1))}
                    className="bg-[#2d3748] hover:bg-[#374151] text-white px-4 h-14"
                  >
                    +
                  </Button>
                </div>

                {/* Quick Ball Count Buttons */}
                <div className="grid grid-cols-5 gap-3 mb-2">
                  {[1, 2, 3, 5, 10].map((count) => (
                    <Button
                      key={count}
                      variant="outline"
                      size="sm"
                      onClick={() => setBallCount(count)}
                      className={`text-sm h-10 ${ballCount === count ? "bg-[#00d4ff] text-black border-[#00d4ff]" : "border-[#374151] text-gray-300"}`}
                    >
                      {count}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Bet</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(betAmount * ballCount)} {selectedCurrency}
                  </span>
                </div>
              </div>

              {/* Recent Bets */}
              <div className="bg-[#1a2c38] rounded-lg p-3">
                <h3 className="text-lg font-semibold text-white mb-3">Recent Bets</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameHistory.slice(0, 10).map((result, index) => (
                    <div
                      key={`${result.timestamp.getTime()}-${index}`}
                      className={`flex items-center justify-between p-2 rounded ${
                        result.won ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${result.won ? 'bg-green-400' : 'bg-red-400'}`} />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {result.multiplier.toFixed(1)}x
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatCurrency(result.betAmount)} {selectedCurrency}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                          {result.won ? '+' : ''}{formatCurrency(result.payout - result.betAmount)} {selectedCurrency}
                        </div>
                        <div className="text-xs text-gray-400">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {gameHistory.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      No recent bets
                    </div>
                  )}
                </div>
              </div>
            </div>

                         {/* Center - Plinko Board */}
             <div className="lg:col-span-2">
               <div className="bg-[#1a2c38] rounded-lg p-6 min-h-[300px] pb-12 flex flex-col justify-center items-center">
                 {/* Physics Canvas */}
                 <div className="relative w-full max-w-2xl">
                   <canvas
                     ref={canvasRef}
                     width={760}
                     height={570}
                     className="w-full h-full rounded-lg"
                   />
                   
                   {/* Game Result */}
                   {showResult && won !== null && currentMultiplier !== null && (
                     <motion.div
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-6 rounded-lg border-2 z-10 ${
                         won ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'
                       }`}
                       style={{ backdropFilter: 'blur(8px)' }}
                     >
                       <div className={`text-3xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                         {won ? 'WIN!' : 'LOSS'}
                       </div>
                       <div className="text-2xl font-semibold mt-2 text-white">
                         {currentMultiplier.toFixed(1)}x
                       </div>
                       <div className={`text-lg mt-1 ${won ? 'text-green-300' : 'text-red-300'}`}>
                         {formatCurrency(betAmount * currentMultiplier)} {selectedCurrency}
                       </div>
                     </motion.div>
                   )}

                   {/* Modern Side Win Counter */}
                   <div className="absolute right-[-60px] top-1/2 -translate-y-1/2">
                     <div className="flex w-12 flex-col overflow-hidden rounded-md text-sm">
                       {gameHistory.slice(-4).map((result, index) => {
                         // Calculate bin colors like temp-plinko
                         const binCount = currentGame.multipliers.length;
                         const isBinsEven = binCount % 2 === 0;
                         const redToYellowLength = Math.ceil(binCount / 2);

                         // Interpolate colors from red to yellow
                         const redToYellowBg = Array.from({ length: redToYellowLength }, (_, i) => {
                           const r = Math.round(255 + ((255 - 255) / (redToYellowLength - 1)) * i);
                           const g = Math.round(0 + ((192 - 0) / (redToYellowLength - 1)) * i);
                           const b = Math.round(63 + ((0 - 63) / (redToYellowLength - 1)) * i);
                           return `rgb(${r}, ${g}, ${b})`;
                         });

                         const backgroundColors = [...redToYellowBg, ...redToYellowBg.slice().reverse().slice(isBinsEven ? 0 : 1)];

                         return (
                           <div
                             key={`${result.timestamp.getTime()}-${index}`}
                             className="flex aspect-square items-center justify-center font-bold text-gray-950"
                             style={{
                               backgroundColor: backgroundColors[result.binIndex] || backgroundColors[0]
                             }}
                           >
                             {result.multiplier < 100 ? `${result.multiplier.toFixed(1)}×` : result.multiplier.toFixed(0)}
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 </div>
                 
                 {/* Bins Display */}
                 <div className="w-full max-w-2xl mt-0">
                   <div
                     className="mx-auto"
                     style={{
                       width: `${getBinsWidthPercentage() * 100}%`,
                       display: 'grid',
                       gridTemplateColumns: `repeat(${currentGame.multipliers.length}, 1fr)`,
                       gap: '1%',
                       // Adjust this value to move buckets horizontally (positive = right, negative = left)
                       transform: 'translateX(0px)'
                     }}
                   >
                     {currentGame.multipliers.map((multiplier, index) => {
                       // Calculate bin colors like temp-plinko
                       const binCount = currentGame.multipliers.length;
                       const isBinsEven = binCount % 2 === 0;
                       const redToYellowLength = Math.ceil(binCount / 2);

                       // Interpolate colors from red to yellow
                       const redToYellowBg = Array.from({ length: redToYellowLength }, (_, i) => {
                         const r = Math.round(255 + ((255 - 255) / (redToYellowLength - 1)) * i);
                         const g = Math.round(0 + ((192 - 0) / (redToYellowLength - 1)) * i);
                         const b = Math.round(63 + ((0 - 63) / (redToYellowLength - 1)) * i);
                         return `rgb(${r}, ${g}, ${b})`;
                       });

                       const redToYellowShadow = Array.from({ length: redToYellowLength }, (_, i) => {
                         const r = Math.round(166 + ((171 - 166) / (redToYellowLength - 1)) * i);
                         const g = Math.round(0 + ((121 - 0) / (redToYellowLength - 1)) * i);
                         const b = Math.round(4 + ((0 - 4) / (redToYellowLength - 1)) * i);
                         return `rgb(${r}, ${g}, ${b})`;
                       });

                       const backgroundColors = [...redToYellowBg, ...redToYellowBg.slice().reverse().slice(isBinsEven ? 0 : 1)];
                       const shadowColors = [...redToYellowShadow, ...redToYellowShadow.slice().reverse().slice(isBinsEven ? 0 : 1)];

                       return (
                         <div
                           key={index}
                           className="text-center rounded font-bold text-white shadow-lg flex items-center justify-center overflow-hidden"
                           style={{
                             backgroundColor: backgroundColors[index],
                             boxShadow: `0 2px ${shadowColors[index]}`,
                             width: '100%',
                             height: '32px',
                             fontSize: '11px',
                             lineHeight: '1',
                             padding: '0 2px'
                           }}
                         >
                           {multiplier < 100 ? `${multiplier}×` : multiplier}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
             </div>
          </div>
        ) : (
          /* Mobile Layout - Optimized for Gameplay */
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="text-center py-2 px-4 bg-[#0f1419] z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-3 mb-1"
              >
                <img src="/Logo11.png" alt="Edge Casino" className="h-5 w-5" />
                <h1 className="text-xl font-bold text-white">Plinko</h1>
              </motion.div>
            </div>

            {/* Game Area - Takes most of the screen */}
            <div className="flex-1 flex flex-col">
              {/* Plinko Board */}
              <div className="bg-[#1a2c38] p-2 flex flex-col justify-center items-center h-[40vh]">
                <div className="relative w-full max-w-sm">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="w-full h-full rounded-lg"
                  />
                  
                  {/* Game Result */}
                  {showResult && won !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-3 rounded-lg border-2 ${
                        won ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className={`text-xl font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                        {won ? 'WIN!' : 'LOSS'}
                      </div>
                      <div className="text-lg mt-2">
                        {currentGame.multipliers[Math.floor(Math.random() * currentGame.multipliers.length)]?.toFixed(1)}x
                      </div>
                    </motion.div>
                  )}

                  {/* Modern Side Win Counter - Mobile */}
                  <div className="absolute right-[-40px] top-1/2 -translate-y-1/2">
                    <div className="flex w-8 flex-col overflow-hidden rounded-sm text-xs">
                      {gameHistory.slice(-4).map((result, index) => {
                        // Calculate bin colors like temp-plinko
                        const binCount = currentGame.multipliers.length;
                        const isBinsEven = binCount % 2 === 0;
                        const redToYellowLength = Math.ceil(binCount / 2);

                        // Interpolate colors from red to yellow
                        const redToYellowBg = Array.from({ length: redToYellowLength }, (_, i) => {
                          const r = Math.round(255 + ((255 - 255) / (redToYellowLength - 1)) * i);
                          const g = Math.round(0 + ((192 - 0) / (redToYellowLength - 1)) * i);
                          const b = Math.round(63 + ((0 - 63) / (redToYellowLength - 1)) * i);
                          return `rgb(${r}, ${g}, ${b})`;
                        });

                        const backgroundColors = [...redToYellowBg, ...redToYellowBg.slice().reverse().slice(isBinsEven ? 0 : 1)];

                        return (
                          <div
                            key={`${result.timestamp.getTime()}-${index}`}
                            className="flex aspect-square items-center justify-center font-bold text-gray-950"
                            style={{
                              backgroundColor: backgroundColors[result.binIndex] || backgroundColors[0]
                            }}
                          >
                            {result.multiplier < 100 ? `${result.multiplier.toFixed(1)}×` : result.multiplier.toFixed(0)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Bins Display */}
                <div className="w-full max-w-sm mt-2">
                  <div
                    className="mx-auto"
                    style={{
                      width: `${getBinsWidthPercentage() * 100}%`,
                      display: 'grid',
                      gridTemplateColumns: `repeat(${currentGame.multipliers.length}, 1fr)`,
                      gap: '0.5%',
                      transform: 'translateX(0px)'
                    }}
                  >
                    {currentGame.multipliers.map((multiplier, index) => {
                      // Calculate bin colors like temp-plinko
                      const binCount = currentGame.multipliers.length;
                      const isBinsEven = binCount % 2 === 0;
                      const redToYellowLength = Math.ceil(binCount / 2);

                      // Interpolate colors from red to yellow
                      const redToYellowBg = Array.from({ length: redToYellowLength }, (_, i) => {
                        const r = Math.round(255 + ((255 - 255) / (redToYellowLength - 1)) * i);
                        const g = Math.round(0 + ((192 - 0) / (redToYellowLength - 1)) * i);
                        const b = Math.round(63 + ((0 - 63) / (redToYellowLength - 1)) * i);
                        return `rgb(${r}, ${g}, ${b})`;
                      });

                      const redToYellowShadow = Array.from({ length: redToYellowLength }, (_, i) => {
                        const r = Math.round(166 + ((171 - 166) / (redToYellowLength - 1)) * i);
                        const g = Math.round(0 + ((121 - 0) / (redToYellowLength - 1)) * i);
                        const b = Math.round(4 + ((0 - 4) / (redToYellowLength - 1)) * i);
                        return `rgb(${r}, ${g}, ${b})`;
                      });

                      const backgroundColors = [...redToYellowBg, ...redToYellowBg.slice().reverse().slice(isBinsEven ? 0 : 1)];
                      const shadowColors = [...redToYellowShadow, ...redToYellowShadow.slice().reverse().slice(isBinsEven ? 0 : 1)];

                      return (
                        <div
                          key={index}
                          className="text-center rounded font-bold text-white shadow-md flex items-center justify-center overflow-hidden"
                          style={{
                            backgroundColor: backgroundColors[index],
                            boxShadow: `0 2px ${shadowColors[index]}`,
                            width: '100%',
                            height: '20px',
                            fontSize: '8px',
                            lineHeight: '1',
                            padding: '0 1px'
                          }}
                        >
                          {multiplier < 100 ? `${multiplier}×` : multiplier}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Control Panel - Fixed at bottom */}
              <div className="bg-[#0f1419] p-3 space-y-2">
                {/* Bet Controls Row */}
                <div className="flex space-x-3">
                  {/* Bet Amount */}
                  <div className="flex-1 bg-[#1a2c38] rounded-lg p-2">
                    <div className="text-xs text-gray-400 mb-1">Bet Amount</div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="0.01"
                        className="flex-1 bg-[#2d3748] border-[#374151] text-white text-center text-sm font-semibold h-10"
                        placeholder="0.00"
                      />
                      <Button
                        onClick={() => setBetAmount(prev => prev / 2)}
                        className="bg-[#2d3748] hover:bg-[#374151] text-white px-2 h-10 text-xs"
                      >
                        ½
                      </Button>
                      <Button
                        onClick={() => setBetAmount(prev => prev * 2)}
                        className="bg-[#2d3748] hover:bg-[#374151] text-white px-2 h-10 text-xs"
                      >
                        2×
                      </Button>
                    </div>
                    {/* Quick Bet Buttons */}
                    <div className="grid grid-cols-5 gap-1">
                      {[0.01, 0.10, 1.00, 10.00, 100.00].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          className={`text-xs h-6 ${betAmount === amount ? "bg-[#00d4ff] text-black border-[#00d4ff]" : "border-[#374151] text-gray-300"}`}
                        >
                          {amount >= 1 ? amount.toFixed(0) : amount.toFixed(2)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Ball Count */}
                  <div className="flex-1 bg-[#1a2c38] rounded-lg p-2">
                    <div className="text-xs text-gray-400 mb-1">Balls</div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Input
                        type="number"
                        value={ballCount}
                        onChange={(e) => setBallCount(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max="10"
                        className="flex-1 bg-[#2d3748] border-[#374151] text-white text-center text-sm font-semibold h-10"
                      />
                      <Button
                        onClick={() => setBallCount(prev => Math.max(1, prev - 1))}
                        className="bg-[#2d3748] hover:bg-[#374151] text-white px-2 h-10 text-xs"
                      >
                        -
                      </Button>
                      <Button
                        onClick={() => setBallCount(prev => Math.min(10, prev + 1))}
                        className="bg-[#2d3748] hover:bg-[#374151] text-white px-2 h-10 text-xs"
                      >
                        +
                      </Button>
                    </div>
                    {/* Quick Ball Count Buttons */}
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 5, 10].map((count) => (
                        <Button
                          key={count}
                          variant="outline"
                          size="sm"
                          onClick={() => setBallCount(count)}
                          className={`text-xs h-6 ${ballCount === count ? "bg-[#00d4ff] text-black border-[#00d4ff]" : "border-[#374151] text-gray-300"}`}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Game Settings Row */}
                <div className="flex space-x-3">
                  {/* Risk Level */}
                  <div className="flex-1 bg-[#1a2c38] rounded-lg p-2">
                    <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                    <select
                      value={currentGame.difficulty}
                      onChange={(e) => setCurrentGame(prev => ({ ...prev, difficulty: e.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full bg-[#2d3748] border-[#374151] text-white rounded text-sm p-2 h-10"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Rows */}
                  <div className="flex-1 bg-[#1a2c38] rounded-lg p-2">
                    <div className="text-xs text-gray-400 mb-1">Rows</div>
                    <select
                      value={currentGame.rows}
                      onChange={(e) => setCurrentGame(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
                      className="w-full bg-[#2d3748] border-[#374151] text-white rounded text-sm p-2 h-10"
                    >
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(rows => (
                        <option key={rows} value={rows}>{rows}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Action Button */}
                <Button
                  onClick={placeBet}
                  className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold py-4 text-lg"
                >
                  Drop {ballCount} Ball{ballCount > 1 ? 's' : ''}
                </Button>

                {/* Total Bet Display */}
                <div className="text-center text-sm text-gray-400">
                  Total Bet: <span className="text-white font-semibold">{formatCurrency(betAmount * ballCount)} {selectedCurrency}</span>
                </div>

                {/* Fairness Button */}
                <Button
                  onClick={() => setShowFairnessModal(true)}
                  variant="outline"
                  className="w-full border-[#374151] text-gray-300 hover:bg-[#374151]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Fairness
                </Button>
              </div>
            </div>
          </div>
        )}

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
                        {clientSeed}
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
                        {globalNonce}
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
      </div>
    </CasinoLayout>
  )
}

export default EdgePlinko
