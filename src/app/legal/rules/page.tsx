'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  DollarSign,
  X
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'

export default function RulesPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <CasinoLayout>
      <div className="min-h-screen bg-[#0f1419] text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2c38] to-[#2d3748] py-16 px-4">
          <div className="container mx-auto">
            <motion.div
              {...fadeInUp}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-[#00d4ff] mr-4" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Official Rules
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    EDGE ORIGINALS Sweepstakes Platform
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Complete rules and regulations governing participation in EDGE ORIGINALS sweepstakes games,
                prize distribution, and platform usage.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Eligibility Section */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Eligibility & Participation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-green-300 mb-3">Who Can Play</h3>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Must be 18 years or older</li>
                        <li>• Legal resident of participating states</li>
                        <li>• Successfully complete identity verification</li>
                        <li>• Not prohibited by law from participating</li>
                        <li>• One account per person</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <X className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-red-300 mb-3">Who Cannot Play</h3>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Under 18 years of age</li>
                        <li>• Residents of WA, ID, NV, MI</li>
                        <li>• Current or former EDGE ORIGINALS employees</li>
                        <li>• Individuals with gambling restrictions</li>
                        <li>• Multiple account holders</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Game Rules */}
          <motion.div
            {...staggerContainer}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              Game Rules & Mechanics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Trophy className="w-8 h-8" />,
                  title: "How to Win",
                  description: "Winners are selected through skill-based gameplay and random selection mechanisms. Each game has specific winning criteria outlined in the game interface.",
                  color: "from-yellow-500 to-orange-500"
                },
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: "Entry Periods",
                  description: "Games run continuously unless otherwise specified. Entry periods may vary by game and are clearly displayed in each game interface.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <DollarSign className="w-8 h-8" />,
                  title: "Prize Distribution",
                  description: "Prizes are distributed within 30 days of winner verification. All prizes are subject to federal, state, and local tax requirements.",
                  color: "from-green-500 to-teal-500"
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Fair Play",
                  description: "All games use provably fair algorithms. Players can verify game fairness through our transparency tools available in each game.",
                  color: "from-purple-500 to-indigo-500"
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Entry Limits",
                  description: "No purchase necessary to enter. Players can earn entries through gameplay or purchase promotional sweepstakes coins.",
                  color: "from-indigo-500 to-blue-500"
                },
                {
                  icon: <AlertTriangle className="w-8 h-8" />,
                  title: "Disqualification",
                  description: "Violation of rules, fraudulent activity, or failure to complete verification may result in disqualification and account suspension.",
                  color: "from-red-500 to-pink-500"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  {...fadeInUp}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-600/30 rounded-xl p-6 hover:border-gray-500/50 transition-all duration-300 group"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${item.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Legal Notices */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Important Legal Notices
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-red-300 mb-2">No Purchase Necessary</h3>
                      <p className="text-red-200 text-sm leading-relaxed">
                        NO PURCHASE NECESSARY. VOID WHERE PROHIBITED. This is a sweepstakes platform.
                        Players can participate without making any purchase. Gold Coins have no monetary value.
                        Sweepstakes Coins are promotional entries only.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-yellow-300 mb-2">Age & Identity Verification</h3>
                      <p className="text-yellow-200 text-sm leading-relaxed">
                        Must be 18+ and successfully complete identity verification to play. All winners must provide
                        valid government-issued ID for prize distribution. Failure to verify identity will result in
                        forfeiture of any potential winnings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-blue-300 mb-2">Odds & Selection</h3>
                      <p className="text-blue-200 text-sm leading-relaxed">
                        Odds of winning depend on number of eligible entries at time of drawing. Winners are selected
                        through a combination of skill-based gameplay and random selection mechanisms. All selections
                        are final and cannot be appealed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-8 text-white">
              Questions About the Rules?
            </h2>

            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-600/30 rounded-xl p-8">
              <p className="text-gray-300 mb-6 leading-relaxed">
                If you have questions about these official rules or need clarification on any aspect of gameplay,
                our support team is here to help.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/support"
                  className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Contact Support
                </Link>

                <Link
                  href="/legal/terms"
                  className="border-2 border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 px-8 py-3 rounded-lg transition-all duration-300"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </CasinoLayout>
  )
}
