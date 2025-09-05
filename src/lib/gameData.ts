export interface Game {
  id: string
  name: string
  provider: string
  category: 'slots' | 'table' | 'live' | 'originals' | 'crash' | 'dice' | 'roulette' | 'blackjack' | 'baccarat' | 'poker' | 'game-show'
  type?: 'roulette' | 'blackjack' | 'baccarat' | 'poker' | 'game-show'
  players: number
  rtp: number
  isNew?: boolean
  isHot?: boolean
  isExclusive?: boolean
  isFeatured?: boolean
  image: string
  tags?: string[]
  recentWin?: number
  popularity?: number
  volatility?: 'low' | 'medium' | 'high'
  minBet?: number
  maxBet?: number
  jackpot?: number
  dealer?: string
  language?: string
  tableLimit?: string
  thumbnail?: string
  isFavorite?: boolean
}

export const games: Game[] = [
  // SLOTS GAMES
  {
    id: 'sweet-bonanza',
    name: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    category: 'slots',
    players: 1247,
    rtp: 96.51,
    isHot: true,
    isFeatured: true,
    image: '/Sweet1000.avif',
    tags: ['sweet', 'bonanza', 'pragmatic', 'popular'],
    popularity: 95,
    volatility: 'high',
    minBet: 0.20,
    maxBet: 100
  },
  {
    id: 'gates-of-olympus',
    name: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    category: 'slots',
    players: 892,
    rtp: 96.50,
    isHot: true,
    isFeatured: true,
    image: '/GemGhosts.avif',
    tags: ['gates', 'olympus', 'pragmatic', 'greek'],
    popularity: 92,
    volatility: 'high',
    minBet: 0.20,
    maxBet: 100
  },
  {
    id: 'book-of-dead',
    name: 'Book of Dead',
    provider: 'Play\'n GO',
    category: 'slots',
    players: 634,
    rtp: 94.25,
    image: '/RoyalHunt.avif',
    tags: ['book', 'dead', 'egyptian', 'adventure'],
    popularity: 88,
    volatility: 'high',
    minBet: 0.10,
    maxBet: 50
  },
  {
    id: 'mega-moolah',
    name: 'Mega Moolah',
    provider: 'Microgaming',
    category: 'slots',
    players: 567,
    rtp: 88.12,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['mega', 'moolah', 'progressive', 'jackpot'],
    popularity: 85,
    volatility: 'high',
    minBet: 0.25,
    maxBet: 125,
    jackpot: 1000000
  },
  {
    id: 'starburst',
    name: 'Starburst',
    provider: 'NetEnt',
    category: 'slots',
    players: 445,
    rtp: 96.09,
    image: '/SweetXmas.avif',
    tags: ['starburst', 'gems', 'classic'],
    popularity: 90,
    volatility: 'low',
    minBet: 0.10,
    maxBet: 100
  },

  // TABLE GAMES
  {
    id: 'blackjack-classic',
    name: 'Blackjack Classic',
    provider: 'NetEnt',
    category: 'table',
    players: 234,
    rtp: 99.28,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['blackjack', 'classic', 'card', 'game'],
    popularity: 85,
    volatility: 'low',
    minBet: 1,
    maxBet: 1000
  },
  {
    id: 'european-roulette',
    name: 'European Roulette',
    provider: 'NetEnt',
    category: 'table',
    players: 189,
    rtp: 97.30,
    image: '/Sugar1000.avif',
    tags: ['european', 'roulette', 'wheel', 'classic'],
    popularity: 88,
    volatility: 'low',
    minBet: 0.10,
    maxBet: 1000
  },
  {
    id: 'baccarat-pro',
    name: 'Baccarat Pro',
    provider: 'Microgaming',
    category: 'table',
    players: 145,
    rtp: 98.94,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['baccarat', 'pro', 'card', 'game'],
    popularity: 82,
    volatility: 'low',
    minBet: 1,
    maxBet: 500
  },

  // LIVE CASINO GAMES
  {
    id: 'lightning-roulette',
    name: 'Lightning Roulette',
    provider: 'Evolution Gaming',
    category: 'live',
    type: 'roulette',
    players: 445,
    rtp: 97.30,
    isNew: true,
    isHot: true,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['lightning', 'roulette', 'live', 'dealer'],
    popularity: 95,
    volatility: 'low',
    minBet: 0.20,
    maxBet: 2000,
    dealer: 'Sarah',
    language: 'English',
    tableLimit: '€2000'
  },
  {
    id: 'blackjack-vip',
    name: 'Blackjack VIP',
    provider: 'Evolution Gaming',
    category: 'live',
    type: 'blackjack',
    players: 234,
    rtp: 99.28,
    isHot: true,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['blackjack', 'vip', 'live', 'dealer'],
    popularity: 90,
    volatility: 'low',
    minBet: 1,
    maxBet: 5000,
    dealer: 'Mike',
    language: 'English',
    tableLimit: '€5000'
  },
  {
    id: 'speed-baccarat',
    name: 'Speed Baccarat',
    provider: 'Evolution Gaming',
    category: 'live',
    type: 'baccarat',
    players: 189,
    rtp: 98.94,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['speed', 'baccarat', 'live', 'dealer'],
    popularity: 85,
    volatility: 'low',
    minBet: 0.50,
    maxBet: 1000,
    dealer: 'Emma',
    language: 'English',
    tableLimit: '€1000'
  },
  {
    id: 'crazy-time',
    name: 'Crazy Time',
    provider: 'Evolution Gaming',
    category: 'live',
    type: 'game-show',
    players: 156,
    rtp: 96.08,
    isHot: true,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['crazy', 'time', 'game', 'show'],
    popularity: 92,
    volatility: 'high',
    minBet: 0.10,
    maxBet: 500,
    dealer: 'Alex',
    language: 'English',
    tableLimit: '€500'
  },

  // EDGE ORIGINALS GAMES
  {
    id: 'dice',
    name: 'Edge Dice',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 445,
    rtp: 97.00,
    isExclusive: true,
    image: '/dce2.avif',
    tags: ['edge', 'dice', 'exclusive', 'original'],
    popularity: 88,
    volatility: 'medium',
    minBet: 0.10,
    maxBet: 500
  },
  {
    id: 'crash',
    name: 'Edge Crash',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 567,
    rtp: 97.00,
    isExclusive: true,
    isHot: true,
    isFeatured: true,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['edge', 'crash', 'exclusive', 'original'],
    popularity: 95,
    volatility: 'high',
    minBet: 0.10,
    maxBet: 1000
  },
  {
    id: 'limbo',
    name: 'Edge Limbo',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 423,
    rtp: 99.00,
    isExclusive: true,
    isHot: true,
    isFeatured: true,
    image: '/limbo.avif',
    tags: ['edge', 'limbo', 'exclusive', 'original', 'multiplier'],
    popularity: 92,
    volatility: 'high',
    minBet: 0.01,
    maxBet: 10000
  },
  {
    id: 'roulette',
    name: 'Edge Roulette',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 234,
    rtp: 97.30,
    isExclusive: true,
    image: '', // Will show "IMAGE COMING SOON"
    tags: ['edge', 'roulette', 'exclusive', 'original'],
    popularity: 85,
    volatility: 'low',
    minBet: 0.10,
    maxBet: 1000
  },
  {
    id: 'blackjack',
    name: 'Edge Blackjack',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 189,
    rtp: 99.28,
    isExclusive: true,
    image: '/blackjack.avif',
    tags: ['edge', 'blackjack', 'exclusive', 'original'],
    popularity: 82,
    volatility: 'low',
    minBet: 1,
    maxBet: 1000
  },
  {
    id: 'baccarat',
    name: 'Edge Baccarat',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 156,
    rtp: 98.94,
    isExclusive: true,
    image: '/baccarat.avif',
    tags: ['edge', 'baccarat', 'exclusive', 'original'],
    popularity: 78,
    volatility: 'low',
    minBet: 1,
    maxBet: 500
  },
  {
    id: 'plinko',
    name: 'Edge Plinko',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 312,
    rtp: 98.00,
    isExclusive: true,
    isHot: true,
    isFeatured: true,
    image: '/plinko1.avif',
    tags: ['edge', 'plinko', 'exclusive', 'original', 'balls'],
    popularity: 89,
    volatility: 'high',
    minBet: 0.01,
    maxBet: 1000
  },
  {
    id: 'minesweeper',
    name: 'Edge Minesweeper',
    provider: 'EDGE ORIGINALS',
    category: 'originals',
    players: 267,
    rtp: 98.00,
    isExclusive: true,
    isHot: true,
    isFeatured: true,
    image: '/mines.avif',
    tags: ['edge', 'minesweeper', 'exclusive', 'original', 'strategy'],
    popularity: 87,
    volatility: 'medium',
    minBet: 0.01,
    maxBet: 1000
  }
]

