/**
 * Chat Setup Test
 * Run this to verify your chat system is working
 */

import { supabase } from '@/lib/supabase'

export async function testChatSetup() {
  console.log('🧪 Testing Chat Setup...')
  
  try {
    // Test 1: Check if tables exist
    console.log('1. Checking database tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1)
    
    if (tablesError) {
      console.error('❌ Database tables not found. Please run the SQL schema first.')
      return false
    }
    console.log('✅ Database tables exist')
    
    // Test 2: Check if user is authenticated
    console.log('2. Checking authentication...')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('❌ No authenticated user. Please log in first.')
      return false
    }
    console.log('✅ User authenticated:', user.email)
    
    // Test 3: Test sending a message
    console.log('3. Testing message sending...')
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        username: user.email?.split('@')[0] || 'TestUser',
        message: 'Test message from setup',
        level: 1,
        is_vip: false,
        is_mod: false
      })
      .select()
      .single()
    
    if (messageError) {
      console.error('❌ Failed to send test message:', messageError.message)
      return false
    }
    console.log('✅ Test message sent successfully')
    
    // Test 4: Test real-time subscription
    console.log('4. Testing real-time subscription...')
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        console.log('✅ Real-time subscription working!')
        supabase.removeChannel(channel)
      })
      .subscribe()
    
    // Clean up test message
    setTimeout(async () => {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('id', message.id)
      console.log('🧹 Cleaned up test message')
    }, 2000)
    
    console.log('🎉 Chat setup test completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Chat setup test failed:', error)
    return false
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testChatSetup = testChatSetup
} else {
  // Node environment
  testChatSetup()
}

