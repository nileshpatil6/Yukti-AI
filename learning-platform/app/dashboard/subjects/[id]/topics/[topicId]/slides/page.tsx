"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  id: string
  order: number
  title: string
  content: any
}

export default function SlidesViewerPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string

  const [slides, setSlides] = useState<Slide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [topicId])

  const fetchSlides = async () => {
    try {
      const response = await fetch(`/api/topics/${topicId}/slides`)
      const data = await response.json()
      setSlides(data.slides || [])
    } catch (error) {
      console.error("Error fetching slides:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold mb-2">No slides found</h2>
          <p className="text-gray-600">This topic doesn't have any slides yet.</p>
        </Card>
      </div>
    )
  }

  const currentSlide = slides[currentIndex]
  const content = typeof currentSlide.content === 'string' 
    ? JSON.parse(currentSlide.content) 
    : currentSlide.content

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-sm text-gray-600">
          Slide {currentIndex + 1} of {slides.length}
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-4xl aspect-video p-12 bg-white shadow-2xl">
          <div className="h-full flex flex-col">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">
              {currentSlide.title}
            </h1>
            
            <div className="flex-1 space-y-4">
              {content.mainPoints && (
                <ul className="space-y-3 text-lg">
                  {content.mainPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary mr-3">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {content.realWorldExample && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Example:</p>
                  <p className="text-blue-800">{content.realWorldExample}</p>
                </div>
              )}
              
              {content.practiceQuestion && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Think About:</p>
                  <p className="text-purple-800">{content.practiceQuestion}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-primary w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentIndex === slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
