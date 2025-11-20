import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateGameWithFileSearch } from "@/lib/gemini"

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

    const { subjectId, topic, gameType } = await req.json()

    if (!subjectId || !topic || !gameType) {
      return NextResponse.json(
        { error: "Subject ID, topic, and game type are required" },
        { status: 400 }
      )
    }

    // Fetch subject with notes
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        notes: {
          orderBy: { uploadedAt: "desc" },
          take: 10,
        },
      },
    })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Verify ownership
    if (subject.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Build context from notes
    const context = subject.notes
      .map((note) => `File: ${note.displayName}\nContent: [Note content placeholder]`)
      .join("\n\n")

    // Generate game HTML using AI
    const htmlContent = await generateGame(topic, gameType, context)

    // Create or find topic
    let topicRecord = await prisma.topic.findFirst({
      where: {
        subjectId: subject.id,
        title: topic,
      },
    })

    if (!topicRecord) {
      topicRecord = await prisma.topic.create({
        data: {
          subjectId: subject.id,
          title: topic,
        },
      })
    }

    // Save game to database
    const game = await prisma.game.create({
      data: {
        topicId: topicRecord.id,
        gameType,
        htmlContent,
      },
    })

    return NextResponse.json({
      game: {
        id: game.id,
        topicId: game.topicId,
        gameType: game.gameType,
      },
      message: "Game generated successfully",
    })
  } catch (error) {
    console.error("Error generating game:", error)
    return NextResponse.json(
      { error: "Failed to generate game" },
      { status: 500 }
    )
  }
}
