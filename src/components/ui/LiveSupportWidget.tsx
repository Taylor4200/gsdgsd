'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Headphones, 
  X, 
  MessageCircle, 
  HelpCircle, 
  Megaphone, 
  Home, 
  Star,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  ChevronRight,
  Send,
  User,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'

interface LiveSupportWidgetProps {
  // No props needed - controlled by user store
}

interface Message {
  id: string
  agent: string
  message: string
  time: string
  type: 'rating' | 'support' | 'update'
  read: boolean
}

interface NewsItem {
  id: string
  title: string
  content: string
  date: string
  type: 'update' | 'announcement' | 'promotion'
  important: boolean
}

const LiveSupportWidget: React.FC<LiveSupportWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [previousTab, setPreviousTab] = useState('home')
  const { user, showLiveSupport, hideLiveSupportWidget } = useUserStore()

  // Show the widget when triggered from the user store
  useEffect(() => {
    if (showLiveSupport) {
      // Don't automatically open the widget, just show the floating button
      // The widget will open when user clicks the floating button
    }
  }, [showLiveSupport])

  // Mock data for messages
  const messages: Message[] = [
    {
      id: '1',
      agent: 'Nikola',
      message: 'Rate your conversation',
      time: '2d ago',
      type: 'rating',
      read: false
    },
    {
      id: '2',
      agent: 'Sarah',
      message: 'Your withdrawal has been processed',
      time: '1d ago',
      type: 'support',
      read: true
    },
    {
      id: '3',
      agent: 'Mike',
      message: 'Welcome to our VIP program!',
      time: '3d ago',
      type: 'update',
      read: true
    }
  ]

  // Mock data for news
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'New VIP Telegram Channel',
      content: 'Join our exclusive VIP channel for special bonuses and early access to new games!',
      date: '2 hours ago',
      type: 'update',
      important: true
    },
    {
      id: '2',
      title: 'Weekly Tournament Winners',
      content: 'Congratulations to this week\'s tournament champions! Check out the leaderboard.',
      date: '1 day ago',
      type: 'announcement',
      important: false
    },
    {
      id: '3',
      title: '50% Bonus on Deposits',
      content: 'Limited time offer! Get 50% bonus on all deposits this weekend.',
      date: '3 days ago',
      type: 'promotion',
      important: true
    }
  ]

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'news', label: 'News', icon: Megaphone }
  ]

  const helpTopics = [
    {
      title: 'Account & Security',
      icon: User,
      items: ['Password Reset', 'Two-Factor Authentication', 'Account Verification']
    },
    {
      title: 'Deposits & Withdrawals',
      icon: Settings,
      items: ['Payment Methods', 'Processing Times', 'Fees & Limits']
    },
    {
      title: 'Games & Bonuses',
      icon: Star,
      items: ['Game Rules', 'Bonus Terms', 'Wagering Requirements']
    },
    {
      title: 'Technical Support',
      icon: HelpCircle,
      items: ['Browser Issues', 'Mobile App', 'Performance Problems']
    }
  ]

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', chatMessage)
      setChatMessage('')
      setShowChat(false)
      setActiveTab(previousTab) // Return to the previous tab
    }
  }

  const handleRateConversation = (messageId: string) => {
    // Handle rating logic
    console.log('Rating conversation:', messageId)
  }

  const handleNewsItemClick = (newsId: string) => {
    // Handle news item click
    console.log('Opening news item:', newsId)
  }

  const handleHelpItemClick = (topic: string, item: string) => {
    // Handle help item click
    console.log('Help requested:', topic, item)
  }

  const handleStartChat = () => {
    setPreviousTab(activeTab) // Store current tab before going to chat
    setShowChat(true)
  }

  const handleBackFromChat = () => {
    setShowChat(false)
    setActiveTab(previousTab) // Return to the previous tab
  }

  const renderHomeContent = () => (
    <div className="p-4 space-y-3">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          onClick={handleStartChat}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
        >
          <Phone className="h-4 w-4" />
          <span>Live Chat</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center space-x-2 text-sm py-2"
        >
          <Mail className="h-4 w-4" />
          <span>Email Support</span>
        </Button>
      </div>

      {/* Recent Messages */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Recent Messages</h4>
        {messages.slice(0, 2).map((message) => (
          <div
            key={message.id}
            onClick={() => handleRateConversation(message.id)}
            className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'rating' ? 'bg-blue-500' : 
                  message.type === 'support' ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  <span className="text-white text-xs font-bold">
                    {message.agent.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{message.message}</p>
                  <p className="text-xs text-gray-500">{message.agent} • {message.time}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Latest News */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Latest Updates</h4>
        {newsItems.slice(0, 1).map((news) => (
          <div
            key={news.id}
            onClick={() => handleNewsItemClick(news.id)}
            className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      {news.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{news.title}</p>
                  <p className="text-xs text-gray-500">{news.date}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMessagesContent = () => (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">All Messages</h4>
        <Button
          onClick={handleStartChat}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          New Chat
        </Button>
      </div>
      
      {messages.map((message) => (
        <div
          key={message.id}
          onClick={() => handleRateConversation(message.id)}
          className={`bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
            !message.read ? 'border-l-4 border-blue-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'rating' ? 'bg-blue-500' : 
                message.type === 'support' ? 'bg-green-500' : 'bg-purple-500'
              }`}>
                <span className="text-white text-xs font-bold">
                  {message.agent.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{message.message}</p>
                <p className="text-xs text-gray-500">{message.agent} • {message.time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!message.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderHelpContent = () => (
    <div className="p-4 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">How can we help?</h4>
      
      {helpTopics.map((topic, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center space-x-2">
            <topic.icon className="h-4 w-4 text-blue-600" />
            <h5 className="text-sm font-medium text-gray-800">{topic.title}</h5>
          </div>
          <div className="ml-6 space-y-1">
            {topic.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={() => handleHelpItemClick(topic.title, item)}
                className="block text-xs text-gray-600 hover:text-blue-600 transition-colors text-left w-full"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={handleStartChat}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Phone className="h-4 w-4 mr-1" />
            Live Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
        </div>
      </div>
    </div>
  )

  const renderNewsContent = () => (
    <div className="p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">Latest News & Updates</h4>
      
      {newsItems.map((news) => (
        <div
          key={news.id}
          onClick={() => handleNewsItemClick(news.id)}
          className={`bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
            news.important ? 'border-l-4 border-red-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                news.type === 'update' ? 'bg-blue-600' : 
                news.type === 'announcement' ? 'bg-green-600' : 'bg-orange-600'
              }`}>
                {news.type === 'update' && <CheckCircle className="w-4 h-4 text-white" />}
                {news.type === 'announcement' && <Megaphone className="w-4 h-4 text-white" />}
                {news.type === 'promotion' && <Star className="w-4 h-4 text-white" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    news.type === 'update' ? 'bg-blue-200 text-blue-800' :
                    news.type === 'announcement' ? 'bg-green-200 text-green-800' :
                    'bg-orange-200 text-orange-800'
                  }`}>
                    {news.type}
                  </span>
                  {news.important && (
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                      Important
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">{news.title}</p>
                <p className="text-xs text-gray-500">{news.content}</p>
                <p className="text-xs text-gray-400">{news.date}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  )

  const renderChatInterface = () => (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">Live Chat</h4>
        <Button
          onClick={handleBackFromChat}
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs">Back</span>
        </Button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 min-h-[200px] flex flex-col">
        <div className="flex-1 space-y-2">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">S</span>
            </div>
            <div className="bg-white rounded-lg p-2 max-w-[80%]">
              <p className="text-xs text-gray-800">Hi! I'm Sarah, how can I help you today?</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-3">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (showChat) {
      return renderChatInterface()
    }
    
    switch (activeTab) {
      case 'home':
        return renderHomeContent()
      case 'messages':
        return renderMessagesContent()
      case 'help':
        return renderHelpContent()
      case 'news':
        return renderNewsContent()
      default:
        return renderHomeContent()
    }
  }

    return (
    <>
             {/* Floating Support Button - Only show when triggered from dropdown */}
       {showLiveSupport && (
         <motion.div
           className="fixed bottom-6 right-6 z-50 transition-all duration-300"
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
         >
           <div className="relative">
             <Button
               onClick={() => setIsOpen(true)}
               className="w-14 h-14 rounded-full bg-[#1a2c38] border-2 border-[#00d4ff] hover:bg-[#00d4ff]/10 hover:shadow-[#00d4ff]/30 transition-all duration-200 group"
             >
               <Headphones className="h-6 w-6 text-[#00d4ff] group-hover:scale-110 transition-transform" />
             </Button>
             {/* Small close button to hide the floating button */}
             <button
               onClick={() => hideLiveSupportWidget()}
               className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors"
             >
               ×
             </button>
           </div>
         </motion.div>
       )}

      {/* Support Widget Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl w-80 max-h-[600px] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/Logo11.png" 
                    alt="EDGE Casino" 
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-white font-bold text-lg">EDGE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white"></div>
                    ))}
                  </div>
                                     <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => {
                       setIsOpen(false)
                       setShowChat(false)
                       setActiveTab('home')
                       setPreviousTab('home')
                       // Don't hide the floating button - just close the widget
                     }}
                     className="text-white hover:bg-white/10"
                   >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-white">
                <h3 className="text-lg font-semibold">
                  Hey {user?.username || 'there'} 👋
                </h3>
                <p className="text-sm opacity-90">
                  {showChat ? 'Live chat with support' : 'How can we help?'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[400px]">
              {renderContent()}
            </div>

            {/* Bottom Navigation */}
            {!showChat && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center py-3 px-2 text-xs transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mb-1" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LiveSupportWidget
