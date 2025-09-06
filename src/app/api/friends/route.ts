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

    // Get user's friends
    const { data: friends, error: friendsError } = await supabase
      .from('user_friends')
      .select(`
        *,
        friend_profile:user_profiles!user_friends_friend_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')

    if (friendsError) {
      console.error('Error fetching friends:', friendsError)
      return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
    }

    // Get pending friend requests
    const { data: friendRequests, error: requestsError } = await supabase
      .from('user_friends')
      .select(`
        *,
        requester_profile:user_profiles!user_friends_user_id_fkey(*)
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending')

    if (requestsError) {
      console.error('Error fetching friend requests:', requestsError)
      return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 })
    }

    return NextResponse.json({
      friends: friends || [],
      friend_requests: friendRequests || [],
      total_count: friends?.length || 0
    })

  } catch (error) {
    console.error('Error in friends GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, username, friendId, userId } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    switch (action) {
      case 'add': {
        if (!username) {
          return NextResponse.json({ error: 'Username is required' }, { status: 400 })
        }

        // Get current user from request headers or session
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Find user by username
        const { data: targetUser, error: userError } = await supabase
          .from('user_profiles')
          .select('id, username')
          .eq('username', username)
          .single()

        if (userError || !targetUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if friendship already exists
        const { data: existingFriendship } = await supabase
          .from('user_friends')
          .select('*')
          .or(`and(user_id.eq.${userId},friend_id.eq.${targetUser.id}),and(user_id.eq.${targetUser.id},friend_id.eq.${userId})`)
          .single()

        if (existingFriendship) {
          return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 })
        }

        // Create friend request
        const { data: friendRequest, error: requestError } = await supabase
          .from('user_friends')
          .insert({
            user_id: userId,
            friend_id: targetUser.id,
            status: 'pending'
          })
          .select()
          .single()

        if (requestError) {
          console.error('Error creating friend request:', requestError)
          return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 })
        }

        // Broadcast friend request via WebSocket
        await chatWebSocketManager.broadcastFriendRequest({
          type: 'friend_request',
          data: {
            id: friendRequest.id,
            user_id: userId,
            friend_id: targetUser.id,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        })

        return NextResponse.json({
          success: true,
          message: `Friend request sent to ${username}`,
          friend_request: friendRequest
        })
      }

      case 'accept': {
        if (!friendId) {
          return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 })
        }

        // Accept friend request
        const { data: acceptedFriend, error: acceptError } = await supabase
          .from('user_friends')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('id', friendId)
          .select()
          .single()

        if (acceptError) {
          console.error('Error accepting friend request:', acceptError)
          return NextResponse.json({ error: 'Failed to accept friend request' }, { status: 500 })
        }

        // Create reciprocal friendship
        const { error: reciprocalError } = await supabase
          .from('user_friends')
          .insert({
            user_id: acceptedFriend.friend_id,
            friend_id: acceptedFriend.user_id,
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })

        if (reciprocalError) {
          console.error('Error creating reciprocal friendship:', reciprocalError)
        }

        // Broadcast friend acceptance via WebSocket
        await chatWebSocketManager.broadcastFriendAccept({
          type: 'friend_accept',
          data: {
            id: acceptedFriend.id,
            user_id: acceptedFriend.user_id,
            friend_id: acceptedFriend.friend_id,
            status: 'accepted',
            accepted_at: new Date().toISOString()
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Friend request accepted',
          friend: acceptedFriend
        })
      }

      case 'block': {
        if (!userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Block user
        const { error: blockError } = await supabase
          .from('user_friends')
          .update({ status: 'blocked' })
          .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)

        if (blockError) {
          console.error('Error blocking user:', blockError)
          return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
        }

        // Broadcast user block via WebSocket
        await chatWebSocketManager.broadcastUserBlock({
          type: 'user_block',
          data: {
            user_id: userId,
            blocked_user_id: friendId,
            status: 'blocked'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'User blocked successfully'
        })
      }

      case 'remove': {
        if (!friendId) {
          return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 })
        }

        // Remove friend
        const { error: removeError } = await supabase
          .from('user_friends')
          .delete()
          .eq('id', friendId)

        if (removeError) {
          console.error('Error removing friend:', removeError)
          return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Friend removed successfully'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in friends POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
