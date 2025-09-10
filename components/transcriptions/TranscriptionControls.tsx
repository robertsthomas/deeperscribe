import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranscription } from '@/hooks/useTranscription'

export function TranscriptionControls({ patientId }: { patientId: string }) {
  const {
    isRecording,
    startRecording,
    stopRecording,
    isSupported,
    transcriptionMethod,
    error,
    isBusy
  } = useTranscription({ patientId })
  const getMethodDisplay = () => {
    switch (transcriptionMethod) {
      case 'gemini':
        return '🤖 AI Transcription (High Accuracy)'
      case 'browser':
        return '🌐 Browser Recognition (Fallback)'
      default:
        return ''
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!isSupported || isBusy}
        size="lg"
        className={cn(
          "w-16 h-16 rounded-full transition-all duration-200",
          isRecording 
            ? "bg-red-600 hover:bg-red-700 recording-glow" 
            : "bg-primary hover:bg-primary/90"
        )}
      >
        {isRecording ? (
          <Square className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Status indicators */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">
          {isRecording ? 'Recording...' : 'Click to start recording'}
        </p>
        
        {/* {transcriptionMethod !== 'none' && (
          <p className="text-xs text-muted-foreground">
            {getMethodDisplay()}
          </p>
        )} */}
        
        {error && (
          <p className="text-xs text-red-500">
            {error}
          </p>
        )}
        
        {!isSupported && (
          <p className="text-xs text-red-500">
            Speech recognition not supported in this browser
          </p>
        )}
      </div>
    </div>
  )
}
