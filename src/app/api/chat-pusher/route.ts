import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  try {
    const { action, userId, username, message, messageType = 'message' } = await request.json()
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (action === 'send_message') {
      // Insert message into database
      const { data: messageData, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          username: username,
          message: message,
          message_type: messageType
        })
        .select()
        .single()

      if (error) {
        console.error('Error inserting message:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
      }

      // Broadcast message via Pusher
      await pusherServer.trigger(CHANNELS.CHAT, EVENTS.CHAT_MESSAGE, messageData)

      return NextResponse.json({ success: true, message: messageData })
    }

    if (action === 'update-presence') {
      // Update user presence
      await pusherServer.trigger(CHANNELS.CHAT, EVENTS.CHAT_PRESENCE, {
        userId,
        username,
        action: 'join'
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (action === 'online-count') {
      // Get online count (simplified - in production you'd track this properly)
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes

      return NextResponse.json({ count: count || 0 })
    }

    // Get recent messages
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages?.reverse() || [] })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
