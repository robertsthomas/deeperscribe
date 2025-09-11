import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const RequestSchema = z.object({
  transcript: z.string().min(10),
  // Optional total audio duration in seconds; helps approximate MM:SS when model omits time
  durationSec: z.number().positive().optional(),
})

const KeyMomentSchema = z.object({
  desc: z.string(),
  quote: z.string().optional(),
  time: z.string().optional(), // Optional human-readable time like "00:32"
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, durationSec } = RequestSchema.parse(body)

    const prompt = `You are a clinical scribe assistant. Analyze the following doctor-patient conversation transcript and extract 5-10 concise key moments most relevant to clinical assessment and planning.

You must return a JSON object with a "moments" array containing the key moments.

Rules:
- Return JSON only; no prose.
- The response must be in this exact format: {"moments": [...]}
- Each moment in the array must include:
  - desc: short description of the key moment (sentence fragment is fine)
  - quote: a short exact excerpt from the transcript that best matches the moment (optional but preferred)
  - time: if possible, an approximate timestamp like MM:SS; if unavailable, omit it
- Do not fabricate times if you cannot infer them from context.
- Focus on clinically relevant moments like symptoms, diagnoses, treatments, patient concerns, etc.

Transcript:\n${transcript}`

    // Use Gemini if no OpenAI key is available
    const useGemini = !process.env.OPENAI_API_KEY
    const model = useGemini ? google('gemini-2.5-pro') : openai('gpt-5-nano')

    const { object } = await generateObject({
      model,
      schema: z.object({ moments: z.array(KeyMomentSchema) }),
      prompt,
    })

    // Handle case where AI returns a single moment instead of array
    let momentsArray = object?.moments ?? []
    if (!Array.isArray(momentsArray)) {
      // If the AI returned a single object, wrap it in an array
      momentsArray = [momentsArray]
    }

    let moments = momentsArray.map((m) => ({
      desc: m.desc,
      time: m.time as string | undefined,
      quote: m.quote as string | undefined,
    }))

    // If model omitted time, approximate based on quote position vs transcript length and provided duration
    if (durationSec && Number.isFinite(durationSec) && durationSec > 0) {
      const totalChars = transcript.length
      moments = moments.map((m) => {
        if (m.time || !m.quote) return m
        const idx = transcript.toLowerCase().indexOf(m.quote.toLowerCase())
        if (idx >= 0 && totalChars > 0) {
          const ratio = Math.min(0.999, Math.max(0, idx / totalChars))
          const seconds = Math.floor(ratio * durationSec)
          const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
          const ss = String(seconds % 60).padStart(2, '0')
          return { ...m, time: `${mm}:${ss}` }
        }
        return m
      })
    }

    const resp = moments.map((m) => ({
      desc: m.desc,
      time: m.time,
      searchText: (m.quote ?? m.desc).toLowerCase(),
    }))

    return NextResponse.json({ moments: resp })
  } catch (error) {
    console.error('Error generating key moments:', error)
    
    // If it's a schema validation error, try to provide a fallback response
    if (error instanceof Error && error.message.includes('schema')) {
      console.log('Schema validation failed, providing fallback key moments')
      return NextResponse.json({ 
        moments: [
          {
            desc: "Transcript analysis in progress",
            time: undefined,
            searchText: "analysis"
          }
        ]
      })
    }
    
    return NextResponse.json({ error: 'Failed to generate key moments' }, { status: 500 })
  }
}


