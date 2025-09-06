import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  try {
    const { 
      user_id, 
      username, 
      game_id, 
      game_name, 
      bet_amount, 
      win_amount, 
      multiplier, 
      result 
    } = await request.json()
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Insert live feed event
    const { data: eventData, error } = await supabase
      .from('live_feed_events')
      .insert({
        user_id,
        username,
        game_id,
        game_name,
        bet_amount,
        win_amount,
        multiplier,
        result,
        event_type: 'bet_result'
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting live feed event:', error)
      return NextResponse.json({ error: 'Failed to create live feed event' }, { status: 500 })
    }

    // Broadcast event via Pusher
    await pusherServer.trigger(CHANNELS.LIVE_FEED, EVENTS.LIVE_FEED_EVENT, {
      id: eventData.id,
      user_id,
      username,
      game_id,
      game_name,
      bet_amount,
      win_amount,
      multiplier,
      result,
      created_at: eventData.created_at,
      is_featured: bet_amount >= 100 // High roller threshold
    })

    return NextResponse.json({ success: true, event: eventData })
  } catch (error) {
    console.error('Live feed API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('user_id')
    const featured = searchParams.get('featured')
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    let query = supabase
      .from('live_feed_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (featured === 'true') {
      query = query.gte('bet_amount', 100) // High roller threshold
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching live feed events:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error('Live feed API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
