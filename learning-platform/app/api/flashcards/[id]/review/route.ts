import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { calculateNextReview } from "@/lib/algorithms/spaced-repetition"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: setId } = await params
    const { cardId, difficulty } = await req.json()

    if (!cardId || !difficulty) {
      return NextResponse.json(
        { error: "Card ID and difficulty are required" },
        { status: 400 }
      )
    }

    // Fetch the flashcard set
    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: { id: setId },
      include: {
        subject: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!flashcardSet) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 })
    }

    // Verify ownership
    if (flashcardSet.subject.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Cards are stored as JSON, so we work with them directly
    const cards = flashcardSet.cards as any[]
    const cardIndex = cards.findIndex((c: any) => c.id === cardId || c.front === cardId)

    if (cardIndex === -1) {
      return NextResponse.json({ error: "Card not found in set" }, { status: 404 })
    }

    const card = cards[cardIndex]

    // Calculate next review using spaced repetition algorithm
    const reviewResult = calculateNextReview(
      difficulty,
      card.repetitions || 0,
      card.easeFactor || 2.5,
      card.interval || 0
    )

    // Update the card in the JSON array
    cards[cardIndex] = {
      ...card,
      nextReview: reviewResult.nextReviewDate,
      repetitions: reviewResult.repetition,
      easeFactor: reviewResult.easeFactor,
      interval: reviewResult.interval,
    }

    // Save updated cards back to the database
    await prisma.flashcardSet.update({
      where: { id: setId },
      data: {
        cards: cards,
      },
    })

    // Create review record
    await prisma.flashcardReview.create({
      data: {
        userId: user.id,
        flashcardSetId: setId,
        cardId: cardId,
        difficulty,
        nextReviewAt: reviewResult.nextReviewDate,
      },
    })

    // Award XP (5 XP per card reviewed)
    const xpEarned = 5

    return NextResponse.json({
      success: true,
      nextReview: reviewResult.nextReviewDate,
      xpEarned,
      message: "Card reviewed successfully",
    })
  } catch (error) {
    console.error("Error reviewing flashcard:", error)
    return NextResponse.json(
      { error: "Failed to review flashcard" },
      { status: 500 }
    )
  }
}
