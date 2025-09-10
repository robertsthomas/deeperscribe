import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isEmpty, pick } from 'lodash-es'
import { TrialsRequestSchema, ClinicalTrialSchema } from '@/lib/schemas'
import type { PatientProfile, ClinicalTrial } from '@/lib/schemas'
import { simplifyDiagnosis } from '@/lib/constants'

const CLINICAL_TRIALS_API = 'https://clinicaltrials.gov/api/v2/studies'
const DEFAULT_PAGE_SIZE = 20
const MAX_RESULTS = 50

interface ClinicalTrialsApiResponse {
  studies: Array<{
    protocolSection: {
      identificationModule: {
        nctId: string
        briefTitle: string
        officialTitle?: string
      }
      statusModule: {
        overallStatus: string
        studyFirstSubmitDate?: string
      }
      designModule?: {
        studyType: string
        phases?: string[]
      }
      descriptionModule?: {
        briefSummary?: string
        detailedDescription?: string
      }
      conditionsModule?: {
        conditions?: string[]
      }
      armsInterventionsModule?: {
        interventions?: Array<{
          name: string
          type: string
        }>
      }
      eligibilityModule?: {
        eligibilityCriteria?: string
        minimumAge?: string
        maximumAge?: string
        sex?: string
      }
      contactsLocationsModule?: {
        locations?: Array<{
          facility?: string
          city?: string
          state?: string
          country?: string
          status?: string
        }>
        centralContacts?: Array<{
          name?: string
          phone?: string
          email?: string
        }>
      }
    }
  }>
  totalCount: number
}


function buildSearchQuery(patientProfile: PatientProfile, nctIds?: string[]): URLSearchParams {
  const params = new URLSearchParams()
  
  // Add condition/diagnosis search (v2 allows only ONE query.cond)
  const allConditions = Array.isArray(patientProfile.conditions) ? patientProfile.conditions : []
  const simplifiedDiagnosis = patientProfile.diagnosis ? simplifyDiagnosis(patientProfile.diagnosis) : undefined
  const primaryCond = simplifiedDiagnosis || allConditions[0]
  if (primaryCond) {
    params.set('query.cond', primaryCond)
  }

  // Add only essential free-text terms to avoid "too complicated query" error
  // Keep it simple: only add extra conditions beyond the primary one
  const remainingConds = primaryCond ? allConditions.filter(c => c !== primaryCond) : []
  if (remainingConds.length > 0) {
    // Use only the first remaining condition to keep query simple
    params.set('query.term', remainingConds[0])
  }

  // Add location filter
  const location = patientProfile.location
  if (location?.state) {
    params.append('query.locn', `${location.state}, United States`)
  } else if (location?.city) {
    params.append('query.locn', `${location.city}, United States`)
  }

  // Add age-based filters
  if (patientProfile.age && patientProfile.age >= 18) {
    params.append('filter.overallStatus', 'RECRUITING')
  }

  // Direct ID filtering (v2 supports filter.ids=NCTxxxx,NCTyyyy)
  if (nctIds && nctIds.length > 0) {
    params.append('filter.ids', nctIds.join(','))
  }

  // Set response format and pagination
  params.append('format', 'json')
  params.append('countTotal', 'true')
  // Use requested max page size when possible (bounded by DEFAULT_PAGE_SIZE)
  params.append('pageSize', DEFAULT_PAGE_SIZE.toString())

  return params
}

function transformTrial(study: any): ClinicalTrial {
  const protocol = study.protocolSection
  const identification = protocol.identificationModule
  const status = protocol.statusModule
  const design = protocol.designModule
  const description = protocol.descriptionModule
  const conditions = protocol.conditionsModule
  const interventions = protocol.armsInterventionsModule
  const eligibility = protocol.eligibilityModule
  const contactsLocations = protocol.contactsLocationsModule

  return {
    nctId: identification.nctId,
    title: identification.officialTitle || identification.briefTitle,
    status: status.overallStatus || 'Unknown',
    phase: design?.phases || [],
    studyType: design?.studyType || 'Unknown',
    briefSummary: description?.briefSummary || '',
    detailedDescription: description?.detailedDescription,
    conditions: conditions?.conditions || [],
    interventions: interventions?.interventions?.map((i: any) => i.name) || [],
    eligibilityCriteria: eligibility?.eligibilityCriteria,
    minimumAge: eligibility?.minimumAge,
    maximumAge: eligibility?.maximumAge,
    sex: eligibility?.sex,
    locations: contactsLocations?.locations?.map((loc: any) => ({
      facility: loc.facility || '',
      city: loc.city || '',
      state: loc.state || '',
      country: loc.country || '',
      status: loc.status || ''
    })) || [],
    contactInfo: contactsLocations?.centralContacts?.[0] ? {
      centralContact: {
        name: contactsLocations.centralContacts[0].name || '',
        phone: contactsLocations.centralContacts[0].phone,
        email: contactsLocations.centralContacts[0].email,
      }
    } : undefined,
    urls: {
      clinicalTrialsGov: `https://clinicaltrials.gov/ct2/show/${identification.nctId}`
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientProfile, maxResults = 10, nctIds } = TrialsRequestSchema.parse(body)

    const searchParams = buildSearchQuery(patientProfile, nctIds)
    const url = `${CLINICAL_TRIALS_API}?${searchParams.toString()}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DeeperScribe/1.0'
      }
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('ClinicalTrials.gov API failed', errText)
      return NextResponse.json({ error: 'ClinicalTrials.gov API error', details: errText }, { status: 502 })
    }

    const data: ClinicalTrialsApiResponse = await response.json()

    const transformedTrials = data.studies
      ?.slice(0, maxResults)
      .map(transformTrial)
      // Filter out any malformed or missing NCT IDs just in case
      .filter(trial => Boolean(trial.nctId && /^NCT\d{8}$/.test(trial.nctId)))
      .map(trial => ClinicalTrialSchema.parse(trial)) || []

    const searchCriteria = {
      conditions: [
        patientProfile.diagnosis,
        ...(patientProfile.conditions || [])
      ].filter(Boolean),
      location: patientProfile.location ? 
        `${patientProfile.location.city || ''}, ${patientProfile.location.state || ''}`.trim().replace(/^,\s*/, '') :
        undefined,
      ageRange: patientProfile.age ? `${patientProfile.age} years` : undefined,
      sex: patientProfile.sex,
    }

    return NextResponse.json({
      trials: transformedTrials,
      totalCount: data.totalCount || 0,
      searchCriteria,
    })

  } catch (error) {
    console.error('Error fetching clinical trials:', error)
    return NextResponse.json({ error: 'Failed to fetch clinical trials' }, { status: 500 })
  }
}
