import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

// GET single subject by ID
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

    const subject = await prisma.subject.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        notes: {
          orderBy: { uploadedAt: "desc" },
        },
        topics: {
          orderBy: { order: "asc" },
          include: {
            quizzes: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            games: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        _count: {
          select: {
            notes: true,
            topics: true,
            quizzes: true,
          },
        },
      },
    })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    return NextResponse.json({ subject })
  } catch (error) {
    console.error("Error fetching subject:", error)
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 }
    )
  }
}

// DELETE subject
export async function DELETE(
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

    await prisma.subject.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    )
  }
}
