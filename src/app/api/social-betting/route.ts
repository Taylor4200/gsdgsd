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

    // Get active social betting sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('social_betting_sessions')
      .select(`
        *,
        user_profile:user_profiles!social_betting_sessions_user_id_fkey(*),
        watcher_profile:user_profiles!social_betting_sessions_watcher_id_fkey(*),
        game_session:game_sessions!social_betting_sessions_game_session_id_fkey(*)
      `)
      .eq('watcher_id', userId)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching social betting sessions:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch social betting sessions' }, { status: 500 })
    }

    // Get friends currently playing (mock data for now)
    const { data: friends, error: friendsError } = await supabase
      .from('user_friends')
      .select(`
        *,
        friend_profile:user_profiles!user_friends_friend_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')

    if (friendsError) {
      console.error('Error fetching friends:', friendsError)
    }

    const friendsPlaying = friends?.filter(friend => 
      friend.friend_profile?.is_online
    ) || []

    return NextResponse.json({
      active_sessions: sessions || [],
      friends_playing: friendsPlaying,
      total_watchers: sessions?.length || 0
    })

  } catch (error) {
    console.error('Error in social-betting GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, gameSessionId, watcherId } = body

    if (!userId || !gameSessionId || !watcherId) {
      return NextResponse.json({ error: 'User ID, game session ID, and watcher ID are required' }, { status: 400 })
    }

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('social_betting_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('watcher_id', watcherId)
      .eq('game_session_id', gameSessionId)
      .single()

    if (existingSession) {
      return NextResponse.json({ error: 'Already watching this session' }, { status: 400 })
    }

    // Create social betting session
    const { data: session, error: sessionError } = await supabase
      .from('social_betting_sessions')
      .insert({
        user_id: userId,
        watcher_id: watcherId,
        game_session_id: gameSessionId
      })
      .select(`
        *,
        user_profile:user_profiles!social_betting_sessions_user_id_fkey(*),
        watcher_profile:user_profiles!social_betting_sessions_watcher_id_fkey(*),
        game_session:game_sessions!social_betting_sessions_game_session_id_fkey(*)
      `)
      .single()

    if (sessionError) {
      console.error('Error creating social betting session:', sessionError)
      return NextResponse.json({ error: 'Failed to create social betting session' }, { status: 500 })
    }

    // Broadcast social betting start via WebSocket
    await chatWebSocketManager.broadcastSocialBettingStart({
      type: 'social_betting_start',
      data: {
        id: session.id,
        user_id: userId,
        watcher_id: watcherId,
        game_session_id: gameSessionId,
        created_at: session.created_at,
        user_profile: session.user_profile,
        watcher_profile: session.watcher_profile,
        game_session: session.game_session
      }
    })

    return NextResponse.json({
      success: true,
      session: session
    })

  } catch (error) {
    console.error('Error in social-betting POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get session before deleting
    const { data: session, error: sessionError } = await supabase
      .from('social_betting_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error('Error fetching session:', sessionError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Delete social betting session
    const { error: deleteError } = await supabase
      .from('social_betting_sessions')
      .delete()
      .eq('id', sessionId)

    if (deleteError) {
      console.error('Error deleting social betting session:', deleteError)
      return NextResponse.json({ error: 'Failed to delete social betting session' }, { status: 500 })
    }

    // Broadcast social betting end via WebSocket
    await chatWebSocketManager.broadcastSocialBettingEnd({
      type: 'social_betting_end',
      data: {
        id: session.id,
        user_id: session.user_id,
        watcher_id: session.watcher_id,
        game_session_id: session.game_session_id,
        ended_at: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Social betting session ended'
    })

  } catch (error) {
    console.error('Error in social-betting DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
