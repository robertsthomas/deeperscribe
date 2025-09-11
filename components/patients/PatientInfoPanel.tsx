import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { FileText, ChevronDown } from 'lucide-react'
import { useTranscription } from '@/hooks/useTranscription'
import { useSettings } from '@/hooks/useSettings'
import { usePatientManager } from '@/hooks/usePatientManager'
import { getPatientDisplayName } from '@/lib/patient-utils'
import { generateTestTranscript, TEST_TRANSCRIPTS } from '@/lib/constants'
 

interface PatientInfoPanelProps {
  patientId: string | null
}

export function PatientInfoPanel({ patientId }: PatientInfoPanelProps) {
  const router = useRouter()
  const { findPatient, getPatientStatus } = usePatientManager()
  const { doctorName, formatDoctorName } = useSettings()
  const {
    capturedText,
    formattedTranscript,
    isBusy,
    loadTestTranscript
  } = useTranscription({ patientId: patientId || '' })

  if (!patientId) return null

  const currentPatient = findPatient(patientId)
  const { hasTrials, hasPreviousTrials, trialSetCount, patient: patientData } = getPatientStatus(patientId)
  const currentTranscript = formattedTranscript || capturedText

  // Handle test transcript loading
  const handleLoadTest = (condition: keyof typeof TEST_TRANSCRIPTS) => {
    const testText = generateTestTranscript(condition)
    loadTestTranscript(testText)
  }


  // Navigate to results
  const handleViewResults = () => {
    router.push(`/patient/${patientId}/results`)
  }

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Patient: {getPatientDisplayName(currentPatient)}
        </p>
        <p className="text-sm text-muted-foreground">
          Provider: {formatDoctorName()}
        </p>
      </div>

      {/* Test Transcripts */}
      <div className="space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between" disabled={isBusy}>
              {isBusy ? 'Processing...' : 'Load Test Transcript'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {Object.entries(TEST_TRANSCRIPTS).map(([key, { title }]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => handleLoadTest(key as keyof typeof TEST_TRANSCRIPTS)}
              >
                {title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clinical Trials - Always Show */}
      <div className="space-y-4">
        <div className="border-t border-border pt-4">
          <Button
            onClick={handleViewResults}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
            disabled={!hasTrials}
          >
            <FileText className="w-4 h-4 mr-2" />
            {hasTrials 
              ? (hasPreviousTrials 
                  ? `View All Clinical Trials (${trialSetCount} set${trialSetCount > 1 ? 's' : ''})` 
                  : 'View Clinical Trial Results'
                )
              : 'View Clinical Trials'
            }
          </Button>
          {!hasTrials && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              No clinical trials generated yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
