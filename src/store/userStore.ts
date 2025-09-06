import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Transaction, Achievement } from '@/types'
import { 
  Friend, 
  FriendRequest, 
  PrivateMessage, 
  Conversation, 
  UserAchievement, 
  LeaderboardEntry, 
  SocialBettingSession, 
  SocialNotification,
  SocialStats 
} from '@/types/social'
import { supabase } from '@/lib/supabase'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  transactions: Transaction[]
  achievements: Achievement[]
  showLiveSupport: boolean
  selectedCurrency: 'GC' | 'SC'
  
  // Social features state
  friends: Friend[]
  friendRequests: FriendRequest[]
  privateMessages: PrivateMessage[]
  conversations: Conversation[]
  unreadMessages: number
  socialAchievements: UserAchievement[]
  leaderboards: LeaderboardEntry[]
  socialBettingSessions: SocialBettingSession[]
  socialNotifications: SocialNotification[]
  socialStats: SocialStats | null
  
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
  
  // Social actions
  addFriend: (username: string) => Promise<{ success: boolean; message: string }>
  acceptFriendRequest: (friendId: string) => Promise<{ success: boolean; message: string }>
  blockUser: (userId: string) => Promise<{ success: boolean; message: string }>
  removeFriend: (friendId: string) => Promise<{ success: boolean; message: string }>
  sendPrivateMessage: (recipientId: string, content: string) => Promise<{ success: boolean; message: string }>
  markMessageAsRead: (messageId: string) => Promise<void>
  markConversationAsRead: (conversationId: string) => Promise<void>
  unlockAchievement: (achievementId: string) => Promise<void>
  updateLeaderboard: (period: string, metric: string, value: number) => Promise<void>
  startSocialBetting: (userId: string, gameSessionId: string) => Promise<void>
  endSocialBetting: (sessionId: string) => Promise<void>
  addSocialNotification: (notification: SocialNotification) => void
  markNotificationAsRead: (notificationId: string) => void
  clearAllNotifications: () => void
  refreshSocialData: () => Promise<void>
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

      // Social features state
      friends: [],
      friendRequests: [],
      privateMessages: [],
      conversations: [],
      unreadMessages: 0,
      socialAchievements: [],
      leaderboards: [],
      socialBettingSessions: [],
      socialNotifications: [],
      socialStats: null,

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

      // Social actions
      addFriend: async (username: string) => {
        try {
          const response = await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', username })
          })
          const result = await response.json()
          
          if (result.success) {
            // Refresh friends data
            await get().refreshSocialData()
          }
          
          return result
        } catch (error) {
          console.error('Error adding friend:', error)
          return { success: false, message: 'Failed to add friend' }
        }
      },

      acceptFriendRequest: async (friendId: string) => {
        try {
          const response = await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'accept', friendId })
          })
          const result = await response.json()
          
          if (result.success) {
            await get().refreshSocialData()
          }
          
          return result
        } catch (error) {
          console.error('Error accepting friend request:', error)
          return { success: false, message: 'Failed to accept friend request' }
        }
      },

      blockUser: async (userId: string) => {
        try {
          const response = await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'block', userId })
          })
          const result = await response.json()
          
          if (result.success) {
            await get().refreshSocialData()
          }
          
          return result
        } catch (error) {
          console.error('Error blocking user:', error)
          return { success: false, message: 'Failed to block user' }
        }
      },

      removeFriend: async (friendId: string) => {
        try {
          const response = await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'remove', friendId })
          })
          const result = await response.json()
          
          if (result.success) {
            await get().refreshSocialData()
          }
          
          return result
        } catch (error) {
          console.error('Error removing friend:', error)
          return { success: false, message: 'Failed to remove friend' }
        }
      },

      sendPrivateMessage: async (recipientId: string, content: string) => {
        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientId, content })
          })
          const result = await response.json()
          
          if (result.success) {
            // Add message to local state
            set((state) => ({
              privateMessages: [result.message, ...state.privateMessages]
            }))
          }
          
          return result
        } catch (error) {
          console.error('Error sending message:', error)
          return { success: false, message: 'Failed to send message' }
        }
      },

      markMessageAsRead: async (messageId: string) => {
        try {
          await fetch('/api/messages/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId })
          })
          
          // Update local state
          set((state) => ({
            privateMessages: state.privateMessages.map(msg =>
              msg.id === messageId ? { ...msg, is_read: true, read_at: new Date() } : msg
            )
          }))
        } catch (error) {
          console.error('Error marking message as read:', error)
        }
      },

      markConversationAsRead: async (conversationId: string) => {
        try {
          await fetch('/api/messages/conversation/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId })
          })
          
          // Update local state
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
            ),
            unreadMessages: Math.max(0, state.unreadMessages - 1)
          }))
        } catch (error) {
          console.error('Error marking conversation as read:', error)
        }
      },

      unlockAchievement: async (achievementId: string) => {
        try {
          const response = await fetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ achievementId })
          })
          const result = await response.json()
          
          if (result.success) {
            // Add achievement to local state
            set((state) => ({
              socialAchievements: [result.achievement, ...state.socialAchievements]
            }))
            
            // Add notification
            get().addSocialNotification({
              id: Date.now().toString(),
              type: 'achievement_unlocked',
              title: 'Achievement Unlocked!',
              message: `You unlocked: ${result.achievement.achievement_name}`,
              data: result.achievement,
              is_read: false,
              created_at: new Date()
            })
          }
        } catch (error) {
          console.error('Error unlocking achievement:', error)
        }
      },

      updateLeaderboard: async (period: string, metric: string, value: number) => {
        try {
          await fetch('/api/leaderboards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ period, metric, value })
          })
        } catch (error) {
          console.error('Error updating leaderboard:', error)
        }
      },

      startSocialBetting: async (userId: string, gameSessionId: string) => {
        try {
          const response = await fetch('/api/social-betting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, gameSessionId })
          })
          const result = await response.json()
          
          if (result.success) {
            set((state) => ({
              socialBettingSessions: [result.session, ...state.socialBettingSessions]
            }))
          }
        } catch (error) {
          console.error('Error starting social betting:', error)
        }
      },

      endSocialBetting: async (sessionId: string) => {
        try {
          await fetch('/api/social-betting/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          })
          
          // Remove from local state
          set((state) => ({
            socialBettingSessions: state.socialBettingSessions.filter(s => s.id !== sessionId)
          }))
        } catch (error) {
          console.error('Error ending social betting:', error)
        }
      },

      addSocialNotification: (notification: SocialNotification) => {
        set((state) => ({
          socialNotifications: [notification, ...state.socialNotifications].slice(0, 50) // Keep last 50
        }))
      },

      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          socialNotifications: state.socialNotifications.map(notif =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        }))
      },

      clearAllNotifications: () => {
        set({ socialNotifications: [] })
      },

      refreshSocialData: async () => {
        try {
          const [friendsRes, messagesRes, achievementsRes, leaderboardsRes] = await Promise.all([
            fetch('/api/friends'),
            fetch('/api/messages'),
            fetch('/api/achievements'),
            fetch('/api/leaderboards')
          ])
          
          const [friendsData, messagesData, achievementsData, leaderboardsData] = await Promise.all([
            friendsRes.json(),
            messagesRes.json(),
            achievementsRes.json(),
            leaderboardsRes.json()
          ])
          
          set({
            friends: friendsData.friends || [],
            friendRequests: friendsData.friend_requests || [],
            privateMessages: messagesData.messages || [],
            conversations: messagesData.conversations || [],
            unreadMessages: messagesData.unread_count || 0,
            socialAchievements: achievementsData.achievements || [],
            leaderboards: leaderboardsData.entries || []
          })
        } catch (error) {
          console.error('Error refreshing social data:', error)
        }
      },

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
          selectedCurrency: 'SC',
          // Clear social data
          friends: [],
          friendRequests: [],
          privateMessages: [],
          conversations: [],
          unreadMessages: 0,
          socialAchievements: [],
          leaderboards: [],
          socialBettingSessions: [],
          socialNotifications: [],
          socialStats: null
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
        // Persist social data
        friends: state.friends,
        socialAchievements: state.socialAchievements,
        socialStats: state.socialStats
      }),
    }
  )
)
