import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get specific raffle by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raffleId = searchParams.get('id')

    if (!raffleId) {
      return NextResponse.json({ error: 'Missing raffle ID' }, { status: 400 })
    }

    const { data: raffle, error } = await supabase
      .from('raffles')
      .select(`
        *,
        raffle_prizes(*),
        raffle_game_multipliers(*)
      `)
      .eq('id', raffleId)
      .single()

    if (error) {
      console.error('❌ Error fetching raffle:', error)
      return NextResponse.json({ error: 'Failed to fetch raffle' }, { status: 500 })
    }

    return NextResponse.json({ raffle })
  } catch (error) {
    console.error('❌ Error in raffle GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get user's tickets for a raffle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { raffle_id, user_id } = body

    if (!raffle_id || !user_id) {
      return NextResponse.json({ error: 'Missing raffle_id or user_id' }, { status: 400 })
    }

    const { data: tickets, error } = await supabase
      .from('raffle_tickets')
      .select('*')
      .eq('raffle_id', raffle_id)
      .eq('user_id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error fetching user tickets:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    return NextResponse.json({ 
      tickets: tickets || { 
        raffle_id, 
        user_id, 
        tickets_earned: 0, 
        total_wagered: 0 
      } 
    })
  } catch (error) {
    console.error('❌ Error in raffle POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
