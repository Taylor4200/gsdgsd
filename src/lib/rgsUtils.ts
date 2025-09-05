// RGS (Random Game Server) Provably Fair RNG System
// Centralized RNG system for all casino games with adjustable house edge

export interface RGSParams {
  serverSeed: string
  clientSeed: string
  nonce: number
  gameType: 'dice' | 'limbo' | 'plinko' | 'blackjack' | 'crash' | 'minesweeper'
}

export interface RGSResult {
  result: number // Game-specific result
  hash: string
  verification: {
    serverSeed: string
    clientSeed: string
    nonce: number
    combined: string
    gameType: string
  }
}

// Global house edge configuration - easily adjustable
export const HOUSE_EDGE = 0.02 // 1% - change this one value to adjust house edge for all games

/**
 * Generate a cryptographically secure random server seed
 */
export const generateServerSeed = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a client seed (can be custom or random)
 */
export const generateClientSeed = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * SHA-256 hash function
 */
export const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a provably fair random number between 0 and 1
 * Uses SHA-256 hash of server seed + client seed + nonce
 */
export const generateRandomFloat = async (params: RGSParams): Promise<number> => {
  const { serverSeed, clientSeed, nonce, gameType } = params
  const combined = `${serverSeed}:${clientSeed}:${nonce}:${gameType}`
  const hash = await sha256(combined)

  console.log(`Random Float Debug - Combined: ${combined.slice(0, 50)}..., Hash: ${hash.slice(0, 16)}`)

  // Use first 8 characters of hash to generate decimal (0-1)
  const decimal = parseInt(hash.slice(0, 8), 16) / 0xFFFFFFFF

  return decimal
}

/**
 * Generate Limbo result with proper RGS system
 * Returns multiplier (1.00 to infinity)
 */
export const generateLimboResult = async (params: RGSParams): Promise<RGSResult> => {
  const randomFloat = await generateRandomFloat(params)
  
  console.log(`Limbo RGS Debug - Nonce: ${params.nonce}, Random Float: ${randomFloat.toFixed(6)}`)
  
  // Apply house edge and convert to multiplier
  // Formula: multiplier = (1 - houseEdge) / randomFloat
  // This ensures proper house edge and fair distribution
  const multiplier = (1 - HOUSE_EDGE) / randomFloat
  
  // Ensure minimum multiplier of 1.00
  const result = Math.max(1.00, multiplier)
  
  console.log(`Limbo Result: ${result.toFixed(2)}x (from ${randomFloat.toFixed(6)})`)
  
  const combined = `${params.serverSeed}:${params.clientSeed}:${params.nonce}:${params.gameType}`
  const hash = await sha256(combined)
  
  return {
    result,
    hash,
    verification: {
      serverSeed: params.serverSeed,
      clientSeed: params.clientSeed,
      nonce: params.nonce,
      combined,
      gameType: params.gameType
    }
  }
}

/**
 * Generate Dice result with proper RGS system
 * Returns number between 0.00 and 100.00
 */
export const generateDiceResult = async (params: RGSParams): Promise<RGSResult> => {
  const randomFloat = await generateRandomFloat(params)
  
  // Convert to 0.00-100.00 range
  const result = randomFloat * 100
  
  const combined = `${params.serverSeed}:${params.clientSeed}:${params.nonce}:${params.gameType}`
  const hash = await sha256(combined)
  
  return {
    result,
    hash,
    verification: {
      serverSeed: params.serverSeed,
      clientSeed: params.clientSeed,
      nonce: params.nonce,
      combined,
      gameType: params.gameType
    }
  }
}

/**
 * Calculate payout multiplier with house edge
 */
export const calculatePayoutMultiplier = (probability: number): number => {
  if (probability <= 0 || probability >= 1) return 1
  return (1 - HOUSE_EDGE) / probability
}

/**
 * Calculate win chance for Limbo
 */
export const calculateLimboWinChance = (targetMultiplier: number): number => {
  return (1 - HOUSE_EDGE) / targetMultiplier
}

/**
 * Calculate win chance for Dice
 */
export const calculateDiceWinChance = (target: number, direction: 'under' | 'over'): number => {
  const probability = direction === 'under' ? target / 100 : (100 - target) / 100
  return probability
}

/**
 * Verify a game result
 */
