/**
 * Minesweeper RGS API Routes
 * 
 * These endpoints provide the Remote Gaming Server functionality for Minesweeper.
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
import { 
  generateMinePositions,
  generateGameResult,
  signResult,
  verifySignature,
  type GameConfig,
  type GameResult
} from '@/lib/minesweeper/provablyFair'

// In-memory storage for demo (use database in production)
const serverSeeds = new Map<string, { seed: string; hash: string; timestamp: number }>()
const gameResults = new Map<string, GameResult>()
const auditLog: Array<{ timestamp: number; action: string; data: any }> = []

// Generate RSA key pair for signing (in production, use proper key management)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

/**
 * POST /api/minesweeper/new-server-seed
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
    const serverSeedHash = generateServerSeedHash(serverSeed)
    const seedId = crypto.randomUUID()
    
    // Store seed securely (in production, use encrypted database)
    serverSeeds.set(seedId, {
      seed: serverSeed,
      hash: serverSeedHash,
      timestamp: Date.now()
    })
    
    // Log for audit
    auditLog.push({
      timestamp: Date.now(),
      action: 'SERVER_SEED_CREATED',
      data: { seedId, operatorId, hash: serverSeedHash }
    })
    
    return NextResponse.json({
      seedId,
      serverSeedHash,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })
    
  } catch (error) {
    console.error('Error creating server seed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/minesweeper/server-seed-hash
 * Returns the hash of a server seed for verification
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seedId = searchParams.get('seedId')
    
    if (!seedId) {
      return NextResponse.json({ error: 'Seed ID required' }, { status: 400 })
    }
    
    const seedData = serverSeeds.get(seedId)
    if (!seedData) {
      return NextResponse.json({ error: 'Seed not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      seedId,
      serverSeedHash: seedData.hash,
      timestamp: seedData.timestamp,
      isActive: true
    })
    
  } catch (error) {
    console.error('Error retrieving server seed hash:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/minesweeper/play
 * Generates a new Minesweeper game with provably fair results
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      seedId, 
      clientSeed, 
      nonce, 
      boardWidth, 
      boardHeight, 
      mineCount, 
      stake,
      playerId 
    } = body
    
    // Validate input
    if (!seedId || !clientSeed || nonce === undefined || !boardWidth || !boardHeight || !mineCount || !stake) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }
    
    // Validate game parameters
    if (boardWidth < 5 || boardWidth > 50 || boardHeight < 5 || boardHeight > 50) {
      return NextResponse.json({ error: 'Board size must be between 5x5 and 50x50' }, { status: 400 })
    }
    
    if (mineCount < 1 || mineCount >= boardWidth * boardHeight) {
      return NextResponse.json({ error: 'Invalid mine count' }, { status: 400 })
    }
    
    if (stake < 0.01 || stake > 10000) {
      return NextResponse.json({ error: 'Stake must be between 0.01 and 10000' }, { status: 400 })
    }
    
    // Get server seed
    const seedData = serverSeeds.get(seedId)
    if (!seedData) {
      return NextResponse.json({ error: 'Invalid seed ID' }, { status: 400 })
    }
    
    // Check if seed is expired (24 hours)
    if (Date.now() - seedData.timestamp > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Seed expired' }, { status: 400 })
    }
    
    // Generate game result using the integrated RGS system
    const config: GameConfig = {
      boardWidth,
      boardHeight,
      mineCount,
      stake
    }
    
    const gameResult = await generateGameResult(
      seedData.seed,
      clientSeed,
      nonce,
      config
    )
    
    // Sign the result for audit trail
    const signature = signResult(gameResult, privateKey)
    
    // Store result
    gameResults.set(gameResult.roundId, gameResult)
    
    // Log for audit
    auditLog.push({
      timestamp: Date.now(),
      action: 'GAME_PLAYED',
      data: { 
        roundId: gameResult.roundId, 
        playerId, 
        stake, 
        resultHash: gameResult.resultHash,
        signature 
      }
    })
    
    return NextResponse.json({
      roundId: gameResult.roundId,
      serverSeedHash: seedData.hash,
      clientSeed,
      nonce,
      resultHash: gameResult.resultHash,
      signature,
      boardWidth: gameResult.boardWidth,
      boardHeight: gameResult.boardHeight,
      mineCount: gameResult.mineCount,
      stake: gameResult.stake,
      timestamp: gameResult.timestamp
    })
    
  } catch (error) {
    console.error('Error playing game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/minesweeper/reveal
 * Reveals the server seed for a completed game
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roundId, playerId } = body
    
    if (!roundId || !playerId) {
      return NextResponse.json({ error: 'Round ID and Player ID required' }, { status: 400 })
    }
    
    const gameResult = gameResults.get(roundId)
    if (!gameResult) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    // Find the server seed used for this game
    let serverSeed = ''
    for (const [seedId, seedData] of serverSeeds.entries()) {
      if (seedData.hash === gameResult.resultHash) {
        serverSeed = seedData.seed
        break
      }
    }
    
    if (!serverSeed) {
      return NextResponse.json({ error: 'Server seed not found' }, { status: 404 })
    }
    
    // Log reveal for audit
    auditLog.push({
      timestamp: Date.now(),
      action: 'SERVER_SEED_REVEALED',
      data: { roundId, playerId, serverSeedHash: gameResult.resultHash }
    })
    
    return NextResponse.json({
      roundId,
      serverSeed,
      clientSeed: gameResult.clientSeed || 'default',
      nonce: gameResult.nonce || 0,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Error revealing server seed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/minesweeper/round-log
 * Returns audit log for a specific round
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roundId = searchParams.get('roundId')
    
    if (!roundId) {
      return NextResponse.json({ error: 'Round ID required' }, { status: 400 })
    }
    
    const gameResult = gameResults.get(roundId)
    if (!gameResult) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }
    
    // Get relevant audit logs
    const roundLogs = auditLog.filter(log => 
      log.data.roundId === roundId || 
      log.data.seedId === roundId
    )
    
    return NextResponse.json({
      roundId,
      gameResult,
      auditLog: roundLogs,
      publicKey,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Error retrieving round log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/minesweeper/audit-export
 * Exports audit logs for regulatory compliance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startTime = parseInt(searchParams.get('startTime') || '0')
    const endTime = parseInt(searchParams.get('endTime') || Date.now().toString())
    
    // Filter logs by time range
    const filteredLogs = auditLog.filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    )
    
    // Create export package
    const exportData = {
      exportTimestamp: Date.now(),
      timeRange: { startTime, endTime },
      totalLogs: filteredLogs.length,
      logs: filteredLogs,
      publicKey,
      version: '1.0.0'
    }
    
    // Sign the export
    const exportSignature = crypto
      .createSign('RSA-SHA256')
      .update(JSON.stringify(exportData))
      .sign(privateKey, 'hex')
    
    return NextResponse.json({
      ...exportData,
      signature: exportSignature
    })
    
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
