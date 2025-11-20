import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { speechToText } from "@/lib/deepgram"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { audio } = await req.json()

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 })
    }

    // Convert base64 to buffer
    const base64Data = audio.split(",")[1] || audio
    const audioBuffer = Buffer.from(base64Data, "base64")

    // Transcribe using DeepGram
    const { text, error } = await speechToText(audioBuffer)

    if (error) {
      throw error
    }

    return NextResponse.json({
      text,
      success: true,
    })
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    )
  }
}
