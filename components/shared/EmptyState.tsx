import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
