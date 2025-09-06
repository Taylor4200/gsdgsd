'use client'

import React, { useState } from 'react'
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
  Gamepad2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useUserStore } from '@/store/userStore'
import { SocialBettingSession, Friend } from '@/types/social'
import { formatTime, formatCurrency } from '@/lib/utils'

interface SocialBettingProps {
  onWatchGame?: (session: SocialBettingSession) => void
}

const SocialBetting: React.FC<SocialBettingProps> = ({ onWatchGame }) => {
  const { friends, socialBettingSessions, startSocialBetting, endSocialBetting } = useUserStore()
  const [activeTab, setActiveTab] = useState<'watching' | 'friends'>('watching')

  const onlineFriends = friends.filter(friend => friend.friend_profile?.is_online)
  const activeSessions = socialBettingSessions.filter(session => 
    new Date(session.created_at).getTime() > Date.now() - 300000 // Last 5 minutes
  )

  const handleStartWatching = async (friendId: string, gameSessionId: string) => {
    await startSocialBetting(friendId, gameSessionId)
  }

  const handleStopWatching = async (sessionId: string) => {
    await endSocialBetting(sessionId)
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
            Watching ({activeSessions.length})
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'watching' ? (
          <WatchingTab 
            sessions={activeSessions} 
            onStopWatching={handleStopWatching}
            onWatchGame={onWatchGame}
          />
        ) : (
          <FriendsTab 
            friends={onlineFriends} 
            onStartWatching={handleStartWatching}
          />
        )}
      </div>
    </div>
  )
}

interface WatchingTabProps {
  sessions: SocialBettingSession[]
  onStopWatching: (sessionId: string) => void
  onWatchGame?: (session: SocialBettingSession) => void
}

const WatchingTab: React.FC<WatchingTabProps> = ({ sessions, onStopWatching, onWatchGame }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Not watching anyone</p>
        <p className="text-sm">Start watching friends play games!</p>
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
          />
        ))}
      </div>
    </div>
  )
}

interface FriendsTabProps {
  friends: Friend[]
  onStartWatching: (friendId: string, gameSessionId: string) => void
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends, onStartWatching }) => {
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
            onStartWatching={onStartWatching}
          />
        ))}
      </div>
    </div>
  )
}

interface WatchingSessionCardProps {
  session: SocialBettingSession
  onStopWatching: () => void
  onWatchGame?: () => void
}

const WatchingSessionCard: React.FC<WatchingSessionCardProps> = ({ 
  session, 
  onStopWatching, 
  onWatchGame 
}) => {
  const userProfile = session.user_profile
  const gameSession = session.game_session

  if (!userProfile || !gameSession) return null

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
                    {userProfile.username.charAt(0).toUpperCase()}
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
                    {userProfile.username}
                  </h4>
                  {userProfile.vip_tier && (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Gamepad2 className="h-3 w-3" />
                  <span>{gameSession.game_name}</span>
                  <span>•</span>
                  <span>{formatTime(session.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Game Info */}
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

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={onWatchGame}
                className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
              >
                <Play className="h-4 w-4" />
              </Button>
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
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface FriendPlayingCardProps {
  friend: Friend
  onStartWatching: (friendId: string, gameSessionId: string) => void
}

const FriendPlayingCard: React.FC<FriendPlayingCardProps> = ({ friend, onStartWatching }) => {
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

            {/* Watch Button */}
            <Button
              size="sm"
              onClick={() => onStartWatching(friend.friend_id, mockGameSession.id)}
              className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
            >
              <Eye className="h-4 w-4 mr-1" />
              Watch
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SocialBetting
