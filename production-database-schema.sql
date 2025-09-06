-- Production-Ready Social Casino Database Schema
-- Extends existing raffle system with comprehensive game tracking and live feed

-- ==============================================
-- GAME SESSION TRACKING
-- ==============================================

-- Track every game session for live feed and analytics
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL, -- 'dice', 'minesweeper', 'limbo', etc.
    game_name VARCHAR(100) NOT NULL,
    bet_amount DECIMAL(15,2) NOT NULL,
    win_amount DECIMAL(15,2) DEFAULT 0,
    result VARCHAR(20) NOT NULL CHECK (result IN ('win', 'loss', 'tie')),
    multiplier DECIMAL(8,2) DEFAULT 1.00,
    session_data JSONB, -- Game-specific data (dice roll, mines hit, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for game_sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_result ON game_sessions(result);

-- User wagering history for raffle ticket calculation
CREATE TABLE IF NOT EXISTS user_wagers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    tickets_earned INTEGER DEFAULT 0,
    raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_wagers
CREATE INDEX IF NOT EXISTS idx_user_wagers_user_id ON user_wagers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wagers_raffle_id ON user_wagers(raffle_id);
CREATE INDEX IF NOT EXISTS idx_user_wagers_created_at ON user_wagers(created_at DESC);

-- ==============================================
-- LIVE FEED SYSTEM
-- ==============================================

-- Live feed events for real-time display
CREATE TABLE IF NOT EXISTS live_feed_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('win', 'big_win', 'jackpot', 'achievement')),
    bet_amount DECIMAL(15,2) NOT NULL,
    win_amount DECIMAL(15,2) DEFAULT 0,
    multiplier DECIMAL(8,2) DEFAULT 1.00,
    is_featured BOOLEAN DEFAULT false, -- For highlighting big wins
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for live_feed_events
CREATE INDEX IF NOT EXISTS idx_live_feed_events_created_at ON live_feed_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_feed_events_featured ON live_feed_events(is_featured);
CREATE INDEX IF NOT EXISTS idx_live_feed_events_type ON live_feed_events(event_type);

-- ==============================================
-- SOCIAL FEATURES SYSTEM
-- ==============================================

-- Friends system
CREATE TABLE IF NOT EXISTS user_friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure unique friendship pairs
    UNIQUE(user_id, friend_id),
    -- Prevent self-friending
    CHECK(user_id != friend_id)
);

-- Private messages
CREATE TABLE IF NOT EXISTS private_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Social betting (watch friends play)
CREATE TABLE IF NOT EXISTS social_betting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    watcher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT,
    achievement_icon VARCHAR(50),
    achievement_rarity VARCHAR(20) DEFAULT 'common',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    
    -- Ensure unique achievements per user
    UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    game_type VARCHAR(50),
    metric VARCHAR(50) NOT NULL, -- 'total_wagered', 'total_won', 'games_played', etc.
    value DECIMAL(15,2) NOT NULL,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique entries per user per period per metric
    UNIQUE(user_id, period, game_type, metric)
);

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('gaming', 'social', 'vip', 'special')),
    requirements JSONB NOT NULL, -- {type: 'bet_amount', value: 1000, game_type: 'dice'}
    reward JSONB NOT NULL, -- {type: 'coins', amount: 100}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for social features
CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_friend_id ON user_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON user_friends(status);
CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_recipient ON private_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_betting_user ON social_betting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_social_betting_watcher ON social_betting_sessions(watcher_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period);
CREATE INDEX IF NOT EXISTS idx_leaderboards_metric ON leaderboards(metric);
CREATE INDEX IF NOT EXISTS idx_leaderboards_value ON leaderboards(value DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_category ON achievement_definitions(category);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_rarity ON achievement_definitions(rarity);

-- Insert initial achievement definitions
INSERT INTO achievement_definitions (id, name, description, icon, rarity, category, requirements, reward) VALUES
-- Gaming Achievements
('high_roller', 'High Roller', 'Place a bet of $100 or more', 'dollar-sign', 'rare', 'gaming', '{"type": "bet_amount", "value": 100}', '{"type": "coins", "amount": 500}'),
('lucky_streak', 'Lucky Streak', 'Win 5 games in a row', 'trending-up', 'epic', 'gaming', '{"type": "win_streak", "value": 5}', '{"type": "coins", "amount": 250}'),
('dice_master', 'Dice Master', 'Play 100 dice games', 'dice-1', 'common', 'gaming', '{"type": "games_played", "value": 100, "game_type": "dice"}', '{"type": "coins", "amount": 100}'),
('minesweeper_expert', 'Minesweeper Expert', 'Play 50 minesweeper games', 'grid-3x3', 'common', 'gaming', '{"type": "games_played", "value": 50, "game_type": "minesweeper"}', '{"type": "coins", "amount": 75}'),
('limbo_legend', 'Limbo Legend', 'Play 75 limbo games', 'zap', 'common', 'gaming', '{"type": "games_played", "value": 75, "game_type": "limbo"}', '{"type": "coins", "amount": 75}'),
('plinko_pro', 'Plinko Pro', 'Play 50 plinko games', 'circle', 'common', 'gaming', '{"type": "games_played", "value": 50, "game_type": "plinko"}', '{"type": "coins", "amount": 75}'),
('blackjack_ace', 'Blackjack Ace', 'Play 25 blackjack games', 'spade', 'common', 'gaming', '{"type": "games_played", "value": 25, "game_type": "blackjack"}', '{"type": "coins", "amount": 50}'),
('baccarat_boss', 'Baccarat Boss', 'Play 25 baccarat games', 'diamond', 'common', 'gaming', '{"type": "games_played", "value": 25, "game_type": "baccarat"}', '{"type": "coins", "amount": 50}'),

-- Social Achievements
('social_butterfly', 'Social Butterfly', 'Add 10 friends', 'users', 'rare', 'social', '{"type": "friends_count", "value": 10}', '{"type": "coins", "amount": 200}'),
('social_networker', 'Social Networker', 'Add 25 friends', 'users', 'epic', 'social', '{"type": "friends_count", "value": 25}', '{"type": "coins", "amount": 500}'),
('social_connector', 'Social Connector', 'Add 50 friends', 'users', 'epic', 'social', '{"type": "friends_count", "value": 50}', '{"type": "coins", "amount": 1000}'),
('social_legend', 'Social Legend', 'Add 100 friends', 'users', 'legendary', 'social', '{"type": "friends_count", "value": 100}', '{"type": "coins", "amount": 2500}'),
('first_friend', 'First Friend', 'Add your first friend', 'user-plus', 'common', 'social', '{"type": "friends_count", "value": 1}', '{"type": "coins", "amount": 50}'),
('friendly_neighbor', 'Friendly Neighbor', 'Add 5 friends', 'users', 'common', 'social', '{"type": "friends_count", "value": 5}', '{"type": "coins", "amount": 100}'),
('chatty_cathy', 'Chatty Cathy', 'Send 100 messages in chat', 'message-circle', 'common', 'social', '{"type": "messages_sent", "value": 100}', '{"type": "coins", "amount": 100}'),
('message_master', 'Message Master', 'Send 50 private messages', 'mail', 'common', 'social', '{"type": "private_messages_sent", "value": 50}', '{"type": "coins", "amount": 150}'),
('watcher', 'Watcher', 'Watch friends play 10 games', 'eye', 'common', 'social', '{"type": "social_betting_sessions", "value": 10}', '{"type": "coins", "amount": 100}'),

-- VIP Achievements
('vip_hunter', 'VIP Hunter', 'Reach Silver VIP tier', 'crown', 'epic', 'vip', '{"type": "vip_level", "value": 2}', '{"type": "coins", "amount": 1000}'),
('vip_champion', 'VIP Champion', 'Reach Gold VIP tier', 'crown', 'legendary', 'vip', '{"type": "vip_level", "value": 3}', '{"type": "coins", "amount": 2500}'),
('vip_legend', 'VIP Legend', 'Reach Platinum VIP tier', 'crown', 'legendary', 'vip', '{"type": "vip_level", "value": 4}', '{"type": "coins", "amount": 5000}'),

-- Special Achievements
('first_win', 'First Win', 'Win your first game', 'trophy', 'common', 'special', '{"type": "first_win", "value": 1}', '{"type": "coins", "amount": 50}'),
('big_winner', 'Big Winner', 'Win $1000 or more in a single game', 'gift', 'epic', 'special', '{"type": "single_win", "value": 1000}', '{"type": "coins", "amount": 500}'),
('jackpot_hunter', 'Jackpot Hunter', 'Hit a jackpot', 'star', 'legendary', 'special', '{"type": "jackpot_hit", "value": 1}', '{"type": "coins", "amount": 1000}')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- RAFFLE PARTICIPATION TRACKING
-- ==============================================

-- Enhanced raffle participation with real-time stats
CREATE TABLE IF NOT EXISTS raffle_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_tickets INTEGER DEFAULT 0,
    total_wagered DECIMAL(15,2) DEFAULT 0,
    first_participation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one participation record per user per raffle
    UNIQUE(raffle_id, user_id)
);

