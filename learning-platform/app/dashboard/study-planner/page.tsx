"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Brain,
  Lightbulb,
  Trophy
} from "lucide-react"

interface StudySession {
  id: string
  subjectId: string
  subjectName: string
  subjectColor: string
  topic: string
  duration: number
  timeSlot: string
  activities: string[]
  completed: boolean
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  subjectId: string
  completed: boolean
}

interface StudyPlan {
  id: string
  weeklySchedule: {
    day: string
    sessions: StudySession[]
  }[]
  milestones: Milestone[]
  tips: string[]
  createdAt: string
}

interface Subject {
  id: string
  name: string
  color: string
}

export default function StudyPlannerPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Form state
  const [selectedSubjects, setSelectedSubjects] = useState<
    Array<{ id: string; priority: string }>
  >([])
  const [goals, setGoals] = useState("")
  const [availableHours, setAvailableHours] = useState(10)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [planRes, subjectsRes] = await Promise.all([
        fetch("/api/study-planner"),
        fetch("/api/subjects"),
      ])

      const planData = await planRes.json()
      const subjectsData = await subjectsRes.json()

      setStudyPlan(planData.plan)
      setSubjects(subjectsData.subjects || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (selectedSubjects.length === 0 || !goals) {
      alert("Please select subjects and enter your goals")
      return
    }

    setGenerating(true)

    try {
      const response = await fetch("/api/study-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: selectedSubjects,
          goals,
          availableHours,
        }),
      })

      const data = await response.json()

      if (data.plan) {
        setStudyPlan(data.plan)
        setCreateDialogOpen(false)
        setGoals("")
        setSelectedSubjects([])
        setAvailableHours(10)
      }
    } catch (error) {
      console.error("Error generating study plan:", error)
      alert("Failed to generate study plan. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const toggleSubject = (subjectId: string) => {
    const exists = selectedSubjects.find((s) => s.id === subjectId)
    if (exists) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.id !== subjectId))
    } else {
      setSelectedSubjects([...selectedSubjects, { id: subjectId, priority: "medium" }])
    }
  }

  const updatePriority = (subjectId: string, priority: string) => {
    setSelectedSubjects(
      selectedSubjects.map((s) => (s.id === subjectId ? { ...s, priority } : s))
    )
  }

  const toggleSession = async (sessionId: string) => {
    try {
      await fetch(`/api/study-planner/sessions/${sessionId}/toggle`, {
        method: "POST",
      })

      // Update local state
      setStudyPlan((prev) => {
        if (!prev) return null

        return {
          ...prev,
          weeklySchedule: prev.weeklySchedule.map((day) => ({
            ...day,
            sessions: day.sessions.map((session) =>
              session.id === sessionId
                ? { ...session, completed: !session.completed }
                : session
            ),
          })),
        }
      })
    } catch (error) {
      console.error("Error toggling session:", error)
    }
  }

  const toggleMilestone = async (milestoneId: string) => {
    try {
      await fetch(`/api/study-planner/milestones/${milestoneId}/toggle`, {
        method: "POST",
      })

      // Update local state
      setStudyPlan((prev) => {
        if (!prev) return null

        return {
          ...prev,
          milestones: prev.milestones.map((milestone) =>
            milestone.id === milestoneId
              ? { ...milestone, completed: !milestone.completed }
              : milestone
          ),
        }
      })
    } catch (error) {
      console.error("Error toggling milestone:", error)
    }
  }

  const getWeekProgress = () => {
    if (!studyPlan) return 0

    const allSessions = studyPlan.weeklySchedule.flatMap((day) => day.sessions)
    const completedSessions = allSessions.filter((s) => s.completed).length

    return allSessions.length > 0
      ? (completedSessions / allSessions.length) * 100
      : 0
  }

  const getTotalPlannedHours = () => {
    if (!studyPlan) return 0

    return studyPlan.weeklySchedule.reduce(
      (total, day) =>
        total + day.sessions.reduce((sum, session) => sum + session.duration, 0),
      0
    ) / 60
  }

  const getCompletedHours = () => {
    if (!studyPlan) return 0

    return studyPlan.weeklySchedule.reduce(
      (total, day) =>
        total +
        day.sessions
          .filter((s) => s.completed)
          .reduce((sum, session) => sum + session.duration, 0),
      0
    ) / 60
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Study Planner
          </h1>
          <p className="text-gray-600">
            AI-generated personalized study schedule
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              {studyPlan ? "Regenerate Plan" : "Create Study Plan"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create AI Study Plan</DialogTitle>
              <DialogDescription>
                Let AI create a personalized study plan based on your subjects and goals
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Subject Selection */}
              <div>
                <Label className="text-base mb-3 block">Select Subjects</Label>
                <div className="grid grid-cols-1 gap-2">
                  {subjects.map((subject) => {
                    const selected = selectedSubjects.find((s) => s.id === subject.id)

                    return (
                      <div
                        key={subject.id}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => toggleSubject(subject.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            <span className="font-medium">{subject.name}</span>
                          </div>

                          {selected && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={selected.priority}
                                onValueChange={(value) => updatePriority(subject.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">High Priority</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low Priority</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Goals */}
              <div>
                <Label htmlFor="goals" className="text-base mb-2 block">
                  Learning Goals
                </Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., Master calculus for upcoming exam, Complete all chapters of physics, etc."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Available Hours */}
              <div>
                <Label htmlFor="hours" className="text-base mb-2 block">
                  Available Hours per Week: {availableHours}
                </Label>
                <Input
                  id="hours"
                  type="range"
                  min="5"
                  max="40"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseInt(e.target.value))}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>5 hours</span>
                  <span>40 hours</span>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePlan}
                disabled={generating || selectedSubjects.length === 0 || !goals}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Study Plan
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!studyPlan ? (
        /* Empty State */
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No study plan yet</h3>
          <p className="text-gray-600 mb-6">
            Create an AI-generated personalized study plan to organize your learning
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Study Plan
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Week Progress</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(getWeekProgress())}%
              </div>
              <Progress value={getWeekProgress()} className="h-2" />
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Hours Completed</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {getCompletedHours().toFixed(1)}h
              </div>
              <p className="text-sm text-green-700">
                of {getTotalPlannedHours().toFixed(1)}h planned
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Milestones</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {studyPlan.milestones.filter((m) => m.completed).length}
              </div>
              <p className="text-sm text-purple-700">
                of {studyPlan.milestones.length} completed
              </p>
            </Card>
          </div>

          {/* Weekly Schedule */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {studyPlan.weeklySchedule.map((day) => (
                <Card key={day.day} className="p-6">
                  <h3 className="text-lg font-bold mb-4">{day.day}</h3>

                  {day.sessions.length === 0 ? (
                    <p className="text-gray-500 text-sm">Rest day</p>
                  ) : (
                    <div className="space-y-3">
                      {day.sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${session.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                          onClick={() => toggleSession(session.id)}
                        >
                          <div className="flex items-start gap-2">
                            {session.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: session.subjectColor }}
                                />
                                <span className="text-xs font-medium text-gray-600">
                                  {session.subjectName}
                                </span>
                              </div>

                              <p className="font-medium text-sm mb-1">{session.topic}</p>

                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Clock className="h-3 w-3" />
                                <span>{session.duration} min</span>
                                <span>•</span>
                                <span>{session.timeSlot}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Milestones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPlan.milestones.map((milestone) => {
                const subject = subjects.find((s) => s.id === milestone.subjectId)

                return (
                  <Card
                    key={milestone.id}
                    className={`p-6 cursor-pointer transition-all ${milestone.completed
                      ? "bg-green-50 border-green-200"
                      : "hover:shadow-md"
                      }`}
                    onClick={() => toggleMilestone(milestone.id)}
                  >
                    <div className="flex items-start gap-3">
                      {milestone.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 flex-shrink-0" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {subject && (
                            <Badge
                              style={{
                                backgroundColor: subject.color + "20",
                                color: subject.color,
                              }}
                            >
                              {subject.name}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </Badge>
                        </div>

                        <h3 className="font-bold mb-1">{milestone.title}</h3>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Study Tips */}
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              Personalized Study Tips
            </h2>
            <ul className="space-y-2">
              {studyPlan.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}
