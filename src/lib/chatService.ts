/**
 * Chat Service
 * 
 * Handles chat functionality using Supabase with polling fallback
 */

import { supabase } from '@/lib/supabase'

export interface ChatMessage {
  id: string
  user_id: string
  username: string
  message: string
  message_type: 'message' | 'system' | 'announcement'
  level: number
  is_vip: boolean
  is_mod: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface ChatPresence {
  id: string
  user_id: string
  username: string
  last_seen: string
  is_online: boolean
  created_at: string
}

export class ChatService {
  private static instance: ChatService
  private realtimeChannel: any = null
  private pollingInterval: NodeJS.Timeout | null = null
  private useRealtime: boolean = true

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  // Send a message
  async sendMessage(message: string, username: string, userId: string): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          username,
          message,
          message_type: 'message',
          level: 1,
          is_vip: false,
          is_mod: false,
          is_banned: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }

  // Get recent messages
  async getRecentMessages(limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching messages:', error)
        return []
      }

      return data.reverse() // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  // Get online users count
  async getOnlineUsersCount(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_online_users_count')

      if (error) {
        console.error('Error getting online users count:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error getting online users count:', error)
      return 0
    }
  }

  // Update user presence
  async updatePresence(userId: string, username: string): Promise<void> {
    try {
      await supabase
        .rpc('update_user_presence', {
          p_user_id: userId,
          p_username: username
        })
    } catch (error) {
      console.error('Error updating presence:', error)
    }
  }

  // Mark user as offline
  async markOffline(userId: string): Promise<void> {
    try {
      await supabase
        .rpc('mark_user_offline', {
          p_user_id: userId
        })
    } catch (error) {
      console.error('Error marking offline:', error)
    }
  }

  // Subscribe to new messages (with fallback to polling)
  subscribeToMessages(onMessage: (message: ChatMessage) => void): void {
    // Try real-time first
    if (this.useRealtime) {
      try {
        this.realtimeChannel = supabase
          .channel('chat-messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
          }, (payload) => {
            onMessage(payload.new as ChatMessage)
          })
          .subscribe()

        // If real-time fails, fall back to polling
        this.realtimeChannel.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time chat subscription active')
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.log('⚠️ Real-time failed, falling back to polling')
            this.useRealtime = false
            this.startPolling(onMessage)
          }
        })
      } catch (error) {
        console.log('⚠️ Real-time not available, using polling')
        this.useRealtime = false
        this.startPolling(onMessage)
      }
    } else {
      this.startPolling(onMessage)
    }
  }

  // Fallback polling method
  private startPolling(onMessage: (message: ChatMessage) => void): void {
    if (this.pollingInterval) return

    let lastMessageId: string | null = null

    this.pollingInterval = setInterval(async () => {
      try {
        const messages = await this.getRecentMessages(1)
        if (messages.length > 0 && messages[0].id !== lastMessageId) {
          lastMessageId = messages[0].id
          onMessage(messages[0])
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000) // Poll every 2 seconds
  }

  // Unsubscribe from messages
  unsubscribeFromMessages(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel)
      this.realtimeChannel = null
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  // Check if user is banned
  async isUserBanned(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('chat_bans')
        .select('id')
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking ban status:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error checking ban status:', error)
      return false
    }
  }

  // Admin functions
  async getUserMessageHistory(userId: string, limit: number = 100): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching user message history:', error)
        return []
      }

      return data.reverse() // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching user message history:', error)
      return []
    }
  }

  async banUser(userId: string, bannedBy: string, reason?: string, expiresAt?: Date): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_bans')
        .insert({
          user_id: userId,
          banned_by: bannedBy,
          reason: reason || 'Chat violation',
          expires_at: expiresAt?.toISOString() || null
        })

      if (error) {
        console.error('Error banning user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error banning user:', error)
      return false
    }
  }

  async unbanUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_bans')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error unbanning user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error unbanning user:', error)
      return false
    }
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        console.error('Error deleting message:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting message:', error)
      return false
    }
  }

  async getBanHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('chat_bans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ban history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching ban history:', error)
      return []
    }
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      // Get chat messages
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('created_at, message_type')
        .eq('user_id', userId)

      if (messagesError) {
        console.error('Error fetching user stats:', messagesError)
        return null
      }

      const totalMessages = messages.length
      const firstMessage = messages.length > 0 ? new Date(Math.min(...messages.map(m => new Date(m.created_at).getTime()))) : null
      const lastMessage = messages.length > 0 ? new Date(Math.max(...messages.map(m => new Date(m.created_at).getTime()))) : null

      // Mock gaming statistics (in a real app, these would come from your gaming database)
      const mockGamingStats = {
        totalWagered: Math.floor(Math.random() * 100000) + 10000, // $10k - $110k
        totalBets: Math.floor(Math.random() * 50000) + 5000, // 5k - 55k bets
        totalWins: Math.floor(Math.random() * 20000) + 2000, // 2k - 22k wins
        totalLosses: Math.floor(Math.random() * 30000) + 3000, // 3k - 33k losses
        averageWager: Math.floor(Math.random() * 50) + 5, // $5 - $55
        biggestWin: Math.floor(Math.random() * 5000) + 500, // $500 - $5.5k
        biggestLoss: Math.floor(Math.random() * 2000) + 200, // $200 - $2.2k
        winRate: Math.floor(Math.random() * 40) + 30, // 30% - 70%
        totalTipped: Math.floor(Math.random() * 1000) + 100, // $100 - $1.1k
        currentStreak: Math.floor(Math.random() * 20) - 10, // -10 to +10
        longestWinStreak: Math.floor(Math.random() * 50) + 5, // 5 - 55
        longestLossStreak: Math.floor(Math.random() * 30) + 3, // 3 - 33
        favoriteGame: ['Limbo', 'Dice', 'Mines', 'Blackjack', 'Baccarat', 'Crash'][Math.floor(Math.random() * 6)],
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
        accountAge: Math.floor(Math.random() * 365) + 30, // 30 - 395 days
        vipLevel: Math.floor(Math.random() * 5), // 0 - 4
        totalDeposits: Math.floor(Math.random() * 50000) + 5000, // $5k - $55k
        totalWithdrawals: Math.floor(Math.random() * 40000) + 4000, // $4k - $44k
        netProfit: Math.floor(Math.random() * 20000) - 10000, // -$10k to +$10k
      }

      return {
        // Chat stats
        totalMessages,
        firstMessage,
        lastMessage,
        messageTypes: messages.reduce((acc, msg) => {
          acc[msg.message_type] = (acc[msg.message_type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        
        // Gaming stats
        ...mockGamingStats
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return null
    }
  }
}