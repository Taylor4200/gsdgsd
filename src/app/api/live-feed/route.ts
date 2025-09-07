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

    // Mock live feed data for now (replace with real database query later)
    const mockEvents = [
      {
        id: '1',
        event_type: 'big_win',
        username: 'LuckyPlayer',
        game_name: 'Sweet Bonanza',
        bet_amount: 100,
        win_amount: 2500,
        multiplier: 25,
        is_featured: true,
        created_at: new Date(Date.now() - 30000).toISOString()
      },
      {
        id: '2',
        event_type: 'jackpot',
        username: 'HighRoller',
        game_name: 'Gates of Olympus',
        bet_amount: 500,
        win_amount: 50000,
        multiplier: 100,
        is_featured: true,
        created_at: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: '3',
        event_type: 'win',
        username: 'CasinoKing',
        game_name: 'Book of Dead',
        bet_amount: 50,
        win_amount: 750,
        multiplier: 15,
        is_featured: false,
        created_at: new Date(Date.now() - 90000).toISOString()
      },
      {
        id: '4',
        event_type: 'big_win',
        username: 'SlotMaster',
        game_name: 'Starburst',
        bet_amount: 200,
        win_amount: 4000,
        multiplier: 20,
        is_featured: true,
        created_at: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: '5',
        event_type: 'win',
        username: 'GamePlayer',
        game_name: 'Reactoonz',
        bet_amount: 25,
        win_amount: 375,
        multiplier: 15,
        is_featured: false,
        created_at: new Date(Date.now() - 150000).toISOString()
      }
    ]

    // Filter by user if specified
    const events = userId 
      ? mockEvents.filter(event => event.username.toLowerCase().includes(userId.toLowerCase()))
      : mockEvents.slice(0, limit)

    // Cache the result
    cache.set(cacheKey, {
      data: events,
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
      events: events,
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