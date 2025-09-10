import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { ExtractRequestSchema, PatientProfileSchema } from '@/lib/schemas'

const extractionPrompt = `You are a medical AI assistant that extracts structured patient information from doctor-patient conversation transcripts.

Extract the following information from the transcript:
- Patient's age (if mentioned)
- Patient's sex/gender (if mentioned)
- Primary diagnosis or suspected condition
- Additional medical conditions or comorbidities
- Symptoms mentioned during the conversation
- Current medications (if discussed)
- Known allergies (if mentioned)
- Patient location (city, state) if mentioned

Rules:
1. Only extract information that is explicitly mentioned in the transcript
2. Use medical terminology when appropriate
3. For diagnosis, focus on the primary concern or suspected condition
4. If age is mentioned as a range (e.g., "in her 60s"), use the middle value (e.g., 65)
5. For location, try to infer from context clues if not explicitly stated
6. Be conservative - if unsure, omit the field rather than guess

Return the structured data according to the provided schema.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript } = ExtractRequestSchema.parse(body)

    const result = await generateObject({
      model: openai('gpt-5-nano'),
      prompt: `${extractionPrompt}\n\nTranscript:\n${transcript}`,
      schema: PatientProfileSchema,
    })

    // Calculate a simple confidence score based on how many fields were extracted
    const extractedFields = Object.values(result.object).filter(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== '')
      }
      return value !== undefined && value !== ''
    })
    
    const totalPossibleFields = 7 // age, sex, diagnosis, conditions, symptoms, medications, allergies, location
    const confidence = Math.min(extractedFields.length / totalPossibleFields, 1)
    
    return NextResponse.json({
      patientProfile: result.object,
      confidence: parseFloat(confidence.toFixed(2)),
    })
  } catch (error) {
    console.error('Error extracting patient data:', error)
    return NextResponse.json({ error: 'Failed to extract patient data' }, { status: 500 })
  }
}
