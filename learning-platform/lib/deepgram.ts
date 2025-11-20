import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk"

const deepgramApiKey = process.env.DEEPGRAM_API_KEY || ''

if (!deepgramApiKey) {
  console.warn('DeepGram API key not configured. Voice features will not work.')
}

export const deepgram = createClient(deepgramApiKey)

// Text-to-Speech (TTS)
export async function textToSpeech(
  text: string,
  options: {
    model?: string
    voice?: string
  } = {}
): Promise<{ audio: Buffer | null; error: Error | null }> {
  try {
    const response = await deepgram.speak.request(
      { text },
      {
        model: options.model || 'aura-asteria-en',
        encoding: 'linear16',
        container: 'wav',
      }
    )

    const stream = await response.getStream()
    if (!stream) {
      throw new Error('Failed to get audio stream')
    }

    const chunks: Uint8Array[] = []
    const reader = stream.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return {
      audio: Buffer.from(result),
      error: null,
    }
  } catch (error) {
    console.error('Error in text-to-speech:', error)
    return {
      audio: null,
      error: error as Error,
    }
  }
}

// Speech-to-Text (STT) - Prerecorded audio
export async function speechToText(
  audioBuffer: Buffer,
  options: {
    model?: string
    language?: string
  } = {}
): Promise<{ text: string; error: Error | null }> {
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: options.model || 'nova-2',
        language: options.language || 'en-US',
        smart_format: true,
        punctuate: true,
      }
    )

    if (error) {
      throw error
    }

    const transcript =
      result.results?.channels[0]?.alternatives[0]?.transcript || ''

    return {
      text: transcript,
      error: null,
    }
  } catch (error) {
    console.error('Error in speech-to-text:', error)
    return {
      text: '',
      error: error as Error,
    }
  }
}

// Get WebSocket connection for live streaming (used in browser)
export function getLiveTranscriptionConnection() {
  if (!deepgramApiKey) {
    throw new Error('DeepGram API key not configured')
  }

  return deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
    punctuate: true,
    interim_results: true,
  })
}

// Available TTS voices
export const TTS_VOICES = [
  { id: 'aura-asteria-en', name: 'Asteria (Female, Friendly)', language: 'English' },
  { id: 'aura-luna-en', name: 'Luna (Female, Professional)', language: 'English' },
  { id: 'aura-stella-en', name: 'Stella (Female, Warm)', language: 'English' },
  { id: 'aura-athena-en', name: 'Athena (Female, Clear)', language: 'English' },
  { id: 'aura-hera-en', name: 'Hera (Female, Articulate)', language: 'English' },
  { id: 'aura-orion-en', name: 'Orion (Male, Deep)', language: 'English' },
  { id: 'aura-arcas-en', name: 'Arcas (Male, Friendly)', language: 'English' },
  { id: 'aura-perseus-en', name: 'Perseus (Male, Professional)', language: 'English' },
  { id: 'aura-angus-en', name: 'Angus (Male, Warm)', language: 'English' },
  { id: 'aura-orpheus-en', name: 'Orpheus (Male, Clear)', language: 'English' },
]
