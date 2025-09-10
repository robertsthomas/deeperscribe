import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { experimental_transcribe as transcribe } from 'ai'
import { openai } from '@ai-sdk/openai'

// Transcribe audio via OpenAI gpt-4o-mini-transcribe using the AI SDK
// Expects: { audioBase64: string, mimeType?: string }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audioBase64 } = body

    // Decode base64 to a Buffer supported by AI SDK transcribe()
    const audioBuffer = Buffer.from(audioBase64, 'base64')

    const result = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: audioBuffer,
    })

    return NextResponse.json({
      transcript: result.text || '',
      language: result.language,
      durationInSeconds: result.durationInSeconds,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}


