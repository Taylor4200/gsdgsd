// Production-ready live feed API with caching and optimization
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Simple in-memory cache for production (consider Redis for scale)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 2000 // 2 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const userId = searchParams.get('user_id')
  const cacheKey = `live-feed_${limit}_${userId || 'all'}`

  try {
    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        events: cached.data,
        cached: true,
        timestamp: new Date(cached.timestamp).toISOString()
      })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('live_feed_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching live feed:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch events' })
    }

    // Cache the result
    cache.set(cacheKey, {
      data: events || [],
      timestamp: Date.now()
    })

    // Clean old cache entries
    if (cache.size > 100) {
      const now = Date.now()
      const entries = Array.from(cache.entries())
      for (const [key, value] of entries) {
        if (now - value.timestamp > CACHE_TTL * 2) {
          cache.delete(key)
        }
      }
    }

    return NextResponse.json({
      success: true,
      events: events || [],
      cached: false,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in live feed API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}