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
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AutoFillInput from '@/components/ui/AutoFillInput'
import { useUserStore } from '@/store/userStore'
import { Friend, FriendRequest } from '@/types/social'
import { formatTime } from '@/lib/utils'

interface FriendsListCompactProps {
  onSelectFriend?: (friend: Friend) => void
}

const FriendsListCompact: React.FC<FriendsListCompactProps> = ({ onSelectFriend }) => {
  const { friends, friendRequests, addFriend, acceptFriendRequest, blockUser, removeFriend } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [newFriendUsername, setNewFriendUsername] = useState('')
  const [isAddingFriend, setIsAddingFriend] = useState(false)

  const filteredFriends = friends.filter(friend =>
    friend.friend_profile?.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <Users className="h-4 w-4 mr-2 text-[#00d4ff]" />
            Friends ({friends.length})
          </h3>
          <Button
            size="sm"
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black text-xs px-2 py-1"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        {/* Add Friend Form */}
        <AnimatePresence>
          {showAddFriend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <div className="space-y-2">
                <AutoFillInput
                  placeholder="Search and add friend..."
                  value={newFriendUsername}
                  onChange={setNewFriendUsername}
                  onSelect={handleSelectUser}
                  onAdd={handleAddFriend}
                  disabled={isAddingFriend}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddFriend(newFriendUsername)}
                    disabled={isAddingFriend || !newFriendUsername.trim()}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-xs px-2 py-1"
                  >
                    {isAddingFriend ? 'Adding...' : 'Add Friend'}
                  </Button>
                  <Button
                    onClick={() => setShowAddFriend(false)}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <Input
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-3 w-3" />}
          className="bg-[#2d3748] border-[#374151] text-sm"
        />
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="p-3 border-b border-white/10">
          <h4 className="text-xs font-medium text-gray-400 mb-2">
            Requests ({friendRequests.length})
          </h4>
          <div className="space-y-1">
            {friendRequests.map((request) => (
              <FriendRequestCardCompact
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
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No friends found</p>
              <p className="text-xs">Add friends to start connecting!</p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <FriendCardCompact
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

interface FriendCardCompactProps {
  friend: Friend
  onSelect?: () => void
  onRemove?: () => void
  onBlock?: () => void
}

const FriendCardCompact: React.FC<FriendCardCompactProps> = ({ friend, onSelect, onRemove, onBlock }) => {
  const [showActions, setShowActions] = useState(false)
  const profile = friend.friend_profile

  if (!profile) return null

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative"
    >
      <div 
        className="bg-[#1a2c38] border border-[#2d3748] hover:border-[#00d4ff]/50 cursor-pointer transition-all duration-200 rounded-lg p-2"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Avatar */}
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Online Status */}
              <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-[#1a2c38] ${
                profile.is_online ? 'bg-green-500' : 'bg-gray-500'
              }`} />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <h4 className="text-white font-medium text-sm truncate">
                  {profile.username}
                </h4>
                {profile.vip_tier && (
                  <Crown className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <span>Level {profile.level}</span>
                <span>•</span>
                <span>{profile.is_online ? 'Online' : formatTime(profile.last_active)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-1"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Wagered</div>
            <div className="text-white font-medium">${profile.total_wagered.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Won</div>
            <div className="text-white font-medium">${profile.total_won.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Games</div>
            <div className="text-white font-medium">{profile.games_played}</div>
          </div>
        </div>
      </div>

      {/* Actions Dropdown */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-10 right-1 z-10 bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-lg p-1 min-w-[100px]"
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.()
                setShowActions(false)
              }}
              className="w-full justify-start text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
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
              className="w-full justify-start text-red-400 hover:text-red-300 text-xs"
            >
              <UserX className="h-3 w-3 mr-1" />
              Remove
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onBlock?.()
                setShowActions(false)
              }}
              className="w-full justify-start text-red-400 hover:text-red-300 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Block
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface FriendRequestCardCompactProps {
  request: FriendRequest
  onAccept: () => void
  onBlock: () => void
}

const FriendRequestCardCompact: React.FC<FriendRequestCardCompactProps> = ({ request, onAccept, onBlock }) => {
  const profile = request.requester_profile

  if (!profile) return null

  return (
    <div className="bg-[#1a2c38] border border-[#2d3748] rounded-lg p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Avatar */}
          <div className="w-6 h-6 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div>
            <h4 className="text-white font-medium text-xs">
              {profile.username}
            </h4>
            <p className="text-xs text-gray-400">
              Level {profile.level} • {formatTime(request.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            onClick={onAccept}
            className="bg-green-500 hover:bg-green-600 text-white p-1"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            onClick={onBlock}
            variant="outline"
            className="p-1 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FriendsListCompact
