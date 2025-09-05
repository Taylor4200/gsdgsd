'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  AlertTriangle, 
  Home, 
  Gamepad2, 
  ArrowLeft, 
  RefreshCw,
  Search,
  Trophy,
  Zap,
  Dice6
} from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  const quickLinks = [
    { name: 'Casino Games', href: '/casino', icon: Dice6, color: 'text-blue-400' },
    { name: 'VIP Club', href: '/vip', icon: Trophy, color: 'text-yellow-400' },
    { name: 'Rewards', href: '/rewards', icon: Zap, color: 'text-green-400' },
    { name: 'Challenges', href: '/challenges', icon: Gamepad2, color: 'text-purple-400' }
  ]

  return (
    <CasinoLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Main 404 Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-[#00d4ff] via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4"
              >
                404
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-4 -right-4 md:-top-6 md:-right-6"
              >
                <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-red-400 animate-pulse" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Oops! Page Not Found
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              Looks like this page took a wrong turn at the casino! Don't worry, 
              there are plenty of winning opportunities waiting for you.
            </motion.p>

            {/* Action Buttons */}
                        <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link href="/">
                <Button className="bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90 px-8 py-3 text-lg font-semibold">
                  <Home className="h-5 w-5 mr-2" />
                  Go Home
                </Button>
              </Link>

              <Link href="/casino">
                <Button
                  variant="outline"
                  className="border-[#00d4ff]/50 text-[#00d4ff] hover:bg-[#00d4ff]/10 px-8 py-3 text-lg font-semibold"
                >
                  <Dice6 className="h-5 w-5 mr-2" />
                  Play Games
                </Button>
              </Link>

              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-white px-8 py-3 text-lg font-semibold"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Back
              </Button>
            </motion.div>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Popular Destinations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                                     <Card variant="glass" className="border-[#2d3748] hover:border-[#00d4ff]/50 transition-colors">
                     <CardContent className="p-6 text-center">
                       <link.icon className={`h-8 w-8 mx-auto mb-3 ${link.color}`} />
                       <h3 className="text-lg font-semibold text-white mb-2">{link.name}</h3>
                       <Link href={link.href}>
                         <Button
                           variant="ghost"
                           className="text-[#00d4ff] hover:text-[#00d4ff]/80"
                         >
                           Visit
                         </Button>
                       </Link>
                     </CardContent>
                   </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Fun Casino Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-[#00d4ff]/10 to-purple-500/10 border border-[#00d4ff]/20 rounded-xl p-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                While You're Here...
              </h3>
              <p className="text-gray-400">
                Check out these amazing stats from our casino!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00d4ff] mb-2">500+</div>
                <div className="text-gray-400">Games Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$2M+</div>
                <div className="text-gray-400">Paid Out This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">50K+</div>
                <div className="text-gray-400">Active Players</div>
              </div>
            </div>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              Can't find what you're looking for? Try using the search bar above or contact our support team.
            </p>
          </motion.div>
        </div>
      </div>
    </CasinoLayout>
  )
}
