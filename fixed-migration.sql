-- FIXED CASINO MIGRATION - RUN THIS IN SUPABASE SQL EDITOR

-- ==============================================
-- STEP 1: CREATE USER_PROFILES TABLE FIRST
-- ==============================================

DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 1000),
    experience_points BIGINT DEFAULT 0 CHECK (experience_points >= 0),
    total_wagered DECIMAL(20,2) DEFAULT 0 CHECK (total_wagered >= 0),
    total_won DECIMAL(20,2) DEFAULT 0 CHECK (total_won >= 0),
    games_played INTEGER DEFAULT 0 CHECK (games_played >= 0),
    win_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (win_rate >= 0 AND win_rate <= 100),
    vip_tier INTEGER DEFAULT 0 CHECK (vip_tier >= 0 AND vip_tier <= 10),
    is_online BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_messages INTEGER DEFAULT 0 CHECK (total_messages >= 0),
    achievements_count INTEGER DEFAULT 0 CHECK (achievements_count >= 0),
    is_vip BOOLEAN DEFAULT false,
    is_mod BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    ghost_mode BOOLEAN DEFAULT false,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES auth.users(id),
    country VARCHAR(2),
    timezone VARCHAR(50),
    language VARCHAR(5) DEFAULT 'en',
    currency_preference VARCHAR(3) DEFAULT 'USD',
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    last_login_ip INET,
    login_count INTEGER DEFAULT 0 CHECK (login_count >= 0),
    consecutive_login_days INTEGER DEFAULT 0 CHECK (consecutive_login_days >= 0),
    last_login_date TIMESTAMP WITH TIME ZONE,
    total_session_time INTERVAL DEFAULT '0 seconds',
    favorite_games JSONB DEFAULT '[]',
    game_preferences JSONB DEFAULT '{}'
);

-- ==============================================
-- STEP 2: CREATE INDEXES
-- ==============================================

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_total_wagered ON user_profiles(total_wagered DESC);
CREATE INDEX idx_user_profiles_vip_tier ON user_profiles(vip_tier DESC);
CREATE INDEX idx_user_profiles_is_online ON user_profiles(is_online);
CREATE INDEX idx_user_profiles_last_active ON user_profiles(last_active DESC);
CREATE INDEX idx_user_profiles_is_banned ON user_profiles(is_banned);
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX idx_user_profiles_referred_by ON user_profiles(referred_by);

-- ==============================================
-- STEP 3: MIGRATE EXISTING USERS
-- ==============================================

-- Migrate users from profiles table if it exists
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
    is_admin,
    referral_code
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
    COALESCE(p.created_at, NOW()) as created_at,
    COALESCE(p.updated_at, NOW()) as updated_at,
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
    END as is_admin,
    CASE
        WHEN p.username = 'Vietnamdong' THEN 'VIETNAM100'
        ELSE UPPER(SUBSTRING(COALESCE(p.username, 'USER'), 1, 8) || FLOOR(RANDOM() * 1000)::TEXT)
    END as referral_code
FROM profiles p
ON CONFLICT (username) DO NOTHING;

-- ==============================================
-- STEP 4: CREATE SAMPLE GAME SESSIONS
-- ==============================================

-- Create sample game sessions for Vietnamdong
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
    CASE
        WHEN RANDOM() < 0.3 THEN 'dice'
        WHEN RANDOM() < 0.6 THEN 'minesweeper'
        WHEN RANDOM() < 0.8 THEN 'limbo'
        ELSE 'blackjack'
    END,
    CASE
        WHEN RANDOM() < 0.3 THEN 'Dice'
        WHEN RANDOM() < 0.6 THEN 'Minesweeper'
        WHEN RANDOM() < 0.8 THEN 'Limbo'
        ELSE 'Blackjack'
    END,
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
    jsonb_build_object('roll', FLOOR(RANDOM() * 100)::integer),
    NOW() - (RANDOM() * INTERVAL '30 days')
FROM user_profiles up
WHERE up.username = 'Vietnamdong'
AND NOT EXISTS (
    SELECT 1 FROM game_sessions gs WHERE gs.user_id = up.user_id
)
LIMIT 50;

-- ==============================================
-- STEP 5: UPDATE STATS FROM GAME SESSIONS
-- ==============================================

-- Update user_profiles with calculated stats
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
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM game_sessions WHERE user_id = user_profiles.user_id
);

-- ==============================================
-- STEP 6: CREATE LIVE FEED EVENTS
-- ==============================================

