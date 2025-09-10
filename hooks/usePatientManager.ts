import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { getPatientStatus as getPatientStatusUtil } from '@/lib/patient-utils'
import type { Patient } from '@/lib/store'

const DEFAULT_PATIENTS: Patient[] = [
  { id: "p001", name: "Maria Martinez", appointment: "Today • 9:00 AM" },
  { id: "p002", name: "John Kim", appointment: "Today • 9:30 AM" },
  { id: "p003", name: "Ava Patel", appointment: "Today • 10:00 AM" },
  { id: "p004", name: "Liam Johnson", appointment: "Today • 10:30 AM" },
]

export function usePatientManager() {
  const patientsList = useAppStore(state => state.patientsList)
  const setPatientsList = useAppStore(state => state.setPatientsList)
  const addPatient = useAppStore(state => state.addPatient)
  const removePatient = useAppStore(state => state.removePatient)
  const getPatient = useAppStore(state => state.getPatient)

  // Initialize default patients if none exist
  useEffect(() => {
    if (patientsList.length === 0) {
      setPatientsList(DEFAULT_PATIENTS)
    }
  }, [patientsList.length, setPatientsList])

  // Helper to check if patient has previous transcriptions or trials
  const getPatientStatus = useMemo(() => {
    return (patientId: string) => {
      const patient = getPatient(patientId)
      return getPatientStatusUtil(patient)
    }
  }, [getPatient])

  // Get patient by ID with memoization
  const findPatient = useMemo(() => {
    return (patientId: string) => patientsList.find(p => p.id === patientId)
  }, [patientsList])

  return {
    patients: patientsList,
    addPatient,
    removePatient,
    getPatient,
    findPatient,
    getPatientStatus,
  }
}

export type { Patient }
