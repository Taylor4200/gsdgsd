-- Fix infinite recursion in chat_messages RLS policies
-- This script drops and recreates all policies with proper logic

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can read chat messages" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Moderators can delete any message" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Moderators can update any message" ON chat_messages CASCADE;

-- Drop presence policies
DROP POLICY IF EXISTS "Users can update their own presence" ON chat_presence CASCADE;
DROP POLICY IF EXISTS "Anyone can read presence" ON chat_presence CASCADE;

-- Drop ban policies  
DROP POLICY IF EXISTS "Anyone can read chat bans" ON chat_bans CASCADE;
DROP POLICY IF EXISTS "Moderators can manage bans" ON chat_bans CASCADE;

-- Recreate policies with proper logic (no circular references)

-- Chat Messages Policies
CREATE POLICY "Anyone can read chat messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Moderators can delete any message" ON chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm 
      WHERE cm.user_id = auth.uid()::text 
      AND cm.is_mod = true
    )
  );

CREATE POLICY "Moderators can update any message" ON chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm 
      WHERE cm.user_id = auth.uid()::text 
      AND cm.is_mod = true
    )
  );

-- Presence Policies
CREATE POLICY "Users can update their own presence" ON chat_presence
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Anyone can read presence" ON chat_presence
  FOR SELECT USING (true);

-- Ban Policies
CREATE POLICY "Anyone can read chat bans" ON chat_bans
  FOR SELECT USING (true);

CREATE POLICY "Moderators can manage bans" ON chat_bans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm 
      WHERE cm.user_id = auth.uid()::text 
      AND cm.is_mod = true
    )
  );

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_bans ENABLE ROW LEVEL SECURITY;
