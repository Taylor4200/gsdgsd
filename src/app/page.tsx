'use client'

import React from 'react'
import { useUserStore } from '@/store/userStore'
import CasinoLayout from '@/components/layout/CasinoLayout'
import CasinoHome from '@/components/sections/CasinoHome'
import LandingPage from '@/components/sections/LandingPage'

export default function HomePage() {
  const { isAuthenticated } = useUserStore()

  return (
    <CasinoLayout>
      {isAuthenticated ? (
        // Show regular casino home for authenticated users
        <CasinoHome />
      ) : (
        // Show landing page for non-authenticated users (within casino layout)
        <LandingPage />
      )}
    </CasinoLayout>
  )
}
