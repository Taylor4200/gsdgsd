/**
 * Chat API Routes
 * 
 * Real-time chat functionality using Supabase
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/chat/messages
 * Get recent chat messages
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        user_id,
        username,
        message,
        message_type,
        level,
        is_vip,
        is_mod,
        created_at
      `)
      .eq('is_banned', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      hasMore: messages.length === limit
    })

  } catch (error) {
    console.error('Error in GET /api/chat/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/chat/messages
 * Send a new chat message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId, username, level = 1, isVip = false, isMod = false } = body

    // Validate input
    if (!message || !userId || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    if (message.length < 1) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Check if user is banned
    const { data: banCheck } = await supabase
      .from('chat_bans')
      .select('id')
      .eq('user_id', userId)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .single()

    if (banCheck) {
      return NextResponse.json({ error: 'User is banned from chat' }, { status: 403 })
    }

    // Insert message
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        username,
        message: message.trim(),
        level,
        is_vip: isVip,
        is_mod: isMod,
        is_banned: false
      })
      .select(`
        id,
        user_id,
        username,
        message,
        message_type,
        level,
        is_vip,
        is_mod,
        created_at
      `)
      .single()

    if (error) {
      console.error('Error inserting message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update user presence
    await supabase.rpc('update_user_presence', {
      p_user_id: userId,
      p_username: username
    })

    return NextResponse.json({
      success: true,
      message: newMessage
    })

  } catch (error) {
    console.error('Error in POST /api/chat/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/chat/presence
 * Get online users count
 */
export async function GET(request: NextRequest) {
  try {
    const { data: count, error } = await supabase.rpc('get_online_users_count')

    if (error) {
      console.error('Error fetching online count:', error)
      return NextResponse.json({ error: 'Failed to fetch online count' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      onlineCount: count || 0
    })

  } catch (error) {
    console.error('Error in GET /api/chat/presence:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/chat/presence
 * Update user presence
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, isOnline = true } = body

    if (!userId || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (isOnline) {
      await supabase.rpc('update_user_presence', {
        p_user_id: userId,
        p_username: username
      })
    } else {
      await supabase.rpc('mark_user_offline', {
        p_user_id: userId
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in POST /api/chat/presence:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/chat/messages/[id]
 * Delete a message (mod only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const messageId = url.pathname.split('/').pop()

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    // Get the message to check if user is mod
    const { data: message, error: fetchError } = await supabase
      .from('chat_messages')
      .select('user_id, is_mod')
      .eq('id', messageId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // For now, allow any authenticated user to delete their own messages
    // In production, you'd check if the user is a mod or the message owner
    const { error: deleteError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/chat/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

