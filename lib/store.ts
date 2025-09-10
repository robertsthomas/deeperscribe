import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
export interface Patient {
  id: string
  name: string
  appointment: string
}

export interface KeyMoment {
  desc: string
  time: string
  searchText: string
}

export interface TranscriptionData {
  createdAt: string
  formattedTranscript?: string
  keyMoments?: KeyMoment[]
  trials?: any
}

export interface PatientData {
  profile?: any
  confidence?: number
  transcript?: string
  formattedTranscript?: string
  keyMoments?: KeyMoment[]
  trials?: any
  transcriptions?: Record<string, TranscriptionData>
}

interface AppState {
  // Data
  global: {
    doctorName?: string
    nameVisibility?: string
  }
  patientsList: Patient[]
  patients: Record<string, PatientData>
  
  // Actions
  setGlobal: (key: keyof AppState['global'], value: string) => void
  setPatientsList: (patients: Patient[]) => void
  addPatient: (patient: Patient) => void
  removePatient: (patientId: string) => void
  setPatientItem: <K extends keyof PatientData>(
    patientId: string, 
    key: K, 
    value: PatientData[K]
  ) => void
  setTranscriptionItem: <K extends keyof TranscriptionData>(
    patientId: string,
    transcriptionId: string,
    key: K,
    value: TranscriptionData[K]
  ) => void
  getPatient: (patientId: string) => PatientData | undefined
  getTranscription: (patientId: string, transcriptionId: string) => TranscriptionData | undefined
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      global: {},
      patientsList: [],
      patients: {},
      
      // Actions
      setGlobal: (key, value) =>
        set((state) => ({
          global: { ...state.global, [key]: value }
        })),
      
      setPatientsList: (patientsList) => set({ patientsList }),
      
      addPatient: (patient) =>
        set((state) => ({
          patientsList: [...state.patientsList, patient]
        })),
      
      removePatient: (patientId) =>
        set((state) => ({
          patientsList: state.patientsList.filter(p => p.id !== patientId),
          patients: Object.fromEntries(
            Object.entries(state.patients).filter(([id]) => id !== patientId)
          )
        })),
      
      setPatientItem: (patientId, key, value) =>
        set((state) => ({
          patients: {
            ...state.patients,
            [patientId]: {
              ...state.patients[patientId],
              [key]: value
            }
          }
        })),
      
      setTranscriptionItem: (patientId, transcriptionId, key, value) =>
        set((state) => {
          const patient = state.patients[patientId] || {}
          const transcriptions = patient.transcriptions || {}
          
          return {
            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                transcriptions: {
                  ...transcriptions,
                  [transcriptionId]: {
                    ...transcriptions[transcriptionId],
                    [key]: value
                  }
                }
              }
            }
          }
        }),
      
      getPatient: (patientId) => get().patients[patientId],
      
      getTranscription: (patientId, transcriptionId) => {
        const patient = get().patients[patientId]
        return patient?.transcriptions?.[transcriptionId]
      }
    }),
    {
      name: 'deeperscribe',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// Convenience hooks
export const useGlobal = () => useAppStore((state) => state.global)
export const usePatientsList = () => useAppStore((state) => state.patientsList)
