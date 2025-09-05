'use client'

import React from 'react'
import { Coins, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'

interface CurrencySelectorProps {
  selectedCurrency: 'GC' | 'SC'
  onCurrencyChange: (currency: 'GC' | 'SC') => void
  className?: string
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  selectedCurrency, 
  onCurrencyChange, 
  className = '' 
}) => {
  const { user } = useUserStore()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant={selectedCurrency === 'SC' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCurrencyChange('SC')}
        className={`flex items-center space-x-2 ${
          selectedCurrency === 'SC' 
            ? 'bg-[#00d4ff] text-black hover:bg-[#00d4ff]/90' 
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <DollarSign className="h-4 w-4" />
        <span className="text-sm font-medium">SC</span>
        <span className="text-xs">({user?.balance || 0})</span>
      </Button>
      
      <Button
        variant={selectedCurrency === 'GC' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCurrencyChange('GC')}
        className={`flex items-center space-x-2 ${
          selectedCurrency === 'GC' 
            ? 'bg-purple-500 text-white hover:bg-purple-600' 
            : 'text-gray-400 hover:text-white'
        }`}
      >
        <Coins className="h-4 w-4" />
        <span className="text-sm font-medium">GC</span>
        <span className="text-xs">({user?.gcBalance || 0})</span>
      </Button>
    </div>
  )
}

export default CurrencySelector
