import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
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

    return NextResponse.json({
      game: {
        id: game.id,
        topicId: game.topicId,
        topic: {
          title: game.topic.title,
          subject: {
            name: game.topic.subject.name,
            color: game.topic.subject.color,
          },
        },
        gameType: game.gameType,
        htmlContent: game.htmlContent,
      },
    })
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}