export const verifyGameResult = async (params: RGSParams, expectedResult: number): Promise<boolean> => {
  let result: RGSResult
  
  switch (params.gameType) {
    case 'limbo':
      result = await generateLimboResult(params)
      break
    case 'dice':
      result = await generateDiceResult(params)
      break
    default:
      return false
  }
  
  return Math.abs(result.result - expectedResult) < 0.01 // Allow 0.01 tolerance
}

/**
 * Get hashed server seed for verification
 */
export const getHashedServerSeed = async (serverSeed: string): Promise<string> => {
  return await sha256(serverSeed)
}

/**
 * Generate Plinko result with proper RGS system and house edge applied to probabilities
 * Returns bin index (0 to binCount-1) with house edge applied to win chances
 */
export const generatePlinkoResult = async (params: RGSParams, multipliers: number[]): Promise<RGSResult> => {
  const randomFloat = await generateRandomFloat(params)
  
  // Calculate base probabilities for each bin (binomial distribution)
  const binCount = multipliers.length
  const rows = binCount - 1
  
  const probabilities: number[] = []
  for (let i = 0; i < binCount; i++) {
    // Binomial coefficient: C(rows, i)
    const binomialCoeff = factorial(rows) / (factorial(i) * factorial(rows - i))
    const probability = binomialCoeff / Math.pow(2, rows)
    probabilities.push(probability)
  }
  
  // Apply house edge to probabilities (reduce win chances)
  const adjustedProbabilities: number[] = []
  let totalAdjustedProbability = 0
  
  // Debug: Log probabilities for verification
  console.log(`Plinko ${rows} rows probabilities:`)
  
  for (let i = 0; i < binCount; i++) {
    if (multipliers[i] >= 1) {
      // For winning bins, reduce probability by house edge
      const adjustedProb = probabilities[i] * (1 - HOUSE_EDGE)
      adjustedProbabilities.push(adjustedProb)
      totalAdjustedProbability += adjustedProb
      console.log(`  Bin ${i}: ${multipliers[i]}x - Base: ${(probabilities[i] * 100).toFixed(4)}% → Adjusted: ${(adjustedProb * 100).toFixed(4)}% (${(1/probabilities[i]).toFixed(0)} in ${(1/probabilities[i]).toFixed(0)})`)
    } else {
      // For losing bins, keep original probability
      adjustedProbabilities.push(probabilities[i])
      totalAdjustedProbability += probabilities[i]
      console.log(`  Bin ${i}: ${multipliers[i]}x - Probability: ${(probabilities[i] * 100).toFixed(4)}% (${(1/probabilities[i]).toFixed(0)} in ${(1/probabilities[i]).toFixed(0)})`)
    }
  }
  
  // Normalize probabilities to sum to 1
  const normalizedProbabilities = adjustedProbabilities.map(prob => prob / totalAdjustedProbability)
  
  // Convert random float to bin index using adjusted probabilities
  let cumulativeProbability = 0
  let binIndex = 0
  
  console.log(`RGS Debug - Random Float: ${randomFloat.toFixed(6)}, Nonce: ${params.nonce}`)
  
  for (let i = 0; i < binCount; i++) {
    cumulativeProbability += normalizedProbabilities[i]
    console.log(`  Bin ${i}: Cumulative: ${cumulativeProbability.toFixed(6)}, Random: ${randomFloat.toFixed(6)}`)
    if (randomFloat <= cumulativeProbability) {
      binIndex = i
      console.log(`  → Selected Bin ${binIndex} (${multipliers[binIndex]}x)`)
      break
    }
  }
  
  const combined = `${params.serverSeed}:${params.clientSeed}:${params.nonce}:${params.gameType}`
  const hash = await sha256(combined)
  
  return {
    result: binIndex,
    hash,
    verification: {
      serverSeed: params.serverSeed,
      clientSeed: params.clientSeed,
      nonce: params.nonce,
      combined,
      gameType: params.gameType
    }
  }
}

/**
 * Calculate Plinko multipliers with proper house edge applied to probabilities
 * Uses Stake's exact multiplier values but applies house edge to win chances
 */
export const calculatePlinkoMultipliers = (rows: number, difficulty: 'low' | 'medium' | 'high'): number[] => {
  // Stake's exact multiplier patterns (unchanged)
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

  const riskLevelMap = {
    low: 'LOW' as const,
    medium: 'MEDIUM' as const,
    high: 'HIGH' as const
  }

  const riskLevel = riskLevelMap[difficulty]
  return multipliers[rows]?.[riskLevel] || multipliers[16][riskLevel]
}

/**
 * Calculate factorial (helper function)
 */
const factorial = (n: number): number => {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}
