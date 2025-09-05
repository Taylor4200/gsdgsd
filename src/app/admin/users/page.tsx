'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Download, 
  Shield, 
  Crown, 
  Star, 
  User, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import UserDetailsModal from '@/components/admin/UserDetailsModal'

interface User {
  id: string
  email: string
  username: string
  createdAt: string
  lastSignIn: string | null
  emailConfirmed: string | null
  isMod: boolean
  isVip: boolean
  level: number
  isAdmin: boolean
}

interface UserStats {
  totalUsers: number
  confirmedUsers: number
  modUsers: number
  vipUsers: number
  regularUsers: number
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<User>>({})
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (data.users) {
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' })
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [currentPage, searchTerm, roleFilter])

  const handleRoleUpdate = async (userId: string, role: string, value: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, value })
      })

      if (response.ok) {
        await fetchUsers() // Refresh the list
        setEditingUser(null)
        setEditValues({})
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user.id)
    setEditValues({
      isMod: user.isMod,
      isVip: user.isVip,
      level: user.level
    })
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setEditValues({})
  }

  const saveEdit = async (userId: string) => {
    if (editValues.isMod !== undefined) {
      await handleRoleUpdate(userId, 'isMod', editValues.isMod)
    }
    if (editValues.isVip !== undefined) {
      await handleRoleUpdate(userId, 'isVip', editValues.isVip)
    }
    if (editValues.level !== undefined) {
      await handleRoleUpdate(userId, 'level', editValues.level)
    }
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

  const getUserRole = (user: User) => {
    if (user.isAdmin) return { label: 'Admin', color: 'text-red-400', icon: Shield }
    if (user.isMod) return { label: 'Moderator', color: 'text-blue-400', icon: Shield }
    if (user.isVip) return { label: 'VIP', color: 'text-yellow-400', icon: Crown }
    return { label: 'Regular', color: 'text-gray-400', icon: User }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-gray-400">Manage your casino operations and monitor performance</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-[#1a2c38] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <User className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-[#1a2c38] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold text-white">{stats.confirmedUsers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-[#1a2c38] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Moderators</p>
                  <p className="text-2xl font-bold text-white">{stats.modUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-[#1a2c38] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">VIP Users</p>
                  <p className="text-2xl font-bold text-white">{stats.vipUsers}</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-[#1a2c38] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Regular Users</p>
                  <p className="text-2xl font-bold text-white">{stats.regularUsers}</p>
                </div>
                <User className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* User Management Card */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <div className="flex items-center space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="mod">Moderator</option>
              <option value="vip">VIP</option>
              <option value="regular">Regular</option>
            </select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const role = getUserRole(user)
                    const RoleIcon = role.icon
                    
                    return (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.username}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <RoleIcon className={`h-4 w-4 ${role.color}`} />
                            <span className={`text-sm font-medium ${role.color}`}>
                              {role.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {editingUser === user.id ? (
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={editValues.level || user.level}
                              onChange={(e) => setEditValues(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                              className="w-20"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">Level {user.level}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {user.emailConfirmed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">
                              {user.emailConfirmed ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id)
                                setShowUserDetails(true)
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              View Details
                            </Button>
                            {editingUser === user.id ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(user.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(user)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false)
          setSelectedUser(null)
        }}
        userId={selectedUser || ''}
        onUserUpdate={fetchUsers}
      />
    </div>
  )
}

export default AdminUsersPage
