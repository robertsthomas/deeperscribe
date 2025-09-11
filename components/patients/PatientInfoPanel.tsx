import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FileText, ChevronDown, Clipboard } from 'lucide-react'
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
  const { formatDoctorName } = useSettings()
  const {
    isBusy,
    loadTestTranscript
  } = useTranscription({ patientId: patientId || '' })
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false)
  const [pasteContent, setPasteContent] = useState('')

  if (!patientId) return null

  const currentPatient = findPatient(patientId)
  const { hasTrials, hasPreviousTrials, trialSetCount } = getPatientStatus(patientId)

  // Handle test transcript loading
  const handleLoadTest = (condition: keyof typeof TEST_TRANSCRIPTS) => {
    const testText = generateTestTranscript(condition)
    loadTestTranscript(testText)
  }

  // Handle paste transcript loading
  const handlePasteTranscript = () => {
    if (pasteContent.trim()) {
      loadTestTranscript(pasteContent.trim())
      setPasteContent('')
      setPasteDialogOpen(false)
    }
  }

  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPasteContent(text)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPasteDialogOpen(true)}>
              <Clipboard className="h-4 w-4 mr-2" />
              Paste Custom Transcript
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Paste Dialog */}
        <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Paste Custom Transcript</DialogTitle>
              <DialogDescription>
                Paste your own transcript content to analyze. This will replace any existing transcript.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="paste-content" className="text-sm font-medium">
                    Transcript Content
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePasteFromClipboard}
                    className="text-xs"
                  >
                    <Clipboard className="h-3 w-3 mr-1" />
                    Paste from Clipboard
                  </Button>
                </div>
                <Textarea
                  id="paste-content"
                  placeholder="Paste your transcript here..."
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPasteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePasteTranscript}
                disabled={!pasteContent.trim()}
              >
                Load Transcript
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
