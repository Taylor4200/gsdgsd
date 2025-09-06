-- Fix missing user_profiles table and migrate existing users
-- This will create the user_profiles table and populate it with existing users

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    level INTEGER DEFAULT 1,
    total_wagered DECIMAL(15,2) DEFAULT 0,
    total_won DECIMAL(15,2) DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    vip_tier INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_messages INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    is_vip BOOLEAN DEFAULT false,
    is_mod BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_wagered ON user_profiles(total_wagered DESC);

-- Migrate existing users from profiles table to user_profiles table
INSERT INTO user_profiles (
    user_id, 
    username, 
    level, 
    total_wagered, 
    total_won, 
    games_played, 
    win_rate, 
    vip_tier, 
    is_online, 
    last_active, 
    created_at, 
    updated_at,
    is_vip,
    is_mod,
    is_admin
)
SELECT 
    p.id as user_id,
    p.username,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN 100  -- Set Vietnamdong to level 100
        ELSE 1 
    END as level,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN 50000  -- Give Vietnamdong some stats
        ELSE 0 
    END as total_wagered,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN 45000
        ELSE 0 
    END as total_won,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN 1000
        ELSE 0 
    END as games_played,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN 65.5
        ELSE 0 
    END as win_rate,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN 3  -- VIP tier
        ELSE 0 
    END as vip_tier,
    true as is_online,  -- Set all users as online initially
    NOW() as last_active,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN true
        ELSE false 
    END as is_vip,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN true
        ELSE false 
    END as is_mod,
    CASE 
        WHEN p.username = 'Vietnamdong' THEN true
        ELSE false 
    END as is_admin
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = p.id
);

-- Create some sample game sessions for Vietnamdong to have realistic stats
INSERT INTO game_sessions (
    user_id,
    game_id,
    game_name,
    bet_amount,
    win_amount,
    result,
    multiplier,
    session_data,
    created_at
)
SELECT 
    up.user_id,
    'dice',
    'Dice',
    ROUND((RANDOM() * 100 + 10)::numeric, 2),
    CASE 
        WHEN RANDOM() > 0.4 THEN ROUND((RANDOM() * 200 + 20)::numeric, 2)
        ELSE 0
    END,
    CASE 
        WHEN RANDOM() > 0.4 THEN 'win'
        ELSE 'loss'
    END,
    CASE 
        WHEN RANDOM() > 0.4 THEN ROUND((RANDOM() * 5 + 1)::numeric, 2)
        ELSE 1.00
    END,
    '{"roll": ' || FLOOR(RANDOM() * 100) || '}'::jsonb,
    NOW() - (RANDOM() * INTERVAL '30 days')
FROM user_profiles up
WHERE up.username = 'Vietnamdong'
LIMIT 50;

-- Update user_profiles with calculated stats from game_sessions
UPDATE user_profiles 
SET 
    total_wagered = COALESCE((
        SELECT SUM(bet_amount) 
        FROM game_sessions 
        WHERE user_id = user_profiles.user_id
    ), 0),
    total_won = COALESCE((
        SELECT SUM(win_amount) 
        FROM game_sessions 
        WHERE user_id = user_profiles.user_id
    ), 0),
    games_played = COALESCE((
        SELECT COUNT(*) 
        FROM game_sessions 
        WHERE user_id = user_profiles.user_id
    ), 0),
    win_rate = COALESCE((
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN result = 'win' THEN 1 END)::decimal / COUNT(*)) * 100, 2)
            ELSE 0 
        END
        FROM game_sessions 
        WHERE user_id = user_profiles.user_id
    ), 0),
    updated_at = NOW();

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );
