'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  DollarSign, 
  Gamepad2, 
  BarChart3, 
  Settings, 
  Shield, 
  FileText, 
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Lock,
  LogOut,
  Menu,
  X,
  Star,
  Ticket,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Calendar,
  Gift
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  pendingWithdrawals: number
  activeGames: number
  supportTickets: number
  dailyDeposits: number
  monthlyDeposits: number
  longTermRTP: number
  averageBetSize: number
  totalBets: number
  totalWins: number
  jackpotPayouts: number
  newUsersToday: number
  retentionRate: number
  averageSessionTime: number
}

interface NewsItem {
  id: string
  title: string
  content: string
  type: 'update' | 'announcement' | 'promotion' | 'maintenance'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  author: string
  tags: string[]
}

interface RecentActivity {
  id: string
  type: 'user' | 'transaction' | 'game' | 'support'
  action: string
  user: string
  time: string
  status: 'pending' | 'completed' | 'failed'
}

interface Raffle {
  id: string
  title: string
  description: string
  total_prize: number
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'ended' | 'completed'
  raffle_prizes: Array<{
    id: string
    place: number
    amount: number
    percentage: number
  }>
  raffle_game_multipliers: Array<{
    id: string
    game_id: string
    game_name: string
    multiplier: number
    wager_requirement: number
    tickets_per_wager: number
  }>
}

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    activeGames: 0,
    supportTickets: 0,
    dailyDeposits: 0,
    monthlyDeposits: 0,
    longTermRTP: 96.8,
    averageBetSize: 0,
    totalBets: 0,
    totalWins: 0,
    jackpotPayouts: 0,
    newUsersToday: 0,
    retentionRate: 0,
    averageSessionTime: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [showCreateRaffleModal, setShowCreateRaffleModal] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null)
  const { user } = useUserStore()
  const router = useRouter()

  // Raffle form state
  const [raffleFormData, setRaffleFormData] = useState({
    title: '',
    total_prize: '',
    start_date: '',
    end_date: '',
    prize_pool: '',
    top_winners: '10',
    remaining_winners: '90',
    top_winners_percentage: '60',
    remaining_winners_percentage: '40',
    game_multipliers: [
      { game_id: 'general', game_name: 'All Games', multiplier: '1.00', wager_requirement: '1000', tickets_per_wager: '1' }
    ]
  })

  // Available games for multipliers
  const availableGames = [
    { id: 'general', name: 'All Games' },
    { id: 'blackjack', name: 'Blackjack' },
    { id: 'baccarat', name: 'Baccarat' },
    { id: 'dice', name: 'Dice' },
    { id: 'limbo', name: 'Limbo' },
    { id: 'minesweeper', name: 'Minesweeper' },
    { id: 'plinko', name: 'Plinko' }
  ]

  // Mock news items
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'New VIP Telegram Channel Launch',
      content: 'We are excited to announce the launch of our exclusive VIP Telegram channel! Join now for special bonuses, early access to new games, and exclusive promotions.',
      type: 'announcement',
      priority: 'high',
      isPublished: true,
      publishedAt: new Date('2024-01-15T10:00:00Z'),
      createdAt: new Date('2024-01-15T09:30:00Z'),
      author: 'admin',
      tags: ['vip', 'telegram', 'bonuses']
    },
    {
      id: '2',
      title: 'Weekly Tournament Winners Announced',
      content: 'Congratulations to this week\'s tournament champions! Check out the leaderboard to see who took home the biggest prizes.',
      type: 'update',
      priority: 'medium',
      isPublished: true,
      publishedAt: new Date('2024-01-14T18:00:00Z'),
      createdAt: new Date('2024-01-14T17:45:00Z'),
      author: 'admin',
      tags: ['tournament', 'winners', 'leaderboard']
    },
    {
      id: '3',
      title: '50% Bonus on All Deposits This Weekend',
      content: 'Limited time offer! Get 50% bonus on all deposits this weekend. Don\'t miss out on this amazing promotion!',
      type: 'promotion',
      priority: 'high',
      isPublished: true,
      publishedAt: new Date('2024-01-13T12:00:00Z'),
      createdAt: new Date('2024-01-13T11:30:00Z'),
      author: 'admin',
      tags: ['bonus', 'deposit', 'weekend']
    },
    {
      id: '4',
      title: 'Scheduled Maintenance - January 20th',
      content: 'We will be performing scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EST. During this time, the casino will be temporarily unavailable.',
      type: 'maintenance',
      priority: 'critical',
      isPublished: false,
      createdAt: new Date('2024-01-12T15:00:00Z'),
      author: 'admin',
      tags: ['maintenance', 'scheduled', 'downtime']
    }
  ])

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'raffles', label: 'Raffles', icon: Ticket },
    { id: 'support', label: 'Support', icon: Bell },
    { id: 'news', label: 'News', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  useEffect(() => {
    // Check if user is admin (in real app, this would be a proper auth check)
    if (user?.role === 'admin') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [user])

  // Fetch real admin data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData()
      fetchRaffles()
    }
  }, [isAuthenticated])

  const fetchRaffles = async () => {
    try {
      console.log('🔄 Fetching raffles...')
      const response = await fetch('/api/raffles?includeEnded=true&status=all')
      const data = await response.json()
      console.log('📊 Raffles response:', data)
      console.log('📊 Raffles array:', data.raffles)
      console.log('📊 Raffles length:', data.raffles?.length)
      setRaffles(data.raffles || [])
    } catch (error) {
      console.error('❌ Error fetching raffles:', error)
    }
  }

  const handleCreateRaffle = async () => {
    try {
      const prizes = calculatePrizeDistribution()
      const raffleData = {
        ...raffleFormData,
        prizes: prizes
      }

      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raffleData)
      })

      if (response.ok) {
        setShowCreateRaffleModal(false)
        resetRaffleForm()
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error creating raffle:', error)
    }
  }

  const handleUpdateRaffle = async () => {
    if (!editingRaffle) return

    try {
      const prizes = calculatePrizeDistribution()
      const raffleData = {
        raffle_id: editingRaffle.id,
        ...raffleFormData,
        prizes: prizes
      }

      const response = await fetch('/api/raffles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raffleData)
      })

      if (response.ok) {
        setEditingRaffle(null)
        resetRaffleForm()
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error updating raffle:', error)
    }
  }

  const handleDeleteRaffle = async (raffleId: string) => {
    if (!confirm('Are you sure you want to delete this raffle?')) return

    try {
      const response = await fetch('/api/raffles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffle_id: raffleId })
      })

      if (response.ok) {
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error deleting raffle:', error)
    }
  }

  const handleRaffleStatusChange = async (raffleId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/raffles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffle_id: raffleId,
          status: newStatus
        })
      })

      if (response.ok) {
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error updating raffle status:', error)
    }
  }

  const resetRaffleForm = () => {
    setRaffleFormData({
      title: '',
      total_prize: '',
      start_date: '',
      end_date: '',
      prize_pool: '',
      top_winners: '10',
      remaining_winners: '90',
      top_winners_percentage: '60',
      remaining_winners_percentage: '40',
      game_multipliers: [
        { game_id: 'general', game_name: 'All Games', multiplier: '1.00', wager_requirement: '1000', tickets_per_wager: '1' }
      ]
    })
  }

  const openEditRaffleModal = (raffle: Raffle) => {
    setEditingRaffle(raffle)
    setRaffleFormData({
      title: raffle.title,
      total_prize: raffle.total_prize.toString(),
      start_date: raffle.start_date.split('T')[0],
      end_date: raffle.end_date.split('T')[0],
      prize_pool: raffle.total_prize.toString(),
      top_winners: '10',
      remaining_winners: '90',
      top_winners_percentage: '60',
      remaining_winners_percentage: '40',
      game_multipliers: raffle.raffle_game_multipliers.map(mult => ({
        game_id: mult.game_id,
        game_name: mult.game_name,
        multiplier: mult.multiplier.toString(),
        wager_requirement: mult.wager_requirement.toString(),
        tickets_per_wager: mult.tickets_per_wager.toString()
      }))
    })
  }

  const addGameMultiplier = () => {
    setRaffleFormData(prev => ({
      ...prev,
      game_multipliers: [...prev.game_multipliers, { 
        game_id: 'general', 
        game_name: 'All Games', 
        multiplier: '1.00', 
        wager_requirement: '1000', 
        tickets_per_wager: '1' 
      }]
    }))
  }

  const removeGameMultiplier = (index: number) => {
    setRaffleFormData(prev => ({
      ...prev,
      game_multipliers: prev.game_multipliers.filter((_, i) => i !== index)
    }))
  }

  const updateGameMultiplier = (index: number, field: string, value: string) => {
    setRaffleFormData(prev => ({
      ...prev,
      game_multipliers: prev.game_multipliers.map((mult, i) => 
        i === index ? { ...mult, [field]: value } : mult
      )
    }))
  }

  const calculatePrizeDistribution = () => {
    const prizePool = parseFloat(raffleFormData.prize_pool) || 0
    const topWinners = parseInt(raffleFormData.top_winners) || 0
    const remainingWinners = parseInt(raffleFormData.remaining_winners) || 0
    const topPercentage = parseFloat(raffleFormData.top_winners_percentage) || 60
    const remainingPercentage = parseFloat(raffleFormData.remaining_winners_percentage) || 40
    
    if (prizePool === 0 || topWinners === 0) return []

    const prizes = []
    
    // Top winners get custom percentage of pool
    const topPrizeTotal = prizePool * (topPercentage / 100)
    const remainingPrizeTotal = prizePool * (remainingPercentage / 100)
    
    // Calculate top prizes (decreasing amounts)
    for (let i = 1; i <= topWinners; i++) {
      const percentage = (topWinners - i + 1) / (topWinners * (topWinners + 1) / 2) // Decreasing distribution
      const amount = topPrizeTotal * percentage
      prizes.push({
        place: i,
        amount: Math.round(amount),
        percentage: Math.round((amount / prizePool) * 100 * 100) / 100
      })
    }
    
    // Remaining winners get equal amounts
    if (remainingWinners > 0) {
      const equalAmount = remainingPrizeTotal / remainingWinners
      for (let i = topWinners + 1; i <= topWinners + remainingWinners; i++) {
        prizes.push({
          place: i,
          amount: Math.round(equalAmount),
          percentage: Math.round((equalAmount / prizePool) * 100 * 100) / 100
        })
      }
    }
    
    return prizes
  }

  const fetchAdminData = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch users created today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Fetch recent user registrations for activity feed
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, email, created_at, display_name')
        .order('created_at', { ascending: false })
        .limit(10)

      // Update stats
      setStats(prev => ({
        ...prev,
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.15), // Estimate 15% active users
        retentionRate: 78.5, // Mock retention rate
        averageSessionTime: 23.4 // Mock session time
      }))

      // Create recent activity from user registrations
      const activity: RecentActivity[] = recentUsers?.map((user, index) => ({
        id: `user-${user.id}`,
        type: 'user',
        action: 'New user registration',
        user: user.display_name || user.email?.split('@')[0] || 'Unknown',
        time: formatTimeAgo(new Date(user.created_at)),
        status: 'completed'
      })) || []

      setRecentActivity(activity)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would be a proper admin authentication
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid admin credentials')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminPassword('')
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getNewsTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'text-blue-600 bg-blue-100'
      case 'promotion':
        return 'text-purple-600 bg-purple-100'
      case 'maintenance':
        return 'text-red-600 bg-red-100'
      case 'update':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />
      case 'transaction':
        return <DollarSign className="h-4 w-4" />
      case 'game':
        return <Gamepad2 className="h-4 w-4" />
      case 'support':
        return <Bell className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-blue-200 text-xs">+{stats.newUsersToday} today</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Daily Deposits</p>
              <p className="text-3xl font-bold">${(stats.dailyDeposits / 1000).toFixed(0)}K</p>
              <p className="text-green-200 text-xs">Monthly: ${(stats.monthlyDeposits / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Long-term RTP</p>
              <p className="text-3xl font-bold">{stats.longTermRTP}%</p>
              <p className="text-purple-200 text-xs">Target: 96.5%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">${(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-orange-200 text-xs">Avg Bet: ${stats.averageBetSize}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Pending Withdrawals</p>
              <p className="text-3xl font-bold">{stats.pendingWithdrawals}</p>
              <p className="text-red-200 text-xs">Requires attention</p>
            </div>
            <Clock className="h-8 w-8 text-red-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Active Users</p>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
              <p className="text-indigo-200 text-xs">{stats.retentionRate}% retention</p>
            </div>
            <UserCheck className="h-8 w-8 text-indigo-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Jackpot Payouts</p>
              <p className="text-3xl font-bold">${(stats.jackpotPayouts / 1000).toFixed(0)}K</p>
              <p className="text-teal-200 text-xs">This month</p>
            </div>
            <Star className="h-8 w-8 text-teal-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Total Bets</p>
              <p className="text-3xl font-bold">${(stats.totalBets / 1000000).toFixed(1)}M</p>
              <p className="text-pink-200 text-xs">Total Wins: ${(stats.totalWins / 1000000).toFixed(1)}M</p>
            </div>
            <Gamepad2 className="h-8 w-8 text-pink-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Support Tickets</p>
              <p className="text-3xl font-bold">{stats.supportTickets}</p>
              <p className="text-yellow-200 text-xs">Open tickets</p>
            </div>
            <Bell className="h-8 w-8 text-yellow-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Session Time</p>
              <p className="text-3xl font-bold">{stats.averageSessionTime}m</p>
              <p className="text-cyan-200 text-xs">Average per user</p>
            </div>
            <Clock className="h-8 w-8 text-cyan-200" />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">by {activity.user} • {activity.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">User Management</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.push('/admin/users')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600 mb-4">Access the full user management system to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>View all registered users from Supabase</li>
            <li>Assign admin and moderator roles</li>
            <li>Search and filter users</li>
            <li>View user statistics and activity</li>
            <li>Manage user permissions and levels</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderTransactions = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Management</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Transactions
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600">Transaction management features would be implemented here</p>
        </div>
      </div>
    </div>
  )

  const renderGames = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Game Management</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Add Game
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Game Settings
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600">Game management features would be implemented here</p>
        </div>
      </div>
    </div>
  )

  const renderRaffles = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Raffle Management</h3>
          <p className="text-gray-600">Manage raffles, prizes, and game multipliers</p>
        </div>
        <Button
          onClick={() => setShowCreateRaffleModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Raffle
        </Button>
      </div>

      {/* Raffles List */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Found {raffles.length} raffles
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {raffles.map((raffle) => (
          <div
            key={raffle.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{raffle.title}</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                raffle.status === 'active' ? 'bg-green-100 text-green-800' :
                raffle.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                raffle.status === 'ended' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {raffle.status}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>${raffle.total_prize.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(raffle.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Gift className="h-4 w-4 mr-2" />
                <span>{raffle.raffle_prizes.length} prizes</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditRaffleModal(raffle)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteRaffle(raffle.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {raffle.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRaffleStatusChange(raffle.id, 'active')}
                  className="text-green-600 hover:text-green-700"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              {raffle.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRaffleStatusChange(raffle.id, 'ended')}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateRaffleModal || editingRaffle) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingRaffle ? 'Edit Raffle' : 'Create New Raffle'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  value={raffleFormData.title}
                  onChange={(e) => setRaffleFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="Weekly Raffle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prize Pool ($)</label>
                <input
                  type="number"
                  value={raffleFormData.prize_pool}
                  onChange={(e) => {
                    const prizePool = e.target.value
                    setRaffleFormData(prev => ({ 
                      ...prev, 
                      prize_pool: prizePool,
                      total_prize: prizePool // Auto-set total prize from pool
                    }))
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Top Winners</label>
                <input
                  type="number"
                  value={raffleFormData.top_winners}
                  onChange={(e) => setRaffleFormData(prev => ({ ...prev, top_winners: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Top winners get decreasing amounts (1st gets most)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Winners</label>
                <input
                  type="number"
                  value={raffleFormData.remaining_winners}
                  onChange={(e) => setRaffleFormData(prev => ({ ...prev, remaining_winners: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="90"
                />
                <p className="text-xs text-gray-500 mt-1">Remaining winners get equal amounts</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Top Winners %</label>
                <input
                  type="number"
                  value={raffleFormData.top_winners_percentage}
                  onChange={(e) => {
                    const topPercent = e.target.value
                    const remainingPercent = (100 - parseFloat(topPercent)).toString()
                    setRaffleFormData(prev => ({ 
                      ...prev, 
                      top_winners_percentage: topPercent,
                      remaining_winners_percentage: remainingPercent
                    }))
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="60"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage of pool for top winners</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Winners %</label>
                <input
                  type="number"
                  value={raffleFormData.remaining_winners_percentage}
                  onChange={(e) => {
                    const remainingPercent = e.target.value
                    const topPercent = (100 - parseFloat(remainingPercent)).toString()
                    setRaffleFormData(prev => ({ 
                      ...prev, 
                      remaining_winners_percentage: remainingPercent,
                      top_winners_percentage: topPercent
                    }))
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                  placeholder="40"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Percentage of pool for remaining winners</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={raffleFormData.start_date}
                  onChange={(e) => setRaffleFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={raffleFormData.end_date}
                  onChange={(e) => setRaffleFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
                />
              </div>
            </div>

            {/* Auto-calculated Prize Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prize Distribution Preview</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Top Winners ({raffleFormData.top_winners_percentage}% of pool)</h4>
                    <div className="space-y-1 text-sm">
                      {calculatePrizeDistribution().slice(0, parseInt(raffleFormData.top_winners) || 0).map((prize, index) => (
                        <div key={index} className="flex justify-between">
                          <span>#{prize.place}:</span>
                          <span className="font-medium">${prize.amount.toLocaleString()} ({prize.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Remaining Winners ({raffleFormData.remaining_winners_percentage}% of pool)</h4>
                    <div className="space-y-1 text-sm">
                      {parseInt(raffleFormData.remaining_winners) > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>#{parseInt(raffleFormData.top_winners) + 1} - #{parseInt(raffleFormData.top_winners) + parseInt(raffleFormData.remaining_winners)}:</span>
                            <span className="font-medium">${calculatePrizeDistribution()[parseInt(raffleFormData.top_winners)]?.amount.toLocaleString() || '0'} each</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Total: {parseInt(raffleFormData.remaining_winners)} winners × ${calculatePrizeDistribution()[parseInt(raffleFormData.top_winners)]?.amount.toLocaleString() || '0'} = ${((calculatePrizeDistribution()[parseInt(raffleFormData.top_winners)]?.amount || 0) * parseInt(raffleFormData.remaining_winners)).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-semibold">
                    <span>Total Prize Pool:</span>
                    <span>${raffleFormData.prize_pool ? parseFloat(raffleFormData.prize_pool).toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Requirements Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Ticket Requirements by Game</h3>
                <Button
                  onClick={addGameMultiplier}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Game
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Set how much users need to wager to earn tickets for each game
              </p>
              <div className="space-y-3">
                {raffleFormData.game_multipliers.map((multiplier, index) => (
                  <div key={index} className="grid grid-cols-5 gap-3 items-center">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Game</label>
                      <select
                        value={multiplier.game_id}
                        onChange={(e) => {
                          const game = availableGames.find(g => g.id === e.target.value)
                          updateGameMultiplier(index, 'game_id', e.target.value)
                          updateGameMultiplier(index, 'game_name', game?.name || '')
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800"
                      >
                        {availableGames.map(game => (
                          <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Wager Needed ($)</label>
                      <input
                        value={multiplier.wager_requirement}
                        onChange={(e) => updateGameMultiplier(index, 'wager_requirement', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tickets Earned</label>
                      <input
                        value={multiplier.tickets_per_wager}
                        onChange={(e) => updateGameMultiplier(index, 'tickets_per_wager', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Multiplier</label>
                      <input
                        value={multiplier.multiplier}
                        onChange={(e) => updateGameMultiplier(index, 'multiplier', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800"
                        placeholder="1.00"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeGameMultiplier(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowCreateRaffleModal(false)
                  setEditingRaffle(null)
                  resetRaffleForm()
                }}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={editingRaffle ? handleUpdateRaffle : handleCreateRaffle}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingRaffle ? 'Update Raffle' : 'Create Raffle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderSupport = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Support Management</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Bell className="h-4 w-4 mr-2" />
              View Tickets
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Support Agents
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600">Support management features would be implemented here</p>
        </div>
      </div>
    </div>
  )

  // News management functions
  const handleEditNews = (newsId: string) => {
    console.log('Editing news:', newsId)
    // In a real app, this would open an edit modal or navigate to edit page
  }

  const handleTogglePublish = (newsId: string) => {
    setNewsItems(prev => prev.map(news => 
      news.id === newsId 
        ? { ...news, isPublished: !news.isPublished, publishedAt: !news.isPublished ? new Date() : undefined }
        : news
    ))
  }

  const handleDeleteNews = (newsId: string) => {
    if (confirm('Are you sure you want to delete this news article?')) {
      setNewsItems(prev => prev.filter(news => news.id !== newsId))
    }
  }

  const renderNews = () => (
    <div className="space-y-6">
      {/* News Management Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">News Management</h3>
          <Button
            onClick={() => setActiveTab('news-create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Create News
          </Button>
        </div>

        {/* News Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="announcement">Announcement</option>
            <option value="promotion">Promotion</option>
            <option value="maintenance">Maintenance</option>
            <option value="update">Update</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {newsItems.map((news) => (
            <div key={news.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-800">{news.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNewsTypeColor(news.type)}`}>
                      {news.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(news.priority)}`}>
                      {news.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      news.isPublished ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {news.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{news.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>By {news.author}</span>
                    <span>Created: {news.createdAt.toLocaleDateString()}</span>
                    {news.publishedAt && (
                      <span>Published: {news.publishedAt.toLocaleDateString()}</span>
                    )}
                    <div className="flex space-x-1">
                      {news.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-200 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditNews(news.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(news.id)}
                    className={news.isPublished ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {news.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteNews(news.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Security Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Security Logs
            </Button>
            <Button variant="outline">
              <Lock className="h-4 w-4 mr-2" />
              Access Control
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600">Security management features would be implemented here</p>
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Reports & Analytics</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600">Reports and analytics features would be implemented here</p>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Admin Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button className="bg-gray-600 hover:bg-gray-700 text-white">
              <Settings className="h-4 w-4 mr-2" />
              General Settings
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Admin Users
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600">Admin settings would be implemented here</p>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return renderUsers()
      case 'transactions':
        return renderTransactions()
      case 'games':
        return renderGames()
      case 'raffles':
        return renderRaffles()
      case 'support':
        return renderSupport()
      case 'news':
        return renderNews()
      case 'security':
        return renderSecurity()
      case 'reports':
        return renderReports()
      case 'settings':
        return renderSettings()
      default:
        return renderDashboard()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-96">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src="/Logo11.png" 
                alt="EDGE Casino" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-2xl font-bold text-gray-800">EDGE</span>
            </div>
            <p className="text-gray-600 font-light">ADMIN PANEL</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              <Lock className="h-4 w-4 mr-2" />
              Login to Admin Panel
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Casino
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-[#1a2c38] border border-[#00d4ff] hover:bg-[#00d4ff]/10"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a2c38] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[#2a3c48]">
            <div className="flex items-center space-x-2">
              <img 
                src="/Logo11.png" 
                alt="EDGE Casino" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="text-2xl font-bold text-white">EDGE</span>
                <p className="text-[#00d4ff] font-light text-sm">ADMIN PANEL</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#00d4ff] text-[#0f1419]'
                    : 'text-gray-300 hover:bg-[#2a3c48] hover:text-white'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#2a3c48]">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {adminTabs.find(tab => tab.id === activeTab)?.label}
            </h1>
            <p className="text-gray-400">
              Manage your casino operations and monitor performance
            </p>
          </div>

          {renderContent()}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminPanel
