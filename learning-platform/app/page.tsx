"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  BookOpen,
  Brain,
  Gamepad2,
  Mic,
  Sparkles,
  Trophy,
  Zap,
  GraduationCap
} from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Learn
            </span>
          </div>
          <Button onClick={() => signIn()} size="lg">
            Get Started Free
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            100% Free • Powered by AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Transform Your Notes Into
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interactive Learning
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Upload your study notes and unlock AI-powered slides, quizzes, games,
            voice tutoring, and personalized learning paths. All completely free.
          </p>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => signIn("google")} size="lg" className="text-lg px-8">
              <Brain className="mr-2 h-5 w-5" />
              Start Learning Now
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              See How It Works
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Free Forever</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">AI</div>
              <div className="text-sm text-gray-600">Powered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">∞</div>
              <div className="text-sm text-gray-600">Subjects</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Learn Better
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Generated Slides</h3>
              <p className="text-gray-600 text-sm">
                Beautiful, visual presentations created from your notes with voice narration.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Quizzes</h3>
              <p className="text-gray-600 text-sm">
                Adaptive quizzes that adjust to your learning level with instant explanations.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Gamepad2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Interactive Games</h3>
              <p className="text-gray-600 text-sm">
                Learn through engaging games tailored to your subject and topic.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Voice Tutor</h3>
              <p className="text-gray-600 text-sm">
                Have natural conversations with your AI tutor using voice commands.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flashcards</h3>
              <p className="text-gray-600 text-sm">
                Spaced repetition flashcards that boost your memory retention.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Gamification</h3>
              <p className="text-gray-600 text-sm">
                Earn XP, maintain streaks, unlock badges, and level up your learning.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Teacher</h3>
              <p className="text-gray-600 text-sm">
                Ask questions anytime and get answers grounded in your notes.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Study Planner</h3>
              <p className="text-gray-600 text-sm">
                AI-generated study schedules with reminders and revision cycles.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join students worldwide who are learning smarter with AI
            </p>
            <Button
              onClick={() => signIn("google")}
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              Get Started Free - No Credit Card
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2024 AI Learning Platform. Built with Next.js, Gemini AI & DeepGram.</p>
          <p className="text-sm mt-2">100% Free Forever • Open Source</p>
        </div>
      </footer>
    </div>
  )
}
