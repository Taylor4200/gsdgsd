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
  Star
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
  const { user } = useUserStore()
  const router = useRouter()

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
    }
  }, [isAuthenticated])

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
