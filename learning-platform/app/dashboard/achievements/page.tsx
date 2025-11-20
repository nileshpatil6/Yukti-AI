"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Star,
  Lock,
  Zap,
  TrendingUp,
  Award,
  Crown
} from "lucide-react"

interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  xp: number
  unlocked: boolean
  unlockedAt?: string
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    levelTitle: "Beginner",
    levelProgress: 0,
    nextLevelXP: 100,
    unlockedCount: 0,
    totalCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/gamification/achievements")
      const data = await response.json()

      setAchievements(data.achievements || [])
      setStats({
        totalXP: data.totalXP || 0,
        level: data.level || 1,
        levelTitle: data.levelTitle || "Beginner",
        levelProgress: data.levelProgress || 0,
        nextLevelXP: data.nextLevelXP || 100,
        unlockedCount: data.unlockedCount || 0,
        totalCount: data.totalCount || 0,
      })
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Group achievements by category
  const groupedAchievements = achievements.reduce((acc, ach) => {
    let category = "Other"

    if (ach.type.includes("streak")) category = "Streaks"
    else if (ach.type.includes("quiz")) category = "Quizzes"
    else if (ach.type.includes("game")) category = "Games"
    else if (ach.type.includes("note")) category = "Notes"
    else if (ach.type.includes("subject") || ach.type.includes("onboarding") || ach.type.includes("login"))
      category = "Getting Started"
    else if (ach.type.includes("flashcard")) category = "Flashcards"
    else if (ach.type.includes("ai")) category = "AI Learning"
    else if (ach.type.includes("slide")) category = "Content"
    else if (ach.type.includes("xp")) category = "Milestones"

    if (!acc[category]) acc[category] = []
    acc[category].push(ach)
    return acc
  }, {} as Record<string, Achievement[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Achievements & Progress
        </h1>
        <p className="text-gray-600">
          Track your learning journey and unlock rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Level Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-purple-600" />
              <span className="font-semibold text-purple-900">Level</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {stats.level}
            </Badge>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.levelTitle}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{stats.totalXP} XP</span>
              <span>{stats.nextLevelXP} XP</span>
            </div>
            <Progress value={stats.levelProgress} className="h-3" />
            <p className="text-xs text-gray-600 text-center">
              {Math.round(stats.levelProgress)}% to next level
            </p>
          </div>
        </Card>

        {/* XP Card */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-orange-500" />
            <span className="font-semibold text-orange-900">Total XP</span>
          </div>
          <div className="text-5xl font-bold text-orange-600 mb-2">
            {stats.totalXP.toLocaleString()}
          </div>
          <p className="text-sm text-orange-700">
            Experience points earned
          </p>
        </Card>

        {/* Achievements Card */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-green-900">Unlocked</span>
          </div>
          <div className="text-5xl font-bold text-green-600 mb-2">
            {stats.unlockedCount}
          </div>
          <p className="text-sm text-green-700">
            of {stats.totalCount} achievements
          </p>
          <Progress
            value={(stats.unlockedCount / stats.totalCount) * 100}
            className="mt-3 h-2"
          />
        </Card>
      </div>

      {/* Achievements by Category */}
      <div className="space-y-8">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              {category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`p-6 transition-all ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-md"
                      : "bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-5xl ${
                        achievement.unlocked ? "" : "grayscale opacity-50"
                      }`}
                    >
                      {achievement.unlocked ? achievement.icon : "🔒"}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className={`font-bold text-lg ${
                            achievement.unlocked ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {achievement.title}
                        </h3>
                        {achievement.unlocked ? (
                          <Badge className="bg-green-600">
                            <Trophy className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>

                      <p
                        className={`text-sm mb-3 ${
                          achievement.unlocked ? "text-gray-700" : "text-gray-500"
                        }`}
                      >
                        {achievement.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                          <Zap className="h-4 w-4" />
                          <span>{achievement.xp} XP</span>
                        </div>

                        {achievement.unlocked && achievement.unlockedAt && (
                          <span className="text-xs text-gray-500">
                            {formatDate(achievement.unlockedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {achievements.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
          <p className="text-gray-600 mb-6">
            Start learning to unlock your first achievements!
          </p>
        </Card>
      )}
    </div>
  )
}
