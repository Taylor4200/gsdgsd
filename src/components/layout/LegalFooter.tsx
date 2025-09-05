'use client'

import React from 'react'
import Link from 'next/link'
import {
  Shield,
  FileText,
  Heart,
  Lock,
  Eye
} from 'lucide-react'

export default function LegalFooter() {
  return (
    <footer className="bg-gradient-to-r from-[#0f1419] via-[#1a1f2e] to-[#0f1419] border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-8">

        {/* Company Branding */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img
                src="/Logo11.png"
                alt="Edge Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edge</h3>
            </div>
          </div>
        </div>

        {/* Main Legal Notice */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm mb-4">
            © 2025 Edge. All rights reserved.
          </p>

          <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg p-6 mb-6">
            <p className="text-red-300 text-sm font-semibold leading-relaxed mb-4">
              NO PURCHASE NECESSARY. VOID WHERE PROHIBITED. 18+ ONLY.
            </p>
            <p className="text-red-200 text-sm leading-relaxed mb-4">
              Gold Coins have no monetary value. Sweepstakes Coins are promotional entries.
            </p>
            <p className="text-red-200 text-sm leading-relaxed mb-4">
              Odds of winning depend on number of eligible entries.
            </p>
            <p className="text-red-200 text-sm leading-relaxed">
              All winnings are subject to verification and may be subject to federal, state, and local taxes.
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm leading-relaxed">
              Must be 18+ and successfully complete identity verification to play.
              If you or someone you know has a gambling problem, call 1-800-522-4700 (US).
            </p>
          </div>

          <div className="bg-gradient-to-r from-gray-900/20 to-gray-800/20 border border-gray-500/30 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              Not available in WA, ID, NV, MI. Void where prohibited by law.
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/legal/rules"
              className="text-gray-300 hover:text-[#00d4ff] transition-colors"
            >
              [Official Rules]
            </Link>
            <Link
              href="/legal/terms"
              className="text-gray-300 hover:text-[#00d4ff] transition-colors"
            >
              [Terms of Service]
            </Link>
            <Link
              href="/legal/privacy"
              className="text-gray-300 hover:text-[#00d4ff] transition-colors"
            >
              [Privacy Policy]
            </Link>
            <Link
              href="/legal/responsible-gaming"
              className="text-gray-300 hover:text-[#00d4ff] transition-colors"
            >
              [Responsible Gaming]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
