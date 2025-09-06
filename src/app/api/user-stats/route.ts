import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = createClient()

    // Get user profile with stats
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        level,
        total_wagered,
        total_won,
        games_played,
        win_rate,
        vip_tier,
        is_online,
        last_active,
        created_at,
        total_messages,
        achievements_count
      `)
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent game sessions for additional stats
    const { data: gameSessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('bet_amount, win_amount, game_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (sessionsError) {
      console.error('Error fetching game sessions:', sessionsError)
    }

    // Calculate additional stats from game sessions
    const sessions = gameSessions || []
    const totalBets = sessions.length
    const totalWins = sessions.filter(s => s.win_amount > 0).length
    const totalLosses = sessions.filter(s => s.win_amount === 0).length
    const averageWager = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.bet_amount, 0) / sessions.length : 0
    const biggestWin = sessions.length > 0 ? Math.max(...sessions.map(s => s.win_amount)) : 0
    const biggestLoss = sessions.length > 0 ? Math.max(...sessions.map(s => s.bet_amount)) : 0
    
    // Calculate streaks
    let currentStreak = 0
    let longestWinStreak = 0
    let longestLossStreak = 0
    let tempWinStreak = 0
    let tempLossStreak = 0

    for (let i = sessions.length - 1; i >= 0; i--) {
      const session = sessions[i]
      if (session.win_amount > 0) {
        tempWinStreak++
        tempLossStreak = 0
        if (i === sessions.length - 1) currentStreak = tempWinStreak
      } else {
        tempLossStreak++
        tempWinStreak = 0
        if (i === sessions.length - 1) currentStreak = -tempLossStreak
      }
      longestWinStreak = Math.max(longestWinStreak, tempWinStreak)
      longestLossStreak = Math.max(longestLossStreak, tempLossStreak)
    }

    // Get favorite game
    const gameCounts = sessions.reduce((acc, session) => {
      acc[session.game_type] = (acc[session.game_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const favoriteGame = Object.keys(gameCounts).length > 0 
      ? Object.keys(gameCounts).reduce((a, b) => gameCounts[a] > gameCounts[b] ? a : b)
      : 'None'

    // Calculate account age
    const accountAge = profile.created_at 
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const userStats = {
      // Basic profile data
      username: profile.username,
      level: profile.level || 1,
      vipLevel: profile.vip_tier || 0,
      isOnline: profile.is_online || false,
      lastActive: profile.last_active || new Date(),
      
      // Wagering stats
      totalWagered: profile.total_wagered || 0,
      totalWon: profile.total_won || 0,
      totalBets: totalBets,
      totalWins: totalWins,
      totalLosses: totalLosses,
      winRate: profile.win_rate || (totalBets > 0 ? (totalWins / totalBets) * 100 : 0),
      
      // Additional stats
      averageWager: averageWager,
      biggestWin: biggestWin,
      biggestLoss: biggestLoss,
      currentStreak: currentStreak,
      longestWinStreak: longestWinStreak,
      longestLossStreak: longestLossStreak,
      favoriteGame: favoriteGame,
      accountAge: accountAge,
      
      // Social stats
      totalMessages: profile.total_messages || 0,
      achievementsCount: profile.achievements_count || 0,
      
      // Mock additional stats (for now)
      totalDeposits: Math.floor(Math.random() * 50000) + 5000,
      totalWithdrawals: Math.floor(Math.random() * 40000) + 4000,
      netProfit: (profile.total_won || 0) - (profile.total_wagered || 0),
    }

    return NextResponse.json({ stats: userStats })
  } catch (error) {
    console.error('Error in user stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
