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
    const includeEnded = searchParams.get('includeEnded') === 'true'

    let query = supabase
      .from('raffles')
      .select(`
        *,
        raffle_prizes(*),
        raffle_game_multipliers(*)
      `)
      .order('created_at', { ascending: false })

    if (!includeEnded) {
      query = query.neq('status', 'ended')
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: raffles, error } = await query

    if (error) {
      console.error('❌ Error fetching raffles:', error)
      return NextResponse.json({ error: 'Failed to fetch raffles' }, { status: 500 })
    }

    return NextResponse.json({ raffles })
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
