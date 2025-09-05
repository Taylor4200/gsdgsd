import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility type to handle motion component props
export type MotionProps<T> = T & {
  [K in keyof T]: T[K] extends React.HTMLAttributes<any> ? any : T[K]
}

export function formatCurrency(
  amount: number,
  currency: 'USD' | 'coins' | 'sweepstakes_coins' = 'USD',
  decimals: number = 2
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  switch (currency) {
    case 'USD':
      return `$${formatter.format(amount)}`
    case 'coins':
      return `${formatter.format(amount)} Coins`
    case 'sweepstakes_coins':
      return `${formatter.format(amount)} SC`
    default:
      return formatter.format(amount)
  }
}

export function formatNumber(num: number, compact: boolean = false): string {
  if (compact && num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (compact && num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateWinChance(rtp: number, betAmount: number, jackpot: number): number {
  // Simplified win chance calculation
  const baseChance = rtp / 100
  const jackpotBonus = Math.min(betAmount / jackpot, 0.1)
  return Math.min(baseChance + jackpotBonus, 0.95)
}

export function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'common':
      return '#9ca3af' // gray-400
    case 'rare':
      return '#3b82f6' // blue-500
    case 'epic':
      return '#8b5cf6' // purple-500
    case 'legendary':
      return '#f59e0b' // amber-500
    case 'mythic':
      return '#ef4444' // red-500
    default:
      return '#6b7280' // gray-500
  }
}

export function getRarityGradient(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 'from-gray-400 to-gray-600'
    case 'rare':
      return 'from-blue-400 to-blue-600'
    case 'epic':
      return 'from-purple-400 to-purple-600'
    case 'legendary':
      return 'from-amber-400 to-orange-600'
    case 'mythic':
      return 'from-red-400 to-pink-600'
    default:
      return 'from-gray-400 to-gray-600'
  }
}

export function playSound(soundName: string, volume: number = 0.5): void {
  if (typeof window !== 'undefined') {
    const audio = new Audio(`/sounds/${soundName}.mp3`)
    audio.volume = volume
    audio.play().catch(console.error)
  }
}

export function vibrate(pattern: number | number[] = 100): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
  }
  return Promise.resolve(false)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function calculateLevel(experience: number): number {
  // Simple level calculation: every 1000 XP = 1 level
  return Math.floor(experience / 1000) + 1
}

export function calculateExperienceToNextLevel(experience: number): number {
  const currentLevel = calculateLevel(experience)
  const nextLevelXP = currentLevel * 1000
  return nextLevelXP - experience
}

// Province/State-specific gambling age requirements (null = prohibited)
export const PROVINCE_AGE_REQUIREMENTS: Record<string, Record<string, number | null>> = {
  'Canada': {
    // Most provinces require 19
    'British Columbia': 19,
    'New Brunswick': 19,
    'Newfoundland and Labrador': 19,
    'Northwest Territories': 19,
    'Nova Scotia': 19,
    'Nunavut': 19,
    'Ontario': 19,
    'Prince Edward Island': 19,
    'Saskatchewan': 19,
    'Yukon': 19,
    // Provinces that allow 18
    'Alberta': 18,
    'Manitoba': 18,
    'Quebec': 18
  },
  'United States': {
    // ✅ LEGAL States (as of September 2025)
    // Most states allow sweepstakes casinos with 21+ age requirement
    'Alabama': 21,
    'Alaska': 21,
    'Arizona': 21,
    'Arkansas': 21,
    'California': 21,
    'Colorado': 21,
    'Delaware': 21,
    'Florida': 21,
    'Georgia': 21,
    'Hawaii': 21,
    'Illinois': 21,
    'Indiana': 21,
    'Iowa': 21,
    'Kansas': 21,
    'Louisiana': 21,
    'Maine': 21,
    'Maryland': 21,
    'Massachusetts': 21,
    'Minnesota': 21,
    'Mississippi': 21,
    'Missouri': 21,
    'Nebraska': 21,
    'New Hampshire': 21,
    'New Mexico': 21,
    'New York': 21,
    'North Carolina': 21,
    'North Dakota': 21,
    'Ohio': 21,
    'Oklahoma': 21,
    'Oregon': 21,
    'Pennsylvania': 21,
    'Rhode Island': 21,
    'South Carolina': 21,
    'South Dakota': 21,
    'Tennessee': 21,
    'Texas': 21,
    'Utah': 21,
    'Vermont': 21,
    'Virginia': 21,
    'West Virginia': 21,
    'Wisconsin': 21,

    // ❌ ILLEGAL/Restricted States (as of September 2025)
    'Connecticut': null,    // Banned by Senate Bill 1235 (2025)
    'Montana': null,        // Criminalized by Senate Bill 555 (October 2025)
    'Nevada': null,         // Illegal under gaming laws
    'New Jersey': null,     // Statewide ban (August 2025)
    'Washington': null,     // All sweepstakes prohibited

    // ⚠️ AMBIGUOUS States (unclear or evolving legal status)
    'Idaho': null,          // Cash prizes prohibited, only Gold Coins allowed
    'Kentucky': null,       // No clear legislation
    'Michigan': null,       // Previously allowed, now restricted
    'Wyoming': null         // Ambiguous legal status
  },
  'Australia': {
    // Australia has state-specific requirements
    'Australian Capital Territory': 18,
    'New South Wales': 18,
    'Northern Territory': 18,
    'Queensland': 18,
    'South Australia': 18,
    'Tasmania': 18,
    'Victoria': 18,
    'Western Australia': 18
  }
}

