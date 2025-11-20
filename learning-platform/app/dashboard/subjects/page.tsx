"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  BookOpen,
  FileText,
  Brain,
  MoreVertical,
  Trash2
} from "lucide-react"

const SUBJECT_COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
]

interface Subject {
  id: string
  name: string
  displayName: string
  color: string
  _count: {
    notes: number
    topics: number
    quizzes: number
  }
}

export default function SubjectsPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    color: SUBJECT_COLORS[0],
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      const data = await response.json()
      setSubjects(data.subjects || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setSubjects([data.subject, ...subjects])
        setDialogOpen(false)
        setFormData({ name: "", displayName: "", color: SUBJECT_COLORS[0] })

        // Navigate to the new subject
        router.push(`/dashboard/subjects/${data.subject.id}`)
      }
    } catch (error) {
      console.error("Error creating subject:", error)
    } finally {
      setCreating(false)
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Subjects</h1>
          <p className="text-gray-600">
            Organize your learning by subjects and topics
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubject} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="displayName">Subject Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayName: e.target.value,
                      name: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="e.g., Physics, Mathematics, History"
                  required
                />
              </div>

              <div>
                <Label>Choose Color</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 w-10 rounded-lg transition-all ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !formData.displayName}>
                  {creating ? "Creating..." : "Create Subject"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No subjects yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first subject to start uploading notes and generating
            AI-powered learning materials.
          </p>
          <Button size="lg" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Subject
          </Button>
        </Card>
      )}

      {/* Subjects Grid */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => router.push(`/dashboard/subjects/${subject.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${subject.color}20` }}
                >
                  <BookOpen
                    className="h-6 w-6"
                    style={{ color: subject.color }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle delete or more options
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <h3 className="text-xl font-bold mb-2">{subject.displayName}</h3>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{subject._count.notes} notes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  <span>{subject._count.topics} topics</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {subject._count.quizzes} quizzes
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: subject.color }}
                  >
                    View →
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
