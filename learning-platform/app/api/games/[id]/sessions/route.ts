import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
    })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Verify ownership
    if (game.topic.subject.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get score from request body (optional, defaults to 0)
    const body = await req.json().catch(() => ({}))
    const score = body.score || 0

    // Create game session
    const gameSession = await prisma.gameSession.create({
      data: {
        userId: user.id,
        gameId: game.id,
        score,
        completedAt: new Date(),
      },
    })

    // Award XP (30 XP for playing a game)
    const xpEarned = 30

    return NextResponse.json({
      session: gameSession,
      xpEarned,
    })
  } catch (error) {
    console.error("Error creating game session:", error)
    return NextResponse.json(
      { error: "Failed to create game session" },
      { status: 500 }
    )
  }
}
