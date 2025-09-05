'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/userStore'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useUserStore()
  const [user, setUserState] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', { session: !!session, user: session?.user?.email, error })
      
      // Allow session even if not confirmed (for better UX)
      if (session?.user) {
        setSession(session)
        setUserState(session.user)
        
        // Update Zustand store with user data
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username || 'User',
          balance: 5000, // Default balance
          gcBalance: 0,
          sweepstakesCoins: 5000, // Legacy field
          level: 25,
          experience: 0,
          totalWagered: 0,
          totalWon: 0,
          joinedAt: new Date(session.user.created_at),
          lastActive: new Date(),
          achievements: [],
          referralCode: '',
          isGhostMode: false,
          country: session.user.user_metadata?.country,
          state: session.user.user_metadata?.state,
          dateOfBirth: session.user.user_metadata?.dateOfBirth,
          emailConfirmed: !!session.user.email_confirmed_at
        }
        setUser(userData)
      } else {
        setSession(null)
        setUserState(null)
        setUser(null)
      }
      
      setAuthLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, { 
        session: !!session, 
        user: session?.user?.email, 
        confirmed: session?.user?.email_confirmed_at,
        metadata: session?.user?.user_metadata 
      })
      
      // Allow session even if not confirmed (for better UX)
      if (session?.user) {
        setSession(session)
        setUserState(session.user)
        
        // Update Zustand store with user data
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username || 'User',
          balance: 5000, // Default balance
          gcBalance: 0,
          sweepstakesCoins: 5000, // Legacy field
          level: 25,
          experience: 0,
          totalWagered: 0,
          totalWon: 0,
          joinedAt: new Date(session.user.created_at),
          lastActive: new Date(),
          achievements: [],
          referralCode: '',
          isGhostMode: false,
          country: session.user.user_metadata?.country,
          state: session.user.user_metadata?.state,
          dateOfBirth: session.user.user_metadata?.dateOfBirth,
          emailConfirmed: !!session.user.email_confirmed_at
        }
        
        console.log('AuthProvider - Setting user data:', userData)
        setUser(userData)
      } else {
        console.log('AuthProvider - Clearing user data (no session)')
        setSession(null)
        setUserState(null)
        setUser(null)
      }
      
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return { data: null, error: { message: 'Supabase is not configured. Please check your environment variables.' } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Store basic info in user metadata
          username: userData?.username,
          phone: userData?.phone
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    // If signup successful, the database trigger will handle profile creation
    if (!error && data.user) {
      console.log('User created successfully:', data.user.email)
      console.log('Profile creation will be handled by database trigger')
    }

    // Auto-login the user after successful signup
    if (!error && data.user) {
      console.log('Auto-logging in user after signup:', data.user.email)
      
      // Check if email confirmation is required
      if (!data.user.email_confirmed_at) {
        console.log('Email confirmation required, skipping auto-login')
        // Return the signup data without auto-login
        return { data: { user: data.user, session: null }, error: null }
      }
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('Auto-login failed:', signInError)
        // Return the signup data but with auto-login error
        return { data: { user: data.user, session: null }, error: signInError }
      }

      console.log('Auto-login successful:', signInData)
      
      // Update user metadata with the full user data
      if (signInData.user && userData) {
        console.log('Updating user metadata with:', userData)
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            username: userData.username,
            country: userData.country,
            state: userData.state,
            dateOfBirth: userData.dateOfBirth,
            phone: userData.phone
          }
        })
        
        if (updateError) {
          console.error('Failed to update user metadata:', updateError)
        } else {
          console.log('User metadata updated successfully')
        }
      }
      
      return { data: signInData, error: null }
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return { data: null, error: { message: 'Supabase is not configured. Please check your environment variables.' } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    // Allow login even if not confirmed (for better UX)
    // We'll show verification reminders in the UI instead
    return { data, error }
  }

  const signOut = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return { error: { message: 'Supabase is not configured.' } }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
