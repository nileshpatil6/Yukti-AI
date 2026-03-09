import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateStudyPlan } from "@/lib/gemini"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        studyPlans: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sessions: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                  },
                },
              },
            },
            milestones: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.studyPlans.length === 0) {
      return NextResponse.json({ plan: null })
    }

    const latestPlan = user.studyPlans[0]

    // Group sessions by day
    const weeklySchedule = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      sessions: latestPlan.sessions
        .filter((s: any) => s.day === day)
        .map((s: any) => ({
          id: s.id,
          subjectId: s.subjectId,
          subjectName: s.subject.name,
          subjectColor: s.subject.color,
          topic: s.topic,
          duration: s.duration,
          timeSlot: s.timeSlot,
          activities: s.activities,
          completed: s.completed,
        })),
    }))

    return NextResponse.json({
      plan: {
        id: latestPlan.id,
        weeklySchedule,
        milestones: latestPlan.milestones,
        tips: latestPlan.tips,
        createdAt: latestPlan.createdAt,
      },
    })
  } catch (error) {
    console.error("Error fetching study plan:", error)
    return NextResponse.json(
      { error: "Failed to fetch study plan" },
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
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { subjects, goals, availableHours } = await req.json()

    if (!subjects || !goals || !availableHours) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Fetch full subject details
    const subjectDetails = await prisma.subject.findMany({
      where: {
        id: { in: subjects.map((s: any) => s.id) },
        userId: user.id,
      },
    })

    const subjectsWithPriority = subjectDetails.map((s: any) => ({
      id: s.id,
      name: s.name,
      priority: subjects.find((sub: any) => sub.id === s.id)?.priority || "medium",
    }))

    // Get user profile
    const userProfile = {
      learningStyle: user.learningStyle,
      pace: user.pace,
      interests: user.interests,
    }

    // Generate study plan using AI
    const generatedPlan = await generateStudyPlan(
      subjectsWithPriority,
      goals,
      availableHours,
      userProfile
    )

    // Save to database
    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId: user.id,
        goals,
        hoursPerWeek: availableHours,
        tips: generatedPlan.tips || [],
      },
    })

    // Create sessions
    const sessionsToCreate = generatedPlan.weeklySchedule.flatMap((day: any) =>
      day.sessions.map((session: any) => ({
        planId: studyPlan.id,
        subjectId: session.subjectId,
        day: day.day,
        topic: session.topic,
        duration: session.duration,
        timeSlot: session.timeSlot,
        activities: session.activities,
        completed: false,
      }))
    )

    await prisma.studySession.createMany({
      data: sessionsToCreate,
    })

    // Create milestones
    if (generatedPlan.milestones && generatedPlan.milestones.length > 0) {
      await prisma.milestone.createMany({
        data: generatedPlan.milestones.map((milestone: any) => ({
          planId: studyPlan.id,
          subjectId: milestone.subjectId,
          title: milestone.title,
          description: milestone.description,
          dueDate: new Date(milestone.dueDate),
          completed: false,
        })),
      })
    }

    // Fetch complete plan with relations
    const completePlan = await prisma.studyPlan.findUnique({
      where: { id: studyPlan.id },
      include: {
        sessions: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        milestones: true,
      },
    })

    // Format response
    const weeklySchedule = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      day,
      sessions: completePlan!.sessions
        .filter((s: any) => s.day === day)
        .map((s: any) => ({
          id: s.id,
          subjectId: s.subjectId,
          subjectName: s.subject.name,
          subjectColor: s.subject.color,
          topic: s.topic,
          duration: s.duration,
          timeSlot: s.timeSlot,
          activities: s.activities,
          completed: s.completed,
        })),
    }))

    return NextResponse.json({
      plan: {
        id: completePlan!.id,
        weeklySchedule,
        milestones: completePlan!.milestones,
        tips: completePlan!.tips,
        createdAt: completePlan!.createdAt,
      },
    })
  } catch (error) {
    console.error("Error creating study plan:", error)
    return NextResponse.json(
      { error: "Failed to create study plan" },
      { status: 500 }
    )
  }
}
