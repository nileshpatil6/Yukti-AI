"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlashcardViewer } from "@/components/flashcards/flashcard-viewer"
import {
  Brain,
  Check,
  TrendingUp,
  Clock,
  Star,
  ArrowLeft,
  Trophy
} from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  category?: string
  difficulty?: string
  nextReview: string
  repetitions: number
  easeFactor: number
  interval: number
}

interface FlashcardSet {
  id: string
  subjectId: string
  title: string
  subject: {
    name: string
    displayName: string
    color: string
  }
  cards: Flashcard[]
}

export default function FlashcardReviewPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null)
  const [dueCards, setDueCards] = useState<Flashcard[]>([])
  const [reviewedCount, setReviewedCount] = useState(0)
  const [sessionStats, setSessionStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    again: 0,
  })
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)

  useEffect(() => {
    fetchFlashcardSet()
  }, [setId])

  const fetchFlashcardSet = async () => {
    try {
      const response = await fetch(`/api/flashcards/${setId}`)
      const data = await response.json()

      setFlashcardSet(data.set)

      // Filter cards that are due for review
      const now = new Date()
      const due = data.set.cards.filter(
        (card: Flashcard) => new Date(card.nextReview) <= now
      )

      setDueCards(due)

      if (due.length === 0) {
        // No cards due, show all cards instead
        setDueCards(data.set.cards)
      }
    } catch (error) {
      console.error("Error fetching flashcard set:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (
    cardId: string,
    difficulty: "easy" | "medium" | "hard" | "again"
  ) => {
    try {
      const response = await fetch(`/api/flashcards/${setId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, difficulty }),
      })

      const data = await response.json()

      // Update stats
      setSessionStats((prev) => ({
        ...prev,
        [difficulty]: prev[difficulty] + 1,
      }))
      setReviewedCount((prev) => prev + 1)
      setXpEarned((prev) => prev + (data.xpEarned || 5))
    } catch (error) {
      console.error("Error reviewing flashcard:", error)
    }
  }

  const handleComplete = () => {
    setCompleted(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!flashcardSet) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Flashcard set not found</h3>
          <Button onClick={() => router.push("/dashboard/flashcards")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
          </Button>
        </Card>
      </div>
    )
  }

  if (completed) {
    const total = sessionStats.easy + sessionStats.medium + sessionStats.hard + sessionStats.again
    const masteryRate = total > 0 ? ((sessionStats.easy + sessionStats.medium) / total) * 100 : 0

    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50">
            <Trophy className="h-24 w-24 mx-auto mb-6 text-yellow-500" />

            <h1 className="text-4xl font-bold mb-2">Review Complete!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Great work reviewing {flashcardSet.title}
            </p>

            {/* Session Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <div className="text-3xl font-bold text-green-600">{sessionStats.easy}</div>
                <div className="text-sm text-gray-600">Easy</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600">{sessionStats.medium}</div>
                <div className="text-sm text-gray-600">Good</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{sessionStats.hard}</div>
                <div className="text-sm text-gray-600">Hard</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-red-200">
                <div className="text-3xl font-bold text-red-600">{sessionStats.again}</div>
                <div className="text-sm text-gray-600">Again</div>
              </div>
            </div>

            {/* Mastery Rate */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {Math.round(masteryRate)}% Mastery Rate
                </span>
              </div>
              <p className="text-gray-600">
                You rated {sessionStats.easy + sessionStats.medium} cards as Easy/Good
              </p>
            </div>

            {/* XP Earned */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">
                  +{xpEarned} XP
                </span>
              </div>
              <p className="text-sm text-gray-600">Experience points earned</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/dashboard/flashcards")}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Flashcards
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setCompleted(false)
                  setReviewedCount(0)
                  setSessionStats({ easy: 0, medium: 0, hard: 0, again: 0 })
                  setXpEarned(0)
                  fetchFlashcardSet()
                }}
              >
                Review Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/flashcards")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Flashcards
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <Badge
              className="mb-2"
              style={{
                backgroundColor: flashcardSet.subject.color + "20",
                color: flashcardSet.subject.color,
                borderColor: flashcardSet.subject.color + "40",
              }}
            >
              {flashcardSet.subject.displayName}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{flashcardSet.title}</h1>
            <p className="text-gray-600">
              Reviewing {dueCards.length} card{dueCards.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Session Stats</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                <span className="font-semibold">{reviewedCount}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">+{xpEarned} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Viewer */}
      {dueCards.length > 0 ? (
        <FlashcardViewer
          cards={dueCards}
          onReview={handleReview}
          onComplete={handleComplete}
        />
      ) : (
        <Card className="p-12 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No cards due for review</h3>
          <p className="text-gray-600 mb-6">
            All cards in this set have been reviewed recently. Come back later!
          </p>
          <Button onClick={() => router.push("/dashboard/flashcards")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
          </Button>
        </Card>
      )}
    </div>
  )
}
