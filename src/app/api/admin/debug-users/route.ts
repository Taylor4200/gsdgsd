import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Debug endpoint to see what tables and data exist
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging Supabase tables...')
    
    // Test 1: Check if profiles table exists and has data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)

    console.log('Profiles table:', { profiles, profilesError })

    // Test 2: Check chat_messages table
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(5)

    console.log('Chat messages:', { chatMessages, chatError })

    // Test 3: Try to get auth users (this might not work from client)
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      console.log('Auth users:', { authUsers, authError })
    } catch (e) {
      console.log('Auth users error (expected):', e)
    }

    // Test 4: Check what tables exist by trying common ones
    const tablesToCheck = ['users', 'user_profiles', 'auth_users', 'public_users']
    const tableResults = {}

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        tableResults[table] = { data, error }
      } catch (e) {
        tableResults[table] = { error: e.message }
      }
    }

    return NextResponse.json({
      profiles: { data: profiles, error: profilesError },
      chatMessages: { data: chatMessages, error: chatError },
      tableResults,
      message: 'Debug complete - check server logs for details'
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Debug failed', details: error.message }, { status: 500 })
  }
}
