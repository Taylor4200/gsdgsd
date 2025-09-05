'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'

export default function PrivacyPage() {
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
                <Lock className="w-12 h-12 text-[#00d4ff] mr-4" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Privacy Policy
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    Edge Sweepstakes Platform
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Your privacy is important to us. Learn how we collect, use, and protect your personal information
                while using our sweepstakes gaming platform.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          {/* Introduction */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Our Privacy Commitment
              </h2>

              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-cyan-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-cyan-300 mb-3">How We Protect Your Data</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      This Privacy Policy describes how Edge ("we," "us," or "our") collects, uses, and protects your personal information
                      when you use our sweepstakes gaming platform. Your privacy and data security are our top priorities.
                    </p>
                    <p className="text-cyan-200 text-sm">
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            {...staggerContainer}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              Information We Collect
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <UserCheck className="w-8 h-8" />,
                  title: "Personal Information",
                  description: "Information necessary for account creation, verification, and compliance.",
                  color: "from-blue-500 to-cyan-500",
                  items: [
                    "Name and contact details",
                    "Date of birth & age verification",
                    "Government-issued ID for KYC",
                    "Payment information (when applicable)",
                    "Geographic location & IP address"
                  ]
                },
                {
                  icon: <Database className="w-8 h-8" />,
                  title: "Usage Information",
                  description: "Data collected automatically during platform usage.",
                  color: "from-purple-500 to-indigo-500",
                  items: [
                    "Game activity & preferences",
                    "Account transaction history",
                    "Device & browser information",
                    "Cookies & tracking data",
                    "Login times & session data"
                  ]
                },
                {
                  icon: <Eye className="w-8 h-8" />,
                  title: "How We Use Information",
                  description: "Purpose and legitimate business interests for data processing.",
                  color: "from-green-500 to-teal-500",
                  items: [
                    "Provide sweepstakes gaming services",
                    "Verify identity & prize eligibility",
                    "Process redemptions & payments",
                    "Detect fraud & prevent abuse",
                    "Comply with legal requirements"
                  ]
                },
                {
                  icon: <Lock className="w-8 h-8" />,
                  title: "Data Security Measures",
                  description: "Industry-standard protections for your personal information.",
                  color: "from-red-500 to-pink-500",
                  items: [
                    "Bank-level encryption (256-bit SSL)",
                    "Secure data centers with physical security",
                    "Regular security audits & monitoring",
                    "Limited employee access controls",
                    "Multi-factor authentication"
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
                    {item.items.map((listItem, idx) => (
                      <li key={idx}>• {listItem}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Information Sharing */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Information Sharing & Your Rights
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-green-300 mb-3">We Do Not Sell Your Data</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Edge does not sell, trade, or rent your personal information to third parties for marketing purposes.
                        Your data is used solely to provide our services and comply with legal requirements.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="text-green-300 font-semibold mb-2">Trusted Service Providers</h4>
                          <ul className="text-gray-300 space-y-1">
                            <li>• Payment processors</li>
                            <li>• KYC verification services</li>
                            <li>• Cloud infrastructure</li>
                            <li>• Customer support tools</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-green-300 font-semibold mb-2">Your Privacy Rights</h4>
                          <ul className="text-gray-300 space-y-1">
                            <li>• Access your data</li>
                            <li>• Request data deletion</li>
                            <li>• Opt-out of marketing</li>
                            <li>• Data portability</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-yellow-300 mb-3">Legal Compliance & Disclosures</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        We may disclose information when required by law, court order, or government request.
                        This includes compliance with anti-money laundering regulations and law enforcement investigations.
                      </p>
                      <div className="bg-yellow-900/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-sm">
                          <strong>AML Compliance:</strong> Suspicious activities may be reported to relevant authorities
                          as required by the Bank Secrecy Act and other applicable regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Special Considerations */}
          <motion.div
            {...fadeInUp}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-white">
                Special Considerations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-3">Children's Privacy</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Services not intended for under 18</li>
                    <li>• No collection from children under 18</li>
                    <li>• Immediate deletion if discovered</li>
                    <li>• Parental contact encouraged</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-cyan-300 mb-3">International Users</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Services operated from United States</li>
                    <li>• Data may transfer to US servers</li>
                    <li>• GDPR compliance for EU users</li>
                    <li>• CCPA compliance for California</li>
                  </ul>
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
              Privacy Questions or Concerns?
            </h2>

            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-600/30 rounded-xl p-8">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Our privacy team is here to help with any questions about your data, privacy rights,
                or how we protect your information.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
                  <Mail className="w-8 h-8 text-[#00d4ff] mb-2" />
                  <p className="text-sm text-gray-300">privacy@edgecasino.com</p>
                  <p className="text-xs text-gray-400 mt-1">Privacy Inquiries</p>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-lg">
                  <Shield className="w-8 h-8 text-[#00d4ff] mb-2" />
                  <p className="text-sm text-gray-300">dpo@edgecasino.com</p>
                  <p className="text-xs text-gray-400 mt-1">Data Protection Officer</p>
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
                  Contact Privacy Team
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
