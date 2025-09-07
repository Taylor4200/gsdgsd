// Vercel-compatible chat API with instant polling
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (since) {
      query = query.gt('created_at', since)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch messages' })
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    console.error('Error in chat POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
