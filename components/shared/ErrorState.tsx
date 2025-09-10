import React from 'react'

interface ErrorStateProps {
  error: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  error, 
  onRetry,
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      {onRetry && (
        <button 
          type="button"
          onClick={onRetry}
          className="text-sm text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}
