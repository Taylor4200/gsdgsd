/**
 * Chat Presence API Routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

