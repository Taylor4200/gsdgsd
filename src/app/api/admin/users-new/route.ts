import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get all users from user_profiles table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      // Get detailed user info
      return await getUserDetails(userId)
    }
    
    // Get user list with pagination and filtering
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const offset = (page - 1) * limit

    // Build query
    let query = supabase.from('user_profiles').select('*', { count: 'exact' })

    // Add search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,user_id.ilike.%${search}%`)
    }

    // Filter by role if specified
    if (role) {
      switch (role) {
        case 'admin':
          query = query.eq('is_admin', true)
          break
        case 'mod':
          query = query.eq('is_mod', true)
          break
        case 'vip':
          query = query.eq('is_vip', true)
          break
        case 'regular':
          query = query.eq('is_mod', false).eq('is_vip', false).eq('is_admin', false)
          break
      }
    }

    // Apply pagination and ordering
    const { data: profiles, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching user profiles:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get auth user emails for each profile
    const usersWithEmails = await Promise.all(
      (profiles || []).map(async (profile) => {
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id)
          return {
            id: profile.user_id,
            username: profile.username,
            email: authUser?.user?.email || `${profile.user_id}@example.com`,
            isMod: profile.is_mod,
            isVip: profile.is_vip,
            isAdmin: profile.is_admin,
            isBanned: profile.is_banned,
            level: profile.level,
            createdAt: profile.created_at,
            lastSignIn: authUser?.user?.last_sign_in_at || null,
            emailConfirmed: authUser?.user?.email_confirmed_at ? true : false,
            totalMessages: profile.total_messages
          }
        } catch (err) {
          console.error('Error fetching auth data for user:', profile.user_id, err)
          return {
            id: profile.user_id,
            username: profile.username,
            email: `${profile.user_id}@example.com`,
            isMod: profile.is_mod,
            isVip: profile.is_vip,
            isAdmin: profile.is_admin,
            isBanned: profile.is_banned,
            level: profile.level,
            createdAt: profile.created_at,
            lastSignIn: null,
            emailConfirmed: false,
            totalMessages: profile.total_messages
          }
        }
      })
    )

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      users: usersWithEmails,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get detailed user information
async function getUserDetails(userId: string) {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get auth user data
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)

    // Get chat statistics
    const { data: chatStats } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Get ban history
    const { data: banHistory } = await supabase
      .from('chat_bans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Generate comprehensive user stats
    const userStats = {
      // Basic Info
      id: userId,
      username: profile.username,
      email: authUser?.user?.email || `${userId}@example.com`,
      
      // Profile Data
      isMod: profile.is_mod,
      isVip: profile.is_vip,
      isAdmin: profile.is_admin,
      level: profile.level,
      
      // Chat Stats
      totalMessages: chatStats?.length || 0,
      firstMessage: chatStats?.[chatStats.length - 1]?.created_at,
      lastMessage: chatStats?.[0]?.created_at,
      
      // Ban Info
      totalBans: banHistory?.length || 0,
      isCurrentlyBanned: banHistory?.some(ban => !ban.expires_at || new Date(ban.expires_at) > new Date()) || false,
      banHistory: banHistory || [],
      
      // Mock Financial Data (replace with real data from your transactions table)
      totalDeposits: Math.floor(Math.random() * 50000) + 10000,
      totalWithdrawals: Math.floor(Math.random() * 40000) + 5000,
      netProfit: 0,
      lifetimeWagered: Math.floor(Math.random() * 200000) + 50000,
      totalBets: Math.floor(Math.random() * 5000) + 1000,
      totalWins: Math.floor(Math.random() * 3000) + 500,
      biggestWin: Math.floor(Math.random() * 10000) + 1000,
      averageBet: 0,
      
      // Account Info
      accountAge: profile.created_at,
      vipLevel: profile.is_vip ? 'Gold' : 'Bronze',
      favoriteGame: ['Limbo', 'Dice', 'Minesweeper'][Math.floor(Math.random() * 3)],
      lastActive: chatStats?.[0]?.created_at || profile.updated_at,
      
      // Status
      emailConfirmed: authUser?.user?.email_confirmed_at ? true : false,
      createdAt: profile.created_at
    }

    // Calculate derived stats
    userStats.netProfit = userStats.totalDeposits - userStats.totalWithdrawals
    userStats.averageBet = userStats.totalBets > 0 ? userStats.lifetimeWagered / userStats.totalBets : 0

    return NextResponse.json({ user: userStats })

  } catch (error) {
    console.error('Error getting user details:', error)
    return NextResponse.json({ error: 'Failed to get user details' }, { status: 500 })
  }
}

// Update user profile (admin action)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, role, value } = await request.json()

    console.log('🔧 Updating user profile:', { userId, role, value })

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let updateData: any = {}
    
    switch (role) {
      case 'isMod':
        updateData.is_mod = value
        break
      case 'isVip':
        updateData.is_vip = value
        break
      case 'isAdmin':
        updateData.is_admin = value
        break
      case 'level':
        updateData.level = Math.max(1, Math.min(100, parseInt(value) || 1))
        break
      case 'is_banned':
        updateData.is_banned = value
        break
      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    console.log('📝 Update data:', updateData)

    // Update user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    console.log('✅ User profile updated successfully')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Error in user update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get user statistics
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'stats') {
      // Get stats from user_profiles table
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('is_mod, is_vip, is_admin')

      if (error) {
        console.error('Error fetching user stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
      }

      const totalUsers = profiles?.length || 0
      const confirmedUsers = totalUsers // Assuming all profiles are confirmed
      const modUsers = profiles?.filter(p => p.is_mod).length || 0
      const vipUsers = profiles?.filter(p => p.is_vip).length || 0
      const adminUsers = profiles?.filter(p => p.is_admin).length || 0
      const regularUsers = totalUsers - modUsers - vipUsers - adminUsers

      return NextResponse.json({
        totalUsers,
        confirmedUsers,
        modUsers,
        vipUsers,
        regularUsers
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in user stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
