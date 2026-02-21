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
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Get counts
        const [subjectsCount, quizAttemptsCount, gameSessionsCount, achievementsCount, streak] = await Promise.all([
            prisma.subject.count({
                where: { userId: user.id },
            }),
            prisma.quizAttempt.count({
                where: { userId: user.id },
            }),
            prisma.gameSession.count({
                where: { userId: user.id },
            }),
            prisma.achievement.count({
                where: { userId: user.id },
            }),
            prisma.streak.findUnique({
                where: { userId: user.id },
            }),
        ])

        return NextResponse.json({
            stats: {
                subjects: subjectsCount,
                quizzesTaken: quizAttemptsCount,
                gamesPlayed: gameSessionsCount,
                achievements: achievementsCount,
                currentStreak: streak?.currentStreak || 0,
                longestStreak: streak?.longestStreak || 0,
            },
        })
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        )
    }
}
