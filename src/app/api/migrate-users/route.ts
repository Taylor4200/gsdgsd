import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Migration endpoint to move existing users from chat_messages to user_profiles
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting user migration...')

    // Get all unique users from chat_messages with their latest data
    const { data: chatUsers, error: chatError } = await supabase
      .from('chat_messages')
      .select('user_id, username, is_mod, is_vip, level, created_at')
      .order('created_at', { ascending: false })

    if (chatError) {
      console.error('Error fetching chat users:', chatError)
      return NextResponse.json({ error: 'Failed to fetch chat users' }, { status: 500 })
    }

    // Process unique users (get latest data for each user)
    const uniqueUsers = new Map()
    
    chatUsers?.forEach(user => {
      if (!uniqueUsers.has(user.user_id)) {
        uniqueUsers.set(user.user_id, {
          user_id: user.user_id,
          username: user.username,
          is_mod: user.is_mod || false,
          is_vip: user.is_vip || false,
          level: user.level || 1,
          created_at: user.created_at
        })
      }
    })

    console.log(`📊 Found ${uniqueUsers.size} unique users to migrate`)

    // Count messages for each user
    const usersWithCounts = []
    for (const [userId, userData] of Array.from(uniqueUsers.entries())) {
      const { data: messageCount } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      usersWithCounts.push({
        ...userData,
        total_messages: messageCount?.length || 0
      })
    }

    // Insert users into user_profiles (with conflict handling)
    const { data: insertedUsers, error: insertError } = await supabase
      .from('user_profiles')
      .upsert(
        usersWithCounts.map(user => ({
          user_id: user.user_id,
          username: user.username,
          is_mod: user.is_mod,
          is_vip: user.is_vip,
          is_admin: false, // Default to false
          level: user.level,
          total_messages: user.total_messages
        })),
        { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        }
      )
      .select()

    if (insertError) {
      console.error('Error inserting users:', insertError)
      return NextResponse.json({ error: 'Failed to migrate users' }, { status: 500 })
    }

    console.log(`✅ Successfully migrated ${insertedUsers?.length || 0} users`)

    return NextResponse.json({
      success: true,
      migratedUsers: insertedUsers?.length || 0,
      users: insertedUsers
    })

  } catch (error) {
    console.error('❌ Error in user migration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
