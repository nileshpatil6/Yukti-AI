import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateQuizWithFileSearch } from "@/lib/gemini"

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

    const { subjectId, topic, topicName, difficulty = "medium" } = await req.json()
    
    const topicTitle = topic || topicName

    if (!subjectId || !topicTitle) {
      return NextResponse.json(
        { error: "Subject ID and topic are required" },
        { status: 400 }
      )
    }

    // Verify subject belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id,
      },
      include: {
        notes: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    if (!subject.fileSearchStoreId) {
      return NextResponse.json(
        { error: "No File Search store found. Please upload PDF notes first." },
        { status: 400 }
      )
    }

    if (subject.notes.length === 0) {
      return NextResponse.json(
        { error: "No notes found. Please upload notes first." },
        { status: 400 }
      )
    }

    // Generate quiz using Gemini File Search
    const quizQuestions = await generateQuizWithFileSearch(
      topicTitle,
      difficulty,
      subject.fileSearchStoreId
    )

    // Find or create topic
    let topicRecord = await prisma.topic.findFirst({
      where: {
        subjectId: subject.id,
        name: topicTitle,
      },
    })

    if (!topicRecord) {
      const topicsCount = await prisma.topic.count({
        where: { subjectId: subject.id },
      })

      topicRecord = await prisma.topic.create({
        data: {
          subjectId: subject.id,
          name: topicTitle,
          order: topicsCount + 1,
          quizGenerated: true,
        },
      })
    } else {
      topicRecord = await prisma.topic.update({
        where: { id: topicRecord.id },
        data: { quizGenerated: true },
      })
    }

    // Save quiz to database
    const quiz = await prisma.quiz.create({
      data: {
        subjectId: subject.id,
        topicId: topicRecord.id,
        title: `${topicTitle} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
        difficulty,
        questions: quizQuestions,
      },
    })

    return NextResponse.json({
      success: true,
      quiz,
      questionCount: quizQuestions.length,
    })
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    )
  }
}
