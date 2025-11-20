"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  User,
  Brain,
  Save,
  CheckCircle2,
  X
} from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    learningStyle: "",
    pace: "",
    interests: [] as string[],
    aiPersona: "",
  })
  const [newInterest, setNewInterest] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      setProfile({
        name: data.user.name || "",
        email: data.user.email || "",
        learningStyle: data.user.learningStyle || "visual",
        pace: data.user.pace || "moderate",
        interests: data.user.interests || [],
        aiPersona: data.user.aiPersona || "friendly",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest.trim()],
      })
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== interest),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account and learning preferences
        </p>
      </div>

      {/* Personal Information */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          Personal Information
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>
        </div>
      </Card>

      {/* Learning Preferences */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Learning Preferences
        </h2>

        <div className="space-y-4">
          {/* Learning Style */}
          <div>
            <Label htmlFor="learningStyle">Preferred Learning Style</Label>
            <Select
              value={profile.learningStyle}
              onValueChange={(value) =>
                setProfile({ ...profile, learningStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual (Images, diagrams)</SelectItem>
                <SelectItem value="auditory">Auditory (Listening, discussion)</SelectItem>
                <SelectItem value="reading">Reading/Writing (Text-based)</SelectItem>
                <SelectItem value="kinesthetic">Kinesthetic (Hands-on)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              AI will adapt content to match your learning style
            </p>
          </div>

          {/* Learning Pace */}
          <div>
            <Label htmlFor="pace">Learning Pace</Label>
            <Select
              value={profile.pace}
              onValueChange={(value) => setProfile({ ...profile, pace: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow & Steady (Deep understanding)</SelectItem>
                <SelectItem value="moderate">Moderate (Balanced approach)</SelectItem>
                <SelectItem value="fast">Fast-Paced (Quick learner)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Determines content depth and progression speed
            </p>
          </div>

          {/* Interests */}
          <div>
            <Label>Interests & Topics</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addInterest()}
                placeholder="Add an interest (e.g., Science, History)"
              />
              <Button onClick={addInterest} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="text-sm px-3 py-1">
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {profile.interests.length === 0 && (
                <p className="text-sm text-gray-500">
                  No interests added. Add some to personalize examples!
                </p>
              )}
            </div>
          </div>

          {/* AI Persona */}
          <div>
            <Label htmlFor="aiPersona">AI Teacher Persona</Label>
            <Select
              value={profile.aiPersona}
              onValueChange={(value) =>
                setProfile({ ...profile, aiPersona: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">
                  Friendly & Encouraging (Supportive tone)
                </SelectItem>
                <SelectItem value="professional">
                  Professional & Direct (Formal approach)
                </SelectItem>
                <SelectItem value="socratic">
                  Socratic (Question-based learning)
                </SelectItem>
                <SelectItem value="enthusiastic">
                  Enthusiastic & Fun (Energetic style)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              How the AI teacher communicates with you
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full md:w-auto"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>

        {saved && (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            Settings saved successfully!
          </div>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-900">About Personalization</h3>
        <p className="text-sm text-blue-800">
          Your learning preferences are used to personalize AI-generated content,
          including slides, quizzes, study plans, and AI teacher responses. Changes
          take effect immediately for new content.
        </p>
      </Card>
    </div>
  )
}
