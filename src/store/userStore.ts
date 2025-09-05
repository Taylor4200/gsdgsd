import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Transaction, Achievement } from '@/types'
import { supabase } from '@/lib/supabase'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  transactions: Transaction[]
  achievements: Achievement[]
  showLiveSupport: boolean
  selectedCurrency: 'GC' | 'SC'
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  updateBalance: (amount: number, type: 'coins' | 'sweepstakes_coins') => void
  addTransaction: (transaction: Transaction) => void
  addAchievement: (achievement: Achievement) => void
  toggleGhostMode: () => void
  showLiveSupportWidget: () => void
  hideLiveSupportWidget: () => void
  setSelectedCurrency: (currency: 'GC' | 'SC') => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      transactions: [],
      achievements: [],
      showLiveSupport: false,
      selectedCurrency: 'SC',

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user 
        }),

      setLoading: (loading) => 
        set({ isLoading: loading }),

      updateBalance: (amount, type) => 
        set((state) => {
          if (!state.user) return state
          
          const updatedUser = {
            ...state.user,
            [type === 'coins' ? 'balance' : 'gcBalance']: 
              state.user[type === 'coins' ? 'balance' : 'gcBalance'] + amount
          }
          
          return { user: updatedUser }
        }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions].slice(0, 100) // Keep last 100
        })),

      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [achievement, ...state.achievements]
        })),

      toggleGhostMode: () =>
        set((state) => {
          if (!state.user) return state
          
          const updatedUser = {
            ...state.user,
            isGhostMode: !state.user.isGhostMode
          }
          
          return { user: updatedUser }
        }),

      showLiveSupportWidget: () =>
        set({ showLiveSupport: true }),

      hideLiveSupportWidget: () =>
        set({ showLiveSupport: false }),

      setSelectedCurrency: (currency) =>
        set({ selectedCurrency: currency }),

      logout: async () => {
        // Sign out from Supabase first
        try {
          const { error } = await supabase.auth.signOut()
          if (error) {
            console.error('Supabase logout error:', error)
          } else {
            console.log('Successfully signed out from Supabase')
          }
        } catch (err) {
          console.error('Error during Supabase logout:', err)
        }
        
        // Clear local state
        set({
          user: null,
          isAuthenticated: false,
          transactions: [],
          achievements: [],
          showLiveSupport: false,
          selectedCurrency: 'SC'
        })
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        achievements: state.achievements,
        showLiveSupport: state.showLiveSupport,
        selectedCurrency: state.selectedCurrency,
      }),
    }
  )
)
