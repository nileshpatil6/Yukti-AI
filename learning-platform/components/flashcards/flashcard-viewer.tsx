"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  RotateCw,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Brain
} from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  category?: string
  difficulty?: string
}

interface FlashcardViewerProps {
  cards: Flashcard[]
  onReview: (cardId: string, difficulty: "easy" | "medium" | "hard" | "again") => void
  onComplete?: () => void
}

export function FlashcardViewer({ cards, onReview, onComplete }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewed, setReviewed] = useState<Set<number>>(new Set())

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleReview = (difficulty: "easy" | "medium" | "hard" | "again") => {
    if (!isFlipped) return // Must see back first

    onReview(currentCard.id, difficulty)

    const newReviewed = new Set(reviewed)
    newReviewed.add(currentIndex)
    setReviewed(newReviewed)

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      // Completed all cards
      onComplete?.()
    }
  }

  const handleSkip = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  if (!currentCard) {
    return (
      <Card className="p-12 text-center">
        <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No cards to review</h3>
        <p className="text-gray-600">All cards have been reviewed!</p>
      </Card>
    )
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    hard: "bg-red-100 text-red-700 border-red-200",
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="text-sm text-gray-600">
            {reviewed.size} reviewed
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div
        className="relative h-96 cursor-pointer mb-6 perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <Card
            className={`absolute inset-0 flex flex-col items-center justify-center p-12 backface-hidden ${
              !isFlipped ? "z-10" : "z-0"
            }`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center">
              <div className="mb-6">
                <Badge variant="outline" className="mb-2">
                  Question
                </Badge>
                {currentCard.category && (
                  <Badge variant="secondary" className="ml-2">
                    {currentCard.category}
                  </Badge>
                )}
              </div>

              <h2 className="text-3xl font-bold mb-6">{currentCard.front}</h2>

              <div className="flex items-center justify-center gap-2 text-gray-500">
                <RotateCw className="h-5 w-5" />
                <span className="text-sm">Click to reveal answer</span>
              </div>
            </div>
          </Card>

          {/* Back */}
          <Card
            className={`absolute inset-0 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 ${
              isFlipped ? "z-10" : "z-0"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center">
              <Badge variant="outline" className="mb-6">
                Answer
              </Badge>

              <h2 className="text-2xl font-semibold mb-8 text-gray-900">
                {currentCard.back}
              </h2>

              {currentCard.difficulty && (
                <Badge
                  className={difficultyColors[currentCard.difficulty as keyof typeof difficultyColors] || ""}
                >
                  {currentCard.difficulty}
                </Badge>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Review Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleReview("again")}
          >
            <X className="h-4 w-4 mr-2" />
            Again
          </Button>
          <Button
            variant="outline"
            className="border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            onClick={() => handleReview("hard")}
          >
            Hard
          </Button>
          <Button
            variant="outline"
            className="border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700"
            onClick={() => handleReview("medium")}
          >
            Good
          </Button>
          <Button
            variant="outline"
            className="border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleReview("easy")}
          >
            <Check className="h-4 w-4 mr-2" />
            Easy
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleFlip} className="flex-1">
            <RotateCw className="h-4 w-4 mr-2" />
            Show Answer
          </Button>
          <Button variant="ghost" onClick={handleSkip}>
            Skip
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Card indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-blue-600 w-6"
                : reviewed.has(index)
                ? "bg-green-400"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
