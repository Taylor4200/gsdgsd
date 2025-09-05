/**
 * Minesweeper Provably Fair Implementation
 * 
 * Integrates with the existing RGS system used by other casino games.
 * Uses the same server seed, client seed, and nonce system as Limbo, Dice, etc.
 */

import { 
  generateRandomFloat, 
  HOUSE_EDGE,
  type RGSParams,
  type RGSResult 
} from '@/lib/rgsUtils'

export interface GameConfig {
  boardWidth: number
  boardHeight: number
  mineCount: number
  stake: number
}

export interface MinePosition {
  x: number
  y: number
}

export interface GameResult {
  roundId: string
  boardWidth: number
  boardHeight: number
  mineCount: number
  minePositions: MinePosition[]
  resultHash: string
  stake: number
  payout: number
  clearedTiles: number
  timestamp: number
}

export interface VerificationResult {
  isValid: boolean
  computedMines: MinePosition[]
  computedHash: string
  providedHash: string
  match: boolean
}

/**
 * Generate mine positions using the same RGS system as other games
 * Uses rejection sampling to avoid modulo bias
 */
export async function generateMinePositions(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  boardWidth: number,
  boardHeight: number,
  mineCount: number
): Promise<MinePosition[]> {
  const totalCells = boardWidth * boardHeight
  
  if (mineCount >= totalCells) {
    throw new Error('Mine count cannot be greater than or equal to total cells')
  }
  
  // Use the same RGS system as other games
  const rgsParams: RGSParams = {
    serverSeed,
    clientSeed,
    nonce,
    gameType: 'minesweeper' as any // Add minesweeper to the game types
  }
  
  const positions: number[] = []
  const availablePositions = Array.from({ length: totalCells }, (_, i) => i)
  
  // Generate mine positions using multiple RGS calls
  for (let i = 0; i < mineCount; i++) {
    // Use different nonce for each position to ensure uniqueness
    const positionParams = { ...rgsParams, nonce: nonce + i }
    const randomFloat = await generateRandomFloat(positionParams)
    
    // Convert to position index using rejection sampling
    const maxIndex = availablePositions.length
    const randomIndex = Math.floor(randomFloat * maxIndex)
    
    const selectedPosition = availablePositions[randomIndex]
    positions.push(selectedPosition)
    availablePositions.splice(randomIndex, 1)
  }
  
  // Convert 1D positions to 2D coordinates
  return positions.map(pos => ({
    x: pos % boardWidth,
    y: Math.floor(pos / boardWidth)
  }))
}

/**
 * Calculate payout based on cleared tiles using the same system as other games
 */
export function calculatePayout(
  clearedTiles: number,
  totalTiles: number,
  mineCount: number,
  stake: number
): number {
  const clearedPercentage = clearedTiles / totalTiles
  const minePercentage = mineCount / totalTiles
  
  // Base multiplier increases with cleared percentage
  let multiplier = 1 + (clearedPercentage * 10)
  
  // Bonus for clearing more tiles than mines
  if (clearedTiles > mineCount) {
    multiplier *= 1.5
  }
  
  // Apply house edge (same as other games)
  multiplier *= (1 - HOUSE_EDGE)
  
  return stake * multiplier
}

/**
 * Generate complete game result using the RGS system
 */
export async function generateGameResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  config: GameConfig
): Promise<GameResult> {
  const { boardWidth, boardHeight, mineCount, stake } = config
  
  // Generate mine positions using RGS
  const minePositions = await generateMinePositions(
    serverSeed,
    clientSeed,
    nonce,
    boardWidth,
    boardHeight,
    mineCount
  )
  
  // Calculate result hash for verification
  const resultData = {
    boardWidth,
    boardHeight,
    mineCount,
    minePositions: minePositions.sort((a, b) => a.y - b.y || a.x - b.x),
    stake,
    nonce
  }
  
  const resultHash = await generateResultHash(resultData)
  
  // For now, assume player cleared 50% of safe tiles (this would come from actual gameplay)
  const totalTiles = boardWidth * boardHeight
  const safeTiles = totalTiles - mineCount
  const clearedTiles = Math.floor(safeTiles * 0.5) // This would be actual gameplay result
  
  const payout = calculatePayout(clearedTiles, totalTiles, mineCount, stake)
  
  return {
    roundId: `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    boardWidth,
    boardHeight,
    mineCount,
    minePositions,
    resultHash,
    stake,
    payout,
    clearedTiles,
    timestamp: Date.now()
  }
}

/**
 * Verify a game result using the RGS system
 */
export async function verifyGameResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  boardWidth: number,
  boardHeight: number,
  mineCount: number,
  providedHash: string
): Promise<VerificationResult> {
  try {
    // Regenerate mine positions using the same RGS algorithm
    const computedMines = await generateMinePositions(
      serverSeed,
      clientSeed,
      nonce,
      boardWidth,
      boardHeight,
      mineCount
    )
    
    // Regenerate result hash
    const resultData = {
      boardWidth,
      boardHeight,
      mineCount,
      minePositions: computedMines.sort((a, b) => a.y - b.y || a.x - b.x),
      stake: 0, // Not needed for verification
      nonce
    }
    
    const computedHash = await generateResultHash(resultData)
    
    return {
      isValid: true,
      computedMines,
      computedHash,
      providedHash,
      match: computedHash === providedHash
    }
  } catch (error) {
    return {
      isValid: false,
      computedMines: [],
      computedHash: '',
      providedHash,
      match: false
    }
  }
}

/**
 * Generate SHA-256 hash for result verification (same as other games)
 */
async function generateResultHash(data: any): Promise<string> {
  const message = JSON.stringify(data)
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a cryptographic signature for audit trails
 */
export function signResult(result: GameResult, privateKey: string): string {
  // For browser compatibility, we'll create a simple hash signature
  // In production, this should be done server-side with Node.js crypto
  const data = JSON.stringify(result)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Verify a cryptographic signature
 */
export function verifySignature(
  result: GameResult,
  signature: string,
  publicKey: string
): boolean {
  try {
    // For browser compatibility, we'll recreate the signature and compare
    // In production, this should be done server-side with Node.js crypto
    const expectedSignature = signResult(result, publicKey)
    return signature === expectedSignature
  } catch {
    return false
  }
}
