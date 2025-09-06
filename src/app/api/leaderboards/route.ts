import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily'
    const metric = searchParams.get('metric') || 'total_wagered'
    const gameType = searchParams.get('gameType')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query
    let query = supabase
      .from('leaderboards')
      .select(`
        *,
        user_profile:user_profiles!leaderboards_user_id_fkey(*)
      `)
      .eq('period', period)
      .eq('metric', metric)
      .order('value', { ascending: false })
      .limit(limit)

    if (gameType) {
      query = query.eq('game_type', gameType)
    }

    const { data: entries, error: entriesError } = await query

    if (entriesError) {
      console.error('Error fetching leaderboard entries:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch leaderboard entries' }, { status: 500 })
    }

    // Update ranks
    const rankedEntries = entries?.map((entry, index) => ({
      ...entry,
      rank: index + 1
    })) || []

    return NextResponse.json({
      entries: rankedEntries,
      total_participants: rankedEntries.length
    })

  } catch (error) {
    console.error('Error in leaderboards GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, period, metric, value, gameType } = body

    if (!userId || !period || !metric || value === undefined) {
      return NextResponse.json({ error: 'User ID, period, metric, and value are required' }, { status: 400 })
    }

    // Update or create leaderboard entry
    const { data: entry, error: entryError } = await supabase
      .from('leaderboards')
      .upsert({
        user_id: userId,
        period: period,
        game_type: gameType || null,
        metric: metric,
        value: value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (entryError) {
      console.error('Error updating leaderboard entry:', entryError)
      return NextResponse.json({ error: 'Failed to update leaderboard entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: entry
    })

  } catch (error) {
    console.error('Error in leaderboards POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { period, metric, gameType } = body

    if (!period || !metric) {
      return NextResponse.json({ error: 'Period and metric are required' }, { status: 400 })
    }

    // Recalculate ranks for the specified period and metric
    const { data: entries, error: entriesError } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('period', period)
      .eq('metric', metric)
      .order('value', { ascending: false })

    if (entriesError) {
      console.error('Error fetching entries for rank calculation:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }

    // Update ranks
    const updates = entries?.map((entry, index) => ({
      id: entry.id,
      rank: index + 1
    })) || []

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('leaderboards')
        .upsert(updates)

      if (updateError) {
        console.error('Error updating ranks:', updateError)
        return NextResponse.json({ error: 'Failed to update ranks' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ranks for ${period} ${metric} leaderboard`,
      updated_count: updates.length
    })

  } catch (error) {
    console.error('Error in leaderboards PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
