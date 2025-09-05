'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
  CheckCircle,
  X,
  ArrowLeft,
  Globe,
  Clock,
  Database,
  UserCheck,
  MonitorSpeaker
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'

export default function AMLPage() {
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
                <Lock className="w-12 h-12 text-purple-400 mr-4" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Anti-Money Laundering
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    Edge Compliance Program
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Edge is committed to maintaining the highest standards of Anti-Money Laundering (AML)
                compliance and Know Your Customer (KYC) procedures to ensure a safe and secure gaming environment.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Overview Section */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Our Commitment to AML Compliance
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-300 mb-3">Regulatory Compliance</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Edge operates in full compliance with all applicable Anti-Money Laundering
                        laws and regulations, including the Bank Secrecy Act (BSA), USA PATRIOT Act, and
                        state-level requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Eye className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-300 mb-3">Know Your Customer</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Our comprehensive KYC procedures verify player identities, monitor account activity,
                        and prevent fraudulent transactions to maintain platform integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AML Program Details */}
          <motion.div
            {...staggerContainer}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              Our AML Program Components
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <UserCheck className="w-8 h-8" />,
                  title: "Customer Identification Program (CIP)",
                  description: "Verify customer identities through multiple methods including government-issued ID, biometric verification, and address confirmation.",
                  color: "from-green-500 to-teal-500"
                },
                {
                  icon: <MonitorSpeaker className="w-8 h-8" />,
                  title: "Transaction Monitoring",
                  description: "Real-time monitoring of all transactions for suspicious patterns, unusual activity, and potential money laundering indicators.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Database className="w-8 h-8" />,
                  title: "Record Keeping",
                  description: "Maintain comprehensive records of all customer transactions, identification documents, and verification processes for regulatory compliance.",
                  color: "from-purple-500 to-indigo-500"
                },
                {
                  icon: <AlertTriangle className="w-8 h-8" />,
                  title: "Suspicious Activity Reporting",
                  description: "Report suspicious transactions to Financial Crimes Enforcement Network (FinCEN) within required timeframes.",
                  color: "from-red-500 to-pink-500"
                },
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: "Ongoing Monitoring",
                  description: "Continuous monitoring of customer accounts and transaction patterns to identify and prevent potential risks.",
                  color: "from-yellow-500 to-orange-500"
                },
                {
                  icon: <Globe className="w-8 h-8" />,
                  title: "International Compliance",
                  description: "Adherence to international AML standards including FATF recommendations and OFAC sanctions screening.",
                  color: "from-indigo-500 to-purple-500"
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

          {/* Risk Assessment */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Risk Assessment & Mitigation
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-red-300 mb-2">High-Risk Indicators</h3>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Multiple accounts under same IP address</li>
                        <li>• Rapid accumulation of large winnings</li>
                        <li>• Unusual transaction patterns or amounts</li>
                        <li>• Attempts to circumvent verification processes</li>
                        <li>• Use of VPNs or proxy servers for account creation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-green-300 mb-2">Mitigation Strategies</h3>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Multi-layer identity verification processes</li>
                        <li>• Advanced fraud detection algorithms</li>
                        <li>• Real-time transaction monitoring systems</li>
                        <li>• Enhanced due diligence for high-risk accounts</li>
                        <li>• Regular security audits and compliance reviews</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-white">
                Questions About Our AML Program?
              </h2>

              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-600/30 rounded-xl p-8">
                <p className="text-gray-300 mb-6 leading-relaxed">
                  If you have questions about our Anti-Money Laundering procedures or need assistance with
                  identity verification, our compliance team is here to help.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/support"
                    className="bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00d4ff]/90 hover:to-[#0099cc]/90 text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Contact Compliance Team
                  </Link>

                  <Link
                    href="/legal/privacy"
                    className="border-2 border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10 px-8 py-3 rounded-lg transition-all duration-300"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal Notice */}
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-300 mb-2">Important Notice</h3>
                  <p className="text-yellow-200 text-sm leading-relaxed">
                    Edge is committed to preventing money laundering and terrorist financing.
                    All activities are monitored in accordance with applicable laws and regulations.
                    Players found engaging in suspicious activities may have their accounts suspended or terminated.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </CasinoLayout>
  )
}
