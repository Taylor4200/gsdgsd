import { NextRequest, NextResponse } from 'next/server'

// This endpoint receives broadcast requests and forwards them to the WebSocket server
export async function POST(request: NextRequest) {
  try {
    const message = await request.json()
    
    // Forward the message to the WebSocket server
    const wsUrl = process.env.WEBSOCKET_SERVER_URL || 'http://localhost:8080'
    
    const response = await fetch(`${wsUrl}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error('Failed to broadcast message')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error broadcasting WebSocket message:', error)
    return NextResponse.json(
      { error: 'Failed to broadcast message' },
      { status: 500 }
    )
  }
}
