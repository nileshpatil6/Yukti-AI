"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Brain,
  Trophy,
  TrendingUp,
  Target,
  Clock,
  Play,
  CheckCircle2,
  Plus,
  Star
} from "lucide-react"

interface QuizAttempt {
  id: string
  quiz: {
    id: string
    topic: {
      title: string
      subject: {
        id: string
        name: string
        color: string
      }
    }
    difficulty: string
  }
  score: number
  totalQuestions: number
  completedAt: string
}

export default function QuizzesPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    perfectScores: 0,
    totalQuestions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes")
      const data = await response.json()

      setAttempts(data.attempts || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score === 100) return "Perfect!"
    if (score >= 90) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Pass"
    return "Needs Improvement"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <Brain className="h-8 w-8 text-blue-600" />
          Quizzes & Results
        </h1>
        <p className="text-gray-600">Track your quiz performance and progress</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Attempts</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalAttempts}</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Average Score</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.averageScore}%
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Perfect Scores</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.perfectScores}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Questions Answered</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {stats.totalQuestions}
          </div>
        </Card>
      </div>

      {/* Quiz Attempts */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Attempts</h2>
        <Link href="/dashboard/subjects">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Take New Quiz
          </Button>
        </Link>
      </div>

      {attempts.length === 0 ? (
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No quiz attempts yet</h3>
          <p className="text-gray-600 mb-6">
            Generate quizzes from your subjects to test your knowledge
          </p>
          <Link href="/dashboard/subjects">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Go to Subjects
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const scorePercentage = Math.round(
              (attempt.score / attempt.totalQuestions) * 100
            )

            return (
              <Card
                key={attempt.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Left: Quiz Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        style={{
                          backgroundColor:
                            attempt.quiz.topic.subject.color + "20",
                          color: attempt.quiz.topic.subject.color,
                          borderColor: attempt.quiz.topic.subject.color + "40",
                        }}
                      >
                        {attempt.quiz.topic.subject.name}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(attempt.quiz.difficulty)}
                      >
                        {attempt.quiz.difficulty}
                      </Badge>
                      {scorePercentage === 100 && (
                        <Badge className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Perfect Score
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold mb-2">
                      {attempt.quiz.topic.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(attempt.completedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        <span>
                          {attempt.score}/{attempt.totalQuestions} correct
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right">
                    <div
                      className={`text-5xl font-bold mb-2 ${getScoreColor(
                        scorePercentage
                      )}`}
                    >
                      {scorePercentage}%
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getScoreColor(scorePercentage)} border-current`}
                    >
                      {getScoreBadge(scorePercentage)}
                    </Badge>

                    <div className="mt-4">
                      <Progress value={scorePercentage} className="h-2 w-32" />
                    </div>
                  </div>
                </div>

                {/* View Results Button */}
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/dashboard/quizzes/${attempt.id}/results`}>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Detailed Results
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
