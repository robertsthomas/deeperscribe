import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TranscriptionControls } from '@/components/transcriptions/TranscriptionControls'
import { TranscriptDisplay } from '@/components/transcriptions/TranscriptDisplay'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useTranscription } from '@/hooks/useTranscription'
import { useSettings } from '@/hooks/useSettings'
import { usePatientManager } from '@/hooks/usePatientManager'
import { useAppStore } from '@/lib/store'
import { cn, isValidTranscript } from '@/lib/utils'
import { Search } from 'lucide-react'

interface TranscriptAreaProps {
  patientId: string | null
  transcriptRef: React.RefObject<HTMLDivElement>
  highlightTextExternal?: string
}

function TranscriptTooShortWarning({ transcript }: { transcript: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6 text-center">
          <p className="text-yellow-800 mb-4">
            Recording too short (&ldquo;{transcript?.trim() || ''}&rdquo;)
          </p>
          <p className="text-sm text-yellow-600">
            Please record at least 100 characters for analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TranscriptBottomArea({ patientId }: { patientId: string | null }) {
  const { getPatientStatus } = usePatientManager()
  const getPatient = useAppStore(state => state.getPatient)
  const {
    isBusy,
    isGeneratingKeyMoments,
    fetchTrials,
    capturedText,
    formattedTranscript,
    currentTxId
  } = useTranscription({ patientId: patientId || '' })
  
  if (!patientId) return null
  
  const { hasTrials, patient: patientData } = getPatientStatus(patientId)
  const patient = patientId ? getPatient(patientId) : undefined
  const alreadyHasTrials = Boolean(currentTxId && patient?.transcriptions?.[currentTxId]?.trials)

  return (
    <Button
      onClick={() => {
        console.log('Creating clinical trials for profile:', patientData?.profile)
        if (patientData?.profile) fetchTrials(patientData.profile)
      }}
      disabled={isBusy || alreadyHasTrials || !patientData?.profile}
      className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white"
      size="lg"
    >
      {/* <Search className="w-4 h-4 mr-2" /> */}
      {alreadyHasTrials ? 'Trials already created' : (isBusy ? 'Creating clinical trial' : 'Create Clinical Trial')}
    </Button>
  )
}

export function TranscriptArea({ patientId, transcriptRef, highlightTextExternal }: TranscriptAreaProps) {
  // Use hooks directly in component
  const { doctorName, nameVisibility } = useSettings()
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcriptionMethod,
    isSupported,
    capturedText,
    formattedTranscript,
    highlightText,
    transcriptTurns,
    isTranscribing,
    isFormatting,
    isExtracting,
    isGeneratingKeyMoments,
    currentTxId,
    fetchTrials,
    error
  } = useTranscription({ patientId: patientId || '' })

  // Compute fixed bottom bar width/left to match transcript pane
  const [barLeft, setBarLeft] = React.useState(0)
  const [barWidth, setBarWidth] = React.useState(0)

  React.useEffect(() => {
    const update = () => {
      if (transcriptRef?.current) {
        const rect = transcriptRef.current.getBoundingClientRect()
        setBarLeft(rect.left)
        setBarWidth(rect.width)
      }
    }
    update()
    window.addEventListener('resize', update)
    // capture scroll events from nested scroll containers
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [transcriptRef])

  if (!patientId) return null

  const currentTranscript = formattedTranscript || capturedText
  const displayTurns = transcriptTurns(currentTranscript, doctorName, nameVisibility)
  const activeHighlight = highlightTextExternal ?? highlightText

  

  

  // No transcript - show recording controls
  if (!currentTranscript.trim()) {
    return (
      <div className="h-full flex items-center justify-center">
        <TranscriptionControls patientId={patientId} />
      </div>
    )
  }

  // Transcript too short - show warning
  if (!isValidTranscript(currentTranscript)) {
    return <TranscriptTooShortWarning transcript={currentTranscript} />
  }

  // Valid transcript - show content with processing overlay and bottom area
  return (
    <div className="h-full relative">
      {/* Transcript content with reserved space for fixed bottom bar */
      }
      <div
        className={cn(
          "h-full overflow-y-auto transition-opacity pb-0",
          (isTranscribing || isFormatting || isExtracting || isGeneratingKeyMoments) && "opacity-50 blur-[1px]"
        )}
        aria-busy={isTranscribing || isFormatting || isExtracting || isGeneratingKeyMoments}
        aria-disabled={isTranscribing || isFormatting || isExtracting || isGeneratingKeyMoments}
      >
        <TranscriptDisplay highlight={activeHighlight} />
        {/* Spacer to prevent scroll content from going behind the fixed bottom bar */}
        <div className="h-20" aria-hidden="true" />
      </div>

      {/* Fixed bottom bar aligned to transcript pane width */}
      <div
        className="fixed bottom-0 z-20 h-20 flex items-center justify-center border-t border-border/50 bg-background/95 backdrop-blur-sm"
        style={{ left: barLeft, width: barWidth }}
      >
        <TranscriptBottomArea patientId={patientId} />
      </div>

      {(isTranscribing || isFormatting || isExtracting || isGeneratingKeyMoments) && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded-full shadow-sm border border-border">
            <LoadingSpinner size="sm" />
            <span>
              {isTranscribing
                ? 'Transcribing…'
                : isFormatting
                ? 'Formatting transcript…'
                : isExtracting
                ? 'Extracting…'
                : 'Generating key moments…'}
            </span>
          </div>
        </div>
      )}

    </div>
  )
}
