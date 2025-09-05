'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First, try to get the current session
        let { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('error')
          setMessage('Failed to establish session. Please try signing in manually.')
          return
        }

        // If we have a session with a user, we're good
        if (sessionData.session?.user) {
          console.log('User authenticated:', sessionData.session.user.email)
          setStatus('success')
          setMessage('🎉 Email verified successfully! You are now logged in and being redirected...')

          // Small delay to show success message, then redirect
          setTimeout(() => {
            router.push('/')
          }, 2000)
          return
        }

        // If no session, try to handle the URL hash for email confirmation
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          console.log('Found tokens in URL, setting session...')
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Set session error:', error)
            setStatus('error')
            setMessage('Failed to establish session from email confirmation.')
          } else if (data.session?.user) {
            console.log('Session established successfully')
            setStatus('success')
            setMessage('🎉 Email verified successfully! Redirecting...')
            setTimeout(() => {
              router.push('/')
            }, 1500)
          } else {
            setStatus('error')
            setMessage('Email verification completed, but session could not be established.')
          }
        } else {
          console.log('No tokens found in URL')
          setStatus('error')
          setMessage('Email verification link appears to be invalid. Please try signing up again.')
        }
      } catch (err) {
        console.error('Auth callback exception:', err)
        setStatus('error')
        setMessage('An unexpected error occurred during verification.')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-[#1a2c38] flex items-center justify-center p-4">
      <div className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#00d4ff] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-white mb-2">Verifying Email</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#00d4ff] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#00d4ff]/90 transition-colors"
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
