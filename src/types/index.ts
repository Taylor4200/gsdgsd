// User types
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  walletAddress?: string
  balance: number // SC (Sweeps Coins) balance
  gcBalance: number // GC (Gold Coins) balance
  sweepstakesCoins: number // Legacy field, keeping for compatibility
  level: number
  experience: number
  totalWagered: number
  totalWon: number
  joinedAt: Date
  lastActive: Date
  achievements: Achievement[]
  referralCode: string
  referredBy?: string
  isGhostMode: boolean
  role?: 'user' | 'admin' | 'moderator'
  country?: string // Country for compliance and skill testing
  state?: string // State/Province for compliance
  dateOfBirth?: string // Date of birth for age verification
  emailConfirmed?: boolean // Whether user has confirmed their email
}

// Game types
export interface Game {
  id: string
  name: string
  type: GameType
  category: string
  description: string
  thumbnail: string
  minBet: number
  maxBet: number
  rtp: number
  jackpot?: number
  isActive: boolean
  popularity: number
  recentWins: RecentWin[]
}

export enum GameType {
  SLOTS = 'slots',
  DICE = 'dice',
  CRASH = 'crash',
  ROULETTE = 'roulette',
  PACK_DRAW = 'pack_draw',
  BLACKJACK = 'blackjack',
  BACCARAT = 'baccarat',
  PLINKO = 'plinko'
}

// Pack Draw / Loot Box types
export interface PackDraw {
  id: string
  name: string
  description: string
  price: number
  thumbnail: string
  rarity: PackRarity
  items: PackItem[]
  openAnimation: string
  isLimited?: boolean
  expiresAt?: Date
}

export enum PackRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface PackItem {
  id: string
  name: string
  type: ItemType
  value: number
  rarity: PackRarity
  image: string
  description: string
  probability: number
}

export enum ItemType {
  COINS = 'coins',
  SWEEPSTAKES_COINS = 'sweepstakes_coins',
  BONUS_MULTIPLIER = 'bonus_multiplier',
  FREE_SPINS = 'free_spins',
  AVATAR = 'avatar',
  BADGE = 'badge',
  TITLE = 'title'
}

// Transaction types
export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  currency: 'coins' | 'sweepstakes_coins'
  status: TransactionStatus
  gameId?: string
  packDrawId?: string
  description: string
  timestamp: Date
  balanceAfter: number
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET = 'bet',
  WIN = 'win',
  PACK_PURCHASE = 'pack_purchase',
  BONUS = 'bonus',
  REFERRAL = 'referral'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Social types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: PackRarity
  unlockedAt: Date
  progress?: number
  maxProgress?: number
}

export interface LeaderboardEntry {
  rank: number
  user: Pick<User, 'id' | 'username' | 'avatar' | 'level'>
  value: number
  change: number
}

export interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar?: string
  message: string
  timestamp: Date
  type: 'message' | 'win' | 'system'
  gameId?: string
  winAmount?: number
}

export interface RecentWin {
  id: string
  userId: string
  username: string
  avatar?: string
  gameId: string
  gameName: string
  amount: number
  multiplier?: number
  timestamp: Date
}

// Real-time events
export interface SocketEvent {
  type: SocketEventType
  data: any
  timestamp: Date
}

export enum SocketEventType {
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  CHAT_MESSAGE = 'chat_message',
  GAME_WIN = 'game_win',
  JACKPOT_UPDATE = 'jackpot_update',
  PACK_OPENED = 'pack_opened',
  LEADERBOARD_UPDATE = 'leaderboard_update'
}

// Game state types
export interface GameSession {
  id: string
  userId: string
  gameId: string
  betAmount: number
  startTime: Date
  endTime?: Date
  result?: GameResult
  status: 'active' | 'completed' | 'cancelled'
}

export interface GameResult {
  outcome: 'win' | 'loss'
  payout: number
  multiplier?: number
  details: Record<string, any>
}

// UI State types
export interface UIState {
  isLoading: boolean
  activeGame?: string
  showChat: boolean
  showNotifications: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
