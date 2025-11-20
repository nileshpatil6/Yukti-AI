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

    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
            userId: true,
          },
        },
      },
    })

    if (!flashcardSet) {
      return NextResponse.json(
        { error: "Flashcard set not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (flashcardSet.subject.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      set: flashcardSet,
    })
  } catch (error) {
    console.error("Error fetching flashcard set:", error)
    return NextResponse.json(
      { error: "Failed to fetch flashcard set" },
      { status: 500 }
    )
  }
}
