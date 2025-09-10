import { z } from 'zod'

// Patient profile extracted from transcript
export const PatientProfileSchema = z.object({
  age: z.number().min(0).max(120).nullable().optional(),
  sex: z.enum(['male', 'female', 'other']).nullable().optional(),
  diagnosis: z.string().nullable().optional(),
  conditions: z.array(z.string()).default([]),
  symptoms: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  location: z.object({
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().default('United States'),
  }).optional(),
})

// API request/response schemas
export const ExtractRequestSchema = z.object({
  transcript: z.string().min(10, 'Transcript must be at least 10 characters'),
})

export const ExtractResponseSchema = z.object({
  patientProfile: PatientProfileSchema,
  confidence: z.number().min(0).max(1),
})

export const TrialsRequestSchema = z.object({
  patientProfile: PatientProfileSchema,
  maxResults: z.number().min(1).max(50).default(10),
})

// Clinical trial schemas
export const ClinicalTrialSchema = z.object({
  nctId: z.string(),
  title: z.string(),
  status: z.string(),
  phase: z.array(z.string()).default([]),
  studyType: z.string(),
  briefSummary: z.string(),
  detailedDescription: z.string().optional(),
  conditions: z.array(z.string()).default([]),
  interventions: z.array(z.string()).default([]),
  eligibilityCriteria: z.string().optional(),
  minimumAge: z.string().optional(),
  maximumAge: z.string().optional(),
  sex: z.string().optional(),
  locations: z.array(z.object({
    facility: z.string(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    status: z.string().optional(),
  })).default([]),
  contactInfo: z.object({
    centralContact: z.object({
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
    }).optional(),
  }).optional(),
  urls: z.object({
    clinicalTrialsGov: z.string(),
  }),
})

export const TrialsResponseSchema = z.object({
  trials: z.array(ClinicalTrialSchema),
  totalCount: z.number(),
  searchCriteria: z.object({
    conditions: z.array(z.string()),
    location: z.string().optional(),
    ageRange: z.string().optional(),
    sex: z.string().optional(),
  }),
})

// Type exports
export type PatientProfile = z.infer<typeof PatientProfileSchema>
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>
export type TrialsRequest = z.infer<typeof TrialsRequestSchema>
export type TrialsResponse = z.infer<typeof TrialsResponseSchema>
export type ClinicalTrial = z.infer<typeof ClinicalTrialSchema>
