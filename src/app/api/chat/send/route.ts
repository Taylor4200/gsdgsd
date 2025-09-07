// Vercel-compatible chat send API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, username, content, messageType = 'message' } = await request.json()
    
    if (!userId || !username || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const messageData = {
      user_id: userId,
      username,
      message: content,
      message_type: messageType,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select()
      .single()

    if (error) {
      console.error('Error inserting message:', error)
      return NextResponse.json({ success: false, error: 'Failed to send message' })
    }

    return NextResponse.json({
      success: true,
      message: data
    })

  } catch (error) {
    console.error('Error in chat send:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
