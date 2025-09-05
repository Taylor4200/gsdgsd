'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calculator, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface SkillTestingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userCountry: string
}

const SkillTestingModal: React.FC<SkillTestingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userCountry
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<{
    question: string
    answer: number
    options: number[]
  } | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  // Generate skill-testing questions
  const generateQuestion = () => {
    const operations = ['+', '-', '×', '÷']
    const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20]

    // Simple arithmetic questions
    const questionTypes = [
      // Addition/Subtraction
      () => {
        const a = numbers[Math.floor(Math.random() * numbers.length)]
        const b = numbers[Math.floor(Math.random() * numbers.length)]
        const op = Math.random() > 0.5 ? '+' : '-'
        const answer = op === '+' ? a + b : a - b
        return {
          question: `What is ${a} ${op} ${b}?`,
          answer: Math.max(0, answer), // Ensure non-negative
          options: generateOptions(answer)
        }
      },
      // Multiplication
      () => {
        const factors = [2, 3, 4, 5, 6, 7, 8, 9, 10]
        const a = factors[Math.floor(Math.random() * factors.length)]
        const b = factors[Math.floor(Math.random() * factors.length)]
        const answer = a * b
        return {
          question: `What is ${a} × ${b}?`,
          answer,
          options: generateOptions(answer)
        }
      },
      // Simple Division
      () => {
        const answers = [4, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 25, 30]
        const answer = answers[Math.floor(Math.random() * answers.length)]
        const divisors = [2, 3, 4, 5]
        const divisor = divisors[Math.floor(Math.random() * divisors.length)]
        const dividend = answer * divisor
        return {
          question: `What is ${dividend} ÷ ${divisor}?`,
          answer,
          options: generateOptions(answer)
        }
      },
      // Word problems
      () => {
        const scenarios = [
          { items: 5, price: 12, question: 'If 5 apples cost $12, how much does 1 apple cost?', answer: 2.4 },
          { items: 3, price: 15, question: 'If 3 books cost $15, how much does 1 book cost?', answer: 5 },
          { items: 4, price: 16, question: 'If 4 pencils cost $16, how much does 1 pencil cost?', answer: 4 },
          { items: 6, price: 18, question: 'If 6 candies cost $18, how much does 1 candy cost?', answer: 3 }
        ]
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
        return {
          question: scenario.question,
          answer: scenario.answer,
          options: generateDecimalOptions(scenario.answer)
        }
      }
    ]

    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)]
    return randomType()
  }

  // Generate multiple choice options
  const generateOptions = (correct: number) => {
    const options = [correct]
    while (options.length < 4) {
      const variation = Math.floor(Math.random() * 10) - 5 // -5 to +4
      const option = correct + variation
      if (option >= 0 && !options.includes(option)) {
        options.push(option)
      }
    }
    return options.sort(() => Math.random() - 0.5)
  }

  // Generate options for decimal answers
  const generateDecimalOptions = (correct: number) => {
    const options = [correct]
    const variations = [-0.5, 0.5, -1, 1, -2, 2]
    while (options.length < 4) {
      const variation = variations[Math.floor(Math.random() * variations.length)]
      const option = correct + variation
      if (option >= 0 && !options.includes(option)) {
        options.push(option)
      }
    }
    return options.sort(() => Math.random() - 0.5)
  }

  // Initialize question
  useEffect(() => {
    if (isOpen && !currentQuestion) {
      setCurrentQuestion(generateQuestion())
      setTimeLeft(30)
      setAttempts(0)
      setShowResult(false)
    }
  }, [isOpen, currentQuestion])

  // Timer countdown
  useEffect(() => {
    if (isOpen && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout()
    }
  }, [isOpen, timeLeft, showResult])

  const handleTimeout = () => {
    setShowResult(true)
    setIsCorrect(false)
  }

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer)
    const correct = answer === currentQuestion?.answer
    setIsCorrect(correct)
    setShowResult(true)
    setAttempts(attempts + 1)
  }

  const handleNextQuestion = () => {
    if (isCorrect) {
      onSuccess()
    } else {
      setCurrentQuestion(generateQuestion())
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(30)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(generateQuestion())
    setSelectedAnswer(null)
    setShowResult(false)
    setTimeLeft(30)
  }

  const getCountryRequirements = (country: string) => {
    switch (country) {
      case 'Canada':
        return {
          title: 'Canadian Skill-Testing Requirement',
          description: 'To comply with the Criminal Code of Canada and ensure fair play, you must answer a skill-testing question.',
          law: 'Criminal Code of Canada - Section 206'
        }
      case 'Australia':
        return {
          title: 'Australian Gaming Compliance',
          description: 'Skill-testing questions help ensure responsible gaming and compliance with state regulations.',
          law: 'State Gaming Regulations'
        }
      case 'United Kingdom':
        return {
          title: 'UK Gaming Compliance',
          description: 'Verification of skill helps maintain compliance with the Gambling Act 2005.',
          law: 'Gambling Act 2005'
        }
      default:
        return {
          title: 'Skill Verification Required',
          description: 'This verification helps ensure fair play and compliance with local regulations.',
          law: 'Local Gaming Regulations'
        }
    }
  }

  const requirements = getCountryRequirements(userCountry)

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
            <div className="w-full max-w-lg bg-[#1a2c38] border border-[#2d3748] rounded-lg shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Image
                      src="/Logo11.png"
                      alt="Casino Logo"
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{requirements.title}</h2>
                    <p className="text-gray-400 text-sm">Skill Testing Question</p>
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
              <div className="p-6">
                {/* Legal Information */}
                <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-cyan-300 font-semibold text-sm mb-1">Legal Requirement</h3>
                      <p className="text-cyan-200 text-sm leading-relaxed">
                        {requirements.description}
                      </p>
                      <p className="text-cyan-400 text-xs mt-2 font-mono">
                        {requirements.law}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timer */}
                {!showResult && (
                  <div className="flex justify-center mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      timeLeft > 10 ? 'bg-green-500/20 text-green-400' :
                      timeLeft > 5 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      ⏱️ {timeLeft}s remaining
                    </div>
                  </div>
                )}

                {/* Question */}
                {currentQuestion && !showResult && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">Skill Testing Question</h3>
                      <p className="text-gray-300 text-lg">{currentQuestion.question}</p>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(option)}
                          className="bg-[#2d3748] border border-[#4a5568] rounded-lg p-4 text-white font-semibold hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all duration-200 text-lg"
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="text-center text-gray-400 text-sm">
                      Choose the correct answer above
                    </div>
                  </div>
                )}

                {/* Result */}
                {showResult && (
                  <div className="text-center space-y-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                      isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <X className="w-8 h-8 text-red-400" />
                      )}
                    </div>

                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        isCorrect ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </h3>
                      <p className="text-gray-300">
                        {isCorrect
                          ? 'You have successfully passed the skill-testing requirement.'
                          : `The correct answer was: ${currentQuestion?.answer}`
                        }
                      </p>
                    </div>

                    {!isCorrect && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-sm">
                          <strong>Attempts remaining:</strong> {3 - attempts}/3
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-[#2d3748]">
                <div className="text-sm text-gray-400">
                  {userCountry} Compliance • Question {attempts + 1}/3
                </div>

                <div className="flex space-x-3">
                  {showResult && !isCorrect && attempts < 3 && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="border-[#4a5568] text-gray-400 hover:bg-[#4a5568]/20"
                    >
                      Try Again
                    </Button>
                  )}

                  {showResult && (
                    <Button
                      onClick={isCorrect ? handleNextQuestion : (attempts >= 3 ? onClose : handleNextQuestion)}
                      className={`${
                        isCorrect
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-500/90 hover:to-teal-500/90'
                          : attempts >= 3
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-500/90 hover:to-pink-500/90'
                            : 'bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90'
                      } text-black font-bold`}
                    >
                      {isCorrect ? 'Continue' : attempts >= 3 ? 'Close' : 'Next Question'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SkillTestingModal
