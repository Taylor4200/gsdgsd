import Pusher from 'pusher-js'

// Initialize Pusher client
export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy-key', 
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  }
)

// Pusher server instance for API routes
import PusherServer from 'pusher'

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || 'dummy-app-id',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy-key',
  secret: process.env.PUSHER_SECRET || 'dummy-secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
})

// Channel names
export const CHANNELS = {
  CHAT: 'chat',
  LIVE_FEED: 'live-feed',
  GAME_SESSIONS: 'game-sessions',
} as const

// Event types
export const EVENTS = {
  CHAT_MESSAGE: 'chat-message',
  CHAT_PRESENCE: 'chat-presence',
  LIVE_FEED_EVENT: 'live-feed-event',
  GAME_SESSION: 'game-session',
} as const