-- Create live feed events from wins
INSERT INTO live_feed_events (
    user_id,
    username,
    game_id,
    game_name,
    event_type,
    bet_amount,
    win_amount,
    multiplier,
    is_featured,
    created_at
)
SELECT
    up.user_id,
    up.username,
    gs.game_id,
    gs.game_name,
    CASE
        WHEN gs.win_amount > 100 THEN 'big_win'
        WHEN gs.win_amount > 0 THEN 'win'
        ELSE 'win'
    END,
    gs.bet_amount,
    gs.win_amount,
    gs.multiplier,
    gs.win_amount > 500,
    gs.created_at
FROM game_sessions gs
JOIN user_profiles up ON gs.user_id = up.user_id
WHERE up.username = 'Vietnamdong'
AND gs.win_amount > 0
AND NOT EXISTS (
    SELECT 1 FROM live_feed_events lfe
    WHERE lfe.user_id = gs.user_id AND lfe.created_at = gs.created_at
)
LIMIT 20;

-- ==============================================
-- STEP 7: SETUP ACHIEVEMENTS
-- ==============================================

-- Drop and recreate achievement definitions
DROP TABLE IF EXISTS achievement_definitions CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;

CREATE TABLE achievement_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
    reward_type VARCHAR(50),
    reward_value INTEGER DEFAULT 0 CHECK (reward_value >= 0),
    icon VARCHAR(100),
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary', 'mythic')),
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0),
    is_notified BOOLEAN DEFAULT false,
    UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX idx_achievement_definitions_category ON achievement_definitions(category);
CREATE INDEX idx_achievement_definitions_is_active ON achievement_definitions(is_active);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Insert achievement definitions
INSERT INTO achievement_definitions (name, description, category, requirement_type, requirement_value, reward_type, reward_value, icon, rarity, sort_order) VALUES
('First Steps', 'Play your first game', 'gaming', 'games_played', 1, 'coins', 100, 'trophy', 'common', 1),
('Getting Started', 'Play 10 games', 'gaming', 'games_played', 10, 'coins', 500, 'star', 'common', 2),
('Casino Regular', 'Play 100 games', 'gaming', 'games_played', 100, 'coins', 2000, 'crown', 'rare', 3),
('Game Master', 'Play 1,000 games', 'gaming', 'games_played', 1000, 'coins', 10000, 'medal', 'epic', 4),
('High Roller', 'Wager 10,000 SC', 'wagering', 'total_wagered', 10000, 'level', 1, 'diamond', 'rare', 6),
('Lucky Streak', 'Win 5 games in a row', 'streaks', 'win_streak', 5, 'coins', 1000, 'zap', 'rare', 9),
('Social Butterfly', 'Add 5 friends', 'social', 'friends_added', 5, 'coins', 500, 'users', 'common', 12),
('Rising Star', 'Reach level 10', 'level', 'level_reached', 10, 'coins', 1000, 'star', 'common', 15),
('Elite Player', 'Reach level 100', 'level', 'level_reached', 100, 'coins', 10000, 'trophy', 'legendary', 18);

-- ==============================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view achievement definitions" ON achievement_definitions
    FOR SELECT USING (true);

-- ==============================================
-- STEP 9: CREATE TRIGGER FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION update_user_stats_on_game_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile stats
    UPDATE user_profiles
    SET
        total_wagered = total_wagered + NEW.bet_amount,
        total_won = total_won + NEW.win_amount,
        games_played = games_played + 1,
        win_rate = CASE
            WHEN games_played + 1 > 0 THEN
                ROUND((SELECT COUNT(*) FROM game_sessions WHERE user_id = NEW.user_id AND result = 'win')::decimal / (games_played + 1) * 100, 2)
            ELSE 0
        END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- Create live feed event for wins
    IF NEW.win_amount > 0 THEN
        INSERT INTO live_feed_events (
            user_id,
            username,
            game_id,
            game_name,
            event_type,
            bet_amount,
            win_amount,
            multiplier,
            is_featured,
            created_at
        )
        SELECT
            NEW.user_id,
            up.username,
            NEW.game_id,
            NEW.game_name,
            CASE
                WHEN NEW.win_amount > 1000 THEN 'big_win'
                WHEN NEW.win_amount > 0 THEN 'win'
                ELSE 'win'
            END,
            NEW.bet_amount,
            NEW.win_amount,
            NEW.multiplier,
            NEW.win_amount > 500,
            NOW()
        FROM user_profiles up
        WHERE up.user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_user_stats ON game_sessions;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_game_session();

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

SELECT 'Migration completed successfully! Vietnamdong now has Level 100 with full stats.' as result;
