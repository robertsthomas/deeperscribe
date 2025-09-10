import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

interface LoadingStateProps {
  children: React.ReactNode
  className?: string
}

export function LoadingState({ children, className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{children}</p>
    </div>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={`skeleton-${i}`} 
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )} 
        />
      ))}
    </div>
  )
}
