import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get all users with their roles OR detailed user information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      // Get detailed user info
      return await getUserDetails(userId)
    }
    
    // Original user list logic
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const offset = (page - 1) * limit

    // First, let's try to get users from chat_messages (these are users who have been active)
    const { data: chatUsers, error: chatError } = await supabase
      .from('chat_messages')
      .select('user_id, username, is_mod, is_vip, level, created_at')
      .order('created_at', { ascending: false })

    if (chatError) {
      console.error('Error fetching chat users:', chatError)
    }

    // Get unique users from chat and fetch their real emails
    const uniqueUsers = new Map()
    
    // Process each user and fetch their real email
    for (const user of chatUsers || []) {
      if (!uniqueUsers.has(user.user_id)) {
        // Try to get real email from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id)
        const realEmail = authUser?.user?.email || `${user.user_id}@example.com`
        
        uniqueUsers.set(user.user_id, {
          id: user.user_id,
          username: user.username,
          email: realEmail,
          isMod: user.is_mod || false,
          isVip: user.is_vip || false,
          level: user.level || 1,
          createdAt: user.created_at,
          lastSignIn: null,
          emailConfirmed: true,
          isAdmin: (user.is_mod && user.is_vip && user.level >= 100) || false
        })
      }
    }

    // If we have users from chat, use them
    let usersArray = Array.from(uniqueUsers.values())

    // If no users from chat, create a mock user for testing
    if (usersArray.length === 0) {
      usersArray = [{
        id: 'b4af95cd-53de-47f1-9274-87266269c39b',
        username: 'vietnamdong',
        email: 'taylorbonneville@gmail.com',
        isMod: false,
        isVip: false,
        level: 1,
        createdAt: new Date().toISOString(),
        lastSignIn: new Date().toISOString(),
        emailConfirmed: true,
        isAdmin: false
      }]
    }

    // Add search filter
    if (search) {
      usersArray = usersArray.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filter by role if specified
    if (role) {
      switch (role) {
        case 'admin':
          usersArray = usersArray.filter(user => user.isAdmin)
          break
        case 'mod':
          usersArray = usersArray.filter(user => user.isMod)
          break
        case 'vip':
          usersArray = usersArray.filter(user => user.isVip)
          break
        case 'regular':
          usersArray = usersArray.filter(user => !user.isMod && !user.isVip && !user.isAdmin)
          break
      }
    }

    // Apply pagination
    const total = usersArray.length
    const paginatedUsers = usersArray.slice(offset, offset + limit)

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
    // First, try to get user info from Supabase auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    let userEmail = `${userId}@example.com`
    let userDisplayName = 'Unknown'
    
    if (authUser?.user) {
      userEmail = authUser.user.email || userEmail
      userDisplayName = authUser.user.user_metadata?.username || 
                       authUser.user.user_metadata?.full_name || 
                       authUser.user.email?.split('@')[0] || 
                       'Unknown'
    }

    // Get user chat data
    const { data: chatData, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (chatError) {
      console.error('Error fetching chat data:', chatError)
    }

    // Get ban history
    const { data: banHistory, error: banError } = await supabase
      .from('chat_bans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (banError) {
      console.error('Error fetching ban history:', banError)
    }

    // Get user's latest info
    const latestChat = chatData?.[0]
    
    // Generate comprehensive user stats
    const userStats = {
      // Basic Info
      id: userId,
      username: latestChat?.username || userDisplayName,
      email: userEmail,
      
      // Chat Stats
      totalMessages: chatData?.length || 0,
      firstMessage: chatData?.[chatData.length - 1]?.created_at,
      lastMessage: latestChat?.created_at,
      
      // Role Info
      isMod: latestChat?.is_mod || false,
      isVip: latestChat?.is_vip || false,
      isAdmin: (latestChat?.is_mod && latestChat?.is_vip && latestChat?.level >= 100) || false,
      level: latestChat?.level || 1,
      
      // Ban Info
      totalBans: banHistory?.length || 0,
      isCurrentlyBanned: banHistory?.some(ban => !ban.expires_at || new Date(ban.expires_at) > new Date()) || false,
      banHistory: banHistory || [],
      
      // Mock Financial Data (in a real app, this would come from transaction tables)
      totalDeposits: Math.floor(Math.random() * 50000) + 10000, // $10k-$60k
      totalWithdrawals: Math.floor(Math.random() * 40000) + 5000, // $5k-$45k
      netProfit: 0, // Will be calculated
      lifetimeWagered: Math.floor(Math.random() * 200000) + 50000, // $50k-$250k
      totalBets: Math.floor(Math.random() * 5000) + 1000, // 1k-6k bets
      totalWins: Math.floor(Math.random() * 3000) + 500, // 500-3.5k wins
      biggestWin: Math.floor(Math.random() * 10000) + 1000, // $1k-$11k
      averageBet: 0, // Will be calculated
      
      // Account Info
      accountAge: '2 years 3 months', // Mock data
      vipLevel: latestChat?.is_vip ? 'Gold' : 'Bronze',
      favoriteGame: ['Limbo', 'Dice', 'Minesweeper'][Math.floor(Math.random() * 3)],
      lastActive: latestChat?.created_at || new Date().toISOString(),
      
      // Streaks
      currentStreak: Math.floor(Math.random() * 20) + 1,
      longestWinStreak: Math.floor(Math.random() * 50) + 10,
      longestLossStreak: Math.floor(Math.random() * 15) + 3,
      
      // Status
      emailConfirmed: true,
      createdAt: latestChat?.created_at || new Date().toISOString()
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

// Update user role
export async function PATCH(request: NextRequest) {
  try {
    const { userId, role, value } = await request.json()

    console.log('🔧 Updating user role:', { userId, role, value })

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user exists in chat_messages
    const { data: existingUser, error: checkError } = await supabase
      .from('chat_messages')
      .select('id, username')
      .eq('user_id', userId)
      .limit(1)

    if (checkError) {
      console.error('Error checking user:', checkError)
      return NextResponse.json({ error: 'Failed to check user' }, { status: 500 })
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
        // Note: is_admin column doesn't exist in chat_messages table
        // For now, we'll treat admin as a combination of mod + vip + level 100
        updateData.is_mod = value
        updateData.is_vip = value
        updateData.level = value ? 100 : 1
        break
      case 'level':
        updateData.level = Math.max(1, Math.min(100, parseInt(value) || 1))
        break
      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    console.log('📝 Update data:', updateData)

    // Always update ALL records for this user to ensure consistency
    console.log('✅ Updating ALL user records...')
    const { error: updateError } = await supabase
      .from('chat_messages')
      .update(updateData)
      .eq('user_id', userId)

    if (updateError) {
      console.error('❌ Error updating user:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
    console.log('✅ All user records updated successfully')

    // If no existing records, create one
    if (!existingUser || existingUser.length === 0) {
      // Create new user entry for vietnamdong specifically
      console.log('🆕 User does not exist, creating...')
      const username = userId === 'b4af95cd-53de-47f1-9274-87266269c39b' ? 'vietnamdong' : 'New User'
      
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          username: username,
          message: 'User created by admin',
          message_type: 'system',
          is_mod: false,
          is_vip: false,
          level: 1,
          ...updateData
        })

      if (insertError) {
        console.error('❌ Error creating user:', insertError)
        return NextResponse.json({ error: 'Failed to create user', details: insertError.message }, { status: 500 })
      }
      console.log('✅ User created successfully')
    }

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
      // Get all unique users from chat_messages
      const { data: allUsers } = await supabase
        .from('chat_messages')
        .select('user_id, is_mod, is_vip')
        .not('user_id', 'is', null)

      // Get unique users with their latest role info
      const uniqueUsers = new Map()
      allUsers?.forEach(user => {
        if (!uniqueUsers.has(user.user_id)) {
          uniqueUsers.set(user.user_id, {
            is_mod: user.is_mod,
            is_vip: user.is_vip
          })
        } else {
          // Update with latest role info (in case of multiple records)
          const existing = uniqueUsers.get(user.user_id)
          uniqueUsers.set(user.user_id, {
            is_mod: user.is_mod || existing.is_mod,
            is_vip: user.is_vip || existing.is_vip
          })
        }
      })

      const userArray = Array.from(uniqueUsers.values())
      const totalUsers = uniqueUsers.size > 0 ? uniqueUsers.size : 1
      const confirmedUsers = totalUsers
      const modUsers = userArray.filter(u => u.is_mod).length
      const vipUsers = userArray.filter(u => u.is_vip).length
      const regularUsers = totalUsers - modUsers - vipUsers

      return NextResponse.json({
        totalUsers,
        confirmedUsers,
        modUsers: modUsers || 0,
        vipUsers: vipUsers || 0,
        regularUsers
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in user stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}