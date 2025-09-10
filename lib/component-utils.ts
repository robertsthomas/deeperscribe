import React from 'react'

/**
 * Hook for managing loading states consistently across components
 */
export function useLoadingState<T>(initialData?: T) {
  const [state, setState] = React.useState({
    data: initialData ?? null,
    isLoading: false,
    error: null as string | null,
  })

  const setLoading = React.useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  const setData = React.useCallback((data: T) => {
    setState({ data: data as NonNullable<T> | null, isLoading: false, error: null })
  }, [])

  const setError = React.useCallback((error: string) => {
    setState(prev => ({ ...prev, isLoading: false, error }))
  }, [])

  const reset = React.useCallback(() => {
    setState({ data: initialData ?? null, isLoading: false, error: null })
  }, [initialData])

  return {
    ...state,
    setLoading,
    setData,
    setError,
    reset,
  }
}

/**
 * Hook for managing confirmation dialogs
 */
export function useConfirmation() {
  const confirm = React.useCallback((message: string): boolean => {
    return window.confirm(message)
  }, [])

  return { confirm }
}

/**
 * Hook for auto-scrolling to elements
 */
export function useAutoScroll() {
  const scrollToElement = React.useCallback((
    selector: string, 
    container?: React.RefObject<HTMLElement>,
    options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
  ) => {
    const timeoutId = setTimeout(() => {
      const element = container?.current?.querySelector(selector) || document.querySelector(selector)
      if (element) {
        element.scrollIntoView(options)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  return { scrollToElement }
}

// Re-export components from their new locations
export { LoadingSpinner } from '@/components/shared/LoadingSpinner'
export { EmptyState } from '@/components/shared/EmptyState'
export { ErrorState } from '@/components/shared/ErrorState'
