-- Fix database schema issues
-- This script addresses the foreign key constraint and missing column issues

-- 1. First, let's check what columns exist in chat_messages
-- (This is just for reference, we'll add the missing column below)

-- 2. Add missing is_admin column to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 3. Remove the foreign key constraint that's causing issues
-- The constraint is trying to reference auth.users but we're using a different user system
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

-- 4. Create a simple index on user_id instead of foreign key
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- 5. Update existing records to have proper default values
UPDATE chat_messages 
SET is_admin = FALSE 
WHERE is_admin IS NULL;

UPDATE chat_messages 
SET is_mod = FALSE 
WHERE is_mod IS NULL;

UPDATE chat_messages 
SET is_vip = FALSE 
WHERE is_vip IS NULL;

UPDATE chat_messages 
SET level = 1 
WHERE level IS NULL OR level < 1;

-- 6. Ensure all columns have NOT NULL constraints where needed
ALTER TABLE chat_messages 
ALTER COLUMN is_admin SET NOT NULL,
ALTER COLUMN is_mod SET NOT NULL,
ALTER COLUMN is_vip SET NOT NULL,
ALTER COLUMN level SET NOT NULL;
