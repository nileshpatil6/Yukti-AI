"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Brain,
  Presentation,
  Gamepad2,
  Sparkles,
  MessageCircle,
  ArrowLeft,
  Plus,
  File,
  Trash2,
  Download
} from "lucide-react"

interface Subject {
  id: string
  name: string
  displayName: string
  color: string
  notes: Note[]
  topics: any[]
  _count: {
    notes: number
    topics: number
    quizzes: number
  }
}

interface Note {
  id: string
  displayName: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

export default function SubjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string

  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    fetchSubject()
  }, [subjectId])

  const fetchSubject = async () => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}`)
      const data = await response.json()
      setSubject(data.subject)
    } catch (error) {
      console.error("Error fetching subject:", error)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("subjectId", subjectId)

        console.log(`Uploading file ${i + 1}/${acceptedFiles.length}: ${file.name}`)

        const response = await fetch(`/api/subjects/${subjectId}/notes`, {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          console.log("Upload successful:", result)
          setUploadProgress((prev) => prev + (100 / acceptedFiles.length))
        } else {
          const error = await response.json()
          console.error("Upload failed:", error)
          alert(`Failed to upload ${file.name}: ${error.error || 'Unknown error'}`)
        }
      }

      // Refresh subject data
      await fetchSubject()
      alert(`Successfully uploaded ${acceptedFiles.length} file(s)!`)
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Failed to upload files. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [subjectId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    multiple: true,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleGenerateSlides = async (topicName: string) => {
    if (!subject) return

    setGenerating("slides")

    try {
      const response = await fetch("/api/ai/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          topicName,
        }),
      })

      const data = await response.json()

      if (data.topic) {
        alert("Slides generated successfully!")
        await fetchSubject()
      } else {
        alert(data.error || "Failed to generate slides")
      }
    } catch (error) {
      console.error("Error generating slides:", error)
      alert("Failed to generate slides. Please try again.")
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateQuiz = async (topicName: string) => {
    if (!subject) return

    setGenerating("quiz")

    try {
      const response = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          topic: topicName,
          difficulty: "medium",
        }),
      })

      const data = await response.json()

      if (data.quiz) {
        router.push(`/dashboard/quizzes/${data.quiz.id}`)
      } else {
        alert(data.error || "Failed to generate quiz")
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateGame = async (topicName: string) => {
    if (!subject) return

    setGenerating("game")

    try {
      const gameTypes = ["interactive-quiz", "matching", "memory-cards", "word-scramble", "fill-blank"]
      const randomGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)]

      const response = await fetch("/api/ai/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          topic: topicName,
          gameType: randomGameType,
        }),
      })

      const data = await response.json()

      if (data.game) {
        router.push(`/dashboard/games/${data.game.id}`)
      } else {
        alert(data.error || "Failed to generate game")
      }
    } catch (error) {
      console.error("Error generating game:", error)
      alert("Failed to generate game. Please try again.")
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateFlashcards = async (topicTitle?: string) => {
    if (!subject) return

    setGenerating("flashcards")

    try {
      const response = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: subject.id,
          topicName: topicTitle || `${subject.displayName} Flashcards`,
        }),
      })

      const data = await response.json()

      if (response.ok && data.flashcardSet) {
        // Navigate to the flashcard review page
        router.push(`/dashboard/flashcards/${data.flashcardSet.id}/review`)
      } else {
        alert(data.error || "Failed to generate flashcards. Please try again.")
      }
    } catch (error) {
      console.error("Error generating flashcards:", error)
      alert("Failed to generate flashcards. Please try again.")
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Subject not found</h2>
          <Button onClick={() => router.push("/dashboard/subjects")}>
            Back to Subjects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/subjects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              <FileText
                className="h-8 w-8"
                style={{ color: subject.color }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{subject.displayName}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{subject._count.notes} notes</span>
                <span>•</span>
                <span>{subject._count.topics} topics</span>
                <span>•</span>
                <span>{subject._count.quizzes} quizzes</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/ai-teacher?subject=${subjectId}`)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Ask AI Teacher
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notes">
              <FileText className="mr-2 h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="slides">
              <Presentation className="mr-2 h-4 w-4" />
              Slides
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <Brain className="mr-2 h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="games">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="flashcards">
              <Sparkles className="mr-2 h-4 w-4" />
              Flashcards
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            {/* Upload Area */}
            <Card className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary hover:bg-gray-50"
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-lg font-medium">Drop files here...</p>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop files here, or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports PDF, Images (PNG, JPG), PowerPoint
                    </p>
                  </>
                )}
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-gray-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </Card>

            {/* Notes List */}
            {subject.notes.length === 0 ? (
              <Card className="p-12 text-center bg-gray-50">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No notes uploaded yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload your study notes to get started with AI-powered learning
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {subject.notes.map((note) => (
                  <Card key={note.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded">
                          <File className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{note.displayName}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{formatFileSize(note.fileSize)}</span>
                            <span>•</span>
                            <span>{formatDate(note.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* AI Actions */}
            {subject.notes.length > 0 && (
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleGenerateSlides(subject.displayName)}
                    disabled={generating === "slides"}
                  >
                    <Presentation className="mr-2 h-4 w-4" />
                    {generating === "slides" ? "Generating..." : "Generate Slides"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleGenerateQuiz(subject.displayName)}
                    disabled={generating === "quiz"}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    {generating === "quiz" ? "Creating..." : "Create Quiz"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleGenerateGame(subject.displayName)}
                    disabled={generating === "game"}
                  >
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    {generating === "game" ? "Generating..." : "Generate Game"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleGenerateFlashcards(subject.displayName)}
                    disabled={generating === "flashcards"}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generating === "flashcards" ? "Generating..." : "Make Flashcards"}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Slides Tab */}
          <TabsContent value="slides">
            {subject.topics.length === 0 || !subject.topics.some(t => t.slidesGenerated) ? (
              <Card className="p-12 text-center">
                <Presentation className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No slides yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload notes first, then generate AI-powered slides
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {subject.topics.filter(t => t.slidesGenerated).map((topic) => (
                  <Card
                    key={topic.id}
                    className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/dashboard/subjects/${subject.id}/topics/${topic.id}/slides`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{topic.name}</h3>
                        <p className="text-sm text-gray-600">{topic.description || "Click to view slides"}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Presentation className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            {subject.topics.length === 0 || !subject.topics.some(t => t.quizGenerated) ? (
              <Card className="p-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
                <p className="text-gray-600 mb-6">
                  Generate quizzes from your notes to test your knowledge
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {subject.topics.filter(t => t.quizGenerated).map((topic) => {
                  // Find the quiz for this topic
                  const quiz = topic.quizzes && topic.quizzes.length > 0 ? topic.quizzes[0] : null;

                  return (
                    <Card
                      key={topic.id}
                      className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (quiz) {
                          router.push(`/dashboard/quizzes/${quiz.id}`)
                        } else {
                          alert("Quiz not found")
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{topic.name} Quiz</h3>
                          <p className="text-sm text-gray-600">Test your knowledge</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Brain className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games">
            {subject.topics.length === 0 || !subject.topics.some(t => t.gameGenerated) ? (
              <Card className="p-12 text-center">
                <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No games yet</h3>
                <p className="text-gray-600 mb-6">
                  Create interactive games to make learning fun
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {subject.topics.filter(t => t.gameGenerated).map((topic) => {
                  // Find the game for this topic
                  const game = topic.games && topic.games.length > 0 ? topic.games[0] : null;

                  return (
                    <Card
                      key={topic.id}
                      className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (game) {
                          router.push(`/dashboard/games/${game.id}`)
                        } else {
                          alert("Game not found")
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{topic.name} Game</h3>
                          <p className="text-sm text-gray-600">Play and learn</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Gamepad2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="flashcards">
            <Card className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
              <p className="text-gray-600 mb-6">
                Generate flashcards for spaced repetition learning
              </p>
              <Button
                onClick={() => handleGenerateFlashcards()}
                disabled={subject.notes.length === 0 || generating === "flashcards"}
              >
                <Plus className="mr-2 h-4 w-4" />
                {generating === "flashcards" ? "Generating..." : "Make Flashcards"}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
