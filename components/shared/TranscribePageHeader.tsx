import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useTranscription } from '@/hooks/useTranscription'
import { useConfirmation } from '@/lib/component-utils'

interface TranscribePageHeaderProps {
  onBack: () => void
  patientId: string | null
}

export function TranscribePageHeader({ onBack, patientId }: TranscribePageHeaderProps) {
  const { confirm } = useConfirmation()
  const { 
    capturedText, 
    formattedTranscript, 
    keyMoments, 
    isRecording, 
    isBusy, 
    reset 
  } = useTranscription({ patientId: patientId || '' })

  if (!patientId) return null

  const currentTranscript = formattedTranscript || capturedText
  const showReTranscribe = !!(currentTranscript || keyMoments.length > 0)
  const disabled = isBusy || isRecording

  // Handle re-transcribe with confirmation
  const handleReTranscribe = () => {
    if (confirm('Are you sure you want to re-transcribe? This will clear the current session.')) {
      reset()
    }
  }
  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="outline" size="sm" onClick={onBack} className="w-full lg:w-auto">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Patients
      </Button>

      {showReTranscribe && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReTranscribe}
          disabled={disabled}
          className="hidden lg:flex"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Re-transcribe
        </Button>
      )}
    </div>
  )
}
