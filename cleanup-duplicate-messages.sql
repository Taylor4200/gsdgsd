-- Clean up duplicate chat message records
-- This script removes duplicate system messages created during admin role testing

-- First, let's see what we have
SELECT 
  user_id, 
  username, 
  message, 
  message_type, 
  is_mod, 
  is_vip, 
  level, 
  created_at 
FROM chat_messages 
ORDER BY user_id, created_at;

-- Remove duplicate system messages, keeping only the latest one per user
WITH ranked_messages AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY created_at DESC
    ) as rn
  FROM chat_messages 
  WHERE message_type = 'system'
)
DELETE FROM chat_messages 
WHERE id IN (
  SELECT id 
  FROM ranked_messages 
  WHERE rn > 1
);

-- Show the cleaned up data
SELECT 
  user_id, 
  username, 
  message, 
  message_type, 
  is_mod, 
  is_vip, 
  level, 
  created_at 
FROM chat_messages 
ORDER BY user_id, created_at;
