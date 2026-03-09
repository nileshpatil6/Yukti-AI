import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { queryWithRAG } from "@/lib/gemini"
import { textToSpeech } from "@/lib/deepgram"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { message, subjectId, voice } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    // Build context from notes (if subject selected)
    let context = ""
    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
          notes: {
            orderBy: { uploadedAt: "desc" },
            take: 5,
          },
        },
      })

      if (subject) {
        context = subject.notes
          .map(
            (note: any) =>
              `File: ${note.displayName}\nContent: [Note content placeholder]`
          )
          .join("\n\n")
      }
    }

    // Get user profile for personalization
    const userProfile = {
      learningStyle: user.learningStyle,
      pace: user.pace,
      interests: user.interests,
      aiPersona: user.aiPersona,
    }

    // Get AI response
    const responseText = await queryWithRAG(message, context, userProfile)

    // Generate audio using DeepGram TTS
    const { audio, error } = await textToSpeech(responseText, {
      voice: voice || "aura-asteria-en",
    })

    if (error || !audio) {
      // Return text response even if audio fails
      return NextResponse.json({
        text: responseText,
        audioUrl: null,
        success: true,
      })
    }

    // Convert audio buffer to base64 data URL
    const audioBase64 = audio.toString("base64")
    const audioUrl = `data:audio/wav;base64,${audioBase64}`

    return NextResponse.json({
      text: responseText,
      audioUrl,
      success: true,
    })
  } catch (error) {
    console.error("Error generating voice response:", error)
    return NextResponse.json(
      { error: "Failed to generate voice response" },
      { status: 500 }
    )
  }
}
