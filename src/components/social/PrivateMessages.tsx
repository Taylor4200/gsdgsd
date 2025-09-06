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
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
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

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-[#00d4ff]" />
              Messages
              {unreadMessages > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadMessages}
                </span>
              )}
            </h3>
          </div>
          
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="bg-[#1a2c38] border-[#2d3748]"
          />
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations</p>
              <p className="text-sm">Start chatting with friends!</p>
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-[#1a2c38]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {currentConversation.other_user_profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a2c38] ${
                      currentConversation.other_user_profile.is_online ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-medium">
                        {currentConversation.other_user_profile.username}
                      </h4>
                      {currentConversation.other_user_profile.vip_tier && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      Level {currentConversation.other_user_profile.level} • 
                      {currentConversation.other_user_profile.is_online ? ' Online' : ' Offline'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
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
            <div className="p-4 border-t border-white/10 bg-[#1a2c38]">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || isSending}
                  className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
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

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-[#00d4ff]/20 border border-[#00d4ff]/50' 
          : 'bg-[#1a2c38] hover:bg-[#2a3c48] border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a2c38] ${
            profile.is_online ? 'bg-green-500' : 'bg-gray-500'
          }`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium truncate">
              {profile.username}
            </h4>
            {conversation.unread_count > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {conversation.unread_count}
              </span>
            )}
          </div>
          
          {lastMessage && (
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-400 truncate">
                {lastMessage.content}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
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
      <div className={`max-w-[70%] p-3 rounded-lg ${
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
