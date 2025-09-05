'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import Image from 'next/image'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignup: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { signIn, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // If user is already authenticated, close the modal immediately
  useEffect(() => {
    if (user && isOpen) {
      console.log('User already authenticated, closing login modal')
      onClose()
    }
  }, [user, isOpen, onClose])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error and success messages when user starts typing
    if (error) setError('')
    if (successMessage) setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    console.log('Attempting login with:', formData.email)

    try {
      const { data, error } = await signIn(formData.email, formData.password)

      console.log('Login response:', { data: data ? { user: !!data.user, session: !!data.session } : null, error })

      if (error) {
        // Handle specific error types for better user experience
        console.error('Login error:', error.message)
        if (error.message.includes('Invalid login credentials')) {
          setError('❌ Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Too many requests')) {
          setError('⏱️ Too many login attempts. Please wait a moment before trying again.')
        } else {
          setError(`❌ Login failed: ${error.message}`)
        }
      } else if (data.user && data.session) {
        console.log('Login successful for user:', data.user.email)
        setError('') // Clear any previous errors
        setSuccessMessage('✅ Login successful! Welcome back!')
        // Close modal after showing success message
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        console.log('Login response missing user or session')
        setError('❌ Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError('❌ Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-md bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Image
                      src="/Logo11.png"
                      alt="Casino Logo"
                      width={36}
                      height={36}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Hide broken image if logo fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-white">Sign In</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                    <p className="text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full bg-[#2d3748] border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      error ? 'border-red-500 focus:border-red-500' : 'border-[#4a5568] focus:border-[#00d4ff]'
                    }`}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full bg-[#2d3748] border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors pr-12 ${
                        error ? 'border-red-500 focus:border-red-500' : 'border-[#4a5568] focus:border-[#00d4ff]'
                      }`}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Don't have account */}
                <div className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onSwitchToSignup()
                    }}
                    className="text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
                  >
                    Create one
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LoginModal
