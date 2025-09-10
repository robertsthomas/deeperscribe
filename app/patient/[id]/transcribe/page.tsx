'use client'

import React, { useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

import { TranscriptionSetup } from '@/components/transcriptions/TranscriptionSetup'
import { TranscriptArea } from '@/components/transcriptions/TranscriptArea'
import { TranscribePageHeader } from '@/components/shared/TranscribePageHeader'
import { PatientInfoPanel } from '@/components/patients/PatientInfoPanel'
import { KeyMoments } from '@/components/transcriptions/KeyMoments'

import { useTranscription } from '@/hooks/useTranscription'
import { useSettings } from '@/hooks/useSettings'
import { usePatientManager } from '@/hooks/usePatientManager'
import { useAutoScroll, useConfirmation, LoadingSpinner } from '@/lib/component-utils'
import { generateTestTranscript } from '@/lib/constants'

export default function TranscribePage() {
  const router = useRouter()
  const params = useParams()
  const patientId = Array.isArray(params?.id) ? params?.id[0] : (params?.id || null)
  const transcriptRef = useRef<HTMLDivElement | null>(null)

  // Hooks
  const { hasRequiredSetup, tempDoctorName, setDoctorName, setTempDoctorName } = useSettings()
  const { highlightText, setHighlightText } = useTranscription({ patientId: patientId || '' })

  // Hooks for common functionality
  const { scrollToElement } = useAutoScroll()
  const { confirm } = useConfirmation()

  // Auto-scroll to highlighted text
  React.useEffect(() => {
    if (highlightText.trim()) {
      scrollToElement('mark', transcriptRef)
    }
  }, [highlightText, scrollToElement])

  // Handle key moment click
  const handleKeyMomentClick = (searchText: string) => {
    setHighlightText(highlightText === searchText ? '' : searchText)
  }


  if (!hasRequiredSetup) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="h-12 border-b border-border px-4 flex items-center justify-between bg-background">
          <h1 className="font-semibold">DeeperScribe</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Patients
          </Button>
        </div>

        {/* Setup */}
        <div className="flex-1">
          <TranscriptionSetup
            tempDoctorName={tempDoctorName}
            setTempDoctorName={setTempDoctorName}
            onSetDoctorName={setDoctorName}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col lg:grid lg:grid-cols-[1fr_1px_500px] gap-0 min-h-0 overflow-hidden">
      {/* Transcript Area */}
      <div className="flex-1 lg:h-full overflow-y-auto min-h-0 p-4" ref={transcriptRef}>
        <TranscriptArea patientId={patientId} transcriptRef={transcriptRef} highlightTextExternal={highlightText} />
      </div>

      {/* Divider */}
      <div className="hidden lg:block bg-border" />

      {/* Settings Panel */}
      <div className="flex-1 lg:h-full overflow-y-auto min-h-0 p-4">
        <div className="space-y-6">
          <TranscribePageHeader
            onBack={() => router.push('/')}
            patientId={patientId}
          />

          <div>
            <h3 className="text-lg font-semibold mb-4">Transcription settings</h3>
            
            <PatientInfoPanel patientId={patientId} />
          </div>

          {/* Key Moments */}
          <KeyMoments
            patientId={patientId}
            onMomentClick={handleKeyMomentClick}
          />
        </div>
      </div>
    </div>
  )
}
