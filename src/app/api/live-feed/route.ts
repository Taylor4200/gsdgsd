import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const featured = searchParams.get('featured') === 'true'

    let query = supabase
      .from('live_feed_events')
      .select(`
        id,
        username,
        game_name,
        event_type,
        bet_amount,
        win_amount,
        multiplier,
        is_featured,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (featured) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching live feed events:', error)
      return NextResponse.json({ error: 'Failed to fetch live feed events' }, { status: 500 })
    }

    return NextResponse.json({ events: data || [] })
  } catch (error) {
    console.error('Error in live feed API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()
    
    const {
      user_id,
      username,
      game_id,
      game_name,
      event_type,
      bet_amount,
      win_amount,
      multiplier = 1.0,
      is_featured = false
    } = body

    // Validate required fields
    if (!user_id || !username || !game_id || !game_name || !event_type || !bet_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert live feed event
    const { data, error } = await supabase
      .from('live_feed_events')
      .insert({
        user_id,
        username,
        game_id,
        game_name,
        event_type,
        bet_amount,
        win_amount,
        multiplier,
        is_featured
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating live feed event:', error)
      return NextResponse.json({ error: 'Failed to create live feed event' }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error) {
    console.error('Error in live feed POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
