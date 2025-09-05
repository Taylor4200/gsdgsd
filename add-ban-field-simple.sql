-- Step 1: Add is_banned column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
