'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  User,
  Wallet,
  ChevronDown,
  Menu,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  History,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import NotificationsDropdown from '@/components/ui/NotificationsDropdown'
import UserDropdown from '@/components/ui/UserDropdown'
import TopBarCurrencySelector from '@/components/ui/TopBarCurrencySelector'
import { useUserStore } from '@/store/userStore'
import { formatCurrency } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { searchGames, Game } from '@/lib/gameData'

interface TopBarProps {
  onToggleSidebar: () => void
  onToggleChat: () => void
  sidebarCollapsed: boolean
  chatOpen: boolean
  mobileSidebarOpen?: boolean
  mobileChatOpen?: boolean
}

const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onToggleChat,
  sidebarCollapsed,
  chatOpen,
  mobileSidebarOpen = false,
  mobileChatOpen = false
}) => {
  const { user, isAuthenticated, selectedCurrency, setSelectedCurrency } = useUserStore()
  const { setSignupModal, setLoginModal, setWalletModal, setLiveStatsModal, setMyBetsModal } = useUIStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        const results = searchGames(searchQuery.trim())
        setSearchResults(results.slice(0, 8)) // Limit to 8 results
        setShowSearchDropdown(true)
        setSelectedResultIndex(-1)
      } else {
        setSearchResults([])
        setShowSearchDropdown(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSearchDropdown) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedResultIndex(prev =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
            handleGameSelect(searchResults[selectedResultIndex])
          }
          break
        case 'Escape':
          setShowSearchDropdown(false)
          setSelectedResultIndex(-1)
          searchInputRef.current?.blur()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSearchDropdown, selectedResultIndex, searchResults])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false)
        setSelectedResultIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search handlers
  const handleGameSelect = (game: Game) => {
    setShowSearchDropdown(false)
    setSearchQuery('')
    setSelectedResultIndex(-1)
    // Navigate to game page
    window.location.href = `/casino/game/${game.id}`
  }

  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchDropdown(true)
    }
  }

  const handleSearchBlur = () => {
    // Delay hiding to allow click on results
    setTimeout(() => {
      setShowSearchDropdown(false)
      setSelectedResultIndex(-1)
    }, 150)
  }

  return (
    <div 
      className="fixed top-0 bg-[#0f1419] border-b border-[#2d3748] z-20 transition-all duration-300"
      style={{ 
        left: isMobile ? 0 : (sidebarCollapsed ? 64 : 240),
        right: isMobile ? 0 : (chatOpen ? 320 : 0),
        width: isMobile ? '100vw' : `calc(100vw - ${sidebarCollapsed ? 64 : 240}px - ${chatOpen ? 320 : 0}px)`
      }}
    >
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section - Sidebar Controls */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop Sidebar Toggle Button - Only show when sidebar is collapsed */}
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="hidden md:block text-gray-400 hover:text-white hover:bg-white/10"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}

          {/* Search - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search games..."
              className="bg-[#1a2c38] border border-[#2d3748] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4ff] w-64"
            />

            {/* Search Results Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div
                ref={searchDropdownRef}
                className="absolute top-full mt-2 w-80 bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs text-gray-400 mb-2 px-2">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </div>

                  {searchResults.map((game, index) => (
                    <button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-[#2d3748] transition-colors ${
                        index === selectedResultIndex ? 'bg-[#2d3748]' : ''
                      }`}
                    >
                      {/* Game Image */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#2d3748] flex items-center justify-center">
                        <img
                          src={game.image}
                          alt={game.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `<div class="text-gray-400 text-xs">${game.category.toUpperCase()}</div>`
                            }
                          }}
                        />
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium text-sm truncate">{game.name}</h4>
                          {game.isHot && <Zap className="w-3 h-3 text-yellow-400" />}
                          {game.isNew && <TrendingUp className="w-3 h-3 text-green-400" />}
                          {game.isExclusive && <Users className="w-3 h-3 text-purple-400" />}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span className="capitalize">{game.category}</span>
                          <span>•</span>
                          <span>{game.provider}</span>
                        </div>
                      </div>

                      {/* Stats Section - RTP and Players */}
                      <div className="flex flex-col items-end space-y-1 text-right">
                        {game.rtp && (
                          <div className="text-xs text-green-400 font-medium">
                            {game.rtp}% RTP
                          </div>
                        )}
                        {game.players && (
                          <div className="text-xs text-blue-400">
                            {game.players.toLocaleString()} playing
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  {searchResults.length === 0 && searchQuery && (
                    <div className="p-4 text-center text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No games found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Currency Selector and Wallet */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2 md:space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Currency Selector */}
              <TopBarCurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                className="flex"
              />

              {/* Wallet Button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => setWalletModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 text-xs md:text-sm px-2 md:px-4"
              >
                Wallet
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoginModal(true)}
                className="text-gray-300 hidden sm:block"
              >
                Sign In
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setSignupModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm px-2 md:px-4"
              >
                <span className="hidden sm:block">Sign Up</span>
                <span className="sm:hidden">Join</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right Section - Other Controls */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Notifications Dropdown - Hidden on mobile */}
              <div className="hidden md:block">
                <NotificationsDropdown 
                  isOpen={showNotifications}
                  onToggle={() => setShowNotifications(!showNotifications)}
                />
              </div>

              {/* User Menu - Hidden on mobile */}
              <div className="hidden md:block">
                <UserDropdown 
                  isOpen={showUserMenu}
                  onToggle={() => setShowUserMenu(!showUserMenu)}
                />
              </div>
            </>
          ) : null}

          {/* Chat Toggle */}
          <Button
            variant={chatOpen || mobileChatOpen ? "default" : "ghost"}
            size="icon"
            onClick={onToggleChat}
            className={`transition-all duration-200 ${
              chatOpen || mobileChatOpen
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "hover:bg-white/10"
            }`}
          >
            {mobileChatOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          </Button>

          {/* Live Stats Toggle - Only show for authenticated users */}
          {isAuthenticated && user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLiveStatsModal(true)}
              className="text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all duration-200"
              title="Live Stats"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopBar
