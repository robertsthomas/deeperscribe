"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { getPatientTrialSets, type TrialSet } from '@/lib/patient-utils'
import { formatDate } from '@/lib/utils'
import { useLoadingState } from '@/lib/component-utils'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export default function PatientResultsPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)

  const { data: trialSets, isLoading, setData, setLoading } = useLoadingState<TrialSet[]>([])

  React.useEffect(() => {
    if (!patientId) return

    setLoading(true)
    if (typeof window !== 'undefined') {
      const getPatient = useAppStore.getState().getPatient
      const patient = getPatient(patientId)
      const sets = getPatientTrialSets(patient)
      setData(sets)
    } else {
      setLoading(false)
    }
  }, [patientId, setData, setLoading])

  if (!patientId) {
    return (
      <EmptyState 
        title="Missing patient ID"
        action={<Button variant="outline" onClick={() => router.push('/')}>Back</Button>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clinical trial results</h1>
        <Button variant="ghost" onClick={() => router.push(`/patient/${patientId}/transcribe`)}>
          Back to transcription
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : trialSets?.length === 0 ? (
        <EmptyState 
          title="No results"
          description="We didn't find any stored trials for this patient yet."
        />
      ) : (
        <TrialSetsList trialSets={trialSets || []} />
      )}
    </div>
  )
}

function TrialSetsList({ trialSets }: { trialSets: TrialSet[] }) {
  return (
    <div className="space-y-6">
      {trialSets.map((trialSet, setIdx) => (
        <TrialSetSection 
          key={trialSet.transcriptionId} 
          trialSet={trialSet} 
          index={setIdx + 1} 
        />
      ))}
    </div>
  )
}

function TrialSetSection({ trialSet, index }: { trialSet: TrialSet; index: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Transcription {index}</h2>
        <span className="text-sm text-muted-foreground">
          {formatDate(trialSet.createdAt, 'PPP')}
        </span>
      </div>
      
      <div className="space-y-4">
        {trialSet.trials.trials.map((trial, idx) => (
          <TrialCard 
            key={`${trial.nctId}-${index}-${idx}`} 
            trial={trial} 
          />
        ))}
      </div>
    </div>
  )
}

function TrialCard({ trial }: { trial: any }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
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
              {trial.locations.slice(0, 5).map((loc: any, lidx: number) => (
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
  )
}


