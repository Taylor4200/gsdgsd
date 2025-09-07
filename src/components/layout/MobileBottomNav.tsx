'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home,
  Dice1,
  Coins,
  Trophy,
  Search,
  Star,
  Gift,
  Users,
  Settings,
  HelpCircle,
  Gamepad2,
  Zap,
  Target,
  Crown,
  Award,
  Eye,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  onOpenFriends?: () => void
  onOpenLeaderboards?: () => void
  onOpenAchievements?: () => void
  onOpenSocialBetting?: () => void
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenFriends,
  onOpenLeaderboards,
  onOpenAchievements,
  onOpenSocialBetting
}) => {
  const pathname = usePathname()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Primary navigation items (always visible) - Minimal and logical
  const primaryItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      name: 'Casino',
      href: '/casino',
      icon: Dice1,
      active: pathname === '/casino' || pathname.startsWith('/casino/game') || pathname.startsWith('/live') || pathname.startsWith('/originals'),
      count: 35419,
      hasSubmenu: true
    },
    {
      name: 'VIP',
      href: '/vip',
      icon: Crown,
      active: pathname.startsWith('/vip') || pathname.startsWith('/promotions') || pathname.startsWith('/referrals') || pathname.startsWith('/challenges'),
      hasSubmenu: true
    },
    {
      name: 'Social',
      href: '#',
      icon: Users,
      active: false,
      hasSubmenu: true
    },
    {
      name: 'Account',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings') || pathname.startsWith('/support'),
      hasSubmenu: true
    }
  ]

  // VIP submenu items - VIP-focused with rewards functionality
  const vipSubItems = [
    {
      name: 'VIP Club',
      href: '/vip',
      icon: Crown,
      active: pathname.startsWith('/vip'),
      description: 'Exclusive VIP benefits'
    },
    {
      name: 'Promotions',
      href: '/promotions',
      icon: Gift,
      active: pathname.startsWith('/promotions'),
      badge: 'NEW',
      description: 'Latest offers & bonuses'
    },
    {
      name: 'Referrals',
      href: '/referrals',
      icon: Users,
      active: pathname.startsWith('/referrals'),
      badge: 'EARN',
      description: 'Invite friends & earn'
    },
    {
      name: 'Challenges',
      href: '/challenges',
      icon: Target,
      active: pathname.startsWith('/challenges'),
      description: 'Complete challenges'
    }
  ]

  // Social items
  const socialSubItems = [
    {
      name: 'Friends',
      icon: Users,
      onClick: onOpenFriends,
      badge: 'NEW',
      description: 'Connect with friends'
    },
    {
      name: 'Leaderboards',
      icon: Trophy,
      onClick: onOpenLeaderboards,
      description: 'See top players'
    },
    {
      name: 'Achievements',
      icon: Award,
      onClick: onOpenAchievements,
      description: 'Track your progress'
    },
    {
      name: 'Social Betting',
      icon: Eye,
      onClick: onOpenSocialBetting,
      description: 'Bet with friends'
    }
  ]

  // Account items
  const accountSubItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
      description: 'Account preferences'
    },
    {
      name: 'Support',
      href: '/support',
      icon: HelpCircle,
      active: pathname.startsWith('/support'),
      description: 'Get help & support'
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: Star,
      active: pathname.startsWith('/favorites'),
      description: 'Your favorite games'
    }
  ]

  // Casino submenu items - simplified and prominent
  const casinoSubItems = [
    // Prominent sections
    { name: 'Live Casino', href: '/live', count: 7783, prominent: true },
    { name: 'Originals', href: '/originals', count: 1250, prominent: true },
    
    // Most played
    { name: 'Most Played', href: '/casino?category=popular', count: 89, section: 'Most Played' },
    
    // New releases
    { name: 'New Releases', href: '/casino?category=new', count: 45, section: 'New Releases' },
    
    // Simplified categories
    { name: 'All Games', href: '/casino', count: 35419 },
    { name: 'Slots', href: '/casino?category=slots', count: 12450 },
    { name: 'Table Games', href: '/casino?category=table', count: 156 }
  ]

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a2c38] border-t border-[#2d3748] md:hidden">
      {/* Primary Navigation */}
      <div className="flex items-center justify-around py-2">
        {primaryItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name} className="flex flex-col items-center">
              {(item as any).onClick ? (
                <button
                  onClick={(item as any).onClick}
                  className={cn(
                    "flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors",
                    item.active 
                      ? "text-blue-400 bg-blue-500/10" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {(item as any).badge && (
                      <span className={cn(
                        "absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded-full font-bold",
                        (item as any).badge === 'NEW' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                      )}>
                        {(item as any).badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                  {(item as any).count && (
                    <span className="text-xs text-green-400 font-semibold">
                      {(item as any).count.toLocaleString()}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors",
                    item.active 
                      ? "text-blue-400 bg-blue-500/10" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {(item as any).badge && (
                      <span className={cn(
                        "absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded-full font-bold",
                        (item as any).badge === 'NEW' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                      )}>
                        {(item as any).badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                  {(item as any).count && (
                    <span className="text-xs text-green-400 font-semibold">
                      {(item as any).count.toLocaleString()}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Submenu Toggle */}
              {item.hasSubmenu && (
                <button
                  onClick={() => toggleSection(item.name.toLowerCase())}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSection === item.name.toLowerCase() ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Expandable Sections */}
      {expandedSection && (
        <div className="border-t border-[#2d3748] bg-[#0f1419] max-h-60 overflow-y-auto">
          {expandedSection === 'casino' && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Casino Games
              </h3>
              
              {/* Prominent Items */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-blue-400 mb-2">Featured</h4>
                <div className="grid grid-cols-1 gap-2">
                  {casinoSubItems.filter(item => item.prominent).map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          {subItem.name === 'Live Casino' ? <TrendingUp className="h-4 w-4 text-blue-400" /> : <Gamepad2 className="h-4 w-4 text-purple-400" />}
                        </div>
                        <span className="text-sm font-medium text-white">{subItem.name}</span>
                      </div>
                      <span className="text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-1 rounded-full">
                        {subItem.count.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Most Played */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-yellow-400 mb-2">Most Played</h4>
                <div className="grid grid-cols-1 gap-2">
                  {casinoSubItems.filter(item => item.section === 'Most Played').map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
                    >
                      <span className="text-sm text-white">{subItem.name}</span>
                      <span className="text-xs text-yellow-400 font-semibold">
                        {subItem.count.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* New Releases */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-green-400 mb-2">New Releases</h4>
                <div className="grid grid-cols-1 gap-2">
                  {casinoSubItems.filter(item => item.section === 'New Releases').map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all"
                    >
                      <span className="text-sm text-white">{subItem.name}</span>
                      <span className="text-xs text-green-400 font-semibold">
                        {subItem.count.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Other Categories */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Categories</h4>
                <div className="grid grid-cols-1 gap-2">
                  {casinoSubItems.filter(item => !item.prominent && !item.section).map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-sm text-white">{subItem.name}</span>
                      <span className="text-xs text-green-400 font-semibold">
                        {subItem.count.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {expandedSection === 'vip' && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                VIP & Benefits
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {vipSubItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-colors",
                        item.active 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-gray-800 hover:bg-gray-700 text-white"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </div>
                      {(item as any).badge && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-bold",
                          (item as any).badge === 'NEW' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                        )}>
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
          
          {expandedSection === 'social' && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Social Features
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {socialSubItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={item.onClick}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </div>
                      {(item as any).badge && (
                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-blue-500 text-white">
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {expandedSection === 'account' && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Account & Settings
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {accountSubItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-colors",
                        item.active 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-gray-800 hover:bg-gray-700 text-white"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No secondary navigation toggle needed - all functionality is in primary items */}
    </div>
  )
}

export default MobileBottomNav
