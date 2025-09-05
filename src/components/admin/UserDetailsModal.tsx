'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Shield, 
  Crown, 
  User, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MessageSquare,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  AlertTriangle,
  Star,
  Trophy,
  Clock,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface UserDetails {
  id: string
  username: string
  email: string
  totalMessages: number
  firstMessage: string
  lastMessage: string
  isMod: boolean
  isVip: boolean
  isAdmin: boolean
  level: number
  totalBans: number
  isCurrentlyBanned: boolean
  banHistory: any[]
  totalDeposits: number
  totalWithdrawals: number
  netProfit: number
  lifetimeWagered: number
  totalBets: number
  totalWins: number
  biggestWin: number
  averageBet: number
  accountAge: string
  vipLevel: string
  favoriteGame: string
  lastActive: string
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
  emailConfirmed: boolean
  createdAt: string
}

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onUserUpdate: () => void
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  onUserUpdate 
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValues, setEditValues] = useState<Partial<UserDetails>>({})
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails()
    }
  }, [isOpen, userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`)
      const data = await response.json()
      
      if (data.user) {
        setUserDetails(data.user)
        setEditValues({
          isMod: data.user.isMod,
          isVip: data.user.isVip,
          isAdmin: data.user.isAdmin,
          level: data.user.level
        })
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (role: string, value: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, value })
      })

      if (response.ok) {
        await fetchUserDetails()
        onUserUpdate()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const startEdit = () => {
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditValues({
      isMod: userDetails?.isMod,
      isVip: userDetails?.isVip,
      isAdmin: userDetails?.isAdmin,
      level: userDetails?.level
    })
  }

  const saveEdit = async () => {
    if (editValues.isMod !== undefined) {
      await handleRoleUpdate('isMod', editValues.isMod)
    }
    if (editValues.isVip !== undefined) {
      await handleRoleUpdate('isVip', editValues.isVip)
    }
    if (editValues.isAdmin !== undefined) {
      await handleRoleUpdate('isAdmin', editValues.isAdmin)
    }
    if (editValues.level !== undefined) {
      await handleRoleUpdate('level', editValues.level)
    }
    setEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'chat', label: 'Chat History', icon: MessageSquare },
    { id: 'bans', label: 'Ban History', icon: Ban },
    { id: 'settings', label: 'Settings', icon: Edit }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {userDetails?.username || 'Loading...'}
                </h2>
                <p className="text-blue-100">
                  {userDetails?.email || 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {userDetails?.isCurrentlyBanned && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Ban className="h-4 w-4 inline mr-1" />
                  BANNED
                </div>
              )}
              {userDetails?.isAdmin && (
                <div className="bg-red-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4 inline mr-1" />
                  ADMIN
                </div>
              )}
              {userDetails?.isMod && (
                <div className="bg-blue-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4 inline mr-1" />
                  MODERATOR
                </div>
              )}
              {userDetails?.isVip && (
                <div className="bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Crown className="h-4 w-4 inline mr-1" />
                  VIP
                </div>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : userDetails ? (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Level</p>
                          <p className="text-2xl font-bold text-blue-800">{userDetails.level}</p>
                        </div>
                        <Star className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Total Messages</p>
                          <p className="text-2xl font-bold text-green-800">{userDetails.totalMessages}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Account Age</p>
                          <p className="text-lg font-bold text-purple-800">{userDetails.accountAge}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-400" />
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Favorite Game</p>
                          <p className="text-lg font-bold text-orange-800">{userDetails.favoriteGame}</p>
                        </div>
                        <Trophy className="h-8 w-8 text-orange-400" />
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">User ID</p>
                        <p className="font-mono text-sm">{userDetails.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Status</p>
                        <div className="flex items-center space-x-2">
                          {userDetails.emailConfirmed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {userDetails.emailConfirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">VIP Level</p>
                        <p className="font-medium">{userDetails.vipLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Active</p>
                        <p className="text-sm">{formatDate(userDetails.lastActive)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Streaks */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Gaming Streaks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Current Streak</p>
                        <p className="text-2xl font-bold text-blue-600">{userDetails.currentStreak}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Longest Win Streak</p>
                        <p className="text-2xl font-bold text-green-600">{userDetails.longestWinStreak}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Longest Loss Streak</p>
                        <p className="text-2xl font-bold text-red-600">{userDetails.longestLossStreak}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  {/* Financial Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Total Deposits</p>
                          <p className="text-2xl font-bold text-green-800">{formatCurrency(userDetails.totalDeposits)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-600 text-sm font-medium">Total Withdrawals</p>
                          <p className="text-2xl font-bold text-red-800">{formatCurrency(userDetails.totalWithdrawals)}</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-red-400" />
                      </div>
                    </div>
                    <div className={`rounded-lg p-4 ${userDetails.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${userDetails.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Net Profit
                          </p>
                          <p className={`text-2xl font-bold ${userDetails.netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                            {formatCurrency(userDetails.netProfit)}
                          </p>
                        </div>
                        {userDetails.netProfit >= 0 ? (
                          <TrendingUp className="h-8 w-8 text-green-400" />
                        ) : (
                          <TrendingDown className="h-8 w-8 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gaming Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Gaming Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Lifetime Wagered</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(userDetails.lifetimeWagered)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Bets</p>
                        <p className="text-xl font-bold text-gray-800">{userDetails.totalBets.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Wins</p>
                        <p className="text-xl font-bold text-gray-800">{userDetails.totalWins.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Average Bet</p>
                        <p className="text-xl font-bold text-gray-800">{formatCurrency(userDetails.averageBet)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Biggest Win</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(userDetails.biggestWin)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat History Tab */}
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Chat History</h3>
                    <div className="text-sm text-gray-600">
                      {userDetails.totalMessages} total messages
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-center py-8">
                      Chat history would be displayed here in a real implementation.
                      <br />
                      First message: {userDetails.firstMessage ? formatDate(userDetails.firstMessage) : 'N/A'}
                      <br />
                      Last message: {userDetails.lastMessage ? formatDate(userDetails.lastMessage) : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Ban History Tab */}
              {activeTab === 'bans' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Ban History</h3>
                    <div className="text-sm text-gray-600">
                      {userDetails.totalBans} total bans
                    </div>
                  </div>
                  {userDetails.totalBans > 0 ? (
                    <div className="space-y-2">
                      {userDetails.banHistory.map((ban, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-800">Ban #{index + 1}</p>
                              <p className="text-sm text-red-600">
                                Reason: {ban.reason || 'No reason provided'}
                              </p>
                              <p className="text-sm text-red-600">
                                Banned by: {ban.banned_by || 'Unknown'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-red-600">
                                {formatDate(ban.created_at)}
                              </p>
                              {ban.expires_at && (
                                <p className="text-sm text-red-600">
                                  Expires: {formatDate(ban.expires_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="text-green-800 font-medium">No ban history</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">User Settings</h3>
                    <div className="flex items-center space-x-2">
                      {editing ? (
                        <>
                          <Button
                            onClick={saveEdit}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={startEdit}
                          variant="outline"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Settings
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Moderator Status</p>
                          <p className="text-sm text-gray-600">Grant moderator privileges</p>
                        </div>
                        {editing ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editValues.isMod || false}
                              onChange={(e) => setEditValues(prev => ({ ...prev, isMod: e.target.checked }))}
                              className="rounded"
                            />
                          </label>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userDetails.isMod ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userDetails.isMod ? 'Moderator' : 'Regular User'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">VIP Status</p>
                          <p className="text-sm text-gray-600">Grant VIP privileges</p>
                        </div>
                        {editing ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editValues.isVip || false}
                              onChange={(e) => setEditValues(prev => ({ ...prev, isVip: e.target.checked }))}
                              className="rounded"
                            />
                          </label>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userDetails.isVip ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userDetails.isVip ? 'VIP' : 'Regular User'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Admin Status</p>
                          <p className="text-sm text-gray-600">Grant admin privileges</p>
                        </div>
                        {editing ? (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editValues.isAdmin || false}
                              onChange={(e) => setEditValues(prev => ({ ...prev, isAdmin: e.target.checked }))}
                              className="rounded"
                            />
                          </label>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userDetails.isAdmin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userDetails.isAdmin ? 'Admin' : 'Regular User'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">User Level</p>
                          <p className="text-sm text-gray-600">Set user level (1-100)</p>
                        </div>
                        {editing ? (
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={editValues.level || userDetails.level}
                            onChange={(e) => setEditValues(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                            className="w-20"
                          />
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                            Level {userDetails.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Failed to load user details</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default UserDetailsModal
