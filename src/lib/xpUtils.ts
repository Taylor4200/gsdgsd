// XP System utilities
export const xpSystem = {
  // Calculate XP needed for next level based on VIP tiers
  getXPForNextLevel: (currentLevel: number): number => {
    const xpRequirements = [
      0,      // Level 0: Unranked
      5001,   // Level 1: Bronze
      20001,  // Level 2: Silver
      50001,  // Level 3: Gold
      150001, // Level 4: Platinum
      400001, // Level 5: Diamond
      1200001, // Level 6: Elite
      3000001  // Level 7: Legend
    ]
    return xpRequirements[Math.min(currentLevel, 7)] || 3000001
  },

  // Calculate level from XP based on VIP tiers
  getLevelFromXP: (xp: number): number => {
    const xpRequirements = [
      0,      // Level 0: Unranked
      5001,   // Level 1: Bronze
      20001,  // Level 2: Silver
      50001,  // Level 3: Gold
      150001, // Level 4: Platinum
      400001, // Level 5: Diamond
      1200001, // Level 6: Elite
      3000001  // Level 7: Legend
    ]
    
    for (let level = 7; level >= 0; level--) {
      if (xp >= xpRequirements[level]) {
        return level
      }
    }
    return 0
  },

  // Calculate XP progress to next level
  getXPProgress: (currentXP: number, currentLevel: number): { current: number; required: number; percentage: number } => {
    const xpForCurrentLevel = xpSystem.getXPForNextLevel(currentLevel)
    const xpForNextLevel = xpSystem.getXPForNextLevel(currentLevel + 1)
    const current = currentXP - xpForCurrentLevel
    const required = xpForNextLevel - xpForCurrentLevel
    const percentage = Math.min(100, Math.max(0, (current / required) * 100))
    
    return { current, required, percentage }
  },

  // Get VIP tier name from level
  getVIPTierName: (level: number): string => {
    const tierNames = [
      'Unranked',
      'Bronze',
      'Silver', 
      'Gold',
      'Platinum',
      'Diamond',
      'Elite',
      'Legend'
    ]
    return tierNames[Math.min(level, 7)] || 'Unranked'
  },

  // Calculate XP from SC/GC earnings
  calculateCoinXP: (sweepstakesCoins: number, goldCoins: number): number => {
    const scXP = sweepstakesCoins * xpSystem.rewards.SWEEPSTAKES_COIN
    const gcXP = goldCoins * xpSystem.rewards.GOLD_COIN
    return scXP + gcXP
  },

  // XP rewards for different actions
  rewards: {
    GAME_PLAYED: 10,
    GAME_WON: 25,
    DAILY_LOGIN: 50,
    ACHIEVEMENT_UNLOCKED: 100,
    REFERRAL_BONUS: 200,
    BIG_WIN: 50, // For wins over 10x bet
    STREAK_BONUS: 25, // Per win in streak
    LEVEL_UP: 500,
    // SC/GC XP rewards
    SWEEPSTAKES_COIN: 1,    // 1 XP per SC
    GOLD_COIN: 0.1          // 0.1 XP per GC
  }
}
