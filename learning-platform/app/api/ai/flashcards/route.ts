import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateFlashcardsWithFileSearch } from "@/lib/gemini"

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

    const { subjectId, topicName } = await req.json()

    if (!subjectId || !topicName) {
      return NextResponse.json(
        { error: "Subject ID and topic name are required" },
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
        { error: "No notes found in this subject. Please upload notes first." },
        { status: 400 }
      )
    }

    // Generate flashcards using Gemini File Search
    const flashcardsData = await generateFlashcardsWithFileSearch(
      topic,
      subject.fileSearchStoreId
    )

    // Create flashcard set
    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        subjectId: subject.id,
        title: topicName,
        cards: flashcardsData,
      },
    })

    return NextResponse.json({
      success: true,
      flashcardSet,
      cardCount: flashcardsData.length,
    })
  } catch (error) {
    console.error("Error generating flashcards:", error)
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    )
  }
}
