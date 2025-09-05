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
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn, formatTime } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { ChatService } from '@/lib/chatService'
import type { ChatMessage } from '@/lib/chatService'
import UserProfileModal from '@/components/chat/UserProfileModal'

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
  const chatServiceRef = useRef<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)

  // Initialize chat service when user is available
  useEffect(() => {
    if (user && user.id) {
      const chatService = ChatService.getInstance()
      chatServiceRef.current = chatService

      // Set up message callback
      chatService.subscribeToMessages((message: ChatMessage) => {
        setMessages(prev => [...prev, message])
      })

      // Update presence
      chatService.updatePresence(user.id, user.username || 'Anonymous')

      // Load recent messages
      chatService.getRecentMessages(50).then((recentMessages) => {
        setMessages(recentMessages)
        setIsConnected(true)
        setIsLoading(false)
      }).catch((err) => {
        console.error('Failed to load messages:', err)
        setError('Failed to load messages')
        setIsLoading(false)
      })

      // Get initial online count
      chatService.getOnlineUsersCount().then((count) => {
        setOnlineCount(count)
      })
    }

    return () => {
      if (chatServiceRef.current) {
        chatServiceRef.current.unsubscribeFromMessages()
        if (user?.id) {
          chatServiceRef.current.markOffline(user.id)
        }
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
    if (!newMessage.trim() || !chatServiceRef.current || !isConnected || !user) return

    const messageText = newMessage.trim()
    setNewMessage('')

    const result = await chatServiceRef.current.sendMessage(
      messageText, 
      user.username || 'Anonymous', 
      user.id
    )
    
    if (!result) {
      setError('Failed to send message')
      // Restore message on error
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start space-x-2 group hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
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
                    </div>
                    <p className="text-sm text-gray-200 mt-1 break-words">
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
          chatService={chatServiceRef.current}
        />
      )}
    </motion.div>
  )
}

export default ChatSidebar