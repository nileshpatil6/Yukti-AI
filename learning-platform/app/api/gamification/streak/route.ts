import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { streak: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = user.streak

    if (!streak) {
      // Create initial streak
      streak = await prisma.streak.create({
        data: {
          userId: user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: new Date(),
        },
      })
    } else {
      const lastActivity = new Date(streak.lastActivityDate)
      lastActivity.setHours(0, 0, 0, 0)

      const daysSinceLastActivity = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceLastActivity === 0) {
        // Same day, no update needed
        return NextResponse.json({
          streak: streak.currentStreak,
          message: "Streak already updated today",
        })
      } else if (daysSinceLastActivity === 1) {
        // Consecutive day, increment streak
        const newStreak = streak.currentStreak + 1
        streak = await prisma.streak.update({
          where: { id: streak.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastActivityDate: new Date(),
          },
        })
      } else {
        // Streak broken, reset to 1
        streak = await prisma.streak.update({
          where: { id: streak.id },
          data: {
            currentStreak: 1,
            lastActivityDate: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      streak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      xpEarned: 10, // Daily login XP
    })
  } catch (error) {
    console.error("Error updating streak:", error)
    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { streak: true },
    })

    if (!user || !user.streak) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
      })
    }

    return NextResponse.json({
      currentStreak: user.streak.currentStreak,
      longestStreak: user.streak.longestStreak,
      lastActivityDate: user.streak.lastActivityDate,
    })
  } catch (error) {
    console.error("Error fetching streak:", error)
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    )
  }
}
