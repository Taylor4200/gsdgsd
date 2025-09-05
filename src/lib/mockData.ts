import { User } from '@/types'

export const mockUser: User = {
  id: 'user-1',
  username: 'CryptoGamer',
  email: 'user@example.com',
  balance: 5000.00, // SC balance
  gcBalance: 10000.00, // GC balance
  sweepstakesCoins: 250.50, // Legacy field
  level: 25,
  experience: 24750,
  totalWagered: 125000,
  totalWon: 98500,
  joinedAt: new Date('2023-01-15'),
  lastActive: new Date(),
  achievements: [],
  referralCode: 'CRYPTO123',
  isGhostMode: false
}

// Function to simulate login
export const simulateLogin = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user-storage', JSON.stringify({
      state: {
        user: mockUser,
        isAuthenticated: true,
        achievements: []
      },
      version: 0
    }))
    window.location.reload()
  }
}
