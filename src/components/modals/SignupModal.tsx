'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, ChevronDown, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { getGamblingAgeRequirement, validateGamblingAge, calculateAge } from '@/lib/utils'
import Image from 'next/image'

const MINIMUM_GAMBLING_AGE = 18 // Default fallback

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signUp } = useAuth()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    country: '',
    state: '',
    dateOfBirth: '',
    phone: '',
    referralCode: ''
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [ageError, setAgeError] = useState('')
  const [isAgeValid, setIsAgeValid] = useState(false)
  const [minimumAgeRequired, setMinimumAgeRequired] = useState<number | null>(18)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Update minimum age when country or state changes
  useEffect(() => {
    if (formData.country) {
      const newMinimumAge = getGamblingAgeRequirement(formData.country, formData.state)
      setMinimumAgeRequired(newMinimumAge)

      // Validate age if date of birth is set
      if (formData.dateOfBirth) {
        const validation = validateGamblingAge(formData.dateOfBirth, formData.country, formData.state)
        setIsAgeValid(validation.isValid)
        setAgeError(validation.errorMessage || '')
        // Update minimumAgeRequired (can be null for prohibited states)
        setMinimumAgeRequired(validation.minimumAge)
      }
    }
  }, [formData.country, formData.state, formData.dateOfBirth])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Clear success message when user starts typing (new signup attempt)
    if (successMessage) {
      setSuccessMessage('')
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Handle country change - update minimum age requirement and clear state
    if (name === 'country') {
      // Clear state when country changes
      setFormData(prev => ({ ...prev, state: '' }))

      const newMinimumAge = getGamblingAgeRequirement(value)
      setMinimumAgeRequired(newMinimumAge)

      // Clear age validation when country changes
      setAgeError('')
      setIsAgeValid(false)

      // Re-validate age if date of birth is already set
      if (formData.dateOfBirth) {
        validateCurrentAge(formData.dateOfBirth, value, '')
      }
    }

    // Handle state change - update minimum age requirement
    if (name === 'state') {
      const newMinimumAge = getGamblingAgeRequirement(formData.country, value)
      setMinimumAgeRequired(newMinimumAge)

      // Re-validate age if date of birth is already set
      if (formData.dateOfBirth) {
        validateCurrentAge(formData.dateOfBirth, formData.country, value)
      }
    }

    // Handle date of birth change - validate immediately
    if (name === 'dateOfBirth') {
      if (!value) {
        // Clear validation when date is cleared
        setAgeError('')
        setIsAgeValid(false)
      } else {
        validateCurrentAge(value, formData.country, formData.state)
      }
    }
  }

  // Validate age for current inputs
  const validateCurrentAge = (dateOfBirth: string, country: string, province?: string) => {
    if (!dateOfBirth || !country) {
      setAgeError('')
      setIsAgeValid(false)
      return
    }

    const validation = validateGamblingAge(dateOfBirth, country, province)
    setIsAgeValid(validation.isValid)
    setAgeError(validation.errorMessage || '')
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
      // Clear any previous messages when moving to next step
      setError('')
      setSuccessMessage('')
    }
  }

  const handleBack = () => {
    setStep(1)
    // Clear any previous messages when going back
    setError('')
    setSuccessMessage('')
  }

  const validateStep1 = () => {
    // Check basic required fields
    if (!formData.email || !formData.username || !formData.password ||
        !formData.country || !formData.dateOfBirth) {
      return false
    }

    // For countries with province-specific age requirements, state is required
    const countriesRequiringState = ['Canada', 'United States', 'Australia']
    if (countriesRequiringState.includes(formData.country) && !formData.state) {
      return false
    }

    // Validate age using current validation state
    if (!isAgeValid) {
      return false
    }

    return true
  }

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true)
    }
  }

  const handleSubmit = async () => {
    if (!acceptedTerms || !hasScrolledToBottom) return

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const userData = {
        username: formData.username,
        country: formData.country,
        state: formData.state || null,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone || null,
        referralCode: formData.referralCode || null
      }

      const { data, error } = await signUp(formData.email, formData.password, userData)

      console.log('SignupModal - Signup response:', { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        userEmail: data?.user?.email,
        error: error?.message 
      })

      if (error) {
        // Handle specific signup error types
        if (error.message.includes('User already registered')) {
          setError('❌ This email is already registered. Try signing in instead, or use a different email.')
        } else if (error.message.includes('Password should be at least')) {
          setError('❌ Password is too weak. Please use a stronger password with at least 6 characters.')
        } else if (error.message.includes('Invalid email')) {
          setError('❌ Please enter a valid email address.')
        } else {
          setError(`❌ Signup failed: ${error.message}`)
        }
              } else {
          // Handle successful signup - check if auto-login worked
          console.log('Signup response:', { data, error })

          if (data.user && !data.session) {
            // User created but needs email confirmation
            console.log('User created but needs email confirmation:', data.user.email)
            setSuccessMessage('✅ Account created successfully! 📧 Please check your email and click the confirmation link to complete your account setup.')
            
            // Close modal after showing success message
            setTimeout(() => {
              onClose()
            }, 3000)
            
            // Clear form for next time
            setFormData({
              email: '',
              username: '',
              password: '',
              country: '',
              state: '',
              dateOfBirth: '',
              phone: '',
              referralCode: ''
            })
            setAcceptedTerms(false)
            setHasScrolledToBottom(false)
          } else if (data.user && data.session) {
            // Auto-login successful
            console.log('Auto-login successful for user:', data.user.email)
            
            // Close modal immediately since user is now logged in
            onClose()
            
            // Clear form for next time
            setFormData({
              email: '',
              username: '',
              password: '',
              country: '',
              state: '',
              dateOfBirth: '',
              phone: '',
              referralCode: ''
            })
            setAcceptedTerms(false)
            setHasScrolledToBottom(false)
          } else {
            // Unexpected response
            console.log('Unexpected signup response:', data)
            setError('❌ Account creation failed. Please try again.')
          }
        }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const countriesAndStates = {
    'United States': [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ],
    'Canada': [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ],
    'Australia': [
      'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
      'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
    ],
    'United Kingdom': [
      'England', 'Scotland', 'Wales', 'Northern Ireland'
    ],
    'Germany': [
      'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
      'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
      'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
    ],
    'Austria': [
      'Burgenland', 'Carinthia', 'Lower Austria', 'Salzburg', 'Styria', 'Tyrol',
      'Upper Austria', 'Vienna', 'Vorarlberg'
    ],
    'Switzerland': [
      'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft',
      'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura',
      'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz',
      'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud',
      'Zug', 'Zurich'
    ],
    'Netherlands': [
      'Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg',
      'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland'
    ],
    'Belgium': [
      'Antwerp', 'Brussels', 'East Flanders', 'Flemish Brabant', 'Hainaut', 'Liège',
      'Limburg', 'Luxembourg', 'Namur', 'Walloon Brabant', 'West Flanders'
    ],
    'Ireland': [
      'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
      'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
      'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
      'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
    ],
    'Denmark': [
      'Capital Region', 'Central Denmark', 'North Denmark', 'Region Zealand', 'South Denmark'
    ],
    'Sweden': [
      'Blekinge', 'Dalarna', 'Gävleborg', 'Gotland', 'Halland', 'Jämtland', 'Jönköping',
      'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland', 'Skåne', 'Södermanland',
      'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland', 'Västra Götaland'
    ],
    'Norway': [
      'Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland',
      'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark', 'Vestland', 'Viken'
    ],
    'Finland': [
      'Central Finland', 'Central Ostrobothnia', 'Kainuu', 'Kanta-Häme', 'Kymenlaakso',
      'Lapland', 'North Karelia', 'Northern Ostrobothnia', 'Northern Savonia',
      'Ostrobothnia', 'Pirkanmaa', 'Satakunta', 'South Karelia', 'Southern Ostrobothnia',
      'Southern Savonia', 'Southwest Finland', 'Uusimaa', 'Åland'
    ],
    'New Zealand': [
      'Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', 'Hawke\'s Bay', 'Manawatu-Wanganui',
      'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast'
    ],
    'India': [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
      'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
      'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
      'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands',
      'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
    ],
    'Japan': [
      'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
      'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
      'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu',
      'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara',
      'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
      'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki',
      'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'
    ],
    'South Korea': [
      'Seoul', 'Busan', 'Daegu', 'Incheon', 'Gwangju', 'Daejeon', 'Ulsan',
      'Gyeonggi', 'Gangwon', 'Chungbuk', 'Chungnam', 'Jeonbuk', 'Jeonnam',
      'Gyeongbuk', 'Gyeongnam', 'Jeju'
    ],
    'Singapore': [
      'Central Region', 'North East Region', 'North West Region', 'South East Region', 'South West Region'
    ]
  }

  const countries = Object.keys(countriesAndStates)
  const states = formData.country ? countriesAndStates[formData.country as keyof typeof countriesAndStates] || [] : []

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
            <div className="w-full max-w-2xl bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-2xl max-h-[90vh] overflow-hidden">
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
                  <div>
                    <h2 className="text-xl font-bold text-white">Create an Account</h2>
                    <p className="text-gray-400 text-sm">Step {step} of 2</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {step === 1 ? (
                  /* Step 1: Basic Information */
                  <div className="p-6 space-y-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] transition-colors"
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] transition-colors"
                          placeholder="3-14 characters"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] transition-colors pr-12"
                            placeholder="Enter password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Country */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Country *
                        </label>
                        <div className="relative">
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-[#00d4ff] transition-colors"
                            required
                          >
                            <option value="">Select Country</option>
                            {countries.map(country => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* State/Province */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {formData.country === 'United Kingdom' ? 'Region' :
                           formData.country === 'Germany' || formData.country === 'Austria' || formData.country === 'Switzerland' ? 'State' :
                           formData.country === 'Canada' || formData.country === 'Australia' || formData.country === 'New Zealand' ? 'Province/State' :
                           formData.country === 'India' ? 'State' :
                           formData.country === 'Japan' ? 'Prefecture' :
                           formData.country === 'South Korea' ? 'Province' :
                           formData.country === 'Singapore' ? 'Region' :
                           'State'} * {(formData.country === 'Canada' || formData.country === 'United States' || formData.country === 'Australia') ? '(Required for accurate age verification)' : ''}
                        </label>
                        <div className="relative">
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-[#00d4ff] transition-colors"
                            required
                            disabled={!formData.country}
                          >
                            <option value="">
                              {!formData.country ? 'Select Country First' :
                               formData.country === 'United Kingdom' ? 'Select Region' :
                               formData.country === 'Germany' || formData.country === 'Austria' || formData.country === 'Switzerland' ? 'Select State' :
                               formData.country === 'Canada' || formData.country === 'Australia' || formData.country === 'New Zealand' ? 'Select Province/State' :
                               formData.country === 'India' ? 'Select State' :
                               formData.country === 'Japan' ? 'Select Prefecture' :
                               formData.country === 'South Korea' ? 'Select Province' :
                               formData.country === 'Singapore' ? 'Select Region' :
                               'Select State'}
                            </option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date of Birth * {formData.country ? (
                            minimumAgeRequired === null
                              ? `(Sweepstakes not allowed${formData.state ? ` in ${formData.state}` : ''})`
                              : `(Must be ${minimumAgeRequired}+ years old${formData.state ? ` in ${formData.state}` : ['Canada', 'United States', 'Australia'].includes(formData.country) ? ' - Select province/state first' : ''})`
                          ) : '(Select country first)'}
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!formData.country || (['Canada', 'United States', 'Australia'].includes(formData.country) && !formData.state) || minimumAgeRequired === null}
                          className={`w-full bg-[#2d3748] border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${
                            !formData.country || (['Canada', 'United States', 'Australia'].includes(formData.country) && !formData.state) || minimumAgeRequired === null
                              ? 'border-gray-600 cursor-not-allowed opacity-50'
                              : ageError
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-[#4a5568] focus:border-[#00d4ff]'
                          }`}
                          required
                        />
                        {ageError && (
                          <p className="text-red-400 text-sm mt-2 flex items-center">
                            <span className="mr-2">⚠️</span>
                            {ageError}
                          </p>
                        )}
                        {formData.dateOfBirth && isAgeValid && (
                          <p className="text-green-400 text-sm mt-2 flex items-center">
                            <span className="mr-2">✅</span>
                            Age verified for {formData.state ? `${formData.state}, ` : ''}{formData.country} ({calculateAge(formData.dateOfBirth)} years old)
                          </p>
                        )}
                      </div>

                      {/* Phone (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] transition-colors"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      {/* Referral Code (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Referral Code (Optional)
                        </label>
                        <input
                          type="text"
                          name="referralCode"
                          value={formData.referralCode}
                          onChange={handleInputChange}
                          className="w-full bg-[#2d3748] border border-[#4a5568] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] transition-colors"
                          placeholder="Enter referral code"
                        />
                      </div>
                    </div>

                    {/* Already have account */}
                    <div className="text-center text-sm text-gray-400">
                      Already have an account?{' '}
                      <button
                        onClick={onSwitchToLogin}
                        className="text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors"
                      >
                        Sign in
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Terms & Conditions */
                  <div className="p-6">
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

                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-2">TERMS & CONDITIONS</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        IMPORTANT NOTICE: THIS AGREEMENT IS SUBJECT TO BINDING ARBITRATION AND A WAIVER OF CLASS ACTION RIGHTS AS DETAILED IN CLAUSE 26.
                      </p>
                    </div>

                    {/* Terms Scroll Area */}
                    <div
                      className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-4 max-h-96 overflow-y-auto mb-4 text-sm leading-relaxed"
                      onScroll={handleTermsScroll}
                    >
                      <div className="space-y-6 text-gray-300">
                        {/* Terms content - abbreviated for demo */}
                        <div>
                          <h4 className="font-bold text-white mb-2">1. INTRODUCTION</h4>
                          <p>Welcome to Edge! Before the fun starts, we need to make sure you know how we operate and what it means when you register an account.</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-white mb-2">2. STAKE STATEMENT</h4>
                          <p>The following are "Excluded Territories": Any country other than the continental United States of America and Hawaii...</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-white mb-2">3. DEFINITIONS</h4>
                          <p>"Gold Coin" - means the virtual social gameplay currency...</p>
                          <p>"Stake Cash" - means sweepstakes entries...</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-white mb-2">4. REGISTRATION & CUSTOMER WARRANTIES</h4>
                          <p>When you try to register a Customer Account you will be requested to provide...</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-white mb-2">5. LICENCE</h4>
                          <p>Subject to your agreement and continuing compliance with these Terms...</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-white mb-2">6. YOUR CUSTOMER ACCOUNT</h4>
                          <p>You are allowed to have only one Customer Account...</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-white mb-2">16. FRAUDULENT CONDUCT</h4>
                          <p>As a condition to access the Games or Platform, you may not...</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-white mb-2">26. DISPUTE RESOLUTION AND AGREEMENT TO ARBITRATE</h4>
                          <p>PLEASE READ THIS CLAUSE 26 CAREFULLY AS IT REQUIRES YOU TO ARBITRATE DISPUTES...</p>
                        </div>

                        {/* Add more terms content here */}
                        <div className="text-center py-8">
                          <p className="text-gray-400">End of Terms & Conditions</p>
                        </div>
                      </div>
                    </div>

                    {/* Terms Acceptance */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="terms-accept"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 bg-[#2d3748] border border-[#4a5568] rounded focus:ring-[#00d4ff] focus:border-[#00d4ff]"
                        />
                        <label htmlFor="terms-accept" className="text-sm text-gray-300 leading-relaxed">
                          I have read and agree to the terms and conditions
                        </label>
                      </div>

                      {!hasScrolledToBottom && (
                        <p className="text-yellow-400 text-sm">
                          Please scroll to the bottom to read all terms and conditions
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-[#2d3748]">
                {step === 1 ? (
                  <div />
                ) : (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="border-[#4a5568] text-gray-400 hover:bg-[#4a5568]/20"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}

                {step === 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!validateStep1()}
                    className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!acceptedTerms || !hasScrolledToBottom || loading}
                    className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SignupModal
