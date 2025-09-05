import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, GameSession, RecentWin, PackDraw } from '@/types'

interface GameState {
  games: Game[]
  activeGame: Game | null
  gameSession: GameSession | null
  recentWins: RecentWin[]
  packDraws: PackDraw[]
  jackpots: Record<string, number>
  isLoading: boolean
  
  // Actions
  setGames: (games: Game[]) => void
  setActiveGame: (game: Game | null) => void
  setGameSession: (session: GameSession | null) => void
  addRecentWin: (win: RecentWin) => void
  setPackDraws: (packDraws: PackDraw[]) => void
  updateJackpot: (gameId: string, amount: number) => void
  setLoading: (loading: boolean) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  activeGame: null,
  gameSession: null,
  recentWins: [],
  packDraws: [],
  jackpots: {},
  isLoading: false,

  setGames: (games) => set({ games }),

  setActiveGame: (game) => set({ activeGame: game }),

  setGameSession: (session) => set({ gameSession: session }),

  addRecentWin: (win) =>
    set((state) => ({
      recentWins: [win, ...state.recentWins].slice(0, 50) // Keep last 50 wins
    })),

  setPackDraws: (packDraws) => set({ packDraws }),

  updateJackpot: (gameId, amount) =>
    set((state) => ({
      jackpots: {
        ...state.jackpots,
        [gameId]: amount
      }
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}))

interface GlobalNonceState {
  globalNonce: number
  serverSeed: string
  clientSeed: string
  hashedServerSeed: string
  incrementNonce: () => void
  setServerSeed: (seed: string) => void
  setClientSeed: (seed: string) => void
  setHashedServerSeed: (hash: string) => void
  resetSession: () => void
}

export const useGlobalNonceStore = create<GlobalNonceState>()(
  persist(
    (set, get) => ({
      globalNonce: 0,
      serverSeed: '',
      clientSeed: '',
      hashedServerSeed: '',
      
      incrementNonce: () => {
        set((state) => ({ globalNonce: state.globalNonce + 1 }))
      },
      
      setServerSeed: (seed: string) => {
        set({ serverSeed: seed })
      },
      
      setClientSeed: (seed: string) => {
        set({ clientSeed: seed })
      },
      
      setHashedServerSeed: (hash: string) => {
        set({ hashedServerSeed: hash })
      },
      
      resetSession: () => {
        set({ 
          globalNonce: 0,
          serverSeed: '',
          clientSeed: '',
          hashedServerSeed: ''
        })
      }
    }),
    {
      name: 'global-nonce-storage',
      partialize: (state) => ({
        globalNonce: state.globalNonce,
        serverSeed: state.serverSeed,
        clientSeed: state.clientSeed,
        hashedServerSeed: state.hashedServerSeed
      })
    }
  )
)
