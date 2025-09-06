import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { chatWebSocketManager } from '@/lib/chatWebSocketManager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's private messages
    const { data: messages, error: messagesError } = await supabase
      .from('private_messages')
      .select(`
        *,
        sender_profile:user_profiles!private_messages_sender_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Get conversations
    const { data: conversations, error: conversationsError } = await supabase
      .rpc('get_user_conversations', { user_id: userId })

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Count unread messages
    const { count: unreadCount, error: unreadError } = await supabase
      .from('private_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    if (unreadError) {
      console.error('Error counting unread messages:', unreadError)
    }

    return NextResponse.json({
      messages: messages || [],
      conversations: conversations || [],
      unread_count: unreadCount || 0
    })

  } catch (error) {
    console.error('Error in messages GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientId, content, userId } = body

    if (!recipientId || !content || !userId) {
      return NextResponse.json({ error: 'Recipient ID, content, and user ID are required' }, { status: 400 })
    }

    // Create private message
    const { data: message, error: messageError } = await supabase
      .from('private_messages')
      .insert({
        sender_id: userId,
        recipient_id: recipientId,
        content: content.trim(),
        is_read: false
      })
      .select(`
        *,
        sender_profile:user_profiles!private_messages_sender_id_fkey(*)
      `)
      .single()

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Broadcast message via WebSocket
    await chatWebSocketManager.broadcastPrivateMessage({
      type: 'private_message',
      data: {
        id: message.id,
        sender_id: message.sender_id,
        recipient_id: message.recipient_id,
        content: message.content,
        is_read: message.is_read,
        created_at: message.created_at,
        sender_profile: message.sender_profile
      }
    })

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('Error in messages POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, isRead } = body

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (isRead !== undefined) {
      updateData.is_read = isRead
      if (isRead) {
        updateData.read_at = new Date().toISOString()
      }
    }

    const { data: message, error: messageError } = await supabase
      .from('private_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single()

    if (messageError) {
      console.error('Error updating message:', messageError)
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('Error in messages PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
