'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Check, 
  Gift, 
  Trophy, 
  DollarSign, 
  Star,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { formatTime } from '@/lib/utils'

interface Notification {
  id: string
  type: 'win' | 'bonus' | 'achievement' | 'system' | 'promotion'
  title: string
  message: string
  timestamp: Date
  read: boolean
  amount?: number
}

interface NotificationsDropdownProps {
  isOpen: boolean
  onToggle: () => void
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onToggle }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'win',
      title: 'Big Win!',
      message: 'You won $2,450 on Sweet Bonanza!',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      amount: 2450
    },
    {
      id: '2',
      type: 'bonus',
      title: 'Bonus Credited',
      message: 'Your daily bonus of $50 has been added to your account.',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      amount: 50
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You\'ve unlocked the "High Roller" badge!',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Weekend Special',
      message: 'Get 50% bonus on all deposits this weekend!',
      timestamp: new Date(Date.now() - 86400000),
      read: true
    },
    {
      id: '5',
      type: 'system',
      title: 'Maintenance Complete',
      message: 'Scheduled maintenance has been completed. All systems are operational.',
      timestamp: new Date(Date.now() - 172800000),
      read: true
    }
  ])

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <Trophy className="h-5 w-5 text-green-500" />
      case 'bonus':
        return <Gift className="h-5 w-5 text-purple-500" />
      case 'achievement':
        return <Star className="h-5 w-5 text-yellow-500" />
      case 'promotion':
        return <DollarSign className="h-5 w-5 text-blue-500" />
      case 'system':
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={onToggle} />
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="relative p-3"
        >
          <Bell className="h-7 w-7" />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-xs text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <Card variant="glass" className="border-[#2d3748] shadow-xl">
                {/* Header */}
                <div className="p-4 border-b border-[#2d3748]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs text-[#00d4ff] hover:text-[#00d4ff]/80"
                        >
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${
                            !notification.read ? 'bg-[#00d4ff]/5 border-l-2 border-[#00d4ff]' : ''
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read ? 'text-white' : 'text-gray-300'
                                }`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-400">
                                    {formatTime(notification.timestamp)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(notification.id)
                                    }}
                                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-400 mb-2">
                                {notification.message}
                              </p>
                              
                              {notification.amount && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">Amount:</span>
                                  <span className="text-sm font-bold text-green-400">
                                    ${notification.amount.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              
                              {!notification.read && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <Check className="h-3 w-3 text-[#00d4ff]" />
                                  <span className="text-xs text-[#00d4ff]">Click to mark as read</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                      <p className="text-gray-400 text-sm">
                        You're all caught up! Check back later for new updates.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[#2d3748] text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#00d4ff] hover:text-[#00d4ff]/80 text-xs"
                  >
                    View All Notifications
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default NotificationsDropdown
