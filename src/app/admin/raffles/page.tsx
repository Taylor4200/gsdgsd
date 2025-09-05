'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Play, Pause, Calendar, DollarSign, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import CasinoLayout from '@/components/layout/CasinoLayout'

interface Raffle {
  id: string
  title: string
  description: string
  total_prize: number
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'ended' | 'completed'
  raffle_prizes: Array<{
    id: string
    place: number
    amount: number
    percentage: number
  }>
  raffle_game_multipliers: Array<{
    id: string
    game_id: string
    game_name: string
    multiplier: number
    wager_requirement: number
    tickets_per_wager: number
  }>
}

const RaffleAdmin: React.FC = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_prize: '',
    start_date: '',
    end_date: '',
    prizes: [
      { place: 1, amount: '', percentage: '' },
      { place: 2, amount: '', percentage: '' },
      { place: 3, amount: '', percentage: '' }
    ],
    game_multipliers: [
      { game_id: 'general', game_name: 'All Games', multiplier: '1.00', wager_requirement: '1000', tickets_per_wager: '1' }
    ]
  })

  // Available games for multipliers
  const availableGames = [
    { id: 'general', name: 'All Games' },
    { id: 'blackjack', name: 'Blackjack' },
    { id: 'baccarat', name: 'Baccarat' },
    { id: 'dice', name: 'Dice' },
    { id: 'limbo', name: 'Limbo' },
    { id: 'minesweeper', name: 'Minesweeper' },
    { id: 'plinko', name: 'Plinko' }
  ]

  useEffect(() => {
    fetchRaffles()
  }, [])

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/raffles?includeEnded=true')
      const data = await response.json()
      setRaffles(data.raffles || [])
    } catch (error) {
      console.error('Error fetching raffles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRaffle = async () => {
    try {
      const response = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error creating raffle:', error)
    }
  }

  const handleUpdateRaffle = async () => {
    if (!editingRaffle) return

    try {
      const response = await fetch('/api/raffles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffle_id: editingRaffle.id,
          ...formData
        })
      })

      if (response.ok) {
        setEditingRaffle(null)
        resetForm()
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error updating raffle:', error)
    }
  }

  const handleDeleteRaffle = async (raffleId: string) => {
    if (!confirm('Are you sure you want to delete this raffle?')) return

    try {
      const response = await fetch('/api/raffles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffle_id: raffleId })
      })

      if (response.ok) {
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error deleting raffle:', error)
    }
  }

  const handleStatusChange = async (raffleId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/raffles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffle_id: raffleId,
          status: newStatus
        })
      })

      if (response.ok) {
        fetchRaffles()
      }
    } catch (error) {
      console.error('Error updating raffle status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      total_prize: '',
      start_date: '',
      end_date: '',
      prizes: [
        { place: 1, amount: '', percentage: '' },
        { place: 2, amount: '', percentage: '' },
        { place: 3, amount: '', percentage: '' }
      ],
      game_multipliers: [
        { game_id: 'general', game_name: 'All Games', multiplier: '1.00', wager_requirement: '1000', tickets_per_wager: '1' }
      ]
    })
  }

  const openEditModal = (raffle: Raffle) => {
    setEditingRaffle(raffle)
    setFormData({
      title: raffle.title,
      description: raffle.description || '',
      total_prize: raffle.total_prize.toString(),
      start_date: raffle.start_date.split('T')[0],
      end_date: raffle.end_date.split('T')[0],
      prizes: raffle.raffle_prizes.map(prize => ({
        place: prize.place,
        amount: prize.amount.toString(),
        percentage: prize.percentage.toString()
      })),
      game_multipliers: raffle.raffle_game_multipliers.map(mult => ({
        game_id: mult.game_id,
        game_name: mult.game_name,
        multiplier: mult.multiplier.toString(),
        wager_requirement: mult.wager_requirement.toString(),
        tickets_per_wager: mult.tickets_per_wager.toString()
      }))
    })
  }

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { place: prev.prizes.length + 1, amount: '', percentage: '' }]
    }))
  }

  const removePrize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }))
  }

  const addGameMultiplier = () => {
    setFormData(prev => ({
      ...prev,
      game_multipliers: [...prev.game_multipliers, { 
        game_id: 'general', 
        game_name: 'All Games', 
        multiplier: '1.00', 
        wager_requirement: '1000', 
        tickets_per_wager: '1' 
      }]
    }))
  }

  const removeGameMultiplier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      game_multipliers: prev.game_multipliers.filter((_, i) => i !== index)
    }))
  }

  const updateGameMultiplier = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      game_multipliers: prev.game_multipliers.map((mult, i) => 
        i === index ? { ...mult, [field]: value } : mult
      )
    }))
  }

  const RaffleContent = () => (
    <div className="min-h-screen bg-[#0f1419] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Raffle Management</h1>
            <p className="text-gray-400">Manage raffles, prizes, and game multipliers</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Raffle
          </Button>
        </div>

        {/* Raffles List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {raffles.map((raffle) => (
            <motion.div
              key={raffle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a2c38] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{raffle.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  raffle.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  raffle.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                  raffle.status === 'ended' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {raffle.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>${raffle.total_prize.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(raffle.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{raffle.raffle_prizes.length} prizes</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(raffle)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRaffle(raffle.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {raffle.status === 'draft' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(raffle.id, 'active')}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                {raffle.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(raffle.id, 'ended')}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingRaffle) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a2c38] border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingRaffle ? 'Edit Raffle' : 'Create New Raffle'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Weekly Raffle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Prize ($)</label>
                  <Input
                    type="number"
                    value={formData.total_prize}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_prize: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                  rows={3}
                  placeholder="Raffle description..."
                />
              </div>

              {/* Prizes Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Prizes</h3>
                  <Button
                    onClick={addPrize}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Prize
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.prizes.map((prize, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        value={prize.place}
                        onChange={(e) => {
                          const newPrizes = [...formData.prizes]
                          newPrizes[index].place = parseInt(e.target.value) || 0
                          setFormData(prev => ({ ...prev, prizes: newPrizes }))
                        }}
                        className="w-20 bg-gray-800 border-gray-600 text-white"
                        placeholder="Place"
                      />
                      <Input
                        value={prize.amount}
                        onChange={(e) => {
                          const newPrizes = [...formData.prizes]
                          newPrizes[index].amount = e.target.value
                          setFormData(prev => ({ ...prev, prizes: newPrizes }))
                        }}
                        className="flex-1 bg-gray-800 border-gray-600 text-white"
                        placeholder="Amount ($)"
                      />
                      <Input
                        value={prize.percentage}
                        onChange={(e) => {
                          const newPrizes = [...formData.prizes]
                          newPrizes[index].percentage = e.target.value
                          setFormData(prev => ({ ...prev, prizes: newPrizes }))
                        }}
                        className="w-24 bg-gray-800 border-gray-600 text-white"
                        placeholder="%"
                      />
                      <Button
                        onClick={() => removePrize(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Multipliers Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Game Multipliers</h3>
                  <Button
                    onClick={addGameMultiplier}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Game
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.game_multipliers.map((multiplier, index) => (
                    <div key={index} className="grid grid-cols-5 gap-3 items-center">
                      <select
                        value={multiplier.game_id}
                        onChange={(e) => {
                          const game = availableGames.find(g => g.id === e.target.value)
                          updateGameMultiplier(index, 'game_id', e.target.value)
                          updateGameMultiplier(index, 'game_name', game?.name || '')
                        }}
                        className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                      >
                        {availableGames.map(game => (
                          <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                      </select>
                      <Input
                        value={multiplier.multiplier}
                        onChange={(e) => updateGameMultiplier(index, 'multiplier', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Multiplier"
                      />
                      <Input
                        value={multiplier.wager_requirement}
                        onChange={(e) => updateGameMultiplier(index, 'wager_requirement', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Wager Req ($)"
                      />
                      <Input
                        value={multiplier.tickets_per_wager}
                        onChange={(e) => updateGameMultiplier(index, 'tickets_per_wager', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Tickets"
                      />
                      <Button
                        onClick={() => removeGameMultiplier(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingRaffle(null)
                    resetForm()
                  }}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingRaffle ? handleUpdateRaffle : handleCreateRaffle}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingRaffle ? 'Update Raffle' : 'Create Raffle'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <CasinoLayout>
      <RaffleContent />
    </CasinoLayout>
  )
}

export default RaffleAdmin
