// Efficient polling API with smart caching
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Simple in-memory cache (in production, use Redis)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 2000 // 2 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const lastUpdate = searchParams.get('lastUpdate')
  const cacheKey = `realtime_${type}_${lastUpdate || 'latest'}`

  try {
    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        timestamp: new Date(cached.timestamp).toISOString()
      })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let data: any = {}

    // Get latest chat messages (only if not using WebSocket)
    if (type === 'all' || type === 'chat') {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      data.chat = messages || []
    }

    // Get latest live feed events
    if (type === 'all' || type === 'live-feed') {
      const { data: events } = await supabase
        .from('live_feed_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      data.liveFeed = events || []
    }

    // Get game updates
    if (type === 'all' || type === 'games') {
      const { data: games } = await supabase
        .from('game_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50)
      
      data.games = games || []
    }

    // Get raffle updates
    if (type === 'all' || type === 'raffles') {
      const { data: raffles } = await supabase
        .from('raffles')
        .select(`
          *,
          raffle_prizes (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5)
      
      data.raffles = raffles || []
    }

    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    // Clean old cache entries
    if (cache.size > 100) {
      const now = Date.now()
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL * 2) {
          cache.delete(key)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching real-time data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}