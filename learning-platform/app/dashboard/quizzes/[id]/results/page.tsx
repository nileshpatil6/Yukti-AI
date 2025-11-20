"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Clock,
  Lightbulb
} from "lucide-react"

interface QuizResult {
  id: string
  quiz: {
    topic: {
      title: string
      subject: {
        name: string
        color: string
      }
    }
    difficulty: string
    questions: {
      id: string
      type: string
      question: string
      options: string[]
      correctAnswer: string
      explanation: string
    }[]
  }
  answers: {
    questionId: string
    userAnswer: string
    isCorrect: boolean
  }[]
  score: number
  totalQuestions: number
  completedAt: string
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.id as string

  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [attemptId])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/quizzes/${attemptId}`)
      const data = await response.json()

      setResult(data.result)
    } catch (error) {
      console.error("Error fetching quiz results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Results not found</h3>
          <Button onClick={() => router.push("/dashboard/quizzes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </Card>
      </div>
    )
  }

  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/quizzes")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quizzes
      </Button>

      {/* Score Card */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Badge
              className="mb-2"
              style={{
                backgroundColor: result.quiz.topic.subject.color + "20",
                color: result.quiz.topic.subject.color,
                borderColor: result.quiz.topic.subject.color + "40",
              }}
            >
              {result.quiz.topic.subject.name}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{result.quiz.topic.title}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatDate(result.completedAt)}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {scorePercentage}%
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {result.score}/{result.totalQuestions} Correct
            </Badge>
          </div>
        </div>

        <Progress value={scorePercentage} className="h-3" />

        {scorePercentage === 100 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-yellow-600 font-semibold">
            <Trophy className="h-6 w-6" />
            <span className="text-xl">Perfect Score! Outstanding!</span>
          </div>
        )}
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{result.score}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </Card>

        <Card className="p-4 text-center">
          <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
          <div className="text-2xl font-bold text-red-600">
            {result.totalQuestions - result.score}
          </div>
          <div className="text-sm text-gray-600">Incorrect</div>
        </Card>

        <Card className="p-4 text-center">
          <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">{scorePercentage}%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </Card>
      </div>

      {/* Question-by-Question Review */}
      <h2 className="text-2xl font-bold mb-4">Question Review</h2>

      <div className="space-y-6">
        {result.quiz.questions.map((question, index) => {
          const userAnswer = result.answers.find((a) => a.questionId === question.id)
          const isCorrect = userAnswer?.isCorrect || false

          return (
            <Card
              key={question.id}
              className={`p-6 ${
                isCorrect
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    isCorrect
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{question.type}</Badge>
                    {isCorrect ? (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{question.question}</h3>

                  {/* Options (for MCQ) */}
                  {question.type === "mcq" && question.options && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = option === userAnswer?.userAnswer
                        const isCorrectAnswer = option === question.correctAnswer

                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectAnswer
                                ? "border-green-500 bg-green-100"
                                : isUserAnswer
                                ? "border-red-500 bg-red-100"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectAnswer && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <span className={isCorrectAnswer ? "font-semibold" : ""}>
                                {option}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Answers (for other types) */}
                  {question.type !== "mcq" && (
                    <div className="space-y-2 mb-4">
                      <div
                        className={`p-3 rounded-lg ${
                          isCorrect ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">Your Answer:</div>
                        <div>{userAnswer?.userAnswer || "No answer"}</div>
                      </div>
                      {!isCorrect && (
                        <div className="p-3 rounded-lg bg-green-100">
                          <div className="text-sm font-medium mb-1">Correct Answer:</div>
                          <div>{question.correctAnswer}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-900 mb-1">
                          Explanation:
                        </div>
                        <div className="text-blue-800">{question.explanation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <Button variant="outline" onClick={() => router.push("/dashboard/quizzes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
        <Button onClick={() => router.push(`/dashboard/subjects/${result.quiz.topic.subject.name}`)}>
          Study This Topic Again
        </Button>
      </div>
    </div>
  )
}
