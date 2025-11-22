import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { queryWithRAG } from "@/lib/gemini"

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

    const { message, subjectId, conversationHistory } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Build context from notes
    let context = ""
    let citations: string[] = []

    if (subjectId) {
      // Get notes from the selected subject
      const subject = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          userId: user.id,
        },
        include: {
          notes: {
            take: 10, // Limit to most recent 10 notes
            orderBy: { uploadedAt: "desc" },
          },
        },
      })

      if (subject && subject.notes.length > 0) {
        context = subject.notes
          .map((note) => {
            citations.push(note.displayName)
            // In a real implementation, you would:
            // 1. Fetch actual file content from storage
            // 2. Use Gemini File Search for semantic retrieval
            // For now, using metadata
            return `Document: ${note.displayName}\nType: ${note.fileType}\nUploaded: ${note.uploadedAt}`
          })
          .join("\n\n")
      }
    } else {
      // Get notes from all subjects
      const subjects = await prisma.subject.findMany({
        where: { userId: user.id },
        include: {
          notes: {
            take: 5,
            orderBy: { uploadedAt: "desc" },
          },
        },
      })

      context = subjects
        .flatMap((subject) =>
          subject.notes.map((note) => {
            citations.push(`${subject.displayName}: ${note.displayName}`)
            return `Subject: ${subject.displayName}\nDocument: ${note.displayName}\nType: ${note.fileType}`
          })
        )
        .join("\n\n")
    }

    // Add conversation history to context
    const conversationContext = conversationHistory
      ? conversationHistory
        .map((msg: any) => `${msg.role === "user" ? "Student" : "AI Teacher"}: ${msg.content}`)
        .join("\n")
      : ""

    // Build user profile for personalization
    const userProfile = {
      aiPersona: user.aiPersona,
      learningStyle: user.learningStyle,
      pace: user.pace,
      interests: user.interests,
      name: user.name,
    }

    // Generate response using RAG
    const fullContext = `
${conversationContext}

Available Notes/Documents:
${context || "No notes have been uploaded yet."}
    `.trim()

    const response = await queryWithRAG(message, fullContext, userProfile)

    return NextResponse.json({
      response,
      citations: context ? citations.slice(0, 5) : [], // Limit citations
    })
  } catch (error) {
    console.error("Error in AI chat:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}
