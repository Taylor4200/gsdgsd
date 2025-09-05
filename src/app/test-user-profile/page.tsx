'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ChatService } from '@/lib/chatService'
import UserProfileModal from '@/components/chat/UserProfileModal'

export default function ChatUserTestPage() {
  const [showModal, setShowModal] = useState(false)
  const [testUser, setTestUser] = useState({
    id: 'test-user-123',
    username: 'TestUser',
    level: 25,
    is_vip: false,
    is_mod: false
  })
  const [currentUser, setCurrentUser] = useState({
    id: 'current-user-456',
    is_mod: false,
    is_admin: false
  })

  const chatService = ChatService.getInstance()

  return (
    <div className="min-h-screen bg-[#0f1419] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Chat User Profile Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Test User Info */}
          <div className="bg-[#1a2c38] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test User</h2>
            <div className="space-y-2">
              <p><span className="text-gray-400">Username:</span> <span className="text-white">{testUser.username}</span></p>
              <p><span className="text-gray-400">Level:</span> <span className="text-white">{testUser.level}</span></p>
              <p><span className="text-gray-400">VIP:</span> <span className="text-white">{testUser.is_vip ? 'Yes' : 'No'}</span></p>
              <p><span className="text-gray-400">Mod:</span> <span className="text-white">{testUser.is_mod ? 'Yes' : 'No'}</span></p>
            </div>
          </div>

          {/* Current User Info */}
          <div className="bg-[#1a2c38] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current User (You)</h2>
            <div className="space-y-2">
              <p><span className="text-gray-400">Mod:</span> <span className="text-white">{currentUser.is_mod ? 'Yes' : 'No'}</span></p>
              <p><span className="text-gray-400">Admin:</span> <span className="text-white">{currentUser.is_admin ? 'Yes' : 'No'}</span></p>
            </div>
            <div className="mt-4 space-x-2">
              <Button
                onClick={() => setCurrentUser(prev => ({ ...prev, is_mod: !prev.is_mod }))}
                className={currentUser.is_mod ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"}
              >
                Toggle Mod
              </Button>
              <Button
                onClick={() => setCurrentUser(prev => ({ ...prev, is_admin: !prev.is_admin }))}
                className={currentUser.is_admin ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"}
              >
                Toggle Admin
              </Button>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-[#1a2c38] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test User Profile Modal</h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              Click the button below to test the user profile modal. The content will change based on whether you're a mod/admin or not.
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#00d4ff] hover:bg-[#00b8e6] text-black"
            >
              View User Profile
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#1a2c38] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">How to Test</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Normal User:</strong> Will see comprehensive gaming stats like Stake/Roobet</p>
            <p><strong>Mod/Admin:</strong> Will see additional tabs for messages, ban history, and moderation actions</p>
            <p><strong>In Chat:</strong> All users can click on usernames to view profiles, but only mods see admin controls</p>
            <p><strong>New Features:</strong> Gaming statistics, rank progression, tip/ignore buttons, financial data</p>
          </div>
        </div>

        {/* User Profile Modal */}
        {showModal && (
          <UserProfileModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            user={testUser}
            currentUser={currentUser}
            chatService={chatService}
          />
        )}
      </div>
    </div>
  )
}
