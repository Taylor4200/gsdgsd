'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        setIsValidSession(true)
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.')
      }
    }
    checkSession()
  }, [])

  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        length: password.length < minLength,
        uppercase: !hasUpperCase,
        lowercase: !hasLowerCase,
        numbers: !hasNumbers,
        special: !hasSpecialChar
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setError('New password does not meet requirements')
      return
    }

    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const passwordValidation = validatePassword(newPassword)

  if (!isValidSession && !success) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md border-[#2d3748] shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-center">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-6">{error}</p>
            <Link href="/settings">
              <Button className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="glass" className="w-full max-w-md border-[#2d3748] shadow-xl">
          {/* Header */}
          <CardHeader>
            <div className="flex items-center justify-center space-x-3">
              <Key className="h-6 w-6 text-[#00d4ff]" />
              <CardTitle className="text-white">Reset Your Password</CardTitle>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Password Reset!</h3>
                <p className="text-gray-400 mb-4">Your password has been successfully updated.</p>
                <p className="text-sm text-gray-500">Redirecting you to the home page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#1a2c38] border-[#2d3748] pr-10"
                      placeholder="Enter your new password"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#1a2c38] border-[#2d3748] pr-10"
                      placeholder="Confirm your new password"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Password Requirements */}
                {newPassword && (
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">Password Requirements:</h4>
                    <div className="space-y-2">
                      <div className={`flex items-center space-x-2 text-xs ${
                        passwordValidation.errors.length ? 'text-red-400' : 'text-green-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          passwordValidation.errors.length ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        passwordValidation.errors.uppercase ? 'text-red-400' : 'text-green-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          passwordValidation.errors.uppercase ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        passwordValidation.errors.lowercase ? 'text-red-400' : 'text-green-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          passwordValidation.errors.lowercase ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        passwordValidation.errors.numbers ? 'text-red-400' : 'text-green-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          passwordValidation.errors.numbers ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${
                        passwordValidation.errors.special ? 'text-red-400' : 'text-green-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          passwordValidation.errors.special ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-400">{error}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Link href="/settings" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-[#2d3748]"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="flex-1 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
