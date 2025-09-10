import { useState, useEffect, useCallback, useRef } from 'react'
import { useMutation, useIsMutating } from '@tanstack/react-query'
import useSpeechToText, { type ResultType } from 'react-hook-speech-to-text'
import { useAppStore } from '@/lib/store'
import { generateTranscriptionId } from '@/lib/constants'
import type { ExtractRequest, ExtractResponse, TrialsRequest, TrialsResponse } from '@/lib/schemas'

export type SpeakerVisibility = 'none' | 'first' | 'always'

interface TranscriptTurn {
  speaker: string
  text: string
  _showName: boolean
}

interface KeyMoment {
  desc: string
  time: string
  searchText: string
}

interface UseTranscriptionOptions {
  patientId: string
  onTranscriptReady?: (transcript: string) => void
  onAnalysisComplete?: (data: ExtractResponse) => void
  onTrialsReady?: (data: TrialsResponse) => void
}

export function useTranscription({ 
  patientId, 
  onTranscriptReady,
  onAnalysisComplete,
  onTrialsReady 
}: UseTranscriptionOptions) {
  // Store
  const getPatient = useAppStore(state => state.getPatient)
  const setPatientItem = useAppStore(state => state.setPatientItem)
  const setTranscriptionItem = useAppStore(state => state.setTranscriptionItem)
  // Subscribe to this patient's slice so other components see updates without refresh
  const patientSlice = useAppStore(state => state.patients[patientId])

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [capturedText, setCapturedText] = useState('')
  const [formattedTranscript, setFormattedTranscript] = useState('')
  const [transcriptionMethod, setTranscriptionMethod] = useState<'gemini' | 'browser' | 'none'>('none')
  const [currentTxId, setCurrentTxId] = useState<string | null>(null)
  const [needsProcessing, setNeedsProcessing] = useState(false)
  
  // Analysis state
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([])
  const [isGeneratingKeyMoments, setIsGeneratingKeyMoments] = useState(false)
  const [highlightText, setHighlightText] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Browser speech recognition fallback
  const {
    error: speechError,
    isRecording: browserIsRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    speechRecognitionProperties: {
      lang: 'en-US',
      interimResults: true,
    }
  })

  // API mutations
  const formatMutation = useMutation({
    mutationKey: ['format', patientId],
    mutationFn: async (transcript: string) => {
      const response = await fetch('/api/format-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      if (!response.ok) {
        let message = 'Failed to format transcript'
        let code: string | undefined
        try {
          const errBody = await response.json()
          message = errBody?.error || errBody?.message || message
          code = errBody?.code
        } catch {}
        const error: any = new Error(message)
        error.status = response.status
        if (code) error.code = code
        throw error
      }
      return response.json()
    },
    onSuccess: (data) => {
      const formatted = data.formatted || capturedText
      setFormattedTranscript(formatted)
      
      // Save to patient data for persistence
      setPatientItem(patientId, 'formattedTranscript', formatted)
      
      if (currentTxId) {
        setTranscriptionItem(patientId, currentTxId, 'formattedTranscript', formatted)
      }
      onTranscriptReady?.(formatted)
    }
  })

  const extractMutation = useMutation({
    mutationKey: ['extract', patientId],
    mutationFn: async (transcript: string): Promise<ExtractResponse> => {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      if (!response.ok) throw new Error('Failed to extract patient data')
      return response.json()
    },
    onSuccess: (data) => {
      setPatientItem(patientId, 'profile', data.patientProfile)
      setPatientItem(patientId, 'confidence', data.confidence)
      onAnalysisComplete?.(data)
    }
  })

  const keyMomentsMutation = useMutation({
    mutationKey: ['key-moments', patientId],
    mutationFn: async (transcript: string) => {
      const response = await fetch('/api/key-moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      if (!response.ok) throw new Error('Failed to generate key moments')
      return response.json()
    },
    onSuccess: (data) => {
      const moments = data.moments || []
      setKeyMoments(moments)
      setPatientItem(patientId, 'keyMoments', moments)
      if (currentTxId) {
        setTranscriptionItem(patientId, currentTxId, 'keyMoments', moments)
      }
    }
  })

  const trialsMutation = useMutation({
    mutationKey: ['trials', patientId],
    mutationFn: async (patientProfile: ExtractResponse['patientProfile']): Promise<TrialsResponse> => {
      const response = await fetch('/api/trials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientProfile, maxResults: 10 }),
      })
      if (!response.ok) throw new Error('Failed to fetch clinical trials')
      return response.json()
    },
    onSuccess: (data) => {
      // Save to a valid transcription id. If missing, create one.
      let txId = currentTxId
      if (!txId) {
        txId = generateTranscriptionId()
        setCurrentTxId(txId)
        setTranscriptionItem(patientId, txId, 'createdAt', new Date().toISOString())
      }
      setTranscriptionItem(patientId, txId, 'trials', data)
      sessionStorage.setItem('trialsData', JSON.stringify(data))
      onTrialsReady?.(data)
    }
  })

  // Global processing flags (visible across all hook instances)
  const formattingCount = useIsMutating({ mutationKey: ['format', patientId] })
  const extractingCount = useIsMutating({ mutationKey: ['extract', patientId] })
  const keyMomentsCount = useIsMutating({ mutationKey: ['key-moments', patientId] })
  const trialsCount = useIsMutating({ mutationKey: ['trials', patientId] })

  const isFormattingGlobal = formattingCount > 0
  const isExtractingGlobal = extractingCount > 0
  const isGeneratingKeyMomentsGlobal = isGeneratingKeyMoments || keyMomentsCount > 0
  const isBusyGlobal = isTranscribing || isFormattingGlobal || isExtractingGlobal || isGeneratingKeyMomentsGlobal || trialsCount > 0

  // Transcribe with Gemini
  const transcribeWithGemini = useCallback(async (audioBlob: Blob) => {
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1]
        
        setIsTranscribing(true)
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            audioBase64: base64,
            mimeType: 'audio/webm'
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          const transcript = data.transcript || ''
          setCapturedText(transcript)
          setNeedsProcessing(true) // Trigger processing
          // Save to patient data for persistence
          setPatientItem(patientId, 'transcript', transcript)
        }
        setIsTranscribing(false)
      }
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error('Gemini transcription failed:', error)
      setIsTranscribing(false)
    }
  }, [patientId, setPatientItem])

  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecording) return

    // Generate new transcription ID
    const txId = generateTranscriptionId()
    setCurrentTxId(txId)
    setTranscriptionItem(patientId, txId, 'createdAt', new Date().toISOString())

    try {
      // Try MediaRecorder + Gemini first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await transcribeWithGemini(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setTranscriptionMethod('gemini')
      
    } catch (error) {
      // Fallback to browser speech recognition
      try {
        startSpeechToText()
        setTranscriptionMethod('browser')
        setIsRecording(true)
      } catch (fallbackError) {
        console.error('Both recording methods failed:', error, fallbackError)
        setTranscriptionMethod('none')
      }
    }
  }, [isRecording, patientId, startSpeechToText, setTranscriptionItem, transcribeWithGemini])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecording) return

    if (transcriptionMethod === 'gemini' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    } else if (transcriptionMethod === 'browser') {
      stopSpeechToText()
      // Combine all browser results
      const combined = results.map(r => (r as ResultType).transcript).join(' ').trim()
      if (combined) {
        setCapturedText(combined)
        setNeedsProcessing(true) // Trigger processing
        // Save to patient data for persistence
        setPatientItem(patientId, 'transcript', combined)
      }
    }
    
    setIsRecording(false)
  }, [isRecording, transcriptionMethod, stopSpeechToText, results, patientId, setPatientItem])

  // (hydration handled via patientSlice sync below)

  // Sync local state with store changes for this patient (keeps multiple hook instances in sync)
  useEffect(() => {
    if (!patientId) return
    const patient = patientSlice
    if (!patient) return

    // Keep formatted transcript in sync
    if (typeof patient.formattedTranscript === 'string' && patient.formattedTranscript !== formattedTranscript) {
      setFormattedTranscript(patient.formattedTranscript)
    }

    // Keep raw transcript in sync
    if (typeof patient.transcript === 'string' && patient.transcript !== capturedText) {
      setCapturedText(patient.transcript)
    }

    // Keep key moments in sync
    if (Array.isArray(patient.keyMoments) && patient.keyMoments !== keyMoments) {
      setKeyMoments(patient.keyMoments as KeyMoment[])
    }

    // Infer method presence
    if ((patient.formattedTranscript || patient.transcript) && transcriptionMethod === 'none') {
      setTranscriptionMethod('browser')
    }

    // Ensure we have a current transcription id
    if (!currentTxId) {
      const transcriptions = (patient as any).transcriptions as Record<string, any> | undefined
      if (transcriptions && Object.keys(transcriptions).length > 0) {
        const latest = Object.entries(transcriptions)
          .map(([id, tx]) => ({ id, createdAt: new Date(tx?.createdAt || 0).getTime() }))
          .sort((a, b) => b.createdAt - a.createdAt)[0]
        if (latest) {
          setCurrentTxId(latest.id)
        }
      } else if (patient.formattedTranscript || patient.transcript) {
        // Create a transcription container for persisted content without an id
        const txId = generateTranscriptionId()
        setCurrentTxId(txId)
        setTranscriptionItem(patientId, txId, 'createdAt', new Date().toISOString())
      }
    }
  }, [patientId, patientSlice, formattedTranscript, capturedText, keyMoments, transcriptionMethod, currentTxId, setTranscriptionItem])

  // Process transcript only when needed (after recording or loading test)
  useEffect(() => {
    if (!needsProcessing || !capturedText.trim() || capturedText.length < 100) return

    const processTranscript = async () => {
      try {
        // Format transcript, but fall back to raw text if quota exceeded
        try {
          await formatMutation.mutateAsync(capturedText)
        } catch (err: any) {
          const isQuota = err?.status === 429 || err?.code === 'QUOTA_EXCEEDED'
          if (isQuota) {
            // Graceful fallback: use raw transcript as formatted
            setFormattedTranscript(capturedText)
            setPatientItem(patientId, 'formattedTranscript', capturedText)
          } else {
            throw err
          }
        }
        
        // Extract patient data
        const extractResult = await extractMutation.mutateAsync(capturedText)
        
        // Generate key moments
        setIsGeneratingKeyMoments(true)
        await keyMomentsMutation.mutateAsync(capturedText)
        
      } catch (error) {
        console.error('Failed to process transcript:', error)
      } finally {
        setIsGeneratingKeyMoments(false)
        setNeedsProcessing(false) // Reset flag after processing
      }
    }

    processTranscript()
  }, [needsProcessing, capturedText, patientId, setPatientItem, formatMutation.mutateAsync, extractMutation.mutateAsync, keyMomentsMutation.mutateAsync])

  // Parse transcript into turns
  const transcriptTurns = useCallback((transcript: string, doctorName: string, nameVisibility: SpeakerVisibility): TranscriptTurn[] => {
    const turns = transcript
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const match = line.match(/^([^:]+):\s*(.*)$/)
        if (match) {
          return { speaker: match[1], text: match[2] }
        }
        return { speaker: 'Narrator', text: line }
      })

    const seen = new Set<string>()
    
    const mapName = (name: string) => {
      const lower = name.toLowerCase()
      if (lower.includes('doctor') || lower.includes('dr.')) {
        return doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`
      }
      if (lower.includes('patient')) return 'Patient'
      return name
    }
    
    return turns.map(t => {
      const display = mapName(t.speaker)
      const show = nameVisibility === 'always' ? true : nameVisibility === 'first' ? !seen.has(display) : false
      seen.add(display)
      return { ...t, speaker: display, _showName: show }
    })
  }, [])

  // Clear all data and start fresh
  const reset = useCallback(() => {
    setCapturedText('')
    setFormattedTranscript('')
    setKeyMoments([])
    setHighlightText('')
    setCurrentTxId(null)
    setTranscriptionMethod('none')
    setNeedsProcessing(false)
    setResults([])
    
    // Clear persisted data
    setPatientItem(patientId, 'transcript', '')
    setPatientItem(patientId, 'formattedTranscript', '')
    setPatientItem(patientId, 'keyMoments', [])
  }, [setResults, patientId, setPatientItem])

  // Fetch clinical trials
  const fetchTrials = useCallback((patientProfile: ExtractResponse['patientProfile']) => {
    return trialsMutation.mutateAsync(patientProfile)
  }, [trialsMutation])

  // Load test transcript
  const loadTestTranscript = useCallback(async (testText: string) => {
    reset()
    
    // Set the captured text immediately so UI updates
    setCapturedText(testText)
    setPatientItem(patientId, 'transcript', testText)
    setNeedsProcessing(true) // Trigger processing
    
    const txId = generateTranscriptionId()
    setCurrentTxId(txId)
    setTranscriptionItem(patientId, txId, 'createdAt', new Date().toISOString())
  }, [patientId, reset, setTranscriptionItem, setPatientItem])

  return {
    // Recording
    isRecording,
    startRecording,
    stopRecording,
    transcriptionMethod,
    currentTxId,
    isSupported: typeof navigator !== 'undefined' && (!!navigator.mediaDevices?.getUserMedia || !speechError),
    
    // Content
    capturedText,
    formattedTranscript,
    keyMoments,
    highlightText,
    setHighlightText,
    
    // Processing
    transcriptTurns,
    isBusy: isBusyGlobal,
    isTranscribing,
    isFormatting: isFormattingGlobal,
    isExtracting: isExtractingGlobal,
    isGeneratingKeyMoments: isGeneratingKeyMomentsGlobal,
    
    // Actions
    reset,
    fetchTrials,
    loadTestTranscript,
    
    // Errors
    error: speechError || formatMutation.error?.message || extractMutation.error?.message || keyMomentsMutation.error?.message || trialsMutation.error?.message,
  }
}
