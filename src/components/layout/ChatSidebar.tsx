'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle,
  Send,
  Smile,
  Gift,
  Crown,
  X,
  Minimize2,
  Maximize2,
  Users,
  Settings,
  Shield,
  Star,
  Zap,
  MoreVertical,
  Ban,
  Trash2,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn, formatTime } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import type { ChatMessage } from '@/lib/chatService'
import UserProfileModal from '@/components/chat/UserProfileModal'
import BanModal from '@/components/modals/BanModal'

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  collapsed?: boolean
  onShowUserStats?: (user: any) => void
  isMobile?: boolean
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle, collapsed = false, onShowUserStats, isMobile = false }) => {
  const { user } = useUserStore()
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

      // Set up polling for new messages (since we removed real-time)
      const pollInterval = setInterval(() => {
        fetch('/api/chat-new')
          .then(res => res.json())
          .then(data => {
            if (data.messages && data.messages.length > messages.length) {
              setMessages(data.messages)
            }
          })
          .catch(err => console.error('Polling error:', err))
      }, 3000) // Poll every 3 seconds

      return () => {
        clearInterval(pollInterval)
      }
    }
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected || !user) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      const response = await fetch('/api/chat-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText, 
          userId: user.id, 
          username: user.username || 'Anonymous' 
        })
      })

      const result = await response.json()
      
      if (!response.ok || result.error) {
        setError('Failed to send message')
        setNewMessage(messageText) // Restore message on error
      } else if (result.message) {
        // Add the new message to the list immediately
        setMessages(prev => [...prev, result.message])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
      setNewMessage(messageText) // Restore message on error
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
          // Open ban modal instead of immediate ban
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
        // Refresh messages to show updated status
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

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: collapsed ? 0 : 400 }}
      animate={{ x: 0 }}
      exit={{ x: collapsed ? 0 : 400 }}
      className={cn(
        "fixed right-0 top-0 h-full bg-[#1a2c38] border-l border-gray-700 z-40 flex flex-col",
        collapsed ? "w-16" : "w-80",
        isMobile ? "w-full" : ""
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-[#00d4ff]" />
            <h3 className="text-lg font-semibold text-white">Chat</h3>
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
          {/* Connection Status */}
          <div className="px-4 py-2 border-b border-gray-700">
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
            {isConnected && !error && (
              <div className="text-xs text-green-400 flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span>Connected</span>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex items-start space-x-2 group p-2 rounded-lg transition-colors",
                    msg.message_type === 'system' 
                      ? "bg-yellow-500/10 border border-yellow-500/20" 
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
                          {/* Stats Button */}
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
                          
                          {/* Mod Controls Button */}
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
                          
                          {/* Mod Menu */}
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
                      
                      {/* Mod Controls (for mods only, not admins) */}
                      {user?.is_mod && !user?.is_admin && msg.message_type !== 'system' && (
                        <div className="relative ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowModMenu(showModMenu === msg.id ? null : msg.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <MoreVertical className="h-3 w-3 text-gray-400" />
                          </Button>
                          {showModMenu === msg.id && (
                            <div className="absolute right-0 top-6 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-32">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleModAction('view_history', msg.id, msg.user_id, msg.username)
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  View History
                                </button>
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
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
                maxLength={500}
                className="flex-1 bg-[#2d3748] border-[#374151] text-white placeholder-gray-400"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
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
      )}

      {/* Collapsed State */}
      {collapsed && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Users className="h-3 w-3" />
            <span>{onlineCount}</span>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && user && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={() => {
            setShowUserProfile(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          currentUser={user}
          chatService={null}
        />
      )}

      {/* Ban Modal */}
      {showBanModal && banTarget && (
        <BanModal
          isOpen={showBanModal}
          onClose={() => {
            setShowBanModal(false)
            setBanTarget(null)
          }}
          targetUser={banTarget}
          onBan={async (duration: string, reason: string) => {
            try {
              const response = await fetch('/api/admin/users-new', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  userId: banTarget.userId, 
                  role: 'is_banned', 
                  value: true,
                  banDuration: duration,
                  banReason: reason
                })
              })
              
              if (response.ok) {
                // Show timeout notification
                const durationText = duration === 'permanent' ? 'permanently' : `for ${duration}`
                const timeoutMessage = `${user?.username} timed out ${banTarget.username} ${durationText} for: ${reason}`
                setTimeoutNotification({ message: timeoutMessage, type: 'timeout' })
                
                // Auto-hide notification after 5 seconds
                setTimeout(() => {
                  setTimeoutNotification(null)
                }, 5000)
                
                setShowBanModal(false)
                setBanTarget(null)
                // Refresh messages
                const messagesResponse = await fetch('/api/chat-new')
                const data = await messagesResponse.json()
                if (data.messages) {
                  setMessages(data.messages)
                }
              }
            } catch (error) {
              console.error('Timeout failed:', error)
            }
          }}
        />
      )}
    </motion.div>
  )
}

export default ChatSidebar