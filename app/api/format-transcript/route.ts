import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const TurnsSchema = z.object({
  turns: z.array(
    z.object({
      // Loosen speaker to reduce validation failures with cheaper models
      speaker: z.string().min(1),
      text: z.string(),
    })
  ),
})

const prompt = `You will receive a raw single-channel medical visit transcript without explicit speaker labels.
Rewrite it into clear, chronological conversational turns labeled as Doctor or Patient.

Rules:
- Do not fabricate medical facts.
- Infer the speaker only when obvious from context (e.g., greetings, questions vs. answers).
- Merge stutters/fillers ("um", repeated words) where they don't change meaning.
- Keep content faithful; lightly clean up grammar.
- Return ONLY JSON matching the schema: { "turns": [{ "speaker": "Doctor"|"Patient", "text": string }, ...] }.
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const transcript = body.transcript || ''

    // Use Gemini if no OpenAI key is available
    const useGemini = !process.env.OPENAI_API_KEY
    const model = useGemini ? google('gemini-2.5-pro') : openai('gpt-5-nano')

    const result = await generateObject({
      model,
      prompt: `${prompt}\n\nTranscript:\n${transcript}`,
      schema: TurnsSchema,
    })

    const formatted = result.object.turns.map(t => `${t.speaker}: ${t.text}`).join('\n')
    return NextResponse.json({ turns: result.object.turns, formatted })
  } catch (error) {
    console.error('Format transcript error:', error)
    return NextResponse.json({ error: 'Failed to format transcript' }, { status: 500 })
  }
}


