import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { chatWebSocketManager } from '@/lib/chatWebSocketManager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
    }

    // Get achievement definitions
    const { data: definitions, error: definitionsError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (definitionsError) {
      console.error('Error fetching achievement definitions:', definitionsError)
      return NextResponse.json({ error: 'Failed to fetch achievement definitions' }, { status: 500 })
    }

    return NextResponse.json({
      achievements: achievements || [],
      definitions: definitions || [],
      total_count: achievements?.length || 0
    })

  } catch (error) {
    console.error('Error in achievements GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { achievementId, userId } = body

    if (!achievementId || !userId) {
      return NextResponse.json({ error: 'Achievement ID and user ID are required' }, { status: 400 })
    }

    // Check if achievement already exists
    const { data: existingAchievement } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()

    if (existingAchievement) {
      return NextResponse.json({ error: 'Achievement already unlocked' }, { status: 400 })
    }

    // Get achievement definition
    const { data: definition, error: definitionError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('id', achievementId)
      .single()

    if (definitionError || !definition) {
      return NextResponse.json({ error: 'Achievement definition not found' }, { status: 404 })
    }

    // Create user achievement
    const { data: achievement, error: achievementError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        achievement_name: definition.name,
        achievement_description: definition.description,
        achievement_icon: definition.icon,
        achievement_rarity: definition.rarity,
        progress: definition.requirements.value,
        max_progress: definition.requirements.value,
        is_completed: true,
        unlocked_at: new Date().toISOString()
      })
      .select()
      .single()

    if (achievementError) {
      console.error('Error creating achievement:', achievementError)
      return NextResponse.json({ error: 'Failed to unlock achievement' }, { status: 500 })
    }

    // Award reward if specified
    if (definition.reward.type === 'coins') {
      // Update user balance
      const { error: balanceError } = await supabase
        .from('user_profiles')
        .update({
          coins: supabase.raw(`coins + ${definition.reward.amount}`)
        })
        .eq('user_id', userId)

      if (balanceError) {
        console.error('Error updating user balance:', balanceError)
      }
    }

    // Broadcast achievement unlock via WebSocket
    await chatWebSocketManager.broadcastAchievementUnlock({
      type: 'achievement_unlock',
      data: {
        id: achievement.id,
        user_id: userId,
        achievement_id: achievementId,
        achievement_name: definition.name,
        achievement_description: definition.description,
        achievement_icon: definition.icon,
        achievement_rarity: definition.rarity,
        reward: definition.reward,
        unlocked_at: achievement.unlocked_at
      }
    })

    return NextResponse.json({
      success: true,
      achievement: achievement
    })

  } catch (error) {
    console.error('Error in achievements POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { achievementId, userId, progress } = body

    if (!achievementId || !userId || progress === undefined) {
      return NextResponse.json({ error: 'Achievement ID, user ID, and progress are required' }, { status: 400 })
    }

    // Get achievement definition
    const { data: definition, error: definitionError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('id', achievementId)
      .single()

    if (definitionError || !definition) {
      return NextResponse.json({ error: 'Achievement definition not found' }, { status: 404 })
    }

    const isCompleted = progress >= definition.requirements.value

    // Update or create user achievement
    const { data: achievement, error: achievementError } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        achievement_name: definition.name,
        achievement_description: definition.description,
        achievement_icon: definition.icon,
        achievement_rarity: definition.rarity,
        progress: progress,
        max_progress: definition.requirements.value,
        is_completed: isCompleted,
        unlocked_at: isCompleted ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (achievementError) {
      console.error('Error updating achievement:', achievementError)
      return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 })
    }

    // If achievement was just completed, award reward
    if (isCompleted && definition.reward.type === 'coins') {
      const { error: balanceError } = await supabase
        .from('user_profiles')
        .update({
          coins: supabase.raw(`coins + ${definition.reward.amount}`)
        })
        .eq('user_id', userId)

      if (balanceError) {
        console.error('Error updating user balance:', balanceError)
      }

      // Broadcast achievement unlock
      await chatWebSocketManager.broadcastAchievementUnlock({
        type: 'achievement_unlock',
        data: {
          id: achievement.id,
          user_id: userId,
          achievement_id: achievementId,
          achievement_name: definition.name,
          achievement_description: definition.description,
          achievement_icon: definition.icon,
          achievement_rarity: definition.rarity,
          reward: definition.reward,
          unlocked_at: achievement.unlocked_at
        }
      })
    }

    return NextResponse.json({
      success: true,
      achievement: achievement
    })

  } catch (error) {
    console.error('Error in achievements PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
