# Pusher WebSocket Setup

This project now uses Pusher for real-time WebSocket functionality instead of a local WebSocket server.

## Setup Instructions

### 1. Create a Pusher Account
1. Go to [pusher.com](https://pusher.com/)
2. Sign up for a free account
3. Create a new app

### 2. Get Your Pusher Credentials
From your Pusher dashboard, get these values:
- **App ID**
- **Key** (public key)
- **Secret** (private key)
- **Cluster** (e.g., `us2`, `eu`, `ap-southeast-1`)

### 3. Set Environment Variables
Add these to your `.env.local` file:

```env
# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster_here
PUSHER_APP_ID=your_pusher_app_id_here
PUSHER_SECRET=your_pusher_secret_here
```

### 4. Vercel Environment Variables
For production deployment on Vercel, add the same environment variables in your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all 4 Pusher variables

## Features

### Real-time Chat
- Messages are broadcast via Pusher channels
- Presence updates for online users
- Private messaging notifications

### Live Feed
- Real-time bet results
- High roller notifications
- Game session updates

### Channels Used
- `chat` - Chat messages and presence
- `live-feed` - Live betting events
- `game-sessions` - Game session updates

## API Endpoints

### Chat
- `POST /api/chat-pusher` - Send messages
- `GET /api/chat-pusher` - Get recent messages

### Live Feed
- `POST /api/live-feed-pusher` - Create live feed events
- `GET /api/live-feed-pusher` - Get recent events

## Migration from WebSocket

The following components have been updated to use Pusher:
- `ChatSidebar.tsx` - Now uses `useChatWebSocket`
- `StakeLiveFeed.tsx` - Now uses `useLiveFeedWebSocket`
- `gameSessionManager.ts` - Can be updated to use Pusher

## Benefits

1. **Production Ready** - No need to run a separate WebSocket server
2. **Scalable** - Pusher handles scaling automatically
3. **Reliable** - Built-in reconnection and error handling
4. **Global** - Works worldwide with low latency
5. **Free Tier** - Generous free tier for development and small apps
