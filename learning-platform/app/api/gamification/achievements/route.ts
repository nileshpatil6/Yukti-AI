import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { ACHIEVEMENTS, checkAchievements, calculateLevel } from "@/lib/gamification/achievements"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        achievements: {
          orderBy: { unlockedAt: "desc" },
        },
        streak: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate total XP from achievements
    const totalXP = user.achievements.reduce((sum, ach) => sum + ach.xp, 0)

    // Calculate level
    const levelInfo = calculateLevel(totalXP)

    // Get unlocked achievement IDs
    const unlockedIds = user.achievements.map((a) => a.type)

    // Get all achievements with unlock status
    const allAchievements = ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: unlockedIds.includes(ach.type),
      unlockedAt: user.achievements.find((a) => a.type === ach.type)?.unlockedAt,
    }))

    return NextResponse.json({
      achievements: allAchievements,
      totalXP,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      levelProgress: levelInfo.progress,
      nextLevelXP: levelInfo.nextLevelXP,
      unlockedCount: user.achievements.length,
      totalCount: ACHIEVEMENTS.length,
    })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        achievements: true,
        streak: true,
        subjects: {
          include: {
            notes: true,
            quizzes: true,
            topics: true,
          },
        },
        quizAttempts: true,
        gameSessions: true,
        flashcardReviews: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build stats object
    const stats = {
      onboardingComplete: !!user.learningStyle,
      subjectsCreated: user.subjects.length,
      notesUploaded: user.subjects.reduce((sum, s) => sum + s.notes.length, 0),
      currentStreak: user.streak?.currentStreak || 0,
      quizzesCompleted: user.quizAttempts.length,
      perfectQuizzes: user.quizAttempts.filter((q) => q.score === 100).length,
      gamesPlayed: user.gameSessions.length,
      slidesGenerated: user.subjects.reduce(
        (sum, s) => sum + s.topics.filter((t) => t.slidesGenerated).length,
        0
      ),
      flashcardsCreated: 0, // TODO: count flashcard sets
      flashcardsReviewed: user.flashcardReviews.length,
      aiQuestionsAsked: 0, // TODO: track in separate table
      totalXP: user.achievements.reduce((sum, a) => sum + a.xp, 0),
    }

    // Get existing achievement types
    const existingTypes = user.achievements.map((a) => a.type)

    // Check for new achievements
    const newAchievements = checkAchievements(stats, existingTypes)

    if (newAchievements.length === 0) {
      return NextResponse.json({
        newAchievements: [],
        message: "No new achievements unlocked",
      })
    }

    // Unlock new achievements
    const created = await Promise.all(
      newAchievements.map((ach) =>
        prisma.achievement.create({
          data: {
            userId: user.id,
            type: ach.type,
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
            xp: ach.xp,
          },
        })
      )
    )

    return NextResponse.json({
      newAchievements: created,
      totalXPEarned: created.reduce((sum, a) => sum + a.xp, 0),
    })
  } catch (error) {
    console.error("Error checking achievements:", error)
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    )
  }
}
