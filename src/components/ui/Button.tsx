import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const buttonVariants = cva(
  'group inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-neon-blue text-black hover:bg-neon-blue/90 shadow-neon hover:shadow-neon-hover',
        secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20',
        outline: 'border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black shadow-neon hover:shadow-neon-hover',
        ghost: 'text-white hover:bg-white/10',
        neon: 'btn-neon bg-transparent border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black',
        gradient: 'bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink text-white hover:shadow-lg hover:shadow-neon-hover',
        success: 'bg-neon-green text-black hover:bg-neon-green/90 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]',
        warning: 'bg-neon-yellow text-black hover:bg-neon-yellow/90 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {/* Shimmer effect for neon variant */}
        {variant === 'neon' && (
          <div className="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
        )}
        
        {loading && (
          <div className="mr-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {!loading && icon && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
