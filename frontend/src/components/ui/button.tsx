'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

    const variants = {
      primary:
        'bg-[#FF6B35] text-[#1A2530] hover:bg-[#FF8557] focus-visible:ring-[#FF6B35] active:scale-[0.98]',
      outline:
        'border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-[#1A2530] focus-visible:ring-[#FF6B35] active:scale-[0.98]',
      ghost:
        'text-[#F0EDE8] hover:bg-[#27384A] focus-visible:ring-[#FF6B35]',
    }

    const sizes = {
      sm:  'h-9 px-4 text-sm rounded-md',
      md:  'h-11 px-6 text-sm rounded-lg',
      lg:  'h-14 px-8 text-base rounded-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// Wrapper para usar como enlace
interface LinkButtonProps extends ButtonProps {
  href: string
  target?: string
  rel?: string
}

export function LinkButton({ href, target, rel, ...props }: LinkButtonProps) {
  return (
    <a href={href} target={target} rel={rel} className="inline-flex">
      <Button {...props} />
    </a>
  )
}

export { Button }
