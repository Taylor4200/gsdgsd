'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  ArrowLeft,
  Save,
  Camera,
  Key,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useUserStore } from '@/store/userStore'
import Link from 'next/link'
import CasinoLayout from '@/components/layout/CasinoLayout'
import ChangePasswordModal from '@/components/modals/ChangePasswordModal'

const SettingsPage = () => {
  const { user, toggleGhostMode } = useUserStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [theme, setTheme] = useState('dark')
  const [memberSince, setMemberSince] = useState('')
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  useEffect(() => {
    // Format date consistently on client side only
    setMemberSince(new Date().toLocaleDateString())
  }, [])

  const settingsTabs = [
    {
      id: 'profile',
      label: 'Profile Settings',
      description: 'Update your profile information',
      icon: User,
      component: 'EditProfile'
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Manage your account security',
      icon: Shield,
      component: 'SecuritySettings'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Control your notification preferences',
      icon: Bell,
      component: 'NotificationSettings'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      description: 'Customize the look and feel',
      icon: Palette,
      component: 'AppearanceSettings'
    }
  ]

  const ProfileSettings = () => (
    <div className="space-y-6">
      <Card variant="glass" className="border-[#2d3748]">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{user?.username || user?.email?.split('@')[0] || 'User'}</h3>
              <p className="text-gray-400">Member since {memberSince}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <Input
                value={user?.username || user?.email?.split('@')[0] || ''}
                disabled
                className="bg-[#1a2c38]/50 border-[#2d3748] text-gray-400 cursor-not-allowed"
                placeholder="Username editing coming soon"
              />
              <p className="text-xs text-gray-500 mt-1">Username editing will be available soon</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-[#1a2c38]/50 border-[#2d3748] text-gray-400 cursor-not-allowed"
                placeholder="Email"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              disabled 
              className="bg-gray-600 text-gray-400 cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SecuritySettings = () => (
    <div className="space-y-6">
      <Card variant="glass" className="border-[#2d3748]">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-[#00d4ff]" />
                <div>
                  <h4 className="text-white font-medium">Password</h4>
                  <p className="text-sm text-gray-400">Last changed 30 days ago</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#2d3748]"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-[#00d4ff]" />
                <div>
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-400">Add an extra layer of security</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-[#2d3748]">
                Enable 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#00d4ff]" />
                <div>
                  <h4 className="text-white font-medium">Email Verification</h4>
                  <p className="text-sm text-gray-400">Verify your email address</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-[#00d4ff]" />
                <div>
                  <h4 className="text-white font-medium">Ghost Mode</h4>
                  <p className="text-sm text-gray-400">Hide your statistics from other users</p>
                </div>
              </div>
              <Button 
                variant={user?.isGhostMode ? "default" : "outline"} 
                size="sm" 
                onClick={toggleGhostMode}
                className={user?.isGhostMode ? "bg-[#00d4ff] text-black" : "border-[#2d3748]"}
              >
                {user?.isGhostMode ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const NotificationSettings = () => (
    <div className="space-y-6">
      <Card variant="glass" className="border-[#2d3748]">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Game Notifications</h4>
                <p className="text-sm text-gray-400">Get notified about game updates and events</p>
              </div>
              <Button variant="default" size="sm" className="bg-[#00d4ff] text-black">
                Enabled
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Promotional Emails</h4>
                <p className="text-sm text-gray-400">Receive special offers and promotions</p>
              </div>
              <Button variant="outline" size="sm" className="border-[#2d3748]">
                Disabled
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Security Alerts</h4>
                <p className="text-sm text-gray-400">Get notified about account security events</p>
              </div>
              <Button variant="default" size="sm" className="bg-[#00d4ff] text-black">
                Enabled
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Win Notifications</h4>
                <p className="text-sm text-gray-400">Celebrate your wins with notifications</p>
              </div>
              <Button variant="default" size="sm" className="bg-[#00d4ff] text-black">
                Enabled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const AppearanceSettings = () => (
    <div className="space-y-6">
      <Card variant="glass" className="border-[#2d3748]">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Appearance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-4">Theme</h4>
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  theme === 'light' 
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                    : 'border-[#2d3748] bg-black/20 hover:border-[#00d4ff]/50'
                }`}
                onClick={() => setTheme('light')}
              >
                <Sun className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-center text-sm text-white">Light</p>
              </div>
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  theme === 'dark' 
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                    : 'border-[#2d3748] bg-black/20 hover:border-[#00d4ff]/50'
                }`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-center text-sm text-white">Dark</p>
              </div>
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  theme === 'auto' 
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                    : 'border-[#2d3748] bg-black/20 hover:border-[#00d4ff]/50'
                }`}
                onClick={() => setTheme('auto')}
              >
                <Monitor className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-center text-sm text-white">Auto</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Language</h4>
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-[#00d4ff]" />
              <select className="bg-[#1a2c38] border-[#2d3748] rounded-lg px-3 py-2 text-white">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />
      case 'security':
        return <SecuritySettings />
      case 'notifications':
        return <NotificationSettings />
      case 'appearance':
        return <AppearanceSettings />
      default:
        return <ProfileSettings />
    }
  }

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400">Customize your gaming experience</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card variant="glass" className="border-[#2d3748]">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {settingsTabs.map((tab) => (
                      <motion.div
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full justify-start p-0 h-auto min-h-[50px] ${
                            activeTab === tab.id 
                              ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <tab.icon className="h-5 w-5 mr-3 flex-shrink-0 mt-1" />
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium mb-1">{tab.label}</div>
                            <div className="text-xs opacity-70 leading-relaxed">{tab.description}</div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </CasinoLayout>
  )
}

export default SettingsPage
