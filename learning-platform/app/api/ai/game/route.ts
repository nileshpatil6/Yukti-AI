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

    // Generate game HTML using AI with File Search
    const htmlContent = await generateGameWithFileSearch(
      topic,
      gameType,
      subject.fileSearchStoreId
    )

    // Create or find topic
    let topicRecord = await prisma.topic.findFirst({
      where: {
        subjectId: subject.id,
        name: topic,
      },
    })

    if (!topicRecord) {
      const topicCount = await prisma.topic.count({
        where: { subjectId: subject.id },
      })

      topicRecord = await prisma.topic.create({
        data: {
          subjectId: subject.id,
          name: topic,
          order: topicCount + 1,
        },
      })
    }

    // Save game to database
    const game = await prisma.game.create({
      data: {
        topicId: topicRecord.id,
        title: `${topic} - ${gameType}`,
        description: `Interactive ${gameType} game for ${topic}`,
        type: gameType,
        htmlContent,
      },
    })

    return NextResponse.json({
      game: {
        id: game.id,
        topicId: game.topicId,
        type: game.type,
        title: game.title,
      },
      message: "Game generated successfully",
    })
  } catch (error: any) {
    console.error("Error generating game:", error)

    // Provide more specific error messages
    let errorMessage = "Failed to generate game"

    if (error.message?.includes("fetch failed")) {
      errorMessage = "Network error: Unable to connect to Gemini API. Please check your internet connection or try again later."
    } else if (error.message?.includes("API key")) {
      errorMessage = "Invalid or missing Gemini API key. Please check your configuration."
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please try again later."
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    )
  }
}