// Country-specific gambling age requirements (fallback when province not specified)
export const COUNTRY_AGE_REQUIREMENTS: Record<string, number> = {
  // North America
  'United States': 21,
  'Canada': 19,

  // Europe
  'United Kingdom': 18,
  'Germany': 18,
  'Austria': 18,
  'Switzerland': 18,
  'Netherlands': 18,
  'Belgium': 18,
  'Ireland': 18,
  'Denmark': 18,
  'Sweden': 18,
  'Norway': 18,
  'Finland': 18,

  // Asia
  'Japan': 20,
  'South Korea': 19,
  'Singapore': 21,

  // Oceania
  'Australia': 18,
  'New Zealand': 20,

  // Default for countries not listed
  'default': 18
}

export function getGamblingAgeRequirement(country: string, province?: string): number | null {
  // Check province-specific requirements first
  if (province && PROVINCE_AGE_REQUIREMENTS[country]?.[province] !== undefined) {
    return PROVINCE_AGE_REQUIREMENTS[country][province]
  }

  // Fallback to country-level requirement
  return COUNTRY_AGE_REQUIREMENTS[country] || COUNTRY_AGE_REQUIREMENTS.default
}

export function calculateAge(dateOfBirth: string | Date): number {
  if (!dateOfBirth) return 0

  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  // Handle future dates (invalid)
  if (birthDate > today) {
    return -1 // Invalid future date
  }

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function isLegalGamblingAge(dateOfBirth: string | Date, country?: string, province?: string): boolean {
  const age = calculateAge(dateOfBirth)

  // Invalid date (future date)
  if (age === -1) return false

  const minimumAge = getGamblingAgeRequirement(country || '', province)

  // If null, gambling is not allowed in this location
  if (minimumAge === null) return false

  return age >= minimumAge
}

export function getAgeVerificationErrorMessage(country?: string, province?: string): string {
  const minimumAge = getGamblingAgeRequirement(country || '', province)

  let locationName = ''
  if (province && country) {
    locationName = ` in ${province}, ${country}`
  } else if (country) {
    locationName = ` in ${country}`
  }

  // Handle prohibited locations
  if (minimumAge === null) {
    return `Sweepstakes casinos are not allowed${locationName}.`
  }

  return `You must be at least ${minimumAge} years old to gamble${locationName}.`
}

export function validateGamblingAge(dateOfBirth: string | Date, country?: string, province?: string): { isValid: boolean; errorMessage?: string; minimumAge: number | null } {
  const age = calculateAge(dateOfBirth)
  const minimumAge = getGamblingAgeRequirement(country || '', province)

  // Invalid date (future date)
  if (age === -1) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid date of birth.',
      minimumAge
    }
  }

  // Location is prohibited
  if (minimumAge === null) {
    return {
      isValid: false,
      errorMessage: getAgeVerificationErrorMessage(country, province),
      minimumAge: null
    }
  }

  const isValid = age >= minimumAge

  return {
    isValid,
    errorMessage: isValid ? undefined : getAgeVerificationErrorMessage(country, province),
    minimumAge
  }
}