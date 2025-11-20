import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        quizAttempts: {
          orderBy: { completedAt: "desc" },
          include: {
            quiz: {
              include: {
                topic: {
                  include: {
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        color: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate stats
    const totalAttempts = user.quizAttempts.length
    const totalScore = user.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0)
    const totalQuestions = user.quizAttempts.reduce(
      (sum, attempt) => sum + attempt.totalQuestions,
      0
    )
    const averageScore =
      totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0
    const perfectScores = user.quizAttempts.filter(
      (attempt) => attempt.score === attempt.totalQuestions
    ).length

    return NextResponse.json({
      attempts: user.quizAttempts,
      stats: {
        totalAttempts,
        averageScore,
        perfectScores,
        totalQuestions,
      },
    })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    )
  }
}
