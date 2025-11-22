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

    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        plan: true,
      },
    })

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    // Verify ownership
    if (milestone.plan.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Toggle completion status
    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        completed: !milestone.completed,
      },
    })

    return NextResponse.json({
      success: true,
      completed: updated.completed,
    })
  } catch (error) {
    console.error("Error toggling milestone:", error)
    return NextResponse.json(
      { error: "Failed to toggle milestone" },
      { status: 500 }
    )
  }
}
