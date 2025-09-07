'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minimize, Maximize, Move, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Game } from '@/lib/gameData'

interface GamePopoutProps {
  game: Game
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
  position?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
}

const GamePopout: React.FC<GamePopoutProps> = ({
  game,
  isOpen,
  onClose,
  onMinimize,
  position = { x: 100, y: 100 },
  onPositionChange
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const popoutRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true)
      const rect = popoutRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && onPositionChange) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      }
      onPositionChange(newPosition)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (!isMinimized) {
      onMinimize()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={popoutRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: position.x,
          y: position.y
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed z-[9999] bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: isMinimized ? '300px' : '600px',
          height: isMinimized ? '60px' : '400px',
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header - Draggable */}
        <div className="drag-handle bg-[#2d3748] px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing">
          <div className="flex items-center space-x-2">
            <img src="/Logo11.png" alt="Edge Logo" className="h-4 w-4 object-contain" />
            <span className="text-white text-sm font-medium">{game.name}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-gray-300 hover:text-white h-6 w-6"
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMinimize}
              className="text-gray-300 hover:text-white h-6 w-6"
            >
              {isMinimized ? <Maximize className="h-3 w-3" /> : <Minimize className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-300 hover:text-white h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Game Content */}
        {!isMinimized && (
          <div className="relative bg-black h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-white text-sm">Loading...</p>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={`https://demo-games.softswiss.com/game/${game.id}?language=en&currency=USD&mode=demo`}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              allowFullScreen
              title={game.name}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default GamePopout
