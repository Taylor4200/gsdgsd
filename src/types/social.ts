// Social Features Type Definitions
// Comprehensive types for friends, messaging, achievements, leaderboards, and social betting

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: Date
  accepted_at?: Date
  friend_profile?: UserProfile
}

export interface FriendRequest {
  id: string
  user_id: string
  friend_id: string
  status: 'pending'
  created_at: Date
  requester_profile?: UserProfile
}

export interface PrivateMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: Date
  read_at?: Date
  sender_profile?: UserProfile
}

export interface Conversation {
  id: string
  user_id: string
  other_user_id: string
  other_user_profile: UserProfile
  last_message?: PrivateMessage
  unread_count: number
  updated_at: Date
}

export interface SocialBettingSession {
  id: string
  user_id: string
  watcher_id: string
  game_session_id: string
  created_at: Date
  game_session?: GameSession
  user_profile?: UserProfile
  watcher_profile?: UserProfile
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  achievement_name: string
  achievement_description: string
  achievement_icon: string
  achievement_rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked_at?: Date
  progress: number
  max_progress: number
  is_completed: boolean
}

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'gaming' | 'social' | 'vip' | 'special'
  requirements: {
    type: 'bet_amount' | 'win_streak' | 'games_played' | 'vip_level' | 'friends_count' | 'messages_sent' | 'private_messages_sent' | 'social_betting_sessions' | 'first_win' | 'single_win' | 'jackpot_hit'
    value: number
    game_type?: string
  }
  reward: {
    type: 'coins' | 'experience' | 'badge'
    amount: number
  }
  is_active: boolean
  created_at: Date
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  game_type?: string
  metric: 'total_wagered' | 'total_won' | 'games_played' | 'win_rate' | 'biggest_win'
  value: number
  rank: number
  updated_at: Date
  user_profile?: UserProfile
}

export interface UserProfile {
  id: string
  username: string
  avatar?: string
  level: number
  vip_tier?: string
  is_online: boolean
  last_active: Date
  total_wagered: number
  total_won: number
  games_played: number
  win_rate: number
  biggest_win: number
  achievements_count: number
  friends_count: number
  is_ghost_mode: boolean
}

export interface GameSession {
  id: string
  user_id: string
  game_id: string
  game_name: string
  bet_amount: number
  win_amount: number
  result: 'win' | 'loss' | 'tie'
  multiplier: number
  session_data: any
  created_at: Date
  user_profile?: UserProfile
}

// Social feature enums
export enum FriendStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked'
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum AchievementCategory {
  GAMING = 'gaming',
  SOCIAL = 'social',
  VIP = 'vip',
  SPECIAL = 'special'
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time'
}

export enum LeaderboardMetric {
  TOTAL_WAGERED = 'total_wagered',
  TOTAL_WON = 'total_won',
  GAMES_PLAYED = 'games_played',
  WIN_RATE = 'win_rate',
  BIGGEST_WIN = 'biggest_win'
}

// WebSocket message types for social features
export interface SocialWebSocketMessage {
  type: 'friend_request' | 'friend_accept' | 'friend_block' | 'private_message' | 'achievement_unlock' | 'leaderboard_update' | 'social_betting_start' | 'social_betting_end' | 'user_online' | 'user_offline'
  data: any
  timestamp: Date
}

// Social feature API response types
export interface FriendsResponse {
  friends: Friend[]
  friend_requests: FriendRequest[]
  total_count: number
}

export interface MessagesResponse {
  messages: PrivateMessage[]
  conversations: Conversation[]
  unread_count: number
}

export interface AchievementsResponse {
  achievements: UserAchievement[]
  definitions: AchievementDefinition[]
  total_count: number
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  user_rank?: number
  total_participants: number
}

export interface SocialBettingResponse {
  active_sessions: SocialBettingSession[]
  friends_playing: UserProfile[]
  total_watchers: number
}

// Social feature form types
export interface AddFriendForm {
  username: string
}

export interface SendMessageForm {
  recipient_id: string
  content: string
}

export interface AchievementProgress {
  achievement_id: string
  current_progress: number
  max_progress: number
  is_completed: boolean
  percentage: number
}

// Social feature notification types
export interface SocialNotification {
  id: string
  type: 'friend_request' | 'message_received' | 'achievement_unlocked' | 'friend_online' | 'friend_playing'
  title: string
  message: string
  data?: any
  is_read: boolean
  created_at: Date
}

// Social feature statistics
export interface SocialStats {
  total_friends: number
  pending_requests: number
  unread_messages: number
  achievements_unlocked: number
  social_betting_sessions: number
  leaderboard_rank?: number
  social_score: number
}
