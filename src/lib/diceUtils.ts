// Provably Fair RNG System for Edge Dice
// Based on Stake.com's provably fair implementation

export interface DiceRollParams {
  serverSeed: string
  clientSeed: string
  nonce: number
}

export interface DiceRollResult {
  result: number // 0.00 to 100.00
  hash: string
  verification: {
    serverSeed: string
    clientSeed: string
    nonce: number
    combined: string
  }
}

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
 * Generate a provably fair dice roll using Stake's method
 * Returns a number between 0.00 and 100.00
 */
export const generateDiceRoll = async (params: DiceRollParams): Promise<DiceRollResult> => {
  const { serverSeed, clientSeed, nonce } = params
  const combined = `${serverSeed}:${clientSeed}:${nonce}`
  const hash = await sha256(combined)
  
  // Use first 8 characters of hash to generate decimal (Stake method)
  const decimal = parseInt(hash.slice(0, 8), 16) / 0xFFFFFFFF
  
  // Convert to 0.00-100.00 range (like Stake/Roobet)
  const result = decimal * 100
  
  return {
    result,
    hash,
    verification: {
      serverSeed,
      clientSeed,
      nonce,
      combined
    }
  }
}

/**
 * Verify a dice roll result
 */
export const verifyDiceRoll = async (params: DiceRollParams, expectedResult: number): Promise<boolean> => {
  const result = await generateDiceRoll(params)
  return Math.abs(result.result - expectedResult) < 0.01 // Allow 0.01 tolerance
}

/**
 * Calculate payout multiplier with house edge (Stake method)
 */
export const calculatePayoutMultiplier = (probability: number, houseEdge: number = 0.01): number => {
  if (probability <= 0 || probability >= 1) return 1
  return (1 - houseEdge) / probability
}

/**
 * Generate lookup table for all possible targets (0.01 to 99.99)
 */
export const generateLookupTable = (direction: 'under' | 'over', betAmount: number, houseEdge: number = 0.01) => {
  const table = []
  
  for (let i = 1; i <= 9999; i++) {
    const target = i / 100 // 0.01 to 99.99
    const probability = direction === 'under' ? target / 100 : (100 - target) / 100
    const multiplier = calculatePayoutMultiplier(probability, houseEdge)
    const payout = multiplier * betAmount
    
    table.push({
      target,
      probability: probability,
      multiplier: Math.round(multiplier * 10000) / 10000, // 4 decimal places like Stake
      payout: Math.round(payout * 100) / 100
    })
  }
  
  return table
}

/**
 * Determine if a bet wins
 */
export const determineBetResult = (roll: number, target: number, direction: 'under' | 'over'): boolean => {
  return direction === 'under' ? roll < target : roll > target
}

/**
 * Calculate house edge percentage
 */
export const calculateHouseEdge = (probability: number, payout: number, betAmount: number): number => {
  const expectedValue = probability * payout
  return ((betAmount - expectedValue) / betAmount) * 100
}

/**
 * Generate verification URL for external verification
 */
export const generateVerificationUrl = (params: DiceRollParams, result: number): string => {
  const { serverSeed, clientSeed, nonce } = params
  return `https://dice-verifier.edge.com/verify?serverSeed=${serverSeed}&clientSeed=${clientSeed}&nonce=${nonce}&result=${result}`
}

/**
 * Get hashed server seed for display (before reveal)
 */
export const getHashedServerSeed = async (serverSeed: string): Promise<string> => {
  return await sha256(serverSeed)
}

/**
 * Convert decimal result to 0-100 range for display
 */
export const formatDiceResult = (result: number): string => {
  return (result * 100).toFixed(2)
}
