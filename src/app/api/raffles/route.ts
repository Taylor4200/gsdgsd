import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get all raffles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'

    // First check if raffles table exists by trying a simple query
    const { data: tableCheck, error: tableError } = await supabase
      .from('raffles')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Error checking raffles table:', tableError)
      // If table doesn't exist (42703) or any other error, return empty array
      if (tableError.code === '42703' || tableError.message?.includes('does not exist')) {
        console.log('📝 Raffles table does not exist yet, returning empty array')
        return NextResponse.json({ raffles: [] })
      }
      return NextResponse.json({ error: 'Failed to fetch raffles' }, { status: 500 })
    }

    // If table exists, proceed with full query
    let query = supabase
      .from('raffles')
      .select(`
        *,
        raffle_prizes(*),
        raffle_game_multipliers(*)
      `)
      .order('created_at', { ascending: false })

    // Add filtering if table exists and has is_active column
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data: raffles, error } = await query

    if (error) {
      console.error('❌ Error fetching raffles:', error)
      // If column doesn't exist, return empty array
      if (error.code === '42703' || error.message?.includes('does not exist')) {
        console.log('📝 Raffles table missing columns, returning empty array')
        return NextResponse.json({ raffles: [] })
      }
      return NextResponse.json({ error: 'Failed to fetch raffles' }, { status: 500 })
    }

    // Map database fields to frontend expected fields
    const mappedRaffles = raffles?.map(raffle => ({
      ...raffle,
      title: raffle.name || raffle.title, // Map name -> title (fallback to title)
      end_date: raffle.end_time || raffle.end_date, // Map end_time -> end_date (fallback to end_date)
      status: raffle.is_active ? 'active' : 'inactive', // Map is_active -> status
      // Keep total_prize_pool as is (database field matches frontend expectation)
      total_prize_pool: raffle.total_prize_pool,
      tickets_sold: raffle.tickets_sold,
      max_tickets: raffle.max_tickets
    })) || []

    console.log('✅ Raffles fetched:', mappedRaffles?.length || 0)
    console.log('📊 Sample raffle data:', mappedRaffles?.[0] ? {
      id: mappedRaffles[0].id,
      title: mappedRaffles[0].title,
      total_prize_pool: mappedRaffles[0].total_prize_pool,
      tickets_sold: mappedRaffles[0].tickets_sold,
      max_tickets: mappedRaffles[0].max_tickets,
      raffle_prizes: mappedRaffles[0].raffle_prizes?.length || 0,
      raw_data: mappedRaffles[0] // Show all fields to debug
    } : 'No raffles')
    return NextResponse.json({ raffles: mappedRaffles })
  } catch (error) {
    console.error('❌ Error in raffles GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new raffle (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      total_prize, 
      start_date, 
      end_date, 
      prizes, 
      game_multipliers 
    } = body

    // Validate required fields
    if (!title || !total_prize || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create raffle
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .insert({
        title,
        description,
        total_prize: parseFloat(total_prize),
        start_date: new Date(start_date).toISOString(),
        end_date: new Date(end_date).toISOString(),
        status: 'draft'
      })
      .select()
      .single()

    if (raffleError) {
      console.error('❌ Error creating raffle:', raffleError)
      return NextResponse.json({ error: 'Failed to create raffle' }, { status: 500 })
    }

    // Create prizes
    if (prizes && prizes.length > 0) {
      const prizeData = prizes.map((prize: any) => ({
        raffle_id: raffle.id,
        place: prize.place,
        amount: parseFloat(prize.amount),
        percentage: parseFloat(prize.percentage)
      }))

      const { error: prizesError } = await supabase
        .from('raffle_prizes')
        .insert(prizeData)

      if (prizesError) {
        console.error('❌ Error creating prizes:', prizesError)
        return NextResponse.json({ error: 'Failed to create prizes' }, { status: 500 })
      }
    }

    // Create game multipliers
    if (game_multipliers && game_multipliers.length > 0) {
      const multiplierData = game_multipliers.map((multiplier: any) => ({
        raffle_id: raffle.id,
        game_id: multiplier.game_id,
        game_name: multiplier.game_name,
        multiplier: parseFloat(multiplier.multiplier),
        wager_requirement: parseFloat(multiplier.wager_requirement),
        tickets_per_wager: parseInt(multiplier.tickets_per_wager)
      }))

      const { error: multipliersError } = await supabase
        .from('raffle_game_multipliers')
        .insert(multiplierData)

      if (multipliersError) {
        console.error('❌ Error creating game multipliers:', multipliersError)
        return NextResponse.json({ error: 'Failed to create game multipliers' }, { status: 500 })
      }
    }

    console.log('✅ Raffle created successfully:', raffle.id)
    return NextResponse.json({ raffle })
  } catch (error) {
    console.error('❌ Error in raffles POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update raffle (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      raffle_id, 
      title, 
      description, 
      total_prize, 
      start_date, 
      end_date, 
      status,
      prizes,
      game_multipliers
    } = body

    if (!raffle_id) {
      return NextResponse.json({ error: 'Missing raffle_id' }, { status: 400 })
    }

    // Update raffle
    const updateData: any = {}
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (total_prize) updateData.total_prize = parseFloat(total_prize)
    if (start_date) updateData.start_date = new Date(start_date).toISOString()
    if (end_date) updateData.end_date = new Date(end_date).toISOString()
    if (status) updateData.status = status

    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .update(updateData)
      .eq('id', raffle_id)
      .select()
      .single()

    if (raffleError) {
      console.error('❌ Error updating raffle:', raffleError)
      return NextResponse.json({ error: 'Failed to update raffle' }, { status: 500 })
    }

    // Update prizes if provided
    if (prizes) {
      // Delete existing prizes
      await supabase
        .from('raffle_prizes')
        .delete()
        .eq('raffle_id', raffle_id)

      // Insert new prizes
      if (prizes.length > 0) {
        const prizeData = prizes.map((prize: any) => ({
          raffle_id: raffle_id,
          place: prize.place,
          amount: parseFloat(prize.amount),
          percentage: parseFloat(prize.percentage)
        }))

        const { error: prizesError } = await supabase
          .from('raffle_prizes')
          .insert(prizeData)

        if (prizesError) {
          console.error('❌ Error updating prizes:', prizesError)
          return NextResponse.json({ error: 'Failed to update prizes' }, { status: 500 })
        }
      }
    }

    // Update game multipliers if provided
    if (game_multipliers) {
      // Delete existing multipliers
      await supabase
        .from('raffle_game_multipliers')
        .delete()
        .eq('raffle_id', raffle_id)

      // Insert new multipliers
      if (game_multipliers.length > 0) {
        const multiplierData = game_multipliers.map((multiplier: any) => ({
          raffle_id: raffle_id,
          game_id: multiplier.game_id,
          game_name: multiplier.game_name,
          multiplier: parseFloat(multiplier.multiplier),
          wager_requirement: parseFloat(multiplier.wager_requirement),
          tickets_per_wager: parseInt(multiplier.tickets_per_wager)
        }))

        const { error: multipliersError } = await supabase
          .from('raffle_game_multipliers')
          .insert(multiplierData)

        if (multipliersError) {
          console.error('❌ Error updating game multipliers:', multipliersError)
          return NextResponse.json({ error: 'Failed to update game multipliers' }, { status: 500 })
        }
      }
    }

    console.log('✅ Raffle updated successfully:', raffle_id)
    return NextResponse.json({ raffle })
  } catch (error) {
    console.error('❌ Error in raffles PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete raffle (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { raffle_id } = body

    if (!raffle_id) {
      return NextResponse.json({ error: 'Missing raffle_id' }, { status: 400 })
    }

    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', raffle_id)

    if (error) {
      console.error('❌ Error deleting raffle:', error)
      return NextResponse.json({ error: 'Failed to delete raffle' }, { status: 500 })
    }

    console.log('✅ Raffle deleted successfully:', raffle_id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error in raffles DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}