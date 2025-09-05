'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  Heart,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Phone,
  CheckCircle,
  X,
  ArrowLeft,
  Mail,
  MapPin
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'

export default function ResponsibleGamingPage() {
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
                <Heart className="w-12 h-12 text-[#00d4ff] mr-4" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Responsible Gaming
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    Edge Sweepstakes Platform
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Your well-being is our priority. Learn about responsible gaming practices,
                self-control tools, and resources for maintaining a healthy relationship with gaming.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Our Commitment */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Our Commitment to Responsible Gaming
              </h2>

              <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Heart className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-green-300 mb-3">Gaming Should Be Fun</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      At Edge, we believe gaming should be an enjoyable pastime, not a source of financial hardship or personal problems.
                      Our sweepstakes platform is designed for entertainment, with built-in safeguards to promote responsible play.
                    </p>
                    <div className="bg-green-900/30 rounded-lg p-3">
                      <p className="text-green-200 text-sm">
                        <strong>Remember:</strong> Our games are sweepstakes contests for entertainment. Gold Coins have no monetary value.
                        Sweepstakes Coins are promotional entries only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gaming Tools & Limits */}
          <motion.div
            {...staggerContainer}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              Responsible Gaming Tools & Practices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: "Time Management",
                  description: "Set healthy time limits and maintain balance in your life.",
                  color: "from-blue-500 to-cyan-500",
                  tips: [
                    "Set session time limits",
                    "Take regular breaks",
                    "Balance with other activities",
                    "Don't let gaming interfere with responsibilities"
                  ]
                },
                {
                  icon: <DollarSign className="w-8 h-8" />,
                  title: "Financial Awareness",
                  description: "Only spend what you can afford and maintain financial control.",
                  color: "from-green-500 to-teal-500",
                  tips: [
                    "Spend only disposable income",
                    "Never chase losses",
                    "Track your spending",
                    "Set spending limits"
                  ]
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Self-Exclusion",
                  description: "Take a break when needed with our self-exclusion options.",
                  color: "from-purple-500 to-indigo-500",
                  tips: [
                    "Temporary suspension (7 days - 6 months)",
                    "Permanent account closure",
                    "Easy access through support",
                    "No questions asked"
                  ]
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Parental Controls",
                  description: "Tools and guidance for families to manage gaming access.",
                  color: "from-orange-500 to-red-500",
                  tips: [
                    "18+ age restriction",
                    "Parental monitoring",
                    "Device restrictions",
                    "Open communication"
                  ]
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

                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>

                  <ul className="text-gray-300 text-xs space-y-1">
                    {item.tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Warning Signs */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Warning Signs & When to Seek Help
              </h2>

              <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-red-300 mb-3">Recognize the Signs</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      Consider seeking help if you experience any of these warning signs:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <ul className="text-gray-300 space-y-2">
                        <li>• Spending more time/money than intended</li>
                        <li>• Neglecting work/family responsibilities</li>
                        <li>• Lying about gaming activities</li>
                        <li>• Borrowing money to fund gaming</li>
                      </ul>
                      <ul className="text-gray-300 space-y-2">
                        <li>• Feeling anxious/depressed about gaming</li>
                        <li>• Trying to win back losses</li>
                        <li>• Gaming to escape problems/emotions</li>
                        <li>• Loss of control over gaming habits</li>
                      </ul>
                    </div>
                    <div className="bg-red-900/30 rounded-lg p-3 mt-4">
                      <p className="text-red-200 text-sm font-semibold">
                        If you recognize these signs in yourself or someone you know,
                        help is available and it's never too late to seek assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Help Resources */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Professional Help & Support Resources
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-300 mb-3">24/7 Crisis Support</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="text-blue-300 font-semibold mb-2">United States</h4>
                          <ul className="text-gray-300 space-y-1">
                            <li>• <strong>National Helpline:</strong> 1-800-522-4700</li>
                            <li>• <strong>Gamblers Anonymous:</strong> gamblersanonymous.org</li>
                            <li>• <strong>National Council:</strong> ncpgambling.org</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-blue-300 font-semibold mb-2">International Resources</h4>
                          <ul className="text-gray-300 space-y-1">
                            <li>• <strong>BeGambleAware:</strong> begambleaware.org</li>
                            <li>• <strong>Gambling Therapy:</strong> gamblingtherapy.org</li>
                            <li>• <strong>GamCare:</strong> gamcare.org.uk</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Users className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-300 mb-3">Support for Family & Friends</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        If you're supporting someone with a gaming concern, these resources can help:
                      </p>
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>• <strong>Gam-Anon:</strong> gam-anon.org - Support for family members</li>
                        <li>• <strong>Family Helpline:</strong> Available through most problem gambling organizations</li>
                        <li>• <strong>Educational Resources:</strong> Learn about gaming addiction and recovery</li>
                        <li>• <strong>Counseling Services:</strong> Professional help for affected family members</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-8 text-white">
              Get Help Today
            </h2>

            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-600/30 rounded-xl p-8">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Our responsible gaming team is here to support you. Whether you need help with self-exclusion,
                have questions about responsible gaming tools, or want to discuss your gaming habits,
                we're here to help you maintain a healthy relationship with gaming.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
                  <Mail className="w-8 h-8 text-[#00d4ff] mb-2" />
                  <p className="text-sm text-gray-300">responsible@edgecasino.com</p>
                  <p className="text-xs text-gray-400 mt-1">Responsible Gaming Support</p>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
                  <Phone className="w-8 h-8 text-[#00d4ff] mb-2" />
                  <p className="text-sm text-gray-300">support@edgecasino.com</p>
                  <p className="text-xs text-gray-400 mt-1">General Support</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/support"
                  className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Contact Support Team
                </Link>

                <a
                  href="tel:1-800-522-4700"
                  className="border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 px-8 py-3 rounded-lg transition-all duration-300"
                >
                  24/7 Crisis Helpline
                </a>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </CasinoLayout>
  )
}
