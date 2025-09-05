-- Add ban duration and reason fields to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ban_duration TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_banned_at ON user_profiles(banned_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_banned_by ON user_profiles(banned_by);
