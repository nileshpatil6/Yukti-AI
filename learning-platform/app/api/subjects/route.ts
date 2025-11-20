import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { createFileSearchStore } from "@/lib/gemini"

// GET all subjects for current user
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

    const subjects = await prisma.subject.findMany({
      where: { userId: user.id },
      include: {
        notes: true,
        topics: true,
        _count: {
          select: {
            notes: true,
            topics: true,
            quizzes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

// POST create a new subject
export async function POST(req: Request) {
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

    const data = await req.json()

    // Create File Search store for this subject
    const fileSearchStoreId = await createFileSearchStore(
      `${user.id}-${data.name}`
    )

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        userId: user.id,
        name: data.name,
        displayName: data.displayName,
        color: data.color || "#3B82F6",
        icon: data.icon,
        fileSearchStoreId,
      },
      include: {
        _count: {
          select: {
            notes: true,
            topics: true,
            quizzes: true,
          },
        },
      },
    })

    return NextResponse.json({ subject })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    )
  }
}
