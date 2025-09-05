'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Search,
  Download,
  Eye,
  Clock,
  DollarSign
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatTime } from '@/lib/utils'

interface BetHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Bet {
  id: string
  game: string
  type: string
  betAmount: number
  payout: number
  multiplier?: number
  outcome: 'win' | 'loss'
  timestamp: Date
  gameId: string
}

const BetHistoryModal: React.FC<BetHistoryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'wins' | 'losses'>('all')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')

  const bets: Bet[] = [
    {
      id: '1',
      game: 'Sweet Bonanza',
      type: 'Slot Spin',
      betAmount: 10,
      payout: 125.50,
      multiplier: 12.55,
      outcome: 'win',
      timestamp: new Date(Date.now() - 300000),
      gameId: 'sweet-bonanza'
    },
    {
      id: '2',
      game: 'Crash',
      type: 'Crash Bet',
      betAmount: 25,
      payout: 0,
      multiplier: 1.23,
      outcome: 'loss',
      timestamp: new Date(Date.now() - 600000),
      gameId: 'crash'
    },
    {
      id: '3',
      game: 'Dice',
      type: 'Dice Roll',
      betAmount: 50,
      payout: 95,
      multiplier: 1.9,
      outcome: 'win',
      timestamp: new Date(Date.now() - 900000),
      gameId: 'dice'
    },
    {
      id: '4',
      game: 'Roulette',
      type: 'Red/Black',
      betAmount: 20,
      payout: 0,
      outcome: 'loss',
      timestamp: new Date(Date.now() - 1200000),
      gameId: 'roulette'
    },
    {
      id: '5',
      game: 'Blackjack',
      type: 'Hand',
      betAmount: 15,
      payout: 30,
      multiplier: 2.0,
      outcome: 'win',
      timestamp: new Date(Date.now() - 1500000),
      gameId: 'blackjack'
    }
  ]

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.game.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || bet.outcome === filterType.slice(0, -1)
    return matchesSearch && matchesFilter
  })

  const totalBets = bets.length
  const totalWagered = bets.reduce((sum, bet) => sum + bet.betAmount, 0)
  const totalWon = bets.reduce((sum, bet) => sum + bet.payout, 0)
  const netProfit = totalWon - totalWagered
  const winRate = (bets.filter(bet => bet.outcome === 'win').length / totalBets) * 100

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bet History"
      description="View all your betting activity"
      size="xl"
      variant="glass"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="border-[#2d3748] p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{totalBets}</div>
            <div className="text-sm text-gray-400">Total Bets</div>
          </Card>
          
          <Card variant="glass" className="border-[#2d3748] p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {formatCurrency(totalWagered)}
            </div>
            <div className="text-sm text-gray-400">Total Wagered</div>
          </Card>
          
          <Card variant="glass" className="border-[#2d3748] p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
            </div>
            <div className="text-sm text-gray-400">Net Profit</div>
          </Card>
          
          <Card variant="glass" className="border-[#2d3748] p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-[#1a2c38] border-[#2d3748]"
            />
          </div>
          
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All Bets' },
              { id: 'wins', label: 'Wins Only' },
              { id: 'losses', label: 'Losses Only' }
            ].map((filter) => (
              <Button
                key={filter.id}
                variant={filterType === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(filter.id as any)}
                className={filterType === filter.id ? "bg-[#00d4ff] text-black" : "border-[#2d3748]"}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="border-[#2d3748]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Bet List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredBets.map((bet, index) => (
            <motion.div
              key={bet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="glass" className="border-[#2d3748] hover:border-[#00d4ff]/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Outcome Indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        bet.outcome === 'win' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      
                      {/* Game Info */}
                      <div>
                        <div className="font-medium text-white">{bet.game}</div>
                        <div className="text-sm text-gray-400">{bet.type}</div>
                      </div>
                    </div>

                    {/* Bet Details */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">Bet</div>
                        <div className="text-white font-medium">
                          {formatCurrency(bet.betAmount)}
                        </div>
                      </div>
                      
                      {bet.multiplier && (
                        <div className="text-center">
                          <div className="text-gray-400">Multiplier</div>
                          <div className="text-purple-400 font-medium">
                            {bet.multiplier.toFixed(2)}x
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-gray-400">Payout</div>
                        <div className={`font-bold ${
                          bet.outcome === 'win' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(bet.payout)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-400">Profit</div>
                        <div className={`font-bold ${
                          bet.payout - bet.betAmount >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {bet.payout - bet.betAmount >= 0 ? '+' : ''}
                          {formatCurrency(bet.payout - bet.betAmount)}
                        </div>
                      </div>
                      
                      <div className="text-center min-w-[80px]">
                        <div className="text-gray-400">Time</div>
                        <div className="text-white text-xs">
                          {formatTime(bet.timestamp)}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredBets.length === 0 && (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No bets found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Start playing to see your bet history here'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default BetHistoryModal
