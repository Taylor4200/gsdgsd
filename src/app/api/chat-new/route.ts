import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: Fetch messages or online users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'online-count') {
      // Get online users count
      const { data: count, error } = await supabase.rpc('get_online_users_count')
      
      if (error) {
        console.error('Error getting online count:', error)
        return NextResponse.json({ error: 'Failed to get online count' }, { status: 500 })
      }

      return NextResponse.json({ count: count || 0 })
    }

    // Default: Get chat messages
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
        created_at
      `)
      .eq('is_banned', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Get user profiles for all message senders to get current roles
    const userIds = [...new Set(messages?.map(m => m.user_id) || [])]
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, is_mod, is_vip, level')
      .in('user_id', userIds)

    // Create a map of user profiles
    const profileMap = new Map()
    profiles?.forEach(profile => {
      profileMap.set(profile.user_id, profile)
    })

    // Enhance messages with current user profile data
    const enhancedMessages = messages?.map(message => {
      const profile = profileMap.get(message.user_id)
      return {
        ...message,
        level: profile?.level || 1,
        is_vip: profile?.is_vip || false,
        is_mod: profile?.is_mod || false
      }
    }) || []

    return NextResponse.json({
      success: true,
      messages: enhancedMessages.reverse(), // Reverse to show oldest first
      hasMore: messages?.length === limit
    })

  } catch (error) {
    console.error('Error in GET /api/chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Send message or update presence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'update-presence') {
      // Update user presence
      const { userId, username, isOnline = true } = body

      if (!userId || !username) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Ensure user profile exists
      await supabase.rpc('get_or_create_user_profile', {
        p_user_id: userId,
        p_username: username
      })

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
    }

    // Default: Send message
    const { message, userId, username } = body

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

    // Ensure user profile exists and get current profile data
    const { data: profile, error: profileError } = await supabase.rpc('get_or_create_user_profile', {
      p_user_id: userId,
      p_username: username
    })

    if (profileError) {
      console.error('Error getting user profile:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
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

    // Insert message (simplified - no role data stored here)
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        username,
        message: message.trim(),
        is_banned: false
      })
      .select(`
        id,
        user_id,
        username,
        message,
        message_type,
        created_at
      `)
      .single()

    if (error) {
      console.error('Error inserting message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update message count in user profile
    await supabase
      .from('user_profiles')
      .update({ total_messages: (profile.total_messages || 0) + 1 })
      .eq('user_id', userId)

    // Update user presence
    await supabase.rpc('update_user_presence', {
      p_user_id: userId,
      p_username: username
    })

    // Return message with current profile data
    const enhancedMessage = {
      ...newMessage,
      level: profile.level || 1,
      is_vip: profile.is_vip || false,
      is_mod: profile.is_mod || false
    }

    return NextResponse.json({
      success: true,
      message: enhancedMessage
    })

  } catch (error) {
    console.error('Error in POST /api/chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
