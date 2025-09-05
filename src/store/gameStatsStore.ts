import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GameStats {
  totalWagered: number
  totalProfit: number
  wins: number
  losses: number
  winRate: number
  biggestWin: number
  biggestLoss: number
  averageBet: number
  totalBets: number
  sessionStartTime: number
  lastGameTime: number
}

export interface RollHistory {
  result: number
  won: boolean
  target: number
  direction: 'under' | 'over'
  betAmount: number
  payout: number
  timestamp: Date
  gameType: string
}

interface GameStatsStore {
  // Global stats
  globalStats: GameStats
  rollHistory: RollHistory[]
  
  // Actions
  addRoll: (roll: RollHistory) => void
  resetStats: () => void
  getStatsForGame: (gameType: string) => GameStats
  getSessionTime: () => number
}

const initialStats: GameStats = {
  totalWagered: 0,
  totalProfit: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  biggestWin: 0,
  biggestLoss: 0,
  averageBet: 0,
  totalBets: 0,
  sessionStartTime: Date.now(),
  lastGameTime: Date.now()
}

export const useGameStatsStore = create<GameStatsStore>()(
  persist(
    (set, get) => ({
      globalStats: initialStats,
      rollHistory: [],

      addRoll: (roll: RollHistory) => {
        set((state) => {
          const newRollHistory = [roll, ...state.rollHistory.slice(0, 999)] // Keep last 1000 rolls
          
          // Calculate new stats
          const allRolls = newRollHistory
          const totalWagered = allRolls.reduce((sum, r) => sum + r.betAmount, 0)
          const totalProfit = allRolls.reduce((sum, r) => sum + (r.won ? r.payout - r.betAmount : -r.betAmount), 0)
          const wins = allRolls.filter(r => r.won).length
          const losses = allRolls.filter(r => !r.won).length
          const winRate = totalWagered > 0 ? (wins / (wins + losses)) * 100 : 0
          const biggestWin = Math.max(...allRolls.map(r => r.won ? r.payout - r.betAmount : 0), 0)
          const biggestLoss = Math.max(...allRolls.map(r => !r.won ? r.betAmount : 0), 0)
          const averageBet = totalWagered / allRolls.length || 0
          const totalBets = allRolls.length

          const newStats: GameStats = {
            totalWagered,
            totalProfit,
            wins,
            losses,
            winRate,
            biggestWin,
            biggestLoss,
            averageBet,
            totalBets,
            sessionStartTime: state.globalStats.sessionStartTime,
            lastGameTime: Date.now()
          }

          return {
            globalStats: newStats,
            rollHistory: newRollHistory
          }
        })
      },

      resetStats: () => {
        set({
          globalStats: {
            ...initialStats,
            sessionStartTime: Date.now()
          },
          rollHistory: []
        })
      },

      getStatsForGame: (gameType: string) => {
        const state = get()
        const gameRolls = state.rollHistory.filter(r => r.gameType === gameType)
        
        if (gameRolls.length === 0) {
          return {
            ...initialStats,
            sessionStartTime: state.globalStats.sessionStartTime
          }
        }

        const totalWagered = gameRolls.reduce((sum, r) => sum + r.betAmount, 0)
        const totalProfit = gameRolls.reduce((sum, r) => sum + (r.won ? r.payout - r.betAmount : -r.betAmount), 0)
        const wins = gameRolls.filter(r => r.won).length
        const losses = gameRolls.filter(r => !r.won).length
        const winRate = totalWagered > 0 ? (wins / (wins + losses)) * 100 : 0
        const biggestWin = Math.max(...gameRolls.map(r => r.won ? r.payout - r.betAmount : 0), 0)
        const biggestLoss = Math.max(...gameRolls.map(r => !r.won ? r.betAmount : 0), 0)
        const averageBet = totalWagered / gameRolls.length || 0
        const totalBets = gameRolls.length

        return {
          totalWagered,
          totalProfit,
          wins,
          losses,
          winRate,
          biggestWin,
          biggestLoss,
          averageBet,
          totalBets,
          sessionStartTime: state.globalStats.sessionStartTime,
          lastGameTime: state.globalStats.lastGameTime
        }
      },

      getSessionTime: () => {
        const state = get()
        return Math.floor((Date.now() - state.globalStats.sessionStartTime) / (1000 * 60)) // minutes
      }
    }),
    {
      name: 'game-stats-storage',
      partialize: (state) => ({
        globalStats: state.globalStats,
        rollHistory: state.rollHistory
      })
    }
  )
)
