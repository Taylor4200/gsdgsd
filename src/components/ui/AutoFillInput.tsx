'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface UserSuggestion {
  id: string
  username: string
  level: number
  is_online: boolean
  total_wagered: number
  games_played: number
}

interface AutoFillInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect: (username: string) => void
  onAdd: (username: string) => void
  disabled?: boolean
  className?: string
}

const AutoFillInput: React.FC<AutoFillInputProps> = ({
  placeholder,
  value,
  onChange,
  onSelect,
  onAdd,
  disabled = false,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (!value.trim() || value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(() => {
      searchUsers(value.trim())
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  const searchUsers = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.users || [])
        setShowSuggestions(true)
        setSelectedIndex(-1)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        onAdd(value.trim())
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedUser = suggestions[selectedIndex]
          onSelect(selectedUser.username)
          setShowSuggestions(false)
        } else if (value.trim()) {
          onAdd(value.trim())
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (username: string) => {
    onSelect(username)
    setShowSuggestions(false)
  }

  const handleAddClick = (username: string) => {
    onAdd(username)
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          disabled={disabled}
          icon={<Search className="h-4 w-4" />}
          className={className}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00d4ff]"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 hover:bg-[#2d3748] cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-[#2d3748]' : ''
                }`}
                onClick={() => handleSuggestionClick(user.username)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Online status */}
                    <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-[#1a2c38] ${
                      user.is_online ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>

                  {/* User info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{user.username}</span>
                      <span className="text-xs text-gray-400">Level {user.level}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      ${user.total_wagered.toLocaleString()} wagered • {user.games_played} games
                    </div>
                  </div>
                </div>

                {/* Add button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddClick(user.username)
                  }}
                  className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black text-xs px-2 py-1"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            ))}

            {/* Manual add option */}
            {value.trim() && !suggestions.some(user => user.username.toLowerCase() === value.toLowerCase()) && (
              <div className="border-t border-[#2d3748] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">?</span>
                    </div>
                    <div>
                      <span className="text-white font-medium">Add "{value}"</span>
                      <div className="text-xs text-gray-400">Manual entry</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddClick(value.trim())}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AutoFillInput
