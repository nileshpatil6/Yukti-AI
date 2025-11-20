import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { getReviewSchedule } from "@/lib/algorithms/spaced-repetition"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subjects: {
          include: {
            topics: {
              include: {
                flashcardSet: {
                  include: {
                    cards: true,
                  },
                },
              },
            },
          },
        },
        flashcardReviews: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Collect all flashcard sets
    const sets: any[] = []
    user.subjects.forEach((subject) => {
      subject.topics.forEach((topic) => {
        if (topic.flashcardSet) {
          sets.push({
            ...topic.flashcardSet,
            topic: {
              id: topic.id,
              title: topic.title,
              subject: {
                id: subject.id,
                name: subject.name,
                color: subject.color,
              },
            },
          })
        }
      })
    })

    // Calculate stats
    const totalCards = sets.reduce((sum, set) => sum + set.cards.length, 0)
    const totalReviews = user.flashcardReviews.length

    // Calculate review schedule across all cards
    const allCards = sets.flatMap((set) => set.cards)
    const schedule = getReviewSchedule(allCards)

    // Calculate streak (simplified - based on review history)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reviewDates = user.flashcardReviews.map((r) => {
      const d = new Date(r.reviewedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
    const uniqueDates = [...new Set(reviewDates)].sort((a, b) => b - a)

    let streakDays = 0
    for (let i = 0; i < uniqueDates.length; i++) {
      const daysDiff = Math.floor((today.getTime() - uniqueDates[i]) / (1000 * 60 * 60 * 24))
      if (daysDiff === i) {
        streakDays++
      } else {
        break
      }
    }

    return NextResponse.json({
      sets,
      stats: {
        totalSets: sets.length,
        totalCards,
        totalReviews,
        streakDays,
      },
      schedule,
    })
  } catch (error) {
    console.error("Error fetching flashcards:", error)
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    )
  }
}
