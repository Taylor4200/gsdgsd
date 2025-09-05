'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  History, 
  TrendingUp,
  MessageCircle,
  Crown,
  Wallet,
  Gift
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { formatCurrency, calculateLevel } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'
import VaultModal from '@/components/modals/VaultModal'
import RewardsModal from '@/components/modals/RewardsModal'
import LiveSupportModal from '@/components/modals/LiveSupportModal'
import { useRouter } from 'next/navigation'

interface UserDropdownProps {
  isOpen: boolean
  onToggle: () => void
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useUserStore()
  const { setMyBetsModal } = useUIStore()
  const [activeModal, setActiveModal] = useState<'vault' | 'rakeback' | 'support' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  const menuItems = [
    {
      id: 'vault',
      label: 'Vault',
      icon: Shield,
      description: 'Secure storage for your funds',
      onClick: () => setActiveModal('vault')
    },
    {
      id: 'history',
      label: 'Bet History',
      icon: History,
      description: 'View your betting activity',
      onClick: () => setMyBetsModal(true)
    },
            {
          id: 'rakeback',
          label: 'Rewards',
          icon: Gift,
          description: 'Daily rewards & rakeback',
          onClick: () => setActiveModal('rakeback')
        },
    {
      id: 'support',
      label: 'Live Support',
      icon: MessageCircle,
      description: 'Get help from our team',
      onClick: () => setActiveModal('support')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account preferences',
      onClick: () => {
        router.push('/settings')
        onToggle() // Close dropdown
      }
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      description: 'Sign out of your account',
      onClick: async () => {
        await logout()
        onToggle() // Close dropdown
      }
    }
  ]

  const closeModal = () => {
    setActiveModal(null)
  }

  if (!user) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={onToggle} />
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* User Avatar/Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={onToggle}
          className="flex items-center space-x-2 bg-[#1a2c38] rounded-lg px-3 py-2 border border-[#2d3748] cursor-pointer hover:bg-[#2d3748] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
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
          <div className="text-sm">
            <div className="text-white font-medium">{user.username}</div>
            <div className="text-xs text-gray-400">Level {calculateLevel(user.experience)}</div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50"
            >
              <Card variant="glass" className="border-[#2d3748] shadow-xl overflow-hidden">
                {/* User Info Header */}
                <div className="p-4 bg-gradient-to-r from-[#00d4ff]/10 to-[#7c3aed]/10 border-b border-[#2d3748]">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{user.username}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Level {calculateLevel(user.experience)}</span>
                        <span>•</span>
                        <span>Silver VIP</span>
                      </div>
                    </div>
                  </div>

                                     {/* Quick Stats */}
                   <div className="grid grid-cols-3 gap-3 text-center">
                     <div className="bg-black/20 rounded-lg p-2">
                       <div className="text-xs text-gray-400">SC Balance</div>
                       <div className="text-sm font-bold text-[#00d4ff]">
                         {formatCurrency(user.balance, 'USD')}
                       </div>
                     </div>
                     <div className="bg-black/20 rounded-lg p-2">
                       <div className="text-xs text-gray-400">GC Balance</div>
                       <div className="text-sm font-bold text-purple-400">
                         {user.gcBalance || 0} GC
                       </div>
                     </div>
                     <div className="bg-black/20 rounded-lg p-2">
                       <div className="text-xs text-gray-400">Wagered</div>
                       <div className="text-sm font-bold text-green-400">
                         {formatCurrency(user.totalWagered, 'USD')}
                       </div>
                     </div>
                   </div>

                  {/* Referral Code */}
                  <div className="mt-3 p-2 bg-black/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Referral Code</div>
                        <div className="text-sm font-mono text-white">NEXUS{user.id.slice(-4)}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-[#00d4ff]">
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={item.onClick}
                        className="w-full justify-start p-3 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <item.icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-sm font-medium text-white truncate">{item.label}</div>
                            <div className="text-xs text-gray-400 leading-tight">{item.description}</div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[#2d3748] text-center">
                  <div className="text-xs text-gray-400">
                    Account ID: {user.id}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

            {/* Modals */}
      <VaultModal isOpen={activeModal === 'vault'} onClose={closeModal} />
      <RewardsModal isOpen={activeModal === 'rakeback'} onClose={closeModal} />
      <LiveSupportModal isOpen={activeModal === 'support'} onClose={closeModal} />
    </>
  )
}

export default UserDropdown
