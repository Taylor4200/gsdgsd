'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  FileText,
  Users,
  Gift,
  AlertTriangle,
  Lock,
  Eye,
  CheckCircle,
  X,
  ArrowLeft,
  DollarSign,
  Clock,
  Database,
  UserCheck,
  MonitorSpeaker
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'

export default function TermsPage() {
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
                    Terms of Service
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    Edge Sweepstakes Platform
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Complete terms and conditions governing your use of Edge sweepstakes platform,
                including eligibility, gameplay rules, and legal compliance.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Eligibility & Account Section */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Eligibility & Account Requirements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-green-300 mb-3">Who Can Join</h3>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Must be 18 years or older</li>
                        <li>• Legal resident of permitted jurisdictions</li>
                        <li>• Not prohibited by applicable law</li>
                        <li>• One account per person/household</li>
                        <li>• Complete identity verification process</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <X className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-red-300 mb-3">Who Cannot Join</h3>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Under 18 years of age</li>
                        <li>• Residents of WA, ID, NV, MI</li>
                        <li>• Current/former Edge employees</li>
                        <li>• Immediate family members of employees</li>
                        <li>• Individuals with gambling restrictions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Anti-AML & KYC Section */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Anti-Money Laundering & KYC Compliance
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Lock className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-300 mb-3">Know Your Customer (KYC) Requirements</h3>
                      <ul className="text-gray-300 space-y-2 text-sm leading-relaxed">
                        <li>• <strong>Identity Verification:</strong> Government-issued photo ID required for all users</li>
                        <li>• <strong>Address Confirmation:</strong> Valid proof of address (utility bill, bank statement, etc.)</li>
                        <li>• <strong>Biometric Verification:</strong> Facial recognition or similar technology for account security</li>
                        <li>• <strong>Source of Funds:</strong> Documentation of legitimate source of funds for large transactions</li>
                        <li>• <strong>Ongoing Monitoring:</strong> Continuous verification of account activity and behavior patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <MonitorSpeaker className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-300 mb-3">Transaction Monitoring</h3>
                      <ul className="text-gray-300 space-y-2 text-sm leading-relaxed">
                        <li>• <strong>Real-time Analysis:</strong> All transactions monitored for suspicious patterns</li>
                        <li>• <strong>Threshold Alerts:</strong> Automated alerts for transactions exceeding defined limits</li>
                        <li>• <strong>Risk Assessment:</strong> Individual and aggregate risk scoring for all accounts</li>
                        <li>• <strong>Unusual Activity Detection:</strong> AI-powered detection of anomalous behavior</li>
                        <li>• <strong>Manual Review:</strong> Human oversight of high-risk transactions and accounts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-900/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Database className="w-8 h-8 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-orange-300 mb-3">Record Keeping & Reporting</h3>
                      <ul className="text-gray-300 space-y-2 text-sm leading-relaxed">
                        <li>• <strong>Transaction Records:</strong> Minimum 5-year retention of all transaction data</li>
                        <li>• <strong>Identity Documents:</strong> Secure storage of all verification documents</li>
                        <li>• <strong>Suspicious Activity Reports:</strong> Filing with FinCEN within 30 days when required</li>
                        <li>• <strong>Audit Trail:</strong> Complete documentation of all compliance actions and decisions</li>
                        <li>• <strong>Data Security:</strong> Bank-level encryption and security measures for all records</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Currency System */}
          <motion.div
            {...staggerContainer}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              Currency System & Gameplay
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <DollarSign className="w-8 h-8" />,
                  title: "Gold Coins (GC)",
                  description: "Play-for-fun currency with no monetary value. Used solely for entertainment and cannot be redeemed for prizes.",
                  color: "from-yellow-500 to-orange-500",
                  features: ["No purchase necessary", "Entertainment only", "Cannot be cashed out", "Unlimited gameplay"]
                },
                {
                  icon: <Gift className="w-8 h-8" />,
                  title: "Sweepstakes Coins (SC)",
                  description: "Promotional entries that can be redeemed for real prizes. Subject to KYC verification and AML compliance.",
                  color: "from-green-500 to-teal-500",
                  features: ["Redeemable for prizes", "1 SC = $1 value", "KYC verification required", "AML monitoring applied"]
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Game Fairness",
                  description: "All games use certified random number generation with provably fair algorithms.",
                  color: "from-blue-500 to-cyan-500",
                  features: ["Certified RNG", "Provably fair", "Independent testing", "No manipulation possible"]
                },
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: "Prize Redemption",
                  description: "Minimum redemption of 100 SC ($100). Processing time 3-5 business days after verification.",
                  color: "from-purple-500 to-indigo-500",
                  features: ["Min 100 SC redemption", "3-5 day processing", "Multiple payout options", "Tax reporting included"]
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
                    {item.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Prohibited Conduct */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Prohibited Conduct & Account Termination
              </h2>

              <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-red-300 mb-2">Violations Resulting in Immediate Termination</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                      <ul className="space-y-2">
                        <li>• Creating multiple accounts</li>
                        <li>• Using VPNs/proxies to circumvent restrictions</li>
                        <li>• Automated play or bot usage</li>
                        <li>• Attempting to manipulate games</li>
                        <li>• Sharing account credentials</li>
                      </ul>
                      <ul className="space-y-2">
                        <li>• Money laundering activities</li>
                        <li>• Fraudulent transactions</li>
                        <li>• Providing false information</li>
                        <li>• Violating AML/KYC requirements</li>
                        <li>• Any form of system abuse</li>
                      </ul>
                    </div>
                    <p className="text-red-300 text-sm font-semibold mt-4">
                      Violation of these terms may result in immediate account suspension, forfeiture of all coins,
                      and potential legal action. All violations are reported to relevant authorities as required by law.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal Notices */}
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              Important Legal Notices
            </h2>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-300 mb-2">No Purchase Necessary</h3>
                    <p className="text-yellow-200 text-sm leading-relaxed">
                      NO PURCHASE NECESSARY. VOID WHERE PROHIBITED. This is a sweepstakes platform.
                      Players can participate without making any purchase. Gold Coins have no monetary value.
                      Sweepstakes Coins are promotional entries only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-cyan-300 mb-2">Service Disclaimers</h3>
                    <ul className="text-cyan-200 text-sm leading-relaxed space-y-1">
                      <li>• No guarantees of winning or specific outcomes</li>
                      <li>• Service provided "as is" without warranties</li>
                      <li>• Edge reserves the right to modify terms at any time</li>
                      <li>• Limited liability for any damages or losses</li>
                      <li>• Participation constitutes acceptance of these terms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Information */}
        <motion.div
          {...fadeInUp}
          className="container mx-auto px-4 pb-8"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">
              Questions About Terms?
            </h2>

            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-600/30 rounded-xl p-8">
              <p className="text-gray-300 mb-6 leading-relaxed">
                If you have questions about these terms of service or need clarification on any aspect of our platform,
                our legal and compliance team is here to help.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/support"
                  className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Contact Support
                </Link>

                <Link
                  href="/legal/rules"
                  className="border-2 border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 px-8 py-3 rounded-lg transition-all duration-300"
                >
                  Official Rules
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </CasinoLayout>
  )
}
