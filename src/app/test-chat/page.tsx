'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function ChatTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runChatTest = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      addResult('🧪 Starting chat setup test...')
      
      // Test 1: Check if user is authenticated
      if (!user) {
        addResult('❌ No user logged in. Please log in first.')
        setIsLoading(false)
        return
      }
      addResult('✅ User authenticated: ' + user.email)
      
      // Test 2: Check if chat tables exist
      addResult('🔍 Checking if chat tables exist...')
      const { data: tables, error: tablesError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1)
      
      if (tablesError) {
        addResult('❌ Chat tables not found. Please run the SQL schema first.')
        setIsLoading(false)
        return
      }
      addResult('✅ Chat tables exist')
      
      // Test 3: Send a test message
      addResult('📤 Sending test message...')
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'TestUser',
          message: 'Test message from setup - ' + new Date().toLocaleTimeString(),
          level: 1,
          is_vip: false,
          is_mod: false
        })
        .select()
        .single()
      
      if (messageError) {
        addResult('❌ Failed to send message: ' + messageError.message)
        setIsLoading(false)
        return
      }
      addResult('✅ Test message sent successfully')
      
      // Test 4: Test admin functionality (if user is mod)
      if (user.email?.includes('admin') || user.email?.includes('mod')) {
        addResult('🔧 Testing admin functionality...')
        
        // Test getting user message history
        const { data: userMessages, error: userMessagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .limit(5)
        
        if (userMessagesError) {
          addResult('❌ Failed to get user message history: ' + userMessagesError.message)
        } else {
          addResult('✅ Admin message history access working')
        }
        
        // Test ban functionality
        const { error: banError } = await supabase
          .from('chat_bans')
          .insert({
            user_id: user.id,
            banned_by: user.id,
            reason: 'Test ban - will be deleted',
            expires_at: new Date(Date.now() + 60000).toISOString() // 1 minute from now
          })
        
        if (banError) {
          addResult('❌ Failed to create test ban: ' + banError.message)
        } else {
          addResult('✅ Admin ban functionality working')
          
          // Clean up test ban
          await supabase
            .from('chat_bans')
            .delete()
            .eq('user_id', user.id)
            .eq('reason', 'Test ban - will be deleted')
          addResult('🧹 Cleaned up test ban')
        }
      }
      
      addResult('🎉 Chat setup test completed successfully!')
      addResult('💡 You can now use the chat sidebar in your app!')
      
    } catch (error) {
      addResult('❌ Test failed: ' + error)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Chat System Test</h1>
        
        <div className="bg-[#1a2c38] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Setup Status</h2>
          
          {!user ? (
            <div className="text-red-400 mb-4">
              ❌ Please log in first to test the chat system
            </div>
          ) : (
            <div className="text-green-400 mb-4">
              ✅ Logged in as: {user.email}
            </div>
          )}
          
          <Button
            onClick={runChatTest}
            disabled={isLoading || !user}
            className="bg-[#00d4ff] text-black hover:bg-[#00b8e6]"
          >
            {isLoading ? 'Testing...' : 'Run Chat Test'}
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="bg-[#1a2c38] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-300 font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-[#1a2c38] rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
          <div className="text-gray-300 space-y-2">
            <p>1. ✅ Run the SQL schema in your Supabase dashboard</p>
            <p>2. ✅ Enable real-time for chat_messages and chat_presence tables</p>
            <p>3. ✅ Run this test to verify everything works</p>
            <p>4. ✅ Open your casino app and try the chat sidebar!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

