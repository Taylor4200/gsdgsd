'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home,
  Dice1,
  Coins,
  TrendingUp,
  Star,
  Gift,
  Trophy,
  Users,
  Settings,
  HelpCircle,
  Gamepad2,
  Zap,
  Target,
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Award,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  isMobile?: boolean
  onOpenFriends?: () => void
  onOpenLeaderboards?: () => void
  onOpenAchievements?: () => void
  onOpenSocialBetting?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onCollapse, 
  isMobile = false,
  onOpenFriends,
  onOpenLeaderboards,
  onOpenAchievements,
  onOpenSocialBetting
}) => {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['social']))
  
  const mainItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Dice1, label: 'Casino', href: '/casino', count: 35419 },
    { icon: TrendingUp, label: 'Live', href: '/live', count: 7783 },
    { icon: Gamepad2, label: 'Originals', href: '/originals' },
    { icon: Star, label: 'Favorites', href: '/favorites' },
    { icon: Gift, label: 'Promotions', href: '/promotions', badge: 'NEW' },
    { icon: Crown, label: 'VIP Club', href: '/vip' },
    { icon: Users, label: 'Refer', href: '/referrals', badge: 'EARN' },
    { icon: Target, label: 'Challenges', href: '/challenges' },
    { icon: Crown, label: 'Rewards', href: '/rewards' },
  ]

  const socialItems = [
    { icon: Users, label: 'Friends', onClick: onOpenFriends, badge: 'NEW' },
    { icon: Trophy, label: 'Leaderboards', onClick: onOpenLeaderboards },
    { icon: Award, label: 'Achievements', onClick: onOpenAchievements },
    { icon: Eye, label: 'Social Betting', onClick: onOpenSocialBetting },
  ]

  const bottomItems = [
    { icon: HelpCircle, label: 'Support', href: '/support' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleToggleCollapse = () => {
    if (onCollapse) {
      onCollapse(!collapsed)
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`${isMobile ? 'w-70' : ''} fixed left-0 top-0 h-full bg-[#1a2c38] border-r border-[#2d3748] z-30 flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-[#2d3748] flex items-center justify-between">
        <Link href="/" className="block">
          {collapsed ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/Logo11.png" 
                alt="EDGE Originals" 
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <img 
                src="/Logo11.png" 
                alt="EDGE Originals" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-white">EDGE</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button - Only show when expanded on desktop */}
        {!isMobile && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleCollapse}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-2">
          {/* Main Items */}
          {mainItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <motion.a
                key={item.label}
                href={item.href}
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 relative group',
                  isActive 
                    ? 'text-[#00d4ff] bg-[#00d4ff]/10 border-r-2 border-[#00d4ff]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                
                {!collapsed && (
                  <>
                    <span className="ml-3 truncate">{item.label}</span>
                    
                    {item.count && (
                      <span className="ml-auto text-xs text-green-400 font-medium">
                        {item.count.toLocaleString()}
                      </span>
                    )}
                    
                    {item.badge && (
                      <span className={`ml-auto text-xs px-2 py-1 rounded-full font-bold ${
                        item.badge === 'EARN' 
                          ? 'bg-green-500 text-black' 
                          : 'bg-[#00d4ff] text-black'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Enhanced Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                    <div className="font-medium">{item.label}</div>
                    {item.count && (
                      <div className="text-green-400 text-xs mt-1">
                        {item.count.toLocaleString()} games
                      </div>
                    )}
                    {item.badge && (
                      <div className={`text-xs mt-1 px-1 py-0.5 rounded ${
                        item.badge === 'EARN' 
                          ? 'bg-green-500 text-black' 
                          : 'bg-[#00d4ff] text-black'
                      }`}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                )}
              </motion.a>
            )
          })}

          {/* Collapsed state - show all items flat */}
          {collapsed && (
            <>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Items */}
      <div className="border-t border-[#2d3748] py-4">
        <nav className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <motion.a
                key={item.label}
                href={item.href}
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 relative group',
                  isActive 
                    ? 'text-[#00d4ff] bg-[#00d4ff]/10 border-r-2 border-[#00d4ff]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                
                {!collapsed && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}

                {/* Enhanced Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                    {item.label}
                  </div>
                )}
              </motion.a>
            )
          })}
        </nav>
      </div>

      {/* Social Section - Moved to Bottom */}
      {!collapsed && (
        <div className="border-t border-[#2d3748] py-4">
          <button
            onClick={() => toggleSection('social')}
            className="flex items-center w-full px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            Social
            <ChevronDown className={cn(
              "h-4 w-4 ml-auto transition-transform duration-200",
              expandedSections.has('social') ? 'rotate-180' : ''
            )} />
          </button>
          
          <AnimatePresence>
            {expandedSections.has('social') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1">
                  {socialItems.map((item) => {
                    return (
                      <motion.button
                        key={item.label}
                        onClick={item.onClick}
                        whileHover={{ x: 4 }}
                        className={cn(
                          'flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 relative group w-full text-left',
                          'text-gray-300 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="ml-3 truncate">{item.label}</span>
                        
                        {item.badge && (
                          <span className={`ml-auto text-xs px-2 py-1 rounded-full font-bold ${
                            item.badge === 'EARN' 
                              ? 'bg-green-500 text-black' 
                              : 'bg-[#00d4ff] text-black'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Collapsed state - show social items flat */}
      {collapsed && (
        <div className="border-t border-[#2d3748] py-4">
          {socialItems.map((item) => {
            return (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                whileHover={{ x: 0 }}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 relative group w-full text-left',
                  'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                
                {/* Enhanced Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                  <div className="font-medium">{item.label}</div>
                  {item.badge && (
                    <div className={`text-xs mt-1 px-1 py-0.5 rounded ${
                      item.badge === 'EARN' 
                        ? 'bg-green-500 text-black' 
                        : 'bg-[#00d4ff] text-black'
                    }`}>
                      {item.badge}
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default Sidebar
