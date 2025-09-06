// Game Session Integration Utility
// This utility handles recording game sessions and creating live feed events

interface WebSocketMessage {
  type: string
  data?: any
  message?: string
}

interface GameSessionData {
  user_id: string
  game_id: string
  game_name: string
  bet_amount: number
  win_amount: number
  result: 'win' | 'loss' | 'tie'
  multiplier: number
  session_data?: Record<string, any>
}

interface LiveFeedEvent {
  user_id: string
  username: string
  game_id: string
  game_name: string
  event_type: 'win' | 'big_win' | 'jackpot' | 'achievement'
  bet_amount: number
  win_amount: number
  multiplier: number
  is_featured: boolean
}

export class GameSessionManager {
  private static instance: GameSessionManager
  private usernameCache: Map<string, string> = new Map()
  private wsUrl: string

  constructor() {
    // Use environment variable or default to localhost
    this.wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws'
  }

  static getInstance(): GameSessionManager {
    if (!GameSessionManager.instance) {
      GameSessionManager.instance = new GameSessionManager()
    }
    return GameSessionManager.instance
  }

  // Broadcast WebSocket message to all connected clients
  private async broadcastWebSocket(message: WebSocketMessage): Promise<void> {
    try {
      // Send to WebSocket server via API endpoint
      await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Error broadcasting WebSocket message:', error)
    }
  }

  // Record a game session and create live feed events
  async recordGameSession(sessionData: GameSessionData): Promise<{
    sessionId: string
    ticketsEarned: number
    raffleId?: string
  }> {
    try {
      // Record the game session
      const sessionResponse = await fetch('/api/game-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to record game session')
      }

      const result = await sessionResponse.json()
      return result
    } catch (error) {
      console.error('Error recording game session:', error)
      throw error
    }
  }

  // Get username for a user ID (with caching)
  async getUsername(userId: string): Promise<string> {
    if (this.usernameCache.has(userId)) {
      return this.usernameCache.get(userId)!
    }

    try {
      const response = await fetch(`/api/user-profiles?user_id=${userId}`)
      const data = await response.json()
      
      if (data.username) {
        this.usernameCache.set(userId, data.username)
        return data.username
      }
      
      return 'Anonymous'
    } catch (error) {
      console.error('Error fetching username:', error)
      return 'Anonymous'
    }
  }

  // Create a live feed event for wins
  async createLiveFeedEvent(eventData: LiveFeedEvent): Promise<void> {
    try {
      // Check if user has ghost mode enabled
      const userProfile = await this.getUserProfile(eventData.user_id)
      if (userProfile?.isGhostMode) {
        // Still create the event but with hidden username
        eventData.username = 'Hidden'
      }

      const response = await fetch('/api/live-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        // Broadcast the new event via WebSocket
        await this.broadcastWebSocket({
          type: 'live_feed_event',
          data: eventData
        })
      }
    } catch (error) {
      console.error('Error creating live feed event:', error)
    }
  }

  // Get user profile for ghost mode check
  private async getUserProfile(userId: string): Promise<{ isGhostMode: boolean } | null> {
    try {
      const response = await fetch(`/api/user-profiles?user_id=${userId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Helper function to determine event type based on win amount and bet
  getEventType(betAmount: number, winAmount: number): 'win' | 'big_win' | 'jackpot' {
    const ratio = winAmount / betAmount
    
    if (ratio >= 100) return 'jackpot'
    if (ratio >= 10) return 'big_win'
    return 'win'
  }

  // Helper function to determine if event should be featured
  shouldFeatureEvent(betAmount: number, winAmount: number): boolean {
    const ratio = winAmount / betAmount
    return ratio >= 50 || winAmount >= 1000
  }

  // Main function to handle game completion
  async handleGameCompletion(
    userId: string,
    gameId: string,
    gameName: string,
    betAmount: number,
    winAmount: number,
    multiplier: number,
    sessionData?: Record<string, any>
  ): Promise<void> {
    try {
      const result = winAmount > 0 ? 'win' : 'loss'
      
      // Record the game session
      const sessionResult = await this.recordGameSession({
        user_id: userId,
        game_id: gameId,
        game_name: gameName,
        bet_amount: betAmount,
        win_amount: winAmount,
        result,
        multiplier,
        session_data: sessionData,
      })

      // Create live feed event for wins
      if (winAmount > 0) {
        const username = await this.getUsername(userId)
        const eventType = this.getEventType(betAmount, winAmount)
        const isFeatured = this.shouldFeatureEvent(betAmount, winAmount)

        await this.createLiveFeedEvent({
          user_id: userId,
          username,
          game_id: gameId,
          game_name: gameName,
          event_type: eventType,
          bet_amount: betAmount,
          win_amount: winAmount,
          multiplier,
          is_featured: isFeatured,
        })
      }

      console.log('Game session recorded successfully:', sessionResult)
    } catch (error) {
      console.error('Error handling game completion:', error)
    }
  }
}

// Export singleton instance
export const gameSessionManager = GameSessionManager.getInstance()

// Helper function for easy integration
export async function recordGameWin(
  userId: string,
  gameId: string,
  gameName: string,
  betAmount: number,
  winAmount: number,
  multiplier: number = 1,
  sessionData?: Record<string, any>
): Promise<void> {
  return gameSessionManager.handleGameCompletion(
    userId,
    gameId,
    gameName,
    betAmount,
    winAmount,
    multiplier,
    sessionData
  )
}

export async function recordGameLoss(
  userId: string,
  gameId: string,
  gameName: string,
  betAmount: number,
  multiplier: number = 1,
  sessionData?: Record<string, any>
): Promise<void> {
  return gameSessionManager.handleGameCompletion(
    userId,
    gameId,
    gameName,
    betAmount,
    0,
    multiplier,
    sessionData
  )
}
