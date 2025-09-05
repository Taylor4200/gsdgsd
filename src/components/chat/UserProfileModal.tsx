'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Shield, 
  Crown, 
  Star, 
  Zap, 
  Ban, 
  UserCheck, 
  Trash2, 
  Clock, 
  MessageSquare,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ChatService } from '@/lib/chatService'
import type { ChatMessage } from '@/lib/chatService'
import { cn } from '@/lib/utils'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    username: string
    level: number
    is_vip: boolean
    is_mod: boolean
  }
  currentUser: {
    id: string
    is_mod: boolean
    is_admin?: boolean
  }
  chatService: ChatService | null
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  currentUser, 
  chatService 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'bans'>('overview')
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([])
  const [banHistory, setBanHistory] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState<'1h' | '24h' | '7d' | '30d' | 'permanent'>('24h')
  const [isBanning, setIsBanning] = useState(false)
  const [isUnbanning, setIsUnbanning] = useState(false)
  const [isDeletingMessage, setIsDeletingMessage] = useState<string | null>(null)

  const isAdmin = currentUser.is_mod || currentUser.is_admin
  const isOwnProfile = user.id === currentUser.id

  useEffect(() => {
    if (isOpen) {
      loadUserData()
    }
  }, [isOpen, user.id])

  const loadUserData = async () => {
    setIsLoading(true)
    try {
      // Always load user stats for everyone
      const stats = chatService ? await chatService.getUserStats(user.id) : null
      console.log('Loaded user stats:', stats) // Debug log
      setUserStats(stats)
      
      // Only load admin-specific data if user is admin
      if (isAdmin) {
        const [messages, bans] = await Promise.all([
          chatService ? chatService.getUserMessageHistory(user.id, 50) : Promise.resolve([]),
          chatService ? chatService.getBanHistory(user.id) : Promise.resolve([])
        ])
        
        setMessageHistory(messages)
        setBanHistory(bans)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBanUser = async () => {
    if (!banReason.trim()) return
    
    setIsBanning(true)
    try {
      let expiresAt: Date | undefined
      
      if (banDuration !== 'permanent') {
        const now = new Date()
        switch (banDuration) {
          case '1h':
            expiresAt = new Date(now.getTime() + 60 * 60 * 1000)
            break
          case '24h':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            break
          case '7d':
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            break
        }
      }

      const success = chatService ? await chatService.banUser(user.id, currentUser.id, banReason, expiresAt) : false
      
      if (success) {
        setBanReason('')
        await loadUserData() // Refresh data
        // Show success message
      } else {
        // Show error message
      }
    } catch (error) {
      console.error('Error banning user:', error)
    } finally {
      setIsBanning(false)
    }
  }

  const handleUnbanUser = async () => {
    setIsUnbanning(true)
    try {
      const success = chatService ? await chatService.unbanUser(user.id) : false
      
      if (success) {
        await loadUserData() // Refresh data
        // Show success message
      } else {
        // Show error message
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
    } finally {
      setIsUnbanning(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    setIsDeletingMessage(messageId)
    try {
      const success = chatService ? await chatService.deleteMessage(messageId) : false
      
      if (success) {
        setMessageHistory(prev => prev.filter(msg => msg.id !== messageId))
        // Show success message
      } else {
        // Show error message
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    } finally {
      setIsDeletingMessage(null)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getUserBadge = () => {
    if (user.is_mod) return <Shield className="h-4 w-4 text-red-400" />
    if (user.is_vip) return <Crown className="h-4 w-4 text-yellow-400" />
    if (user.level > 40) return <Star className="h-4 w-4 text-purple-400" />
    if (user.level > 20) return <Zap className="h-4 w-4 text-blue-400" />
    return null
  }

  const getUsernameColor = () => {
    if (user.is_mod) return 'text-red-400'
    if (user.is_vip) return 'text-yellow-400'
    if (user.level > 40) return 'text-purple-400'
    if (user.level > 20) return 'text-blue-400'
    return 'text-gray-300'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1a2c38] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              {getUserBadge()}
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <span className={getUsernameColor()}>{user.username}</span>
                  <span className="text-sm text-gray-400">Level {user.level}</span>
                </h2>
                <p className="text-sm text-gray-400">
                  {isAdmin ? 'Moderator View' : 'User Profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isOwnProfile && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Tip
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Ignore
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors",
                activeTab === 'overview'
                  ? "text-[#00d4ff] border-b-2 border-[#00d4ff]"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              {isAdmin ? 'Overview' : 'User Stats'}
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={cn(
                    "px-6 py-3 text-sm font-medium transition-colors",
                    activeTab === 'messages'
                      ? "text-[#00d4ff] border-b-2 border-[#00d4ff]"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Messages ({messageHistory.length})
                </button>
                <button
                  onClick={() => setActiveTab('bans')}
                  className={cn(
                    "px-6 py-3 text-sm font-medium transition-colors",
                    activeTab === 'bans'
                      ? "text-[#00d4ff] border-b-2 border-[#00d4ff]"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <Ban className="h-4 w-4 inline mr-2" />
                  Ban History ({banHistory.length})
                </button>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d4ff]"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Gaming Statistics */}
                    {userStats ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#2d3748] rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">${userStats.totalWagered?.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Total Wagered</div>
                        </div>
                        <div className="bg-[#2d3748] rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">{userStats.totalBets?.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Total Bets</div>
                        </div>
                        <div className="bg-[#2d3748] rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-400">{userStats.totalWins?.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Wins</div>
                        </div>
                        <div className="bg-[#2d3748] rounded-lg p-4">
                          <div className="text-2xl font-bold text-red-400">{userStats.totalLosses?.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Losses</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#2d3748] rounded-lg p-6 text-center">
                        <div className="text-gray-400 mb-2">Loading gaming statistics...</div>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00d4ff] mx-auto"></div>
                      </div>
                    )}

                    {/* Rank and Progression */}
                    {userStats && (
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Current Rank</h3>
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Crown className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-white">Ruby {userStats.vipLevel + 1}</div>
                                <div className="text-sm text-gray-200">VIP Level {userStats.vipLevel}</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Wager for Next Rank</h3>
                            <div className="text-2xl font-bold text-white">
                              ${(50000 - (userStats.totalWagered % 50000)).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-200">Remaining</div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" 
                                style={{ width: `${((userStats.totalWagered % 50000) / 50000) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed Stats */}
                    {userStats && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="bg-[#2d3748] rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Gaming Stats</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Average Wager:</span>
                                <span className="text-white font-medium">${userStats.averageWager}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Biggest Win:</span>
                                <span className="text-green-400 font-medium">${userStats.biggestWin?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#2d3748] rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Streaks</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Current Streak:</span>
                                <span className={`font-medium ${userStats.currentStreak > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {userStats.currentStreak > 0 ? '+' : ''}{userStats.currentStreak}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Longest Win Streak:</span>
                                <span className="text-green-400 font-medium">{userStats.longestWinStreak}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Longest Loss Streak:</span>
                                <span className="text-red-400 font-medium">{userStats.longestLossStreak}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="bg-[#2d3748] rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Account Info</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Account Age:</span>
                                <span className="text-white font-medium">{userStats.accountAge} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">VIP Level:</span>
                                <span className="text-yellow-400 font-medium">{userStats.vipLevel}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Favorite Game:</span>
                                <span className="text-white font-medium">{userStats.favoriteGame}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Last Active:</span>
                                <span className="text-white font-medium">{formatTime(userStats.lastActive)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ban Actions */}
                    {isAdmin && !isOwnProfile && (
                      <div className="bg-[#2d3748] rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                          Moderation Actions
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ban Reason
                            </label>
                            <Input
                              value={banReason}
                              onChange={(e) => setBanReason(e.target.value)}
                              placeholder="Enter ban reason..."
                              className="bg-[#374151] border-[#4b5563] text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ban Duration
                            </label>
                            <select
                              value={banDuration}
                              onChange={(e) => setBanDuration(e.target.value as any)}
                              className="w-full bg-[#374151] border border-[#4b5563] rounded-md px-3 py-2 text-white"
                            >
                              <option value="1h">1 Hour</option>
                              <option value="24h">24 Hours</option>
                              <option value="7d">7 Days</option>
                              <option value="30d">30 Days</option>
                              <option value="permanent">Permanent</option>
                            </select>
                          </div>
                          
                          <div className="flex space-x-3">
                            <Button
                              onClick={handleBanUser}
                              disabled={!banReason.trim() || isBanning}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {isBanning ? 'Banning...' : 'Ban User'}
                            </Button>
                            
                            <Button
                              onClick={handleUnbanUser}
                              disabled={isUnbanning}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {isUnbanning ? 'Unbanning...' : 'Unban User'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'messages' && (
                  <div className="space-y-3">
                    {messageHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No messages found
                      </div>
                    ) : (
                      messageHistory.map((msg) => (
                        <div key={msg.id} className="bg-[#2d3748] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-400">
                                {formatTime(new Date(msg.created_at))}
                              </span>
                              <span className="text-xs text-gray-500">
                                {msg.message_type}
                              </span>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMessage(msg.id)}
                                disabled={isDeletingMessage === msg.id}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-white">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'bans' && (
                  <div className="space-y-3">
                    {banHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No ban history found
                      </div>
                    ) : (
                      banHistory.map((ban) => (
                        <div key={ban.id} className="bg-[#2d3748] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Ban className="h-4 w-4 text-red-400" />
                              <span className="text-sm text-gray-400">
                                {formatTime(new Date(ban.created_at))}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {ban.expires_at ? (
                                <span className="text-yellow-400">
                                  Expires: {formatTime(new Date(ban.expires_at))}
                                </span>
                              ) : (
                                <span className="text-red-400">Permanent</span>
                              )}
                            </div>
                          </div>
                          <p className="text-white mb-1">{ban.reason}</p>
                          <p className="text-sm text-gray-400">
                            Banned by: {ban.banned_by}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UserProfileModal
