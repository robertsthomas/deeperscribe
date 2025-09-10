"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type TrialsResponse } from '@/lib/schemas'
import { useAppStore } from '@/lib/store'

export default function TranscriptionResultsPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)
  const tid = Array.isArray(params?.tid) ? params?.tid[0] : (params?.tid as string | undefined)

  const [data, setData] = React.useState<TrialsResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setIsLoading(true)
    if (typeof window !== 'undefined' && patientId && tid) {
      const getTranscription = useAppStore.getState().getTranscription
      const stored = getTranscription(patientId, tid)?.trials as TrialsResponse
      setData(stored || null)
    }
    setIsLoading(false)
  }, [patientId, tid])

  if (!patientId || !tid) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Missing patient/transcription id.</p>
        <Button variant="outline" onClick={() => router.push('/')}>Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transcription results</h1>
        <Button variant="ghost" onClick={() => router.push(`/patient/${patientId}/transcribe`)}>
          Back to transcription
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : !data ? (
        <Card>
          <CardHeader>
            <CardTitle>No results</CardTitle>
            <CardDescription>
              We didn&apos;t find any stored trials for this transcription.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.trials.map((trial, idx) => (
            <Card key={`${trial.nctId}-${idx}`} className="hover:shadow-sm transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{trial.title}</CardTitle>
                <CardDescription>
                  <span className="mr-2">{trial.studyType}</span>
                  <span className="mr-2">Status: {trial.status}</span>
                  {trial.phase?.length ? (
                    <span>Phase: {trial.phase.join(', ')}</span>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-foreground leading-relaxed">{trial.briefSummary}</p>

                {trial.locations?.length ? (
                  <div>
                    <p className="font-medium mb-1">Locations</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {trial.locations.slice(0, 5).map((loc, lidx) => (
                        <li key={`${trial.nctId}-loc-${lidx}`}>
                          {loc.facility} — {loc.city}{loc.state ? `, ${loc.state}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="pt-2">
                  <Button asChild size="sm">
                    <a href={trial.urls.clinicalTrialsGov} target="_blank" rel="noreferrer">
                      View on ClinicalTrials.gov
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


