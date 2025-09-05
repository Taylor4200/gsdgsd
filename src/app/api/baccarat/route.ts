/**
 * Baccarat RGS API Routes
 * 
 * These endpoints provide the Remote Gaming Server functionality for Baccarat.
 * All endpoints are designed for regulatory compliance and audit trails.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { 
  generateServerSeed, 
  generateServerSeedHash, 
  generateRandomFloat,
  HOUSE_EDGE
} from '@/lib/rgsUtils'

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: number // 1-13 (1=Ace, 11=Jack, 12=Queen, 13=King)
  display: string
}

interface BaccaratGameResult {
  gameId: string
  serverSeed: string
  clientSeed: string
  nonce: number
  playerHand: Card[]
  bankerHand: Card[]
  playerScore: number
  bankerScore: number
  winner: 'player' | 'banker' | 'tie'
  betType: 'player' | 'banker' | 'tie'
  betAmount: number
  payout: number
  timestamp: number
  signature: string
}

// In-memory storage for demo (use database in production)
const serverSeeds = new Map<string, { seed: string; hash: string; timestamp: number }>()
const gameResults = new Map<string, BaccaratGameResult>()
const auditLog: Array<{ timestamp: number; action: string; data: any }> = []

// For demo purposes - in production, use proper key management
const publicKey = 'demo-public-key'
const privateKey = 'demo-private-key'

/**
 * POST /api/baccarat/new-server-seed
 * Creates a new server seed for the RGS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { operatorId } = body
    
    if (!operatorId) {
      return NextResponse.json({ error: 'Operator ID required' }, { status: 400 })
    }
    
    // Generate new server seed
    const serverSeed = generateServerSeed()
    const hashedServerSeed = generateServerSeedHash(serverSeed)
    
    // Store server seed
    serverSeeds.set(operatorId, {
      seed: serverSeed,
      hash: hashedServerSeed,
      timestamp: Date.now()
    })
    
    // Log audit trail
    auditLog.push({
      timestamp: Date.now(),
      action: 'new_server_seed',
      data: { operatorId, hashedServerSeed }
    })
    
    return NextResponse.json({
      success: true,
      hashedServerSeed,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Error creating server seed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/baccarat/server-seed
 * Gets the current server seed hash
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operatorId = searchParams.get('operatorId')
    
    if (!operatorId) {
      return NextResponse.json({ error: 'Operator ID required' }, { status: 400 })
    }
    
    const serverSeedData = serverSeeds.get(operatorId)
    if (!serverSeedData) {
      return NextResponse.json({ error: 'No server seed found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      hashedServerSeed: serverSeedData.hash,
      timestamp: serverSeedData.timestamp
    })
    
  } catch (error) {
    console.error('Error getting server seed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/baccarat/play
 * Plays a baccarat game and returns the result
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      operatorId, 
      clientSeed, 
      nonce, 
      betType, 
      betAmount 
    } = body
    
    // Validate input
    if (!operatorId || !clientSeed || nonce === undefined || !betType || !betAmount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    if (!['player', 'banker', 'tie'].includes(betType)) {
      return NextResponse.json({ error: 'Invalid bet type' }, { status: 400 })
    }
    
    if (betAmount <= 0) {
      return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 })
    }
    
    // Get server seed
    const serverSeedData = serverSeeds.get(operatorId)
    if (!serverSeedData) {
      return NextResponse.json({ error: 'No server seed found' }, { status: 404 })
    }
    
    // Generate game result
    const gameResult = await generateBaccaratResult(
      serverSeedData.seed,
      clientSeed,
      nonce,
      betType,
      betAmount
    )
    
    // Store game result
    gameResults.set(gameResult.gameId, gameResult)
    
    // Log audit trail
    auditLog.push({
      timestamp: Date.now(),
      action: 'baccarat_game',
      data: { 
        gameId: gameResult.gameId,
        operatorId,
        betType,
        betAmount,
        winner: gameResult.winner,
        payout: gameResult.payout
      }
    })
    
    return NextResponse.json({
      success: true,
      gameId: gameResult.gameId,
      playerHand: gameResult.playerHand,
      bankerHand: gameResult.bankerHand,
      playerScore: gameResult.playerScore,
      bankerScore: gameResult.bankerScore,
      winner: gameResult.winner,
      payout: gameResult.payout,
      signature: gameResult.signature,
      timestamp: gameResult.timestamp
    })
    
  } catch (error) {
    console.error('Error playing baccarat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/baccarat/verify
 * Verifies a game result
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 })
    }
    
    const gameResult = gameResults.get(gameId)
    if (!gameResult) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    // Verify signature
    const isValid = verifyBaccaratSignature(gameResult)
    
    return NextResponse.json({
      success: true,
      valid: isValid,
      gameResult: {
        gameId: gameResult.gameId,
        serverSeed: gameResult.serverSeed,
        clientSeed: gameResult.clientSeed,
        nonce: gameResult.nonce,
        playerHand: gameResult.playerHand,
        bankerHand: gameResult.bankerHand,
        playerScore: gameResult.playerScore,
        bankerScore: gameResult.bankerScore,
        winner: gameResult.winner,
        betType: gameResult.betType,
        betAmount: gameResult.betAmount,
        payout: gameResult.payout,
        timestamp: gameResult.timestamp
      }
    })
    
  } catch (error) {
    console.error('Error verifying game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Generate a baccarat game result using RGS
 */
