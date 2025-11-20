"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  Clock,
  Target
} from "lucide-react"

interface Question {
  type: "mcq" | "true-false" | "short-answer"
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  points: number
}

interface QuizTakerProps {
  quizId: string
  title: string
  questions: Question[]
  onComplete: (score: number, answers: any[]) => void
}

export function QuizTaker({ quizId, title, questions, onComplete }: QuizTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [userAnswer, setUserAnswer] = useState<string>("")
  const [showExplanation, setShowExplanation] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [startTime] = useState(Date.now())

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = answers.filter(a => a.submitted).length

  const checkAnswer = () => {
    const correct = question.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowExplanation(true)

    const newAnswer = {
      questionIndex: currentQuestion,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: correct,
      points: correct ? question.points : 0,
      submitted: true,
    }

    setAnswers(prev => {
      const updated = [...prev]
      updated[currentQuestion] = newAnswer
      return updated
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setUserAnswer(answers[currentQuestion + 1]?.userAnswer || "")
      setShowExplanation(false)
      setIsCorrect(null)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setUserAnswer(answers[currentQuestion - 1]?.userAnswer || "")
      setShowExplanation(answers[currentQuestion - 1]?.submitted || false)
      setIsCorrect(answers[currentQuestion - 1]?.isCorrect || null)
    }
  }

  const finishQuiz = () => {
    const totalScore = answers.reduce((sum, ans) => sum + (ans.points || 0), 0)
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = (totalScore / maxScore) * 100
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    onComplete(percentage, answers)
  }

  const allAnswered = answers.filter(a => a.submitted).length === questions.length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Answered</div>
              <div className="text-2xl font-bold">{answeredCount}/{questions.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Points</div>
              <div className="text-2xl font-bold">{question.points}</div>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Question Card */}
      <Card className="p-8">
        {/* Question Type Badge */}
        <div className="mb-6">
          <Badge variant="outline" className="mb-4">
            {question.type === "mcq" && "Multiple Choice"}
            {question.type === "true-false" && "True or False"}
            {question.type === "short-answer" && "Short Answer"}
          </Badge>

          <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
        </div>

        {/* Answer Input */}
        {!showExplanation && (
          <div className="space-y-4 mb-6">
            {question.type === "mcq" && question.options && (
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setUserAnswer(option)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      userAnswer === option
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          userAnswer === option
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {userAnswer === option && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {question.type === "true-false" && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserAnswer("True")}
                  className={`p-6 border-2 rounded-lg font-medium transition-all ${
                    userAnswer === "True"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  ✓ True
                </button>
                <button
                  onClick={() => setUserAnswer("False")}
                  className={`p-6 border-2 rounded-lg font-medium transition-all ${
                    userAnswer === "False"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  ✗ False
                </button>
              </div>
            )}

            {question.type === "short-answer" && (
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px]"
              />
            )}
          </div>
        )}

        {/* Result & Explanation */}
        {showExplanation && (
          <div className="space-y-4 mb-6">
            <div
              className={`p-4 rounded-lg border-2 ${
                isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold mb-1 ${isCorrect ? "text-green-900" : "text-red-900"}`}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Your answer:</span> {userAnswer}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Correct answer:</span> {question.correctAnswer}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="font-medium text-blue-900 mb-2">📚 Explanation:</p>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {!showExplanation ? (
            <Button
              onClick={checkAnswer}
              disabled={!userAnswer}
            >
              Submit Answer
            </Button>
          ) : currentQuestion < questions.length - 1 ? (
            <Button onClick={nextQuestion}>
              Next Question
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={finishQuiz}
              disabled={!allAnswered}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Finish Quiz
            </Button>
          )}
        </div>
      </Card>

      {/* Progress Indicator */}
      <div className="mt-6 flex justify-center gap-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentQuestion(index)
              setUserAnswer(answers[index]?.userAnswer || "")
              setShowExplanation(answers[index]?.submitted || false)
              setIsCorrect(answers[index]?.isCorrect || null)
            }}
            className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
              index === currentQuestion
                ? "bg-blue-600 text-white ring-2 ring-blue-300"
                : answers[index]?.submitted
                ? answers[index]?.isCorrect
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
