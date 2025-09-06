-- Fix Vietnamdong's level and stats
UPDATE user_profiles
SET
    level = 100,
    total_wagered = 50000,
    total_won = 45000,
    games_played = 1000,
    win_rate = 65.5,
    vip_tier = 3,
    is_vip = true,
    is_mod = true,
    is_admin = true,
    referral_code = 'VIETNAM100'
WHERE username = 'Vietnamdong';

-- Verify the update worked
SELECT username, level, total_wagered, total_won, games_played, win_rate, vip_tier, is_vip, is_mod, is_admin
FROM user_profiles
WHERE username = 'Vietnamdong';
