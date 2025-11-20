"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  Brain,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react"

const STREAMS = [
  "Engineering",
  "Medical (MBBS, Nursing, Pharma)",
  "Commerce",
  "Arts & Humanities",
  "Law",
  "Competitive Exams (JEE, NEET, UPSC, CAT, SSC)",
  "Skill-based (Design, Coding, Animation)",
  "Other"
]

const LEARNING_STYLES = [
  { value: "visual", label: "Visual Learner", icon: "👁️", desc: "I learn best with diagrams and images" },
  { value: "audio", label: "Audio Learner", icon: "🎧", desc: "I prefer listening to explanations" },
  { value: "examples", label: "Learn by Examples", icon: "💡", desc: "I understand through practical examples" },
  { value: "analogies", label: "Learn by Analogies", icon: "🔗", desc: "I grasp concepts through comparisons" }
]

const PACE_OPTIONS = [
  { value: "fast", label: "Fast", desc: "Quick learner, skip basics" },
  { value: "normal", label: "Normal", desc: "Balanced learning pace" },
  { value: "slow", label: "Slow", desc: "Take time, explain thoroughly" }
]

const AI_PERSONAS = [
  { value: "professor", label: "Friendly Professor", icon: "👨‍🏫", desc: "Warm, encouraging, academic" },
  { value: "scifi", label: "Sci-Fi Robot", icon: "🤖", desc: "Futuristic, tech-savvy" },
  { value: "detective", label: "Detective Mentor", icon: "🕵️", desc: "Analytical, question-driven" },
  { value: "coach", label: "Fitness Coach", icon: "💪", desc: "Motivating, tough love" },
  { value: "sensei", label: "Anime Sensei", icon: "🥋", desc: "Wise, patient, inspiring" }
]

const INTERESTS = [
  "Sports", "Gaming", "Technology", "Arts", "Music",
  "Movies", "Reading", "Science", "History", "Travel"
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    age: "",
    class: "",
    stream: "",
    learningStyle: "",
    pace: "normal",
    interests: [] as string[],
    aiPersona: "professor"
  })

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        console.error("Failed to save profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.age
      case 2:
        return formData.class && formData.stream
      case 3:
        return formData.learningStyle
      case 4:
        return formData.interests.length > 0
      case 5:
        return formData.aiPersona
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Learn
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome! Let's personalize your learning</h1>
          <p className="text-gray-600">This will help us create the perfect learning experience for you</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                <p className="text-gray-600">Basic information to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="Enter your age"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your Education</h2>
                <p className="text-gray-600">Help us understand your academic background</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="class">Class/Level</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => updateField("class", e.target.value)}
                    placeholder="e.g., Class 12, Undergraduate, Postgraduate"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="stream">Stream/Field</Label>
                  <Select value={formData.stream} onValueChange={(value) => updateField("stream", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your field" />
                    </SelectTrigger>
                    <SelectContent>
                      {STREAMS.map((stream) => (
                        <SelectItem key={stream} value={stream}>
                          {stream}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Learning Style */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">How do you learn best?</h2>
                <p className="text-gray-600">Choose your preferred learning style</p>
              </div>

              <div className="grid gap-4">
                {LEARNING_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => updateField("learningStyle", style.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                      formData.learningStyle === style.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{style.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{style.label}</h3>
                        <p className="text-sm text-gray-600">{style.desc}</p>
                      </div>
                      {formData.learningStyle === style.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <Label>Learning Pace</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {PACE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateField("pace", option.value)}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        formData.pace === option.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold text-sm">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What are your interests?</h2>
                <p className="text-gray-600">We'll use these to create relatable examples</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.interests.includes(interest)
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{interest}</span>
                      {formData.interests.includes(interest) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500 text-center">
                Selected: {formData.interests.length} {formData.interests.length === 1 ? "interest" : "interests"}
              </p>
            </div>
          )}

          {/* Step 5: AI Persona */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                  <Brain className="h-8 w-8 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Choose your AI tutor</h2>
                <p className="text-gray-600">Pick a personality that motivates you</p>
              </div>

              <div className="grid gap-4">
                {AI_PERSONAS.map((persona) => (
                  <button
                    key={persona.value}
                    onClick={() => updateField("aiPersona", persona.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                      formData.aiPersona === persona.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{persona.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{persona.label}</h3>
                        <p className="text-sm text-gray-600">{persona.desc}</p>
                      </div>
                      {formData.aiPersona === persona.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
              >
                {loading ? "Saving..." : "Complete Setup"}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
