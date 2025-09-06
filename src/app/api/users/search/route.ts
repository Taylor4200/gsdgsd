import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const supabase = createClient()

    // Search users by username (case insensitive)
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        level,
        is_online,
        total_wagered,
        games_played,
        vip_tier,
        last_active
      `)
      .ilike('username', `%${query}%`)
      .order('is_online', { ascending: false }) // Online users first
      .order('total_wagered', { ascending: false }) // Then by wagered amount
      .limit(limit)

    if (error) {
      console.error('Error searching users:', error)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error in user search API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
