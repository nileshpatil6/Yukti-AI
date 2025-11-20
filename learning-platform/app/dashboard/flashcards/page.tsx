"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Brain,
  Calendar,
  Clock,
  Play,
  Plus,
  BookOpen,
  Trophy,
  TrendingUp,
  Zap
} from "lucide-react"

interface FlashcardSet {
  id: string
  topicId: string
  topic: {
    id: string
    title: string
    subject: {
      id: string
      name: string
      color: string
    }
  }
  cards: {
    id: string
    front: string
    back: string
    nextReview: string
    repetitions: number
    easeFactor: number
    interval: number
  }[]
  createdAt: string
}

interface ReviewSchedule {
  dueNow: number
  dueToday: number
  dueTomorrow: number
  dueThisWeek: number
}

export default function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [stats, setStats] = useState({
    totalSets: 0,
    totalCards: 0,
    totalReviews: 0,
    streakDays: 0,
  })
  const [schedule, setSchedule] = useState<ReviewSchedule>({
    dueNow: 0,
    dueToday: 0,
    dueTomorrow: 0,
    dueThisWeek: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const fetchFlashcards = async () => {
    try {
      const response = await fetch("/api/flashcards")
      const data = await response.json()

      setFlashcardSets(data.sets || [])
      setStats(data.stats || stats)
      setSchedule(data.schedule || schedule)
    } catch (error) {
      console.error("Error fetching flashcards:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDueCount = (set: FlashcardSet) => {
    const now = new Date()
    return set.cards.filter((card) => new Date(card.nextReview) <= now).length
  }

  const getMasteryLevel = (set: FlashcardSet) => {
    const avgRepetitions =
      set.cards.reduce((sum, card) => sum + card.repetitions, 0) / set.cards.length
    if (avgRepetitions >= 5) return "mastered"
    if (avgRepetitions >= 3) return "learning"
    return "new"
  }

  const getMasteryColor = (level: string) => {
    switch (level) {
      case "mastered":
        return "bg-green-100 text-green-700 border-green-200"
      case "learning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-700 border-blue-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

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
          <Brain className="h-8 w-8 text-purple-600" />
          Flashcards
        </h1>
        <p className="text-gray-600">
          Master your subjects with spaced repetition learning
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Total Sets</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalSets}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Cards</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalCards}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Reviews</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.totalReviews}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Streak</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{stats.streakDays} days</div>
        </Card>
      </div>

      {/* Review Schedule */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-600" />
          Review Schedule
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-1">{schedule.dueNow}</div>
            <div className="text-sm text-gray-600">Due Now</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-200">
            <div className="text-3xl font-bold text-orange-600 mb-1">{schedule.dueToday}</div>
            <div className="text-sm text-gray-600">Due Today</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border-2 border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{schedule.dueTomorrow}</div>
            <div className="text-sm text-gray-600">Due Tomorrow</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-1">{schedule.dueThisWeek}</div>
            <div className="text-sm text-gray-600">Due This Week</div>
          </div>
        </div>

        {schedule.dueNow > 0 && (
          <div className="mt-4 flex justify-center">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Review {schedule.dueNow} Cards Now
            </Button>
          </div>
        )}
      </Card>

      {/* Flashcard Sets */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Flashcard Sets</h2>
      </div>

      {flashcardSets.length === 0 ? (
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No flashcard sets yet</h3>
          <p className="text-gray-600 mb-6">
            Generate flashcards from your subjects to start learning with spaced repetition
          </p>
          <Link href="/dashboard/subjects">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Go to Subjects
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => {
            const dueCount = getDueCount(set)
            const masteryLevel = getMasteryLevel(set)
            const progress = (set.cards.filter((c) => c.repetitions >= 3).length / set.cards.length) * 100

            return (
              <Card
                key={set.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                {/* Subject Badge */}
                <div className="mb-4">
                  <Badge
                    className="mb-2"
                    style={{
                      backgroundColor: set.topic.subject.color + "20",
                      color: set.topic.subject.color,
                      borderColor: set.topic.subject.color + "40",
                    }}
                  >
                    {set.topic.subject.name}
                  </Badge>
                  <Badge variant="outline" className={getMasteryColor(masteryLevel)}>
                    {masteryLevel === "mastered" ? "Mastered" : masteryLevel === "learning" ? "Learning" : "New"}
                  </Badge>
                </div>

                {/* Topic Title */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                  {set.topic.title}
                </h3>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    <span>{set.cards.length} cards</span>
                  </div>
                  {dueCount > 0 && (
                    <div className="flex items-center gap-1 text-red-600 font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>{dueCount} due</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Mastery Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/dashboard/flashcards/${set.id}/review`} className="flex-1">
                    <Button variant="default" className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      {dueCount > 0 ? `Review (${dueCount})` : "Review"}
                    </Button>
                  </Link>
                  <Link href={`/dashboard/subjects/${set.topic.subject.id}`}>
                    <Button variant="outline">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Created Date */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Created {formatDate(set.createdAt)}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
