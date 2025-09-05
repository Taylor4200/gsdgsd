import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UIState {
  // Modal states
  showAuthModal: boolean
  showSignupModal: boolean
  showLoginModal: boolean
  showWalletModal: boolean
  showPackDrawModal: boolean
  showSettingsModal: boolean
  showLiveStatsModal: boolean
  showMyBetsModal: boolean
  showBetHistoryScroll: boolean
  
  // UI preferences
  soundEnabled: boolean
  animationsEnabled: boolean
  showChat: boolean
  showNotifications: boolean
  theme: 'dark' | 'neon'
  
  // Loading states
  isConnectingWallet: boolean
  isOpeningPack: boolean
  
  // Notifications
  notifications: Notification[]
  
  // Actions
  setAuthModal: (show: boolean) => void
  setSignupModal: (show: boolean) => void
  setLoginModal: (show: boolean) => void
  setWalletModal: (show: boolean) => void
  setPackDrawModal: (show: boolean) => void
  setSettingsModal: (show: boolean) => void
  setLiveStatsModal: (show: boolean) => void
  setMyBetsModal: (show: boolean) => void
  setBetHistoryScroll: (show: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setAnimationsEnabled: (enabled: boolean) => void
  setShowChat: (show: boolean) => void
  setShowNotifications: (show: boolean) => void
  setTheme: (theme: 'dark' | 'neon') => void
  setConnectingWallet: (connecting: boolean) => void
  setOpeningPack: (opening: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: Date
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Modal states
      showAuthModal: false,
      showSignupModal: false,
      showLoginModal: false,
      showWalletModal: false,
      showPackDrawModal: false,
      showSettingsModal: false,
      showLiveStatsModal: false,
      showMyBetsModal: false,
      showBetHistoryScroll: false,
      
      // UI preferences
      soundEnabled: true,
      animationsEnabled: true,
      showChat: true,
      showNotifications: true,
      theme: 'dark',
      
      // Loading states
      isConnectingWallet: false,
      isOpeningPack: false,
      
      // Notifications
      notifications: [],

      // Actions
      setAuthModal: (show) => set({ showAuthModal: show }),
      setSignupModal: (show) => set({ showSignupModal: show }),
      setLoginModal: (show) => set({ showLoginModal: show }),
      setWalletModal: (show) => set({ showWalletModal: show }),
      setPackDrawModal: (show) => set({ showPackDrawModal: show }),
      setSettingsModal: (show) => set({ showSettingsModal: show }),
      setLiveStatsModal: (show) => set({ showLiveStatsModal: show }),
      setMyBetsModal: (show) => set({ showMyBetsModal: show }),
      setBetHistoryScroll: (show) => set({ showBetHistoryScroll: show }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      setShowChat: (show) => set({ showChat: show }),
      setShowNotifications: (show) => set({ showNotifications: show }),
      setTheme: (theme) => set({ theme }),
      setConnectingWallet: (connecting) => set({ isConnectingWallet: connecting }),
      setOpeningPack: (opening) => set({ isOpeningPack: opening }),

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2)
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          duration: notification.duration || 5000,
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 10)
        }))
        
        // Auto remove notification after duration
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        animationsEnabled: state.animationsEnabled,
        showChat: state.showChat,
        showNotifications: state.showNotifications,
        theme: state.theme,
      }),
    }
  )
)
