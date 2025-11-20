import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    const { id } = await params

    // Try to find quiz directly first
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            subject: {
              select: {
                name: true,
                color: true,
              },
            },
          },
        },
      },
    })

    // If found, return quiz data
    if (quiz) {
      return NextResponse.json(quiz)
    }

    // Otherwise, try to find quiz attempt
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            topic: {
              include: {
                subject: {
                  select: {
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Verify ownership
    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      result: attempt,
    })
  } catch (error) {
    console.error("Error fetching quiz result:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz result" },
      { status: 500 }
    )
  }
}
