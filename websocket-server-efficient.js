// Shared WebSocket server for instant chat - only 1 connection needed!
import { WebSocketServer } from 'ws'
import { createClient } from '@/lib/supabase'

const wss = new WebSocketServer({ port: 3001 })
const clients = new Map<string, any>()
let messageId = 0

console.log('🚀 Shared WebSocket server running on port 3001')

wss.on('connection', (ws, req) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  clients.set(clientId, { ws, userId: null, username: null })
  
  console.log(`📱 New client connected: ${clientId} (Total: ${clients.size})`)

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'auth':
          // User authentication
          const client = clients.get(clientId)
          if (client) {
            client.userId = message.userId
            client.username = message.username
            clients.set(clientId, client)
            
            // Broadcast user joined
            broadcast({
              type: 'user_joined',
              userId: message.userId,
              username: message.username,
              timestamp: new Date().toISOString()
            }, clientId)
          }
          break

        case 'chat_message':
          // Handle chat message
          const chatClient = clients.get(clientId)
          if (chatClient && chatClient.userId) {
            const chatMessage = {
              id: `msg_${++messageId}`,
              user_id: chatClient.userId,
              username: chatClient.username,
              message: message.content,
              message_type: message.messageType || 'message',
              created_at: new Date().toISOString()
            }

            // Save to database
            await saveChatMessage(chatMessage)

            // Broadcast to all clients
            broadcast({
              type: 'chat_message',
              data: chatMessage
            }, clientId)
          }
          break

        case 'ping':
          // Heartbeat
          ws.send(JSON.stringify({ type: 'pong' }))
          break
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })

  ws.on('close', () => {
    const client = clients.get(clientId)
    if (client && client.userId) {
      // Broadcast user left
      broadcast({
        type: 'user_left',
        userId: client.userId,
        username: client.username,
        timestamp: new Date().toISOString()
      }, clientId)
    }
    
    clients.delete(clientId)
    console.log(`📱 Client disconnected: ${clientId} (Total: ${clients.size})`)
  })

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error)
    clients.delete(clientId)
  })
})

// Broadcast message to all connected clients
function broadcast(message: any, excludeClientId?: string) {
  const messageStr = JSON.stringify(message)
  let sentCount = 0

  clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId && client.ws.readyState === 1) {
      try {
        client.ws.send(messageStr)
        sentCount++
      } catch (error) {
        console.error(`Error sending to ${clientId}:`, error)
        clients.delete(clientId)
      }
    }
  })

  console.log(`📡 Broadcasted to ${sentCount} clients`)
}

// Save chat message to database
async function saveChatMessage(message: any) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('chat_messages')
      .insert([message])

    if (error) {
      console.error('Error saving chat message:', error)
    }
  } catch (error) {
    console.error('Database error:', error)
  }
}

// Keep server alive
process.on('SIGINT', () => {
  console.log('🛑 Shutting down WebSocket server...')
  wss.close()
  process.exit(0)
})
