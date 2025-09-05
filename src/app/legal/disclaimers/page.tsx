'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, AlertTriangle, Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function LegalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0f1a2a] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center space-x-2 text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Casino</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1a2c38] rounded-lg shadow-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-8 w-8 text-[#00d4ff]" />
            <h1 className="text-3xl font-bold">Legal Disclaimers & Compliance</h1>
          </div>

          <div className="space-y-8">
            {/* Official Sweepstakes Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Official Sweepstakes Disclaimer
              </h2>
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
                <p className="text-center font-bold text-red-400 text-lg mb-4">
                  NO PURCHASE NECESSARY. VOID WHERE PROHIBITED.
                </p>
                <div className="space-y-3 text-sm">
                  <p>• <strong>Gold Coins (GC):</strong> Have no monetary value and are used solely for entertainment play</p>
                  <p>• <strong>Sweepstakes Coins (SC):</strong> Are promotional entries into sweepstakes contests</p>
                  <p>• <strong>Free Entry Method:</strong> Available by mail request (see Terms of Service)</p>
                  <p>• <strong>Eligibility:</strong> 18+ only, excludes WA, ID, NV, MI residents</p>
                  <p>• <strong>Redemption:</strong> Subject to KYC verification and minimum requirements</p>
                </div>
              </div>
            </section>

            {/* AML/KYC Disclosure */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                Anti-Money Laundering (AML) & Know Your Customer (KYC)
              </h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p><strong>Identity Verification Required:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li>• All prize redemptions require identity verification</li>
                  <li>• Government-issued photo ID must be provided</li>
                  <li>• Proof of address may be required</li>
                  <li>• Verification process takes 3-5 business days</li>
                  <li>• Prizes cannot be redeemed until verification is complete</li>
                </ul>
                <p className="text-yellow-400"><strong>Note:</strong> We reserve the right to request additional documentation for compliance purposes.</p>
              </div>
            </section>

            {/* Crypto Redemption Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4">Cryptocurrency Redemption Disclaimer</h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p><strong>If cryptocurrency is selected as a redemption option:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li>• Cryptocurrency values are volatile and subject to market fluctuations</li>
                  <li>• You assume all risk associated with cryptocurrency price changes</li>
                  <li>• We are not responsible for lost or incorrect wallet addresses</li>
                  <li>• Transaction fees may apply and are deducted from redemption amount</li>
                  <li>• Cryptocurrency transactions are irreversible once sent</li>
                  <li>• We recommend double-checking all wallet addresses before submission</li>
                </ul>
                <p className="text-red-400"><strong>Warning:</strong> Never share your private keys or seed phrases with anyone.</p>
              </div>
            </section>

            {/* Age Restriction */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4">Age Restriction Notice</h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p className="text-center font-bold text-[#00d4ff] text-lg">18+ ONLY</p>
                <p>• You must be 18 years of age or older to use our services</p>
                <p>• Age verification is required for all accounts</p>
                <p>• False age representation will result in account termination</p>
                <p>• Parents/guardians are responsible for monitoring underage access</p>
                <p>• We do not knowingly collect information from individuals under 18</p>
              </div>
            </section>

            {/* Jurisdiction Exclusions */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4">Jurisdiction Restrictions</h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p><strong>Services are not available to residents of:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li>• Washington (WA)</li>
                  <li>• Idaho (ID)</li>
                  <li>• Nevada (NV)</li>
                  <li>• Michigan (MI)</li>
                  <li>• Any jurisdiction where sweepstakes are prohibited</li>
                </ul>
                <p className="text-yellow-400"><strong>Note:</strong> This list may be updated based on legal requirements.</p>
              </div>
            </section>

            {/* Fair Gaming */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Fair Gaming & RNG Certification
              </h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p><strong>Our commitment to fair gaming:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li>• All games use certified Random Number Generation (RNG)</li>
                  <li>• RNG is independently tested and verified</li>
                  <li>• Game outcomes are completely random and fair</li>
                  <li>• No manipulation of results is possible</li>
                  <li>• Regular audits are conducted by third-party testing labs</li>
                  <li>• RNG certification reports are available upon request</li>
                </ul>
              </div>
            </section>

            {/* Liability Limitations */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4">Liability Limitations</h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p><strong>By using our services, you acknowledge:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li>• Services are provided "as is" without warranties</li>
                  <li>• We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>• Our liability is limited to the amount paid for Gold Coins</li>
                  <li>• We are not responsible for technical issues beyond our control</li>
                  <li>• Force majeure events may affect service availability</li>
                  <li>• We reserve the right to modify or discontinue services</li>
                </ul>
              </div>
            </section>

            {/* Regulatory Compliance */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4">Regulatory Compliance</h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p><strong>We operate in compliance with:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li>• Federal sweepstakes laws and regulations</li>
                  <li>• State-specific gaming and sweepstakes requirements</li>
                  <li>• Anti-money laundering (AML) regulations</li>
                  <li>• Know Your Customer (KYC) requirements</li>
                  <li>• Data protection and privacy laws (GDPR, CCPA)</li>
                  <li>• Consumer protection regulations</li>
                </ul>
                <p className="text-yellow-400"><strong>Note:</strong> Compliance requirements may change, and we will update our practices accordingly.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-[#00d4ff] mb-4">Legal Contact Information</h2>
              <div className="bg-[#2d3748] rounded-lg p-4 space-y-3">
                <p><strong>For legal inquiries:</strong></p>
                <p>Legal Department: legal@edgecasino.com</p>
                <p>Compliance Officer: compliance@edgecasino.com</p>
                <p>General Support: support@edgecasino.com</p>
                <p>Business Address: [Your Business Address]</p>
                <p className="text-sm text-gray-300">All legal notices should be sent via certified mail.</p>
              </div>
            </section>

            {/* Final Disclaimer */}
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mt-8">
              <p className="text-center font-bold text-red-400 text-lg mb-2">
                IMPORTANT LEGAL NOTICE
              </p>
              <p className="text-center text-sm">
                By using EDGE Casino services, you acknowledge that you have read, understood, and agree to all terms, 
                conditions, and disclaimers. If you do not agree with any provision, do not use our services. 
                Void where prohibited by law.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
