'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  User, 
  Settings, 
  Menu, 
  X, 
  Trophy, 
  Gift,
  MessageCircle,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'

const Header: React.FC = () => {
  const { user, isAuthenticated } = useUserStore()
  const { 
    setAuthModal, 
    setWalletModal, 
    setSettingsModal,
    showChat,
    setShowChat,
    notifications 
  } = useUIStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Games', href: '/games' },
    { name: 'Pack Draws', href: '/pack-draws' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Tournaments', href: '/tournaments' },
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 w-full glass backdrop-blur-xl border-b border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-bold font-futuristic neon-text-blue">
              NEXUS
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-neon-blue transition-colors duration-200 font-medium"
                whileHover={{ y: -2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Balance Display */}
                <div className="hidden sm:flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass px-3 py-1 rounded-lg"
                  >
                    <div className="text-xs text-gray-400">Coins</div>
                    <div className="text-sm font-bold text-neon-blue">
                      {formatCurrency(user.balance, 'coins')}
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="glass px-3 py-1 rounded-lg"
                  >
                    <div className="text-xs text-gray-400">SC</div>
                    <div className="text-sm font-bold text-neon-purple">
                      {formatCurrency(user.sweepstakesCoins, 'sweepstakes_coins')}
                    </div>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {notifications.length}
                        </span>
                      </div>
                    )}
                  </Button>

                  {/* Chat Toggle */}
                  <Button
                    variant={showChat ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>

                  {/* Wallet */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWalletModal(true)}
                    icon={<Wallet className="h-4 w-4" />}
                    className="hidden sm:flex"
                  >
                    Wallet
                  </Button>

                  {/* User Menu */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSettingsModal(true)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setAuthModal(true)}
                >
                  Sign In
                </Button>
                <Button
                  variant="neon"
                  onClick={() => setAuthModal(true)}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 py-4"
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-neon-blue transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              {isAuthenticated && user && (
                <>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="glass px-3 py-2 rounded-lg flex-1 mr-2">
                        <div className="text-xs text-gray-400">Coins</div>
                        <div className="text-sm font-bold text-neon-blue">
                          {formatCurrency(user.balance, 'coins')}
                        </div>
                      </div>
                      <div className="glass px-3 py-2 rounded-lg flex-1 ml-2">
                        <div className="text-xs text-gray-400">SC</div>
                        <div className="text-sm font-bold text-neon-purple">
                          {formatCurrency(user.sweepstakesCoins, 'sweepstakes_coins')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mb-2"
                      onClick={() => {
                        setWalletModal(true)
                        setMobileMenuOpen(false)
                      }}
                      icon={<Wallet className="h-4 w-4" />}
                    >
                      Wallet
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

export default Header
