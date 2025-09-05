'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react'
import CasinoLayout from '@/components/layout/CasinoLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SupportPage() {
  return (
    <CasinoLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Support</h1>
          </div>
          <p className="text-gray-400">We're here to help 24/7</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="glass" className="border-[#2d3748] p-6 text-center">
            <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
            <p className="text-gray-400 mb-4">Get instant help from our support team</p>
            <Button variant="default" className="bg-green-500 text-white">
              Start Chat
            </Button>
          </Card>

          <Card variant="glass" className="border-[#2d3748] p-6 text-center">
            <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Email Support</h3>
            <p className="text-gray-400 mb-4">Send us a detailed message</p>
            <Button variant="outline" className="border-[#2d3748]">
              Send Email
            </Button>
          </Card>

          <Card variant="glass" className="border-[#2d3748] p-6 text-center">
            <HelpCircle className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">FAQ</h3>
            <p className="text-gray-400 mb-4">Find answers to common questions</p>
            <Button variant="outline" className="border-[#2d3748]">
              View FAQ
            </Button>
          </Card>
        </div>
      </div>
    </CasinoLayout>
  )
}
