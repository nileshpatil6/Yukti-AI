"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Play,
  Pause,
  Volume2,
  Check
} from "lucide-react"

interface Slide {
  id: string
  order: number
  title: string
  content: {
    mainPoints: string[]
    visualDescription: string
    realWorldExample: string
    practiceQuestion: string
  }
  imageUrl?: string
  audioUrl?: string
}

interface SlideViewerProps {
  slides: Slide[]
  topicName: string
}

export function SlideViewer({ slides, topicName }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)

  const slide = slides[currentSlide]
  const progress = ((currentSlide + 1) / slides.length) * 100

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
      setShowAnswers(false)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
      setShowAnswers(false)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setShowAnswers(false)
  }

  if (!slide) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600">No slides available</p>
      </Card>
    )
  }

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-50 bg-white" : ""}`}>
      {/* Header */}
      <div className="border-b px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{topicName}</h2>
            <p className="text-sm text-gray-600">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {slide.audioUrl && (
              <Button variant="outline" size="sm">
                <Volume2 className="h-4 w-4 mr-2" />
                Play Audio
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Progress value={progress} className="mt-4 h-1" />
      </div>

      {/* Main Slide */}
      <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto">
          <Card className="p-12 min-h-[500px]">
            {/* Slide Title */}
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {slide.title}
            </h1>

            {/* Visual Description */}
            {slide.content.visualDescription && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  📊 Visual Concept:
                </p>
                <p className="text-gray-700 italic">{slide.content.visualDescription}</p>
              </div>
            )}

            {/* Main Points */}
            {slide.content.mainPoints && slide.content.mainPoints.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Key Points
                </h3>
                <ul className="space-y-3">
                  {slide.content.mainPoints.map((point, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-lg text-gray-700 flex-1">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Real World Example */}
            {slide.content.realWorldExample && (
              <div className="mb-8 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <p className="text-sm font-medium text-green-900 mb-2">
                  🌍 Real-World Example:
                </p>
                <p className="text-gray-700">{slide.content.realWorldExample}</p>
              </div>
            )}

            {/* Practice Question */}
            {slide.content.practiceQuestion && (
              <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  💭 Think About This:
                </p>
                <p className="text-gray-700 font-medium">
                  {slide.content.practiceQuestion}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="border-t px-6 py-4 bg-white">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {/* Slide Thumbnails */}
          <div className="flex gap-2 overflow-x-auto max-w-md px-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-blue-600 w-8"
                    : index < currentSlide
                    ? "bg-green-400"
                    : "bg-gray-300"
                }`}
                title={`Slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
