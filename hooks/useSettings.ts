import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import type { SpeakerVisibility } from './useTranscription'

export function useSettings() {
  const global = useAppStore(state => state.global)
  const setGlobal = useAppStore(state => state.setGlobal)
  
  // Temporary state for doctor name input
  const [tempDoctorName, setTempDoctorName] = useState('')

  // Derived values
  const doctorName = global.doctorName || ''
  const nameVisibility = (global.nameVisibility as SpeakerVisibility) || 'first'
  const hasRequiredSetup = !!doctorName.trim()

  // Actions
  const setDoctorName = (name: string) => {
    setGlobal('doctorName', name.trim())
  }

  const setNameVisibility = (visibility: SpeakerVisibility) => {
    setGlobal('nameVisibility', visibility)
  }

  // Format doctor name for display (with Dr. prefix)
  const formatDoctorName = (name: string = doctorName) => {
    if (!name.trim()) return 'Not set'
    return name.startsWith('Dr.') ? name : `Dr. ${name}`
  }

  return {
    // Values
    doctorName,
    nameVisibility,
    hasRequiredSetup,
    tempDoctorName,
    
    // Actions
    setDoctorName,
    setNameVisibility,
    setTempDoctorName,
    formatDoctorName,
  }
}
