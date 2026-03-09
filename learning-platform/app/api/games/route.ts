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
        subjects: {
          include: {
            topics: {
              include: {
                games: {
                  include: {
                    sessions: {
                      orderBy: { playedAt: "desc" },
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

    // Collect all games
    const games: any[] = []
    user.subjects.forEach((subject: any) => {
      subject.topics.forEach((topic: any) => {
        topic.games.forEach((game: any) => {
          games.push({
            ...game,
            topic: {
              title: topic.name,
              subject: {
                id: subject.id,
                name: subject.name,
                color: subject.color,
              },
            },
          })
        })
      })
    })

    // Calculate stats
    const totalSessions = games.reduce((sum, game) => sum + game.sessions.length, 0)
    const allScores = games.flatMap((game) => game.sessions.map((s: any) => s.score))
    const averageScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
        : 0
    const highScore = allScores.length > 0 ? Math.max(...allScores) : 0

    return NextResponse.json({
      games,
      stats: {
        totalGames: games.length,
        totalSessions,
        averageScore,
        highScore,
      },
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}
