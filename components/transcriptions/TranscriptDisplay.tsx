import { cn, highlightText } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { useTranscription } from '@/hooks/useTranscription'
import { useSettings } from '@/hooks/useSettings'
import { useParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface TranscriptTurn {
  speaker: string
  text: string
  _showName: boolean
}

interface TranscriptDisplayProps { className?: string; highlight?: string }

function formatSpeakerName(speaker: string): string {
  return speaker.replace('Dr. ', '').toUpperCase()
}

function TranscriptTurn({ turn, highlight }: { turn: TranscriptTurn; highlight: string }) {
  return (
    <div className="leading-relaxed">
      <div className="text-foreground">
        <span className="font-semibold uppercase text-sm">
          {formatSpeakerName(turn.speaker)}:
        </span>{' '}
        {highlightText(turn.text, highlight)}
      </div>
    </div>
  )
}

export function TranscriptDisplay({ className, highlight }: TranscriptDisplayProps) {
  // Pull data directly from hooks to avoid prop drilling
  const params = useParams()
  const patientId = Array.isArray((params as any)?.id) ? (params as any).id[0] : ((params as any)?.id || '')
  const { 
    capturedText, 
    formattedTranscript, 
    highlightText: hookHighlight, 
    transcriptTurns,
    isTranscribing,
    isFormatting,
    isExtracting,
    isGeneratingKeyMoments
  } = useTranscription({ patientId })
  const { doctorName, nameVisibility } = useSettings()
  const transcript = formattedTranscript || capturedText || ''
  const turns = transcriptTurns(transcript, doctorName, nameVisibility)
  const effectiveHighlight = (highlight ?? hookHighlight) || ''
  // Check if we have formatted speaker turns
  const hasFormattedSpeakers = turns.length > 1 && turns.some(t => t.speaker !== 'Narrator')

  if (!transcript.trim()) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <EmptyState title="No transcript available" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-3 leading-relaxed", className)}>
      {turns.map((turn, idx) => (
        <TranscriptTurn 
          key={`${turn.speaker}-${idx}-${turn.text.slice(0, 12)}`}
          turn={turn}
          highlight={effectiveHighlight}
        />
      ))}

      {/* Processing message moved to TranscriptArea overlay */}
    </div>
  )
}