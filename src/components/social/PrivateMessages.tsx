'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical,
  Crown,
  Clock,
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  Gamepad2,
  TrendingUp,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/store/userStore'
import { Conversation, PrivateMessage } from '@/types/social'
import { formatTime } from '@/lib/utils'

interface PrivateMessagesProps {
  onSelectConversation?: (conversation: Conversation) => void
}

const PrivateMessages: React.FC<PrivateMessagesProps> = ({ onSelectConversation }) => {
  const { conversations, privateMessages, unreadMessages, sendPrivateMessage, markConversationAsRead } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_profile.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentConversation = conversations.find(conv => conv.id === selectedConversation)
  const currentMessages = privateMessages.filter(msg => 
    (msg.sender_id === currentConversation?.user_id && msg.recipient_id === currentConversation?.other_user_id) ||
    (msg.sender_id === currentConversation?.other_user_id && msg.recipient_id === currentConversation?.user_id)
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !currentConversation || isSending) return

    setIsSending(true)
    const result = await sendPrivateMessage(currentConversation.other_user_id, messageContent.trim())
    
    if (result.success) {
      setMessageContent('')
    }
    
    setIsSending(false)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id)
    onSelectConversation?.(conversation)
    
    // Mark as read if there are unread messages
    if (conversation.unread_count > 0) {
      markConversationAsRead(conversation.id)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Social action handlers
  const handleSendWatchRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/watch-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          targetId: userId,
          userId: useUserStore.getState().user?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Watch request sent:', data.message)
        // You could show a toast notification here
      } else {
        const error = await response.json()
        console.error('Failed to send watch request:', error.error)
      }
    } catch (error) {
      console.error('Error sending watch request:', error)
    }
  }

  const handleFollowBets = (userId: string) => {
    // This would integrate with the betting system to follow their bets
    console.log('Following bets for user:', userId)
    // You could show a modal or navigate to betting interface
  }

  const handleViewProfile = (profile: any) => {
    // This would open the user profile modal
    console.log('Viewing profile for:', profile.username)
    // You could trigger a profile modal or navigate to profile page
  }

  // If a conversation is selected, show the chat view
  if (selectedConversation && currentConversation) {
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="p-3 border-b border-white/10 bg-[#1a2c38]">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {currentConversation.other_user_profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-[#1a2c38] ${
                currentConversation.other_user_profile.is_online ? 'bg-green-500' : 'bg-gray-500'
              }`} />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <h4 className="text-white font-medium text-sm truncate">
                  {currentConversation.other_user_profile.username}
                </h4>
                {currentConversation.other_user_profile.vip_tier && (
                  <Crown className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-400">
                Level {currentConversation.other_user_profile.level} • 
                {currentConversation.other_user_profile.is_online ? ' Online' : ' Offline'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
                title="Send Watch Request"
                onClick={() => handleSendWatchRequest(currentConversation.other_user_id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-green-400/10"
                title="Follow Their Bets"
                onClick={() => handleFollowBets(currentConversation.other_user_id)}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10"
                title="View Profile"
                onClick={() => handleViewProfile(currentConversation.other_user_profile)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 space-y-2 overflow-hidden">
          {currentMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          ) : (
            currentMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentConversation.user_id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 border-t border-white/10 bg-[#1a2c38]">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-[#1a2332] border-[#2d3748] text-white placeholder-gray-400 text-sm"
              disabled={isSending}
              maxLength={500}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || isSending}
              size="sm"
              className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {messageContent.length}/500 characters
          </div>
        </div>
      </div>
    )
  }

  // Default view - conversations list
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <MessageCircle className="h-4 w-4 mr-2 text-[#00d4ff]" />
            Messages
            {unreadMessages > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadMessages}
              </span>
            )}
          </h3>
        </div>
        
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-3 w-3" />}
          className="bg-[#1a2332] border-[#2d3748] text-sm"
        />
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations</p>
            <p className="text-xs">Start chatting with friends!</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConversationCardProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, isSelected, onClick }) => {
  const profile = conversation.other_user_profile
  const lastMessage = conversation.last_message

  const handleQuickAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    
    switch (action) {
      case 'watch':
        // Send watch request
        console.log('Send watch request to:', profile.username)
        break
      case 'message':
        onClick()
        break
      case 'profile':
        console.log('View profile:', profile.username)
        break
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-2 rounded-lg cursor-pointer transition-all duration-200 group ${
        isSelected 
          ? 'bg-[#00d4ff]/20 border border-[#00d4ff]/50' 
          : 'bg-[#1a2c38] hover:bg-[#2a3c48] border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        {/* Avatar */}
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-[#1a2c38] ${
            profile.is_online ? 'bg-green-500' : 'bg-gray-500'
          }`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium text-sm truncate">
              {profile.username}
            </h4>
            <div className="flex items-center space-x-1">
              {conversation.unread_count > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {conversation.unread_count}
                </span>
              )}
              {/* Quick Actions - only show on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-[#00d4ff]"
                  onClick={(e) => handleQuickAction(e, 'watch')}
                  title="Send Watch Request"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-green-400"
                  onClick={(e) => handleQuickAction(e, 'profile')}
                  title="View Profile"
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {lastMessage && (
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-gray-400 truncate">
                {lastMessage.content}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500 ml-2">
                {lastMessage.is_read ? (
                  <CheckCheck className="h-3 w-3 text-blue-400" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                <span>{formatTime(lastMessage.created_at)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface MessageBubbleProps {
  message: PrivateMessage
  isOwn: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] p-2 rounded-lg ${
        isOwn 
          ? 'bg-[#00d4ff] text-black' 
          : 'bg-[#2a3c48] text-white'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-end mt-1 text-xs ${
          isOwn ? 'text-black/70' : 'text-gray-400'
        }`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwn && (
            <div className="ml-1">
              {message.is_read ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PrivateMessages
