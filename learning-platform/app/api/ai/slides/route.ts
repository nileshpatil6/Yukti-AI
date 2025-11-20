import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateSlidesWithFileSearch } from "@/lib/gemini"

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

    const { subjectId, topicName } = await req.json()

    if (!subjectId || !topicName) {
      return NextResponse.json(
        { error: "Subject ID and topic name are required" },
        { status: 400 }
      )
    }

    // Verify subject belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id,
      },
      include: {
        notes: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    if (!subject.fileSearchStoreId) {
      return NextResponse.json(
        { error: "No File Search store found. Please upload PDF notes first." },
        { status: 400 }
      )
    }

    if (subject.notes.length === 0) {
      return NextResponse.json(
        { error: "No notes found in this subject. Please upload notes first." },
        { status: 400 }
      )
    }

    // Generate slides using Gemini File Search
    const userProfile = {
      learningStyle: user.learningStyle,
      interests: user.interests,
      pace: user.pace,
    }

    const slidesData = await generateSlidesWithFileSearch(
      topicName,
      subject.fileSearchStoreId,
      userProfile
    )

    // Create or find topic
    let topic = await prisma.topic.findFirst({
      where: {
        subjectId: subject.id,
        name: topicName,
      },
    })

    if (!topic) {
      const topicsCount = await prisma.topic.count({
        where: { subjectId: subject.id },
      })

      topic = await prisma.topic.create({
        data: {
          subjectId: subject.id,
          name: topicName,
          order: topicsCount + 1,
          slidesGenerated: true,
        },
      })
    } else {
      topic = await prisma.topic.update({
        where: { id: topic.id },
        data: { slidesGenerated: true },
      })
    }

    // Save slides to database
    await prisma.slide.deleteMany({
      where: { topicId: topic.id },
    })

    const slides = await Promise.all(
      slidesData.map((slideData: any, index: number) =>
        prisma.slide.create({
          data: {
            topicId: topic!.id,
            order: index + 1,
            title: slideData.title,
            content: {
              mainPoints: slideData.mainPoints || [],
              visualDescription: slideData.visualDescription || "",
              realWorldExample: slideData.realWorldExample || "",
              practiceQuestion: slideData.practiceQuestion || "",
            },
            notes: slideData.notes || "",
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      topic,
      slides,
      count: slides.length,
    })
  } catch (error) {
    console.error("Error generating slides:", error)
    return NextResponse.json(
      { error: "Failed to generate slides" },
      { status: 500 }
    )
  }
}
