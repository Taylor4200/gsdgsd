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
      // Get or create user profile first
      const { data: profile, error: profileError } = await supabase.rpc('get_or_create_user_profile', {
        p_user_id: userId,
        p_username: username
      })

      if (profileError) {
        console.error('Error getting user profile:', profileError)
        return null
      }

      // Insert message with NO role data (will be fetched from profile when displaying)
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          username,
          message,
          message_type: 'message',
          is_banned: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        return null
      }

      // Update message count in profile
      await supabase
        .from('user_profiles')
        .update({ total_messages: (profile.total_messages || 0) + 1 })
        .eq('user_id', userId)

      // Return message with current profile data
      return {
        ...data,
        level: profile.level || 1,
        is_vip: profile.is_vip || false,
        is_mod: profile.is_mod || false
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }

  // Get recent messages
  async getRecentMessages(limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('id, user_id, username, message, message_type, created_at, updated_at, is_banned')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching messages:', error)
        return []
      }

      // Get unique user IDs
      const userIds = Array.from(new Set(messages?.map(m => m.user_id) || []))
      
      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, level, is_vip, is_mod')
        .in('user_id', userIds)

      // Create profile map
      const profileMap = new Map()
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile)
      })

      // Enhance messages with profile data
      const enhancedMessages = messages?.map(message => {
        const profile = profileMap.get(message.user_id)
        return {
          ...message,
          level: profile?.level || 1,
          is_vip: profile?.is_vip || false,
          is_mod: profile?.is_mod || false
        }
      }) || []

      return enhancedMessages.reverse() // Reverse to show oldest first
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
      // Fetch real user stats from API
      const response = await fetch(`/api/user-stats?userId=${userId}`)
      
      if (!response.ok) {
        console.error('Error fetching user stats:', response.statusText)
        return null
      }
      
      const data = await response.json()
      return data.stats
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return null
    }
  }
}