'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import ChatSidebar from './ChatSidebar'
import TopBar from './TopBar'
import MobileBottomNav from './MobileBottomNav'
import LegalFooter from './LegalFooter'
import WalletModal from '@/components/modals/WalletModal'
import SignupModal from '@/components/modals/SignupModal'
import LoginModal from '@/components/modals/LoginModal'
import EmailVerificationReminder from '@/components/modals/EmailVerificationReminder'
import LiveSupportWidget from '@/components/ui/LiveSupportWidget'
import LiveStatsModal from '@/components/ui/LiveStatsModal'
import MyBetsModal from '@/components/ui/MyBetsModal'
import BetHistoryScroll from '@/components/ui/BetHistoryScroll'
import LiveFeed from '@/components/ui/StakeLiveFeed'
import UserStatsModal from '@/components/modals/UserStatsModal'
import { FriendsModal } from '@/components/modals/FriendsModal'
import { LeaderboardsModal } from '@/components/modals/LeaderboardsModal'
import { AchievementsModal } from '@/components/modals/AchievementsModal'
import { SocialBettingModal } from '@/components/modals/SocialBettingModal'
import { useUIStore } from '@/store/uiStore'
import { useUserStore } from '@/store/userStore'

interface CasinoLayoutProps {
  children: React.ReactNode
  theatreMode?: boolean
}

const CasinoLayout: React.FC<CasinoLayoutProps> = ({ children, theatreMode = false }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false) // Default closed on mobile
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [userStatsModal, setUserStatsModal] = useState<{ isOpen: boolean; user: any }>({
    isOpen: false,
    user: null
  })
  
  // Social modal states
  const [friendsModalOpen, setFriendsModalOpen] = useState(false)
  const [leaderboardsModalOpen, setLeaderboardsModalOpen] = useState(false)
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false)
  const [socialBettingModalOpen, setSocialBettingModalOpen] = useState(false)
  
  const { showWalletModal, setWalletModal, showSignupModal, setSignupModal, showLoginModal, setLoginModal, showLiveStatsModal, setLiveStatsModal, showMyBetsModal, setMyBetsModal, showBetHistoryScroll, setBetHistoryScroll } = useUIStore()
  const { user } = useUserStore()

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Show email verification reminder for unverified users
  useEffect(() => {
    if (user && !user.emailConfirmed) {
      // Show verification reminder after a short delay
      const timer = setTimeout(() => {
        setShowEmailVerification(true)
      }, 2000) // 2 second delay
      
      return () => clearTimeout(timer)
    } else {
      setShowEmailVerification(false)
    }
  }, [user])

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        if (!isMobile) {
          setSidebarCollapsed(!sidebarCollapsed)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarCollapsed, isMobile])

  const handleShowUserStats = (user: any) => {
    setUserStatsModal({ isOpen: true, user })
  }

  const handleCloseUserStats = () => {
    setUserStatsModal({ isOpen: false, user: null })
  }

  const handleToggleSidebar = () => {
    if (isMobile) {
      // Mobile sidebar removed - functionality moved to bottom nav
      return
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const handleToggleChat = () => {
    if (isMobile) {
      setMobileChatOpen(!mobileChatOpen)
    } else {
      setChatOpen(!chatOpen)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white overflow-hidden">
      {/* Mobile Chat Overlay - Only show backdrop when chat is open */}
      <AnimatePresence>
        {mobileChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMobileChatOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          onOpenFriends={() => setFriendsModalOpen(true)}
          onOpenLeaderboards={() => setLeaderboardsModalOpen(true)}
          onOpenAchievements={() => setAchievementsModalOpen(true)}
          onOpenSocialBetting={() => setSocialBettingModalOpen(true)}
        />
      </div>


      {/* Right Chat Sidebar - Desktop */}
      <div className="hidden md:block">
        <ChatSidebar
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          collapsed={false}
          onShowUserStats={handleShowUserStats}
        />
      </div>

      {/* Right Chat Sidebar - Mobile */}
      <AnimatePresence>
        {mobileChatOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-[#0f1419] border-l border-[#1a2332] z-50 md:hidden"
          >
            <ChatSidebar
              isOpen={true}
              onToggle={() => setMobileChatOpen(false)}
              collapsed={false}
              onShowUserStats={handleShowUserStats}
              isMobile={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <TopBar 
        onToggleSidebar={handleToggleSidebar}
        onToggleChat={handleToggleChat}
        sidebarCollapsed={sidebarCollapsed}
        chatOpen={chatOpen}
        mobileChatOpen={mobileChatOpen}
      />

      {/* Main Content */}
      <motion.main
        className="transition-all duration-300 pt-16 md:pt-16"
        style={{
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 64 : 240),
          marginRight: isMobile ? (mobileChatOpen ? 320 : 0) : (chatOpen ? 320 : 0),
        }}
      >
        <div className="min-h-screen flex flex-col">
          <div className={`flex-1 px-4 md:px-6 ${isMobile ? 'pb-20' : ''}`}>
            {children}
          </div>
          <div className={`px-4 md:px-6 pt-12 pb-4 ${isMobile ? 'pb-24' : ''}`}>
            <LiveFeed />
          </div>
          <LegalFooter />
        </div>
      </motion.main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenFriends={() => setFriendsModalOpen(true)}
        onOpenLeaderboards={() => setLeaderboardsModalOpen(true)}
        onOpenAchievements={() => setAchievementsModalOpen(true)}
        onOpenSocialBetting={() => setSocialBettingModalOpen(true)}
        onToggleChat={() => setMobileChatOpen(!mobileChatOpen)}
        chatOpen={mobileChatOpen}
      />

      {/* Global Modals */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setWalletModal(false)}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setSignupModal(false)}
        onSwitchToLogin={() => {
          setSignupModal(false)
          setLoginModal(true)
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setLoginModal(false)}
        onSwitchToSignup={() => {
          setLoginModal(false)
          setSignupModal(true)
        }}
      />

      {/* User Stats Modal */}
      {userStatsModal.user && (
        <UserStatsModal
          isOpen={userStatsModal.isOpen}
          onClose={handleCloseUserStats}
          userStats={userStatsModal.user}
        />
      )}

      {/* Social Modals */}
      <FriendsModal
        isOpen={friendsModalOpen}
        onClose={() => setFriendsModalOpen(false)}
      />
      
      <LeaderboardsModal
        isOpen={leaderboardsModalOpen}
        onClose={() => setLeaderboardsModalOpen(false)}
      />
      
      <AchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
      />
      
      <SocialBettingModal
        isOpen={socialBettingModalOpen}
        onClose={() => setSocialBettingModalOpen(false)}
      />

      {/* Live Support Widget */}
      <LiveSupportWidget />

      {/* Live Stats Modal */}
      <LiveStatsModal
        isOpen={showLiveStatsModal}
        onClose={() => setLiveStatsModal(false)}
        gameType="All"
      />

      {/* My Bets Modal */}
      <MyBetsModal
        isOpen={showMyBetsModal}
        onClose={() => setMyBetsModal(false)}
      />

      {/* Bet History Scroll */}
      <BetHistoryScroll
        isOpen={showBetHistoryScroll}
        onClose={() => setBetHistoryScroll(false)}
      />

      {/* Email Verification Reminder */}
      <EmailVerificationReminder
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onResendEmail={async () => {
          // TODO: Implement resend email functionality
          console.log('Resend email functionality to be implemented')
        }}
      />
    </div>
  )
}

export default CasinoLayout
