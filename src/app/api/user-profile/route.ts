import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const username = searchParams.get('username')

    if (!userId && !username) {
      return NextResponse.json({ error: 'User ID or username required' }, { status: 400 })
    }

    let query = supabase.from('user_profiles').select('*')
    
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (username) {
      query = query.eq('username', username)
    }

    const { data: profile, error } = await query.single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error in user profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const { userId, username, ...updateData } = await request.json()

    if (!userId || !username) {
      return NextResponse.json({ error: 'User ID and username required' }, { status: 400 })
    }

    // Use the get_or_create_user_profile function
    const { data: profile, error } = await supabase.rpc('get_or_create_user_profile', {
      p_user_id: userId,
      p_username: username
    })

    if (error) {
      console.error('Error creating/getting user profile:', error)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    // If there's additional data to update, do it now
    if (Object.keys(updateData).length > 0) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user profile:', updateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      return NextResponse.json({ profile: updatedProfile })
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error in user profile creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update user profile (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, ...updateData } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Validate update data
    const allowedFields = ['is_mod', 'is_vip', 'is_admin', 'level', 'username']
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Validate level if provided
    if (filteredData.level !== undefined) {
      const level = parseInt(filteredData.level)
      if (isNaN(level) || level < 1 || level > 100) {
        return NextResponse.json({ error: 'Level must be between 1 and 100' }, { status: 400 })
      }
      filteredData.level = level
    }

    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(filteredData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: updatedProfile })

  } catch (error) {
    console.error('Error in user profile update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
