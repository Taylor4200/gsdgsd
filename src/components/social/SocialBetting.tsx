'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  Users, 
  Zap, 
  Crown, 
  Star,
  Target,
  DollarSign,
  TrendingUp,
  Clock,
  Gamepad2,
  UserPlus,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { SocialBettingSession, Friend, WatchRequest, WatchSession } from '@/types/social'
import { formatTime, formatCurrency } from '@/lib/utils'
import WatchPopout from './WatchPopout'

interface SocialBettingProps {
  onWatchGame?: (session: WatchSession) => void
}

const SocialBetting: React.FC<SocialBettingProps> = ({ onWatchGame }) => {
  const { friends, socialBettingSessions, startSocialBetting, endSocialBetting } = useUserStore()
  const [activeTab, setActiveTab] = useState<'watching' | 'friends' | 'requests'>('watching')
  const [watchRequests, setWatchRequests] = useState<WatchRequest[]>([])
  const [watchSessions, setWatchSessions] = useState<WatchSession[]>([])
  const [loading, setLoading] = useState(false)
  const [popoutWindows, setPopoutWindows] = useState<Map<string, WatchSession>>(new Map())
  const [minimizedWindows, setMinimizedWindows] = useState<Set<string>>(new Set())

  const onlineFriends = friends.filter(friend => friend.friend_profile?.is_online)
  const activeSessions = socialBettingSessions.filter(session => 
    new Date(session.created_at).getTime() > Date.now() - 300000 // Last 5 minutes
  )

  // Fetch watch requests and sessions
  useEffect(() => {
    fetchWatchData()
  }, [])

  const fetchWatchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/watch-requests?userId=${useUserStore.getState().user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setWatchRequests([...data.sent_requests, ...data.received_requests])
        setWatchSessions(data.active_watch_sessions)
      }
    } catch (error) {
      console.error('Error fetching watch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendWatchRequest = async (friendId: string, gameSessionId?: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/watch-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          targetId: friendId,
          userId: useUserStore.getState().user?.id,
          gameSessionId
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh watch requests
        await fetchWatchData()
        // Show success message
        console.log(data.message)
      } else {
        const error = await response.json()
        console.error(error.error)
      }
    } catch (error) {
      console.error('Error sending watch request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToWatchRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setLoading(true)
      const response = await fetch('/api/watch-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          requestId,
          userId: useUserStore.getState().user?.id,
          responseAction: action
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh watch data
        await fetchWatchData()
        console.log(data.message)
      } else {
        const error = await response.json()
        console.error(error.error)
      }
    } catch (error) {
      console.error('Error responding to watch request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEndWatchSession = async (sessionId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/watch-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          requestId: sessionId,
          userId: useUserStore.getState().user?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh watch data
        await fetchWatchData()
        console.log(data.message)
      } else {
        const error = await response.json()
        console.error(error.error)
      }
    } catch (error) {
      console.error('Error ending watch session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartWatching = async (friendId: string, gameSessionId: string) => {
    await startSocialBetting(friendId, gameSessionId)
  }

  const handleStopWatching = async (sessionId: string) => {
    await endSocialBetting(sessionId)
  }

  const pendingRequests = watchRequests.filter(req => req.status === 'pending')
  const activeWatchSessions = watchSessions.filter(session => session.status === 'active')

  // Popout window management
  const openPopout = (session: WatchSession) => {
    setPopoutWindows(prev => new Map(prev.set(session.id, session)))
  }

  const closePopout = (sessionId: string) => {
    setPopoutWindows(prev => {
      const newMap = new Map(prev)
      newMap.delete(sessionId)
      return newMap
    })
    setMinimizedWindows(prev => {
      const newSet = new Set(prev)
      newSet.delete(sessionId)
      return newSet
    })
  }

  const minimizePopout = (sessionId: string) => {
    setMinimizedWindows(prev => new Set(prev.add(sessionId)))
  }

  const restorePopout = (sessionId: string) => {
    setMinimizedWindows(prev => {
      const newSet = new Set(prev)
      newSet.delete(sessionId)
      return newSet
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Eye className="h-5 w-5 mr-2 text-[#00d4ff]" />
            Social Betting
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={activeTab === 'watching' ? "default" : "ghost"}
            onClick={() => setActiveTab('watching')}
            className={`flex items-center ${
              activeTab === 'watching' 
                ? 'bg-[#00d4ff] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4 mr-1" />
            Watching ({activeWatchSessions.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'friends' ? "default" : "ghost"}
            onClick={() => setActiveTab('friends')}
            className={`flex items-center ${
              activeTab === 'friends' 
                ? 'bg-[#00d4ff] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 mr-1" />
            Friends Playing ({onlineFriends.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'requests' ? "default" : "ghost"}
            onClick={() => setActiveTab('requests')}
            className={`flex items-center ${
              activeTab === 'requests' 
                ? 'bg-[#00d4ff] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Requests ({pendingRequests.length})
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'watching' ? (
          <WatchingTab 
            sessions={activeWatchSessions} 
            onStopWatching={handleEndWatchSession}
            onWatchGame={onWatchGame}
            onOpenPopout={openPopout}
            popoutWindows={popoutWindows}
          />
        ) : activeTab === 'friends' ? (
          <FriendsTab 
            friends={onlineFriends} 
            onSendWatchRequest={handleSendWatchRequest}
          />
        ) : (
          <RequestsTab 
            requests={pendingRequests}
            onRespondToRequest={handleRespondToWatchRequest}
          />
        )}
      </div>

      {/* Popout Windows */}
      {Array.from(popoutWindows.entries()).map(([sessionId, session]) => (
        <WatchPopout
          key={sessionId}
          session={session}
          onClose={() => closePopout(sessionId)}
          onMinimize={() => minimizePopout(sessionId)}
        />
      ))}
    </div>
  )
}

interface WatchingTabProps {
  sessions: WatchSession[]
  onStopWatching: (sessionId: string) => void
  onWatchGame?: (session: WatchSession) => void
  onOpenPopout: (session: WatchSession) => void
  popoutWindows: Map<string, WatchSession>
}

const WatchingTab: React.FC<WatchingTabProps> = ({ sessions, onStopWatching, onWatchGame, onOpenPopout, popoutWindows }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Not watching anyone</p>
        <p className="text-sm">Send watch requests to friends to start watching!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-400">Currently Watching</h4>
      <div className="space-y-3">
        {sessions.map((session) => (
          <WatchingSessionCard
            key={session.id}
            session={session}
            onStopWatching={() => onStopWatching(session.id)}
            onWatchGame={() => onWatchGame?.(session)}
            onOpenPopout={() => onOpenPopout(session)}
            isPopoutOpen={popoutWindows.has(session.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface FriendsTabProps {
  friends: Friend[]
  onSendWatchRequest: (friendId: string, gameSessionId?: string) => void
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends, onSendWatchRequest }) => {
  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No friends online</p>
        <p className="text-sm">Invite friends to start playing together!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-400">Friends Currently Playing</h4>
      <div className="space-y-3">
        {friends.map((friend) => (
          <FriendPlayingCard
            key={friend.id}
            friend={friend}
            onSendWatchRequest={onSendWatchRequest}
          />
        ))}
      </div>
    </div>
  )
}

interface RequestsTabProps {
  requests: WatchRequest[]
  onRespondToRequest: (requestId: string, action: 'accept' | 'decline') => void
}

const RequestsTab: React.FC<RequestsTabProps> = ({ requests, onRespondToRequest }) => {
  const receivedRequests = requests.filter(req => req.status === 'pending')
  
  if (receivedRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No pending watch requests</p>
        <p className="text-sm">Friends can send you watch requests to view your games!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-400">Watch Requests</h4>
      <div className="space-y-3">
        {receivedRequests.map((request) => (
          <WatchRequestCard
            key={request.id}
            request={request}
            onRespondToRequest={onRespondToRequest}
          />
        ))}
      </div>
    </div>
  )
}

interface WatchingSessionCardProps {
  session: WatchSession
  onStopWatching: () => void
  onWatchGame?: () => void
  onOpenPopout: () => void
  isPopoutOpen: boolean
}

const WatchingSessionCard: React.FC<WatchingSessionCardProps> = ({ 
  session, 
  onStopWatching, 
  onWatchGame,
  onOpenPopout,
  isPopoutOpen
}) => {
  const watchedProfile = session.watched_profile
  const gameSession = session.game_session

  if (!watchedProfile) return null

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
    >
      <Card className="bg-[#1a2c38] border-[#2d3748] hover:border-[#00d4ff]/50 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {watchedProfile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a2c38] flex items-center justify-center">
                  <Eye className="h-2 w-2 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium">
                    {watchedProfile.username}
                  </h4>
                  {watchedProfile.vip_tier && (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Gamepad2 className="h-3 w-3" />
                  <span>{gameSession?.game_name || 'Playing'}</span>
                  <span>•</span>
                  <span>{formatTime(session.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Game Info */}
            {gameSession && (
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {formatCurrency(gameSession.bet_amount)}
                </div>
                <div className="text-xs text-gray-400">
                  {gameSession.result === 'win' ? (
                    <span className="text-green-400">Won {formatCurrency(gameSession.win_amount)}</span>
                  ) : (
                    <span className="text-red-400">Lost</span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={onOpenPopout}
                variant={isPopoutOpen ? "default" : "outline"}
                className={`${
                  isPopoutOpen 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-[#00d4ff] hover:bg-[#00b8e6] text-black border-[#00d4ff]'
                }`}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPopoutOpen ? 'Popout Open' : 'Popout'}
              </Button>
              {gameSession && (
                <Button
                  size="sm"
                  onClick={onWatchGame}
                  className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={onStopWatching}
                variant="outline"
                className="text-red-400 border-red-500 hover:bg-red-500 hover:text-white"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Game Stats */}
          {gameSession && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Bet</div>
                <div className="text-white font-medium">{formatCurrency(gameSession.bet_amount)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Multiplier</div>
                <div className="text-white font-medium">{gameSession.multiplier}x</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Result</div>
                <div className={`font-medium ${
                  gameSession.result === 'win' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {gameSession.result === 'win' ? 'Win' : 'Loss'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface FriendPlayingCardProps {
  friend: Friend
  onSendWatchRequest: (friendId: string, gameSessionId?: string) => void
}

const FriendPlayingCard: React.FC<FriendPlayingCardProps> = ({ friend, onSendWatchRequest }) => {
  const profile = friend.friend_profile
  if (!profile) return null

  // Mock recent game session - in real implementation, this would come from the API
  const mockGameSession = {
    id: 'mock-session',
    game_name: 'Dice',
    bet_amount: 25.00,
    result: 'win' as const,
    multiplier: 2.5
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
    >
      <Card className="bg-[#1a2c38] border-[#2d3748] hover:border-[#00d4ff]/50 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a2c38]" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium">
                    {profile.username}
                  </h4>
                  {profile.vip_tier && (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Gamepad2 className="h-3 w-3" />
                  <span>Playing {mockGameSession.game_name}</span>
                  <span>•</span>
                  <span>Level {profile.level}</span>
                </div>
              </div>
            </div>

            {/* Recent Game */}
            <div className="text-right mr-3">
              <div className="text-sm font-medium text-white">
                {formatCurrency(mockGameSession.bet_amount)}
              </div>
              <div className="text-xs text-gray-400">
                {mockGameSession.multiplier}x
              </div>
            </div>

            {/* Watch Request Button */}
            <Button
              size="sm"
              onClick={() => onSendWatchRequest(friend.friend_id, mockGameSession.id)}
              className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Request Watch
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface WatchRequestCardProps {
  request: WatchRequest
  onRespondToRequest: (requestId: string, action: 'accept' | 'decline') => void
}

const WatchRequestCard: React.FC<WatchRequestCardProps> = ({ request, onRespondToRequest }) => {
  const requesterProfile = request.requester_profile
  if (!requesterProfile) return null

  const isExpired = new Date(request.expires_at) < new Date()
  const timeLeft = Math.max(0, Math.floor((new Date(request.expires_at).getTime() - Date.now()) / 1000 / 60))

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`border-[#2d3748] transition-all duration-200 ${
        isExpired 
          ? 'bg-[#2a1a1a] border-red-500/50' 
          : 'bg-[#1a2c38] hover:border-[#00d4ff]/50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {requesterProfile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#1a2c38]" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium">
                    {requesterProfile.username}
                  </h4>
                  {requesterProfile.vip_tier && (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <UserPlus className="h-3 w-3" />
                  <span>Wants to watch you play</span>
                  <span>•</span>
                  <span>{formatTime(request.created_at)}</span>
                </div>
                {!isExpired && (
                  <div className="flex items-center space-x-1 text-xs text-orange-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Expires in {timeLeft}m</span>
                  </div>
                )}
                {isExpired && (
                  <div className="flex items-center space-x-1 text-xs text-red-400 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Request expired</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isExpired && (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => onRespondToRequest(request.id, 'accept')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRespondToRequest(request.id, 'decline')}
                  variant="outline"
                  className="text-red-400 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SocialBetting
