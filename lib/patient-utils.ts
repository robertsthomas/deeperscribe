import { sortBy } from 'lodash-es'
import type { Patient, TranscriptionData, PatientData } from './store'
import type { TrialsResponse } from './schemas'

export interface TrialSet {
  transcriptionId: string
  createdAt: string
  trials: TrialsResponse
}

export interface PatientStatus {
  hasData: boolean
  hasTrials: boolean
  hasPreviousTrials: boolean
  trialSetCount: number
  patient?: PatientData
}

/**
 * Extract and sort trial sets from a patient's transcriptions
 */
export function getPatientTrialSets(patientData: PatientData | null | undefined): TrialSet[] {
  if (!patientData?.transcriptions) return []

  const sets: TrialSet[] = Object.entries(patientData.transcriptions)
    .filter(([, txData]) => txData.trials)
    .map(([txId, txData]) => ({
      transcriptionId: txId,
      createdAt: txData.createdAt,
      trials: txData.trials as TrialsResponse
    }))

  // Sort by creation date (newest first)
  return sortBy(sets, 'createdAt').reverse()
}

/**
 * Get comprehensive status information for a patient
 */
export function getPatientStatus(patientData: PatientData | null | undefined): PatientStatus {
  if (!patientData) {
    return { 
      hasData: false, 
      hasTrials: false, 
      hasPreviousTrials: false, 
      trialSetCount: 0 
    }
  }

  const hasTranscriptionTrials = patientData.transcriptions ? 
    Object.values(patientData.transcriptions).some(tx => tx.trials) : false
  
  const trialSetCount = patientData.transcriptions ? 
    Object.values(patientData.transcriptions).filter(tx => tx.trials).length : 0
  
  return {
    hasData: !!(patientData.formattedTranscript || patientData.keyMoments?.length),
    hasTrials: hasTranscriptionTrials,
    hasPreviousTrials: hasTranscriptionTrials,
    trialSetCount,
    patient: patientData
  }
}

/**
 * Check if a patient has any transcription data
 */
export function hasPatientData(patientData: PatientData | null | undefined): boolean {
  return !!(patientData?.formattedTranscript || patientData?.keyMoments?.length || patientData?.transcriptions)
}

/**
 * Get the most recent transcription for a patient
 */
export function getLatestTranscription(patientData: PatientData | null | undefined): TranscriptionData | null {
  if (!patientData?.transcriptions) return null

  const transcriptions = Object.values(patientData.transcriptions)
  if (transcriptions.length === 0) return null

  return sortBy(transcriptions, 'createdAt').reverse()[0]
}

/**
 * Generate a display name for a patient
 */
export function getPatientDisplayName(patient: Patient | null | undefined): string {
  return patient?.name || 'Unknown Patient'
}

/**
 * Generate a display appointment time for a patient
 */
export function getPatientAppointmentDisplay(patient: Patient | null | undefined): string {
  return patient?.appointment || 'No appointment scheduled'
}
