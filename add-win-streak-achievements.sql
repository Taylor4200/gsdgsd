-- Add Win Streak Achievements
-- Additional win streak achievements with different tiers

INSERT INTO achievement_definitions (id, name, description, icon, rarity, category, requirements, reward) VALUES
-- Win Streak Achievements
('winning_start', 'Winning Start', 'Win 2 games in a row', 'trending-up', 'common', 'gaming', '{"type": "win_streak", "value": 2}', '{"type": "coins", "amount": 50}'),
('hot_streak', 'Hot Streak', 'Win 3 games in a row', 'trending-up', 'common', 'gaming', '{"type": "win_streak", "value": 3}', '{"type": "coins", "amount": 100}'),
('on_fire', 'On Fire', 'Win 7 games in a row', 'flame', 'epic', 'gaming', '{"type": "win_streak", "value": 7}', '{"type": "coins", "amount": 500}'),
('unstoppable', 'Unstoppable', 'Win 10 games in a row', 'zap', 'epic', 'gaming', '{"type": "win_streak", "value": 10}', '{"type": "coins", "amount": 1000}'),
('legendary_streak', 'Legendary Streak', 'Win 15 games in a row', 'crown', 'legendary', 'gaming', '{"type": "win_streak", "value": 15}', '{"type": "coins", "amount": 2500}'),
('godlike', 'Godlike', 'Win 20 games in a row', 'star', 'legendary', 'gaming', '{"type": "win_streak", "value": 20}', '{"type": "coins", "amount": 5000}')
ON CONFLICT (id) DO NOTHING;