// Utility functions to filter games by category
export const getGamesByCategory = (category: string): Game[] => {
  return games.filter(game => game.category === category)
}

export const getLiveGames = (): Game[] => {
  return games.filter(game => game.category === 'live')
}

export const getSlotsGames = (): Game[] => {
  return games.filter(game => game.category === 'slots')
}

export const getTableGames = (): Game[] => {
  return games.filter(game => game.category === 'table')
}

export const getOriginalsGames = (): Game[] => {
  return games.filter(game => game.category === 'originals')
}

export const getNewGames = (): Game[] => {
  return games.filter(game => game.isNew)
}

export const getHotGames = (): Game[] => {
  return games.filter(game => game.isHot)
}

export const getFeaturedGames = (): Game[] => {
  return games.filter(game => game.isFeatured)
}

// Get game counts for each category
export const getGameCounts = () => {
  return {
    all: games.length,
    slots: getSlotsGames().length,
    table: getTableGames().length,
    live: getLiveGames().length,
    new: getNewGames().length,
    originals: getOriginalsGames().length
  }
}

// Search games by name, provider, or tags
export const searchGames = (query: string): Game[] => {
  const lowercaseQuery = query.toLowerCase()
  return games.filter(game => 
    game.name.toLowerCase().includes(lowercaseQuery) ||
    game.provider.toLowerCase().includes(lowercaseQuery) ||
    game.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}
