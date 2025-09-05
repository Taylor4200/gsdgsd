'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

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
    setSuccess(false)

    // Validate current password
    if (!currentPassword) {
      setError('Current password is required')
      return
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      setError('New password does not meet requirements')
      return
    }

    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setIsLoading(true)

    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword
      })

      if (signInError) {
        setError('Current password is incorrect')
        setIsLoading(false)
        return
      }

      // Update the password
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
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)

    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess(false)
      setShowForgotPassword(false)
      setResetEmailSent(false)
      onClose()
    }
  }

  const handleForgotPassword = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setError('No email address found for your account')
        setIsLoading(false)
        return
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) {
        setError(resetError.message)
        setIsLoading(false)
        return
      }

      setResetEmailSent(true)
      setIsLoading(false)
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const passwordValidation = validatePassword(newPassword)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card variant="glass" className="w-full max-w-md border-[#2d3748] shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
                <div className="flex items-center space-x-3">
                  <Key className="h-6 w-6 text-[#00d4ff]" />
                  <h2 className="text-xl font-bold text-white">Change Password</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6">
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
                    <p className="text-gray-400">Your password has been successfully changed.</p>
                  </div>
                ) : resetEmailSent ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Reset Email Sent!</h3>
                    <p className="text-gray-400 mb-4">We've sent a password reset link to your email address.</p>
                    <p className="text-sm text-gray-500">Check your inbox and follow the link to reset your password.</p>
                    <div className="mt-6">
                      <Button
                        onClick={handleClose}
                        className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : showForgotPassword ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white mb-2">Reset Your Password</h3>
                      <p className="text-gray-400">We'll send a password reset link to your email address.</p>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-sm font-medium text-white mb-1">How it works:</h4>
                          <ul className="text-xs text-gray-400 space-y-1">
                            <li>• Click "Send Reset Link" below</li>
                            <li>• Check your email for the reset link</li>
                            <li>• Click the link to set a new password</li>
                            <li>• Return here and log in with your new password</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        disabled={isLoading}
                        className="flex-1 border-[#2d3748]"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isLoading}
                        className="flex-1 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                      >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-[#1a2c38] border-[#2d3748] pr-10"
                          placeholder="Enter your current password"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowForgotPassword(true)}
                        disabled={isLoading}
                        className="text-[#00d4ff] hover:text-[#00d4ff]/80 text-sm"
                      >
                        Forgot your password?
                      </Button>
                    </div>

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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 border-[#2d3748]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                        className="flex-1 bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90"
                      >
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ChangePasswordModal
