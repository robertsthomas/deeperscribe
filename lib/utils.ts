import React from 'react'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid, parseISO } from 'date-fns'
import { isNil } from 'lodash-es'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: string | Date, formatStr = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatStr) : 'Invalid date'
  } catch {
    return 'Invalid date'
  }
}


// Text highlighting utility
export function highlightText(text: string, highlight: string): (string | React.ReactElement)[] {
  if (!highlight.trim()) return [text]
  
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) => {
    const key = `${part.slice(0, 10)}-${index}-${part.length}`
    if (part.toLowerCase() === highlight.toLowerCase()) {
      return React.createElement('mark', {
        key: `highlight-${key}`,
        className: "bg-yellow-200 text-yellow-900 px-1 rounded"
      }, part)
    }
    return part
  })
}

// Validation utilities
export function isValidTranscript(transcript: string | null | undefined, minLength = 100): boolean {
  if (isNil(transcript)) return false
  return transcript.trim().length >= minLength
}
