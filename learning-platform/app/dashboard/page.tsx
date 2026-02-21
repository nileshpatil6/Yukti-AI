"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Brain,
  Gamepad2,
  Trophy,
  Flame,
  Plus,
  Sparkles,
  TrendingUp,
  Calendar,
  Target
} from "lucide-react"

interface DashboardStats {
  subjects: number
  quizzesTaken: number
  gamesPlayed: number
  achievements: number
  currentStreak: number
  longestStreak: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    subjects: 0,
    quizzesTaken: 0,
    gamesPlayed: 0,
    achievements: 0,
    currentStreak: 0,
    longestStreak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const data = await response.json()
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: "Subjects",
      value: stats.subjects.toString(),
      icon: BookOpen,
      color: "blue" as const,
      action: () => router.push("/dashboard/subjects")
    },
    {
      name: "Quizzes Taken",
      value: stats.quizzesTaken.toString(),
      icon: Brain,
      color: "purple" as const,
      action: () => router.push("/dashboard/quizzes")
    },
    {
      name: "Games Played",
      value: stats.gamesPlayed.toString(),
      icon: Gamepad2,
      color: "green" as const,
      action: () => router.push("/dashboard/games")
    },
    {
      name: "Achievements",
      value: stats.achievements.toString(),
      icon: Trophy,
      color: "yellow" as const,
      action: () => router.push("/dashboard/achievements")
    }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            green: "bg-green-100 text-green-600",
            yellow: "bg-yellow-100 text-yellow-600"
          }[stat.color]

          return (
            <Card
              key={stat.name}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.action}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.name}</div>
            </Card>
          )
        })}
      </div>

      {/* Current Streak */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-bold">Daily Streak</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Keep learning daily to maintain your streak!
            </p>
            <div className="text-4xl font-bold text-orange-600">{stats.currentStreak} Days</div>
          </div>
          <div className="text-6xl">🔥</div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/dashboard/subjects")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Subject
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/dashboard/ai-teacher")}
            >
              <Brain className="mr-2 h-4 w-4" />
              Ask AI Teacher
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/dashboard/planner")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Create Study Plan
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Learning Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Weekly Goal</span>
                <span className="text-sm text-gray-600">{stats.currentStreak}/7 days</span>
              </div>
              <Progress value={(stats.currentStreak / 7) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Quizzes Taken</span>
                <span className="text-sm text-gray-600">{stats.quizzesTaken}</span>
              </div>
              <Progress value={Math.min((stats.quizzesTaken / 10) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Subjects Created</span>
                <span className="text-sm text-gray-600">{stats.subjects}</span>
              </div>
              <Progress value={Math.min((stats.subjects / 5) * 100, 100)} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Get Started Guide */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Get Started</h2>
            <p className="text-gray-700 mb-4">
              Welcome to your AI-powered learning platform! Here's how to begin:
            </p>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Create your first subject and upload your notes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Let AI generate slides, quizzes, and games from your content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Start learning with interactive lessons and track your progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>Earn XP, maintain streaks, and unlock achievements!</span>
              </li>
            </ol>
            <Button className="mt-4" onClick={() => router.push("/dashboard/subjects")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Subject
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
