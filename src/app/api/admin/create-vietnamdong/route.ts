import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Create vietnamdong user record manually
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating vietnamdong user record...')
    
    const userId = 'b4af95cd-53de-47f1-9274-87266269c39b'
    
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      console.log('✅ User already exists, updating...')
      
      // Update existing user with all privileges
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({
          username: 'vietnamdong',
          is_mod: true,
          is_vip: true,
          level: 100
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('❌ Error updating:', updateError)
        return NextResponse.json({ error: 'Failed to update user', details: updateError }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Vietnamdong updated with max privileges!',
        user: {
          id: userId,
          username: 'vietnamdong',
          is_mod: true,
          is_vip: true,
          is_admin: true, // Admin = mod + vip + level 100
          level: 100
        }
      })
    } else {
      console.log('🆕 Creating new user record...')
      
      // Create new user with all privileges
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          username: 'vietnamdong',
          message: 'Admin created user with max privileges',
          message_type: 'system',
          is_mod: true,
          is_vip: true,
          level: 100
        })

      if (insertError) {
        console.error('❌ Error creating:', insertError)
        return NextResponse.json({ error: 'Failed to create user', details: insertError }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Vietnamdong created with max privileges!',
        user: {
          id: userId,
          username: 'vietnamdong',
          is_mod: true,
          is_vip: true,
          is_admin: true, // Admin = mod + vip + level 100
          level: 100
        }
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
