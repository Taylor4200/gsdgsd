import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

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
        achievements_count,
        is_vip,
        is_mod,
        is_admin
      `)
      .eq('user_id', userId)
      .single()

    let userProfile = profile
    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      
      // If user doesn't exist in user_profiles, try to create them
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      if (authUser?.user) {
        // Create user profile with default stats
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            username: authUser.user.email?.split('@')[0] || 'User',
            level: 1,
            total_wagered: 0,
            total_won: 0,
            games_played: 0,
            win_rate: 0,
            vip_tier: 0,
            is_online: true,
            last_active: new Date().toISOString(),
            is_vip: false,
            is_mod: false,
            is_admin: false
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        userProfile = newProfile
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
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
    const accountAge = userProfile.created_at 
      ? Math.floor((Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    const userStats = {
      // Basic profile data
      username: userProfile.username,
      level: userProfile.level || 1,
      vipLevel: userProfile.vip_tier || 0,
      isOnline: userProfile.is_online || false,
      lastActive: userProfile.last_active || new Date(),
      
      // Wagering stats
      totalWagered: userProfile.total_wagered || 0,
      totalWon: userProfile.total_won || 0,
      totalBets: totalBets,
      totalWins: totalWins,
      totalLosses: totalLosses,
      winRate: userProfile.win_rate || (totalBets > 0 ? (totalWins / totalBets) * 100 : 0),
      
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
      totalMessages: userProfile.total_messages || 0,
      achievementsCount: userProfile.achievements_count || 0,
      
      // Mock additional stats (for now)
      totalDeposits: Math.floor(Math.random() * 50000) + 5000,
      totalWithdrawals: Math.floor(Math.random() * 40000) + 4000,
      netProfit: (userProfile.total_won || 0) - (userProfile.total_wagered || 0),
    }

    return NextResponse.json({ stats: userStats })
  } catch (error) {
    console.error('Error in user stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}