-- Create indexes for raffle_participants
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle_id ON raffle_participants(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_user_id ON raffle_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_tickets ON raffle_participants(total_tickets DESC);

-- Real-time raffle stats (cached for performance)
CREATE TABLE IF NOT EXISTS raffle_stats (
    raffle_id UUID PRIMARY KEY REFERENCES raffles(id) ON DELETE CASCADE,
    total_participants INTEGER DEFAULT 0,
    total_tickets INTEGER DEFAULT 0,
    total_wagered DECIMAL(15,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for raffle_stats
CREATE INDEX IF NOT EXISTS idx_raffle_stats_last_updated ON raffle_stats(last_updated);

-- User rankings for leaderboards
CREATE TABLE IF NOT EXISTS user_rankings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
    rank_position INTEGER,
    total_tickets INTEGER DEFAULT 0,
    total_wagered DECIMAL(15,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, raffle_id)
);

-- Create indexes for user_rankings
CREATE INDEX IF NOT EXISTS idx_user_rankings_raffle_rank ON user_rankings(raffle_id, rank_position);
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON user_rankings(user_id);

-- ==============================================
-- FUNCTIONS FOR AUTOMATION
-- ==============================================

-- Calculate tickets earned from wager
CREATE OR REPLACE FUNCTION calculate_tickets_earned(
    wager_amount DECIMAL(15,2),
    game_id VARCHAR(50),
    raffle_id UUID
) RETURNS INTEGER AS $$
DECLARE
    multiplier DECIMAL(5,2);
    tickets INTEGER;
BEGIN
    -- Get the multiplier for this game in this raffle
    SELECT COALESCE(multiplier, 1.0) INTO multiplier
    FROM raffle_game_multipliers 
    WHERE raffle_id = calculate_tickets_earned.raffle_id 
    AND game_id = calculate_tickets_earned.game_id;
    
    -- Calculate tickets: (wager_amount / base_ticket_cost) * multiplier
    -- Base cost is $1 per ticket
    tickets := FLOOR((wager_amount / 1.0) * multiplier);
    
    RETURN GREATEST(tickets, 0); -- Never negative
END;
$$ LANGUAGE plpgsql;

-- Update raffle participation when user wagers
CREATE OR REPLACE FUNCTION update_raffle_participation(
    p_user_id UUID,
    p_raffle_id UUID,
    p_game_id VARCHAR(50),
    p_wager_amount DECIMAL(15,2)
) RETURNS INTEGER AS $$
DECLARE
    tickets_earned INTEGER;
    current_tickets INTEGER;
BEGIN
    -- Calculate tickets earned from this wager
    tickets_earned := calculate_tickets_earned(p_wager_amount, p_game_id, p_raffle_id);
    
    -- Insert or update participation record
    INSERT INTO raffle_participants (raffle_id, user_id, total_tickets, total_wagered)
    VALUES (p_raffle_id, p_user_id, tickets_earned, p_wager_amount)
    ON CONFLICT (raffle_id, user_id) 
    DO UPDATE SET 
        total_tickets = raffle_participants.total_tickets + tickets_earned,
        total_wagered = raffle_participants.total_wagered + p_wager_amount,
        last_activity = NOW();
    
    -- Return total tickets for this user
    SELECT total_tickets INTO current_tickets
    FROM raffle_participants 
    WHERE raffle_id = p_raffle_id AND user_id = p_user_id;
    
    RETURN current_tickets;
END;
$$ LANGUAGE plpgsql;

-- Update raffle stats automatically
CREATE OR REPLACE FUNCTION update_raffle_stats(p_raffle_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO raffle_stats (raffle_id, total_participants, total_tickets, total_wagered)
    SELECT 
        p_raffle_id,
        COUNT(DISTINCT user_id),
        SUM(total_tickets),
        SUM(total_wagered)
    FROM raffle_participants 
    WHERE raffle_id = p_raffle_id
    ON CONFLICT (raffle_id) 
    DO UPDATE SET 
        total_participants = EXCLUDED.total_participants,
        total_tickets = EXCLUDED.total_tickets,
        total_wagered = EXCLUDED.total_wagered,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Get live participant count
CREATE OR REPLACE FUNCTION get_live_participant_count(raffle_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id) 
        FROM raffle_participants 
        WHERE raffle_id = raffle_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Trigger to auto-update stats when participation changes
CREATE OR REPLACE FUNCTION trigger_update_raffle_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the affected raffle
    PERFORM update_raffle_stats(COALESCE(NEW.raffle_id, OLD.raffle_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_raffle_stats_trigger ON raffle_participants;
CREATE TRIGGER update_raffle_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON raffle_participants
    FOR EACH ROW EXECUTE FUNCTION trigger_update_raffle_stats();

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_feed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rankings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own game sessions
DROP POLICY IF EXISTS "Users can view own game sessions" ON game_sessions;
CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own game sessions" ON game_sessions;
CREATE POLICY "Users can insert own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see their own wagers
DROP POLICY IF EXISTS "Users can view own wagers" ON user_wagers;
CREATE POLICY "Users can view own wagers" ON user_wagers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wagers" ON user_wagers;
CREATE POLICY "Users can insert own wagers" ON user_wagers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can view live feed events (public info)
DROP POLICY IF EXISTS "Anyone can view live feed events" ON live_feed_events;
CREATE POLICY "Anyone can view live feed events" ON live_feed_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own live feed events" ON live_feed_events;
CREATE POLICY "Users can insert own live feed events" ON live_feed_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see their own participation
DROP POLICY IF EXISTS "Users can view own participation" ON raffle_participants;
CREATE POLICY "Users can view own participation" ON raffle_participants
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own participation" ON raffle_participants;
CREATE POLICY "Users can insert own participation" ON raffle_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participation" ON raffle_participants;
CREATE POLICY "Users can update own participation" ON raffle_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can view raffle stats (public info)
DROP POLICY IF EXISTS "Anyone can view raffle stats" ON raffle_stats;
CREATE POLICY "Anyone can view raffle stats" ON raffle_stats
    FOR SELECT USING (true);

-- Users can see their own rankings
DROP POLICY IF EXISTS "Users can view own rankings" ON user_rankings;
CREATE POLICY "Users can view own rankings" ON user_rankings
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view rankings (public leaderboard)
DROP POLICY IF EXISTS "Anyone can view rankings" ON user_rankings;
CREATE POLICY "Anyone can view rankings" ON user_rankings
    FOR SELECT USING (true);

-- Admin policies (adjust based on your admin role system)
DROP POLICY IF EXISTS "Admins can view all game sessions" ON game_sessions;
CREATE POLICY "Admins can view all game sessions" ON game_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can view all wagers" ON user_wagers;
CREATE POLICY "Admins can view all wagers" ON user_wagers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can manage raffle stats" ON raffle_stats;
CREATE POLICY "Admins can manage raffle stats" ON raffle_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- ==============================================
-- INITIAL DATA SETUP
-- ==============================================

-- Insert default game multipliers for existing raffles
INSERT INTO raffle_game_multipliers (raffle_id, game_id, game_name, multiplier, wager_requirement, tickets_per_wager)
SELECT 
    r.id,
    'dice',
    'Dice',
    1.0,
    1.0,
    1
FROM raffles r
WHERE NOT EXISTS (
    SELECT 1 FROM raffle_game_multipliers rgm 
    WHERE rgm.raffle_id = r.id AND rgm.game_id = 'dice'
);

INSERT INTO raffle_game_multipliers (raffle_id, game_id, game_name, multiplier, wager_requirement, tickets_per_wager)
SELECT 
    r.id,
    'minesweeper',
    'Minesweeper',
    1.0,
    1.0,
    1
FROM raffles r
WHERE NOT EXISTS (
    SELECT 1 FROM raffle_game_multipliers rgm 
    WHERE rgm.raffle_id = r.id AND rgm.game_id = 'minesweeper'
);

INSERT INTO raffle_game_multipliers (raffle_id, game_id, game_name, multiplier, wager_requirement, tickets_per_wager)
SELECT 
    r.id,
    'limbo',
    'Limbo',
    1.0,
    1.0,
    1
FROM raffles r
WHERE NOT EXISTS (
    SELECT 1 FROM raffle_game_multipliers rgm 
    WHERE rgm.raffle_id = r.id AND rgm.game_id = 'limbo'
);

INSERT INTO raffle_game_multipliers (raffle_id, game_id, game_name, multiplier, wager_requirement, tickets_per_wager)
SELECT 
    r.id,
    'plinko',
    'Plinko',
    1.0,
    1.0,
    1
FROM raffles r
WHERE NOT EXISTS (
    SELECT 1 FROM raffle_game_multipliers rgm 
    WHERE rgm.raffle_id = r.id AND rgm.game_id = 'plinko'
);

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- This schema provides:
-- ✅ Complete game session tracking
-- ✅ Real-time live feed system
-- ✅ Automatic raffle participation tracking
-- ✅ Performance-optimized queries
-- ✅ Row-level security
-- ✅ Auto-updating statistics
-- ✅ Integration with existing raffle system
