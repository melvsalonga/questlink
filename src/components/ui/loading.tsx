import React from 'react'
import { Loader2, Sword } from 'lucide-react'
import { cn } from '@/utils/cn'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'quest' | 'minimal'
  text?: string
  className?: string
}

export function Loading({ 
  size = 'md', 
  variant = 'default', 
  text = 'Loading...', 
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      </div>
    )
  }

  if (variant === 'quest') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
        <div className="relative">
          <Sword className={cn('text-primary animate-float', sizeClasses[size])} />
          <div className={cn('absolute inset-0 bg-primary/20 rounded-full animate-glow', sizeClasses[size])}></div>
        </div>
        <div className="text-center space-y-2">
          <p className={cn('font-medium text-foreground', textSizeClasses[size])}>
            {text}
          </p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center space-x-3 p-4', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      <span className={cn('text-muted-foreground', textSizeClasses[size])}>
        {text}
      </span>
    </div>
  )
}

// Skeleton loading component for cards
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
        <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted animate-pulse rounded"></div>
        <div className="h-3 bg-muted animate-pulse rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-muted animate-pulse rounded w-20"></div>
        <div className="h-8 bg-muted animate-pulse rounded w-24"></div>
      </div>
    </div>
  )
}

// Grid skeleton for loading multiple cards
export function SkeletonGrid({ 
  count = 6, 
  columns = 3,
  className 
}: { 
  count?: number
  columns?: number
  className?: string 
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-6', gridClasses[columns as keyof typeof gridClasses], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
