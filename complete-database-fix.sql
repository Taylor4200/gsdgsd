-- Complete database fix for chat system
-- This script fixes all the issues preventing admin role assignment

-- Step 1: Disable RLS temporarily (if not already done)
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_presence DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_bans DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all problematic policies
DROP POLICY IF EXISTS "Anyone can read chat messages" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Moderators can delete any message" ON chat_messages CASCADE;
DROP POLICY IF EXISTS "Moderators can update any message" ON chat_messages CASCADE;

DROP POLICY IF EXISTS "Users can update their own presence" ON chat_presence CASCADE;
DROP POLICY IF EXISTS "Anyone can read presence" ON chat_presence CASCADE;

DROP POLICY IF EXISTS "Anyone can read chat bans" ON chat_bans CASCADE;
DROP POLICY IF EXISTS "Moderators can manage bans" ON chat_bans CASCADE;

-- Step 3: Remove foreign key constraint that's causing issues
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

-- Step 4: Add missing is_admin column
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 5: Ensure all role columns exist and have proper defaults
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS is_mod BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Step 6: Update existing records with proper defaults
UPDATE chat_messages 
SET is_admin = COALESCE(is_admin, FALSE),
    is_mod = COALESCE(is_mod, FALSE),
    is_vip = COALESCE(is_vip, FALSE),
    level = COALESCE(level, 1)
WHERE is_admin IS NULL OR is_mod IS NULL OR is_vip IS NULL OR level IS NULL;

-- Step 7: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Step 8: Create vietnamdong user record manually
INSERT INTO chat_messages (
  user_id, 
  username, 
  message, 
  message_type, 
  is_mod, 
  is_vip, 
  is_admin, 
  level
) VALUES (
  'b4af95cd-53de-47f1-9274-87266269c39b',
  'vietnamdong',
  'Admin user created with max privileges',
  'system',
  true,
  true,
  true,
  100
) ON CONFLICT (user_id) DO UPDATE SET
  is_mod = EXCLUDED.is_mod,
  is_vip = EXCLUDED.is_vip,
  is_admin = EXCLUDED.is_admin,
  level = EXCLUDED.level;

-- Step 9: Verify the setup
SELECT 
  user_id, 
  username, 
  is_mod, 
  is_vip, 
  is_admin, 
  level 
FROM chat_messages 
WHERE user_id = 'b4af95cd-53de-47f1-9274-87266269c39b';