async function generateBaccaratResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  betType: 'player' | 'banker' | 'tie',
  betAmount: number
): Promise<BaccaratGameResult> {
  const gameId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Create deck
  const deck = createDeck()
  
  // Shuffle deck using RGS
  const shuffledDeck = shuffleDeck(deck, serverSeed + clientSeed + nonce)
  
  // Deal cards
  const playerHand = [shuffledDeck[0], shuffledDeck[2]]
  const bankerHand = [shuffledDeck[1], shuffledDeck[3]]
  
  // Calculate initial scores
  let playerScore = calculateBaccaratScore(playerHand)
  let bankerScore = calculateBaccaratScore(bankerHand)
  
  let finalPlayerHand = [...playerHand]
  let finalBankerHand = [...bankerHand]
  let cardIndex = 4
  
  // Determine if player gets third card
  let playerThird = false
  if (playerScore <= 5) {
    playerThird = true
    finalPlayerHand.push(shuffledDeck[cardIndex++])
    playerScore = calculateBaccaratScore(finalPlayerHand)
  }

  // Determine if banker gets third card
  let bankerThird = false
  if (!playerThird) {
    // No player third card
    if (bankerScore <= 5) {
      bankerThird = true
      finalBankerHand.push(shuffledDeck[cardIndex++])
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
      finalBankerHand.push(shuffledDeck[cardIndex++])
    }
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
  const payout = calculateBaccaratPayout(betType, winner, betAmount)
  
  // Create result
  const result: BaccaratGameResult = {
    gameId,
    serverSeed,
    clientSeed,
    nonce,
    playerHand: finalPlayerHand,
    bankerHand: finalBankerHand,
    playerScore: finalPlayerScore,
    bankerScore: finalBankerScore,
    winner,
    betType,
    betAmount,
    payout,
    timestamp: Date.now(),
    signature: ''
  }
  
  // Sign result
  result.signature = signBaccaratResult(result)
  
  return result
}

/**
 * Create a deck of cards
 */
function createDeck(): Card[] {
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
  
  return deck
}

/**
 * Shuffle deck using RGS system
 */
function shuffleDeck(deck: Card[], seed: string): Card[] {
  const shuffled = [...deck]
  
  // Use RGS system for provably fair shuffle
  let currentSeed = seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate a random index using the seed
    const seedBytes = new TextEncoder().encode(currentSeed)
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

/**
 * Calculate Baccarat score (0-9)
 */
function calculateBaccaratScore(hand: Card[]): number {
  let total = 0
  for (const card of hand) {
    let value = card.value
    if (value >= 10) value = 0 // Face cards and 10s are worth 0
    total += value
  }
  return total % 10
}


/**
 * Calculate payout based on bet type and result
 */
function calculateBaccaratPayout(betType: 'player' | 'banker' | 'tie', winner: 'player' | 'banker' | 'tie', betAmount: number): number {
  if (betType === 'tie' && winner === 'tie') {
    return betAmount * 8 // Tie pays 8:1
  } else if (betType === 'banker' && winner === 'banker') {
    return betAmount * 1.95 // Banker pays 1.95:1 (5% commission)
  } else if (betType === 'player' && winner === 'player') {
    return betAmount * 2 // Player pays 1:1
  }
  return 0 // Loss
}

/**
 * Sign a baccarat result
 */
function signBaccaratResult(result: BaccaratGameResult): string {
  // Simple signature for demo - in production use proper crypto
  return `sig-${Date.now()}-${result.gameId}`
}

/**
 * Verify a baccarat result signature
 */
function verifyBaccaratSignature(result: BaccaratGameResult): boolean {
  try {
    const verify = crypto.createVerify('SHA256')
    const data = JSON.stringify({
      gameId: result.gameId,
      serverSeed: result.serverSeed,
      clientSeed: result.clientSeed,
      nonce: result.nonce,
      playerHand: result.playerHand,
      bankerHand: result.bankerHand,
      playerScore: result.playerScore,
      bankerScore: result.bankerScore,
      winner: result.winner,
      betType: result.betType,
      betAmount: result.betAmount,
      payout: result.payout,
      timestamp: result.timestamp
    })
    
    // Simple verification for demo - in production use proper crypto
    return result.signature.startsWith('sig-')
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}
