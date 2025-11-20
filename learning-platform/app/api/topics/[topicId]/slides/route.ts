import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const slides = await prisma.slide.findMany({
      where: { topicId: params.topicId },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ slides })
  } catch (error) {
    console.error("Error fetching slides:", error)
    return NextResponse.json(
      { error: "Failed to fetch slides" },
      { status: 500 }
    )
  }
}
