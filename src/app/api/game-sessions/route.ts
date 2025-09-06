import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()
    
    const {
      user_id,
      game_id,
      game_name,
      bet_amount,
      win_amount,
      result,
      multiplier = 1.0,
      session_data = {}
    } = body

    // Validate required fields
    if (!user_id || !game_id || !game_name || !bet_amount || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert game session
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id,
        game_id,
        game_name,
        bet_amount,
        win_amount,
        result,
        multiplier,
        session_data
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating game session:', sessionError)
      return NextResponse.json({ error: 'Failed to create game session' }, { status: 500 })
    }

    // Get active raffle for ticket calculation
    const { data: activeRaffle } = await supabase
      .from('raffles')
      .select('id')
      .eq('status', 'active')
      .single()

    let ticketsEarned = 0
    if (activeRaffle) {
      // Calculate tickets earned
      const { data: ticketData, error: ticketError } = await supabase
        .rpc('update_raffle_participation', {
          p_user_id: user_id,
          p_raffle_id: activeRaffle.id,
          p_game_id: game_id,
          p_wager_amount: bet_amount
        })

      if (!ticketError && ticketData) {
        ticketsEarned = ticketData
      }

      // Record wager for raffle
      await supabase
        .from('user_wagers')
        .insert({
          user_id,
          game_id,
          amount: bet_amount,
          tickets_earned: ticketsEarned,
          raffle_id: activeRaffle.id
        })
    }

    // Create live feed event for wins
    if (result === 'win' && win_amount > 0) {
      const eventType = win_amount >= bet_amount * 10 ? 'big_win' : 'win'
      const isFeatured = win_amount >= bet_amount * 50 // Feature big wins

      // Get username from user_profiles
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', user_id)
        .single()

      if (userProfile) {
        await supabase
          .from('live_feed_events')
          .insert({
            user_id,
            username: userProfile.username,
            game_id,
            game_name,
            event_type: result,
            bet_amount,
            win_amount,
            multiplier,
            is_featured: isFeatured
          })
      }
    }

    return NextResponse.json({ 
      session: sessionData,
      ticketsEarned,
      raffleId: activeRaffle?.id
    })
  } catch (error) {
    console.error('Error in game session API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const gameId = searchParams.get('game_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('game_sessions')
      .select(`
        id,
        game_id,
        game_name,
        bet_amount,
        win_amount,
        result,
        multiplier,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (gameId) {
      query = query.eq('game_id', gameId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching game sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch game sessions' }, { status: 500 })
    }

    return NextResponse.json({ sessions: data || [] })
  } catch (error) {
    console.error('Error in game session GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
