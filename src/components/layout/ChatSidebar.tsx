'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle,
  Send,
  Users,
  Eye,
  Award,
  Crown,
  X,
  Minimize2,
  Maximize2,
  Shield,
  Star,
  Zap,
  MoreVertical,
  Ban,
  Trash2,
  Settings,
  Bell,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn, formatTime } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import type { ChatMessage } from '@/lib/chatService'
import UserProfileModal from '@/components/chat/UserProfileModal'
import BanModal from '@/components/modals/BanModal'
import { useVercelChat } from '@/hooks/useVercelChat'

// Import social components
import FriendsListCompact from '@/components/social/FriendsListCompact'
import PrivateMessages from '@/components/social/PrivateMessages'
import Leaderboards from '@/components/social/Leaderboards'
import SocialBetting from '@/components/social/SocialBetting'

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  collapsed?: boolean
  onShowUserStats?: (user: any) => void
  isMobile?: boolean
}

type TabType = 'chat' | 'friends' | 'messages' | 'leaderboards' | 'social'

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle, collapsed = false, onShowUserStats, isMobile = false }) => {
  const { user, unreadMessages, socialNotifications } = useUserStore()
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineCount, setOnlineCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showModMenu, setShowModMenu] = useState<string | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banTarget, setBanTarget] = useState<{userId: string, username: string} | null>(null)
  const [timeoutNotification, setTimeoutNotification] = useState<{message: string, type: 'timeout'} | null>(null)

  // Vercel-compatible instant chat (1-second polling)
  const { 
    messages: wsMessages, 
    onlineUsers, 
    isConnected: wsConnected, 
    sendMessage: sendChatMessage 
  } = useVercelChat(user?.id, user?.username)

  // Update messages from Vercel polling
  useEffect(() => {
    if (wsMessages && wsMessages.length > 0) {
      setMessages(wsMessages)
      scrollToBottom()
    }
  }, [wsMessages])

  // Update online count from polling
  useEffect(() => {
    if (onlineUsers) {
      setOnlineCount(onlineUsers.length)
    }
  }, [onlineUsers])

  // Initialize chat when user is available
  useEffect(() => {
    if (user && user.id) {
      // Update presence via API
      fetch('/api/chat-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update-presence', 
          userId: user.id, 
          username: user.username || 'Anonymous' 
        })
      })

      // Load recent messages via API
      fetch('/api/chat-new')
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            setMessages(data.messages)
            setIsConnected(true)
          }
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Failed to load messages:', err)
          setError('Failed to load messages')
          setIsLoading(false)
        })

      // Get initial online count via API
      fetch('/api/chat-new?action=online-count')
        .then(res => res.json())
        .then(data => {
          if (data.count !== undefined) {
            setOnlineCount(data.count)
          }
        })
        .catch(err => console.error('Failed to get online count:', err))

      return () => {
        // Mark user as offline when component unmounts
        fetch('/api/chat-new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update-presence', 
            userId: user.id, 
            username: user.username || 'Anonymous',
            isOnline: false 
          })
        })
      }
    }
  }, [user])

  // Remove messages older than 1 hour for visual display (keeps logs for mods)
  useEffect(() => {
    const removeOldMessages = () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      // Filter out messages older than 1 hour
      setMessages(prev => {
        const filtered = prev.filter(msg => {
          const messageTime = new Date(msg.timestamp)
          return messageTime > oneHourAgo
        })
        
        // Only update if there were actually old messages to remove
        if (filtered.length !== prev.length) {
          return filtered
        }
        return prev
      })
    }

    // Check for old messages every 5 minutes
    const interval = setInterval(removeOldMessages, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !wsConnected || !user) return

    const messageText = newMessage.trim()
    setNewMessage('')

    // Send via Vercel API (instant!)
    const success = await sendChatMessage(messageText)
    if (!success) {
      setError('Failed to send message')
      setNewMessage(messageText)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getUsernameColor = (msg: ChatMessage) => {
    if (msg.is_mod) return 'text-red-400'
    if (msg.is_vip) return 'text-yellow-400'
    if (msg.level && msg.level > 40) return 'text-purple-400'
    if (msg.level && msg.level > 20) return 'text-blue-400'
    return 'text-gray-300'
  }

  const getUserBadge = (msg: ChatMessage) => {
    if (msg.is_mod) return <Shield className="h-3 w-3 text-red-400" />
    if (msg.is_vip) return <Crown className="h-3 w-3 text-yellow-400" />
    if (msg.level && msg.level > 40) return <Star className="h-3 w-3 text-purple-400" />
    if (msg.level && msg.level > 20) return <Zap className="h-3 w-3 text-blue-400" />
    return null
  }

  const handleModAction = async (action: string, messageId: string, userId: string, username: string) => {
    if (!user?.is_mod) return

    try {
      let response
      switch (action) {
        case 'ban':
          setBanTarget({ userId, username })
          setShowBanModal(true)
          setShowModMenu(null)
          return
        case 'unban':
          response = await fetch('/api/admin/users-new', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId, 
              role: 'is_banned', 
              value: false 
            })
          })
          break
        case 'delete':
          response = await fetch('/api/chat-new', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId })
          })
          if (response.ok) {
            setMessages(prev => prev.filter(msg => msg.id !== messageId))
          }
          break
        case 'view_history':
          setSelectedUser({ id: userId, username })
          setShowUserProfile(true)
          break
      }
      
      if (response && response.ok) {
        setShowModMenu(null)
        const messagesResponse = await fetch('/api/chat-new')
        const data = await messagesResponse.json()
        if (data.messages) {
          setMessages(data.messages)
        }
      }
    } catch (error) {
      console.error('Mod action failed:', error)
    }
  }

  const handleUserClick = (msg: ChatMessage) => {
    setSelectedUser({
      id: msg.user_id,
      username: msg.username,
      level: msg.level,
      is_vip: msg.is_vip,
      is_mod: msg.is_mod
    })
    setShowUserProfile(true)
  }

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const tabs = [
    { id: 'chat', name: 'Chat', icon: MessageCircle, badge: onlineCount },
    { id: 'friends', name: 'Friends', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageCircle, badge: unreadMessages }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <>
            {/* Connection Status */}
            <div className="px-4 py-2 border-b border-white/10">
              {isLoading && (
                <div className="text-xs text-gray-400 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00d4ff]"></div>
                  <span>Connecting...</span>
                </div>
              )}
              {error && (
                <div className="text-xs text-red-400 flex items-center space-x-2">
                  <X className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              )}
              {wsConnected && !error && (
                <div className="text-xs text-green-400 flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span>Live</span>
                </div>
              )}
            </div>

            {/* Timeout Notification */}
            {timeoutNotification && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mx-4 mb-2">
                <div className="flex items-center space-x-2">
                  <Ban className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-400 font-medium">{timeoutNotification.message}</p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-hide">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "flex items-start space-x-2 group p-2 rounded-lg transition-colors",
                      msg.is_system 
                        ? "bg-blue-500/10 border border-blue-500/20" 
                        : "hover:bg-gray-800/50"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {getUserBadge(msg)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span 
                          className={cn(
                            "text-sm font-medium cursor-pointer hover:underline", 
                            getUsernameColor(msg)
                          )}
                          onClick={() => handleUserClick(msg)}
                        >
                          {msg.username}
                        </span>
                        {msg.level && (
                          <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
                            {msg.level}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(new Date(msg.created_at))}
                        </span>
                        
                        {/* Admin Controls */}
                        {user?.is_admin && msg.message_type !== 'system' && (
                          <div className="flex items-center space-x-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleModAction('view_history', msg.id, msg.user_id, msg.username)
                              }}
                              className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
                            >
                              Stats
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowModMenu(showModMenu === msg.id ? null : msg.id)
                              }}
                              className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                            >
                              Mod
                            </Button>
                            
                            {showModMenu === msg.id && (
                              <div className="absolute right-0 top-6 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-32">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleModAction('ban', msg.id, msg.user_id, msg.username)
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700"
                                  >
                                    <Ban className="h-3 w-3 mr-2" />
                                    Timeout User
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleModAction('delete', msg.id, msg.user_id, msg.username)
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete Message
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm mt-1 break-words",
                        msg.message_type === 'system' 
                          ? "text-yellow-300 font-medium" 
                          : "text-gray-200"
                      )}>
                        {msg.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={wsConnected ? "Type a message..." : "Connecting..."}
                  disabled={!wsConnected}
                  maxLength={500}
                  className="flex-1 bg-[#1a2332] border-[#2d3748] text-white placeholder-gray-400"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !wsConnected}
                  size="sm"
                  className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {newMessage.length}/500 characters
              </div>
            </div>
          </>
        )
      case 'friends':
        return <FriendsListCompact />
      case 'messages':
        return <PrivateMessages />
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: collapsed ? 0 : 400 }}
      animate={{ x: 0 }}
      exit={{ x: collapsed ? 0 : 400 }}
      className={cn(
        "fixed right-0 top-0 h-full bg-[#0f1419] border-l border-[#1a2332] z-[60] flex flex-col shadow-2xl",
        collapsed ? "w-16" : "w-80",
        isMobile ? "w-full" : ""
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-[#00d4ff]" />
            <h3 className="text-lg font-semibold text-white">Social</h3>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Users className="h-3 w-3" />
              <span>{onlineCount}</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          {collapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-shrink-0 flex items-center space-x-1 px-3 py-2 ${
                  activeTab === tab.id 
                    ? 'bg-[#00d4ff] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs">{tab.name}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderTabContent()}
          </div>
        </>
      )}

      {/* Collapsed State */}
      {collapsed && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-400 hover:text-white relative group"
          >
            <Maximize2 className="h-4 w-4" />

            {/* Tooltip for maximize button */}
            <div className="absolute left-full ml-3 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
              <div className="font-medium">Expand Chat</div>
            </div>
          </Button>
          <div className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveTab(tab.id as TabType)
                  onToggle()
                }}
                className="text-gray-400 hover:text-white relative group"
              >
                <tab.icon className="h-4 w-4" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-3 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                  <div className="font-medium">{tab.name}</div>
                  {tab.badge && tab.badge > 0 && (
                    <div className="text-red-400 text-xs mt-1">
                      {tab.badge} {tab.id === 'chat' ? 'online' : tab.id === 'messages' ? 'unread' : 'new'}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showUserProfile && selectedUser && user && (
          <UserProfileModal
            isOpen={showUserProfile}
            user={selectedUser}
            currentUser={user}
            chatService={null}
            onClose={() => {
              setShowUserProfile(false)
              setSelectedUser(null)
            }}
          />
        )}
        
        {showBanModal && banTarget && (
          <BanModal
            isOpen={showBanModal}
            targetUser={banTarget}
            onClose={() => {
              setShowBanModal(false)
              setBanTarget(null)
            }}
            onBan={(duration, reason) => {
              // Handle ban logic here
              console.log('Ban user:', banTarget.username, 'for', duration, 'reason:', reason)
              setTimeoutNotification({ message: `User ${banTarget.username} has been timed out for ${duration}`, type: 'timeout' })
              setTimeout(() => setTimeoutNotification(null), 5000)
              setShowBanModal(false)
              setBanTarget(null)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ChatSidebar