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

    const studySession = await prisma.studySession.findUnique({
      where: { id },
      include: {
        plan: true,
      },
    })

    if (!studySession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Verify ownership
    if (studySession.plan.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Toggle completion status
    const updated = await prisma.studySession.update({
      where: { id },
      data: {
        completed: !studySession.completed,
      },
    })

    return NextResponse.json({
      success: true,
      completed: updated.completed,
    })
  } catch (error) {
    console.error("Error toggling session:", error)
    return NextResponse.json(
      { error: "Failed to toggle session" },
      { status: 500 }
    )
  }
}
