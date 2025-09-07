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
  Eye,
  Menu,
  X
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  
  const mainItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Dice1, label: 'Casino', href: '/casino', count: 35419, hasSubmenu: true },
    { icon: TrendingUp, label: 'Live', href: '/live', count: 7783 },
    { icon: Gamepad2, label: 'Originals', href: '/originals' },
    { icon: Star, label: 'Favorites', href: '/favorites' },
    { icon: Gift, label: 'Promotions', href: '/promotions', badge: 'NEW' },
    { icon: Crown, label: 'VIP Club', href: '/vip' },
    { icon: Users, label: 'Refer', href: '/referrals', badge: 'EARN' },
    { icon: Target, label: 'Challenges', href: '/challenges' },
    { icon: Crown, label: 'Rewards', href: '/rewards' },
  ]

  const casinoSubItems = [
    { label: 'All Games', href: '/casino', count: 35419 },
    { label: 'Slots', href: '/casino?category=slots', count: 12450 },
    { label: 'Live Casino', href: '/casino?category=live', count: 89 },
    { label: 'Table Games', href: '/casino?category=table', count: 156 },
    { label: 'Blackjack', href: '/casino?category=blackjack', count: 23 },
    { label: 'Roulette', href: '/casino?category=roulette', count: 34 },
    { label: 'Baccarat', href: '/casino?category=baccarat', count: 12 },
    { label: 'Popular', href: '/casino?category=popular', count: 89 },
    { label: 'New Games', href: '/casino?category=new', count: 45 },
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
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`${isMobile ? 'w-70' : ''} fixed left-0 top-0 h-full bg-[#0f1419] border-r border-[#1a2332] z-30 flex flex-col shadow-2xl overflow-visible`}
    >
      {/* Logo Section */}
      <div className="p-3 border-b border-[#1a2332] flex items-center justify-between">
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
            <div className="flex items-center space-x-3">
              <img 
                src="/Logo11.png" 
                alt="EDGE Originals" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-white">EDGE</span>
            </div>
          )}
        </Link>
        
        {/* Toggle Button */}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-2 overflow-visible">
        <nav className="space-y-1 overflow-visible">
          {/* Main Items */}
          {mainItems.map((item) => {
            const isActive = pathname === item.href
            const hasSubmenu = item.hasSubmenu && item.label === 'Casino'
            
            return (
              <div key={item.label}>
                <Link href={hasSubmenu ? '#' : item.href}>
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    className={cn(
                      'flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 relative group rounded-md mx-2 cursor-pointer',
                      isActive 
                        ? 'text-[#00d4ff] bg-[#00d4ff]/15 border-r-2 border-[#00d4ff] shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-[#1a2332] hover:shadow-md'
                    )}
                    onClick={hasSubmenu ? (e) => {
                      e.preventDefault()
                      toggleSection(item.label)
                    } : undefined}
                  >
                    <item.icon className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      collapsed ? "h-5 w-5" : "h-5 w-5",
                      isActive ? "text-[#00d4ff]" : "text-gray-400 group-hover:text-white"
                    )} />
                    
                    {!collapsed && (
                      <>
                        <span className="ml-3 truncate font-medium">{item.label}</span>
                        
                        {item.count && (
                          <span className="ml-auto text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-1 rounded-full">
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

                        {hasSubmenu && (
                          <ChevronDown className={cn(
                            "h-4 w-4 ml-2 transition-transform duration-200",
                            expandedSections.has(item.label) ? 'rotate-180' : ''
                          )} />
                        )}
                      </>
                    )}

                    {/* Enhanced Stake-like Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-4 py-3 bg-[#0a0a0a] backdrop-blur-md text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[9999] shadow-2xl border border-[#2a2a2a] transform translate-x-0">
                        <div className="font-semibold text-[#00d4ff]">{item.label}</div>
                        {item.count && (
                          <div className="text-green-400 text-xs mt-1 font-medium">
                            {item.count.toLocaleString()} games
                          </div>
                        )}
                        {item.badge && (
                          <div className={`text-xs mt-1 px-2 py-1 rounded-full font-bold ${
                            item.badge === 'EARN' 
                              ? 'bg-green-500 text-black' 
                              : 'bg-[#00d4ff] text-black'
                          }`}>
                            {item.badge}
                          </div>
                        )}
                        {/* Arrow pointing to sidebar */}
                        <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-transparent border-r-[#0a0a0a]"></div>
                      </div>
                    )}
                  </motion.div>
                </Link>

                {/* Casino Submenu */}
                {hasSubmenu && expandedSections.has(item.label) && !collapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-2 space-y-1"
                  >
                    {casinoSubItems.map((subItem) => (
                      <Link key={subItem.label} href={subItem.href}>
                        <motion.div
                          whileHover={{ x: 2 }}
                          className={cn(
                            "flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer",
                            pathname === subItem.href
                              ? 'text-[#00d4ff] bg-[#00d4ff]/10' 
                              : 'text-gray-400 hover:text-white hover:bg-[#1a2332]'
                          )}
                        >
                          <span className="flex-1">{subItem.label}</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-[#1a2332] text-xs rounded-full text-gray-500">
                            {subItem.count.toLocaleString()}
                          </span>
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            )
          })}

          {/* Social Section */}
          {!collapsed && (
            <div className="mt-6 mx-2">
              <button
                onClick={() => toggleSection('social')}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-all duration-200 rounded-md hover:bg-[#1a2332]"
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
                              'flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 relative group w-full text-left rounded-md',
                              'text-gray-300 hover:text-white hover:bg-[#1a2332] hover:shadow-md'
                            )}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="ml-3 truncate font-medium">{item.label}</span>
                            
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

          {/* Collapsed state - show all items flat */}
          {collapsed && (
            <>
              {socialItems.map((item) => {
                return (
                  <motion.button
                    key={item.label}
                    onClick={item.onClick}
                    whileHover={{ x: 0 }}
                    className={cn(
                      'flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 relative group w-full text-left rounded-md mx-2',
                      'text-gray-300 hover:text-white hover:bg-[#1a2332] hover:shadow-md'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    
                    {/* Enhanced Stake-like Tooltip for collapsed state */}
                    <div className="absolute left-full ml-4 px-4 py-3 bg-[#0a0a0a] backdrop-blur-md text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[9999] shadow-2xl border border-[#2a2a2a] transform translate-x-0">
                      <div className="font-semibold text-[#00d4ff]">{item.label}</div>
                      {item.badge && (
                        <div className={`text-xs mt-1 px-2 py-1 rounded-full font-bold ${
                          item.badge === 'EARN' 
                            ? 'bg-green-500 text-black' 
                            : 'bg-[#00d4ff] text-black'
                        }`}>
                          {item.badge}
                        </div>
                      )}
                      {/* Arrow pointing to sidebar */}
                      <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-transparent border-r-[#0a0a0a]"></div>
                    </div>
                  </motion.button>
                )
              })}
            </>
          )}
        </nav>
      </div>

      {/* Bottom Items */}
      <div className="border-t border-[#1a2332] py-2 overflow-visible">
        <nav className="space-y-1 overflow-visible">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.label} href={item.href}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  className={cn(
                    'flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 relative group rounded-md mx-2 cursor-pointer',
                    isActive 
                      ? 'text-[#00d4ff] bg-[#00d4ff]/15 border-r-2 border-[#00d4ff] shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-[#1a2332] hover:shadow-md'
                  )}
                >
                  <item.icon className={cn(
                    "flex-shrink-0 transition-colors duration-200",
                    "h-5 w-5",
                    isActive ? "text-[#00d4ff]" : "text-gray-400 group-hover:text-white"
                  )} />
                  
                  {!collapsed && (
                    <span className="ml-3 truncate font-medium">{item.label}</span>
                  )}

                  {/* Enhanced Stake-like Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-4 px-4 py-3 bg-[#0a0a0a] backdrop-blur-md text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[9999] shadow-2xl border border-[#2a2a2a] transform translate-x-0">
                      <div className="font-semibold text-[#00d4ff]">{item.label}</div>
                      {/* Arrow pointing to sidebar */}
                      <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-r-[8px] border-transparent border-r-[#0a0a0a]"></div>
                    </div>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>
    </motion.div>
  )
}

export default Sidebar
