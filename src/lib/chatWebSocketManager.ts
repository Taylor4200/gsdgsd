// Chat WebSocket Integration
// This utility handles real-time chat messaging via WebSocket

interface ChatMessage {
  id: string
  user_id: string
  username: string
  message: string
  level: number
  is_vip: boolean
  is_mod: boolean
  created_at: string
}

interface WebSocketMessage {
  type: string
  data?: any
  message?: string
}

export class ChatWebSocketManager {
  private static instance: ChatWebSocketManager

  static getInstance(): ChatWebSocketManager {
    if (!ChatWebSocketManager.instance) {
      ChatWebSocketManager.instance = new ChatWebSocketManager()
    }
    return ChatWebSocketManager.instance
  }

  // Broadcast chat message via WebSocket
  async broadcastChatMessage(messageData: ChatMessage): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat_message',
          data: messageData
        }),
      })
    } catch (error) {
      console.error('Error broadcasting chat message:', error)
    }
  }

  // Broadcast user presence update
  async broadcastPresenceUpdate(userData: {
    user_id: string
    username: string
    isOnline: boolean
  }): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'presence_update',
          data: userData
        }),
      })
    } catch (error) {
      console.error('Error broadcasting presence update:', error)
    }
  }

  // Broadcast online count update
  async broadcastOnlineCount(count: number): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'online_count_update',
          data: { count }
        }),
      })
    } catch (error) {
      console.error('Error broadcasting online count:', error)
    }
  }

  // Social features broadcasting
  async broadcastFriendRequest(friendRequest: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'friend_request',
          data: friendRequest
        }),
      })
    } catch (error) {
      console.error('Error broadcasting friend request:', error)
    }
  }

  async broadcastFriendAccept(friendAccept: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'friend_accept',
          data: friendAccept
        }),
      })
    } catch (error) {
      console.error('Error broadcasting friend accept:', error)
    }
  }

  async broadcastUserBlock(userBlock: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user_block',
          data: userBlock
        }),
      })
    } catch (error) {
      console.error('Error broadcasting user block:', error)
    }
  }

  async broadcastPrivateMessage(message: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'private_message',
          data: message
        }),
      })
    } catch (error) {
      console.error('Error broadcasting private message:', error)
    }
  }

  async broadcastAchievementUnlock(achievement: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'achievement_unlock',
          data: achievement
        }),
      })
    } catch (error) {
      console.error('Error broadcasting achievement unlock:', error)
    }
  }

  async broadcastSocialBettingStart(session: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'social_betting_start',
          data: session
        }),
      })
    } catch (error) {
      console.error('Error broadcasting social betting start:', error)
    }
  }

  async broadcastSocialBettingEnd(session: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'social_betting_end',
          data: session
        }),
      })
    } catch (error) {
      console.error('Error broadcasting social betting end:', error)
    }
  }

  async broadcastLeaderboardUpdate(leaderboard: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'leaderboard_update',
          data: leaderboard
        }),
      })
    } catch (error) {
      console.error('Error broadcasting leaderboard update:', error)
    }
  }

  async broadcastUserOnline(user: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user_online',
          data: user
        }),
      })
    } catch (error) {
      console.error('Error broadcasting user online:', error)
    }
  }

  async broadcastUserOffline(user: any): Promise<void> {
    try {
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user_offline',
          data: user
        }),
      })
    } catch (error) {
      console.error('Error broadcasting user offline:', error)
    }
  }
}

// Export singleton instance
export const chatWebSocketManager = ChatWebSocketManager.getInstance()
