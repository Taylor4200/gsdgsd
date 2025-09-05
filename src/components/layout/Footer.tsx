'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Twitter, 
  MessageCircle, 
  Send, 
  Mail, 
  Shield, 
  HelpCircle, 
  FileText,
  Users
} from 'lucide-react'

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: MessageCircle, href: '#', label: 'Discord' },
    { icon: Send, href: '#', label: 'Telegram' },
    { icon: Mail, href: '#', label: 'Email' }
  ]

  const footerSections = [
    {
      title: 'Games',
      links: [
        { name: 'Slots', href: '/games/slots' },
        { name: 'Crash', href: '/games/crash' },
        { name: 'Dice', href: '/games/dice' },
        { name: 'Roulette', href: '/games/roulette' },
        { name: 'Live Casino', href: '/live' }
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Leaderboard', href: '/leaderboard' },
        { name: 'Tournaments', href: '/tournaments' },
        { name: 'Achievements', href: '/achievements' },
        { name: 'Referrals', href: '/referrals' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Bug Reports', href: '/bugs' },
        { name: 'Feature Requests', href: '/features' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Responsible Gaming', href: '/responsible-gaming' },
        { name: 'Fair Play', href: '/fair-play' }
      ]
    }
  ]

  return (
    <footer className="relative border-t border-white/10 bg-black/40 backdrop-blur-sm">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 right-1/4 w-48 h-48 bg-neon-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className="text-3xl font-bold font-futuristic neon-text-blue">
                  NEXUS
                </span>
              </div>
              
              <p className="text-gray-400 mb-6 max-w-md">
                Experience the future of social gaming with crypto-inspired sweepstakes, 
                pack draws, and real-time multiplayer action. Join thousands of players 
                in the next generation of online entertainment.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-neon-blue transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 font-futuristic">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-neon-blue transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="border-t border-white/10 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-neon-green" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-neon-blue" />
                <span>18+ Only</span>
              </div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4 text-neon-purple" />
                <span>Fair Play Certified</span>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              © 2024 Nexus Casino. All rights reserved.
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 text-xs text-gray-500 text-center max-w-4xl mx-auto">
            <p className="mb-2">
              This is a social casino for entertainment purposes only. No real money gambling or prizes are involved. 
              You must be 18 years or older to participate.
            </p>
            <p>
              Please play responsibly. If you or someone you know has a gambling problem, 
              visit <a href="#" className="text-neon-blue hover:underline">ResponsibleGaming.org</a> for help.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
