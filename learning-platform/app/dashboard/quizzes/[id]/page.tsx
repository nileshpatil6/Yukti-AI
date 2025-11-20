"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"

interface Question {
  id: string
  question: string
  type: "multiple_choice" | "true_false" | "short_answer" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  options?: string[]
  correctAnswer: string
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  difficulty: string
  description?: string
  questions: Question[]
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    fetch(`/api/quizzes/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Normalize the questions - add IDs if they don't exist
        const normalizedQuestions = (Array.isArray(data.questions) ? data.questions : []).map((q: any, idx: number) => ({
          ...q,
          id: q.id || `q-${idx}`,
        }));
        
        setQuiz({
          ...data,
          questions: normalizedQuestions,
        })
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading quiz:", error)
        setLoading(false)
      })
  }, [params.id])

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    if (!quiz) return

    let correctCount = 0
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id]?.toLowerCase().trim()
      const correctAnswer = question.correctAnswer.toLowerCase().trim()
      if (userAnswer === correctAnswer) {
        correctCount++
      }
    })

    setScore(correctCount)
    setShowResults(true)
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {!quiz ? "Quiz not found" : "No questions available"}
          </h2>
          <p className="text-gray-600 mb-4">
            {!quiz ? "The quiz you're looking for doesn't exist." : "This quiz doesn't have any questions yet."}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid question</h2>
          <p className="text-gray-600 mb-4">The current question could not be loaded.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    )
  }
  
  const isAnswered = !!answers[currentQuestion.id]
  const allAnswered = quiz.questions.every((q) => answers[q.id])

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100)

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
              <div className="text-6xl font-bold mb-4 text-blue-600">
                {percentage}%
              </div>
              <p className="text-xl text-gray-600">
                You got {score} out of {quiz.questions.length} questions correct
              </p>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[question.id]?.toLowerCase().trim()
                const correctAnswer = question.correctAnswer.toLowerCase().trim()
                const isCorrect = userAnswer === correctAnswer

                return (
                  <Card key={question.id} className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`p-2 rounded-full ${
                          isCorrect
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isCorrect ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Your answer:</span>{" "}
                            <span
                              className={
                                isCorrect ? "text-green-600" : "text-red-600"
                              }
                            >
                              {answers[question.id]}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm">
                              <span className="font-medium">Correct answer:</span>{" "}
                              <span className="text-green-600">
                                {question.correctAnswer}
                              </span>
                            </p>
                          )}
                          {question.explanation && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Explanation:</span>{" "}
                              {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="mt-8 flex gap-4">
              <Button onClick={() => router.back()} variant="outline" className="flex-1">
                Back to Subject
              </Button>
              <Button
                onClick={() => {
                  setAnswers({})
                  setCurrentQuestionIndex(0)
                  setShowResults(false)
                  setScore(0)
                }}
                className="flex-1"
              >
                Retake Quiz
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="text-sm font-medium">
              {Object.keys(answers).length} answered
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-8 py-2">
          <div className="flex gap-1">
            {quiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  answers[q.id]
                    ? "bg-blue-600"
                    : idx === currentQuestionIndex
                    ? "bg-blue-200"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <Card className="p-8">
          <div className="mb-8">
            {currentQuestion.type && (
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                {currentQuestion.type.replace(/_/g, " ").toLowerCase()}
              </div>
            )}
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

            {(currentQuestion.type === "MULTIPLE_CHOICE" || currentQuestion.type === "multiple_choice") && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === option
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === option
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestion.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(currentQuestion.type === "TRUE_FALSE" || currentQuestion.type === "true_false") && (
              <div className="space-y-3">
                {["True", "False"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === option
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === option
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestion.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(currentQuestion.type === "SHORT_ANSWER" || currentQuestion.type === "short_answer") && (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                rows={4}
                className="w-full"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={!allAnswered}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
