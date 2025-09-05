import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'neon' | 'glass'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-dark-200 border-white/20 focus:border-neon-blue',
      neon: 'bg-transparent border-neon-blue focus:border-neon-purple focus:shadow-neon',
      glass: 'glass backdrop-blur-lg border-white/30 focus:border-neon-blue'
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <motion.input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-lg border px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:ring-offset-2 focus:ring-offset-dark-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              icon && 'pl-10',
              variants[variant],
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
              className
            )}
            ref={ref}
            whileFocus={{ scale: 1.02 }}
            {...(props as any)}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
