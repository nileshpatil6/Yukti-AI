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

    const data = await req.json()

    // Update user profile
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        age: parseInt(data.age),
        class: data.class,
        stream: data.stream,
        learningStyle: data.learningStyle,
        pace: data.pace,
        interests: data.interests,
        aiPersona: data.aiPersona,
      },
    })

    // Create initial streak record
    await prisma.streak.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
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
      include: {
        streak: true,
        achievements: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
