'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  MoreVertical,
  Crown,
  Star,
  Zap,
  Eye,
  MessageCircle,
  Clock,
  Check,
  X,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import AutoFillInput from '@/components/ui/AutoFillInput'
import { useUserStore } from '@/store/userStore'
import { Friend, FriendRequest } from '@/types/social'
import { formatTime, formatCurrency } from '@/lib/utils'

interface FriendsListFullProps {
  onSelectFriend?: (friend: Friend) => void
}

const FriendsListFull: React.FC<FriendsListFullProps> = ({ onSelectFriend }) => {
  const { friends, friendRequests, addFriend, acceptFriendRequest, blockUser, removeFriend } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendUsername, setNewFriendUsername] = useState('')
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'wagered' | 'online'>('online')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredFriends = friends.filter(friend =>
    friend.friend_profile?.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedFriends = [...filteredFriends].sort((a, b) => {
    const profileA = a.friend_profile
    const profileB = b.friend_profile
    
    if (!profileA || !profileB) return 0

    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = profileA.username.localeCompare(profileB.username)
        break
      case 'level':
        comparison = profileA.level - profileB.level
        break
      case 'wagered':
        comparison = profileA.total_wagered - profileB.total_wagered
        break
      case 'online':
        comparison = profileA.is_online === profileB.is_online ? 0 : profileA.is_online ? -1 : 1
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleAddFriend = async (username: string) => {
    if (!username.trim()) return
    
    setIsAddingFriend(true)
    const result = await addFriend(username.trim())
    
    if (result.success) {
      setNewFriendUsername('')
      setShowAddFriend(false)
    } else {
      console.error(result.message)
    }
    
    setIsAddingFriend(false)
  }

  const handleSelectUser = (username: string) => {
    setNewFriendUsername(username)
  }

  const handleAcceptRequest = async (friendId: string) => {
    await acceptFriendRequest(friendId)
  }

  const handleBlockUser = async (userId: string) => {
    await blockUser(userId)
  }

  const handleRemoveFriend = async (friendId: string) => {
    await removeFriend(friendId)
  }

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  const onlineCount = friends.filter(friend => friend.friend_profile?.is_online).length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Users className="h-6 w-6 mr-3 text-[#00d4ff]" />
              Friends
            </h2>
            <p className="text-gray-400 mt-1">
              {friends.length} friends • {onlineCount} online
            </p>
          </div>
          <Button
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>

        {/* Add Friend Form */}
        <AnimatePresence>
          {showAddFriend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-[#1a2c38] border-[#2d3748]">
                <CardHeader>
                  <CardTitle className="text-white">Add New Friend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AutoFillInput
                      placeholder="Search and add friend..."
                      value={newFriendUsername}
                      onChange={setNewFriendUsername}
                      onSelect={handleSelectUser}
                      onAdd={handleAddFriend}
                      disabled={isAddingFriend}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAddFriend(newFriendUsername)}
                        disabled={isAddingFriend || !newFriendUsername.trim()}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        {isAddingFriend ? 'Adding...' : 'Add Friend'}
                      </Button>
                      <Button
                        onClick={() => setShowAddFriend(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#1a2c38] border-[#2d3748]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('online')}
              className={sortBy === 'online' ? 'bg-[#00d4ff]/20 border-[#00d4ff]' : ''}
            >
              <Eye className="h-4 w-4 mr-1" />
              Online
              {sortBy === 'online' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('level')}
              className={sortBy === 'level' ? 'bg-[#00d4ff]/20 border-[#00d4ff]' : ''}
            >
              <Star className="h-4 w-4 mr-1" />
              Level
              {sortBy === 'level' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('wagered')}
              className={sortBy === 'wagered' ? 'bg-[#00d4ff]/20 border-[#00d4ff]' : ''}
            >
              <Zap className="h-4 w-4 mr-1" />
              Wagered
              {sortBy === 'wagered' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
            </Button>
          </div>
        </div>
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-green-400" />
            Friend Requests ({friendRequests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendRequests.map((request) => (
              <FriendRequestCardFull
                key={request.id}
                request={request}
                onAccept={() => handleAcceptRequest(request.friend_id)}
                onBlock={() => handleBlockUser(request.friend_id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedFriends.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No friends found</h3>
              <p>Add friends to start connecting and see their gaming stats!</p>
            </div>
          ) : (
            sortedFriends.map((friend) => (
              <FriendCardFull
                key={friend.id}
                friend={friend}
                onSelect={() => onSelectFriend?.(friend)}
                onRemove={() => handleRemoveFriend(friend.friend_id)}
                onBlock={() => handleBlockUser(friend.friend_id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface FriendCardFullProps {
  friend: Friend
  onSelect?: () => void
  onRemove?: () => void
  onBlock?: () => void
}

const FriendCardFull: React.FC<FriendCardFullProps> = ({ friend, onSelect, onRemove, onBlock }) => {
  const [showActions, setShowActions] = useState(false)
  const profile = friend.friend_profile

  if (!profile) return null

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card 
        className="bg-[#1a2c38] border-[#2d3748] hover:border-[#00d4ff]/50 cursor-pointer transition-all duration-200 h-full"
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online Status */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a2c38] ${
                  profile.is_online ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-semibold truncate">
                    {profile.username}
                  </h4>
                  {profile.vip_tier && (
                    <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Level {profile.level}</span>
                  <span>•</span>
                  <span>{profile.is_online ? 'Online' : formatTime(profile.last_active)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
                className="p-2"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400 mb-1">Total Wagered</div>
              <div className="text-white font-semibold">{formatCurrency(profile.total_wagered, 'SC')}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-1">Total Won</div>
              <div className="text-white font-semibold">{formatCurrency(profile.total_won, 'SC')}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-1">Games Played</div>
              <div className="text-white font-semibold">{profile.games_played.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-1">Win Rate</div>
              <div className="text-white font-semibold">{profile.win_rate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Achievements</span>
              <span className="text-sm text-white font-medium">{profile.achievements_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Dropdown */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-16 right-4 z-10 bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-lg p-2 min-w-[140px]"
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.()
                setShowActions(false)
              }}
              className="w-full justify-start"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onRemove?.()
                setShowActions(false)
              }}
              className="w-full justify-start text-red-400 hover:text-red-300"
            >
              <UserX className="h-4 w-4 mr-2" />
              Remove Friend
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onBlock?.()
                setShowActions(false)
              }}
              className="w-full justify-start text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4 mr-2" />
              Block User
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface FriendRequestCardFullProps {
  request: FriendRequest
  onAccept: () => void
  onBlock: () => void
}

const FriendRequestCardFull: React.FC<FriendRequestCardFullProps> = ({ request, onAccept, onBlock }) => {
  const profile = request.requester_profile

  if (!profile) return null

  return (
    <Card className="bg-[#1a2c38] border-[#2d3748]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div>
              <h4 className="text-white font-semibold">
                {profile.username}
              </h4>
              <p className="text-sm text-gray-400">
                Level {profile.level} • {formatTime(request.created_at)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={onAccept}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              onClick={onBlock}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Block
            </Button>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Wagered</div>
            <div className="text-white font-medium">{formatCurrency(profile.total_wagered, 'SC')}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Games</div>
            <div className="text-white font-medium">{profile.games_played}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Win Rate</div>
            <div className="text-white font-medium">{profile.win_rate.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FriendsListFull
